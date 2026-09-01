import { NextRequest, NextResponse } from 'next/server';
import { generations } from '@/data/generations';
import { diyGuides } from '@/data/diyGuides';
import { getAllPdfs } from '@/data/pdfs';
import { DiyGuide, PdfDocument } from '@/types';
import { spanishGuideContent } from '@/data/diyGuides.es-MX';
import { generationDescriptionsEs, systemNamesEs, toSpanishPath } from '@/lib/localization';
import { getUserGuides } from '@/data/guides';
import { consumeRateLimit, isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { requestClientIdentifier } from '@/lib/validation';

export const dynamic = 'force-dynamic';

interface SearchResult {
  type: 'generation' | 'pdf' | 'guide';
  id: string;
  title: string;
  description: string;
  generation: string;
  system?: string;
  model?: string;
  url: string;
  matchContext?: string;
  matchSource?: 'title' | 'description' | 'metadata' | 'content' | 'pdf-text';
  score: number;
}

const MAX_RESULTS = 80;

export async function GET(request: NextRequest) {
  try {
    const rateLimit = await consumeRateLimit(
      `search:client:${requestClientIdentifier(request)}`,
      60,
      60,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many searches' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const locale = searchParams.get('locale') === 'es-MX' ? 'es-MX' : 'en';

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    if (query.length > 200) {
      return NextResponse.json({ error: 'Search query is too long' }, { status: 400 });
    }

    const terms = tokenize(query);
    if (terms.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const pdfs = (await getAllPdfs()).filter((pdf) => pdf.approved !== false);

    const approvedUserGuides = (await getUserGuides()).filter((guide) => guide.approved);
    const allGuides = [...diyGuides, ...approvedUserGuides];
    const searchableGuides = locale === 'es-MX'
      ? allGuides.map((guide) => {
          const translated = spanishGuideContent[guide.slug];
          return translated ? { ...guide, title: translated.title, content: translated.content, tools: translated.tools, parts: translated.parts } : guide;
        })
      : allGuides;

    const results = [
      ...searchGenerationSystems(query, terms, locale),
      ...searchGenerations(query, terms, locale),
      ...searchPdfs(pdfs, query, terms),
      ...searchGuides(searchableGuides, query, terms, locale),
    ]
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, MAX_RESULTS);

    return NextResponse.json({ results });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

function searchPdfs(pdfs: PdfDocument[], query: string, terms: string[]): SearchResult[] {
  return pdfs
    .map((pdf): SearchResult | null => {
      const metadata = [
        pdf.title,
        pdf.description,
        pdf.generation,
        pdf.system,
        pdf.model,
        ...(pdf.models || []),
        pdf.originalName,
      ].filter(Boolean).join(' ');

      const metadataScore = scoreText(metadata, query, terms, 12);
      const bodyScore = scoreText(pdf.searchText || '', query, terms, 3);
      const score = metadataScore + bodyScore;

      if (score <= 0) return null;

      const context = bodyScore > 0 && pdf.searchText
        ? createSnippet(pdf.searchText, terms)
        : undefined;

      return {
        type: 'pdf' as const,
        id: pdf.id,
        title: pdf.title,
        description: context || pdf.description || pdf.originalName,
        generation: pdf.generation,
        system: pdf.system,
        model: pdf.model || pdf.models?.[0],
        url: pdf.url,
        matchContext: context,
        matchSource: bodyScore > 0 ? 'pdf-text' as const : 'metadata' as const,
        score,
      };
    })
    .filter((result): result is SearchResult => result !== null);
}

function searchGuides(guides: DiyGuide[], query: string, terms: string[], locale: 'en' | 'es-MX'): SearchResult[] {
  return guides
    .map((guide): SearchResult | null => {
      const metadata = [
        guide.title,
        guide.generation,
        guide.system,
        guide.author,
        guide.difficulty,
        guide.tools.join(' '),
        guide.parts.join(' '),
      ].join(' ');

      const metadataScore = scoreText(metadata, query, terms, 10);
      const contentScore = scoreText(guide.content, query, terms, 3);
      const score = metadataScore + contentScore;

      if (score <= 0) return null;

      const context = contentScore > 0 ? createSnippet(guide.content, terms) : undefined;

      return {
        type: 'guide' as const,
        id: guide.id,
        title: guide.title,
        description: context || `${guide.content.substring(0, 150)}...`,
        generation: guide.generation,
        system: guide.system,
        url: locale === 'es-MX' ? toSpanishPath(`/guides/${guide.slug}`) : `/guides/${guide.slug}`,
        matchContext: context,
        matchSource: contentScore > 0 ? 'content' as const : 'metadata' as const,
        score,
      };
    })
    .filter((result): result is SearchResult => result !== null);
}

function searchGenerations(query: string, terms: string[], locale: 'en' | 'es-MX'): SearchResult[] {
  return generations
    .map((generation): SearchResult | null => {
      const text = [
        generation.name,
        generation.slug,
        generation.years,
        locale === 'es-MX' ? generationDescriptionsEs[generation.slug] : generation.description,
        generation.models.join(' '),
      ].join(' ');
      const score = scoreText(text, query, terms, 8);

      if (score <= 0) return null;

      return {
        type: 'generation' as const,
        id: generation.id,
        title: generation.name,
        description: locale === 'es-MX' ? generationDescriptionsEs[generation.slug] : generation.description,
        generation: generation.id,
        url: locale === 'es-MX' ? toSpanishPath(`/generation/${generation.slug}`) : `/generation/${generation.slug}`,
        matchSource: 'metadata' as const,
        score,
      };
    })
    .filter((result): result is SearchResult => result !== null);
}

function searchGenerationSystems(query: string, terms: string[], locale: 'en' | 'es-MX'): SearchResult[] {
  const results: SearchResult[] = [];

  generations.forEach((generation) => {
    generation.systems.forEach((system) => {
      const metadata = [
        generation.name,
        generation.slug,
        generation.models.join(' '),
        system.name,
        locale === 'es-MX' ? systemNamesEs[system.slug] : '',
        system.description,
        system.slug,
        Object.entries(system.specs || {}).map(([key, value]) => `${key} ${value}`).join(' '),
        system.commonIssues?.join(' '),
        system.maintenanceTips?.join(' '),
      ].filter(Boolean).join(' ');

      const metadataScore = scoreText(metadata, query, terms, 8);
      const contentScore = locale === 'es-MX' ? 0 : scoreText(system.content, query, terms, 3);
      const score = metadataScore + contentScore;

      if (score <= 0) return;

      const context = contentScore > 0 ? createSnippet(system.content, terms) : undefined;

      results.push({
        type: 'generation',
        id: `${generation.slug}-${system.slug}`,
        title: `${generation.name} - ${locale === 'es-MX' ? systemNamesEs[system.slug] || system.name : system.name}`,
        description: locale === 'es-MX'
          ? `Información técnica, especificaciones y recursos de ${systemNamesEs[system.slug]?.toLowerCase() || system.name.toLowerCase()} para ${generation.name}.`
          : context || system.description,
        generation: generation.slug,
        system: system.slug,
        url: locale === 'es-MX'
          ? toSpanishPath(`/systems/${system.slug}?gen=${generation.slug}`)
          : `/systems/${system.slug}?gen=${generation.slug}`,
        matchContext: context,
        matchSource: contentScore > 0 ? 'content' : 'metadata',
        score,
      });
    });
  });

  return results;
}

function scoreText(text: string, query: string, terms: string[], weight: number): number {
  const normalized = normalize(text);
  if (!normalized) return 0;

  let score = 0;
  const normalizedQuery = normalize(query);

  if (normalized.includes(normalizedQuery)) {
    score += weight * 4;
  }

  terms.forEach((term) => {
    if (normalized.includes(term)) {
      score += weight;
    }
  });

  return score;
}

function tokenize(query: string): string[] {
  return Array.from(new Set(normalize(query).split(/\s+/).filter((term) => term.length > 1)));
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function createSnippet(text: string, terms: string[]): string {
  const normalizedText = text.toLowerCase();
  const matchIndex = terms
    .map((term) => normalizedText.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0] ?? 0;

  const start = Math.max(0, matchIndex - 90);
  const end = Math.min(text.length, matchIndex + 220);
  const snippet = text.slice(start, end).replace(/\s+/g, ' ').trim();

  if (start > 0 && end < text.length) return `...${snippet}...`;
  if (start > 0) return `...${snippet}`;
  if (end < text.length) return `${snippet}...`;
  return snippet;
}

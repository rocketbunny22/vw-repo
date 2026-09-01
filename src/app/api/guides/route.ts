import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserGuides, mutateUserGuides } from '@/data/guides';
import { DiyGuide } from '@/types';
import { toPublicGuideSummary } from '@/lib/publicSummaries';
import { authenticateRequest } from '@/lib/auth';
import { consumeRateLimit, isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { boundedString, boundedStringArray, INPUT_LIMITS, isValidGeneration, isValidSystem, readJsonObject, requestClientIdentifier } from '@/lib/validation';

const GUIDE_DIFFICULTIES = new Set(['easy', 'moderate', 'hard']);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const generation = searchParams.get('generation');
    const system = searchParams.get('system');
    const showAll = searchParams.get('all');

    const { diyGuides } = await import('@/data/diyGuides');
    const userGuides = await getUserGuides();
    const auth = await authenticateRequest(request);
    const includeUnapproved = showAll === 'true' && auth?.user.role === 'admin';
    const allGuides = [
      ...diyGuides,
      ...userGuides.filter((guide: DiyGuide) => includeUnapproved || guide.approved),
    ];
    const filtered = allGuides.filter((guide: DiyGuide) => {
      if (generation && generation !== 'all' && guide.generation !== generation) return false;
      if (system && system !== 'all' && guide.system !== system) return false;
      return true;
    });

    return NextResponse.json({
      guides: includeUnapproved ? filtered : filtered.map(toPublicGuideSummary),
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Guide load error:', error);
    return NextResponse.json({ error: 'Failed to load guides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await readJsonObject(request, 96 * 1024);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    const { action, ...data } = body;

    if (action === 'submit') {
      const { title, generation, system, content, difficulty, timeEstimate, tools, parts } = data;
      const validTitle = boundedString(title, INPUT_LIMITS.title);
      const validContent = boundedString(content, INPUT_LIMITS.guideContent);
      const validGeneration = boundedString(generation, INPUT_LIMITS.name);
      const validSystem = boundedString(system, INPUT_LIMITS.name);
      const validDifficulty = boundedString(difficulty, 30, false);
      const validTimeEstimate = boundedString(timeEstimate, 80, false);
      const validTools = boundedStringArray(tools ?? []);
      const validParts = boundedStringArray(parts ?? []);

      if (
        !validTitle || !validContent || !validGeneration || !validSystem
        || validDifficulty === null || validTimeEstimate === null || !validTools || !validParts
        || validContent.length < 200
        || (validDifficulty && !GUIDE_DIFFICULTIES.has(validDifficulty))
        || !isValidGeneration(validGeneration) || !isValidSystem(validSystem)
      ) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const rateLimit = await consumeRateLimit(
        `guide-submit:${auth.user.id}:${requestClientIdentifier(request)}`,
        5,
        24 * 60 * 60,
      );
      if (!rateLimit.allowed) {
        return NextResponse.json({ error: 'Too many guide submissions' }, { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } });
      }

      const slug = validTitle.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + crypto.randomUUID().slice(0, 8);
      
      const newGuide: DiyGuide = {
        id: crypto.randomUUID(),
        title: validTitle,
        slug,
        generation: validGeneration,
        system: validSystem,
        author: auth.user.username,
        authorId: auth.user.id,
        content: validContent,
        difficulty: validDifficulty || 'moderate',
        timeEstimate: validTimeEstimate || '2-4 hours',
        tools: validTools,
        parts: validParts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        featured: false,
        approved: false,
      };

      await mutateUserGuides((guides) => [...guides, newGuide]);

      return NextResponse.json({ success: true, guide: toPublicGuideSummary(newGuide) });
    }

    if (action === 'approve' && auth.user.role === 'admin') {
      const { guideId } = data;
      let found = false;
      await mutateUserGuides((guides) => guides.map((guide) => {
        if (guide.id !== guideId) return guide;
        found = true;
        return { ...guide, approved: true, updatedAt: new Date().toISOString() };
      }));

      if (!found) {
        return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'delete' && auth.user.role === 'admin') {
      const { guideId } = data;
      let found = false;
      await mutateUserGuides((guides) => {
        found = guides.some((guide) => guide.id === guideId);
        return guides.filter((guide) => guide.id !== guideId);
      });

      if (!found) {
        return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Guide error:', error);
    return NextResponse.json({ error: 'Failed to process guide' }, { status: 500 });
  }
}

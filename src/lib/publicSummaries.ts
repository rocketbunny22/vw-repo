import type {
  Comment,
  DiyGuide,
  PdfDocument,
  PublicGuideSummary,
  PublicComment,
  PublicPdfSummary,
} from '@/types';

const GUIDE_EXCERPT_LENGTH = 180;

export function toPublicPdfSummary(pdf: PdfDocument): PublicPdfSummary {
  return {
    id: pdf.id,
    originalName: pdf.originalName,
    generation: pdf.generation,
    model: pdf.model,
    models: pdf.models,
    system: pdf.system,
    title: pdf.title,
    description: pdf.description,
    uploadedAt: pdf.uploadedAt,
    uploadedBy: pdf.uploadedBy,
    fileSize: pdf.fileSize,
    url: pdf.url,
    downloads: pdf.downloads,
  };
}

export function toPublicComment(comment: Comment): PublicComment {
  return {
    id: comment.id,
    guideId: comment.guideId,
    authorName: comment.authorName,
    content: comment.content,
    createdAt: comment.createdAt,
  };
}

export function toPublicGuideSummary(guide: DiyGuide): PublicGuideSummary {
  const normalizedContent = guide.content.replace(/\s+/g, ' ').trim();

  return {
    id: guide.id,
    title: guide.title,
    slug: guide.slug,
    generation: guide.generation,
    system: guide.system,
    author: guide.author,
    authorId: guide.authorId,
    difficulty: guide.difficulty,
    timeEstimate: guide.timeEstimate,
    createdAt: guide.createdAt,
    updatedAt: guide.updatedAt,
    views: guide.views,
    featured: guide.featured,
    excerpt: normalizedContent.length > GUIDE_EXCERPT_LENGTH
      ? `${normalizedContent.slice(0, GUIDE_EXCERPT_LENGTH - 1).trimEnd()}…`
      : normalizedContent,
  };
}

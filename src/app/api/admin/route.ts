import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getAllPdfs, mutatePdfs, deletePdfDownloadCounter, deletePdfFile } from '@/data/pdfs';
import { getUserGuides, mutateUserGuides } from '@/data/guides';
import { getUsers, mutateUsers } from '@/data/users';
import { getComments, getFeedback, mutateComments, mutateFeedback } from '@/data/moderation';
import { backfillPdfSearchText } from '@/lib/pdfBackfill';
import { authenticateAdminRequest, incrementSessionVersion } from '@/lib/auth';
import { isRedisUnavailableError, redisUnavailableResponse } from '@/lib/redis';
import { PdfDocument, User } from '@/types';
import { deleteUserAccount } from '@/lib/accountDeletion';
import { boundedString, INPUT_LIMITS, isValidGeneration, isValidSystem, readJsonObject } from '@/lib/validation';
import { rejectUntrustedMutation } from '@/lib/requestSecurity';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAdminRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [users, pdfs, guides, comments, feedback] = await Promise.all([
      getUsers(),
      getAllPdfs(),
      getUserGuides(),
      getComments(),
      getFeedback(),
    ]);

    const usersWithoutPassword = users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      role: u.role,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
    }));

    const moderation = {
      pendingPdfs: pdfs.filter((pdf) => pdf.approved === false),
      pendingGuides: guides.filter((guide) => !guide.approved),
      feedback: feedback.filter((item) => item.moderationStatus !== 'reviewed').reverse(),
      comments: comments
        .filter((comment) => comment.reported || comment.moderationStatus === 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    };

    return NextResponse.json({ users: usersWithoutPassword, pdfs, guides, moderation });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Admin load error:', error);
    return NextResponse.json({ error: 'Failed to load admin data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const originError = rejectUntrustedMutation(request);
    if (originError) return originError;

    const auth = await authenticateAdminRequest(request);

    if (!auth) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const rawBody = await readJsonObject(request);
    if (!rawBody) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    const body = rawBody as {
      action?: string;
      userId?: string;
      pdfId?: string;
      role?: User['role'];
      title?: string;
      description?: string;
      generation?: string;
      system?: string;
      model?: string;
      force?: boolean;
      guideId?: string;
      feedbackId?: string;
      commentId?: string;
    };
    const { action, userId, pdfId, role, force } = body;

    if (!boundedString(action, 50)) {
      return NextResponse.json({ error: 'Valid action is required' }, { status: 400 });
    }

    if (action === 'deleteUser') {
      const target = (await getUsers()).find((user) => user.id === userId);

      if (!target) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (target.role === 'admin') {
        return NextResponse.json({ error: 'Cannot delete admin' }, { status: 400 });
      }
      await deleteUserAccount(target, auth.user.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'changeRole') {
      if (role !== 'user' && role !== 'admin') {
        return NextResponse.json({ error: 'Valid role is required' }, { status: 400 });
      }

      let found = false;
      await mutateUsers((users) => users.map((user) => {
        if (user.id !== userId) return user;
        found = true;
        const updated = { ...user, role };
        incrementSessionVersion(updated);
        return updated;
      }));
      if (!found) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    if (action === 'deletePdf') {
      const snapshot = await getAllPdfs();
      const removed = snapshot.find((pdf) => pdf.id === pdfId);
      if (!removed) {
        return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
      }

      const fileStillReferenced = snapshot.some((pdf) => pdf.id !== removed.id && pdf.filename === removed.filename);
      if (!fileStillReferenced) await deletePdfFile(removed.filename);
      await deletePdfDownloadCounter(removed.id);
      await mutatePdfs((pdfs) => pdfs.filter((pdf) => pdf.id !== removed.id));
      return NextResponse.json({ success: true });
    }

    if (action === 'approvePdf') {
      let updatedPdf: PdfDocument | undefined;
      await mutatePdfs((pdfs) => pdfs.map((pdf) => {
        if (pdf.id !== pdfId) return pdf;
        updatedPdf = {
          ...pdf,
          approved: true,
          reviewedAt: new Date().toISOString(),
          reviewedBy: auth.user.username,
        };
        return updatedPdf;
      }));

      if (!updatedPdf) {
        return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, pdf: updatedPdf });
    }

    if (action === 'updatePdf') {
      const { title, description, generation, system, model } = body;
      const validTitle = title === undefined ? undefined : boundedString(title, INPUT_LIMITS.title);
      const validDescription = description === undefined ? undefined : boundedString(description, INPUT_LIMITS.description, false);
      const validModel = model === undefined ? undefined : boundedString(model, INPUT_LIMITS.name, false);
      if (
        (title !== undefined && validTitle === null)
        || (description !== undefined && validDescription === null)
        || (generation !== undefined && !isValidGeneration(generation))
        || (system !== undefined && !isValidSystem(system))
        || (model !== undefined && validModel === null)
      ) {
        return NextResponse.json({ error: 'Invalid PDF metadata' }, { status: 400 });
      }
      let updatedPdf: PdfDocument | undefined;
      await mutatePdfs((pdfs) => pdfs.map((pdf) => {
        if (pdf.id !== pdfId) return pdf;
        const nextPdf: PdfDocument = {
          ...pdf,
          ...(typeof validTitle === 'string' ? { title: validTitle } : {}),
          ...(typeof validDescription === 'string' ? { description: validDescription } : {}),
          ...(generation !== undefined ? { generation } : {}),
          ...(system !== undefined ? { system } : {}),
          ...(typeof validModel === 'string' ? { model: validModel || undefined } : {}),
        };
        updatedPdf = nextPdf;
        return nextPdf;
      }));

      if (!updatedPdf) {
        return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, pdf: updatedPdf });
    }

    if (action === 'testEmail') {
      if (!resend) {
        return NextResponse.json({ error: 'Resend not configured. Please set RESEND_API_KEY env var.' }, { status: 400 });
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return NextResponse.json({ error: 'ADMIN_EMAIL not set. Please set ADMIN_EMAIL env var.' }, { status: 400 });
      }

      try {
        const result = await resend.emails.send({
          from: 'VW Repo <vwrepo@groundedcyber.com>',
          to: adminEmail,
          subject: 'Test Email - VW Repo',
          html: '<h1>Test</h1><p>If you see this, Resend is working.</p>',
        });
        console.log('Resend result:', result);
        return NextResponse.json({ success: true, result });
      } catch (err) {
        console.error('Resend error:', err);
        return NextResponse.json({ error: 'Failed to send email', details: String(err) }, { status: 500 });
      }
    }

    if (action === 'backfillPdfText') {
      const result = await backfillPdfSearchText({ force: Boolean(force) });
      return NextResponse.json({ success: true, result });
    }

    if (action === 'approveGuide') {
      let updatedGuide;
      await mutateUserGuides((guides) => guides.map((guide) => {
        if (guide.id !== body.guideId) return guide;
        updatedGuide = { ...guide, approved: true, updatedAt: new Date().toISOString() };
        return updatedGuide;
      }));

      if (!updatedGuide) {
        return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, guide: updatedGuide });
    }

    if (action === 'rejectGuide' || action === 'deleteGuide') {
      let found = false;
      await mutateUserGuides((guides) => {
        found = guides.some((guide) => guide.id === body.guideId);
        return guides.filter((guide) => guide.id !== body.guideId);
      });

      if (!found) {
        return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'reviewFeedback' || action === 'deleteFeedback') {
      let found = false;
      await mutateFeedback((feedback) => feedback.flatMap((item) => {
        if (item.id !== body.feedbackId) return [item];
        found = true;
        if (action === 'deleteFeedback') return [];
        return [{
          ...item,
          moderationStatus: 'reviewed',
          reviewedAt: new Date().toISOString(),
          reviewedBy: auth.user.username,
        }];
      }));

      if (!found) {
        return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'reviewComment' || action === 'deleteComment') {
      let found = false;
      await mutateComments((comments) => comments.flatMap((comment) => {
        if (comment.id !== body.commentId) return [comment];
        found = true;
        return action === 'deleteComment'
          ? []
          : [{ ...comment, reported: false, moderationStatus: 'reviewed' }];
      }));

      if (!found) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (isRedisUnavailableError(error)) return redisUnavailableResponse();
    console.error('Admin error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}

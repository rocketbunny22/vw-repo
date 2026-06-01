import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserGuides, saveUserGuides } from '@/data/guides';
import { DiyGuide } from '@/types';

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function verifySessionToken(token: string): { valid: boolean; user?: { id: string; username: string; role: string } } {
  try {
    const [payload, signature] = token.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(JSON.stringify(data)).digest('hex');
    if (signature !== expectedSig) return { valid: false };
    if (data.exp < Date.now()) return { valid: false };
    return { valid: true, user: { id: data.id, username: data.username, role: data.role } };
  } catch {
    return { valid: false };
  }
}

function checkAuth(request: NextRequest): { authenticated: boolean; role: string; id?: string; username?: string } {
  const authCookie = request.cookies.get('vw_auth');
  if (!authCookie) return { authenticated: false, role: 'user' };
  try {
    const sessionVerify = verifySessionToken(authCookie.value);
    if (!sessionVerify.valid || !sessionVerify.user) {
      return { authenticated: false, role: 'user' };
    }
    return { 
      authenticated: true, 
      id: sessionVerify.user.id, 
      username: sessionVerify.user.username, 
      role: sessionVerify.user.role || 'user' 
    };
  } catch {
    return { authenticated: false, role: 'user' };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const generation = searchParams.get('generation');
  const system = searchParams.get('system');
  const showAll = searchParams.get('all');
  
  const { diyGuides } = await import('@/data/diyGuides');
  const staticGuides = diyGuides;
  const userGuides = await getUserGuides();
  
  const auth = checkAuth(request);
  
  // Add approved user guides to static guides
  const allGuides = [...staticGuides];
  
  // Add approved user guides (or all if admin)
  const approvedUserGuides = userGuides.filter((g: DiyGuide) => 
    showAll === 'true' && auth.role === 'admin' ? true : g.approved
  );
  approvedUserGuides.forEach((g: DiyGuide) => {
    allGuides.push(g);
  });
  
  // Filter
  const filtered = allGuides.filter((g: DiyGuide) => {
    if (generation && generation !== 'all' && g.generation !== generation) return false;
    if (system && system !== 'all' && g.system !== system) return false;
    return true;
  });
  
  return NextResponse.json({ guides: filtered });
}

export async function POST(request: NextRequest) {
  const auth = checkAuth(request);
  
  if (!auth.authenticated) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'submit') {
      const { title, generation, system, content, difficulty, timeEstimate, tools, parts } = data;
      
      if (!title || !generation || !system || !content) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const userGuides = await getUserGuides();
      
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now();
      
      const newGuide: DiyGuide = {
        id: crypto.randomUUID(),
        title,
        slug,
        generation,
        system,
        author: auth.username || 'anonymous',
        authorId: auth.id,
        content,
        difficulty: difficulty || 'moderate',
        timeEstimate: timeEstimate || '2-4 hours',
        tools: tools || [],
        parts: parts || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        featured: false,
        approved: false,
      };

      userGuides.push(newGuide);
      await saveUserGuides(userGuides);

      return NextResponse.json({ success: true, guide: newGuide });
    }

    if (action === 'approve' && auth.role === 'admin') {
      const { guideId } = data;
      const userGuides = await getUserGuides();
      const guideIndex = userGuides.findIndex((g: DiyGuide) => g.id === guideId);
      
      if (guideIndex === -1) {
        return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
      }

      userGuides[guideIndex].approved = true;
      await saveUserGuides(userGuides);

      return NextResponse.json({ success: true });
    }

    if (action === 'delete' && auth.role === 'admin') {
      const { guideId } = data;
      const userGuides = await getUserGuides();
      const guideIndex = userGuides.findIndex((g: DiyGuide) => g.id === guideId);
      
      if (guideIndex === -1) {
        return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
      }

      userGuides.splice(guideIndex, 1);
      await saveUserGuides(userGuides);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Guide error:', error);
    return NextResponse.json({ error: 'Failed to process guide' }, { status: 500 });
  }
}

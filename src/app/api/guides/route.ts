import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

const guidesFile = path.resolve(process.cwd(), 'user-guides.json');
const staticGuidesFile = path.resolve(process.cwd(), 'src/data/diyGuides.ts');
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

interface DiyGuide {
  id: string;
  title: string;
  slug: string;
  generation: string;
  system: string;
  author: string;
  authorId?: string;
  content: string;
  difficulty: string;
  timeEstimate: string;
  tools: string[];
  parts: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  featured: boolean;
  approved?: boolean;
  isStatic?: boolean;
}

async function getUserGuides(): Promise<DiyGuide[]> {
  try {
    if (!existsSync(guidesFile)) return [];
    const data = await readFile(guidesFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function getStaticGuides(): Promise<DiyGuide[]> {
  try {
    const data = await readFile(staticGuidesFile, 'utf-8');
    const match = data.match(/export const diyGuides: DiyGuide\[\] = ([\s\S]*?\]);/);
    if (match) {
      const jsonStr = match[1];
      return JSON.parse(jsonStr);
    }
    return [];
  } catch {
    return [];
  }
}

async function saveGuides(guides: DiyGuide[]): Promise<void> {
  await writeFile(guidesFile, JSON.stringify(guides, null, 2));
}

function verifySessionToken(token: string): { valid: boolean; user?: { id: string; username: string; role: string } } {
  try {
    const [payload, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    if (signature !== expectedSig) return { valid: false };
    const data = JSON.parse(Buffer.from(payload, 'base64').toString());
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
  
  const staticGuides = await getStaticGuides();
  const userGuides = await getUserGuides();
  
  const auth = checkAuth(request);
  
  // Add approved user guides to static guides
  const allGuides = [...staticGuides];
  
  // Add approved user guides (or all if admin)
  const approvedUserGuides = userGuides.filter((g: DiyGuide) => 
    showAll === 'true' && auth.role === 'admin' ? true : g.approved
  );
  approvedUserGuides.forEach((g: DiyGuide) => {
    g.isStatic = false;
    allGuides.push(g);
  });
  
  // Filter
  let filtered = allGuides.filter((g: DiyGuide) => {
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
        approved: auth.role === 'admin',
        isStatic: false,
      };

      userGuides.push(newGuide);
      await saveGuides(userGuides);

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
      await saveGuides(userGuides);

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
      await saveGuides(userGuides);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Guide error:', error);
    return NextResponse.json({ error: 'Failed to process guide' }, { status: 500 });
  }
}
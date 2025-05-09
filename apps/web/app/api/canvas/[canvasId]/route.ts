import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Rethrow specific errors (e.g. "User not found")
    }
    throw new Error('Invalid token or authentication failed');
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  const id = (await params).canvasId;
  try {
    const canvas = await prisma.canvas.findUnique({
      where: { id: id },
    });
    if (!canvas) {
      return NextResponse.json(
        { message: 'Canvas not found' },
        { status: 404 }
      );
    }
    const messages = await prisma.canvasMessage.findMany({
      where: {
        canvasId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get canvas error:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const id = (await params).canvasId;
    const { message } = await request.json();

    // Validate input
    if (!message) {
      return NextResponse.json(
        { message: 'Missing required message content' },
        { status: 400 }
      );
    }

    const canvasMessage = await prisma.canvasMessage.create({
      data: {
        content: message,
        canvasId: id,
        userId: user.id,
      },
    });

    return NextResponse.json(canvasMessage, { status: 201 });
  } catch (error) {
    console.error('Create canvas message error:', error);

    if (
      error instanceof Error &&
      (error.message === 'Not authenticated' ||
        error.message === 'User not found' ||
        error.message === 'Invalid token or authentication failed')
    ) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to get the current user from the JWT token
async function getCurrentUser(request: Request) {
  const token = cookies().get('auth-token')?.value;

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
    throw new Error('Invalid token');
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    const { title, description, width, height } = await request.json();

    // Validate input
    if (!title || !width || !height) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create canvas
    const canvas = await prisma.canvas.create({
      data: {
        title,
        description: description || '',
        width,
        height,
        userId: user.id,
        content: '', // Initial empty canvas content
      },
    });

    return NextResponse.json(canvas, { status: 201 });
  } catch (error) {
    console.error('Create canvas error:', error);
    
    if (error instanceof Error && error.message === 'Not authenticated') {
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

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);

    // Get all canvases for the user
    const canvases = await prisma.canvas.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(canvases);
  } catch (error) {
    console.error('Get canvases error:', error);
    
    if (error instanceof Error && error.message === 'Not authenticated') {
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
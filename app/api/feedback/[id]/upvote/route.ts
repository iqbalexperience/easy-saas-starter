// app/api/feedback/[id]/upvote/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: (await params).id },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Check if user already upvoted this feedback
    const existingUpvote = await prisma.upvote.findFirst({
      where: {
        userId: session.user.id,
        feedbackId: (await params).id,
      },
    });

    if (existingUpvote) {
      // If upvote exists, remove it (toggle functionality)
      await prisma.upvote.delete({
        where: {
          id: existingUpvote.id,
        },
      });

      return NextResponse.json({ upvoted: false });
    }

    // Create new upvote
    await prisma.upvote.create({
      data: {
        userId: session.user.id,
        feedbackId: (await params).id,
      },
    });

    return NextResponse.json({ upvoted: true });
  } catch (error) {
    console.error("Failed to toggle upvote:", error);
    return NextResponse.json(
      { error: "Failed to toggle upvote" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Count total upvotes
    const upvotesCount = await prisma.upvote.count({
      where: {
        feedbackId: (await params).id,
      },
    });

    // Check if user upvoted
    const userUpvoted = await prisma.upvote.findFirst({
      where: {
        userId: session.user.id,
        feedbackId: (await params).id,
      },
    });

    return NextResponse.json({
      count: upvotesCount,
      userUpvoted: !!userUpvoted,
    });
  } catch (error) {
    console.error("Failed to get upvote status:", error);
    return NextResponse.json(
      { error: "Failed to get upvote status" },
      { status: 500 }
    );
  }
}

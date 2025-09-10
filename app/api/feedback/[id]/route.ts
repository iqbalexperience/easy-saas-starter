// app/api/feedback/[id]/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const feedbackUpdateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100).optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  topicId: z.string().min(1, "Topic is required").optional(),
  status: z.enum(["open", "in-development", "completed", "closed"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id: (await params).id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        topic: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            upvotes: true,
          },
        },
        upvotes: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Get the feedback to check ownership
    const feedback = await prisma.feedback.findUnique({
      where: { id: (await params).id },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Only allow the creator or admins/developers to update
    const isAuthorized =
      feedback.userId === session.user.id ||
      ["admin", "developer"].includes(session.user.role as string);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You don't have permission to update this feedback" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const validatedData = feedbackUpdateSchema.parse(json);

    // If topic is being changed, verify it exists
    if (validatedData.topicId) {
      const topic = await prisma.topic.findUnique({
        where: { id: validatedData.topicId },
      });

      if (!topic) {
        return NextResponse.json(
          { error: "Topic not found" },
          { status: 404 }
        );
      }
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: (await params).id },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        topic: true,
      },
    });

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        // @ts-ignore
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to update feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get the feedback to check ownership
    const feedback = await prisma.feedback.findUnique({
      where: { id: (await params).id },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Only allow the creator or admins to delete
    const isAuthorized =
      feedback.userId === session.user.id ||
      session.user.role === "admin";

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You don't have permission to delete this feedback" },
        { status: 403 }
      );
    }

    // Don't allow deletion if there are tasks associated
    if (feedback._count.tasks > 0) {
      return NextResponse.json(
        { error: "Cannot delete feedback with associated tasks" },
        { status: 400 }
      );
    }

    // Delete related comments and upvotes first
    await prisma.comment.deleteMany({
      where: { feedbackId: (await params).id },
    });

    await prisma.upvote.deleteMany({
      where: { feedbackId: (await params).id },
    });

    // Then delete the feedback
    await prisma.feedback.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete feedback:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}

// app/api/tasks/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().optional(),
  status: z.enum(["backlog", "next-up", "in-progress", "testing", "completed"]).default("backlog"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  feedbackId: z.string().min(1, "Feedback is required"),
  assigneeId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assignee");
    const feedbackId = searchParams.get("feedback");

    // Build where clause for filtering
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (feedbackId) {
      where.feedbackId = feedbackId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        feedback: {
          select: {
            id: true,
            title: true,
            topic: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Only allow admins and developers to create tasks
    if (!["admin", "developer"].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: "You don't have permission to create tasks" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const validatedData = taskSchema.parse(json);

    // Verify the feedback exists
    const feedback = await prisma.feedback.findUnique({
      where: { id: validatedData.feedbackId },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // If an assignee is specified, verify the user exists
    if (validatedData.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: validatedData.assigneeId },
      });

      if (!assignee) {
        return NextResponse.json(
          { error: "Assignee not found" },
          { status: 404 }
        );
      }
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        status: validatedData.status,
        priority: validatedData.priority,
        creatorId: session.user.id,
        assigneeId: validatedData.assigneeId || null,
        feedbackId: validatedData.feedbackId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        feedback: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Update the feedback status if it's still open
    if (feedback.status === "open") {
      await prisma.feedback.update({
        where: { id: validatedData.feedbackId },
        data: { status: "in-development" },
      });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        // @ts-ignore
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

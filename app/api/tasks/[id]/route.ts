// app/api/tasks/[id]/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const taskUpdateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100).optional(),
  description: z.string().optional(),
  status: z.enum(["backlog", "next-up", "in-progress", "testing", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: (await params).id },
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
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        changelog: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
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

    // Only allow admins and developers to update tasks
    if (!["admin", "developer"].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: "You don't have permission to update tasks" },
        { status: 403 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: (await params).id },
      include: {
        feedback: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const json = await request.json();
    const validatedData = taskUpdateSchema.parse(json);

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

    // Check if status is changing to "completed"
    const isCompletingTask =
      task.status !== "completed" &&
      validatedData.status === "completed";

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: (await params).id },
      data: validatedData,
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
        feedback: true,
      },
    });

    // If task is completed, update the feedback status
    if (isCompletingTask) {
      await prisma.feedback.update({
        where: { id: task.feedbackId },
        data: { status: "completed" },
      });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        // @ts-ignore
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
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

    // Only allow admins to delete tasks
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to delete tasks" },
        { status: 403 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: (await params).id },
      include: {
        changelog: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Don't allow deletion if there's a changelog associated
    if (task.changelog) {
      return NextResponse.json(
        { error: "Cannot delete a task with an associated changelog" },
        { status: 400 }
      );
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

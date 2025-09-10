// app/api/changelog/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const changelogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  taskId: z.string().min(1, "Task is required"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feedbackId = searchParams.get("feedback");
    const topicId = searchParams.get("topic");

    // Build where clause for filtering
    const where: any = {};

    if (feedbackId) {
      where.feedbackId = feedbackId;
    }

    if (topicId) {
      where.feedback = {
        topicId,
      };
    }

    const changelogs = await prisma.changelog.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
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
        createdAt: "desc",
      },
    });

    return NextResponse.json(changelogs);
  } catch (error) {
    console.error("Failed to fetch changelogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch changelogs" },
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

    // Only allow admins and developers to create changelogs
    if (!["admin", "developer"].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: "You don't have permission to create changelogs" },
        { status: 403 }
      );
    }

    const json = await request.json();
    const validatedData = changelogSchema.parse(json);

    // Verify the task exists and is completed
    const task = await prisma.task.findUnique({
      where: { id: validatedData.taskId },
      include: {
        changelog: true,
        feedback: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (task.status !== "completed") {
      return NextResponse.json(
        { error: "Only completed tasks can have changelog entries" },
        { status: 400 }
      );
    }

    if (task.changelog) {
      return NextResponse.json(
        { error: "This task already has a changelog entry" },
        { status: 400 }
      );
    }

    // Create the changelog
    const changelog = await prisma.changelog.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        taskId: validatedData.taskId,
        feedbackId: task.feedbackId,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
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
    });

    return NextResponse.json(changelog, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        // @ts-ignore
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to create changelog:", error);
    return NextResponse.json(
      { error: "Failed to create changelog" },
      { status: 500 }
    );
  }
}

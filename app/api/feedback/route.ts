// app/api/feedback/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const feedbackSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  topicId: z.string().min(1, "Topic is required"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topic");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "newest";

    // Build where clause for filtering
    const where: any = {};

    if (topicId) {
      where.topicId = topicId;
    }

    if (status) {
      where.status = status;
    }

    // Determine ordering based on sort parameter
    let orderBy: any = { createdAt: "desc" }; // default to newest

    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "most-upvotes") {
      orderBy = { upvotes: { _count: "desc" } };
    } else if (sort === "least-upvotes") {
      orderBy = { upvotes: { _count: "asc" } };
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        topic: true,
        _count: {
          select: {
            upvotes: true,
            comments: true,
          },
        },
      },
      orderBy,
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
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

    const json = await request.json();
    const validatedData = feedbackSchema.parse(json);

    // Verify the topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: validatedData.topicId },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        userId: session.user.id,
        topicId: validatedData.topicId,
      },
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

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        // @ts-ignore
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to create feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}

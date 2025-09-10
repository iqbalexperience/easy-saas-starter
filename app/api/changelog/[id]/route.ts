// app/api/changelog/[id]/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const changelogUpdateSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100).optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const changelog = await prisma.changelog.findUnique({
      where: { id: (await params).id },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
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
      },
    });

    if (!changelog) {
      return NextResponse.json(
        { error: "Changelog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(changelog);
  } catch (error) {
    console.error("Failed to fetch changelog:", error);
    return NextResponse.json(
      { error: "Failed to fetch changelog" },
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

    // Only allow admins and developers to update changelogs
    if (!["admin", "developer"].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: "You don't have permission to update changelogs" },
        { status: 403 }
      );
    }

    const changelog = await prisma.changelog.findUnique({
      where: { id: (await params).id },
    });

    if (!changelog) {
      return NextResponse.json(
        { error: "Changelog not found" },
        { status: 404 }
      );
    }

    const json = await request.json();
    const validatedData = changelogUpdateSchema.parse(json);

    // Update the changelog
    const updatedChangelog = await prisma.changelog.update({
      where: { id: (await params).id },
      data: validatedData,
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

    return NextResponse.json(updatedChangelog);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        // @ts-ignore
        { error: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to update changelog:", error);
    return NextResponse.json(
      { error: "Failed to update changelog" },
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

    // Only allow admins to delete changelogs
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "You don't have permission to delete changelogs" },
        { status: 403 }
      );
    }

    const changelog = await prisma.changelog.findUnique({
      where: { id: (await params).id },
    });

    if (!changelog) {
      return NextResponse.json(
        { error: "Changelog not found" },
        { status: 404 }
      );
    }

    // Delete the changelog
    await prisma.changelog.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete changelog:", error);
    return NextResponse.json(
      { error: "Failed to delete changelog" },
      { status: 500 }
    );
  }
}

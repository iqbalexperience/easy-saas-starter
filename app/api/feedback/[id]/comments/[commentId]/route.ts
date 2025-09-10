// app/api/feedback/[id]/comments/[commentId]/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; commentId: string }> }
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

        // Verify the comment exists
        const comment = await prisma.comment.findUnique({
            where: {
                id: (await params).commentId,
                feedbackId: (await params).id,
            },
            include: {
                replies: true,
            }
        });

        if (!comment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            );
        }

        // Check if user is authorized (admin, comment creator, or feedback creator)
        const feedback = await prisma.feedback.findUnique({
            where: { id: (await params).id },
            select: { userId: true }
        });

        const isAuthorized =
            session.user.role === "admin" ||
            comment.userId === session.user.id ||
            (feedback && feedback.userId === session.user.id);

        if (!isAuthorized) {
            return NextResponse.json(
                { error: "You don't have permission to delete this comment" },
                { status: 403 }
            );
        }

        // If comment has replies, we need to handle them
        if (comment.replies.length > 0) {
            // Option 1: Update the content to indicate it was deleted
            await prisma.comment.update({
                where: { id: (await params).commentId },
                data: {
                    content: "_This comment has been deleted_",
                    isAnswer: false, // Remove answer status if it was an answer
                },
            });
        } else {
            // If no replies, delete the comment
            await prisma.comment.delete({
                where: { id: (await params).commentId },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete comment:", error);
        return NextResponse.json(
            { error: "Failed to delete comment" },
            { status: 500 }
        );
    }
}

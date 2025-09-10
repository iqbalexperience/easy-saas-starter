// app/api/feedback/[id]/comments/[commentId]/answer/route.ts
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

        // Verify the feedback exists
        const feedback = await prisma.feedback.findUnique({
            where: { id: (await params).id },
        });

        if (!feedback) {
            return NextResponse.json(
                { error: "Feedback not found" },
                { status: 404 }
            );
        }

        // Verify the comment exists
        const comment = await prisma.comment.findUnique({
            where: {
                id: (await params).commentId,
                feedbackId: (await params).id,
            },
        });

        if (!comment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            );
        }

        // Check if user is authorized (admin or feedback creator)
        const isAuthorized =
            session.user.role === "admin" ||
            feedback.userId === session.user.id;

        if (!isAuthorized) {
            return NextResponse.json(
                { error: "You don't have permission to mark this as an answer" },
                { status: 403 }
            );
        }

        // Check if this comment is already marked as answer
        if (comment.isAnswer) {
            // If it's already an answer, unmark it and keep feedback status as is
            await prisma.comment.update({
                where: { id: (await params).commentId },
                data: { isAnswer: false },
            });

            return NextResponse.json({
                isAnswer: false,
                feedbackStatus: feedback.status
            });
        }

        // Start a transaction to update both the comment and feedback
        const result = await prisma.$transaction(async (tx) => {
            // Unmark any existing answer
            await tx.comment.updateMany({
                where: {
                    feedbackId: (await params).id,
                    isAnswer: true,
                },
                data: { isAnswer: false },
            });

            // Mark this comment as the answer
            const updatedComment = await tx.comment.update({
                where: { id: (await params).commentId },
                data: { isAnswer: true },
            });

            // Update feedback status to closed
            const updatedFeedback = await tx.feedback.update({
                where: { id: (await params).id },
                data: { status: "closed" },
            });

            return {
                comment: updatedComment,
                feedback: updatedFeedback,
            };
        });

        return NextResponse.json({
            isAnswer: true,
            feedbackStatus: "closed"
        });
    } catch (error) {
        console.error("Failed to mark comment as answer:", error);
        return NextResponse.json(
            { error: "Failed to mark comment as answer" },
            { status: 500 }
        );
    }
}

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

        // Verify the feedback exists
        const feedback = await prisma.feedback.findUnique({
            where: { id: (await params).id },
        });

        if (!feedback) {
            return NextResponse.json(
                { error: "Feedback not found" },
                { status: 404 }
            );
        }

        // Verify the comment exists
        const comment = await prisma.comment.findUnique({
            where: {
                id: (await params).commentId,
                feedbackId: (await params).id,
            },
        });

        if (!comment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            );
        }

        // Check if user is authorized (admin or feedback creator)
        const isAuthorized =
            session.user.role === "admin" ||
            feedback.userId === session.user.id;

        if (!isAuthorized) {
            return NextResponse.json(
                { error: "You don't have permission to unmark this answer" },
                { status: 403 }
            );
        }

        // Unmark the comment as answer
        await prisma.comment.update({
            where: { id: (await params).commentId },
            data: { isAnswer: false },
        });

        return NextResponse.json({
            isAnswer: false,
            feedbackStatus: feedback.status
        });
    } catch (error) {
        console.error("Failed to unmark comment as answer:", error);
        return NextResponse.json(
            { error: "Failed to unmark comment as answer" },
            { status: 500 }
        );
    }
}

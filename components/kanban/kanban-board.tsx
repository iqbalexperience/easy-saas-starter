// components/kanban/kanban-board.tsx
"use client";

import { useState } from "react";
import { TaskCard } from "./task-card";
import { ColumnHeader } from "./column-header";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  ShoppingBag,
  LayoutList,
  Bug,
  ArrowRightToLine,
  FlaskConical,
  CircleCheck,
  ListTodo
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
  feedback: {
    id: string;
    title: string;
    topic: {
      id: string;
      name: string;
      color: string;
    };
    _count: {
      upvotes: number;
      comments: number;
    }
  };
}

interface KanbanBoardProps {
  initialTasks: Task[];
}

type ColumnType = "backlog" | "next-up" | "in-progress" | "testing" | "completed";

const columnDefinitions: { id: ColumnType; title: string, Icon: any }[] = [
  { id: "backlog", title: "Backlog", Icon: Bug },
  { id: "next-up", title: "Next Up", Icon: ArrowRightToLine },
  { id: "in-progress", title: "In Progress", Icon: ListTodo },
  { id: "testing", title: "Testing", Icon: FlaskConical },
  { id: "completed", title: "Completed", Icon: CircleCheck },
];

// Define the next status for each current status
const nextStatus: Record<ColumnType, ColumnType> = {
  "backlog": "next-up",
  "next-up": "in-progress",
  "in-progress": "testing",
  "testing": "completed",
  "completed": "completed", // No next status for completed
};

// Define the previous status for testing rejection
const prevStatus: Record<string, ColumnType> = {
  "testing": "next-up",
};

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  // Group tasks by status column
  const getTasksByColumn = (columnId: ColumnType) => {
    return tasks.filter((task) => task.status === columnId);
  };

  // Handle task status update
  const handleUpdateStatus = async (taskId: string, newStatus: ColumnType) => {
    setIsUpdating(taskId);

    try {
      // Optimistically update UI
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);

      // Update in database
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        // Revert the optimistic update
        setTasks(tasks);
        const error = await response.json();
        throw new Error(error.error || "Failed to update task status");
      }

      if (newStatus === "completed") {
        toast.success("Task marked as completed! Don't forget to create a changelog entry.");
      } else {
        toast.success(`Task moved to ${newStatus.replace(/-/g, " ")}`);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error((error as Error).message || "Failed to update task status");
    } finally {
      setIsUpdating(null);
    }
  };

  // Handle moving task forward
  const handleMoveForward = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // For testing status, show approval dialog
    if (task.status === "testing") {
      setCurrentTaskId(taskId);
      setShowApprovalDialog(true);
      return;
    }

    // For other statuses, move directly to next status
    const next = nextStatus[task.status as ColumnType];
    if (next) {
      handleUpdateStatus(taskId, next);
    }
  };

  // Handle approval/rejection from testing
  const handleTestingResult = (isApproved: boolean) => {
    if (!currentTaskId) return;

    if (isApproved) {
      handleUpdateStatus(currentTaskId, "completed");
    } else {
      handleUpdateStatus(currentTaskId, "next-up");
    }

    setShowApprovalDialog(false);
    setCurrentTaskId(null);
  };

  return (
    <>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1500px]">
          {columnDefinitions.map((column) => {
            const columnTasks = getTasksByColumn(column.id);


            return (
              <div key={column.id} className="flex flex-col min-w-[300px] flex-1">
                <ColumnHeader
                  title={column.title}
                  count={columnTasks.length}
                  Icon={column.Icon}
                />
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
                  <div className="space-y-2 pb-4">
                    {columnTasks.map((task) => (
                      <div key={task.id}>
                        <TaskCard task={task}
                          column={column}
                          handleMoveForward={handleMoveForward}
                          isUpdating={isUpdating}
                        />
                      </div>
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="p-3 text-center text-sm text-muted-foreground border border-dashed rounded-md">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Testing Approval Dialog */}
      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Testing Complete</AlertDialogTitle>
            <AlertDialogDescription>
              Has this task passed testing and is ready to be marked as completed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleTestingResult(false)}
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Reject
            </AlertDialogAction>
            <AlertDialogAction
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => handleTestingResult(true)}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

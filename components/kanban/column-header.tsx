// components/kanban/column-header.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";

interface ColumnHeaderProps {
  title: string;
  count: number;
  isOver?: boolean;
  Icon: any
}

export function ColumnHeader({ title, count, Icon, isOver = false }: ColumnHeaderProps) {
  return (
    <Card className={`mb-3 ${isOver ? "border-primary" : ""} p-0 `}>
      <CardHeader className="p-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4" />
          <span className="font-medium">{title}</span>
          <Badge variant="secondary" className="rounded-full">
            {count}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColoredTooltipProps {
  text: string;
  color?: string;
}

const ColoredTooltip: React.FC<ColoredTooltipProps> = ({
  text,
  color = "stroke-yellow-500",
}) => {


  return <Tooltip>
    <TooltipTrigger>
      <Circle className={cn("w-4 h-4", color)} />
    </TooltipTrigger>
    <TooltipContent>
      <p>{text}</p>
    </TooltipContent>
  </Tooltip>
};

export default ColoredTooltip;

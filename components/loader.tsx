import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls whether the loader is visible.
   */
  isLoading: boolean;
  /**
   * Optional text to display next to the loader.
   */
  text?: string;
  /**
   * The size of the loader icon in pixels.
   */
  size?: number;
  /**
   * The color of the loader icon.
   */
  color?: string;
  /**
   * The stroke width of the loader icon.
   */
  strokeWidth?: number;
  /**
   * Class name for the text
   */
  textClassName?: string;
}

/**
 * A simple loader component with a spinner and optional text, using Lucide React's Loader2 icon.
 */
const Loader: React.FC<LoaderProps> = ({
  isLoading,
  text,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
  textClassName,
  ...props
}) => {
  if (!isLoading) {
    return null; // Or return an empty fragment: <></>;
  }

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Loader2
        className="animate-spin"
        size={size}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      {text && (
        <span className={cn("text-gray-700 dark:text-gray-300", textClassName)}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;

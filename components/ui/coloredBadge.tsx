import React from "react";
import { Badge } from "@/components/ui/badge";

const colorClassMap: Record<string, string> = {
  slate:
    "bg-slate-200 dark:bg-slate-600/50 text-slate-700 dark:text-slate-200 border border-slate-400 dark:border-slate-700",
  gray: "bg-gray-200 dark:bg-gray-600/50 text-gray-700 dark:text-gray-200 border border-gray-400 dark:border-gray-700",
  zinc: "bg-zinc-200 dark:bg-zinc-600/50 text-zinc-700 dark:text-zinc-200 border border-zinc-400 dark:border-zinc-700",
  neutral:
    "bg-neutral-200 dark:bg-neutral-600/50 text-neutral-700 dark:text-neutral-200 border border-neutral-400 dark:border-neutral-700",
  stone:
    "bg-stone-200 dark:bg-stone-600/50 text-stone-700 dark:text-stone-200 border border-stone-400 dark:border-stone-700",
  red: "bg-red-200 dark:bg-red-600/50 text-red-700 dark:text-red-200 border border-red-400 dark:border-red-700",
  yellow:
    "bg-yellow-200 dark:bg-yellow-600/50 text-yellow-700 dark:text-yellow-200 border border-yellow-400 dark:border-yellow-700",
  lime: "bg-lime-200 dark:bg-lime-600/50 text-lime-700 dark:text-lime-200 border border-lime-400 dark:border-lime-700",
  green:
    "bg-green-200 dark:bg-green-600/50 text-green-700 dark:text-green-200 border border-green-400 dark:border-green-700",
  emerald:
    "bg-emerald-200 dark:bg-emerald-600/50 text-emerald-700 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-700",
  teal: "bg-teal-200 dark:bg-teal-600/50 text-teal-700 dark:text-teal-200 border border-teal-400 dark:border-teal-700",
  cyan: "bg-cyan-200 dark:bg-cyan-600/50 text-cyan-700 dark:text-cyan-200 border border-cyan-400 dark:border-cyan-700",
  sky: "bg-sky-200 dark:bg-sky-600/50 text-sky-700 dark:text-sky-200 border border-sky-400 dark:border-sky-700",
  blue: "bg-blue-200 dark:bg-blue-600/50 text-blue-700 dark:text-blue-200 border border-blue-400 dark:border-blue-700",
  indigo:
    "bg-indigo-200 dark:bg-indigo-600/50 text-indigo-700 dark:text-indigo-200 border border-indigo-400 dark:border-indigo-700",
  violet:
    "bg-violet-200 dark:bg-violet-600/50 text-violet-700 dark:text-violet-200 border border-violet-400 dark:border-violet-700",
  purple:
    "bg-purple-200 dark:bg-purple-600/50 text-purple-700 dark:text-purple-200 border border-purple-400 dark:border-purple-700",
  fuchsia:
    "bg-fuchsia-200 dark:bg-fuchsia-600/50 text-fuchsia-700 dark:text-fuchsia-200 border border-fuchsia-400 dark:border-fuchsia-700",
  pink: "bg-pink-200 dark:bg-pink-600/50 text-pink-700 dark:text-pink-200 border border-pink-400 dark:border-pink-700",
  rose: "bg-rose-200 dark:bg-rose-600/50 text-rose-700 dark:text-rose-200 border border-rose-400 dark:border-rose-700",
};

function getColorClassesByLetter(str: string) {
  // Get the array of color names from the map.
  const colors = Object.keys(colorClassMap);
  const defaultColor = colorClassMap.slate;

  // Ensure the input is a valid, non-empty string.
  if (!str || typeof str !== "string" || str.length === 0) {
    return defaultColor;
  }

  // Get the first character and convert it to lowercase.
  const letter = str[0].toLowerCase();

  // Check if the character is a letter from 'a' to 'z'.
  if (letter < 'a' || letter > 'z') {
    return defaultColor;
  }

  // Calculate the character's position in the alphabet (0-25).
  // 'a'.charCodeAt(0) is 97.
  const charCode = letter.charCodeAt(0) - 97;

  // Distribute the 26 letters across the available number of colors.
  // This calculation maps the character's position (0-25) to a color index (0-21).
  const colorIndex = Math.floor((charCode / 26) * colors.length);

  // Get the color name from the array of color keys.
  const colorName = colors[colorIndex];

  // Return the Tailwind class string for that color.
  return colorClassMap[colorName];
}


interface ColoredBadgeProps {
  text: string;
  color?: string | undefined;
}

const ColoredBadge: React.FC<ColoredBadgeProps> = ({
  text,
  color,
}) => {
  const className = color ? colorClassMap[color] : getColorClassesByLetter(text);

  return <Badge className={className}>{text}</Badge>;
};

export default ColoredBadge;

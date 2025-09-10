import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Resizer from "react-image-file-resizer";
import { createHash } from "crypto";
import { customAlphabet } from "nanoid";
import axios from "axios";
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const nanoId = customAlphabet(alphabet, 10);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumberKMNotation(num: number) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    return num.toString();
  }
}

export function getTimeAgoFromISO(isoString: any) {
  const now: any = new Date();
  const past: any = new Date(isoString);
  const diff = Math.floor((now - past) / 1000); // in seconds

  if (diff < 60) return `${diff} seconds ago`;
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export function getDateTimeDetailsFromISO(isoString: any) {
  if (!isoString) {
    return ""
  }
  const date: any = new Date();
  const past: any = new Date(isoString);
  const diff = Math.floor((date - past) / 1000); // in seconds

  if (diff < 60) return `${diff} seconds ago`;
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const options: any = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return past.toLocaleString(undefined, options); // uses local timezone and locale
}

export const resizeImage: any = async (file: any, size: any) => {
  return await new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      size,
      size,
      "png",
      100,
      0,
      (uri: any) => {
        resolve(uri);
      },
      "file"
    );
  });
};

export async function getImageHash(file: any) {
  const base64Uri: any = await new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      512,
      512,
      "png",
      100,
      0,
      (uri) => {
        resolve(uri);
      },
      "base64"
    );
  });
  const base64Data = base64Uri.split(",")[1];

  const buffer = Buffer.from(base64Data, "base64");
  const hash = createHash("sha256").update(buffer).digest("hex");

  return hash;
}

export function extractVariables(text: string | undefined) {
  if (!text) return [];
  const regex = /\{\{(.*?)\}\}/g;

  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

export function replaceVariables(text: string | undefined, variables: any) {
  if (!text) return "";
  // console.log({ text, variables });
  let prompt_0 = text;
  const variables_0: any = extractVariables(prompt_0);
  if (variables_0.length > 0) {
    for (const variable of variables_0) {
      if (variables?.body?.[variable] || variable?.variables?.find((v: any) => v.slug === variable)
        ?.defaultValue) {
        prompt_0 = prompt_0.replace(
          `{{${variable}}}`,
          variables?.body?.[variable]
            ? variables?.body?.[variable]
            : variable?.variables?.find((v: any) => v.slug === variable)
              ?.defaultValue
        );
      }

    }
  }
  return prompt_0;
}

export function validateFields(fields: Record<string, any>): {
  success: boolean;
  message: string;
} {
  const missingFields = Object.entries(fields)
    .filter(
      ([_, value]) => value === undefined || value === null || value === ""
    )
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return {
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  return {
    success: true,
    message: "All required fields are present.",
  };
}

export function maskString(str: string | undefined | null, visibleChars = 4) {
  if (str === null || typeof str === "undefined") {
    console.error("Input string is null or undefined.");
    return ""; // Or handle as appropriate for your application
  }

  str = String(str); // Ensure the input is treated as a string

  if (str.length <= visibleChars) {
    return str;
  }

  const maskedPart = "*".repeat(str.length - visibleChars);
  const visiblePart = str.slice(-visibleChars);
  return maskedPart + visiblePart;
}


export function sanitizeUrl(url: string): string {
  return url.replace(/\s+/g, '%20')
}


export const validateMCP = async (urls: string[]) => {
  const res = await axios.post(`/api/mcp`, {
    mcps: urls
  })
  const data = await res.data
  return data
}

export const renameExtension = (lang: string) => {
  const exts: any = {
    typescript: "ts",
    javascript: "js"
  }
  if (exts[lang]) {
    return exts[lang]
  } else {
    return lang
  }
}
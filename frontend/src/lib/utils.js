import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes with clsx and twMerge.
 * @param {...string} inputs - CSS class names.
 * @returns {string} Combined class names.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertTimeToString = (time: number) => {
  if (time < 60) return `${time} min${time === 1 ? "" : "s"}`;
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  return `${hours} hr${hours === 1 ? "" : "s"}${minutes > 0 ? ` ${minutes} min${minutes === 1 ? "" : "s"}` : ""}`;
}
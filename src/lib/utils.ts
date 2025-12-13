import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { env } from '@/env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debug(message: string) {
  if (typeof window !== 'undefined') {
    if (!env.NEXT_PUBLIC_DEBUG) return;
  } else {
    if (!env.DEBUG) return;
  }

  console.log(`[DEBUG] ${message}`);
}

/**
 * Extracts title and content from markdown text.
 * Assumes the title is the first heading (# Title or ## Title) at the beginning.
 * Returns the title and the remaining content without the title heading.
 */
export function extractStoryContent(text: string): { title: string | null; story: string } {
  // Match markdown heading at the start of the text (h1 or h2)
  // Matches: # or ##, whitespace, title text, and the newline (or end of string)
  const headingMatch = text.match(/^#{1,2}\s+(.+?)(?:\n|$)/);

  if (headingMatch) {
    const title = headingMatch[1].trim();
    // Remove the entire heading line including the newline
    // Use the full match (headingMatch[0]) which includes the #, space, title, and newline
    const story = text.substring(headingMatch[0].length).trimStart();

    return { title, story };
  }

  return { title: null, story: text.trim() };
}

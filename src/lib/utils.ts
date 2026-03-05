import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { supportedLanguages as staticLanguages } from '@/config';
import { env } from '@/env';

import type { SupportedLanguage } from '@/types';

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

type GetLanguageParams = {
  languageCode?: string;
  name?: string;
  languages?: SupportedLanguage[];
};
export function getLanguage({ languageCode, name, languages }: GetLanguageParams) {
  const list = languages ?? staticLanguages;

  if (languageCode) return list.find((lang) => lang.languageCode === languageCode);

  if (name) return list.find((lang) => lang.name === name);

  return undefined;
}

export function countWords(text: string): number {
  if (!text) return 0;

  // Remove markdown formatting and count words
  const cleanText = text
    .replace(/^#{1,6}\s+.+$/gm, '') // Remove entire markdown header lines
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Split by spaces and filter out empty strings
  const words = cleanText.split(' ').filter((word) => word.length > 0);

  return words.length;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const formatted = date.toLocaleDateString('en-US', options);

  // Add ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  const day = date.getDate();
  const suffix = ['th', 'st', 'nd', 'rd'][Math.min((day - 1) % 10, 3)] || 'th';

  return formatted.replace(/\d+/, `${day}${suffix}`);
}

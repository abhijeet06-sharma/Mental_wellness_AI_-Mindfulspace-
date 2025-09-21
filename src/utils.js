// This file contains simple helper functions used across the application.

/**
 * Creates a URL-friendly path from a page name.
 * e.g., "AI Therapist" becomes "/ai-therapist"
 * @param {string} pageName The name of the page.
 * @returns {string} The formatted URL path.
 */
export const createPageUrl = (pageName) => {
  // Fallback for non-string inputs
  if (typeof pageName !== 'string') {
    return '/';
  }
  return `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
};


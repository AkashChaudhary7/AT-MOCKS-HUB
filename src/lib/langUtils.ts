// @ts-nocheck
/**
 * Utility functions for language and typography overrides.
 */

/**
 * Overrides or strips legacy Indian font-family declarations (e.g. DevLys, KrutiDev, Shivaji, Chanakya)
 * from HTML and replacement styles, allowing normalized Unicode to render clearly with standard system fonts.
 */
export function overrideLegacyFontsInHtml(html: string): string {
  if (!html) return "";
  
  // Clean up inline CSS styles enforcing legacy fonts
  let result = html.replace(/font-family:\s*['"]?(?:DevLys|Kruti|KrutiDev|Chanakya|Shivaji|Walkman-Chanakya)[^;'"\s]*/gi, 'font-family: inherit');
  
  // Clean up old HTML font face attributes
  result = result.replace(/face=\s*['"]?(?:DevLys|Kruti|KrutiDev|Chanakya|Shivaji|Walkman-Chanakya)[^'"\s]*/gi, 'face="inherit"');

  return result;
}

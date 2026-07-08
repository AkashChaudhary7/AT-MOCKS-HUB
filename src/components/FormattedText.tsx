// @ts-nocheck
import React from 'react';
import { normalizeHindiText } from '../lib/htmlParser';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export default function FormattedText({ text, className = '' }: FormattedTextProps) {
  if (!text) return null;

  // Lazily normalize the Hindi text to instantly resolve font distortions before split
  const cleanText = normalizeHindiText(text);

  // Split lines to preserve carriage returns and format parts
  const lines = cleanText.split('\n');

  return (
    <div className={className}>
      {lines.map((line, lineIdx) => {
        // Handle bold pattern: **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const lineContent = parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        return (
          <div key={lineIdx} className={lineIdx > 0 ? "mt-1 min-h-[1em]" : "min-h-[1em]"}>
            {lineContent}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState, useEffect, type ReactNode } from "react";

interface SafeMarkdownProps {
  children: string;
  className?: string;
}

function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre key={elements.length} className="bg-muted/50 rounded-md p-3 my-2 overflow-x-auto text-sm font-mono">
          {lang && <div className="text-xs text-muted-foreground mb-1">{lang}</div>}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(<h3 key={elements.length} className="text-base font-semibold mt-4 mb-1">{line.slice(4)}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(<h2 key={elements.length} className="text-lg font-semibold mt-4 mb-1">{line.slice(3)}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(<h1 key={elements.length} className="text-xl font-bold mt-4 mb-1">{line.slice(2)}</h1>);
      i++;
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: ReactNode[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(<li key={items.length}>{parseInline(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(<ul key={elements.length} className="list-disc list-inside my-1 space-y-0.5">{items}</ul>);
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={items.length}>{parseInline(lines[i].replace(/^\d+\.\s/, ""))}</li>);
        i++;
      }
      elements.push(<ol key={elements.length} className="list-decimal list-inside my-1 space-y-0.5">{items}</ol>);
      continue;
    }

    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={elements.length} className="border-l-2 border-primary/30 pl-3 my-2 text-muted-foreground italic">
          {parseInline(line.slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    elements.push(<p key={elements.length} className="my-1">{parseInline(line)}</p>);
    i++;
  }

  return <>{elements}</>;
}

function parseInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let match: RegExpMatchArray | null;

    match = remaining.match(/^`([^`]+)`/);
    if (match) {
      parts.push(<code key={key++} className="bg-muted/50 px-1 py-0.5 rounded text-sm font-mono">{match[1]}</code>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    match = remaining.match(/^\*\*(.+?)\*\*/);
    if (match) {
      parts.push(<strong key={key++} className="font-semibold">{match[1]}</strong>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    match = remaining.match(/^\*(.+?)\*/);
    if (match) {
      parts.push(<em key={key++} className="italic">{match[1]}</em>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    match = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      parts.push(
        <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          {match[1]}
        </a>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    const nextSpecial = remaining.search(/[`*\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    }
    parts.push(remaining.slice(0, nextSpecial));
    remaining = remaining.slice(nextSpecial);
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export function SafeMarkdown({ children, className }: SafeMarkdownProps) {
  const [Mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!Mounted) {
    return <div className={className} style={{ whiteSpace: "pre-wrap" }}>{children}</div>;
  }

  try {
    return (
      <div className={className}>
        <SimpleMarkdown content={children} />
      </div>
    );
  } catch {
    return <div className={className} style={{ whiteSpace: "pre-wrap" }}>{children}</div>;
  }
}

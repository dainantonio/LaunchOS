"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-emerald-300 prose-strong:text-zinc-100">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

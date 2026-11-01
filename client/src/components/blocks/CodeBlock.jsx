import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import sql from "highlight.js/lib/languages/sql";
import go from "highlight.js/lib/languages/go";
import "highlight.js/styles/github-dark.css";

Object.entries({ javascript, typescript, python, java, c, cpp, bash, json, xml, css, sql, go }).forEach(
  ([name, def]) => hljs.registerLanguage(name, def)
);

export default function CodeBlock({ language = "text", text }) {
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    const lang = String(language).toLowerCase();
    return hljs.getLanguage(lang)
      ? hljs.highlight(text, { language: lang, ignoreIllegals: true }).value
      : null;
  }, [text, language]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: ignore */
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-slate-400">
        <span className="uppercase tracking-wide">{language}</span>
        <button onClick={copy} className="inline-flex items-center gap-1.5 hover:text-white">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto">
        {html ? (
          <code className="hljs text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <code className="hljs text-sm leading-relaxed">{text}</code>
        )}
      </pre>
    </div>
  );
}
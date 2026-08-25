import React from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderFormattedText = (text: string) => {
    // Process markdown line by line
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    lines.forEach((line, idx) => {
      // Code blocks ```
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockLang = line.replace('```', '').trim();
          codeBlockContent = [];
        } else {
          inCodeBlock = false;
          const codeString = codeBlockContent.join('\n');
          elements.push(
            <div key={`code-${idx}`} className="my-3 rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto relative group">
              <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span className="uppercase text-[10px] font-bold tracking-wider">{codeBlockLang || 'code'}</span>
                <button
                  onClick={() => handleCopyCode(codeString)}
                  className="flex items-center gap-1 text-[11px] hover:text-white bg-slate-800 px-2 py-1 rounded-md transition-colors"
                >
                  {copiedCode === codeString ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode === codeString ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre><code>{codeString}</code></pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(<h1 key={idx} className="text-xl font-bold text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-100">{line.replace('# ', '')}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={idx} className="text-lg font-bold text-slate-800 mt-3 mb-2 flex items-center gap-1.5">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={idx} className="text-base font-semibold text-slate-800 mt-2 mb-1">{line.replace('### ', '')}</h3>);
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        // Bullet item
        const bulletText = line.trim().replace(/^[-*]\s+/, '');
        elements.push(
          <li key={idx} className="ml-4 list-disc text-slate-700 text-sm my-1 leading-relaxed">
            {parseInlineStyles(bulletText)}
          </li>
        );
      } else if (/^\d+\.\s+/.test(line.trim())) {
        // Numbered list item
        const numText = line.trim().replace(/^\d+\.\s+/, '');
        elements.push(
          <div key={idx} className="ml-2 text-slate-700 text-sm my-1 flex gap-2 leading-relaxed">
            <span className="font-semibold text-brand-600 min-w-[20px]">{line.trim().match(/^\d+\./)?.[0]}</span>
            <span>{parseInlineStyles(numText)}</span>
          </div>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-2" />);
      } else {
        elements.push(
          <p key={idx} className="text-slate-700 text-sm leading-relaxed my-1">
            {parseInlineStyles(line)}
          </p>
        );
      }
    });

    return elements;
  };

  const parseInlineStyles = (str: string) => {
    // Convert **bold**, *italic*, `code`, and math formulas
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={i} className="italic text-slate-600">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-brand-700 font-mono text-xs font-medium border border-slate-200">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return <div className={`prose prose-slate max-w-none ${className}`}>{renderFormattedText(content)}</div>;
};

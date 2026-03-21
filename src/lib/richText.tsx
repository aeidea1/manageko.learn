import { useState } from "react";

// Поддерживаемый синтаксис:
// # Заголовок H1
// ## Заголовок H2
// **жирный текст**
// - пункт списка
// 1. нумерованный список
// ``` блок кода ```

const CodeBlock = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-3">
      <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap pr-16">
        <code>{content}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-gray-300 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"
        title="Копировать код"
      >
        {copied ? (
          <span className="text-green-400">✓ Скопировано</span>
        ) : (
          <span>Копировать</span>
        )}
      </button>
    </div>
  );
};

export const RichTextFull = ({ text }: { text: string }) => {
  if (!text) return null;

  const blocks: { type: "text" | "code"; content: string }[] = [];
  const lines = text.split("\n");
  let inCode = false;
  let codeBuffer: string[] = [];
  let textBuffer: string[] = [];

  for (const line of lines) {
    if (line.trim() === "```") {
      if (!inCode) {
        if (textBuffer.length) {
          blocks.push({ type: "text", content: textBuffer.join("\n") });
          textBuffer = [];
        }
        inCode = true;
      } else {
        blocks.push({ type: "code", content: codeBuffer.join("\n") });
        codeBuffer = [];
        inCode = false;
      }
    } else if (inCode) {
      codeBuffer.push(line);
    } else {
      textBuffer.push(line);
    }
  }
  if (textBuffer.length)
    blocks.push({ type: "text", content: textBuffer.join("\n") });
  if (codeBuffer.length)
    blocks.push({ type: "code", content: codeBuffer.join("\n") });

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.type === "code") {
          return <CodeBlock key={i} content={block.content} />;
        }

        const textLines = block.content.split("\n");
        const elements: React.ReactNode[] = [];
        let ulBuffer: string[] = [];
        let olBuffer: string[] = [];

        const flushUl = (key: string) => {
          if (ulBuffer.length) {
            elements.push(
              <ul
                key={key}
                className="list-disc list-inside space-y-1 pl-2 my-1"
              >
                {ulBuffer.map((item, j) => (
                  <li key={j} className="text-sm text-gray-800">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>,
            );
            ulBuffer = [];
          }
        };

        const flushOl = (key: string) => {
          if (olBuffer.length) {
            elements.push(
              <ol
                key={key}
                className="list-decimal list-inside space-y-1 pl-2 my-1"
              >
                {olBuffer.map((item, j) => (
                  <li key={j} className="text-sm text-gray-800">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>,
            );
            olBuffer = [];
          }
        };

        for (let j = 0; j < textLines.length; j++) {
          const line = textLines[j];
          const key = `${i}-${j}`;

          if (line.startsWith("- ")) {
            flushOl(`ol-${key}`);
            ulBuffer.push(line.slice(2));
            continue;
          }
          if (/^\d+\.\s/.test(line)) {
            flushUl(`ul-${key}`);
            olBuffer.push(line.replace(/^\d+\.\s/, ""));
            continue;
          }

          flushUl(`ul-${key}`);
          flushOl(`ol-${key}`);

          if (line.startsWith("# ")) {
            elements.push(
              <h2 key={key} className="text-xl font-bold text-black mt-5 mb-2">
                {line.slice(2)}
              </h2>,
            );
          } else if (line.startsWith("## ")) {
            elements.push(
              <h3
                key={key}
                className="text-base font-bold text-black mt-4 mb-1"
              >
                {line.slice(3)}
              </h3>,
            );
          } else if (!line.trim()) {
            elements.push(<div key={key} className="h-2" />);
          } else {
            elements.push(
              <p key={key} className="text-sm text-gray-800 leading-relaxed">
                {renderInline(line)}
              </p>,
            );
          }
        }

        flushUl(`ul-end-${i}`);
        flushOl(`ol-end-${i}`);

        return (
          <div key={i} className="space-y-0.5">
            {elements}
          </div>
        );
      })}
    </div>
  );
};

// Инлайн-форматирование: **жирный** и `инлайн-код`
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[0].startsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-bold">
          {match[2]}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={match.index}
          className="bg-gray-100 text-red-600 text-xs px-1.5 py-0.5 rounded font-mono"
        >
          {match[3]}
        </code>,
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === "string" ? (
    parts[0]
  ) : (
    <>{parts}</>
  );
}

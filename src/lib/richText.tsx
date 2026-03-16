// Поддерживаемый синтаксис:
// # Заголовок H1
// ## Заголовок H2
// **жирный текст**
// - пункт списка (ненумерованный)
// 1. пункт списка (нумерованный)
// ```
// блок кода
// ```
// Пустая строка — отступ между абзацами

export const RichTextFull = ({ text }: { text: string }) => {
  if (!text) return null;

  // Разбиваем на блоки кода и текстовые блоки
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
          return (
            <pre
              key={i}
              className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap"
            >
              <code>{block.content}</code>
            </pre>
          );
        }

        // Группируем строки в элементы
        const textLines = block.content.split("\n");
        const elements: React.ReactNode[] = [];
        let ulBuffer: string[] = [];
        let olBuffer: string[] = [];

        const flushUl = () => {
          if (ulBuffer.length) {
            elements.push(
              <ul
                key={`ul-${elements.length}`}
                className="list-disc list-inside space-y-1 pl-2"
              >
                {ulBuffer.map((item, j) => (
                  <li key={j} className="text-sm text-gray-800">
                    {item}
                  </li>
                ))}
              </ul>,
            );
            ulBuffer = [];
          }
        };
        const flushOl = () => {
          if (olBuffer.length) {
            elements.push(
              <ol
                key={`ol-${elements.length}`}
                className="list-decimal list-inside space-y-1 pl-2"
              >
                {olBuffer.map((item, j) => (
                  <li key={j} className="text-sm text-gray-800">
                    {item}
                  </li>
                ))}
              </ol>,
            );
            olBuffer = [];
          }
        };

        for (let j = 0; j < textLines.length; j++) {
          const line = textLines[j];

          if (line.startsWith("- ")) {
            flushOl();
            ulBuffer.push(line.slice(2));
            continue;
          }
          if (/^\d+\.\s/.test(line)) {
            flushUl();
            olBuffer.push(line.replace(/^\d+\.\s/, ""));
            continue;
          }

          flushUl();
          flushOl();

          if (line.startsWith("# ")) {
            elements.push(
              <h2 key={j} className="text-xl font-bold text-black mt-4 mb-1">
                {line.slice(2)}
              </h2>,
            );
          } else if (line.startsWith("## ")) {
            elements.push(
              <h3
                key={j}
                className="text-base font-bold text-black mt-3 mb-0.5"
              >
                {line.slice(3)}
              </h3>,
            );
          } else if (
            line.startsWith("**") &&
            line.endsWith("**") &&
            line.length > 4
          ) {
            elements.push(
              <p key={j} className="font-bold text-sm text-black">
                {line.slice(2, -2)}
              </p>,
            );
          } else if (!line.trim()) {
            elements.push(<div key={j} className="h-2" />);
          } else {
            elements.push(
              <p key={j} className="text-sm text-gray-800 leading-relaxed">
                {line}
              </p>,
            );
          }
        }

        flushUl();
        flushOl();

        return (
          <div key={i} className="space-y-1">
            {elements}
          </div>
        );
      })}
    </div>
  );
};

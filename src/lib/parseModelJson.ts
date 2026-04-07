/**
 * Gemini sometimes appends prose after the JSON object. JSON.parse then fails with
 * "unexpected non-whitespace character after JSON at position N".
 * This extracts the first balanced `{ ... }` slice, respecting string literals.
 */
function extractFirstJsonObject(input: string): string | null {
  const start = input.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  for (let i = start; i < input.length; i++) {
    const c = input[i]!;

    if (inString) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }

    if (c === '"') {
      inString = true;
      continue;
    }

    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return input.slice(start, i + 1);
    }
  }

  return null;
}

/** Parse a model reply: optional ```json fence, then first top-level JSON object. */
export function parseModelJsonObject(text: string): unknown {
  let t = text.trim();
  const fence = /```(?:json)?\s*\n?([\s\S]*?)```/m.exec(t);
  if (fence) {
    t = fence[1].trim();
  }
  const slice = extractFirstJsonObject(t) ?? t;
  return JSON.parse(slice) as unknown;
}

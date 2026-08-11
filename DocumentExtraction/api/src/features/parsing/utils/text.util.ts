export function normalizeWhiteSpace(text: string): string {
  //1. convert Windows line endings to Unix line endings
  text = text.replace(/\r\n/g, "\n");

  //2. Remove trailing spaces/tabs from each line
  text = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n");

  //3. Collapse 3+ consecutive newlines into 2
  text = text.replace(/\n{3,}/g, "\n\n");
  return text;
}
export function joinPages(pages: string[]): string {
  return pages
    .map((text, i) => (i === 0 ? text : `--- page ${i + 1} ---\n\n${text}`))
    .join("\n\n");
}

export function hasUsableText(pageText: string, min = 100): boolean {
  return pageText.trim().length >= min;
}

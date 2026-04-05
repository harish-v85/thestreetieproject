/** Split markdown on `## ` headings into accordion sections (title + body). */
export function splitHelpSections(markdown: string): { key: string; question: string; body: string }[] {
  const t = markdown.trim();
  if (!t) return [];
  const parts = t.split(/\n(?=## )/);
  const out: { key: string; question: string; body: string }[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;
    const lines = part.split("\n");
    const head = lines[0];
    if (!head.startsWith("## ")) continue;
    const question = head.slice(3).trim();
    const body = lines.slice(1).join("\n").trim();
    out.push({ key: `help-${i}`, question, body });
  }
  return out;
}

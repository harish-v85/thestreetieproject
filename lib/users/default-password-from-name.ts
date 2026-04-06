/**
 * Default initial password: first 4 letters of the first name (letters only), uppercase,
 * padded with X if shorter than 4, then "1234" (8+ characters).
 */
export function defaultPasswordFromFirstName(fullName: string): string {
  const firstWord = fullName.trim().split(/\s+/)[0] ?? "";
  const lettersOnly = firstWord.replace(/[^a-zA-Z]/g, "");
  const four = lettersOnly.slice(0, 4).toUpperCase().padEnd(4, "X");
  return `${four}1234`;
}

/**
 * User-facing hint for Supabase/PostgREST errors. "fetch failed" almost always means
 * the server could not reach Supabase (DNS, timeout, wrong URL, VPN), not RLS.
 */
export function supabaseErrorHint(message: string): string {
  const m = message.toLowerCase();
  const looksLikeNetwork =
    m.includes("fetch failed") ||
    m.includes("network") ||
    m.includes("enotfound") ||
    m.includes("econnrefused") ||
    m.includes("econnreset") ||
    m.includes("etimedout") ||
    m.includes("timeout") ||
    m.includes("getaddrinfo") ||
    m.includes("und_err_connect");

  if (looksLikeNetwork) {
    return "The app could not reach Supabase (network/DNS timeout or wrong URL). Confirm NEXT_PUBLIC_SUPABASE_URL in .env.local matches your project, that the project is not paused, and that your network or VPN allows outbound HTTPS. Then restart npm run dev.";
  }

  return "If Row Level Security is enabled on localities, add a SELECT policy for anon and authenticated roles.";
}

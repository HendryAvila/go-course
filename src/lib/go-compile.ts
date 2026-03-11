// Centralized Go compile API client
// Uses CORS proxy in production, falls back to direct API (works in dev/localhost)

const DIRECT_API = 'https://go.dev/_/compile';

function getCompileUrl(): string {
  // Vite env variable: set VITE_GO_COMPILE_PROXY to your Cloudflare Worker URL
  const proxy = import.meta.env.VITE_GO_COMPILE_PROXY;
  if (proxy) return proxy;
  return DIRECT_API;
}

export interface CompileResult {
  output: string;
  error: boolean;
  corsBlocked: boolean;
}

export async function compileGo(code: string): Promise<CompileResult> {
  const url = getCompileUrl();

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        version: '2',
        body: code,
        withVet: 'true',
      }),
    });

    const data = await resp.json();

    if (data.Errors) {
      return { output: data.Errors, error: true, corsBlocked: false };
    }

    if (data.Events) {
      const output = data.Events.map((e: { Message: string }) => e.Message).join('');
      return { output, error: false, corsBlocked: false };
    }

    return { output: '(sin output)', error: false, corsBlocked: false };
  } catch {
    // If using direct API and it fails (CORS), try to detect
    if (url === DIRECT_API) {
      return { output: '', error: false, corsBlocked: true };
    }
    // If proxy itself fails, report error
    return { output: 'Error de conexión con el servidor de compilación.', error: true, corsBlocked: false };
  }
}

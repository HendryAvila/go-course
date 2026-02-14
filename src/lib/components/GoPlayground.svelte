<script lang="ts">
  interface Props {
    code: string;
    title?: string;
    description?: string;
  }

  let { code, title = 'Go Playground', description = '' }: Props = $props();

  let editorCode = $state(code);
  let output = $state('');
  let running = $state(false);
  let error = $state(false);
  let corsBlocked = $state(false);
  let copied = $state(false);

  async function runCode() {
    running = true;
    output = '';
    error = false;

    try {
      const resp = await fetch('https://go.dev/_/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          version: '2',
          body: editorCode,
          withVet: 'true',
        }),
      });

      const data = await resp.json();

      if (data.Errors) {
        output = data.Errors;
        error = true;
      } else if (data.Events) {
        output = data.Events.map((e: { Message: string }) => e.Message).join('');
      } else {
        output = '(sin output)';
      }
    } catch {
      corsBlocked = true;
    } finally {
      running = false;
    }
  }

  async function copyAndOpen() {
    try {
      await navigator.clipboard.writeText(editorCode);
      copied = true;
      setTimeout(() => copied = false, 3000);
    } catch {
      // clipboard API not available
    }
    window.open('https://go.dev/play/', '_blank');
  }

  function resetCode() {
    editorCode = code;
    output = '';
    error = false;
    corsBlocked = false;
  }
</script>

<div class="card fade-in">
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-2">
      <span class="text-xl">🐹</span>
      <h4 class="font-bold text-sm">{title}</h4>
    </div>
    <div class="flex gap-2">
      <button class="text-xs text-go-muted hover:text-go-text cursor-pointer" onclick={resetCode}>
        Reset
      </button>
    </div>
  </div>

  {#if description}
    <p class="text-sm text-go-muted mb-3">{description}</p>
  {/if}

  <textarea
    bind:value={editorCode}
    class="w-full bg-go-darker border border-go-border rounded-lg p-3 font-mono text-sm text-go-text resize-y min-h-[200px] focus:outline-none focus:border-go-accent transition-colors"
    spellcheck="false"
  ></textarea>

  <div class="flex items-center gap-3 mt-3">
    {#if corsBlocked}
      <button class="btn-primary text-xs" onclick={copyAndOpen}>
        {copied ? '✓ Copiado! Abriendo...' : '📋 Copiar y abrir en Go Playground'}
      </button>
      <span class="text-xs text-go-muted">El código se copia al portapapeles. Pégalo en el editor.</span>
    {:else}
      <button
        class="btn-primary text-xs"
        onclick={runCode}
        disabled={running}
      >
        {running ? '⏳ Ejecutando...' : '▶ Ejecutar'}
      </button>
      <button class="text-xs text-go-muted hover:text-go-accent cursor-pointer" onclick={copyAndOpen}>
        Abrir en Go Playground ↗
      </button>
    {/if}
  </div>

  {#if output}
    <div class="mt-3 rounded-lg p-3 font-mono text-sm {error ? 'bg-go-danger/10 border border-go-danger/30 text-go-danger' : 'bg-go-darker border border-go-border text-go-success'}">
      <p class="text-xs text-go-muted mb-1">{error ? 'Error:' : 'Output:'}</p>
      <pre class="whitespace-pre-wrap">{output}</pre>
    </div>
  {/if}

  {#if corsBlocked && !output}
    <div class="mt-3 rounded-lg p-3 bg-go-warning/10 border border-go-warning/30 text-sm">
      <p class="text-go-warning font-semibold text-xs mb-1">Ejecución directa no disponible</p>
      <p class="text-go-muted text-xs">
        El API de Go Playground no permite peticiones desde este dominio (CORS).
        Usa el botón para copiar el código y ejecutarlo en go.dev/play.
      </p>
    </div>
  {/if}
</div>

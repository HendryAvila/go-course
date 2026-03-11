<script lang="ts">
  import { compileGo } from '$lib/go-compile';

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
  let useIframe = $state(false);
  let copied = $state(false);

  async function runCode() {
    running = true;
    output = '';
    error = false;

    const result = await compileGo(editorCode);

    if (result.corsBlocked) {
      // CORS blocked — switch to iframe mode permanently
      useIframe = true;
      await copyCode();
    } else {
      output = result.output;
      error = result.error;
    }

    running = false;
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(editorCode);
      copied = true;
      setTimeout(() => copied = false, 3000);
    } catch {
      // clipboard API not available
    }
  }

  function resetCode() {
    editorCode = code;
    output = '';
    error = false;
  }

  function openExternal() {
    window.open('https://go.dev/play/', '_blank');
  }
</script>

<div class="card fade-in">
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-2">
      <span class="text-xl">🐹</span>
      <h4 class="font-bold text-sm">{title}</h4>
    </div>
    <div class="flex gap-2">
      {#if useIframe}
        <button class="text-xs text-go-muted hover:text-go-accent cursor-pointer" onclick={copyCode}>
          {copied ? '✓ Copiado!' : '📋 Copiar código'}
        </button>
        <button class="text-xs text-go-muted hover:text-go-text cursor-pointer" onclick={openExternal}>
          ↗ Nueva pestaña
        </button>
      {/if}
      <button class="text-xs text-go-muted hover:text-go-text cursor-pointer" onclick={resetCode}>
        Reset
      </button>
    </div>
  </div>

  {#if description}
    <p class="text-sm text-go-muted mb-3">{description}</p>
  {/if}

  {#if !useIframe}
    <!-- Custom editor mode (works locally / with proxy) -->
    <textarea
      bind:value={editorCode}
      class="w-full bg-go-darker border border-go-border rounded-lg p-3 font-mono text-sm text-go-text resize-y min-h-[200px] focus:outline-none focus:border-go-accent transition-colors"
      spellcheck="false"
    ></textarea>

    <div class="flex items-center gap-3 mt-3">
      <button
        class="btn-primary text-xs"
        onclick={runCode}
        disabled={running}
      >
        {running ? '⏳ Ejecutando...' : '▶ Ejecutar'}
      </button>
      <button class="text-xs text-go-muted hover:text-go-accent cursor-pointer" onclick={openExternal}>
        Abrir en Go Playground ↗
      </button>
    </div>

    {#if output}
      <div class="mt-3 rounded-lg p-3 font-mono text-sm {error ? 'bg-go-danger/10 border border-go-danger/30 text-go-danger' : 'bg-go-darker border border-go-border text-go-success'}">
        <p class="text-xs text-go-muted mb-1">{error ? 'Error:' : 'Output:'}</p>
        <pre class="whitespace-pre-wrap">{output}</pre>
      </div>
    {/if}

  {:else}
    <!-- Iframe mode: embedded Go Playground -->
    <div class="bg-go-darker rounded-lg p-3 mb-3 border border-go-border">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs text-go-accent font-semibold">Tu código (editable)</p>
        <button class="text-xs text-go-muted hover:text-go-accent cursor-pointer" onclick={copyCode}>
          {copied ? '✓ Copiado al clipboard!' : '📋 Copiar para pegar abajo'}
        </button>
      </div>
      <textarea
        bind:value={editorCode}
        class="w-full bg-go-bg border border-go-border rounded p-2 font-mono text-sm text-go-text resize-y min-h-[120px] focus:outline-none focus:border-go-accent transition-colors"
        spellcheck="false"
      ></textarea>
    </div>

    <div class="bg-go-accent/10 border border-go-accent/30 rounded-lg p-3 mb-3 text-sm">
      <p class="text-go-accent font-semibold text-xs mb-1">Pega tu código en el editor del playground y dale Run</p>
      <p class="text-go-muted text-xs">El código ya se copió al clipboard. Si lo modificaste arriba, usa el botón "Copiar" antes de pegar.</p>
    </div>

    <div class="rounded-lg overflow-hidden border border-go-border">
      <iframe
        src="https://go.dev/play/"
        title="Go Playground"
        class="w-full border-0"
        style="height: 400px;"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="lazy"
      ></iframe>
    </div>
  {/if}
</div>

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
    } catch (e) {
      output = 'Error de conexión. Intenta abrir en Go Playground directamente.';
      error = true;
    } finally {
      running = false;
    }
  }

  function openInPlayground() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://go.dev/_/share';
    form.target = '_blank';
    const input = document.createElement('textarea');
    input.name = 'Snippet';
    input.value = editorCode;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  function resetCode() {
    editorCode = code;
    output = '';
    error = false;
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
      <button class="text-xs text-go-muted hover:text-go-accent cursor-pointer" onclick={openInPlayground}>
        Abrir en go.dev ↗
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
    <button
      class="btn-primary text-xs"
      onclick={runCode}
      disabled={running}
    >
      {running ? '⏳ Ejecutando...' : '▶ Ejecutar'}
    </button>
  </div>

  {#if output}
    <div class="mt-3 rounded-lg p-3 font-mono text-sm {error ? 'bg-go-danger/10 border border-go-danger/30 text-go-danger' : 'bg-go-darker border border-go-border text-go-success'}">
      <p class="text-xs text-go-muted mb-1">{error ? 'Error:' : 'Output:'}</p>
      <pre class="whitespace-pre-wrap">{output}</pre>
    </div>
  {/if}
</div>

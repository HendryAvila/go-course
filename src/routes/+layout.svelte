<script lang="ts">
  import '../app.css';
  import { base } from '$app/paths';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { courseStore } from '$lib/stores/course';

  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="border-b border-go-border bg-go-dark/80 backdrop-blur-sm sticky top-0 z-30">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="{base}/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span class="text-2xl">🐹</span>
        <span class="font-black text-sm tracking-wider">GO MASTERY</span>
      </a>
      <div class="flex items-center gap-4">
        <div class="hidden sm:block w-48">
          <ProgressBar />
        </div>
        <div class="flex items-center gap-1">
          <span class="text-xs text-go-muted">{$courseStore.badges.length}</span>
          <span class="text-sm">🏅</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Main content -->
  <main class="flex-1">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="border-t border-go-border py-6 mt-12">
    <div class="max-w-5xl mx-auto px-4 text-center text-sm text-go-muted">
      <p>Go Mastery — Curso interactivo de Go</p>
      <p class="mt-1">Construido con SvelteKit + Tailwind CSS. Powered by Go Playground.</p>
    </div>
  </footer>
</div>

<script lang="ts">
  import type { Source } from '$lib/data/modules';

  interface Props {
    sources: Source[];
  }

  let { sources }: Props = $props();

  let expanded = $state(false);
</script>

<div class="mt-8 border-t border-go-border pt-4">
  <button
    class="flex items-center gap-2 text-go-muted hover:text-go-accent transition-colors cursor-pointer text-sm"
    onclick={() => expanded = !expanded}
  >
    <span class="text-lg">📚</span>
    <span>Fuentes y Referencias ({sources.length})</span>
    <span class="text-xs transition-transform {expanded ? 'rotate-180' : ''}">▼</span>
  </button>

  {#if expanded}
    <ul class="mt-3 space-y-2 slide-in">
      {#each sources as source}
        <li class="flex items-start gap-2 text-sm">
          <span class="text-go-accent mt-0.5">▸</span>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-go-muted hover:text-go-accent transition-colors underline underline-offset-2"
          >
            {source.name}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>

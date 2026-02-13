<script lang="ts">
  interface DragItem {
    id: string;
    label: string;
    description?: string;
  }

  interface DropZone {
    id: string;
    label: string;
    correctItemId: string;
    description?: string;
  }

  interface Props {
    items: DragItem[];
    zones: DropZone[];
    onComplete?: (correct: number, total: number) => void;
    instruction?: string;
  }

  let { items, zones, onComplete, instruction = 'Arrastra cada elemento a su zona correcta' }: Props = $props();

  let placements = $state<Record<string, string | null>>({});
  let availableItems = $state<DragItem[]>([...items]);
  let draggedItem = $state<string | null>(null);
  let checked = $state(false);
  let results = $state<Record<string, boolean>>({});

  function onDragStart(itemId: string) {
    draggedItem = itemId;
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function onDropOnZone(zoneId: string) {
    if (!draggedItem) return;

    const prevZone = Object.entries(placements).find(([, v]) => v === draggedItem)?.[0];
    if (prevZone) {
      placements[prevZone] = null;
    } else {
      availableItems = availableItems.filter(i => i.id !== draggedItem);
    }

    const displaced = placements[zoneId];
    if (displaced) {
      availableItems = [...availableItems, items.find(i => i.id === displaced)!];
    }

    placements[zoneId] = draggedItem;
    draggedItem = null;
  }

  function onDropOnPool() {
    if (!draggedItem) return;
    const prevZone = Object.entries(placements).find(([, v]) => v === draggedItem)?.[0];
    if (prevZone) {
      placements[prevZone] = null;
      const item = items.find(i => i.id === draggedItem);
      if (item) availableItems = [...availableItems, item];
    }
    draggedItem = null;
  }

  function checkAnswers() {
    const newResults: Record<string, boolean> = {};
    let correct = 0;
    for (const zone of zones) {
      const isCorrect = placements[zone.id] === zone.correctItemId;
      newResults[zone.id] = isCorrect;
      if (isCorrect) correct++;
    }
    results = newResults;
    checked = true;
    onComplete?.(correct, zones.length);
  }

  function getItemById(id: string): DragItem | undefined {
    return items.find(i => i.id === id);
  }

  let allPlaced = $derived(zones.every(z => placements[z.id]));
</script>

<div class="card fade-in">
  <div class="flex items-center gap-3 mb-4">
    <span class="text-2xl">🎯</span>
    <p class="text-go-muted text-sm">{instruction}</p>
  </div>

  <!-- Item pool -->
  <div
    class="bg-go-darker rounded-lg p-4 mb-6 min-h-[60px] flex flex-wrap gap-2"
    role="list"
    ondragover={onDragOver}
    ondrop={onDropOnPool}
  >
    {#if availableItems.length === 0 && !checked}
      <span class="text-go-muted text-sm">Todos los elementos colocados</span>
    {/if}
    {#each availableItems as item}
      <div
        class="px-3 py-2 rounded-lg bg-go-card border border-go-accent/30 text-sm cursor-grab active:cursor-grabbing hover:border-go-accent transition-colors"
        draggable="true"
        role="listitem"
        ondragstart={() => onDragStart(item.id)}
      >
        {item.label}
      </div>
    {/each}
  </div>

  <!-- Drop zones -->
  <div class="grid gap-3 sm:grid-cols-2">
    {#each zones as zone}
      <div
        class="rounded-lg border-2 border-dashed p-4 min-h-[80px] transition-all duration-200
          {checked
            ? results[zone.id]
              ? 'border-go-success bg-go-success/5'
              : 'border-go-danger bg-go-danger/5'
            : placements[zone.id]
              ? 'border-go-accent/50 bg-go-accent/5'
              : 'border-go-border'}"
        ondragover={onDragOver}
        ondrop={() => onDropOnZone(zone.id)}
      >
        <p class="text-sm font-semibold mb-2 {checked ? (results[zone.id] ? 'text-go-success' : 'text-go-danger') : 'text-go-muted'}">
          {zone.label}
          {#if checked}
            <span class="ml-1">{results[zone.id] ? '✓' : '✗'}</span>
          {/if}
        </p>
        {#if placements[zone.id]}
          {@const placed = getItemById(placements[zone.id]!)}
          {#if placed}
            <div
              class="px-3 py-2 rounded bg-go-card border border-go-border text-sm {!checked ? 'cursor-grab' : ''}"
              draggable={!checked}
              ondragstart={() => !checked && onDragStart(placed.id)}
            >
              {placed.label}
            </div>
          {/if}
        {:else}
          <p class="text-xs text-go-muted/50 italic">Arrastra aquí</p>
        {/if}
        {#if checked && !results[zone.id]}
          {@const correctItem = getItemById(zone.correctItemId)}
          {#if correctItem}
            <p class="text-xs text-go-success mt-2">Correcto: {correctItem.label}</p>
          {/if}
        {/if}
      </div>
    {/each}
  </div>

  {#if !checked}
    <button
      class="btn-primary mt-6 w-full justify-center"
      onclick={checkAnswers}
      disabled={!allPlaced}
    >
      Verificar Respuestas
    </button>
  {:else}
    <div class="mt-4 text-center">
      <p class="text-go-muted text-sm">
        {Object.values(results).filter(Boolean).length} de {zones.length} correctas
      </p>
    </div>
  {/if}
</div>

<script lang="ts">
  import { progressPercent, courseStore } from '$lib/stores/course';
</script>

<div class="w-full">
  <div class="flex items-center justify-between mb-1">
    <span class="text-xs text-go-muted">Progreso del curso</span>
    <span class="text-xs font-mono text-go-accent">{$progressPercent}%</span>
  </div>
  <div class="w-full bg-go-darker rounded-full h-2">
    <div
      class="bg-go-accent h-2 rounded-full transition-all duration-700"
      style="width: {$progressPercent}%"
    ></div>
  </div>
</div>

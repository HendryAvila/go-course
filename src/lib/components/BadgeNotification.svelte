<script lang="ts">
  import type { Badge } from '$lib/stores/course';

  interface Props {
    badge: Badge;
    onClose?: () => void;
  }

  let { badge, onClose }: Props = $props();

  $effect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 5000);
    return () => clearTimeout(timer);
  });
</script>

<div class="fixed top-4 right-4 z-50 slide-in">
  <div class="bg-go-card border border-go-accent rounded-xl p-4 shadow-xl glow-accent max-w-sm">
    <div class="flex items-start gap-3">
      <span class="text-3xl">{badge.icon}</span>
      <div class="flex-1">
        <p class="text-xs text-go-accent font-semibold uppercase tracking-wider mb-1">Badge Desbloqueado</p>
        <h4 class="font-bold">{badge.name}</h4>
        <p class="text-sm text-go-muted">{badge.description}</p>
      </div>
      <button class="text-go-muted hover:text-go-text cursor-pointer" onclick={onClose}>✕</button>
    </div>
  </div>
</div>

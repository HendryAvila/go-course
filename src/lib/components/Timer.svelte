<script lang="ts">
  interface Props {
    duration: number;
    onTimeUp?: () => void;
    autoStart?: boolean;
    label?: string;
  }

  let { duration, onTimeUp, autoStart = true, label = 'Tiempo restante' }: Props = $props();

  let remaining = $state(duration);
  let running = $state(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  let percent = $derived((remaining / duration) * 100);
  let urgency = $derived(percent > 50 ? 'normal' : percent > 25 ? 'warning' : 'critical');
  let minutes = $derived(Math.floor(remaining / 60));
  let seconds = $derived(remaining % 60);

  function tick() {
    if (remaining > 0) {
      remaining--;
    } else {
      pause();
      onTimeUp?.();
    }
  }

  export function start() {
    if (running) return;
    running = true;
    intervalId = setInterval(tick, 1000);
  }

  export function pause() {
    running = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  export function reset() {
    pause();
    remaining = duration;
  }

  $effect(() => {
    if (autoStart) start();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });
</script>

<div class="card {urgency === 'critical' ? 'pulse-glow border-go-danger' : urgency === 'warning' ? 'border-go-warning' : ''}">
  <div class="flex items-center justify-between mb-2">
    <span class="text-sm text-go-muted">{label}</span>
    <span class="font-mono text-lg font-bold {urgency === 'critical' ? 'text-go-danger' : urgency === 'warning' ? 'text-go-warning' : 'text-go-accent'}">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  </div>
  <div class="w-full bg-go-darker rounded-full h-2">
    <div
      class="h-2 rounded-full transition-all duration-1000 {urgency === 'critical' ? 'bg-go-danger' : urgency === 'warning' ? 'bg-go-warning' : 'bg-go-accent'}"
      style="width: {percent}%"
    ></div>
  </div>
</div>

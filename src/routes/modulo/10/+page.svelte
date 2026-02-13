<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import BranchingScenario from '$lib/components/BranchingScenario.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';

  const mod = modules.find(m => m.id === 10)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'gopher-concurrente')!);
  let moduleCompleted = $state(false);

  courseStore.startModule(10);

  const goroutineCode = `package main

import (
\t"fmt"
\t"time"
)

func saludar(nombre string, ch chan string) {
\t// Simula trabajo
\ttime.Sleep(100 * time.Millisecond)
\tch <- fmt.Sprintf("Hola, %s!", nombre)
}

func main() {
\t// Crear un channel de strings
\tch := make(chan string)

\t// Lanzar goroutines
\tgo saludar("Gopher", ch)
\tgo saludar("Mundo", ch)

\t// Recibir resultados
\tmsg1 := <-ch
\tmsg2 := <-ch

\tfmt.Println(msg1)
\tfmt.Println(msg2)
\tfmt.Println("Ambas goroutines terminaron")
}`;

  const scenarioNodes: Record<string, any> = {
    start: {
      id: 'start',
      narrative: 'Estás diseñando un servicio que debe procesar 1000 imágenes. Cada imagen toma ~200ms en procesarse. El cliente espera una respuesta en menos de 5 segundos. ¿Cómo diseñas el procesamiento?',
      choices: [
        {
          text: 'Procesar las 1000 imágenes secuencialmente en un loop',
          nextId: 'sequential',
          points: 0,
          feedback: 'Secuencialmente tomaría 1000 x 200ms = 200 segundos. Muy lejos del objetivo de 5 segundos.',
        },
        {
          text: 'Lanzar 1000 goroutines, una por imagen, y usar un channel para recoger resultados',
          nextId: 'many-goroutines',
          points: 2,
          feedback: 'Buena idea usar goroutines, pero ¿1000 a la vez? Funciona porque son livianas (~2KB), pero podría saturar otros recursos (CPU, memoria de las imágenes).',
        },
        {
          text: 'Crear un worker pool con N goroutines y un channel de jobs',
          nextId: 'worker-pool',
          points: 3,
          feedback: '¡Excelente! Un worker pool te da concurrencia controlada. Puedes ajustar N según los recursos disponibles.',
        },
      ],
    },
    sequential: {
      id: 'sequential',
      narrative: 'El procesamiento secuencial tarda 200 segundos. Tu líder técnico te dice que uses concurrencia. ¿Qué tipo de channel usas para enviar las imágenes a las goroutines?',
      choices: [
        {
          text: 'Un channel unbuffered: make(chan Image)',
          nextId: 'unbuffered-choice',
          points: 1,
          feedback: 'Unbuffered funciona, pero cada envío bloquea hasta que una goroutine esté lista para recibir. Puede ser un cuello de botella.',
        },
        {
          text: 'Un channel buffered: make(chan Image, 100)',
          nextId: 'buffered-choice',
          points: 2,
          feedback: '¡Bien! Un buffer permite que el productor envíe varias imágenes sin esperar a que cada worker esté listo.',
        },
      ],
    },
    'many-goroutines': {
      id: 'many-goroutines',
      narrative: 'Lanzaste 1000 goroutines. El procesamiento es rápido pero notas que el uso de memoria se dispara porque cada imagen ocupa 5MB en memoria. ¿Cómo limitas la concurrencia?',
      choices: [
        {
          text: 'Usar un buffered channel como semáforo: sem := make(chan struct{}, 50)',
          nextId: 'semaphore',
          points: 3,
          feedback: '¡Perfecto! Un buffered channel como semáforo es idiomático en Go. Limitas a 50 goroutines activas simultáneamente.',
        },
        {
          text: 'Agregar un time.Sleep entre cada lanzamiento de goroutine',
          nextId: 'sleep-bad',
          points: 0,
          feedback: 'time.Sleep no es un mecanismo de control de concurrencia fiable. No garantiza nada sobre cuántas goroutines están activas.',
        },
      ],
    },
    'worker-pool': {
      id: 'worker-pool',
      narrative: 'Excelente decisión. Tienes un pool de workers. Ahora necesitas esperar a que TODAS las imágenes se procesen antes de responder al cliente. ¿Cómo sincronizas?',
      choices: [
        {
          text: 'Cerrar el channel de resultados y usar range para leer todos',
          nextId: 'close-range',
          points: 2,
          feedback: 'Cerrar el channel y usar range es idiomático. Pero necesitas coordinar CUÁNDO cerrar el channel (cuando todos los workers terminen).',
        },
        {
          text: 'Usar select con un channel de "done" y contar resultados',
          nextId: 'select-done',
          points: 3,
          feedback: '¡Muy bien! select te permite multiplexar: escuchar resultados, detectar cuando todos terminaron, e incluso agregar un timeout.',
        },
      ],
    },
    'unbuffered-choice': {
      id: 'unbuffered-choice',
      outcome: {
        title: 'Concurrencia Básica',
        description: 'Entiendes los conceptos básicos pero necesitas profundizar en patrones de concurrencia y elección de channel types.',
        score: 1,
        maxScore: 8,
        grade: 'needs-work' as const,
        lessons: [
          'Los channels unbuffered son síncronos: bloquean hasta que ambos lados están listos',
          'Los buffered channels permiten desacoplar productor y consumidor',
          'Un worker pool es mejor que lanzar una goroutine por tarea cuando hay recursos limitados',
          'Siempre considera el uso de memoria al elegir nivel de concurrencia',
        ],
      },
    },
    'buffered-choice': {
      id: 'buffered-choice',
      outcome: {
        title: 'Buen Manejo de Channels',
        description: 'Comprendes la diferencia entre buffered y unbuffered channels y cuándo usar cada uno.',
        score: 2,
        maxScore: 8,
        grade: 'good' as const,
        lessons: [
          'Buffered channels son útiles cuando el productor es más rápido que los consumidores',
          'El tamaño del buffer debe elegirse según el caso de uso',
          'Combinar worker pools con buffered channels es un patrón muy común',
          'select permite agregar timeouts para no esperar indefinidamente',
        ],
      },
    },
    semaphore: {
      id: 'semaphore',
      outcome: {
        title: 'Patrón Semáforo Dominado',
        description: 'Excelente comprensión de patrones avanzados de concurrencia. El semáforo con buffered channel es idiomático Go.',
        score: 3,
        maxScore: 8,
        grade: 'excellent' as const,
        lessons: [
          'Un buffered channel como semáforo es un patrón idiomático de Go',
          'Controlar la concurrencia previene el agotamiento de recursos',
          'Las goroutines son baratas pero los recursos que usan no siempre lo son',
          'Siempre piensa en el recurso limitante: CPU, memoria, conexiones de red',
        ],
      },
    },
    'sleep-bad': {
      id: 'sleep-bad',
      outcome: {
        title: 'Evita time.Sleep para Control',
        description: 'time.Sleep no es un mecanismo de sincronización. Usa channels, WaitGroups o semáforos.',
        score: 0,
        maxScore: 8,
        grade: 'critical' as const,
        lessons: [
          'NUNCA uses time.Sleep para sincronizar goroutines',
          'Los channels son el mecanismo correcto de comunicación en Go',
          'Un buffered channel como semáforo controla la concurrencia de forma segura',
          '"Don\'t communicate by sharing memory; share memory by communicating"',
        ],
      },
    },
    'close-range': {
      id: 'close-range',
      outcome: {
        title: 'Buen Uso de Channels',
        description: 'Cerrar channels y usar range es idiomático. Combínalo con WaitGroup para saber cuándo cerrar.',
        score: 2,
        maxScore: 8,
        grade: 'good' as const,
        lessons: [
          'close(ch) señala que no se enviarán más valores por el channel',
          'range sobre un channel itera hasta que se cierra',
          'Usa sync.WaitGroup para saber cuándo todos los workers terminaron',
          'Nunca cierres un channel desde el lado receptor',
        ],
      },
    },
    'select-done': {
      id: 'select-done',
      outcome: {
        title: 'Arquitecto de Concurrencia',
        description: 'Dominas select, channels y patrones de sincronización. Estás listo para diseñar sistemas concurrentes robustos.',
        score: 3,
        maxScore: 8,
        grade: 'excellent' as const,
        lessons: [
          'select permite escuchar múltiples channels simultáneamente',
          'Siempre agrega un caso de timeout o cancelación con context',
          'Un worker pool + select + context es la combinación más robusta',
          'El patrón fan-out/fan-in se construye sobre estos primitivos',
        ],
      },
    },
  };

  function handleScenarioComplete(score: number, maxScore: number) {
    courseStore.completeModule(10, score, maxScore);
    courseStore.unlockBadge('gopher-concurrente');
    showBadge = true;
    moduleCompleted = true;
  }
</script>

<svelte:head>
  <title>{mod.title} | Curso de Go</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
  <div class="mb-8">
    <span class="text-4xl">{mod.icon}</span>
    <h1 class="text-3xl font-bold mt-2">{mod.title}</h1>
    <p class="text-go-muted mt-1">{mod.subtitle}</p>
  </div>

  <!-- Filosofía de concurrencia -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">La Filosofía de Concurrencia de Go</h2>
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-accent mb-4">
      <p class="text-go-accent font-semibold italic">
        "Don't communicate by sharing memory; share memory by communicating."
      </p>
      <p class="text-go-muted text-sm mt-1">- Rob Pike</p>
    </div>
    <p class="text-go-muted leading-relaxed">
      En la mayoría de lenguajes, la concurrencia se basa en <strong class="text-go-text">compartir memoria</strong>
      protegida con locks. Go invierte el modelo: las goroutines se comunican enviando datos a través de
      <strong class="text-go-accent">channels</strong>, evitando la complejidad de locks y memoria compartida.
    </p>
  </section>

  <!-- Goroutines -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Goroutines</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Una goroutine es una <strong class="text-go-text">función que se ejecuta concurrentemente</strong>.
      Se lanza con la keyword <code class="text-go-accent">go</code>. Son extremadamente livianas:
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Goroutine</p>
        <p class="text-go-muted text-sm">~2KB de stack inicial. Administrada por el runtime de Go.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-warning font-semibold text-sm">OS Thread</p>
        <p class="text-go-muted text-sm">~1MB de stack fijo. Administrado por el sistema operativo.</p>
      </div>
    </div>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Lanzar una goroutine es así de simple:</span>
<span class="text-go-accent">go</span> miFuncion()          <span class="text-go-muted">// Se ejecuta concurrentemente</span>
<span class="text-go-accent">go</span> <span class="text-go-accent">func</span>() {              <span class="text-go-muted">// Goroutine con función anónima</span>
    fmt.Println(<span class="text-go-success">"Hola desde goroutine"</span>)
}()

<span class="text-go-muted">// Puedes lanzar miles sin problema:</span>
<span class="text-go-accent">for</span> i := 0; i &lt; 10000; i++ {
    <span class="text-go-accent">go</span> procesarTarea(i)
}</code></pre>`}
  </section>

  <!-- Channels -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Channels</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Los channels son <strong class="text-go-text">conductos tipados</strong> que permiten enviar y recibir valores
      entre goroutines de forma segura.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Crear channels</span>
ch := <span class="text-go-accent">make</span>(<span class="text-go-accent">chan</span> <span class="text-go-accent">int</span>)       <span class="text-go-muted">// Unbuffered (síncrono)</span>
bch := <span class="text-go-accent">make</span>(<span class="text-go-accent">chan</span> <span class="text-go-accent">int</span>, 10)  <span class="text-go-muted">// Buffered (capacidad 10)</span>

<span class="text-go-muted">// Enviar al channel</span>
ch <span class="text-go-accent">&lt;-</span> 42                   <span class="text-go-muted">// Envía el valor 42</span>

<span class="text-go-muted">// Recibir del channel</span>
valor := <span class="text-go-accent">&lt;-</span>ch              <span class="text-go-muted">// Espera y recibe un valor</span>

<span class="text-go-muted">// Cerrar un channel</span>
<span class="text-go-accent">close</span>(ch)                   <span class="text-go-muted">// Señala que no se enviarán más datos</span>

<span class="text-go-muted">// Iterar hasta que se cierre</span>
<span class="text-go-accent">for</span> val := <span class="text-go-accent">range</span> ch {
    fmt.Println(val)
}</code></pre>`}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Unbuffered</p>
        <p class="text-go-muted text-sm">Síncrono: el emisor bloquea hasta que el receptor está listo. Garantiza sincronización.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-warning font-semibold text-sm">Buffered</p>
        <p class="text-go-muted text-sm">Asíncrono hasta llenar el buffer. El emisor solo bloquea si el buffer está lleno.</p>
      </div>
    </div>
  </section>

  <!-- Select -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Select: Multiplexar Channels</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      <code class="text-go-accent">select</code> permite esperar en múltiples operaciones de channel simultáneamente.
      Es como un <code class="text-go-accent">switch</code> pero para channels.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">select</span> {
<span class="text-go-accent">case</span> msg := <span class="text-go-accent">&lt;-</span>ch1:
    fmt.Println(<span class="text-go-success">"Recibido de ch1:"</span>, msg)
<span class="text-go-accent">case</span> msg := <span class="text-go-accent">&lt;-</span>ch2:
    fmt.Println(<span class="text-go-success">"Recibido de ch2:"</span>, msg)
<span class="text-go-accent">case</span> ch3 <span class="text-go-accent">&lt;-</span> <span class="text-go-success">"hola"</span>:
    fmt.Println(<span class="text-go-success">"Enviado a ch3"</span>)
<span class="text-go-accent">default</span>:
    fmt.Println(<span class="text-go-success">"Ningún channel listo"</span>) <span class="text-go-muted">// Non-blocking</span>
}</code></pre>`}
  </section>

  <!-- GoPlayground -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Experimenta: Goroutines + Channels</h2>
    <p class="text-go-muted mb-4">
      Este ejemplo lanza dos goroutines que envían saludos por un channel. Prueba modificar el código:
      agrega más goroutines, cambia los mensajes, o agrega un <code class="text-go-accent">select</code> con timeout.
    </p>
    <GoPlayground
      code={goroutineCode}
      title="Goroutines y Channels"
      description="Lanza goroutines y comunícalas con channels. Modifica el código y experimenta."
    />
  </section>

  <!-- BranchingScenario -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Escenario: Diseño de Sistema Concurrente</h2>
    <p class="text-go-muted mb-4">
      Toma decisiones de diseño para un sistema concurrente real. Cada decisión afecta el resultado final.
    </p>
    <BranchingScenario
      nodes={scenarioNodes}
      startId="start"
      title="Procesador de Imágenes Concurrente"
      onComplete={handleScenarioComplete}
    />
  </section>

  {#if moduleCompleted}
    <div class="card mb-6 border-go-success/30 bg-go-success/5">
      <div class="text-center">
        <span class="text-4xl">&#9889;</span>
        <h3 class="text-xl font-bold text-go-success mt-2">Módulo Completado</h3>
        <p class="text-go-muted mt-1">Desbloqueaste la insignia Gopher Concurrente</p>
      </div>
    </div>
  {/if}

  <SourcesSection sources={mod.sources} />
  <ModuleNav currentModule={10} />
</div>

<VocabularyFloat moduleId={10} />

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

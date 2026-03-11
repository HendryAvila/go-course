<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';
  import WorkedExample from '$lib/components/WorkedExample.svelte';
  import CodeChallenge from '$lib/components/CodeChallenge.svelte';
  import ReviewCards from '$lib/components/ReviewCards.svelte';
  import BranchingScenario from '$lib/components/BranchingScenario.svelte';
  import { exercises, workedExamples } from '$lib/data/exercises/module-10';
  import { reviewCards } from '$lib/data/exercises/review-cards';

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
      narrative: 'Estas disenando un servicio que debe procesar 1000 imagenes. Cada imagen toma ~200ms en procesarse. El cliente espera una respuesta en menos de 5 segundos. Como disenas el procesamiento?',
      choices: [
        {
          text: 'Procesar las 1000 imagenes secuencialmente en un loop',
          nextId: 'sequential',
          points: 0,
          feedback: 'Secuencialmente tomaria 1000 x 200ms = 200 segundos. Muy lejos del objetivo de 5 segundos.',
        },
        {
          text: 'Lanzar 1000 goroutines, una por imagen, y usar un channel para recoger resultados',
          nextId: 'many-goroutines',
          points: 2,
          feedback: 'Buena idea usar goroutines, pero 1000 a la vez? Funciona porque son livianas (~2KB), pero podria saturar otros recursos (CPU, memoria de las imagenes).',
        },
        {
          text: 'Crear un worker pool con N goroutines y un channel de jobs',
          nextId: 'worker-pool',
          points: 3,
          feedback: 'Excelente! Un worker pool te da concurrencia controlada. Puedes ajustar N segun los recursos disponibles.',
        },
      ],
    },
    sequential: {
      id: 'sequential',
      narrative: 'El procesamiento secuencial tarda 200 segundos. Tu lider tecnico te dice que uses concurrencia. Que tipo de channel usas para enviar las imagenes a las goroutines?',
      choices: [
        {
          text: 'Un channel unbuffered: make(chan Image)',
          nextId: 'unbuffered-choice',
          points: 1,
          feedback: 'Unbuffered funciona, pero cada envio bloquea hasta que una goroutine este lista para recibir. Puede ser un cuello de botella.',
        },
        {
          text: 'Un channel buffered: make(chan Image, 100)',
          nextId: 'buffered-choice',
          points: 2,
          feedback: 'Bien! Un buffer permite que el productor envie varias imagenes sin esperar a que cada worker este listo.',
        },
      ],
    },
    'many-goroutines': {
      id: 'many-goroutines',
      narrative: 'Lanzaste 1000 goroutines. El procesamiento es rapido pero notas que el uso de memoria se dispara porque cada imagen ocupa 5MB en memoria. Como limitas la concurrencia?',
      choices: [
        {
          text: 'Usar un buffered channel como semaforo: sem := make(chan struct{}, 50)',
          nextId: 'semaphore',
          points: 3,
          feedback: 'Perfecto! Un buffered channel como semaforo es idiomatico en Go. Limitas a 50 goroutines activas simultaneamente.',
        },
        {
          text: 'Agregar un time.Sleep entre cada lanzamiento de goroutine',
          nextId: 'sleep-bad',
          points: 0,
          feedback: 'time.Sleep no es un mecanismo de control de concurrencia fiable. No garantiza nada sobre cuantas goroutines estan activas.',
        },
      ],
    },
    'worker-pool': {
      id: 'worker-pool',
      narrative: 'Excelente decision. Tienes un pool de workers. Ahora necesitas esperar a que TODAS las imagenes se procesen antes de responder al cliente. Como sincronizas?',
      choices: [
        {
          text: 'Cerrar el channel de resultados y usar range para leer todos',
          nextId: 'close-range',
          points: 2,
          feedback: 'Cerrar el channel y usar range es idiomatico. Pero necesitas coordinar CUANDO cerrar el channel (cuando todos los workers terminen).',
        },
        {
          text: 'Usar select con un channel de "done" y contar resultados',
          nextId: 'select-done',
          points: 3,
          feedback: 'Muy bien! select te permite multiplexar: escuchar resultados, detectar cuando todos terminaron, e incluso agregar un timeout.',
        },
      ],
    },
    'unbuffered-choice': {
      id: 'unbuffered-choice',
      outcome: {
        title: 'Concurrencia Basica',
        description: 'Entiendes los conceptos basicos pero necesitas profundizar en patrones de concurrencia y eleccion de channel types.',
        score: 1,
        maxScore: 8,
        grade: 'needs-work' as const,
        lessons: [
          'Los channels unbuffered son sincronos: bloquean hasta que ambos lados estan listos',
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
        description: 'Comprendes la diferencia entre buffered y unbuffered channels y cuando usar cada uno.',
        score: 2,
        maxScore: 8,
        grade: 'good' as const,
        lessons: [
          'Buffered channels son utiles cuando el productor es mas rapido que los consumidores',
          'El tamano del buffer debe elegirse segun el caso de uso',
          'Combinar worker pools con buffered channels es un patron muy comun',
          'select permite agregar timeouts para no esperar indefinidamente',
        ],
      },
    },
    semaphore: {
      id: 'semaphore',
      outcome: {
        title: 'Patron Semaforo Dominado',
        description: 'Excelente comprension de patrones avanzados de concurrencia. El semaforo con buffered channel es idiomatico Go.',
        score: 3,
        maxScore: 8,
        grade: 'excellent' as const,
        lessons: [
          'Un buffered channel como semaforo es un patron idiomatico de Go',
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
        description: 'time.Sleep no es un mecanismo de sincronizacion. Usa channels, WaitGroups o semaforos.',
        score: 0,
        maxScore: 8,
        grade: 'critical' as const,
        lessons: [
          'NUNCA uses time.Sleep para sincronizar goroutines',
          'Los channels son el mecanismo correcto de comunicacion en Go',
          'Un buffered channel como semaforo controla la concurrencia de forma segura',
          '"Don\'t communicate by sharing memory; share memory by communicating"',
        ],
      },
    },
    'close-range': {
      id: 'close-range',
      outcome: {
        title: 'Buen Uso de Channels',
        description: 'Cerrar channels y usar range es idiomatico. Combinalo con WaitGroup para saber cuando cerrar.',
        score: 2,
        maxScore: 8,
        grade: 'good' as const,
        lessons: [
          'close(ch) senala que no se enviaran mas valores por el channel',
          'range sobre un channel itera hasta que se cierra',
          'Usa sync.WaitGroup para saber cuando todos los workers terminaron',
          'Nunca cierres un channel desde el lado receptor',
        ],
      },
    },
    'select-done': {
      id: 'select-done',
      outcome: {
        title: 'Arquitecto de Concurrencia',
        description: 'Dominas select, channels y patrones de sincronizacion. Estas listo para disenar sistemas concurrentes robustos.',
        score: 3,
        maxScore: 8,
        grade: 'excellent' as const,
        lessons: [
          'select permite escuchar multiples channels simultaneamente',
          'Siempre agrega un caso de timeout o cancelacion con context',
          'Un worker pool + select + context es la combinacion mas robusta',
          'El patron fan-out/fan-in se construye sobre estos primitivos',
        ],
      },
    },
  };

  const quizQuestions = [
    {
      question: 'Que imprime este codigo?\n\nch := make(chan int)\ngo func() { ch <- 42 }()\nfmt.Println(<-ch)',
      options: [
        { text: '42', correct: true, explanation: 'Correcto! La goroutine envia 42 al canal, y main lo recibe con <-ch. El canal unbuffered sincroniza ambos lados.' },
        { text: 'Deadlock', correct: false, explanation: 'No hay deadlock porque la goroutine envia mientras main espera recibir.' },
        { text: '0', correct: false, explanation: 'El canal recibe el valor 42 enviado por la goroutine, no el zero value.' },
        { text: 'Nada, main termina antes', correct: false, explanation: '<-ch bloquea hasta recibir un valor, asi que main espera a la goroutine.' },
      ],
    },
    {
      question: 'Que causa un deadlock en Go?',
      options: [
        { text: 'Usar demasiadas goroutines', correct: false, explanation: 'Go puede manejar millones de goroutines. El deadlock no depende de la cantidad.' },
        { text: 'Cuando todas las goroutines estan bloqueadas esperando y ninguna puede avanzar', correct: true, explanation: 'Correcto! Un deadlock ocurre cuando todas las goroutines (incluyendo main) estan bloqueadas. Ejemplo: enviar a un canal unbuffered sin receptor.' },
        { text: 'Cuando un canal se llena', correct: false, explanation: 'Un canal buffered lleno bloquea el envio, pero eso no es deadlock si hay otra goroutine que pueda recibir.' },
        { text: 'Cuando cierras un canal dos veces', correct: false, explanation: 'Cerrar un canal dos veces causa panic, no deadlock.' },
      ],
    },
    {
      question: 'Cual es la diferencia entre un canal buffered y uno unbuffered?',
      options: [
        { text: 'No hay diferencia practica', correct: false, explanation: 'La diferencia es fundamental: el unbuffered sincroniza sender y receiver.' },
        { text: 'Unbuffered bloquea al sender hasta que alguien reciba; buffered solo bloquea cuando esta lleno', correct: true, explanation: 'Correcto! make(chan int) es sincrono, make(chan int, 5) permite enviar hasta 5 valores sin bloquear.' },
        { text: 'Buffered es mas rapido siempre', correct: false, explanation: 'Depende del caso. Unbuffered garantiza sincronizacion que a veces es necesaria.' },
        { text: 'Solo se pueden cerrar los canales buffered', correct: false, explanation: 'Ambos tipos de canales se pueden cerrar con close().' },
      ],
    },
    {
      question: 'Que hace select cuando multiples cases estan listos simultaneamente?',
      options: [
        { text: 'Ejecuta el primero en orden de aparicion', correct: false, explanation: 'Go NO garantiza orden en select. Elige al azar para evitar starvation.' },
        { text: 'Ejecuta todos los cases listos', correct: false, explanation: 'Solo ejecuta UNO de los cases, no todos.' },
        { text: 'Elige uno al azar para evitar favorecer un canal sobre otro', correct: true, explanation: 'Correcto! La seleccion aleatoria previene que un canal siempre tenga prioridad (starvation).' },
        { text: 'Devuelve un error', correct: false, explanation: 'select no devuelve errores. Simplemente elige un case y lo ejecuta.' },
      ],
    },
    {
      question: 'Que pasa al recibir de un canal cerrado?',
      options: [
        { text: 'Panic inmediato', correct: false, explanation: 'Recibir de un canal cerrado NO causa panic. Enviar a uno cerrado si causa panic.' },
        { text: 'Se bloquea para siempre', correct: false, explanation: 'Un canal cerrado retorna inmediatamente el zero value.' },
        { text: 'Retorna el zero value del tipo inmediatamente (y false en el segundo valor)', correct: true, explanation: 'Correcto! <-ch retorna ("", false) para chan string cerrado. Esto es clave: ENVIAR a un canal cerrado causa panic, pero recibir es seguro.' },
        { text: 'Retorna nil', correct: false, explanation: 'Retorna el zero value del tipo del canal, no nil (a menos que sea un canal de punteros).' },
      ],
    },
  ];

  function handleScenarioComplete(score: number, maxScore: number) {
    courseStore.completeModule(10, score, maxScore);
    courseStore.unlockBadge('gopher-concurrente');
    showBadge = true;
    moduleCompleted = true;
  }

  function handleQuizComplete(score: number, total: number) {
    if (!moduleCompleted) {
      courseStore.completeModule(10, score, total);
    }
    if (score >= 3) {
      courseStore.unlockBadge('gopher-concurrente');
      showBadge = true;
    }
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

  <!-- Repaso Espaciado -->
  <ReviewCards moduleId={10} cards={reviewCards} />

  <!-- Filosofia de concurrencia -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">La Filosofia de Concurrencia de Go</h2>
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-accent mb-4">
      <p class="text-go-accent font-semibold italic">
        "Don't communicate by sharing memory; share memory by communicating."
      </p>
      <p class="text-go-muted text-sm mt-1">- Rob Pike</p>
    </div>
    <p class="text-go-muted leading-relaxed mb-4">
      En la mayoria de lenguajes, la concurrencia se basa en <strong class="text-go-text">compartir memoria</strong>
      protegida con locks. Go invierte el modelo: las goroutines se comunican enviando datos a traves de
      <strong class="text-go-accent">channels</strong>, evitando la complejidad de locks y memoria compartida.
    </p>
    <p class="text-go-muted leading-relaxed">
      Go usa un modelo <strong class="text-go-text">M:N</strong> de scheduling: M goroutines se mapean a N threads del OS.
      El runtime de Go gestiona este mapeo automaticamente, multiplicando las goroutines en los threads disponibles.
      Esto significa que puedes lanzar miles de goroutines sin crear miles de threads.
    </p>
  </section>

  <!-- Goroutines -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Goroutines</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Una goroutine es una <strong class="text-go-text">funcion que se ejecuta concurrentemente</strong>.
      Se lanza con la keyword <code class="text-go-accent">go</code>. Son extremadamente livianas:
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Goroutine</p>
        <p class="text-go-muted text-sm">~2KB de stack inicial. Administrada por el runtime de Go. El stack crece dinamicamente.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-warning font-semibold text-sm">OS Thread</p>
        <p class="text-go-muted text-sm">~1MB de stack fijo. Administrado por el sistema operativo. Context switch costoso.</p>
      </div>
    </div>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Lanzar una goroutine es asi de simple:</span>
<span class="text-go-accent">go</span> miFuncion()          <span class="text-go-muted">// Se ejecuta concurrentemente</span>
<span class="text-go-accent">go</span> <span class="text-go-accent">func</span>() {              <span class="text-go-muted">// Goroutine con funcion anonima</span>
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
      entre goroutines de forma segura. Son la pieza fundamental de la concurrencia en Go.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Crear channels</span>
ch := <span class="text-go-accent">make</span>(<span class="text-go-accent">chan</span> <span class="text-go-accent">int</span>)       <span class="text-go-muted">// Unbuffered (sincrono)</span>
bch := <span class="text-go-accent">make</span>(<span class="text-go-accent">chan</span> <span class="text-go-accent">int</span>, 10)  <span class="text-go-muted">// Buffered (capacidad 10)</span>

<span class="text-go-muted">// Enviar al channel</span>
ch <span class="text-go-accent">&lt;-</span> 42                   <span class="text-go-muted">// Envia el valor 42</span>

<span class="text-go-muted">// Recibir del channel</span>
valor := <span class="text-go-accent">&lt;-</span>ch              <span class="text-go-muted">// Espera y recibe un valor</span>

<span class="text-go-muted">// Direcciones de channel</span>
<span class="text-go-accent">func</span> enviar(ch <span class="text-go-accent">chan&lt;-</span> <span class="text-go-accent">int</span>)   <span class="text-go-muted">// Solo puede enviar</span>
<span class="text-go-accent">func</span> recibir(ch <span class="text-go-accent">&lt;-chan</span> <span class="text-go-accent">int</span>) <span class="text-go-muted">// Solo puede recibir</span>

<span class="text-go-muted">// Cerrar un channel</span>
<span class="text-go-accent">close</span>(ch)                   <span class="text-go-muted">// Senala que no se enviaran mas datos</span>

<span class="text-go-muted">// Iterar hasta que se cierre</span>
<span class="text-go-accent">for</span> val := <span class="text-go-accent">range</span> ch {
    fmt.Println(val)
}</code></pre>`}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Unbuffered</p>
        <p class="text-go-muted text-sm">Sincrono: el emisor bloquea hasta que el receptor esta listo. Garantiza sincronizacion entre goroutines.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-warning font-semibold text-sm">Buffered</p>
        <p class="text-go-muted text-sm">Asincrono hasta llenar el buffer. El emisor solo bloquea si el buffer esta lleno. Ideal para desacoplar productor/consumidor.</p>
      </div>
    </div>
  </section>

  <!-- Deadlocks -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Deadlocks</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Un <strong class="text-go-text">deadlock</strong> ocurre cuando todas las goroutines estan bloqueadas esperando
      y ninguna puede avanzar. Go detecta esto y termina el programa con
      <code class="text-go-accent">fatal error: all goroutines are asleep - deadlock!</code>
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// DEADLOCK: main envia pero nadie recibe</span>
ch := <span class="text-go-accent">make</span>(<span class="text-go-accent">chan</span> <span class="text-go-accent">int</span>)
ch <span class="text-go-accent">&lt;-</span> 42  <span class="text-go-muted">// Bloquea para siempre: no hay goroutine que reciba</span>

<span class="text-go-muted">// SOLUCION: lanzar receptor en goroutine</span>
ch := <span class="text-go-accent">make</span>(<span class="text-go-accent">chan</span> <span class="text-go-accent">int</span>)
<span class="text-go-accent">go func</span>() { ch <span class="text-go-accent">&lt;-</span> 42 }()
fmt.Println(<span class="text-go-accent">&lt;-</span>ch) <span class="text-go-muted">// 42</span></code></pre>`}
  </section>

  <!-- Select -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Select: Multiplexar Channels</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      <code class="text-go-accent">select</code> permite esperar en multiples operaciones de channel simultaneamente.
      Es como un <code class="text-go-accent">switch</code> pero para channels. Si multiples cases estan listos, elige uno
      al azar.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">select</span> {
<span class="text-go-accent">case</span> msg := <span class="text-go-accent">&lt;-</span>ch1:
    fmt.Println(<span class="text-go-success">"Recibido de ch1:"</span>, msg)
<span class="text-go-accent">case</span> msg := <span class="text-go-accent">&lt;-</span>ch2:
    fmt.Println(<span class="text-go-success">"Recibido de ch2:"</span>, msg)
<span class="text-go-accent">case</span> <span class="text-go-accent">&lt;-</span>time.After(1 * time.Second):
    fmt.Println(<span class="text-go-success">"Timeout!"</span>)       <span class="text-go-muted">// Patron de timeout</span>
<span class="text-go-accent">default</span>:
    fmt.Println(<span class="text-go-success">"Ningun channel listo"</span>) <span class="text-go-muted">// Non-blocking</span>
}</code></pre>`}
  </section>

  <!-- Worked Examples -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Ejemplos Paso a Paso</h2>
    <p class="text-go-muted mb-4">
      Sigue cada ejemplo paso a paso. Los conceptos se construyen progresivamente.
    </p>
    <div class="space-y-6">
      {#each workedExamples as we}
        <WorkedExample title={we.title} description={we.description} steps={we.steps} playground={we.playground} playgroundCode={we.playgroundCode} />
      {/each}
    </div>
  </section>

  <!-- GoPlayground -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Experimenta: Goroutines + Channels</h2>
    <p class="text-go-muted mb-4">
      Este ejemplo lanza dos goroutines que envian saludos por un channel. Prueba modificar el codigo:
      agrega mas goroutines, cambia los mensajes, o agrega un <code class="text-go-accent">select</code> con timeout.
    </p>
    <GoPlayground
      code={goroutineCode}
      title="Goroutines y Channels"
      description="Lanza goroutines y comunicalas con channels. Modifica el codigo y experimenta."
    />
  </section>

  <!-- Code Challenges -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Desafios de Codigo</h2>
    <p class="text-go-muted mb-4">
      Pon a prueba tu comprension de goroutines, channels y select con estos ejercicios progresivos.
    </p>
    <div class="space-y-6">
      {#each exercises as exercise}
        <CodeChallenge {exercise} onComplete={(id, score, hints) => courseStore.completeExercise(id, score, hints)} />
      {/each}
    </div>
  </section>

  <!-- BranchingScenario -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Escenario: Diseno de Sistema Concurrente</h2>
    <p class="text-go-muted mb-4">
      Toma decisiones de diseno para un sistema concurrente real. Cada decision afecta el resultado final.
    </p>
    <BranchingScenario
      nodes={scenarioNodes}
      startId="start"
      title="Procesador de Imagenes Concurrente"
      onComplete={handleScenarioComplete}
    />
  </section>

  <!-- Quiz -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Quiz: Concurrencia en Go</h2>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  {#if moduleCompleted}
    <div class="card mb-6 border-go-success/30 bg-go-success/5">
      <div class="text-center">
        <span class="text-4xl">&#9889;</span>
        <h3 class="text-xl font-bold text-go-success mt-2">Modulo Completado</h3>
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

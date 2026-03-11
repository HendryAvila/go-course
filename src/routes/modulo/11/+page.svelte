<script lang="ts">
  import { courseStore } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import WorkedExample from '$lib/components/WorkedExample.svelte';
  import CodeChallenge from '$lib/components/CodeChallenge.svelte';
  import ReviewCards from '$lib/components/ReviewCards.svelte';
  import BranchingScenario from '$lib/components/BranchingScenario.svelte';
  import Timer from '$lib/components/Timer.svelte';
  import { exercises, workedExamples } from '$lib/data/exercises/module-11';
  import { reviewCards } from '$lib/data/exercises/review-cards';

  const mod = modules.find(m => m.id === 11)!;
  let moduleCompleted = $state(false);
  let timedOut = $state(false);
  let scenarioDone = $state(false);
  let quizDone = $state(false);

  courseStore.startModule(11);

  function handleTimeUp() {
    timedOut = true;
    if (!scenarioDone) {
      courseStore.completeModule(11, 0, 12);
      moduleCompleted = true;
    }
  }

  const scenarioNodes: Record<string, any> = {
    start: {
      id: 'start',
      narrative: 'Tu equipo reporta un bug en produccion: el contador de usuarios activos a veces muestra valores incorrectos. El codigo tiene multiples goroutines incrementando una variable compartida "activeUsers". Los logs muestran valores que "saltan" o se repiten. Cual es tu primer paso para diagnosticar?',
      choices: [
        {
          text: 'Ejecutar el programa con "go run -race ." para activar el detector de race conditions',
          nextId: 'race-detector',
          points: 3,
          feedback: 'Perfecto! El race detector es la primera herramienta que debes usar. Te mostrara exactamente donde ocurren los accesos concurrentes no protegidos.',
        },
        {
          text: 'Agregar mas fmt.Println para debuggear los valores',
          nextId: 'println-debug',
          points: 0,
          feedback: 'Los Println en codigo concurrente son enganosos. El timing de la impresion puede ocultar el bug. Go tiene herramientas mejores para esto.',
        },
        {
          text: 'Revisar manualmente el codigo buscando variables compartidas',
          nextId: 'manual-review',
          points: 1,
          feedback: 'Revisar codigo es util pero lento y propenso a errores humanos. El flag -race detecta problemas automaticamente en runtime.',
        },
      ],
    },
    'race-detector': {
      id: 'race-detector',
      narrative: 'El race detector confirma: "DATA RACE" en la variable activeUsers. Multiples goroutines leen y escriben sin proteccion. Como lo corriges?',
      choices: [
        {
          text: 'Usar sync.Mutex para proteger el acceso a activeUsers',
          nextId: 'mutex-fix',
          points: 3,
          feedback: 'Correcto! sync.Mutex es la solucion estandar para proteger estado compartido. Lock() antes de acceder, Unlock() con defer.',
        },
        {
          text: 'Redisenar: eliminar la variable compartida y usar un channel para contar',
          nextId: 'channel-redesign',
          points: 3,
          feedback: 'Excelente! Redisenar para usar channels elimina la race condition de raiz. Es mas idiomatico en Go, aunque puede requerir mas cambios.',
        },
        {
          text: 'Usar sync/atomic para las operaciones de incremento',
          nextId: 'atomic-fix',
          points: 2,
          feedback: 'Buena opcion para contadores simples. atomic.AddInt64 es eficiente y lock-free, pero solo funciona para operaciones atomicas simples.',
        },
      ],
    },
    'println-debug': {
      id: 'println-debug',
      narrative: 'Los Println muestran valores aparentemente correctos porque el timing cambia con la I/O. Un companero sugiere usar el flag -race. Lo ejecutas y confirma: DATA RACE en activeUsers. Como proteges la variable?',
      choices: [
        {
          text: 'Envolver los accesos con sync.Mutex',
          nextId: 'mutex-fix-late',
          points: 2,
          feedback: 'sync.Mutex es la solucion correcta. Recuerda siempre usar defer mu.Unlock() para garantizar que se libera el lock.',
        },
        {
          text: 'Agregar un time.Sleep para "separar" los accesos',
          nextId: 'sleep-fix',
          points: 0,
          feedback: 'NUNCA uses time.Sleep para sincronizacion. No garantiza nada sobre el orden de ejecucion. Las race conditions pueden ocurrir en nanosegundos.',
        },
      ],
    },
    'manual-review': {
      id: 'manual-review',
      narrative: 'Despues de 30 minutos revisando codigo, encuentras la variable sospechosa. Ahora necesitas confirmar que es una race condition. Que haces?',
      choices: [
        {
          text: 'Ejecutar con -race para confirmar',
          nextId: 'confirm-race',
          points: 2,
          feedback: 'Siempre confirma con -race. Ahora sabes que deberias haberlo ejecutado desde el inicio para ahorrar tiempo.',
        },
        {
          text: 'Asumir que es el problema y aplicar un Mutex directamente',
          nextId: 'assume-fix',
          points: 1,
          feedback: 'Aplicar el fix puede funcionar, pero sin confirmar con -race podrias estar cubriendo solo una de varias race conditions.',
        },
      ],
    },
    'mutex-fix': {
      id: 'mutex-fix',
      narrative: 'Implementaste sync.Mutex. Ahora notas que muchas goroutines solo LEEN activeUsers (para mostrar en dashboard) y pocas escriben. El Mutex esta causando contencion innecesaria entre lectores. Optimizas?',
      choices: [
        {
          text: 'Cambiar a sync.RWMutex: RLock para lectores, Lock para escritores',
          nextId: 'rwmutex-excellent',
          points: 3,
          feedback: 'Perfecto! RWMutex permite multiples lectores simultaneos. Solo bloquea a todos cuando un escritor necesita acceso.',
        },
        {
          text: 'Dejar el Mutex normal, la contencion no es tan grave',
          nextId: 'mutex-ok',
          points: 1,
          feedback: 'Funciona, pero con muchos lectores y pocos escritores, RWMutex mejoraria significativamente el rendimiento.',
        },
      ],
    },
    'channel-redesign': {
      id: 'channel-redesign',
      narrative: 'Redisenaste usando channels. Ahora necesitas que el servicio se apague limpiamente: las goroutines deben terminar su trabajo actual y no aceptar mas. Como implementas el graceful shutdown?',
      choices: [
        {
          text: 'Usar context.WithCancel y pasar el ctx a todas las goroutines',
          nextId: 'context-excellent',
          points: 3,
          feedback: 'Excelente! context es EL mecanismo estandar para propagacion de cancelacion en Go. Todas las goroutines deben aceptar context como primer parametro.',
        },
        {
          text: 'Cerrar el channel de jobs para que las goroutines salgan del range',
          nextId: 'close-channel-ok',
          points: 2,
          feedback: 'Cerrar channels funciona para senalar que no hay mas trabajo. Pero context te da mas control: cancelacion, timeouts, y propagacion en cadena.',
        },
      ],
    },
    'atomic-fix': {
      id: 'atomic-fix',
      outcome: {
        title: 'Buen Uso de Atomic',
        description: 'sync/atomic es perfecto para contadores simples. Para logica mas compleja, considera Mutex o rediseno con channels.',
        score: 2,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'sync/atomic funciona para operaciones simples: Add, Load, Store, CompareAndSwap',
          'Para logica que requiere leer-modificar-escribir con condiciones, usa Mutex',
          'El race detector (-race) deberia ser parte de tu CI/CD',
          'context.Context es esencial para cancelacion y timeouts en goroutines',
        ],
      },
    },
    'mutex-fix-late': {
      id: 'mutex-fix-late',
      outcome: {
        title: 'Race Condition Corregida',
        description: 'Resolviste el problema, pero perdiste tiempo con tecnicas de debug ineficientes. Usa -race desde el inicio.',
        score: 2,
        maxScore: 12,
        grade: 'needs-work' as const,
        lessons: [
          'Siempre ejecuta con -race durante desarrollo y en CI',
          'fmt.Println cambia el timing y puede ocultar race conditions',
          'defer mu.Unlock() garantiza que el lock siempre se libera',
          'sync.RWMutex permite multiples lectores simultaneos si la mayoria son lecturas',
        ],
      },
    },
    'sleep-fix': {
      id: 'sleep-fix',
      outcome: {
        title: 'Error Critico: time.Sleep No Sincroniza',
        description: 'time.Sleep NUNCA es una solucion para race conditions. Los bugs seguiran apareciendo de forma impredecible.',
        score: 0,
        maxScore: 12,
        grade: 'critical' as const,
        lessons: [
          'time.Sleep NO es un mecanismo de sincronizacion',
          'Usa sync.Mutex, sync.RWMutex, o sync/atomic para proteger estado compartido',
          'Los channels eliminan la necesidad de memoria compartida',
          'El race detector de Go (-race) detecta estos problemas automaticamente',
        ],
      },
    },
    'confirm-race': {
      id: 'confirm-race',
      outcome: {
        title: 'Diagnostico Correcto (Tardio)',
        description: 'Encontraste el bug, pero con un enfoque mas lento. La proxima vez, empieza con -race.',
        score: 3,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'go run -race deberia ser tu PRIMER paso ante sospecha de concurrencia',
          'El race detector tiene overhead (~10x) asi que no lo uses en produccion',
          'Incluyelo en tu pipeline de CI: go test -race ./...',
          'Protege variables compartidas con Mutex o redisena con channels',
        ],
      },
    },
    'assume-fix': {
      id: 'assume-fix',
      outcome: {
        title: 'Fix Parcial Sin Verificacion',
        description: 'Puede que hayas resuelto UNA race condition, pero sin -race no sabes si hay mas.',
        score: 1,
        maxScore: 12,
        grade: 'needs-work' as const,
        lessons: [
          'Siempre verifica con -race: pueden existir multiples race conditions',
          'Un fix sin verificacion es un fix incompleto',
          'go test -race ./... deberia estar en tu CI/CD pipeline',
          'Las race conditions son heisenbugs: pueden no manifestarse siempre',
        ],
      },
    },
    'rwmutex-excellent': {
      id: 'rwmutex-excellent',
      outcome: {
        title: 'Maestro de Sincronizacion',
        description: 'Diagnosticaste rapidamente, aplicaste la solucion correcta, y optimizaste con RWMutex. Excelente trabajo.',
        score: 3,
        maxScore: 12,
        grade: 'excellent' as const,
        lessons: [
          'sync.RWMutex es ideal cuando hay muchas lecturas y pocas escrituras',
          'RLock permite multiples lectores simultaneos, Lock bloquea a todos',
          'El race detector deberia ser parte de tu workflow diario',
          'Considera context.WithTimeout para operaciones que no deben durar indefinidamente',
        ],
      },
    },
    'mutex-ok': {
      id: 'mutex-ok',
      outcome: {
        title: 'Solucion Funcional',
        description: 'El Mutex resuelve el problema. Para escenarios de alta lectura, RWMutex seria mas eficiente.',
        score: 1,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'sync.Mutex funciona correctamente pero puede causar contencion innecesaria',
          'sync.RWMutex mejora rendimiento con patron muchos-lectores/pocos-escritores',
          'Mide antes de optimizar: no siempre la contencion es un problema',
          'go test -race -bench deberia ser parte de tus herramientas regulares',
        ],
      },
    },
    'context-excellent': {
      id: 'context-excellent',
      outcome: {
        title: 'Arquitecto de Concurrencia Avanzada',
        description: 'Dominaste el diagnostico, el rediseno con channels, y el graceful shutdown con context. Nivel senior.',
        score: 3,
        maxScore: 12,
        grade: 'excellent' as const,
        lessons: [
          'context.Context es el PRIMER parametro de funciones que pueden ser canceladas',
          'context.WithCancel para cancelacion manual, WithTimeout para limites de tiempo',
          'Channels para comunicacion, context para control de lifecycle',
          'El patron completo: context + channels + WaitGroup = concurrencia robusta',
        ],
      },
    },
    'close-channel-ok': {
      id: 'close-channel-ok',
      outcome: {
        title: 'Buen Rediseno Concurrente',
        description: 'Eliminar memoria compartida con channels es excelente. Agrega context para control de lifecycle completo.',
        score: 2,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'Cerrar un channel senala "fin de datos" a todos los receptores',
          'context.Context agrega cancelacion, timeouts, y propagacion en cadena',
          'Combina ambos: channels para datos, context para control',
          'Siempre pasa context como primer parametro: func DoWork(ctx context.Context, ...)',
        ],
      },
    },
  };

  const quizQuestions = [
    {
      question: 'Que metodos tiene sync.WaitGroup?',
      options: [
        { text: 'Start(), Stop(), Wait()', correct: false, explanation: 'Los metodos de WaitGroup son Add, Done y Wait, no Start/Stop.' },
        { text: 'Add(n), Done(), Wait()', correct: true, explanation: 'Correcto! Add(n) registra n goroutines pendientes, Done() decrementa el contador (equivale a Add(-1)), y Wait() bloquea hasta que el contador llega a 0.' },
        { text: 'Lock(), Unlock(), Wait()', correct: false, explanation: 'Eso es Mutex (Lock/Unlock). WaitGroup usa Add/Done/Wait.' },
        { text: 'Push(), Pop(), Count()', correct: false, explanation: 'WaitGroup no es una estructura de datos. Es un mecanismo de sincronizacion.' },
      ],
    },
    {
      question: 'Por que este codigo tiene una race condition?\n\ncounter := 0\nfor i := 0; i < 1000; i++ {\n  go func() { counter++ }()\n}',
      options: [
        { text: 'Porque counter deberia ser un puntero', correct: false, explanation: 'Usar puntero no resuelve la race. El problema es acceso concurrente sin proteccion.' },
        { text: 'Porque counter++ no es atomico: es read-increment-write (3 operaciones)', correct: true, explanation: 'Correcto! Dos goroutines pueden leer el mismo valor, ambas incrementar, y ambas escribir el mismo resultado. Se pierde un incremento.' },
        { text: 'Porque no se usa WaitGroup', correct: false, explanation: 'WaitGroup resuelve el problema de esperar, pero la race condition en counter++ seguiria existiendo.' },
        { text: 'No hay race condition, Go lo maneja', correct: false, explanation: 'Go NO protege automaticamente contra data races. Usa "go run -race" para verificar.' },
      ],
    },
    {
      question: 'Que retorna ctx.Err() cuando el context fue cancelado por timeout?',
      options: [
        { text: 'nil', correct: false, explanation: 'nil solo se retorna cuando el context NO ha sido cancelado.' },
        { text: 'context.DeadlineExceeded', correct: true, explanation: 'Correcto! WithTimeout y WithDeadline retornan DeadlineExceeded. WithCancel retorna context.Canceled.' },
        { text: 'context.Canceled', correct: false, explanation: 'context.Canceled es para cancelacion manual (WithCancel). Para timeout es DeadlineExceeded.' },
        { text: 'Un error generico "timeout"', correct: false, explanation: 'Go usa errores sentinel especificos: context.DeadlineExceeded y context.Canceled.' },
      ],
    },
    {
      question: 'Cual es la diferencia entre sync.Mutex y sync.RWMutex?',
      options: [
        { text: 'RWMutex es mas rapido siempre', correct: false, explanation: 'No siempre. Si hay muchas escrituras, Mutex puede ser mas eficiente por menor overhead.' },
        { text: 'RWMutex permite multiples lectores simultaneos (RLock) pero solo un escritor (Lock)', correct: true, explanation: 'Correcto! RWMutex es ideal con patron muchos-lectores/pocos-escritores. Multiples RLock no se bloquean entre si, pero Lock bloquea a todos.' },
        { text: 'Mutex es para goroutines y RWMutex para threads', correct: false, explanation: 'Ambos son para goroutines. La diferencia es la granularidad del locking.' },
        { text: 'RWMutex no existe en Go', correct: false, explanation: 'sync.RWMutex esta en la standard library y es muy utilizado.' },
      ],
    },
    {
      question: 'Que patron de concurrencia describe: "multiples goroutines leen de un canal, procesan, y envian a otro canal"?',
      options: [
        { text: 'Singleton', correct: false, explanation: 'Singleton es un patron de diseno, no de concurrencia.' },
        { text: 'Worker Pool / Fan-out', correct: true, explanation: 'Correcto! Fan-out distribuye trabajo de un canal a multiples workers. Combinado con fan-in (merge de resultados en un canal), forma el patron pipeline mas comun en Go.' },
        { text: 'Observer', correct: false, explanation: 'Observer es un patron de diseno para notificaciones, no especifico de concurrencia en Go.' },
        { text: 'Semaphore', correct: false, explanation: 'Un semaforo limita concurrencia con un buffered channel, pero no describe el flujo de datos.' },
      ],
    },
  ];

  function handleScenarioComplete(score: number, maxScore: number) {
    scenarioDone = true;
    const finalScore = timedOut ? Math.max(0, score - 2) : score;
    if (!quizDone) {
      courseStore.completeModule(11, finalScore, maxScore);
    }
    moduleCompleted = true;
  }

  function handleQuizComplete(score: number, total: number) {
    quizDone = true;
    if (!scenarioDone) {
      courseStore.completeModule(11, score, total);
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
  <ReviewCards moduleId={11} cards={reviewCards} />

  <!-- sync.WaitGroup -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">sync.WaitGroup</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      <code class="text-go-accent">WaitGroup</code> permite esperar a que un grupo de goroutines termine.
      Tres metodos: <strong class="text-go-text">Add</strong> (cuantas esperar),
      <strong class="text-go-text">Done</strong> (una termino), <strong class="text-go-text">Wait</strong> (bloquea hasta que todas terminen).
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">var</span> wg sync.WaitGroup

<span class="text-go-accent">for</span> i := 0; i &lt; 5; i++ {
    wg.Add(1)                   <span class="text-go-muted">// +1 goroutine por esperar</span>
    <span class="text-go-accent">go func</span>(id <span class="text-go-accent">int</span>) {
        <span class="text-go-accent">defer</span> wg.Done()           <span class="text-go-muted">// Marca como terminada</span>
        fmt.Printf(<span class="text-go-success">"Worker %d termino\\n"</span>, id)
    }(i)
}

wg.Wait()                       <span class="text-go-muted">// Bloquea hasta que todas terminen</span>
fmt.Println(<span class="text-go-success">"Todas terminaron"</span>)</code></pre>`}
    <div class="bg-go-darker rounded-lg p-3 mt-3">
      <p class="text-go-warning font-semibold text-sm">Regla clave</p>
      <p class="text-go-muted text-sm">
        Siempre usa <code class="text-go-accent">defer wg.Done()</code> al inicio de la goroutine.
        Si la goroutine hace panic y no llama Done(), Wait() se bloquea para siempre.
      </p>
    </div>
  </section>

  <!-- Mutex -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">sync.Mutex y sync.RWMutex</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Cuando <strong class="text-go-text">necesitas</strong> compartir estado entre goroutines, protegelo con un Mutex.
      El patron idiomatico es <strong class="text-go-text">encapsular el mutex dentro del struct</strong> que protege.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">type</span> ContadorSeguro <span class="text-go-accent">struct</span> {
    mu    sync.RWMutex
    valor <span class="text-go-accent">int</span>
}

<span class="text-go-accent">func</span> (c *ContadorSeguro) <span class="text-go-warning">Incrementar</span>() {
    c.mu.Lock()           <span class="text-go-muted">// Lock exclusivo para escritura</span>
    <span class="text-go-accent">defer</span> c.mu.Unlock()
    c.valor++
}

<span class="text-go-accent">func</span> (c *ContadorSeguro) <span class="text-go-warning">Valor</span>() <span class="text-go-accent">int</span> {
    c.mu.RLock()          <span class="text-go-muted">// Lock de lectura (multiples lectores OK)</span>
    <span class="text-go-accent">defer</span> c.mu.RUnlock()
    <span class="text-go-accent">return</span> c.valor
}</code></pre>`}
    <div class="bg-go-darker rounded-lg p-3">
      <p class="text-go-warning font-semibold text-sm">Race Detector</p>
      <p class="text-go-muted text-sm">
        Ejecuta con <code class="text-go-accent">go run -race .</code> o <code class="text-go-accent">go test -race ./...</code>
        para detectar accesos concurrentes no protegidos. Deberia estar en tu CI/CD.
      </p>
    </div>
  </section>

  <!-- Context -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">El Paquete context</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      <code class="text-go-accent">context</code> controla el <strong class="text-go-text">ciclo de vida</strong> de operaciones:
      cancelacion, timeouts y deadlines. Es el <strong class="text-go-text">primer parametro</strong> por convencion.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Crear contextos</span>
ctx := context.Background()                    <span class="text-go-muted">// Raiz, nunca se cancela</span>
ctx, cancel := context.WithCancel(ctx)         <span class="text-go-muted">// Cancelacion manual</span>
ctx, cancel := context.WithTimeout(ctx, 5*time.Second) <span class="text-go-muted">// Timeout</span>
ctx, cancel := context.WithDeadline(ctx, deadline)     <span class="text-go-muted">// Deadline absoluto</span>

<span class="text-go-accent">defer</span> cancel() <span class="text-go-muted">// SIEMPRE defer cancel() para liberar recursos</span>

<span class="text-go-muted">// Usar en goroutines</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">procesar</span>(ctx context.Context, datos <span class="text-go-accent">[]int</span>) <span class="text-go-accent">error</span> {
    <span class="text-go-accent">for</span> _, d := <span class="text-go-accent">range</span> datos {
        <span class="text-go-accent">select</span> {
        <span class="text-go-accent">case</span> &lt;-ctx.Done():      <span class="text-go-muted">// Nos cancelaron?</span>
            <span class="text-go-accent">return</span> ctx.Err()   <span class="text-go-muted">// DeadlineExceeded o Canceled</span>
        <span class="text-go-accent">default</span>:
            trabajar(d)
        }
    }
    <span class="text-go-accent">return</span> <span class="text-go-accent">nil</span>
}</code></pre>`}
  </section>

  <!-- Patrones de concurrencia -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Patrones de Concurrencia</h2>
    <div class="space-y-4">
      <div class="bg-go-darker rounded-lg p-4">
        <p class="text-go-accent font-semibold text-sm mb-2">Pipeline</p>
        <p class="text-go-muted text-sm">Etapas conectadas por channels. Cada etapa recibe de un channel, procesa, y envia al siguiente. Como tuberias de Unix.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-4">
        <p class="text-go-accent font-semibold text-sm mb-2">Fan-Out / Fan-In</p>
        <p class="text-go-muted text-sm">Fan-out: multiples goroutines leen del mismo channel para distribuir trabajo. Fan-in: multiples channels se fusionan en uno solo con merge().</p>
      </div>
      <div class="bg-go-darker rounded-lg p-4">
        <p class="text-go-accent font-semibold text-sm mb-2">Worker Pool</p>
        <p class="text-go-muted text-sm">N goroutines fijas procesan tareas de un channel compartido. Controla la concurrencia maxima. Es fan-out con numero fijo de workers.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-4">
        <p class="text-go-accent font-semibold text-sm mb-2">Semaphore</p>
        <p class="text-go-muted text-sm">Un buffered channel limita la cantidad de goroutines activas: <code class="text-go-accent">sem := make(chan struct{'{'}{'}'}, N)</code>. Adquirir: enviar. Liberar: recibir.</p>
      </div>
    </div>
  </section>

  <!-- Worked Examples -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Ejemplos Paso a Paso</h2>
    <p class="text-go-muted mb-4">
      Desde race conditions hasta worker pools con context. Cada ejemplo construye sobre el anterior.
    </p>
    <div class="space-y-6">
      {#each workedExamples as we}
        <WorkedExample title={we.title} description={we.description} steps={we.steps} playground={we.playground} playgroundCode={we.playgroundCode} />
      {/each}
    </div>
  </section>

  <!-- Code Challenges -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Desafios de Codigo</h2>
    <p class="text-go-muted mb-4">
      Pon a prueba tu dominio de WaitGroup, Mutex, context y patrones de concurrencia.
    </p>
    <div class="space-y-6">
      {#each exercises as exercise}
        <CodeChallenge {exercise} onComplete={(id, score, hints) => courseStore.completeExercise(id, score, hints)} />
      {/each}
    </div>
  </section>

  <!-- Timer + BranchingScenario -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Desafio: Debug de Race Conditions</h2>
    <p class="text-go-muted mb-4">
      Un bug de concurrencia en produccion. Tienes <strong class="text-go-text">3 minutos</strong> para diagnosticar y proponer
      la solucion. Tus decisiones importan.
    </p>
    {#if !moduleCompleted}
      <div class="mb-4">
        <Timer
          duration={180}
          onTimeUp={handleTimeUp}
          autoStart={true}
          label="Tiempo para resolver el bug"
        />
      </div>
    {/if}
    {#if timedOut && !scenarioDone}
      <div class="card mb-4 border-go-danger/30 bg-go-danger/5">
        <p class="text-go-danger font-semibold">Se acabo el tiempo. En produccion, cada segundo cuenta.</p>
      </div>
    {/if}
    <BranchingScenario
      nodes={scenarioNodes}
      startId="start"
      title="Bug de Concurrencia en Produccion"
      onComplete={handleScenarioComplete}
    />
  </section>

  <!-- Quiz -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Quiz: Concurrencia Avanzada</h2>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  {#if moduleCompleted}
    <div class="card mb-6 border-go-success/30 bg-go-success/5">
      <div class="text-center">
        <span class="text-4xl">&#129516;</span>
        <h3 class="text-xl font-bold text-go-success mt-2">Modulo Completado</h3>
        <p class="text-go-muted mt-1">Concurrencia avanzada dominada</p>
      </div>
    </div>
  {/if}

  <SourcesSection sources={mod.sources} />
  <ModuleNav currentModule={11} />
</div>

<VocabularyFloat moduleId={11} />

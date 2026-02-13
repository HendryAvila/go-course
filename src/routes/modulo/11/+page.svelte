<script lang="ts">
  import { courseStore } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BranchingScenario from '$lib/components/BranchingScenario.svelte';
  import Timer from '$lib/components/Timer.svelte';

  const mod = modules.find(m => m.id === 11)!;
  let moduleCompleted = $state(false);
  let timedOut = $state(false);
  let scenarioDone = $state(false);

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
      narrative: 'Tu equipo reporta un bug en producción: el contador de usuarios activos a veces muestra valores incorrectos. El código tiene múltiples goroutines incrementando una variable compartida "activeUsers". Los logs muestran valores que "saltan" o se repiten. ¿Cuál es tu primer paso para diagnosticar?',
      choices: [
        {
          text: 'Ejecutar el programa con "go run -race ." para activar el detector de race conditions',
          nextId: 'race-detector',
          points: 3,
          feedback: '¡Perfecto! El race detector es la primera herramienta que debes usar. Te mostrará exactamente dónde ocurren los accesos concurrentes no protegidos.',
        },
        {
          text: 'Agregar más fmt.Println para debuggear los valores',
          nextId: 'println-debug',
          points: 0,
          feedback: 'Los Println en código concurrente son engañosos. El timing de la impresión puede ocultar el bug. Go tiene herramientas mejores para esto.',
        },
        {
          text: 'Revisar manualmente el código buscando variables compartidas',
          nextId: 'manual-review',
          points: 1,
          feedback: 'Revisar código es útil pero lento y propenso a errores humanos. El flag -race detecta problemas automáticamente en runtime.',
        },
      ],
    },
    'race-detector': {
      id: 'race-detector',
      narrative: 'El race detector confirma: "DATA RACE" en la variable activeUsers. Múltiples goroutines leen y escriben sin protección. ¿Cómo lo corriges?',
      choices: [
        {
          text: 'Usar sync.Mutex para proteger el acceso a activeUsers',
          nextId: 'mutex-fix',
          points: 3,
          feedback: '¡Correcto! sync.Mutex es la solución estándar para proteger estado compartido. Lock() antes de acceder, Unlock() con defer.',
        },
        {
          text: 'Rediseñar: eliminar la variable compartida y usar un channel para contar',
          nextId: 'channel-redesign',
          points: 3,
          feedback: '¡Excelente! Rediseñar para usar channels elimina la race condition de raíz. Es más idiomático en Go, aunque puede requerir más cambios.',
        },
        {
          text: 'Usar sync/atomic para las operaciones de incremento',
          nextId: 'atomic-fix',
          points: 2,
          feedback: 'Buena opción para contadores simples. atomic.AddInt64 es eficiente y lock-free, pero solo funciona para operaciones atómicas simples.',
        },
      ],
    },
    'println-debug': {
      id: 'println-debug',
      narrative: 'Los Println muestran valores aparentemente correctos porque el timing cambia con la I/O. Un compañero sugiere usar el flag -race. Lo ejecutas y confirma: DATA RACE en activeUsers. ¿Cómo proteges la variable?',
      choices: [
        {
          text: 'Envolver los accesos con sync.Mutex',
          nextId: 'mutex-fix-late',
          points: 2,
          feedback: 'sync.Mutex es la solución correcta. Recuerda siempre usar defer mu.Unlock() para garantizar que se libera el lock.',
        },
        {
          text: 'Agregar un time.Sleep para "separar" los accesos',
          nextId: 'sleep-fix',
          points: 0,
          feedback: 'NUNCA uses time.Sleep para sincronización. No garantiza nada sobre el orden de ejecución. Las race conditions pueden ocurrir en nanosegundos.',
        },
      ],
    },
    'manual-review': {
      id: 'manual-review',
      narrative: 'Después de 30 minutos revisando código, encuentras la variable sospechosa. Ahora necesitas confirmar que es una race condition. ¿Qué haces?',
      choices: [
        {
          text: 'Ejecutar con -race para confirmar',
          nextId: 'confirm-race',
          points: 2,
          feedback: 'Siempre confirma con -race. Ahora sabes que deberías haberlo ejecutado desde el inicio para ahorrar tiempo.',
        },
        {
          text: 'Asumir que es el problema y aplicar un Mutex directamente',
          nextId: 'assume-fix',
          points: 1,
          feedback: 'Aplicar el fix puede funcionar, pero sin confirmar con -race podrías estar cubriendo solo una de varias race conditions.',
        },
      ],
    },
    'mutex-fix': {
      id: 'mutex-fix',
      narrative: 'Implementaste sync.Mutex. Ahora notas que muchas goroutines solo LEEN activeUsers (para mostrar en dashboard) y pocas escriben. El Mutex está causando contención innecesaria entre lectores. ¿Optimizas?',
      choices: [
        {
          text: 'Cambiar a sync.RWMutex: RLock para lectores, Lock para escritores',
          nextId: 'rwmutex-excellent',
          points: 3,
          feedback: '¡Perfecto! RWMutex permite múltiples lectores simultáneos. Solo bloquea a todos cuando un escritor necesita acceso.',
        },
        {
          text: 'Dejar el Mutex normal, la contención no es tan grave',
          nextId: 'mutex-ok',
          points: 1,
          feedback: 'Funciona, pero con muchos lectores y pocos escritores, RWMutex mejoraría significativamente el rendimiento.',
        },
      ],
    },
    'channel-redesign': {
      id: 'channel-redesign',
      narrative: 'Rediseñaste usando channels. Ahora necesitas que el servicio se apague limpiamente: las goroutines deben terminar su trabajo actual y no aceptar más. ¿Cómo implementas el graceful shutdown?',
      choices: [
        {
          text: 'Usar context.WithCancel y pasar el ctx a todas las goroutines',
          nextId: 'context-excellent',
          points: 3,
          feedback: '¡Excelente! context es EL mecanismo estándar para propagación de cancelación en Go. Todas las goroutines deben aceptar context como primer parámetro.',
        },
        {
          text: 'Cerrar el channel de jobs para que las goroutines salgan del range',
          nextId: 'close-channel-ok',
          points: 2,
          feedback: 'Cerrar channels funciona para señalar que no hay más trabajo. Pero context te da más control: cancelación, timeouts, y propagación en cadena.',
        },
      ],
    },
    'atomic-fix': {
      id: 'atomic-fix',
      outcome: {
        title: 'Buen Uso de Atomic',
        description: 'sync/atomic es perfecto para contadores simples. Para lógica más compleja, considera Mutex o rediseño con channels.',
        score: 2,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'sync/atomic funciona para operaciones simples: Add, Load, Store, CompareAndSwap',
          'Para lógica que requiere leer-modificar-escribir con condiciones, usa Mutex',
          'El race detector (-race) debería ser parte de tu CI/CD',
          'context.Context es esencial para cancelación y timeouts en goroutines',
        ],
      },
    },
    'mutex-fix-late': {
      id: 'mutex-fix-late',
      outcome: {
        title: 'Race Condition Corregida',
        description: 'Resolviste el problema, pero perdiste tiempo con técnicas de debug ineficientes. Usa -race desde el inicio.',
        score: 2,
        maxScore: 12,
        grade: 'needs-work' as const,
        lessons: [
          'Siempre ejecuta con -race durante desarrollo y en CI',
          'fmt.Println cambia el timing y puede ocultar race conditions',
          'defer mu.Unlock() garantiza que el lock siempre se libera',
          'sync.RWMutex permite múltiples lectores simultáneos si la mayoría son lecturas',
        ],
      },
    },
    'sleep-fix': {
      id: 'sleep-fix',
      outcome: {
        title: 'Error Crítico: time.Sleep No Sincroniza',
        description: 'time.Sleep NUNCA es una solución para race conditions. Los bugs seguirán apareciendo de forma impredecible.',
        score: 0,
        maxScore: 12,
        grade: 'critical' as const,
        lessons: [
          'time.Sleep NO es un mecanismo de sincronización',
          'Usa sync.Mutex, sync.RWMutex, o sync/atomic para proteger estado compartido',
          'Los channels eliminan la necesidad de memoria compartida',
          'El race detector de Go (-race) detecta estos problemas automáticamente',
        ],
      },
    },
    'confirm-race': {
      id: 'confirm-race',
      outcome: {
        title: 'Diagnóstico Correcto (Tardío)',
        description: 'Encontraste el bug, pero con un enfoque más lento. La próxima vez, empieza con -race.',
        score: 3,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'go run -race debería ser tu PRIMER paso ante sospecha de concurrencia',
          'El race detector tiene overhead (~10x) así que no lo uses en producción',
          'Inclúyelo en tu pipeline de CI: go test -race ./...',
          'Protege variables compartidas con Mutex o rediseña con channels',
        ],
      },
    },
    'assume-fix': {
      id: 'assume-fix',
      outcome: {
        title: 'Fix Parcial Sin Verificación',
        description: 'Puede que hayas resuelto UNA race condition, pero sin -race no sabes si hay más.',
        score: 1,
        maxScore: 12,
        grade: 'needs-work' as const,
        lessons: [
          'Siempre verifica con -race: pueden existir múltiples race conditions',
          'Un fix sin verificación es un fix incompleto',
          'go test -race ./... debería estar en tu CI/CD pipeline',
          'Las race conditions son heisenbugs: pueden no manifestarse siempre',
        ],
      },
    },
    'rwmutex-excellent': {
      id: 'rwmutex-excellent',
      outcome: {
        title: 'Maestro de Sincronización',
        description: 'Diagnosticaste rápidamente, aplicaste la solución correcta, y optimizaste con RWMutex. Excelente trabajo.',
        score: 3,
        maxScore: 12,
        grade: 'excellent' as const,
        lessons: [
          'sync.RWMutex es ideal cuando hay muchas lecturas y pocas escrituras',
          'RLock permite múltiples lectores simultáneos, Lock bloquea a todos',
          'El race detector debería ser parte de tu workflow diario',
          'Considera context.WithTimeout para operaciones que no deben durar indefinidamente',
        ],
      },
    },
    'mutex-ok': {
      id: 'mutex-ok',
      outcome: {
        title: 'Solución Funcional',
        description: 'El Mutex resuelve el problema. Para escenarios de alta lectura, RWMutex sería más eficiente.',
        score: 1,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'sync.Mutex funciona correctamente pero puede causar contención innecesaria',
          'sync.RWMutex mejora rendimiento con patrón muchos-lectores/pocos-escritores',
          'Mide antes de optimizar: no siempre la contención es un problema',
          'go test -race -bench debería ser parte de tus herramientas regulares',
        ],
      },
    },
    'context-excellent': {
      id: 'context-excellent',
      outcome: {
        title: 'Arquitecto de Concurrencia Avanzada',
        description: 'Dominaste el diagnóstico, el rediseño con channels, y el graceful shutdown con context. Nivel senior.',
        score: 3,
        maxScore: 12,
        grade: 'excellent' as const,
        lessons: [
          'context.Context es el PRIMER parámetro de funciones que pueden ser canceladas',
          'context.WithCancel para cancelación manual, WithTimeout para límites de tiempo',
          'Channels para comunicación, context para control de lifecycle',
          'El patrón completo: context + channels + WaitGroup = concurrencia robusta',
        ],
      },
    },
    'close-channel-ok': {
      id: 'close-channel-ok',
      outcome: {
        title: 'Buen Rediseño Concurrente',
        description: 'Eliminar memoria compartida con channels es excelente. Agrega context para control de lifecycle completo.',
        score: 2,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'Cerrar un channel señala "fin de datos" a todos los receptores',
          'context.Context agrega cancelación, timeouts, y propagación en cadena',
          'Combina ambos: channels para datos, context para control',
          'Siempre pasa context como primer parámetro: func DoWork(ctx context.Context, ...)',
        ],
      },
    },
  };

  function handleScenarioComplete(score: number, maxScore: number) {
    scenarioDone = true;
    const finalScore = timedOut ? Math.max(0, score - 2) : score;
    courseStore.completeModule(11, finalScore, maxScore);
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

  <!-- sync.WaitGroup -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">sync.WaitGroup</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      <code class="text-go-accent">WaitGroup</code> permite esperar a que un grupo de goroutines termine.
      Tres métodos: <strong class="text-go-text">Add</strong> (cuántas esperar),
      <strong class="text-go-text">Done</strong> (una terminó), <strong class="text-go-text">Wait</strong> (bloquea hasta que todas terminen).
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">var</span> wg sync.WaitGroup

<span class="text-go-accent">for</span> i := 0; i &lt; 5; i++ {
    wg.Add(1)                   <span class="text-go-muted">// +1 goroutine por esperar</span>
    <span class="text-go-accent">go func</span>(id <span class="text-go-accent">int</span>) {
        <span class="text-go-accent">defer</span> wg.Done()           <span class="text-go-muted">// Marca como terminada</span>
        fmt.Printf(<span class="text-go-success">"Worker %d terminó\\n"</span>, id)
    }(i)
}

wg.Wait()                       <span class="text-go-muted">// Bloquea hasta que todas terminen</span>
fmt.Println(<span class="text-go-success">"Todas terminaron"</span>)</code></pre>`}
  </section>

  <!-- Mutex -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">sync.Mutex y sync.RWMutex</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Cuando <strong class="text-go-text">necesitas</strong> compartir estado entre goroutines, protégelo con un Mutex.
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
    c.mu.RLock()          <span class="text-go-muted">// Lock de lectura (múltiples lectores OK)</span>
    <span class="text-go-accent">defer</span> c.mu.RUnlock()
    <span class="text-go-accent">return</span> c.valor
}</code></pre>`}
    <div class="bg-go-darker rounded-lg p-3">
      <p class="text-go-warning font-semibold text-sm">Race Detector</p>
      <p class="text-go-muted text-sm">
        Ejecuta con <code class="text-go-accent">go run -race .</code> o <code class="text-go-accent">go test -race ./...</code>
        para detectar accesos concurrentes no protegidos. Debería estar en tu CI/CD.
      </p>
    </div>
  </section>

  <!-- Context -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">El Paquete context</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      <code class="text-go-accent">context</code> controla el <strong class="text-go-text">ciclo de vida</strong> de operaciones:
      cancelación, timeouts y deadlines. Es el <strong class="text-go-text">primer parámetro</strong> por convención.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Crear contextos</span>
ctx := context.Background()                    <span class="text-go-muted">// Raíz, nunca se cancela</span>
ctx, cancel := context.WithCancel(ctx)         <span class="text-go-muted">// Cancelación manual</span>
ctx, cancel := context.WithTimeout(ctx, 5*time.Second) <span class="text-go-muted">// Timeout</span>

<span class="text-go-muted">// Usar en goroutines</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">procesar</span>(ctx context.Context, datos <span class="text-go-accent">[]int</span>) <span class="text-go-accent">error</span> {
    <span class="text-go-accent">for</span> _, d := <span class="text-go-accent">range</span> datos {
        <span class="text-go-accent">select</span> {
        <span class="text-go-accent">case</span> &lt;-ctx.Done():      <span class="text-go-muted">// ¿Nos cancelaron?</span>
            <span class="text-go-accent">return</span> ctx.Err()
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
        <p class="text-go-muted text-sm">Etapas conectadas por channels. Cada etapa recibe de un channel, procesa, y envía al siguiente.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-4">
        <p class="text-go-accent font-semibold text-sm mb-2">Fan-Out</p>
        <p class="text-go-muted text-sm">Múltiples goroutines leen del mismo channel para distribuir trabajo.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-4">
        <p class="text-go-accent font-semibold text-sm mb-2">Fan-In</p>
        <p class="text-go-muted text-sm">Múltiples channels se fusionan en uno solo. Combina resultados de varios productores.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-4">
        <p class="text-go-accent font-semibold text-sm mb-2">Worker Pool</p>
        <p class="text-go-muted text-sm">N goroutines fijas procesan tareas de un channel compartido. Controla la concurrencia máxima.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-4">
        <p class="text-go-accent font-semibold text-sm mb-2">Semaphore</p>
        <p class="text-go-muted text-sm">Un buffered channel limita la cantidad de goroutines activas: <code class="text-go-accent">sem := make(chan struct{'{'}{'}'}, N)</code></p>
      </div>
    </div>
  </section>

  <!-- Timer + BranchingScenario -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Desafío: Debug de Race Conditions</h2>
    <p class="text-go-muted mb-4">
      Un bug de concurrencia en producción. Tienes <strong class="text-go-text">3 minutos</strong> para diagnosticar y proponer
      la solución. Tus decisiones importan.
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
        <p class="text-go-danger font-semibold">Se acabó el tiempo. En producción, cada segundo cuenta.</p>
      </div>
    {/if}
    <BranchingScenario
      nodes={scenarioNodes}
      startId="start"
      title="Bug de Concurrencia en Producción"
      onComplete={handleScenarioComplete}
    />
  </section>

  {#if moduleCompleted}
    <div class="card mb-6 border-go-success/30 bg-go-success/5">
      <div class="text-center">
        <span class="text-4xl">&#129516;</span>
        <h3 class="text-xl font-bold text-go-success mt-2">Módulo Completado</h3>
        <p class="text-go-muted mt-1">Concurrencia avanzada dominada</p>
      </div>
    </div>
  {/if}

  <SourcesSection sources={mod.sources} />
  <ModuleNav currentModule={11} />
</div>

<VocabularyFloat moduleId={11} />

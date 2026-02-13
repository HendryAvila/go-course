<script lang="ts">
  import { onMount } from 'svelte';
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import BranchingScenario from '$lib/components/BranchingScenario.svelte';
  import Quiz from '$lib/components/Quiz.svelte';

  const MODULE_ID = 7;
  const BADGE_ID = 'interface-guru';
  const mod = modules.find(m => m.id === MODULE_ID)!;

  let scenarioCompleted = $state(false);
  let scenarioScore = $state(0);
  let quizCompleted = $state(false);
  let quizScore = $state(0);
  let quizTotal = $state(0);
  let showBadge = $state(false);
  let earnedBadge = $state<typeof allBadges[0] | null>(null);

  onMount(() => {
    courseStore.startModule(MODULE_ID);
  });

  function checkCompletion() {
    if (scenarioCompleted && quizCompleted) {
      const totalScore = scenarioScore + quizScore;
      const totalMax = 12 + quizTotal;
      courseStore.completeModule(MODULE_ID, totalScore, totalMax);
      const badge = allBadges.find(b => b.id === BADGE_ID);
      if (badge) {
        courseStore.unlockBadge(BADGE_ID);
        earnedBadge = badge;
        showBadge = true;
      }
    }
  }

  function handleScenarioComplete(score: number, maxScore: number) {
    scenarioCompleted = true;
    scenarioScore = score;
    checkCompletion();
  }

  function handleQuizComplete(score: number, total: number) {
    quizCompleted = true;
    quizScore = score;
    quizTotal = total;
    checkCompletion();
  }

  const scenarioNodes: Record<string, any> = {
    start: {
      id: 'start',
      narrative: 'Estas disenando un sistema de notificaciones que debe enviar mensajes por Email, SMS y Push. Necesitas decidir como estructurar el codigo. Tienes un struct EmailSender con un metodo Send(message string) error. Ahora necesitas agregar SMS y Push. Como lo haces?',
      choices: [
        { text: 'Crear una interfaz Notifier con el metodo Send y hacer que cada tipo la implemente', nextId: 'interface-yes', points: 3, feedback: 'Excelente. Una interfaz Notifier permite polimorfismo: cualquier tipo con Send puede ser usado como Notifier.' },
        { text: 'Meter todo en un solo struct gigante con un campo "tipo" para diferenciar', nextId: 'monolith', points: 0, feedback: 'Esto viola el principio Open/Closed. Cada nuevo canal requiere modificar el struct existente.' },
        { text: 'Usar funciones sueltas: sendEmail(), sendSMS(), sendPush()', nextId: 'functions', points: 1, feedback: 'Funciona pero pierdes la capacidad de tratar todos los senders de forma uniforme.' },
      ],
    },
    'interface-yes': {
      id: 'interface-yes',
      narrative: 'Bien. Has creado la interfaz Notifier. Ahora necesitas una funcion que envie a multiples canales. Que firma deberia tener?',
      choices: [
        { text: 'func BroadcastAll(notifiers []Notifier, msg string) error — acepta la interfaz', nextId: 'accept-interface', points: 3, feedback: 'Perfecto. "Accept interfaces, return structs" es el principio idomiatico en Go.' },
        { text: 'func BroadcastAll(email *EmailSender, sms *SMSSender, push *PushSender, msg string) error', nextId: 'concrete-params', points: 1, feedback: 'Funciona pero cada nuevo canal requiere cambiar la firma. No es extensible.' },
        { text: 'func BroadcastAll(senders []interface{}, msg string) error — usar interface{} vacio', nextId: 'empty-interface', points: 1, feedback: 'interface{} pierde type safety. Tendras que hacer type assertions inseguras adentro.' },
      ],
    },
    'accept-interface': {
      id: 'accept-interface',
      narrative: 'Ahora una funcion retorna un notifier basado en la configuracion. Que deberia retornar?',
      choices: [
        { text: 'Retornar el struct concreto (*EmailSender, *SMSSender, etc.)', nextId: 'return-concrete', points: 3, feedback: '"Return structs": retornar tipos concretos da mas informacion al caller y evita acoplar a interfaces.' },
        { text: 'Retornar la interfaz Notifier', nextId: 'return-interface', points: 2, feedback: 'Funciona, pero oculta el tipo concreto. En Go idiomatico se prefiere retornar el struct.' },
        { text: 'Retornar interface{} para maxima flexibilidad', nextId: 'return-any', points: 0, feedback: 'interface{} obliga al caller a hacer type assertion. Pierdes toda seguridad de tipos.' },
      ],
    },
    monolith: {
      id: 'monolith',
      narrative: 'Tu struct gigante tiene campos para email, sms, push y un campo Tipo string. Necesitas agregar soporte para Slack y Telegram. Que haces?',
      choices: [
        { text: 'Refactorizar a una interfaz y tipos separados', nextId: 'refactor-good', points: 3, feedback: 'Buena decision. Refactorizar a interfaces separa responsabilidades correctamente.' },
        { text: 'Agregar mas campos al struct y mas cases al switch', nextId: 'outcome-bad', points: 0, feedback: 'El struct seguira creciendo sin control. Cada cambio afecta todo el sistema.' },
      ],
    },
    functions: {
      id: 'functions',
      narrative: 'Tienes funciones sueltas. Ahora necesitas una funcion que reciba "cualquier sender" y lo use. Como lo resuelves?',
      choices: [
        { text: 'Definir una interfaz que todas las funciones cumplan', nextId: 'interface-yes', points: 2, feedback: 'Correcto. Las interfaces en Go se satisfacen implicitamente, solo necesitas que el tipo tenga los metodos.' },
        { text: 'Usar un parametro interface{} y hacer type assertions', nextId: 'empty-interface', points: 0, feedback: 'interface{} no garantiza que el tipo tenga un metodo Send. Vas a tener panics en runtime.' },
      ],
    },
    'concrete-params': {
      id: 'concrete-params',
      narrative: 'Tu funcion tiene parametros concretos. El equipo quiere agregar un WebhookSender. Que haces?',
      choices: [
        { text: 'Refactorizar para aceptar una interfaz Notifier', nextId: 'accept-interface', points: 2, feedback: 'Perfecto, ahora entiendes por que las interfaces hacen el codigo extensible.' },
        { text: 'Agregar otro parametro a la funcion', nextId: 'outcome-bad', points: 0, feedback: 'La funcion va a tener 10 parametros eventualmente. No escala.' },
      ],
    },
    'empty-interface': {
      id: 'empty-interface',
      narrative: 'Estas usando interface{} y haciendo type assertions. Un nuevo developer agrega un tipo que no tiene Send(). El codigo compila pero hace panic en runtime. Que aprendes?',
      choices: [
        { text: 'Definir una interfaz especifica con los metodos necesarios', nextId: 'return-concrete', points: 2, feedback: 'Exacto. Las interfaces con metodos dan validacion en tiempo de compilacion.' },
        { text: 'Agregar un recover() para manejar el panic', nextId: 'outcome-bad', points: 0, feedback: 'recover() es un parche. El problema es de diseno, no de error handling.' },
      ],
    },
    'refactor-good': {
      id: 'refactor-good',
      narrative: 'Refactorizaste bien.',
      outcome: {
        title: 'Buen refactoring',
        description: 'Reconociste el problema del struct monolitico y refactorizaste a interfaces.',
        score: 3,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'Las interfaces permiten polimorfismo sin herencia',
          'Separar tipos concretos por responsabilidad es clave',
          'Refactorizar a interfaces cuando detectas el patron',
        ],
      },
    },
    'return-concrete': {
      id: 'return-concrete',
      narrative: 'Has completado el diseno.',
      outcome: {
        title: 'Diseno idiomatico',
        description: 'Aplicaste correctamente "Accept interfaces, return structs" y entiendes cuando usar cada patron.',
        score: 9,
        maxScore: 12,
        grade: 'excellent' as const,
        lessons: [
          'Accept interfaces, return structs',
          'Interfaces pequenas son mas componibles',
          'Los tipos concretos retornados dan mas informacion al caller',
          'La implementacion implicita es el superpoder de Go',
        ],
      },
    },
    'return-interface': {
      id: 'return-interface',
      narrative: 'Has completado el diseno.',
      outcome: {
        title: 'Buen approach con mejoras posibles',
        description: 'Usas interfaces bien, pero retornar interfaces cuando no es necesario oculta informacion util.',
        score: 7,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'Retornar structs concretos da mas informacion al caller',
          'Solo retorna interfaces si hay una razon real de abstraccion',
          'Accept interfaces, return structs es la regla idomiatica',
        ],
      },
    },
    'return-any': {
      id: 'return-any',
      narrative: 'Has completado el diseno.',
      outcome: {
        title: 'Demasiada flexibilidad',
        description: 'Usar interface{} everywhere pierde la seguridad de tipos que Go ofrece.',
        score: 3,
        maxScore: 12,
        grade: 'needs-work' as const,
        lessons: [
          'interface{} / any debe usarse con moderacion',
          'Define interfaces especificas con los metodos que necesitas',
          'La seguridad de tipos es una ventaja, no una limitacion',
        ],
      },
    },
    'outcome-bad': {
      id: 'outcome-bad',
      narrative: 'El diseno tiene problemas fundamentales.',
      outcome: {
        title: 'Oportunidad de mejora',
        description: 'El approach elegido lleva a codigo fragil y dificil de extender. Las interfaces resuelven estos problemas.',
        score: 1,
        maxScore: 12,
        grade: 'critical' as const,
        lessons: [
          'Las interfaces permiten extender sin modificar codigo existente (Open/Closed)',
          'Evita structs monoliticos con campos para todos los casos',
          'interface{} sin type safety causa panics en runtime',
          'Revisa el principio "Accept interfaces, return structs"',
        ],
      },
    },
  };

  const quizQuestions = [
    {
      question: 'En Go, como un tipo "implementa" una interfaz?',
      options: [
        { text: 'Usando la keyword "implements" como en Java', correct: false, explanation: 'Go no tiene keyword "implements". La implementacion es implicita.' },
        { text: 'Implementando todos los metodos de la interfaz (implicitamente)', correct: true, explanation: 'Correcto. Si un tipo tiene todos los metodos que una interfaz declara, automaticamente la satisface. No se necesita declaracion explicita.' },
        { text: 'Registrando el tipo en la interfaz con Register()', correct: false, explanation: 'No existe tal mecanismo en Go. La satisfaccion de interfaces es implicita.' },
        { text: 'Heredando de la interfaz con struct embedding', correct: false, explanation: 'No se "hereda" de interfaces. Se implementan los metodos declarados en la interfaz.' },
      ],
    },
    {
      question: 'Que es interface{} (o any en Go 1.18+)?',
      options: [
        { text: 'Un tipo que no se puede usar', correct: false, explanation: 'interface{} es perfectamente usable, pero pierde informacion de tipos.' },
        { text: 'Una interfaz sin metodos que cualquier tipo satisface', correct: true, explanation: 'Correcto. Como no tiene metodos requeridos, todo tipo la satisface. Es util para funciones genericas, pero pierde type safety.' },
        { text: 'Un tipo generico como T en Java', correct: false, explanation: 'Go tiene generics desde 1.18 con [T any], pero any/interface{} no es lo mismo que un type parameter.' },
        { text: 'Un puntero a cualquier tipo', correct: false, explanation: 'interface{} es un tipo interfaz, no un puntero. Internamente tiene un par (tipo, valor).' },
      ],
    },
    {
      question: 'Que hace un type switch en Go?',
      options: [
        { text: 'Cambia el tipo de una variable en runtime', correct: false, explanation: 'Go es estaticamente tipado. Un type switch verifica el tipo, no lo cambia.' },
        { text: 'Evalua el tipo concreto de un valor dentro de una interfaz y ejecuta ramas segun el tipo', correct: true, explanation: 'Correcto. switch v := i.(type) extrae el tipo concreto y permite manejar cada caso.' },
        { text: 'Convierte entre tipos numericos automaticamente', correct: false, explanation: 'Go no hace conversiones automaticas. Un type switch es para inspeccionar interfaces.' },
        { text: 'Es un alias de type assertion', correct: false, explanation: 'Type assertion extrae un tipo especifico. Type switch evalua multiples tipos posibles.' },
      ],
    },
    {
      question: 'Cual de estas es una interfaz del standard library de Go?',
      options: [
        { text: 'Serializable', correct: false, explanation: 'Serializable no existe en Go stdlib. Java la usa, pero Go usa encoding.Marshaler.' },
        { text: 'io.Reader (metodo Read(p []byte) (n int, err error))', correct: true, explanation: 'Correcto. io.Reader es una de las interfaces mas importantes en Go. Con un solo metodo, se usa en todo el ecosistema.' },
        { text: 'Comparable', correct: false, explanation: 'comparable existe como constraint para generics, pero no es una interfaz clasica del stdlib.' },
        { text: 'Iterable', correct: false, explanation: 'Iterable no existe en Go. Se usa range directamente sobre slices, maps, channels y strings.' },
      ],
    },
    {
      question: 'Que significa "Accept interfaces, return structs" en Go?',
      options: [
        { text: 'Todas las funciones deben aceptar interfaces y retornar structs sin excepcion', correct: false, explanation: 'Es una guia, no una regla absoluta. Hay excepciones legitimas.' },
        { text: 'Los parametros deben ser interfaces para flexibilidad, y los retornos structs concretos para dar informacion', correct: true, explanation: 'Correcto. Interfaces en parametros permiten polimorfismo. Structs en retorno dan informacion completa al caller y evitan abstracciones innecesarias.' },
        { text: 'Nunca retornar una interfaz porque Go no lo permite', correct: false, explanation: 'Go permite retornar interfaces. La guia es preferir structs cuando no hay razon para abstraer.' },
        { text: 'Es un patron de Java que se aplica igual en Go', correct: false, explanation: 'Este principio es especifico de Go y nace de las interfaces implicitas del lenguaje.' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Modulo 7: {mod.title} | Go Mastery</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-2">
      <span class="text-3xl">{mod.icon}</span>
      <div>
        <p class="text-sm text-go-accent font-mono">Modulo {MODULE_ID}</p>
        <h1 class="text-3xl font-black">{mod.title}</h1>
      </div>
    </div>
    <p class="text-go-muted mt-2">{mod.subtitle}</p>
  </div>

  <!-- Teoria: Interfaces -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Interfaces: Contratos implicitos</h2>
    <p class="text-go-muted mb-4">
      Una interfaz en Go define un conjunto de <strong class="text-go-text">firmas de metodos</strong>. Cualquier tipo
      que implemente esos metodos satisface la interfaz <strong class="text-go-text">automaticamente</strong> — sin
      keyword <code>implements</code>. Esto se llama <strong class="text-go-text">satisfaccion implicita</strong>.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// Declarar una interfaz</span>
<span class="text-go-accent">type</span> Shape <span class="text-go-accent">interface</span> {
    Area() <span class="text-go-accent">float64</span>
    Perimeter() <span class="text-go-accent">float64</span>
}

<span class="text-go-muted">// Circulo implementa Shape (sin declarar "implements")</span>
<span class="text-go-accent">type</span> Circle <span class="text-go-accent">struct</span> { Radius <span class="text-go-accent">float64</span> }

<span class="text-go-accent">func</span> (c Circle) Area() <span class="text-go-accent">float64</span>      { <span class="text-go-accent">return</span> math.Pi * c.Radius * c.Radius }
<span class="text-go-accent">func</span> (c Circle) Perimeter() <span class="text-go-accent">float64</span> { <span class="text-go-accent">return</span> 2 * math.Pi * c.Radius }

<span class="text-go-muted">// Rectangulo tambien implementa Shape</span>
<span class="text-go-accent">type</span> Rect <span class="text-go-accent">struct</span> { W, H <span class="text-go-accent">float64</span> }

<span class="text-go-accent">func</span> (r Rect) Area() <span class="text-go-accent">float64</span>      { <span class="text-go-accent">return</span> r.W * r.H }
<span class="text-go-accent">func</span> (r Rect) Perimeter() <span class="text-go-accent">float64</span> { <span class="text-go-accent">return</span> 2 * (r.W + r.H) }

<span class="text-go-muted">// Polimorfismo: ambos pueden usarse como Shape</span>
<span class="text-go-accent">func</span> PrintInfo(s Shape) {
    fmt.Printf("Area: %.2f, Perimetro: %.2f\\n", s.Area(), s.Perimeter())
}`}</pre>
    </div>
    <div class="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mb-4">
      <p class="text-blue-300 text-sm font-bold">Diferencia clave con otros lenguajes:</p>
      <p class="text-go-muted text-sm">
        En Java/C# escribes <code>class Circulo implements Shape</code>. En Go, simplemente implementas los metodos y listo.
        El tipo no necesita "saber" que una interfaz existe.
      </p>
    </div>
  </section>

  <!-- Teoria: Empty interface y type assertion -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Empty Interface y Type Assertion</h2>
    <p class="text-go-muted mb-4">
      La <strong class="text-go-text">interfaz vacia</strong> ({@html `<code>interface{}</code>`} o <code>any</code> desde Go 1.18)
      no tiene metodos, por lo que <strong class="text-go-text">cualquier tipo la satisface</strong>. Es util para
      funciones genericas, pero pierdes type safety.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// interface{} acepta cualquier valor</span>
<span class="text-go-accent">func</span> PrintAny(v <span class="text-go-accent">interface</span>{}) {
    fmt.Println(v)
}

<span class="text-go-muted">// Type assertion: extraer el tipo concreto</span>
<span class="text-go-accent">var</span> i <span class="text-go-accent">interface</span>{} = "hola"

s := i.(<span class="text-go-accent">string</span>)              <span class="text-go-muted">// panic si no es string!</span>
s, ok := i.(<span class="text-go-accent">string</span>)          <span class="text-go-muted">// ok=true, s="hola" (seguro)</span>
n, ok := i.(<span class="text-go-accent">int</span>)             <span class="text-go-muted">// ok=false, n=0 (seguro)</span>`}</pre>
    </div>

    <h3 class="text-lg font-bold text-go-text mb-3">Type Switch</h3>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-accent">func</span> Describe(i <span class="text-go-accent">interface</span>{}) <span class="text-go-accent">string</span> {
    <span class="text-go-accent">switch</span> v := i.(<span class="text-go-accent">type</span>) {
    <span class="text-go-accent">case</span> <span class="text-go-accent">string</span>:
        <span class="text-go-accent">return</span> "string: " + v
    <span class="text-go-accent">case</span> <span class="text-go-accent">int</span>:
        <span class="text-go-accent">return</span> fmt.Sprintf("int: %d", v)
    <span class="text-go-accent">case</span> <span class="text-go-accent">bool</span>:
        <span class="text-go-accent">return</span> fmt.Sprintf("bool: %t", v)
    <span class="text-go-accent">default</span>:
        <span class="text-go-accent">return</span> fmt.Sprintf("otro: %v", v)
    }
}`}</pre>
    </div>
  </section>

  <!-- Teoria: Interfaces del stdlib -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Interfaces clave del Standard Library</h2>
    <p class="text-go-muted mb-4">
      Go sigue el principio de <strong class="text-go-text">interfaces pequenas</strong>. Las mas importantes del stdlib
      tienen 1-3 metodos:
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div class="bg-go-card border border-go-border rounded-lg p-3">
        <p class="text-go-accent font-mono text-sm font-bold">io.Reader</p>
        <p class="text-go-muted text-xs mt-1">Read(p []byte) (n int, err error)</p>
        <p class="text-go-muted text-xs">Archivos, HTTP bodies, buffers...</p>
      </div>
      <div class="bg-go-card border border-go-border rounded-lg p-3">
        <p class="text-go-accent font-mono text-sm font-bold">io.Writer</p>
        <p class="text-go-muted text-xs mt-1">Write(p []byte) (n int, err error)</p>
        <p class="text-go-muted text-xs">Archivos, HTTP responses, stdout...</p>
      </div>
      <div class="bg-go-card border border-go-border rounded-lg p-3">
        <p class="text-go-accent font-mono text-sm font-bold">fmt.Stringer</p>
        <p class="text-go-muted text-xs mt-1">String() string</p>
        <p class="text-go-muted text-xs">Como toString() — define representacion textual</p>
      </div>
      <div class="bg-go-card border border-go-border rounded-lg p-3">
        <p class="text-go-accent font-mono text-sm font-bold">error</p>
        <p class="text-go-muted text-xs mt-1">Error() string</p>
        <p class="text-go-muted text-xs">La interfaz para manejo de errores en Go</p>
      </div>
    </div>

    <h3 class="text-lg font-bold text-go-text mb-3">Composicion de interfaces</h3>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// Componer interfaces pequenas en mas grandes</span>
<span class="text-go-accent">type</span> ReadWriter <span class="text-go-accent">interface</span> {
    io.Reader
    io.Writer
}

<span class="text-go-muted">// Equivalente a:</span>
<span class="text-go-accent">type</span> ReadWriter <span class="text-go-accent">interface</span> {
    Read(p []<span class="text-go-accent">byte</span>) (<span class="text-go-accent">int</span>, <span class="text-go-accent">error</span>)
    Write(p []<span class="text-go-accent">byte</span>) (<span class="text-go-accent">int</span>, <span class="text-go-accent">error</span>)
}`}</pre>
    </div>

    <div class="bg-green-900/20 border border-green-700/30 rounded-lg p-3 mb-4">
      <p class="text-green-300 text-sm font-bold">Principio idiomatico:</p>
      <p class="text-go-muted text-sm">
        <strong>"Accept interfaces, return structs"</strong> — tus funciones deben recibir interfaces como parametros
        (para flexibilidad) y retornar tipos concretos (para dar informacion completa al caller).
      </p>
    </div>
  </section>

  <!-- Branching Scenario -->
  <section class="mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Escenario: Disenando con Interfaces</h2>
    <p class="text-go-muted mb-4">
      Toma decisiones de diseno en un escenario real. Cada eleccion afecta la calidad de tu arquitectura.
    </p>
    <BranchingScenario
      nodes={scenarioNodes}
      startId="start"
      title="Sistema de Notificaciones"
      onComplete={handleScenarioComplete}
    />
  </section>

  <!-- Quiz -->
  <section class="mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Quiz: Interfaces y Polimorfismo</h2>
    <p class="text-go-muted mb-4">
      Verifica tu comprension sobre interfaces, type assertions y patrones idiomaticos.
    </p>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  {#if scenarioCompleted && quizCompleted}
    <div class="bg-go-card border border-go-accent/30 rounded-lg p-4 mb-8 text-center">
      <p class="text-go-accent font-bold text-lg">Modulo completado</p>
      <p class="text-go-muted">Escenario: {scenarioScore}/12 | Quiz: {quizScore}/{quizTotal}</p>
    </div>
  {/if}

  <!-- Sources -->
  <SourcesSection sources={mod.sources} />

  <!-- Navigation -->
  <ModuleNav currentModule={MODULE_ID} />
</div>

<!-- Vocabulary -->
<VocabularyFloat moduleId={MODULE_ID} />

<!-- Badge Notification -->
{#if showBadge && earnedBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

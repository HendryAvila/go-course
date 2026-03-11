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
  import { exercises, workedExamples } from '$lib/data/exercises/module-6';
  import { reviewCards } from '$lib/data/exercises/review-cards';

  const module = modules.find(m => m.id === 6)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'struct-architect')!);

  const quizQuestions = [
    {
      question: 'Al declarar "var p Punto" sin inicializar, los campos del struct tendr&#225;n:',
      options: [
        { text: 'Valores nil', correct: false, explanation: 'nil solo aplica a punteros, interfaces, slices, maps, channels y funciones. Los campos num&#233;ricos tienen zero value 0.' },
        { text: 'Sus zero values correspondientes (0 para num&#233;ricos, "" para strings, false para bool)', correct: true, explanation: 'Go inicializa todos los campos a su zero value. No hay valores "basura" como en C.' },
        { text: 'Un error de compilaci&#243;n por no inicializar', correct: false, explanation: 'Go siempre proporciona zero values. Declarar sin inicializar es perfectamente v&#225;lido.' },
        { text: 'Valores aleatorios en memoria', correct: false, explanation: 'Go garantiza que toda variable tiene su zero value al declararse.' },
      ],
    },
    {
      question: '&#191;Cu&#225;ndo deber&#237;as usar un pointer receiver en lugar de un value receiver?',
      options: [
        { text: 'Siempre, es la convenci&#243;n en Go', correct: false, explanation: 'Para structs peque&#241;os e inmutables, un value receiver es apropiado.' },
        { text: 'Cuando el m&#233;todo necesita modificar el receptor, o el struct es grande', correct: true, explanation: 'Pointer receivers evitan copiar el struct y permiten mutaci&#243;n. Si el struct es grande, evitas copias costosas.' },
        { text: 'Solo cuando trabajas con interfaces', correct: false, explanation: 'La elecci&#243;n de receiver no depende de interfaces, sino de mutabilidad y tama&#241;o.' },
        { text: 'Nunca, Go siempre pasa por referencia', correct: false, explanation: 'Go SIEMPRE pasa por valor. Un pointer receiver pasa una copia del puntero.' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go#methods',
    },
    {
      question: '&#191;Qu&#233; es struct embedding en Go?',
      options: [
        { text: 'Herencia de clases como en Java o Python', correct: false, explanation: 'Go NO tiene herencia. Embedding es composici&#243;n: el struct embebido se incluye como un campo sin nombre.' },
        { text: 'Incluir un struct dentro de otro sin nombre de campo, promoviendo sus m&#233;todos', correct: true, explanation: 'Los campos y m&#233;todos del struct embebido se "promueven" y se pueden acceder directamente.' },
        { text: 'Una forma de crear structs an&#243;nimos', correct: false, explanation: 'Structs an&#243;nimos son diferentes. Embedding es incluir un tipo con nombre como campo sin nombre.' },
        { text: 'Una optimizaci&#243;n del compilador', correct: false, explanation: 'Embedding es un mecanismo de composici&#243;n del lenguaje, no una optimizaci&#243;n.' },
      ],
      source: 'Go Specification',
      sourceUrl: 'https://go.dev/ref/spec#Struct_types',
    },
    {
      question: '&#191;Qu&#233; hacen los struct tags como `json:"nombre"`?',
      options: [
        { text: 'Cambian el nombre del campo dentro del programa', correct: false, explanation: 'Los tags NO cambian el nombre del campo en Go. Solo afectan c&#243;mo librer&#237;as externas lo procesan.' },
        { text: 'Son metadatos que librer&#237;as como encoding/json usan v&#237;a reflection para serializar', correct: true, explanation: 'Los tags son strings de metadatos que se leen con reflect. encoding/json los usa para mapear campos a nombres JSON.' },
        { text: 'Validan el tipo de dato en tiempo de compilaci&#243;n', correct: false, explanation: 'Los tags no participan en la validaci&#243;n de tipos. Son metadatos en forma de string.' },
        { text: 'Hacen que el campo sea exportado aunque empiece en min&#250;scula', correct: false, explanation: 'La visibilidad siempre depende de la primera letra del campo.' },
      ],
      source: 'Go Blog: JSON',
      sourceUrl: 'https://go.dev/blog/json',
    },
    {
      question: 'Si un tipo tiene pointer receivers, &#191;qu&#233; se recomienda para sus dem&#225;s m&#233;todos?',
      options: [
        { text: 'Mezclar libremente value y pointer receivers', correct: false, explanation: 'Mezclar receivers puede ser confuso y afecta qu&#233; tipos satisfacen interfaces.' },
        { text: 'Que TODOS sus m&#233;todos usen pointer receiver por consistencia', correct: true, explanation: 'La convenci&#243;n en Go es ser consistente. Si un m&#233;todo necesita pointer receiver, generalmente todos deber&#237;an usarlo.' },
        { text: 'Usar value receivers para getters y pointer para setters', correct: false, explanation: 'Aunque parece l&#243;gico, la convenci&#243;n de Go prefiere consistencia completa.' },
        { text: 'Go no permite mezclar receiver types', correct: false, explanation: 'Go s&#237; lo permite t&#233;cnicamente, pero la convenci&#243;n recomienda consistencia.' },
      ],
      source: 'Go Wiki: Code Review Comments',
      sourceUrl: 'https://go.dev/wiki/CodeReviewComments#receiver-type',
    },
  ];

  function handleQuizComplete(score: number, total: number) {
    courseStore.completeModule(6, score, total);
    if (score >= 3) {
      courseStore.unlockBadge('struct-architect');
      showBadge = true;
    }
  }
</script>

<svelte:head>
  <title>{module.title} | Curso de Go</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
  <div class="mb-8">
    <span class="text-4xl">{module.icon}</span>
    <h1 class="text-3xl font-bold mt-2">{module.title}</h1>
    <p class="text-go-muted mt-1">{module.subtitle}</p>
  </div>

  <!-- Repaso espaciado -->
  <ReviewCards moduleId={6} cards={reviewCards} />

  <!-- Structs -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Structs: Tus Propios Tipos</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go no tiene clases. En su lugar, usas <strong class="text-go-text">structs</strong> para agrupar datos
      y <strong class="text-go-text">m&#233;todos</strong> para darles comportamiento.
      Si vienes de Java o Python, piensa en un struct como una clase sin herencia, sin constructores
      m&#225;gicos y sin m&#233;todos privados impl&#237;citos. Es m&#225;s simple, y eso es intencional.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">type</span> Persona <span class="text-go-accent">struct</span> {
    Nombre   <span class="text-go-warning">string</span>
    Edad     <span class="text-go-warning">int</span>
    Activo   <span class="text-go-warning">bool</span>
}

<span class="text-go-muted">// Inicialización con campos nombrados (recomendado)</span>
p1 := Persona{Nombre: <span class="text-go-success">"Ana"</span>, Edad: 30, Activo: <span class="text-go-accent">true</span>}

<span class="text-go-muted">// Inicialización posicional (frágil, evitar)</span>
p2 := Persona{<span class="text-go-success">"Pedro"</span>, 25, <span class="text-go-accent">false</span>}

<span class="text-go-muted">// Zero value: todos los campos en su zero value</span>
<span class="text-go-accent">var</span> p3 Persona  <span class="text-go-muted">// {Nombre:"", Edad:0, Activo:false}</span></code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-warning mt-4">
      <p class="text-go-warning font-semibold text-sm mb-1">Buena pr&#225;ctica</p>
      <p class="text-go-muted text-sm">
        Siempre usa campos nombrados al inicializar structs. La forma posicional se rompe si agregas un campo al struct.
      </p>
    </div>
  </section>

  <!-- Comparacion con otros lenguajes -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Go vs Otros Lenguajes</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Si vienes de lenguajes orientados a objetos, estas comparaciones te ayudar&#225;n a hacer el cambio mental:
    </p>
    <div class="space-y-3">
      <div class="bg-go-darker rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p class="text-go-muted text-xs font-semibold mb-1">En Java/Python</p>
            <p class="text-go-muted text-sm"><code>class Persona extends Animal</code></p>
          </div>
          <div>
            <p class="text-go-accent text-xs font-semibold mb-1">En Go</p>
            <p class="text-go-muted text-sm"><code>type Persona struct &#123; Animal &#125;</code> (embedding)</p>
          </div>
        </div>
      </div>
      <div class="bg-go-darker rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p class="text-go-muted text-xs font-semibold mb-1">En Java/Python</p>
            <p class="text-go-muted text-sm"><code>new Persona("Ana", 30)</code></p>
          </div>
          <div>
            <p class="text-go-accent text-xs font-semibold mb-1">En Go</p>
            <p class="text-go-muted text-sm"><code>NuevaPersona("Ana", 30)</code> (funci&#243;n constructora)</p>
          </div>
        </div>
      </div>
      <div class="bg-go-darker rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p class="text-go-muted text-xs font-semibold mb-1">En Java/Python</p>
            <p class="text-go-muted text-sm"><code>this.nombre</code> / <code>self.nombre</code></p>
          </div>
          <div>
            <p class="text-go-accent text-xs font-semibold mb-1">En Go</p>
            <p class="text-go-muted text-sm"><code>p.Nombre</code> (el receiver se nombra expl&#237;citamente)</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Metodos -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">M&#233;todos: Funciones con Receptor</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Un m&#233;todo es una funci&#243;n con un <strong class="text-go-text">receptor</strong> (receiver). El receptor aparece
      entre <code class="text-go-accent">func</code> y el nombre del m&#233;todo, vinculando el m&#233;todo a un tipo.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Value receiver: trabaja con una COPIA del struct</span>
<span class="text-go-accent">func</span> (p Persona) Saludar() <span class="text-go-warning">string</span> {
    <span class="text-go-accent">return</span> <span class="text-go-success">"Hola, soy "</span> + p.Nombre
}

<span class="text-go-muted">// Pointer receiver: trabaja con el struct ORIGINAL</span>
<span class="text-go-accent">func</span> (p *Persona) CumplirAnios() {
    p.Edad++  <span class="text-go-muted">// modifica el struct original</span>
}</code></pre>`}
  </section>

  <!-- Value vs Pointer receivers -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Value Receiver vs Pointer Receiver</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Esta es una de las decisiones m&#225;s importantes al dise&#241;ar tipos en Go.
      La analog&#237;a: un value receiver es como enviar una <strong class="text-go-text">fotocopia</strong> de un documento &#8212;
      puedes leerla pero no puedes cambiar el original.
      Un pointer receiver es como dar acceso al <strong class="text-go-text">documento original</strong>.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="bg-go-darker rounded-lg p-4">
        <h4 class="text-go-accent font-bold text-sm mb-2">Value Receiver (p Tipo)</h4>
        <ul class="text-go-muted text-sm space-y-1">
          <li>&#8226; Trabaja con una <strong class="text-go-text">copia</strong></li>
          <li>&#8226; No puede modificar el original</li>
          <li>&#8226; Seguro para uso concurrente</li>
          <li>&#8226; Para structs peque&#241;os e inmutables</li>
        </ul>
      </div>
      <div class="bg-go-darker rounded-lg p-4">
        <h4 class="text-go-accent font-bold text-sm mb-2">Pointer Receiver (p *Tipo)</h4>
        <ul class="text-go-muted text-sm space-y-1">
          <li>&#8226; Trabaja con el <strong class="text-go-text">original</strong></li>
          <li>&#8226; Puede modificar campos</li>
          <li>&#8226; Evita copiar structs grandes</li>
          <li>&#8226; Cuando hay mutaci&#243;n o struct grande</li>
        </ul>
      </div>
    </div>
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-accent">
      <p class="text-go-accent font-semibold text-sm mb-1">Regla pr&#225;ctica</p>
      <p class="text-go-muted text-sm">
        Si un m&#233;todo necesita pointer receiver, haz que <strong class="text-go-text">todos</strong> los m&#233;todos del tipo lo usen.
        La consistencia es m&#225;s importante que la optimizaci&#243;n.
      </p>
    </div>
  </section>

  <!-- Embedding -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Embedding: Composici&#243;n sobre Herencia</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go promueve <strong class="text-go-text">composici&#243;n</strong> en lugar de herencia. Con <strong class="text-go-text">embedding</strong>,
      incluyes un tipo dentro de otro sin nombre de campo, y sus campos y m&#233;todos se
      <strong class="text-go-text">promueven</strong> autom&#225;ticamente. No es herencia &#8212; es "tiene un" en lugar de "es un".
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">type</span> Animal <span class="text-go-accent">struct</span> {
    Nombre <span class="text-go-warning">string</span>
}

<span class="text-go-accent">func</span> (a Animal) Hablar() <span class="text-go-warning">string</span> {
    <span class="text-go-accent">return</span> a.Nombre + <span class="text-go-success">" hace un sonido"</span>
}

<span class="text-go-accent">type</span> Perro <span class="text-go-accent">struct</span> {
    Animal          <span class="text-go-muted">// embedding (sin nombre de campo)</span>
    Raza <span class="text-go-warning">string</span>
}

d := Perro{Animal: Animal{Nombre: <span class="text-go-success">"Rex"</span>}, Raza: <span class="text-go-success">"Pastor"</span>}
d.Hablar()          <span class="text-go-muted">// método promovido de Animal</span>
d.Nombre            <span class="text-go-muted">// campo promovido de Animal</span>
d.Animal.Nombre     <span class="text-go-muted">// acceso explícito también funciona</span></code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-warning mt-4">
      <p class="text-go-warning font-semibold text-sm mb-1">Cuidado con la ambig&#252;edad</p>
      <p class="text-go-muted text-sm">
        Si embeds dos tipos que tienen el mismo m&#233;todo, Go no elige autom&#225;ticamente &#8212; da error de compilaci&#243;n.
        Debes desambiguar: <code class="text-go-accent">d.Tipo1.Metodo()</code> o <code class="text-go-accent">d.Tipo2.Metodo()</code>.
      </p>
    </div>
  </section>

  <!-- Constructores idiom&#225;ticos -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Constructores Idiom&#225;ticos</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go no tiene constructores como otros lenguajes. La convenci&#243;n es crear una funci&#243;n
      <code class="text-go-accent">NuevoX()</code> o <code class="text-go-accent">NewX()</code>
      que valida par&#225;metros y retorna un puntero al struct inicializado.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">NuevoServidor</span>(host <span class="text-go-warning">string</span>, puerto <span class="text-go-warning">int</span>) *Servidor {
    <span class="text-go-accent">if</span> puerto &lt;= 0 {
        puerto = 8080  <span class="text-go-muted">// valor por defecto</span>
    }
    <span class="text-go-accent">return</span> &amp;Servidor{
        Host:     host,
        Puerto:   puerto,
        MaxConns: 100,
    }
}</code></pre>`}
    <p class="text-go-muted text-sm mt-3">
      El patr&#243;n <code class="text-go-accent">NuevoX()</code> te permite establecer valores por defecto razonables
      y validar invariantes, algo que la inicializaci&#243;n directa con zero values no siempre logra.
    </p>
  </section>

  <!-- Struct Tags -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Struct Tags y Structs An&#243;nimos</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Los <strong class="text-go-text">struct tags</strong> son metadatos que librer&#237;as leen v&#237;a reflection.
      El caso m&#225;s com&#250;n: controlar la serializaci&#243;n JSON.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">type</span> Usuario <span class="text-go-accent">struct</span> {
    ID       <span class="text-go-warning">int</span>    \`json:"id"\`
    Nombre   <span class="text-go-warning">string</span> \`json:"nombre"\`
    Password <span class="text-go-warning">string</span> \`json:"-"\`              <span class="text-go-muted">// se omite del JSON</span>
    Email    <span class="text-go-warning">string</span> \`json:"email,omitempty"\` <span class="text-go-muted">// se omite si vacío</span>
}

<span class="text-go-muted">// Struct anónimo: útil para datos temporales</span>
config := <span class="text-go-accent">struct</span> {
    Host <span class="text-go-warning">string</span>
    Port <span class="text-go-warning">int</span>
}{Host: <span class="text-go-success">"localhost"</span>, Port: 8080}</code></pre>`}
  </section>

  <!-- Worked Examples -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Ejemplos Guiados</h2>
    <p class="text-go-muted mb-4">
      Sigue cada ejemplo paso a paso para dominar structs, m&#233;todos y composici&#243;n.
    </p>
    {#each workedExamples as we}
      <div class="mb-6">
        <WorkedExample
          title={we.title}
          description={we.description}
          steps={we.steps}
          playground={we.playground}
          playgroundCode={we.playgroundCode}
        />
      </div>
    {/each}
  </section>

  <!-- Code Challenges -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Desaf&#237;os de C&#243;digo</h2>
    <p class="text-go-muted mb-4">
      Aplica lo aprendido con ejercicios pr&#225;cticos de structs y m&#233;todos.
    </p>
    {#each exercises as exercise}
      <div class="mb-6">
        <CodeChallenge
          {exercise}
          onComplete={(id, score, hints) => courseStore.completeExercise(id, score, hints)}
        />
      </div>
    {/each}
  </section>

  <!-- Quiz -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Pon a Prueba tu Conocimiento</h2>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  <SourcesSection sources={module.sources} />
  <ModuleNav currentModule={6} />
</div>

<VocabularyFloat moduleId={6} />

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

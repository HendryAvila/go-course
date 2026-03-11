<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';
  import DragDrop from '$lib/components/DragDrop.svelte';
  import WorkedExample from '$lib/components/WorkedExample.svelte';
  import CodeChallenge from '$lib/components/CodeChallenge.svelte';
  import ReviewCards from '$lib/components/ReviewCards.svelte';
  import { exercises, workedExamples } from '$lib/data/exercises/module-5';
  import { reviewCards } from '$lib/data/exercises/review-cards';

  const module = modules.find(m => m.id === 5)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'slice-ninja')!);

  const dragItems = [
    { id: 'append', label: 'append()' },
    { id: 'len', label: 'len()' },
    { id: 'cap', label: 'cap()' },
    { id: 'make', label: 'make()' },
    { id: 'delete', label: 'delete()' },
    { id: 'range', label: 'range' },
  ];

  const dropZones = [
    { id: 'zone-append', label: 'Agrega elementos al final de un slice, expandiendo su capacidad si es necesario', correctItemId: 'append' },
    { id: 'zone-len', label: 'Retorna la cantidad de elementos actuales en un slice o map', correctItemId: 'len' },
    { id: 'zone-cap', label: 'Retorna la capacidad total del array subyacente de un slice', correctItemId: 'cap' },
    { id: 'zone-make', label: 'Crea un slice o map inicializado con longitud y capacidad definidas', correctItemId: 'make' },
    { id: 'zone-delete', label: 'Elimina una clave y su valor asociado de un map', correctItemId: 'delete' },
    { id: 'zone-range', label: 'Itera sobre slices, maps o strings devolviendo &#237;ndice y valor', correctItemId: 'range' },
  ];

  const quizQuestions = [
    {
      question: '&#191;Cu&#225;l es la diferencia fundamental entre un array y un slice en Go?',
      options: [
        { text: 'No hay diferencia, son sin&#243;nimos', correct: false, explanation: 'Son tipos completamente distintos. Un array se copia por valor, un slice es un header (ptr, len, cap).' },
        { text: 'El array tiene tama&#241;o fijo (parte del tipo); el slice es din&#225;mico y referencia un array subyacente', correct: true, explanation: '[3]int y [5]int son tipos DIFERENTES. Un slice []int no tiene tama&#241;o fijo y es una referencia a un array subyacente.' },
        { text: 'Los arrays son m&#225;s r&#225;pidos que los slices', correct: false, explanation: 'No necesariamente. La diferencia es sem&#225;ntica, no de performance.' },
        { text: 'Los slices no pueden contener structs', correct: false, explanation: 'Los slices pueden contener cualquier tipo, incluyendo structs.' },
      ],
      source: 'Go Blog: Slices',
      sourceUrl: 'https://go.dev/blog/slices-intro',
    },
    {
      question: '&#191;Qu&#233; pasa cuando append() supera la capacidad del slice?',
      options: [
        { text: 'Panic en runtime', correct: false, explanation: 'append maneja esto autom&#225;ticamente, no causa panic.' },
        { text: 'Go crea un nuevo array m&#225;s grande, copia los datos y retorna un slice apuntando al nuevo array', correct: true, explanation: 'Por eso SIEMPRE debes reasignar: s = append(s, val). El slice retornado puede apuntar a un array diferente.' },
        { text: 'Sobreescribe memoria adyacente', correct: false, explanation: 'Go es memory-safe. No sobreescribe memoria arbitraria.' },
        { text: 'El slice se convierte en nil', correct: false, explanation: 'append nunca retorna nil si le pasas un slice v&#225;lido.' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go#slices',
    },
    {
      question: '&#191;Qu&#233; imprime este c&#243;digo? var m map[string]int; m["key"]++',
      options: [
        { text: '1', correct: false, explanation: 'Un map nil no puede recibir escrituras.' },
        { text: 'Panic: assignment to entry in nil map', correct: true, explanation: 'Un map declarado con var es nil. Leer de un map nil retorna zero value, pero ESCRIBIR causa panic. Usa make() para inicializar.' },
        { text: '0', correct: false, explanation: 'Leer un map nil da 0, pero m["key"]++ intenta ESCRIBIR, lo que causa panic.' },
        { text: 'Error de compilaci&#243;n', correct: false, explanation: 'Compila sin problemas. El error es en runtime.' },
      ],
      source: 'Go Specification',
      sourceUrl: 'https://go.dev/ref/spec#Map_types',
    },
    {
      question: '&#191;Para qu&#233; sirve el "comma ok" pattern en maps?',
      options: [
        { text: 'Para agregar valores al map', correct: false, explanation: 'Para agregar valores simplemente haces m[key] = valor.' },
        { text: 'Para distinguir entre "clave no existe" y "clave existe con zero value"', correct: true, explanation: 'val, ok := m["key"]. Si ok es false, la clave no existe. Sin esto, no puedes saber si el 0 que recibes es real o un zero value por ausencia.' },
        { text: 'Para iterar sobre el map', correct: false, explanation: 'Para iterar usas for k, v := range m.' },
        { text: 'Para verificar si el map es nil', correct: false, explanation: 'Para verificar nil usas m == nil. El comma ok es para verificar claves.' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go#maps',
    },
    {
      question: '&#191;Qu&#233; ofrece el paquete slices de Go 1.21+?',
      options: [
        { text: 'Un tipo Slice nuevo que reemplaza a []T', correct: false, explanation: 'No reemplaza nada. Son funciones helper que trabajan con slices normales.' },
        { text: 'Funciones gen&#233;ricas como Sort, Contains, Index para manipular slices sin loops manuales', correct: true, explanation: 'slices.Sort, slices.Contains, slices.Index, etc. Usan generics para funcionar con cualquier tipo.' },
        { text: 'Solo funciones para slices de strings', correct: false, explanation: 'Son gen&#233;ricas: funcionan con []int, []string, []float64, cualquier tipo comparable/ordenable.' },
        { text: 'Un generador de slices aleatorios', correct: false, explanation: 'Para aleatorios usar&#237;as math/rand. El paquete slices es para operaciones comunes.' },
      ],
      source: 'Go 1.21 Release',
      sourceUrl: 'https://go.dev/blog/go1.21',
    },
  ];

  function handleQuizComplete(score: number, total: number) {
    courseStore.completeModule(5, score, total);
    if (score >= 3) {
      courseStore.unlockBadge('slice-ninja');
      showBadge = true;
    }
  }

  function handleDragDropComplete(correct: number, total: number) {
    courseStore.completeExercise('m5-dragdrop', correct, 0);
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
  <ReviewCards moduleId={5} cards={reviewCards} />

  <!-- Arrays -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Arrays: Tama&#241;o Fijo, Tipo Valor</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      En Go, un <strong class="text-go-text">array</strong> tiene un tama&#241;o fijo que forma parte de su tipo.
      Esto significa que <code class="text-go-accent">[3]int</code> y <code class="text-go-accent">[5]int</code>
      son tipos completamente diferentes &#8212; no puedes pasar uno donde se espera el otro.
      Piensa en los arrays como cajas de tama&#241;o exacto: si tienes una caja para 3 pelotas, no puedes meter 5.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">var</span> nums [3]<span class="text-go-warning">int</span>              <span class="text-go-muted">// [0, 0, 0] — zero value</span>
colores := [3]<span class="text-go-warning">string</span>{<span class="text-go-success">"rojo"</span>, <span class="text-go-success">"verde"</span>, <span class="text-go-success">"azul"</span>}
auto := [...]<span class="text-go-warning">int</span>{1, 2, 3}       <span class="text-go-muted">// el compilador cuenta: [3]int</span>

<span class="text-go-muted">// Copiar un array copia TODOS los valores</span>
copia := nums                   <span class="text-go-muted">// copia independiente</span>
copia[0] = 99                   <span class="text-go-muted">// nums[0] sigue siendo 0</span></code></pre>`}
    <p class="text-go-muted text-sm mt-3">
      En la pr&#225;ctica, los arrays se usan poco directamente. El protagonista en Go es el <strong class="text-go-text">slice</strong>.
    </p>
  </section>

  <!-- Slices -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Slices: Din&#225;micos y Poderosos</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Un slice es una <strong class="text-go-text">ventana din&#225;mica</strong> sobre un array subyacente.
      Internamente tiene tres componentes:
    </p>
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-go-darker rounded-lg p-3 text-center">
        <p class="text-go-accent font-bold text-sm">Pointer</p>
        <p class="text-go-muted text-xs mt-1">Apunta al primer elemento del array subyacente</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3 text-center">
        <p class="text-go-accent font-bold text-sm">Length (len)</p>
        <p class="text-go-muted text-xs mt-1">Cantidad de elementos en el slice</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3 text-center">
        <p class="text-go-accent font-bold text-sm">Capacity (cap)</p>
        <p class="text-go-muted text-xs mt-1">Tama&#241;o del array desde el pointer</p>
      </div>
    </div>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Formas de crear slices</span>
<span class="text-go-accent">var</span> s []<span class="text-go-warning">int</span>                    <span class="text-go-muted">// nil slice (== nil, len=0, cap=0)</span>
s2 := []<span class="text-go-warning">int</span>{}                   <span class="text-go-muted">// empty slice (!= nil, len=0, cap=0)</span>
s3 := []<span class="text-go-warning">int</span>{1, 2, 3}             <span class="text-go-muted">// literal con valores</span>
s4 := <span class="text-go-accent">make</span>([]<span class="text-go-warning">int</span>, 5)            <span class="text-go-muted">// len=5, cap=5</span>
s5 := <span class="text-go-accent">make</span>([]<span class="text-go-warning">int</span>, 3, 10)         <span class="text-go-muted">// len=3, cap=10</span></code></pre>`}
  </section>

  <!-- append y copy -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">append, copy y Slice Expressions</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Las operaciones esenciales con slices. La regla m&#225;s importante:
      <strong class="text-go-text">siempre reasigna el resultado de append</strong>, porque puede crear un nuevo array.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// append: agrega elementos</span>
s := []<span class="text-go-warning">int</span>{1, 2, 3}
s = <span class="text-go-accent">append</span>(s, 4, 5)             <span class="text-go-muted">// [1, 2, 3, 4, 5]</span>

<span class="text-go-muted">// Slice expressions: s[low:high:max]</span>
a := []<span class="text-go-warning">int</span>{0, 1, 2, 3, 4, 5}
b := a[1:4]                       <span class="text-go-muted">// [1, 2, 3] len=3, cap=5</span>
c := a[1:4:4]                     <span class="text-go-muted">// [1, 2, 3] len=3, cap=3 (limita cap)</span>

<span class="text-go-muted">// copy: copia independiente</span>
src := []<span class="text-go-warning">int</span>{1, 2, 3}
dst := <span class="text-go-accent">make</span>([]<span class="text-go-warning">int</span>, <span class="text-go-accent">len</span>(src))
<span class="text-go-accent">copy</span>(dst, src)                    <span class="text-go-muted">// dst es independiente de src</span></code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-warning mt-4">
      <p class="text-go-warning font-semibold text-sm mb-1">Trampa com&#250;n</p>
      <p class="text-go-muted text-sm">
        Sin <code class="text-go-accent">copy</code>, modificar un sub-slice afecta al original porque comparten
        el mismo array subyacente. Este es uno de los bugs m&#225;s comunes en Go.
      </p>
    </div>
  </section>

  <!-- Maps -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Maps: Clave-Valor</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Un <strong class="text-go-text">map</strong> asocia claves con valores. Las claves deben ser
      tipos comparables (no slices ni maps). Un map no inicializado es <code class="text-go-accent">nil</code>
      &#8212; puedes leer de &#233;l (retorna zero value) pero <strong class="text-go-text">escribir causa panic</strong>.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code>m := <span class="text-go-accent">map</span>[<span class="text-go-warning">string</span>]<span class="text-go-warning">int</span>{
    <span class="text-go-success">"go"</span>:     2009,
    <span class="text-go-success">"rust"</span>:   2010,
}

m[<span class="text-go-success">"zig"</span>] = 2016               <span class="text-go-muted">// agregar</span>
<span class="text-go-accent">delete</span>(m, <span class="text-go-success">"rust"</span>)             <span class="text-go-muted">// eliminar</span>

<span class="text-go-muted">// comma-ok pattern: ¿existe la clave?</span>
val, ok := m[<span class="text-go-success">"java"</span>]          <span class="text-go-muted">// ok=false, val=0</span>
<span class="text-go-accent">if</span> ok {
    fmt.Println(val)
}</code></pre>`}
  </section>

  <!-- Go 1.21 highlight -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Go 1.21+: Paquetes slices y maps, clear()</h2>
    <div class="bg-go-accent/10 border border-go-accent/30 rounded-lg p-3 mb-4">
      <p class="text-go-accent font-semibold text-sm">Novedad en Go 1.21</p>
      <p class="text-go-muted text-sm mt-1">
        Los paquetes <code class="text-go-accent">slices</code> y <code class="text-go-accent">maps</code>
        ofrecen funciones gen&#233;ricas para operaciones comunes. Adem&#225;s,
        <code class="text-go-accent">clear()</code> vac&#237;a maps y slices.
      </p>
    </div>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">import</span> <span class="text-go-success">"slices"</span>

nums := []<span class="text-go-warning">int</span>{5, 3, 8, 1, 9}
slices.Sort(nums)                    <span class="text-go-muted">// [1, 3, 5, 8, 9]</span>
slices.Contains(nums, 8)             <span class="text-go-muted">// true</span>
slices.Index(nums, 5)                <span class="text-go-muted">// 2</span>

<span class="text-go-muted">// clear vacía un map o slice</span>
m := <span class="text-go-accent">map</span>[<span class="text-go-warning">string</span>]<span class="text-go-warning">int</span>{<span class="text-go-success">"a"</span>: 1, <span class="text-go-success">"b"</span>: 2}
<span class="text-go-accent">clear</span>(m)                             <span class="text-go-muted">// map vacío, len=0</span></code></pre>`}
  </section>

  <!-- DragDrop exercise -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Ejercicio: Operaciones de Colecciones</h2>
    <p class="text-go-muted mb-4">
      Arrastra cada funci&#243;n u operador a la descripci&#243;n que le corresponde.
    </p>
    <DragDrop
      items={dragItems}
      zones={dropZones}
      onComplete={handleDragDropComplete}
      instruction="Arrastra cada operaci&#243;n a su descripci&#243;n correcta"
    />
  </section>

  <!-- Worked Examples -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Ejemplos Guiados</h2>
    <p class="text-go-muted mb-4">
      Sigue cada ejemplo paso a paso para entender slices y maps en profundidad.
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
      Practica con slices, maps y el infame bug del array compartido.
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
  <ModuleNav currentModule={5} />
</div>

<VocabularyFloat moduleId={5} />

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

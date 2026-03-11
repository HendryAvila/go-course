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
  import { exercises, workedExamples } from '$lib/data/exercises/module-3';
  import { reviewCards } from '$lib/data/exercises/review-cards';

  const module = modules.find(m => m.id === 3)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'flow-master')!);

  courseStore.startModule(3);

  const playgroundCode = `package main

import "fmt"

func main() {
\t// === FOR: el único loop en Go ===

\t// 1. For clásico (estilo C)
\tfmt.Println("=== For clásico ===")
\tfor i := 0; i < 5; i++ {
\t\tfmt.Printf("i = %d\\n", i)
\t}

\t// 2. For como while
\tfmt.Println("\\n=== For como while ===")
\tn := 1
\tfor n < 100 {
\t\tn *= 2
\t}
\tfmt.Printf("n = %d\\n", n)

\t// 3. Range over integers (Go 1.22+)
\tfmt.Println("\\n=== Range over integers (Go 1.22+) ===")
\tfor i := range 5 {
\t\tfmt.Printf("i = %d\\n", i)
\t}

\t// 4. For range sobre slice
\tfmt.Println("\\n=== For range sobre slice ===")
\tlenguajes := []string{"Go", "Rust", "Python"}
\tfor i, lang := range lenguajes {
\t\tfmt.Printf("[%d] %s\\n", i, lang)
\t}

\t// === DEFER: LIFO ===
\tfmt.Println("\\n=== Defer (observa el orden!) ===")
\tfmt.Println("inicio")
\tdefer fmt.Println("defer 1")
\tdefer fmt.Println("defer 2")
\tdefer fmt.Println("defer 3")
\tfmt.Println("fin")

\t// === IF con init statement ===
\tfmt.Println("\\n=== If con init statement ===")
\tif x := 42; x > 40 {
\t\tfmt.Printf("x=%d es mayor que 40\\n", x)
\t}
}`;

  const quizQuestions = [
    {
      question: '¿Cuántas estructuras de loop tiene Go?',
      options: [
        { text: 'Tres: for, while, do-while', correct: false, explanation: 'Go solo tiene for. No existe while ni do-while como keywords separadas.' },
        { text: 'Dos: for y foreach', correct: false, explanation: 'Go solo tiene for. for range reemplaza a foreach, pero sigue siendo for.' },
        { text: 'Una: for (que puede funcionar como while, foreach, etc.)', correct: true, explanation: '¡Correcto! for es el ÚNICO loop de Go. Se adapta a todas las necesidades con diferentes sintaxis.' },
        { text: 'Cuatro: for, while, loop, range', correct: false, explanation: 'Go tiene un solo loop: for. range es una keyword que se usa CON for.' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go#for',
    },
    {
      question: '¿Qué imprime este código?\nfor i := range 5 {\n  fmt.Print(i, " ")\n}',
      type: 'code' as const,
      options: [
        { text: '1 2 3 4 5', correct: false, explanation: 'range N genera de 0 a N-1, no de 1 a N.' },
        { text: '0 1 2 3 4', correct: true, explanation: '¡Correcto! range 5 genera los valores 0, 1, 2, 3, 4. Es como range(5) en Python. Esta sintaxis es nueva en Go 1.22.' },
        { text: 'Error: range solo funciona con slices', correct: false, explanation: 'Desde Go 1.22, range también funciona con enteros. Es una adición al lenguaje.' },
        { text: '0 1 2 3 4 5', correct: false, explanation: 'range 5 genera 5 valores: 0 a 4. El 5 no está incluido.' },
      ],
      source: 'Go 1.22 Release Notes',
      sourceUrl: 'https://go.dev/blog/go1.22',
    },
    {
      question: '¿En qué orden se ejecutan los defer?\ndefer fmt.Println("A")\ndefer fmt.Println("B")\ndefer fmt.Println("C")',
      type: 'code' as const,
      options: [
        { text: 'A B C (en orden)', correct: false, explanation: 'Los defers NO se ejecutan en orden — usan una pila (LIFO).' },
        { text: 'C B A (orden inverso)', correct: true, explanation: '¡Correcto! Los defer se apilan: el último en registrarse es el primero en ejecutarse (LIFO — Last In, First Out).' },
        { text: 'Solo C (los anteriores se pierden)', correct: false, explanation: 'TODOS los defers se ejecutan, no solo el último.' },
        { text: 'Aleatorio', correct: false, explanation: 'El orden de defer es determinista: siempre LIFO.' },
      ],
      source: 'Go Specification: Defer',
      sourceUrl: 'https://go.dev/ref/spec#Defer_statements',
    },
    {
      question: '¿Qué tiene de especial el switch de Go comparado con C/Java?',
      options: [
        { text: 'Es más lento', correct: false, explanation: 'El rendimiento del switch en Go es excelente. La diferencia es de comportamiento.' },
        { text: 'Los cases NO caen al siguiente (break implícito)', correct: true, explanation: '¡Correcto! En Go, cada case tiene un break implícito. Si quieres fall-through, usas la keyword fallthrough explícitamente.' },
        { text: 'Solo acepta números', correct: false, explanation: 'switch en Go acepta cualquier tipo comparable, incluyendo strings.' },
        { text: 'No existe switch en Go', correct: false, explanation: 'Go tiene switch y es muy poderoso, incluyendo switch sin expresión.' },
      ],
      source: 'Effective Go: Switch',
      sourceUrl: 'https://go.dev/doc/effective_go#switch',
    },
    {
      question: '¿Qué imprime este código?\nvalor := "inicio"\ndefer fmt.Println(valor)\nvalor = "final"\nfmt.Println(valor)',
      type: 'code' as const,
      options: [
        { text: 'final luego final', correct: false, explanation: 'defer captura el valor de los argumentos al momento de registrar el defer, no al ejecutarlo.' },
        { text: 'final luego inicio', correct: true, explanation: '¡Correcto! Primero imprime "final" (la línea normal). Luego el defer imprime "inicio" porque los argumentos de defer se evalúan cuando se registra, no cuando se ejecuta.' },
        { text: 'inicio luego final', correct: false, explanation: 'El defer se ejecuta al final de la función, no en el orden del código.' },
        { text: 'Error de compilación', correct: false, explanation: 'El código es perfectamente válido.' },
      ],
    },
  ];

  function handleQuizComplete(score: number, total: number) {
    courseStore.completeModule(3, score, total);
    if (score >= 3) {
      courseStore.unlockBadge('flow-master');
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

  <!-- Review Cards (spaced repetition from modules 1-2) -->
  <ReviewCards moduleId={3} cards={reviewCards} />

  <!-- If -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">if: Con Init Statement</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El <code class="text-go-accent">if</code> de Go no usa paréntesis alrededor de la condición, pero
      las llaves son obligatorias. Su superpoder es el <strong class="text-go-text">init statement</strong>:
      puedes declarar una variable que solo vive dentro del bloque if/else.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// if básico — sin paréntesis!</span>
<span class="text-go-accent">if</span> x > 10 {
    fmt.Println(<span class="text-go-success">"mayor"</span>)
}

<span class="text-go-muted">// if con init statement — x solo existe dentro del if/else</span>
<span class="text-go-accent">if</span> x := calcular(); x > 0 {
    fmt.Println(<span class="text-go-success">"positivo"</span>, x)
} <span class="text-go-accent">else</span> {
    fmt.Println(<span class="text-go-success">"no positivo"</span>, x)
}
<span class="text-go-muted">// x ya NO existe aquí — scope limitado</span></code></pre>`}
    <div class="bg-go-accent/5 border border-go-accent/20 rounded-lg p-3 mt-3">
      <p class="text-go-accent font-semibold text-sm mb-1">Patrón idiomático</p>
      <p class="text-go-muted text-sm">
        El init statement es la forma estándar de manejar errores en Go:
        <code class="text-go-accent">if err := doSomething(); err != nil</code>.
        El error solo vive dentro del if — no contamina el scope exterior.
      </p>
    </div>
  </section>

  <!-- For -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">for: El Único Loop</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go tiene <strong class="text-go-text">un solo loop: for</strong>. No existe while, do-while ni foreach
      como keywords separadas. Pero <code class="text-go-accent">for</code> se adapta a todas las necesidades:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// 1. For clásico (estilo C)</span>
<span class="text-go-accent">for</span> i := 0; i &lt; 10; i++ {
    fmt.Println(i)
}

<span class="text-go-muted">// 2. For como "while" (solo condición)</span>
<span class="text-go-accent">for</span> condicion {
    <span class="text-go-muted">// se repite mientras condición sea true</span>
}

<span class="text-go-muted">// 3. For range (itera sobre colecciones)</span>
<span class="text-go-accent">for</span> indice, valor := <span class="text-go-accent">range</span> coleccion {
    fmt.Println(indice, valor)
}

<span class="text-go-muted">// 4. For infinito</span>
<span class="text-go-accent">for</span> {
    <span class="text-go-muted">// loop infinito — usa break para salir</span>
}</code></pre>`}
    <p class="text-go-muted text-sm mt-3">
      Si no necesitas el índice en un range, usa <code class="text-go-accent">_</code>:
      <code class="text-go-accent">for _, valor := range coleccion</code>.
      Si no necesitas el valor: <code class="text-go-accent">for i := range coleccion</code>.
    </p>
  </section>

  <!-- Range over integers -->
  <section class="card mb-6">
    <div class="flex items-center gap-2 mb-3">
      <h2 class="text-xl font-bold">range sobre Enteros</h2>
      <span class="badge bg-go-success/20 text-go-success text-xs">Go 1.22+</span>
    </div>
    <p class="text-go-muted leading-relaxed mb-4">
      Desde <strong class="text-go-text">Go 1.22</strong>, puedes usar <code class="text-go-accent">range</code>
      directamente con un número entero. Esto simplifica los contadores clásicos:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Antes (Go &lt; 1.22)</span>
<span class="text-go-accent">for</span> i := 0; i &lt; 5; i++ {
    fmt.Println(i)
}

<span class="text-go-muted">// Ahora (Go 1.22+) — más limpio</span>
<span class="text-go-accent">for</span> i := <span class="text-go-accent">range</span> 5 {
    fmt.Println(i)  <span class="text-go-muted">// 0, 1, 2, 3, 4</span>
}</code></pre>`}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm mb-1">Cuándo usarlo</p>
        <p class="text-go-muted text-sm">
          Cuando necesitas iterar N veces y solo te importa el índice. Es más claro y tiene menos posibilidad de
          errores off-by-one.
        </p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm mb-1">Equivalencia</p>
        <p class="text-go-muted text-sm">
          <code class="text-go-accent">range 5</code> genera: 0, 1, 2, 3, 4.
          Es como <code class="text-go-accent">range(5)</code> en Python — el límite superior no se incluye.
        </p>
      </div>
    </div>
  </section>

  <!-- Switch -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">switch: Sin Break Necesario</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El <code class="text-go-accent">switch</code> de Go es más limpio que en C/Java: cada case tiene
      <strong class="text-go-text">break implícito</strong>. No hay "fall-through" accidental.
      Si realmente quieres que caiga al siguiente case, usas <code class="text-go-accent">fallthrough</code> explícitamente.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// switch básico — no necesita break!</span>
<span class="text-go-accent">switch</span> dia {
<span class="text-go-accent">case</span> <span class="text-go-success">"lunes"</span>:
    fmt.Println(<span class="text-go-success">"inicio de semana"</span>)
<span class="text-go-accent">case</span> <span class="text-go-success">"viernes"</span>, <span class="text-go-success">"sábado"</span>:   <span class="text-go-muted">// múltiples valores en un case</span>
    fmt.Println(<span class="text-go-success">"fin de semana!"</span>)
<span class="text-go-accent">default</span>:
    fmt.Println(<span class="text-go-success">"día normal"</span>)
}

<span class="text-go-muted">// switch sin expresión — reemplaza cadenas de if/else</span>
<span class="text-go-accent">switch</span> {
<span class="text-go-accent">case</span> hora &lt; 12:
    fmt.Println(<span class="text-go-success">"buenos días"</span>)
<span class="text-go-accent">case</span> hora &lt; 18:
    fmt.Println(<span class="text-go-success">"buenas tardes"</span>)
<span class="text-go-accent">default</span>:
    fmt.Println(<span class="text-go-success">"buenas noches"</span>)
}</code></pre>`}
    <div class="bg-go-accent/5 border border-go-accent/20 rounded-lg p-3 mt-3">
      <p class="text-go-accent font-semibold text-sm mb-1">Switch sin expresión</p>
      <p class="text-go-muted text-sm">
        Un <code class="text-go-accent">switch</code> sin expresión equivale a <code class="text-go-accent">switch true</code>.
        Cada case se evalúa como un booleano. Es una alternativa más legible a cadenas largas de if/else if.
      </p>
    </div>
  </section>

  <!-- Defer -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">defer: Ejecución Diferida (LIFO)</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      <code class="text-go-accent">defer</code> programa una función para ejecutarse cuando la función contenedora
      retorna. Los defers se apilan en orden <strong class="text-go-text">LIFO</strong> (Last In, First Out).
      Piensa en una pila de platos: el último que pones es el primero que sacas.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">func</span> <span class="text-go-warning">procesarArchivo</span>() {
    f, err := os.Open(<span class="text-go-success">"datos.txt"</span>)
    <span class="text-go-accent">if</span> err != <span class="text-go-accent">nil</span> {
        log.Fatal(err)
    }
    <span class="text-go-accent">defer</span> f.Close()  <span class="text-go-muted">// Se cierra al salir, sin importar cómo</span>

    <span class="text-go-muted">// ... trabajar con el archivo ...</span>
    <span class="text-go-muted">// f.Close() SIEMPRE se ejecuta: return, panic, fin normal</span>
}</code></pre>`}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-success font-semibold text-sm mb-1">Usos comunes</p>
        <ul class="text-go-muted text-sm space-y-1">
          <li>&#8226; Cerrar archivos y conexiones</li>
          <li>&#8226; Desbloquear mutexes</li>
          <li>&#8226; Cleanup de recursos</li>
        </ul>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-danger font-semibold text-sm mb-1">Cuidado</p>
        <ul class="text-go-muted text-sm space-y-1">
          <li>&#8226; Los argumentos se evalúan al registrar, no al ejecutar</li>
          <li>&#8226; defer en loops puede acumular muchos defers</li>
          <li>&#8226; Se ejecuta al salir de la <em>función</em>, no del bloque</li>
        </ul>
      </div>
    </div>
    <div class="bg-go-warning/5 border border-go-warning/20 rounded-lg p-3 mt-4">
      <p class="text-go-warning font-semibold text-sm mb-1">Trampa sutil: argumentos de defer</p>
      <p class="text-go-muted text-sm">
        Los argumentos de defer se evalúan inmediatamente:
        <code class="text-go-accent">valor := "inicio"; defer fmt.Println(valor); valor = "final"</code>
        imprime <strong class="text-go-text">"inicio"</strong>, no "final". El valor se captura al momento del defer.
      </p>
    </div>
  </section>

  <!-- Worked Examples -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Ejemplos Guiados</h2>
    <p class="text-go-muted mb-4">
      Sigue paso a paso cómo funciona el for en sus múltiples formas y cómo se comporta defer con su orden LIFO.
    </p>
    <div class="space-y-6">
      {#each workedExamples as we}
        <WorkedExample
          title={we.title}
          description={we.description}
          steps={we.steps}
          playground={we.playground}
          playgroundCode={we.playgroundCode}
        />
      {/each}
    </div>
  </section>

  <!-- GoPlayground -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Experimenta con Control de Flujo</h2>
    <p class="text-go-muted mb-4">
      Prueba las variaciones de for, observa el orden LIFO de defer y experimenta con switch.
      Intenta usar <code class="text-go-accent">range 10</code> para probar la sintaxis de Go 1.22+.
    </p>
    <GoPlayground
      code={playgroundCode}
      title="Control de Flujo en Go"
      description="Ejecuta el código y observa especialmente el orden de los defer. Prueba agregar más variaciones de for."
    />
  </section>

  <!-- Code Challenges -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Desafíos de Código</h2>
    <p class="text-go-muted mb-4">
      Practica if con init statements, switch, for con range, y defer. Incluye el nuevo range over integers de Go 1.22+.
    </p>
    <div class="space-y-6">
      {#each exercises as exercise}
        <CodeChallenge {exercise} onComplete={(id, score, hints) => courseStore.completeExercise(id, score, hints)} />
      {/each}
    </div>
  </section>

  <!-- Quiz -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Pon a Prueba tu Conocimiento</h2>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  <SourcesSection sources={module.sources} />
  <ModuleNav currentModule={3} />
</div>

<VocabularyFloat moduleId={3} />

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

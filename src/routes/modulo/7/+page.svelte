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
  import { exercises, workedExamples } from '$lib/data/exercises/module-7';
  import { reviewCards } from '$lib/data/exercises/review-cards';

  const module = modules.find(m => m.id === 7)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'interface-guru')!);

  const interfacePlaygroundCode = `package main

import "fmt"

// interface{} vacía — acepta CUALQUIER tipo
func describir(i interface{}) {
\tswitch v := i.(type) {
\tcase int:
\t\tfmt.Printf("Entero: %d\\n", v)
\tcase string:
\t\tfmt.Printf("String: %q\\n", v)
\tcase bool:
\t\tfmt.Printf("Booleano: %t\\n", v)
\tdefault:
\t\tfmt.Printf("Tipo desconocido: %v\\n", v)
\t}
}

func main() {
\tdescribir(42)
\tdescribir("hola")
\tdescribir(true)
\tdescribir(3.14)
}`;

  const quizQuestions = [
    {
      question: '¿Cómo implementa un tipo una interfaz en Go?',
      options: [
        { text: 'Usando la keyword "implements"', correct: false, explanation: 'Go no tiene keyword "implements". Las interfaces son implícitas.' },
        { text: 'Automáticamente, al tener todos los métodos que la interfaz requiere', correct: true, explanation: '¡Correcto! Es "duck typing" estático: si un tipo tiene los métodos correctos, satisface la interfaz sin declararlo.' },
        { text: 'Registrando el tipo con una función especial', correct: false, explanation: 'No hay registro. La satisfacción de interfaces es verificada por el compilador.' },
        { text: 'Heredando de la interfaz', correct: false, explanation: 'Go no tiene herencia. Usa composición e interfaces implícitas.' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go#interfaces',
    },
    {
      question: '¿Cuál es la forma SEGURA de hacer un type assertion?',
      options: [
        { text: 'val := i.(Tipo)', correct: false, explanation: 'Esta forma causa panic si el tipo no coincide. No es segura.' },
        { text: 'val, ok := i.(Tipo)', correct: true, explanation: '¡Correcto! La forma "comma ok" retorna false en el segundo valor si la aserción falla, sin causar panic.' },
        { text: 'val = Tipo(i)', correct: false, explanation: 'Eso es una conversión de tipo, no una type assertion. Son cosas diferentes.' },
        { text: 'try { val := i.(Tipo) }', correct: false, explanation: 'Go no tiene try/catch. Usa la forma "comma ok" para type assertions seguras.' },
      ],
      source: 'Go Specification',
      sourceUrl: 'https://go.dev/ref/spec#Type_assertions',
    },
    {
      question: '¿Qué imprime este código?\n\ntype Stringer interface { String() string }\ntype Numero int\nfunc (n Numero) String() string { return "soy un numero" }\nvar s Stringer = Numero(42)\nfmt.Println(s)',
      options: [
        { text: '42', correct: false, explanation: 'Aunque el valor subyacente es 42, el tipo implementa String() que retorna otro texto.' },
        { text: 'soy un numero', correct: true, explanation: '¡Correcto! fmt.Println llama a String() cuando el tipo implementa fmt.Stringer.' },
        { text: 'Numero(42)', correct: false, explanation: 'fmt.Println usa String() del tipo si está disponible, no la representación por defecto.' },
        { text: 'Error de compilación', correct: false, explanation: 'Numero implementa Stringer correctamente. El código es válido.' },
      ],
      source: 'Go by Example: Interfaces',
      sourceUrl: 'https://gobyexample.com/interfaces',
    },
    {
      question: 'Rob Pike dijo: "The bigger the interface, the weaker the abstraction." ¿Qué significa?',
      options: [
        { text: 'Que las interfaces grandes son más rápidas', correct: false, explanation: 'El tamaño de una interfaz no afecta el rendimiento. Se refiere al diseño.' },
        { text: 'Que las interfaces deben tener pocos métodos para ser más útiles y reutilizables', correct: true, explanation: '¡Correcto! Interfaces pequeñas (1-2 métodos) como io.Reader son más fáciles de implementar y componer. io.Reader solo pide Read() y la implementan cientos de tipos.' },
        { text: 'Que no se deben usar interfaces en Go', correct: false, explanation: 'Las interfaces son fundamentales en Go. La cita promueve interfaces pequeñas, no eliminarlas.' },
        { text: 'Que las interfaces deben ser abstractas, no concretas', correct: false, explanation: 'La cita se refiere al tamaño (cantidad de métodos), no al nivel de abstracción.' },
      ],
      source: 'Go Proverbs',
      sourceUrl: 'https://go-proverbs.github.io/',
    },
    {
      question: '¿Qué hace switch v := f.(type) { case T: ... }?',
      options: [
        { text: 'Convierte f al tipo T', correct: false, explanation: 'No convierte. Verifica el tipo concreto detrás de la interfaz y ejecuta el case correspondiente.' },
        { text: 'Es un type switch que ejecuta el case cuyo tipo coincida con el tipo concreto de f', correct: true, explanation: '¡Correcto! El type switch verifica el tipo dinámico de f. La variable v tiene el tipo correcto en cada case, sin necesidad de otra assertion.' },
        { text: 'Crea una nueva variable del tipo T', correct: false, explanation: 'v toma el tipo del case que coincida, no crea una variable nueva de T.' },
        { text: 'Compara los valores de f con los de tipo T', correct: false, explanation: 'Compara TIPOS, no valores. Es para saber qué tipo concreto tiene una interfaz.' },
      ],
      source: 'Go Specification',
      sourceUrl: 'https://go.dev/ref/spec#Type_switches',
    },
  ];

  function handleQuizComplete(score: number, total: number) {
    courseStore.completeModule(7, score, total);
    if (score >= 3) {
      courseStore.unlockBadge('interface-guru');
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

  <!-- Repaso Espaciado -->
  <ReviewCards moduleId={7} cards={reviewCards} />

  <!-- Intro: Duck Typing -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Si camina como pato y hace cuac...</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      En la mayoría de lenguajes, para que un tipo implemente una interfaz necesitas declarar
      <strong class="text-go-text">implements</strong> explícitamente. En Go,
      <strong class="text-go-accent">no</strong>.
    </p>
    <p class="text-go-muted leading-relaxed mb-4">
      Si tu tipo tiene los métodos correctos, <strong class="text-go-text">automáticamente</strong>
      satisface la interfaz. No hay keyword, no hay registro, no hay ceremonia. El compilador lo
      verifica por ti.
    </p>
    <div class="bg-go-accent/5 border border-go-accent/20 rounded-lg p-4 mb-4">
      <p class="text-go-accent font-semibold text-sm mb-1">Analogía</p>
      <p class="text-sm text-go-muted">
        Imagina una entrevista de trabajo: en Java te piden un diploma (<code class="text-go-accent">implements</code>).
        En Go, si sabes hacer el trabajo (tienes los métodos), te contratan sin preguntar por papeles.
      </p>
    </div>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Declarar una interfaz</span>
<span class="text-go-accent">type</span> <span class="text-go-warning">Hablante</span> <span class="text-go-accent">interface</span> {
    Hablar() <span class="text-go-accent">string</span>
}

<span class="text-go-muted">// Perro implementa Hablante... sin decir "implements"</span>
<span class="text-go-accent">type</span> <span class="text-go-warning">Perro</span> <span class="text-go-accent">struct</span>{ Nombre <span class="text-go-accent">string</span> }

<span class="text-go-accent">func</span> (p Perro) <span class="text-go-warning">Hablar</span>() <span class="text-go-accent">string</span> {
    <span class="text-go-accent">return</span> <span class="text-go-success">"Guau! Soy "</span> + p.Nombre
}</code></pre>`}
  </section>

  <!-- Type Assertions y Type Switches -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Type Assertions: Recuperar el Tipo Concreto</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Cuando tienes una variable de tipo interfaz, a veces necesitas saber <strong class="text-go-text">qué tipo concreto</strong>
      hay detrás. Go ofrece dos herramientas para esto:
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Type Assertion</p>
        <p class="text-go-muted text-sm mb-2">Extrae un tipo específico</p>
        {@html `<pre class="font-mono text-xs"><code><span class="text-go-muted">// Forma segura (comma ok)</span>
val, ok := i.(<span class="text-go-warning">string</span>)
<span class="text-go-accent">if</span> ok {
    fmt.Println(val)
}</code></pre>`}
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Type Switch</p>
        <p class="text-go-muted text-sm mb-2">Maneja múltiples tipos</p>
        {@html `<pre class="font-mono text-xs"><code><span class="text-go-accent">switch</span> v := i.(<span class="text-go-accent">type</span>) {
<span class="text-go-accent">case</span> <span class="text-go-warning">string</span>:
    fmt.Println(<span class="text-go-success">"String:"</span>, v)
<span class="text-go-accent">case</span> <span class="text-go-warning">int</span>:
    fmt.Println(<span class="text-go-success">"Int:"</span>, v)
}</code></pre>`}
      </div>
    </div>
    <div class="bg-go-danger/10 border border-go-danger/30 rounded-lg p-3">
      <p class="text-go-danger font-semibold text-sm mb-1">Cuidado</p>
      <p class="text-sm text-go-muted">
        <code class="text-go-danger">val := i.(string)</code> sin el segundo valor causa <strong>panic</strong>
        si <code>i</code> no es un string. Siempre usa la forma <code class="text-go-accent">val, ok := i.(string)</code>.
      </p>
    </div>
  </section>

  <!-- Interfaces de la stdlib -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Interfaces Clave de la Stdlib</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go favorece interfaces <strong class="text-go-text">pequeñas</strong>. Las más importantes de la stdlib
      tienen 1 o 2 métodos:
    </p>
    <div class="bg-go-darker rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-go-border text-go-accent">
            <th class="text-left p-3 font-semibold">Interfaz</th>
            <th class="text-left p-3 font-semibold">Método</th>
            <th class="text-left p-3 font-semibold">Uso</th>
          </tr>
        </thead>
        <tbody class="text-go-muted">
          <tr class="border-b border-go-border/50">
            <td class="p-3"><code class="text-go-accent">io.Reader</code></td>
            <td class="p-3"><code>Read(p []byte) (n int, err error)</code></td>
            <td class="p-3">Leer datos de cualquier fuente</td>
          </tr>
          <tr class="border-b border-go-border/50">
            <td class="p-3"><code class="text-go-accent">io.Writer</code></td>
            <td class="p-3"><code>Write(p []byte) (n int, err error)</code></td>
            <td class="p-3">Escribir datos a cualquier destino</td>
          </tr>
          <tr class="border-b border-go-border/50">
            <td class="p-3"><code class="text-go-accent">fmt.Stringer</code></td>
            <td class="p-3"><code>String() string</code></td>
            <td class="p-3">Controlar cómo se imprime un tipo</td>
          </tr>
          <tr class="border-b border-go-border/50">
            <td class="p-3"><code class="text-go-accent">error</code></td>
            <td class="p-3"><code>Error() string</code></td>
            <td class="p-3">Representar errores como valores</td>
          </tr>
          <tr>
            <td class="p-3"><code class="text-go-accent">sort.Interface</code></td>
            <td class="p-3"><code>Len, Less, Swap</code></td>
            <td class="p-3">Ordenar colecciones</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Composición de interfaces -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Composición: Interfaces Pequeñas y Poderosas</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      La filosofía de Go es clara: interfaces pequeñas que se <strong class="text-go-text">componen</strong>.
    </p>
    <div class="bg-go-accent/5 border border-go-accent/20 rounded-lg p-4 mb-4">
      <p class="text-go-accent font-semibold text-sm italic">
        "The bigger the interface, the weaker the abstraction."
      </p>
      <p class="text-xs text-go-muted mt-1">— Rob Pike, Go Proverbs</p>
    </div>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Interfaces pequeñas (1 método cada una)</span>
<span class="text-go-accent">type</span> <span class="text-go-warning">Reader</span> <span class="text-go-accent">interface</span> { Read(p []<span class="text-go-accent">byte</span>) (<span class="text-go-accent">int</span>, <span class="text-go-accent">error</span>) }
<span class="text-go-accent">type</span> <span class="text-go-warning">Writer</span> <span class="text-go-accent">interface</span> { Write(p []<span class="text-go-accent">byte</span>) (<span class="text-go-accent">int</span>, <span class="text-go-accent">error</span>) }

<span class="text-go-muted">// Se componen en interfaces más grandes</span>
<span class="text-go-accent">type</span> <span class="text-go-warning">ReadWriter</span> <span class="text-go-accent">interface</span> {
    Reader
    Writer
}

<span class="text-go-muted">// Un tipo que implemente Read() y Write()</span>
<span class="text-go-muted">// automáticamente satisface Reader, Writer Y ReadWriter</span></code></pre>`}
    <p class="text-go-muted text-sm mt-3">
      Este patrón permite que un tipo satisfaga <strong class="text-go-text">múltiples interfaces</strong>
      sin esfuerzo adicional. En el stdlib, <code class="text-go-accent">os.File</code> implementa
      Reader, Writer, Closer y muchas más.
    </p>
  </section>

  <!-- GoPlayground: interface vacía -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Experimenta: interface y Type Switch</h2>
    <p class="text-go-muted mb-4">
      La interfaz vacía <code class="text-go-accent">interface{'{}'}</code> (o <code class="text-go-accent">any</code> desde Go 1.18)
      acepta cualquier tipo. Combinada con type switch, es poderosa:
    </p>
    <GoPlayground
      code={interfacePlaygroundCode}
      title="interface y Type Switch"
      description="Prueba agregar más tipos al switch: float64, []int, struct..."
    />
  </section>

  <!-- Worked Examples -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Ejemplos Guiados</h2>
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
    <h2 class="text-xl font-bold mb-4">Desafios de Codigo</h2>
    <p class="text-go-muted mb-4">
      Pon en practica lo aprendido. Cada ejercicio va subiendo de dificultad:
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
  <ModuleNav currentModule={7} />
</div>

<VocabularyFloat moduleId={7} />

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

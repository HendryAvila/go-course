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
  import { exercises, workedExamples } from '$lib/data/exercises/module-4';
  import { reviewCards } from '$lib/data/exercises/review-cards';

  const module = modules.find(m => m.id === 4)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'func-wizard')!);

  const quizQuestions = [
    {
      question: '&#191;Cu&#225;l es el patr&#243;n idiom&#225;tico de retorno de errores en Go?',
      options: [
        { text: 'Lanzar excepciones con throw', correct: false, explanation: 'Go NO tiene excepciones ni throw. Los errores son valores que se retornan.' },
        { text: 'Retornar (valor, error) donde error es nil si no hay error', correct: true, explanation: 'El patr&#243;n (value, error) es la base del manejo de errores en Go. Si error == nil, todo fue bien.' },
        { text: 'Usar un bloque try/catch', correct: false, explanation: 'Go no tiene try/catch. Usa retornos m&#250;ltiples con el tipo error.' },
        { text: 'Retornar -1 cuando hay error', correct: false, explanation: 'Retornar valores m&#225;gicos es un anti-patr&#243;n. Go usa el tipo error expl&#237;citamente.' },
      ],
      source: 'Go Blog: Error handling',
      sourceUrl: 'https://go.dev/blog/error-handling-and-go',
    },
    {
      question: '&#191;Qu&#233; es un closure en Go?',
      options: [
        { text: 'Una funci&#243;n que cierra el programa', correct: false, explanation: 'Closure no tiene nada que ver con cerrar programas. Es un concepto de funciones.' },
        { text: 'Una funci&#243;n que captura y recuerda variables de su scope exterior', correct: true, explanation: 'Un closure "cierra sobre" variables del scope que lo rodea, manteni&#233;ndolas vivas entre llamadas.' },
        { text: 'Una funci&#243;n que solo se ejecuta una vez', correct: false, explanation: 'Un closure se puede ejecutar m&#250;ltiples veces, y cada vez accede a las variables capturadas.' },
        { text: 'Un m&#233;todo de un struct', correct: false, explanation: 'Los m&#233;todos se asocian a tipos. Un closure es una funci&#243;n an&#243;nima que captura variables.' },
      ],
      source: 'Go by Example: Closures',
      sourceUrl: 'https://gobyexample.com/closures',
    },
    {
      question: '&#191;Qu&#233; significa "...int" en una firma de funci&#243;n?',
      options: [
        { text: 'Un array de longitud variable', correct: false, explanation: 'No es un array (tienen longitud fija en Go). Es un par&#225;metro variadic que se recibe como slice.' },
        { text: 'Un par&#225;metro variadic que acepta cero o m&#225;s enteros', correct: true, explanation: 'Los par&#225;metros variadic se definen con ... y se reciben como un slice dentro de la funci&#243;n.' },
        { text: 'Un puntero a un entero', correct: false, explanation: 'Un puntero se escribe *int. Los ... indican par&#225;metro variadic.' },
        { text: 'Un spread operator como en JavaScript', correct: false, explanation: 'Aunque la sintaxis es similar, en Go ... define un par&#225;metro variadic en la firma.' },
      ],
      source: 'Go Specification',
      sourceUrl: 'https://go.dev/ref/spec#Passing_arguments_to_..._parameters',
    },
    {
      question: 'Desde Go 1.21, &#191;c&#243;mo obtienes el m&#237;nimo de varios n&#250;meros?',
      options: [
        { text: 'math.Min(a, b) encadenando llamadas', correct: false, explanation: 'math.Min solo acepta 2 float64. Desde Go 1.21 hay una forma mejor.' },
        { text: 'Escribir un loop manual que compare todos', correct: false, explanation: 'Era necesario antes de Go 1.21, pero ya no.' },
        { text: 'Usar el builtin min(a, b, c, ...) que acepta cualquier tipo ordered', correct: true, explanation: 'Go 1.21 agreg&#243; min() y max() como builtins gen&#233;ricos. Aceptan 2+ argumentos de cualquier tipo ordenable.' },
        { text: 'Importar el paquete "slices" y usar slices.Min', correct: false, explanation: 'slices.Min no existe. Los builtins min/max trabajan con valores individuales, no con slices.' },
      ],
      source: 'Go 1.21 Release Notes',
      sourceUrl: 'https://go.dev/blog/go1.21',
    },
    {
      question: '&#191;Las funciones en Go son "first-class citizens"? &#191;Qu&#233; significa?',
      options: [
        { text: 'Que son m&#225;s r&#225;pidas que en otros lenguajes', correct: false, explanation: 'First-class no se refiere a rendimiento, sino a c&#243;mo el lenguaje trata a las funciones.' },
        { text: 'Que pueden asignarse a variables, pasarse como argumentos y retornarse de otras funciones', correct: true, explanation: 'En Go las funciones son valores: puedes guardarlas en variables, pasarlas como par&#225;metros y retornarlas.' },
        { text: 'Que siempre se ejecutan primero en el programa', correct: false, explanation: 'First-class se refiere a que las funciones son tratadas como cualquier otro valor.' },
        { text: 'Que solo pueden estar en el paquete main', correct: false, explanation: 'Las funciones pueden estar en cualquier paquete.' },
      ],
      source: 'Go by Example: Functions',
      sourceUrl: 'https://gobyexample.com/functions',
    },
  ];

  function handleQuizComplete(score: number, total: number) {
    courseStore.completeModule(4, score, total);
    if (score >= 3) {
      courseStore.unlockBadge('func-wizard');
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
  <ReviewCards moduleId={4} cards={reviewCards} />

  <!-- Declaracion de funciones -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Declaraci&#243;n de Funciones</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Las funciones en Go se declaran con <code class="text-go-accent">func</code>. Son directas y expl&#237;citas:
      ves los tipos de los par&#225;metros y lo que retorna sin ambig&#252;edades. Piensa en ellas como
      <strong class="text-go-text">contratos</strong>: la firma te dice exactamente qu&#233; entra y qu&#233; sale.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Función básica</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">saludar</span>(nombre <span class="text-go-warning">string</span>) <span class="text-go-warning">string</span> {
    <span class="text-go-accent">return</span> <span class="text-go-success">"Hola, "</span> + nombre
}

<span class="text-go-muted">// Parámetros del mismo tipo se pueden agrupar</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">sumar</span>(a, b <span class="text-go-warning">int</span>) <span class="text-go-warning">int</span> {
    <span class="text-go-accent">return</span> a + b
}</code></pre>`}
  </section>

  <!-- Multiples retornos -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">M&#250;ltiples Valores de Retorno</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El superpoder de Go: una funci&#243;n puede retornar <strong class="text-go-text">m&#250;ltiples valores</strong>.
      Esto es la base del manejo de errores en Go &#8212; el patr&#243;n
      <code class="text-go-accent">(valor, error)</code>. En otros lenguajes lanzar&#237;as una excepci&#243;n;
      en Go retornas el error como un valor m&#225;s.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Patrón clásico: (value, error)</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">dividir</span>(a, b <span class="text-go-warning">float64</span>) (<span class="text-go-warning">float64</span>, <span class="text-go-warning">error</span>) {
    <span class="text-go-accent">if</span> b == 0 {
        <span class="text-go-accent">return</span> 0, errors.New(<span class="text-go-success">"división por cero"</span>)
    }
    <span class="text-go-accent">return</span> a / b, <span class="text-go-accent">nil</span>
}

<span class="text-go-muted">// Uso: SIEMPRE verificar el error</span>
resultado, err := dividir(10, 0)
<span class="text-go-accent">if</span> err != <span class="text-go-accent">nil</span> {
    fmt.Println(<span class="text-go-success">"Error:"</span>, err)
    <span class="text-go-accent">return</span>
}
fmt.Println(resultado)</code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-warning mt-4">
      <p class="text-go-warning font-semibold text-sm mb-1">Regla de oro</p>
      <p class="text-go-muted text-sm">
        Siempre verifica el error antes de usar el valor. Ignorar errores con
        <code class="text-go-accent">_</code> es aceptable solo cuando sabes que no puede fallar.
      </p>
    </div>
  </section>

  <!-- Named Returns -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Named Returns</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Puedes nombrar los valores de retorno. Se comportan como variables locales pre-declaradas
      y permiten un <strong class="text-go-text">naked return</strong> (return sin argumentos).
      Es como darle nombre a las "cajas" donde pondr&#225;s los resultados.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">rectangulo</span>(ancho, alto <span class="text-go-warning">float64</span>) (area, perimetro <span class="text-go-warning">float64</span>) {
    area = ancho * alto
    perimetro = 2 * (ancho + alto)
    <span class="text-go-accent">return</span>  <span class="text-go-muted">// naked return: retorna area y perimetro</span>
}</code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-accent mt-4">
      <p class="text-go-accent font-semibold text-sm mb-1">Consejo</p>
      <p class="text-go-muted text-sm">
        Usa named returns en funciones cortas para documentar qu&#233; retorna cada valor.
        En funciones largas, el naked return reduce la legibilidad &#8212; mejor ser expl&#237;cito.
      </p>
    </div>
  </section>

  <!-- Variadic -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Funciones Variadic</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Una funci&#243;n variadic acepta un n&#250;mero variable de argumentos usando <code class="text-go-accent">...</code>.
      Dentro de la funci&#243;n, se reciben como un <strong class="text-go-text">slice</strong>.
      Piensa en <code class="text-go-accent">fmt.Println</code>: acepta cualquier cantidad de argumentos &#8212; eso es variadic.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">sumarTodos</span>(nums ...<span class="text-go-warning">int</span>) <span class="text-go-warning">int</span> {
    total := 0
    <span class="text-go-accent">for</span> _, n := <span class="text-go-accent">range</span> nums {
        total += n
    }
    <span class="text-go-accent">return</span> total
}

<span class="text-go-muted">// Llamadas válidas:</span>
sumarTodos(1, 2, 3)         <span class="text-go-muted">// 6</span>
sumarTodos(1, 2, 3, 4, 5)   <span class="text-go-muted">// 15</span>
sumarTodos()                 <span class="text-go-muted">// 0 (slice vacío)</span>

<span class="text-go-muted">// Expandir un slice existente con ...</span>
nums := []<span class="text-go-warning">int</span>{10, 20, 30}
sumarTodos(nums...)          <span class="text-go-muted">// 60</span></code></pre>`}
  </section>

  <!-- Closures y first-class -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Funciones como Valores y Closures</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      En Go, las funciones son <strong class="text-go-text">ciudadanos de primera clase</strong>: puedes
      asignarlas a variables, pasarlas como argumentos y retornarlas de otras funciones.
      Un <strong class="text-go-text">closure</strong> es una funci&#243;n que "recuerda" las variables del lugar donde fue creada.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Función como valor</span>
operacion := <span class="text-go-accent">func</span>(a, b <span class="text-go-warning">int</span>) <span class="text-go-warning">int</span> { <span class="text-go-accent">return</span> a + b }
fmt.Println(operacion(3, 4)) <span class="text-go-muted">// 7</span>

<span class="text-go-muted">// Closure: captura la variable 'total' del scope exterior</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">acumulador</span>() <span class="text-go-accent">func</span>(<span class="text-go-warning">int</span>) <span class="text-go-warning">int</span> {
    total := 0
    <span class="text-go-accent">return func</span>(n <span class="text-go-warning">int</span>) <span class="text-go-warning">int</span> {
        total += n  <span class="text-go-muted">// total vive mientras exista el closure</span>
        <span class="text-go-accent">return</span> total
    }
}

acc := acumulador()
fmt.Println(acc(5))   <span class="text-go-muted">// 5</span>
fmt.Println(acc(10))  <span class="text-go-muted">// 15</span>
fmt.Println(acc(3))   <span class="text-go-muted">// 18</span></code></pre>`}
    <p class="text-go-muted text-sm mt-4">
      Cada llamada a <code class="text-go-accent">acumulador()</code> crea un nuevo
      <code class="text-go-accent">total</code> independiente.
      Es como tener estado encapsulado sin necesidad de structs.
    </p>
  </section>

  <!-- Go 1.21 highlight: min/max builtins -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Go 1.21+: Builtins min y max</h2>
    <div class="bg-go-accent/10 border border-go-accent/30 rounded-lg p-3 mb-4">
      <p class="text-go-accent font-semibold text-sm">Novedad en Go 1.21</p>
      <p class="text-go-muted text-sm mt-1">
        Antes, obtener el m&#237;nimo de dos n&#250;meros requer&#237;a <code>math.Min</code> (solo float64) o un if manual.
        Ahora <code class="text-go-accent">min</code> y <code class="text-go-accent">max</code> son builtins gen&#233;ricos.
      </p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p class="text-go-muted text-xs font-semibold mb-2">Antes (Go &lt; 1.21)</p>
        {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Solo float64, solo 2 args</span>
m := math.Min(float64(a), float64(b))

<span class="text-go-muted">// Para int, escribir a mano:</span>
<span class="text-go-accent">if</span> a &lt; b {
    m = a
} <span class="text-go-accent">else</span> {
    m = b
}</code></pre>`}
      </div>
      <div>
        <p class="text-go-accent text-xs font-semibold mb-2">Ahora (Go 1.21+)</p>
        {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Cualquier tipo ordered</span>
<span class="text-go-muted">// Cualquier cantidad de args</span>
m := <span class="text-go-accent">min</span>(3, 1, 4, 1, 5)  <span class="text-go-muted">// 1</span>
M := <span class="text-go-accent">max</span>(3, 1, 4, 1, 5)  <span class="text-go-muted">// 5</span>

<span class="text-go-muted">// Funciona con strings</span>
s := <span class="text-go-accent">min</span>("go", "rust")  <span class="text-go-muted">// "go"</span></code></pre>`}
      </div>
    </div>
  </section>

  <!-- Defer, Panic, Recover -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Defer, Panic y Recover</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Ya conoces <code class="text-go-accent">defer</code> del m&#243;dulo anterior. Ahora veamos el tr&#237;o completo:
      <code class="text-go-accent">panic</code> detiene la ejecuci&#243;n normal y
      <code class="text-go-accent">recover</code> puede atrapar un panic dentro de un defer.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">operacionSegura</span>() {
    <span class="text-go-accent">defer func</span>() {
        <span class="text-go-accent">if</span> r := <span class="text-go-accent">recover</span>(); r != <span class="text-go-accent">nil</span> {
            fmt.Println(<span class="text-go-success">"Recuperado de panic:"</span>, r)
        }
    }()

    fmt.Println(<span class="text-go-success">"Ejecutando..."</span>)
    <span class="text-go-accent">panic</span>(<span class="text-go-success">"algo salió muy mal"</span>)
    fmt.Println(<span class="text-go-success">"Esto nunca se ejecuta"</span>)
}</code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-danger mt-4">
      <p class="text-go-danger font-semibold text-sm mb-1">Advertencia</p>
      <p class="text-go-muted text-sm">
        <code class="text-go-accent">panic</code> es para errores irrecuperables (bugs, estados imposibles).
        Para errores esperados, usa el patr&#243;n <code class="text-go-accent">(valor, error)</code>.
        No uses panic como try/catch.
      </p>
    </div>
  </section>

  <!-- Worked Examples -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Ejemplos Guiados</h2>
    <p class="text-go-muted mb-4">
      Sigue cada ejemplo paso a paso. Cada paso revela c&#243;digo nuevo y explica el razonamiento.
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
      Pon en pr&#225;ctica lo aprendido. Completa el c&#243;digo, rellena los blancos o encuentra los bugs.
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
  <ModuleNav currentModule={4} />
</div>

<VocabularyFloat moduleId={4} />

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

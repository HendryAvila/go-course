<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';

  const module = modules.find(m => m.id === 3)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'flow-master')!);

  const playgroundCode = `package main

import "fmt"

func main() {
\t// === FOR: el unico loop en Go ===

\t// 1. For clasico (estilo C)
\tfmt.Println("=== For clasico ===")
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

\t// 3. For range (sobre slices, maps, strings)
\tfmt.Println("\\n=== For range ===")
\tlenguajes := []string{"Go", "Rust", "Python"}
\tfor i, lang := range lenguajes {
\t\tfmt.Printf("[%d] %s\\n", i, lang)
\t}

\t// 4. For infinito con break
\tfmt.Println("\\n=== For infinito ===")
\tcontador := 0
\tfor {
\t\tcontador++
\t\tif contador >= 3 {
\t\t\tbreak
\t\t}
\t\tfmt.Printf("contador = %d\\n", contador)
\t}

\t// === DEFER: LIFO (ultimo en entrar, primero en salir) ===
\tfmt.Println("\\n=== Defer (observa el orden!) ===")
\tfmt.Println("inicio")
\tdefer fmt.Println("defer 1")
\tdefer fmt.Println("defer 2")
\tdefer fmt.Println("defer 3")
\tfmt.Println("fin")
\t// Output: inicio, fin, defer 3, defer 2, defer 1

\t// === IF con init statement ===
\tfmt.Println("\\n=== If con init statement ===")
\tif x := 42; x > 40 {
\t\tfmt.Printf("x=%d es mayor que 40\\n", x)
\t}
\t// x no existe fuera del if
}`;

  const quizQuestions = [
    {
      question: '¿Cuantas estructuras de loop tiene Go?',
      options: [
        { text: 'Tres: for, while, do-while', correct: false, explanation: 'Go solo tiene for. No existe while ni do-while como keywords separadas.' },
        { text: 'Dos: for y foreach', correct: false, explanation: 'Go solo tiene for. for range reemplaza a foreach, pero sigue siendo for.' },
        { text: 'Una: for (que puede funcionar como while, foreach, etc.)', correct: true, explanation: '¡Correcto! for es el UNICO loop de Go. Se adapta a todas las necesidades con diferentes sintaxis.' },
        { text: 'Cuatro: for, while, loop, range', correct: false, explanation: 'Go tiene un solo loop: for. range es un keyword que se usa CON for.' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go#for',
    },
    {
      question: '¿En que orden se ejecutan los defer?',
      options: [
        { text: 'En el orden en que se declararon (FIFO)', correct: false, explanation: 'No es FIFO. Los defers se apilan y se ejecutan en orden inverso.' },
        { text: 'En orden inverso - LIFO (ultimo en entrar, primero en salir)', correct: true, explanation: '¡Correcto! defer usa una pila (stack). El ultimo defer declarado se ejecuta primero.' },
        { text: 'En orden aleatorio', correct: false, explanation: 'El orden de defer es determinista: LIFO, como una pila.' },
        { text: 'Todos al mismo tiempo (concurrentemente)', correct: false, explanation: 'Los defers se ejecutan secuencialmente, uno a uno, en orden LIFO.' },
      ],
      source: 'Go Specification: Defer',
      sourceUrl: 'https://go.dev/ref/spec#Defer_statements',
    },
    {
      question: '¿Que tiene de especial el switch de Go comparado con C/Java?',
      options: [
        { text: 'Es mas lento que en otros lenguajes', correct: false, explanation: 'El rendimiento del switch en Go es excelente. La diferencia es de comportamiento.' },
        { text: 'Los cases NO caen al siguiente (no necesita break)', correct: true, explanation: '¡Correcto! En Go, cada case tiene un break implicito. Si QUIERES fall-through, usas la keyword fallthrough.' },
        { text: 'Solo acepta tipos numericos', correct: false, explanation: 'switch en Go acepta cualquier tipo comparable, incluyendo strings.' },
        { text: 'No existe switch en Go', correct: false, explanation: 'Go tiene switch y es muy poderoso, incluyendo switch sin expresion.' },
      ],
      source: 'Effective Go: Switch',
      sourceUrl: 'https://go.dev/doc/effective_go#switch',
    },
    {
      question: '¿Que hace "if x := compute(); x > 0" en Go?',
      options: [
        { text: 'Es un error de sintaxis', correct: false, explanation: 'Es perfectamente valido. Go permite una sentencia de inicializacion antes de la condicion del if.' },
        { text: 'Declara x, la inicializa con compute(), y evalua si x > 0', correct: true, explanation: '¡Correcto! El init statement del if declara x con alcance limitado al bloque if/else.' },
        { text: 'Ejecuta compute() y x > 0 en paralelo', correct: false, explanation: 'Se ejecutan secuencialmente: primero compute(), luego la comparacion.' },
        { text: 'Asigna compute() a una variable global x', correct: false, explanation: 'x tiene alcance (scope) solo dentro del bloque if/else, no es global.' },
      ],
      source: 'Go Specification',
      sourceUrl: 'https://go.dev/ref/spec#If_statements',
    },
    {
      question: '¿Cuando se ejecutan las funciones diferidas con defer?',
      options: [
        { text: 'Inmediatamente despues de la linea del defer', correct: false, explanation: 'Si se ejecutara inmediatamente, no tendria sentido usar defer.' },
        { text: 'Al final del bloque if/for donde se declaro', correct: false, explanation: 'defer NO se ejecuta al final de un bloque. Se ejecuta al final de la FUNCION.' },
        { text: 'Cuando la funcion que lo contiene retorna', correct: true, explanation: '¡Correcto! defer ejecuta la funcion diferida cuando la funcion contenedora termina (return, panic, o fin normal).' },
        { text: 'Cuando el programa termina', correct: false, explanation: 'Se ejecuta al retornar la funcion, no al terminar el programa. Si main() tiene defer, coincide, pero es por el retorno de main.' },
      ],
      source: 'Effective Go: Defer',
      sourceUrl: 'https://go.dev/doc/effective_go#defer',
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

  <!-- If -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">if: Con Init Statement</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El <code class="text-go-accent">if</code> de Go es como el de otros lenguajes, pero con un superpoder:
      puedes declarar una variable <strong class="text-go-text">dentro del propio if</strong> que solo vive
      en ese scope. No necesitas parentesis alrededor de la condicion.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// if basico - sin parentesis!</span>
<span class="text-go-accent">if</span> x &gt; 10 {
    fmt.Println(<span class="text-go-success">"mayor"</span>)
}

<span class="text-go-muted">// if con init statement - x solo existe dentro del if/else</span>
<span class="text-go-accent">if</span> x := calcular(); x &gt; 0 {
    fmt.Println(<span class="text-go-success">"positivo"</span>, x)
} <span class="text-go-accent">else</span> {
    fmt.Println(<span class="text-go-success">"no positivo"</span>, x)
}
<span class="text-go-muted">// x ya no existe aqui</span></code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-accent mt-4">
      <p class="text-go-accent font-semibold text-sm mb-1">Patron comun</p>
      <p class="text-go-muted text-sm">
        El init statement es muy usado con el patron de errores:
        <code class="text-go-accent">if err := doSomething(); err != nil</code>
      </p>
    </div>
  </section>

  <!-- For -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">for: El Unico Loop</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go tiene <strong class="text-go-text">un solo loop: for</strong>. No existe while, do-while ni foreach.
      Pero <code class="text-go-accent">for</code> se adapta a todas las necesidades:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// 1. For clasico (estilo C)</span>
<span class="text-go-accent">for</span> i := 0; i &lt; 10; i++ {
    fmt.Println(i)
}

<span class="text-go-muted">// 2. For como "while"</span>
<span class="text-go-accent">for</span> condicion {
    <span class="text-go-muted">// se repite mientras condicion sea true</span>
}

<span class="text-go-muted">// 3. For range (itera sobre colecciones)</span>
<span class="text-go-accent">for</span> indice, valor := <span class="text-go-accent">range</span> coleccion {
    fmt.Println(indice, valor)
}

<span class="text-go-muted">// 4. For infinito</span>
<span class="text-go-accent">for</span> {
    <span class="text-go-muted">// loop infinito - usa break para salir</span>
    <span class="text-go-accent">if</span> listo {
        <span class="text-go-accent">break</span>
    }
}</code></pre>`}
  </section>

  <!-- Switch -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">switch: Sin Break Necesario</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El <code class="text-go-accent">switch</code> de Go es mas limpio que en C/Java: los cases
      <strong class="text-go-text">NO caen al siguiente</strong> automaticamente. Si quieres que caigan,
      usas <code class="text-go-accent">fallthrough</code> explicitamente.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// switch basico - no necesita break!</span>
<span class="text-go-accent">switch</span> dia {
<span class="text-go-accent">case</span> <span class="text-go-success">"lunes"</span>:
    fmt.Println(<span class="text-go-success">"inicio de semana"</span>)
<span class="text-go-accent">case</span> <span class="text-go-success">"viernes"</span>:
    fmt.Println(<span class="text-go-success">"casi fin de semana!"</span>)
<span class="text-go-accent">default</span>:
    fmt.Println(<span class="text-go-success">"dia normal"</span>)
}

<span class="text-go-muted">// switch sin expresion (reemplaza if/else if)</span>
<span class="text-go-accent">switch</span> {
<span class="text-go-accent">case</span> hora &lt; 12:
    fmt.Println(<span class="text-go-success">"buenos dias"</span>)
<span class="text-go-accent">case</span> hora &lt; 18:
    fmt.Println(<span class="text-go-success">"buenas tardes"</span>)
<span class="text-go-accent">default</span>:
    fmt.Println(<span class="text-go-success">"buenas noches"</span>)
}

<span class="text-go-muted">// switch con init statement</span>
<span class="text-go-accent">switch</span> os := runtime.GOOS; os {
<span class="text-go-accent">case</span> <span class="text-go-success">"linux"</span>:
    fmt.Println(<span class="text-go-success">"Linux!"</span>)
<span class="text-go-accent">case</span> <span class="text-go-success">"darwin"</span>:
    fmt.Println(<span class="text-go-success">"macOS!"</span>)
}</code></pre>`}
  </section>

  <!-- Defer -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">defer: Ejecucion Diferida</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      <code class="text-go-accent">defer</code> programa una funcion para ejecutarse cuando la funcion
      contenedora retorna. Los defers se apilan en orden <strong class="text-go-text">LIFO</strong>
      (Last In, First Out) - como una pila de platos.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">procesarArchivo</span>() {
    f, err := os.Open(<span class="text-go-success">"datos.txt"</span>)
    <span class="text-go-accent">if</span> err != <span class="text-go-accent">nil</span> {
        log.Fatal(err)
    }
    <span class="text-go-accent">defer</span> f.Close()  <span class="text-go-muted">// Se cierra al salir de la funcion</span>

    <span class="text-go-muted">// ... trabajar con el archivo ...</span>
    <span class="text-go-muted">// No importa como salgas: return, panic, o fin normal</span>
    <span class="text-go-muted">// f.Close() SIEMPRE se ejecuta</span>
}

<span class="text-go-muted">// Orden LIFO:</span>
<span class="text-go-accent">defer</span> fmt.Println(<span class="text-go-success">"1"</span>)  <span class="text-go-muted">// Se ejecuta tercero</span>
<span class="text-go-accent">defer</span> fmt.Println(<span class="text-go-success">"2"</span>)  <span class="text-go-muted">// Se ejecuta segundo</span>
<span class="text-go-accent">defer</span> fmt.Println(<span class="text-go-success">"3"</span>)  <span class="text-go-muted">// Se ejecuta primero</span>
<span class="text-go-muted">// Output: 3, 2, 1</span></code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-success mt-4">
      <p class="text-go-success font-semibold text-sm mb-1">Uso clasico</p>
      <p class="text-go-muted text-sm">
        defer se usa para liberar recursos: cerrar archivos, conexiones de BD, desbloquear mutexes.
        Garantiza la limpieza sin importar como termine la funcion.
      </p>
    </div>
  </section>

  <!-- GoPlayground -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Experimenta con Control de Flujo</h2>
    <p class="text-go-muted mb-4">
      Prueba las variaciones de for, observa el orden LIFO de defer y experimenta con switch.
    </p>
    <GoPlayground
      code={playgroundCode}
      title="Control de Flujo en Go"
      description="Ejecuta el codigo y observa especialmente el orden de los defer. Prueba agregar mas variaciones de for."
    />
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

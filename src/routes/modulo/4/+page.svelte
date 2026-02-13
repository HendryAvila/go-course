<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';

  const module = modules.find(m => m.id === 4)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'func-wizard')!);

  const playgroundCode = `package main

import (
\t"fmt"
\t"errors"
\t"strings"
)

// Funcion con multiples retornos (patron value, error)
func dividir(a, b float64) (float64, error) {
\tif b == 0 {
\t\treturn 0, errors.New("division por cero")
\t}
\treturn a / b, nil
}

// Named returns
func estadisticas(nums []int) (min, max, suma int) {
\tmin = nums[0]
\tmax = nums[0]
\tfor _, n := range nums {
\t\tif n < min {
\t\t\tmin = n
\t\t}
\t\tif n > max {
\t\t\tmax = n
\t\t}
\t\tsuma += n
\t}
\treturn // "naked return" - retorna min, max, suma
}

// Funcion variadic
func unir(sep string, palabras ...string) string {
\treturn strings.Join(palabras, sep)
}

// Closure: funcion que captura variables del scope exterior
func contador() func() int {
\tn := 0
\treturn func() int {
\t\tn++ // captura n del scope de contador()
\t\treturn n
\t}
}

func main() {
\t// Multiple returns + manejo de error
\tfmt.Println("=== Multiple Returns ===")
\tresultado, err := dividir(10, 3)
\tif err != nil {
\t\tfmt.Println("Error:", err)
\t} else {
\t\tfmt.Printf("10 / 3 = %.2f\\n", resultado)
\t}

\t_, err = dividir(10, 0)
\tif err != nil {
\t\tfmt.Println("Error:", err)
\t}

\t// Named returns
\tfmt.Println("\\n=== Named Returns ===")
\tnums := []int{3, 1, 4, 1, 5, 9, 2, 6}
\tmin, max, suma := estadisticas(nums)
\tfmt.Printf("min=%d, max=%d, suma=%d\\n", min, max, suma)

\t// Variadic
\tfmt.Println("\\n=== Variadic ===")
\tfmt.Println(unir(" - ", "Go", "Rust", "Python"))
\tfmt.Println(unir(", ", "uno", "dos"))

\t// Closures
\tfmt.Println("\\n=== Closures ===")
\tcontar := contador()
\tfmt.Println(contar()) // 1
\tfmt.Println(contar()) // 2
\tfmt.Println(contar()) // 3

\t// Segundo contador independiente
\totroContador := contador()
\tfmt.Println(otroContador()) // 1 (su propio n)

\t// Funcion anonima inmediata
\tfmt.Println("\\n=== Funcion Anonima ===")
\tresult := func(a, b int) int {
\t\treturn a + b
\t}(5, 3)
\tfmt.Printf("5 + 3 = %d\\n", result)
}`;

  const quizQuestions = [
    {
      question: '¿Cual es el patron idiomatico de retorno de errores en Go?',
      options: [
        { text: 'Lanzar excepciones con throw', correct: false, explanation: 'Go NO tiene excepciones ni throw. Los errores son valores que se retornan.' },
        { text: 'Retornar (valor, error) donde error es nil si no hay error', correct: true, explanation: '¡Correcto! El patron (value, error) es la base del manejo de errores en Go. Si error == nil, todo bien.' },
        { text: 'Usar un bloque try/catch', correct: false, explanation: 'Go no tiene try/catch. Usa retornos multiples con el tipo error.' },
        { text: 'Retornar -1 cuando hay error', correct: false, explanation: 'Retornar valores magicos es un anti-patron. Go usa el tipo error explicitamente.' },
      ],
      source: 'Go Blog: Error handling',
      sourceUrl: 'https://go.dev/blog/error-handling-and-go',
    },
    {
      question: '¿Que es un closure en Go?',
      options: [
        { text: 'Una funcion que cierra el programa', correct: false, explanation: 'Closure no tiene nada que ver con cerrar programas. Es un concepto de funciones.' },
        { text: 'Una funcion que captura y recuerda variables de su scope exterior', correct: true, explanation: '¡Correcto! Un closure "cierra sobre" variables del scope que lo rodea, manteniendolas vivas.' },
        { text: 'Una funcion que solo se ejecuta una vez', correct: false, explanation: 'Un closure se puede ejecutar multiples veces, y cada vez accede a las variables capturadas.' },
        { text: 'Un metodo de un struct', correct: false, explanation: 'Los metodos se asocian a tipos. Un closure es una funcion anonima que captura variables.' },
      ],
      source: 'Go by Example: Closures',
      sourceUrl: 'https://gobyexample.com/closures',
    },
    {
      question: '¿Que significa "...int" en una firma de funcion?',
      options: [
        { text: 'Un array de longitud variable', correct: false, explanation: 'No es un array (tienen longitud fija en Go). Es un parametro variadic que se recibe como slice.' },
        { text: 'Un parametro variadic que acepta cero o mas enteros', correct: true, explanation: '¡Correcto! Los parametros variadic se definen con ... y se reciben como un slice dentro de la funcion.' },
        { text: 'Un puntero a un entero', correct: false, explanation: 'Un puntero se escribe *int. Los ... indican parametro variadic.' },
        { text: 'Un spread operator como en JavaScript', correct: false, explanation: 'Aunque la sintaxis es similar, en Go ... define un parametro variadic en la firma. Para expandir un slice se usa slice...' },
      ],
      source: 'Go Specification: Passing arguments',
      sourceUrl: 'https://go.dev/ref/spec#Passing_arguments_to_..._parameters',
    },
    {
      question: '¿Que son los "named returns" en Go?',
      options: [
        { text: 'Funciones que tienen nombre (no anonimas)', correct: false, explanation: 'Named returns se refiere a los valores de retorno con nombre, no al nombre de la funcion.' },
        { text: 'Valores de retorno con nombre que se pueden usar como variables y retornar con return vacio', correct: true, explanation: '¡Correcto! Los named returns pre-declaran variables de retorno. Un "naked return" retorna sus valores actuales.' },
        { text: 'Un tipo especial de constante', correct: false, explanation: 'No son constantes. Son variables de retorno nombradas en la firma de la funcion.' },
        { text: 'Una forma de nombrar los parametros de entrada', correct: false, explanation: 'Los parametros de entrada siempre tienen nombre. Named returns se refiere a los valores de RETORNO.' },
      ],
      source: 'Effective Go: Named results',
      sourceUrl: 'https://go.dev/doc/effective_go#named-results',
    },
    {
      question: '¿Las funciones en Go son "first-class citizens"? ¿Que significa eso?',
      options: [
        { text: 'Que son mas rapidas que en otros lenguajes', correct: false, explanation: 'First-class no se refiere a rendimiento, sino a como el lenguaje trata a las funciones.' },
        { text: 'Que pueden asignarse a variables, pasarse como argumentos y retornarse de otras funciones', correct: true, explanation: '¡Correcto! En Go las funciones son valores: puedes guardarlas en variables, pasarlas como parametros y retornarlas.' },
        { text: 'Que siempre se ejecutan primero en el programa', correct: false, explanation: 'First-class se refiere a que las funciones son tratadas como cualquier otro valor, no al orden de ejecucion.' },
        { text: 'Que solo pueden estar en el paquete main', correct: false, explanation: 'Las funciones pueden estar en cualquier paquete. First-class significa que son valores de primera clase.' },
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

  <!-- Declaracion de funciones -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Declaracion de Funciones</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Las funciones en Go se declaran con <code class="text-go-accent">func</code>. Son directas y explicitas:
      ves los tipos de los parametros y lo que retorna sin ambiguedades.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Funcion basica</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">saludar</span>(nombre <span class="text-go-warning">string</span>) <span class="text-go-warning">string</span> {
    <span class="text-go-accent">return</span> <span class="text-go-success">"Hola, "</span> + nombre
}

<span class="text-go-muted">// Parametros del mismo tipo se pueden agrupar</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">sumar</span>(a, b <span class="text-go-warning">int</span>) <span class="text-go-warning">int</span> {
    <span class="text-go-accent">return</span> a + b
}</code></pre>`}
  </section>

  <!-- Multiples retornos -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Multiples Valores de Retorno</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El superpoder de Go: una funcion puede retornar <strong class="text-go-text">multiples valores</strong>.
      Esto es la base del manejo de errores en Go - el patron
      <code class="text-go-accent">(valor, error)</code>.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Patron clasico: (value, error)</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">dividir</span>(a, b <span class="text-go-warning">float64</span>) (<span class="text-go-warning">float64</span>, <span class="text-go-warning">error</span>) {
    <span class="text-go-accent">if</span> b == 0 {
        <span class="text-go-accent">return</span> 0, errors.New(<span class="text-go-success">"division por cero"</span>)
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
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">rectangulo</span>(ancho, alto <span class="text-go-warning">float64</span>) (area, perimetro <span class="text-go-warning">float64</span>) {
    area = ancho * alto
    perimetro = 2 * (ancho + alto)
    <span class="text-go-accent">return</span>  <span class="text-go-muted">// naked return: retorna area y perimetro</span>
}</code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-accent mt-4">
      <p class="text-go-accent font-semibold text-sm mb-1">Consejo</p>
      <p class="text-go-muted text-sm">
        Usa named returns en funciones cortas para documentar que retorna cada valor.
        En funciones largas, el naked return puede reducir la legibilidad.
      </p>
    </div>
  </section>

  <!-- Variadic -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Funciones Variadic</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Una funcion variadic acepta un numero variable de argumentos usando <code class="text-go-accent">...</code>.
      Dentro de la funcion, se reciben como un <strong class="text-go-text">slice</strong>.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">sumarTodos</span>(nums ...<span class="text-go-warning">int</span>) <span class="text-go-warning">int</span> {
    total := 0
    <span class="text-go-accent">for</span> _, n := <span class="text-go-accent">range</span> nums {
        total += n
    }
    <span class="text-go-accent">return</span> total
}

<span class="text-go-muted">// Llamadas validas:</span>
sumarTodos(1, 2, 3)         <span class="text-go-muted">// 6</span>
sumarTodos(1, 2, 3, 4, 5)   <span class="text-go-muted">// 15</span>
sumarTodos()                 <span class="text-go-muted">// 0</span>

<span class="text-go-muted">// Expandir un slice existente con ...</span>
nums := []<span class="text-go-warning">int</span>{10, 20, 30}
sumarTodos(nums...)          <span class="text-go-muted">// 60</span></code></pre>`}
  </section>

  <!-- Funciones como valores y closures -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Funciones como Valores y Closures</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      En Go, las funciones son <strong class="text-go-text">ciudadanos de primera clase</strong>: puedes
      asignarlas a variables, pasarlas como argumentos y retornarlas de otras funciones.
      Un <strong class="text-go-text">closure</strong> es una funcion que captura variables de su entorno.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// Funcion como valor</span>
<span class="text-go-accent">var</span> operacion <span class="text-go-accent">func</span>(<span class="text-go-warning">int</span>, <span class="text-go-warning">int</span>) <span class="text-go-warning">int</span>
operacion = <span class="text-go-accent">func</span>(a, b <span class="text-go-warning">int</span>) <span class="text-go-warning">int</span> { <span class="text-go-accent">return</span> a + b }
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
  </section>

  <!-- Defer, Panic, Recover -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Defer, Panic y Recover</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Ya conoces <code class="text-go-accent">defer</code>. Ahora veamos el trio completo:
      <code class="text-go-accent">panic</code> detiene la ejecucion normal y
      <code class="text-go-accent">recover</code> puede atrapar un panic dentro de un defer.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">operacionSegura</span>() {
    <span class="text-go-accent">defer func</span>() {
        <span class="text-go-accent">if</span> r := <span class="text-go-accent">recover</span>(); r != <span class="text-go-accent">nil</span> {
            fmt.Println(<span class="text-go-success">"Recuperado de panic:"</span>, r)
        }
    }()

    fmt.Println(<span class="text-go-success">"Ejecutando..."</span>)
    <span class="text-go-accent">panic</span>(<span class="text-go-success">"algo salio muy mal"</span>)
    fmt.Println(<span class="text-go-success">"Esto nunca se ejecuta"</span>)
}

<span class="text-go-muted">// Output:</span>
<span class="text-go-muted">// Ejecutando...</span>
<span class="text-go-muted">// Recuperado de panic: algo salio muy mal</span></code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-danger mt-4">
      <p class="text-go-danger font-semibold text-sm mb-1">Advertencia</p>
      <p class="text-go-muted text-sm">
        <code class="text-go-accent">panic</code> es para errores irrecuperables (bugs, estados imposibles).
        Para errores esperados (archivo no encontrado, input invalido), usa el patron
        <code class="text-go-accent">(valor, error)</code>. No uses panic como try/catch.
      </p>
    </div>
  </section>

  <!-- GoPlayground -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Experimenta con Funciones</h2>
    <p class="text-go-muted mb-4">
      Prueba multiples retornos, crea tus propios closures y experimenta con funciones variadic.
    </p>
    <GoPlayground
      code={playgroundCode}
      title="Funciones en Go"
      description="Modifica las funciones, prueba diferentes closures y experimenta con el patron (valor, error)."
    />
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

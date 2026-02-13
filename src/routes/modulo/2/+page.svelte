<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';

  const module = modules.find(m => m.id === 2)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'tipado-fuerte')!);

  const playgroundCode = `package main

import "fmt"

func main() {
\t// Declaracion con var
\tvar nombre string = "Gopher"
\tvar edad int = 15

\t// Declaracion corta con :=
\tlenguaje := "Go"
\tversion := 1.22

\t// Zero values: Go SIEMPRE inicializa las variables
\tvar sinValorInt int
\tvar sinValorStr string
\tvar sinValorBool bool
\tvar sinValorFloat float64

\tfmt.Println("=== Variables ===")
\tfmt.Printf("nombre: %s, edad: %d\\n", nombre, edad)
\tfmt.Printf("lenguaje: %s, version: %.2f\\n", lenguaje, version)

\tfmt.Println("\\n=== Zero Values ===")
\tfmt.Printf("int: %d\\n", sinValorInt)
\tfmt.Printf("string: %q\\n", sinValorStr)
\tfmt.Printf("bool: %t\\n", sinValorBool)
\tfmt.Printf("float64: %f\\n", sinValorFloat)

\t// Constantes e iota
\tconst Pi = 3.14159

\ttype Dia int
\tconst (
\t\tLunes Dia = iota  // 0
\t\tMartes             // 1
\t\tMiercoles          // 2
\t\tJueves             // 3
\t\tViernes            // 4
\t)

\tfmt.Println("\\n=== Constantes e Iota ===")
\tfmt.Printf("Pi: %f\\n", Pi)
\tfmt.Printf("Lunes=%d, Martes=%d, Viernes=%d\\n", Lunes, Martes, Viernes)

\t// Conversion de tipos (explicita!)
\tvar entero int = 42
\tvar flotante float64 = float64(entero)
\tvar otroEntero uint = uint(flotante)
\tfmt.Println("\\n=== Conversiones ===")
\tfmt.Printf("int=%d -> float64=%.1f -> uint=%d\\n", entero, flotante, otroEntero)
}`;

  const quizQuestions = [
    {
      question: '¿Cual es el zero value de una variable tipo string en Go?',
      options: [
        { text: 'null', correct: false, explanation: 'Go no tiene null para strings. null (nil) solo aplica a punteros, slices, maps, channels, interfaces y funciones.' },
        { text: '"" (string vacio)', correct: true, explanation: '¡Correcto! El zero value de string es un string vacio "". Go SIEMPRE inicializa las variables.' },
        { text: 'undefined', correct: false, explanation: 'Go no tiene el concepto de undefined. Toda variable tiene un valor desde su declaracion.' },
        { text: '"nil"', correct: false, explanation: 'nil no es un string. El zero value de string es "" (vacio).' },
      ],
      source: 'Go Specification',
      sourceUrl: 'https://go.dev/ref/spec#The_zero_value',
    },
    {
      question: '¿Que operador se usa para declaracion corta de variables en Go?',
      options: [
        { text: 'var x = 10', correct: false, explanation: 'Esto funciona pero es la declaracion larga. La corta usa un operador especial.' },
        { text: 'let x = 10', correct: false, explanation: 'let es de JavaScript, no existe en Go.' },
        { text: 'x := 10', correct: true, explanation: '¡Correcto! := es el operador de declaracion corta. Solo funciona dentro de funciones.' },
        { text: 'x = 10', correct: false, explanation: 'Esto es una asignacion, no una declaracion. La variable ya debe existir.' },
      ],
      source: 'Go by Example',
      sourceUrl: 'https://gobyexample.com/variables',
    },
    {
      question: '¿Go permite conversiones de tipo implicitas?',
      options: [
        { text: 'Si, como en JavaScript', correct: false, explanation: 'Go NO permite conversiones implicitas. Toda conversion debe ser explicita.' },
        { text: 'Solo entre tipos numericos', correct: false, explanation: 'Ni siquiera entre int y float64. TODA conversion es explicita en Go.' },
        { text: 'No, todas las conversiones deben ser explicitas', correct: true, explanation: '¡Correcto! En Go debes escribir float64(miInt) explicitamente. Esto previene bugs sutiles.' },
        { text: 'Solo si los tipos son compatibles', correct: false, explanation: 'Aunque sean compatibles (int y int64), la conversion debe ser explicita.' },
      ],
      source: 'Go Specification: Conversions',
      sourceUrl: 'https://go.dev/ref/spec#Conversions',
    },
    {
      question: '¿Que hace iota en Go?',
      options: [
        { text: 'Genera numeros aleatorios', correct: false, explanation: 'iota no es aleatorio. Genera una secuencia predecible comenzando en 0.' },
        { text: 'Es un generador de constantes enumeradas que inicia en 0', correct: true, explanation: '¡Correcto! iota comienza en 0 y se incrementa en 1 con cada constante en el bloque.' },
        { text: 'Define una variable inmutable', correct: false, explanation: 'const define inmutabilidad. iota es un generador de valores dentro de un bloque const.' },
        { text: 'Convierte strings a numeros', correct: false, explanation: 'Para convertir strings a numeros se usa strconv.Atoi() o similares.' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go#constants',
    },
    {
      question: '¿Cual de estos NO es un tipo basico de Go?',
      options: [
        { text: 'rune', correct: false, explanation: 'rune es un alias para int32 y representa un code point Unicode. Es un tipo basico de Go.' },
        { text: 'byte', correct: false, explanation: 'byte es un alias para uint8. Es un tipo basico de Go.' },
        { text: 'char', correct: true, explanation: '¡Correcto! Go NO tiene tipo char. Usa byte (uint8) para bytes y rune (int32) para caracteres Unicode.' },
        { text: 'complex128', correct: false, explanation: 'complex128 es un tipo basico de Go para numeros complejos.' },
      ],
      source: 'Go Specification: Types',
      sourceUrl: 'https://go.dev/ref/spec#Types',
    },
  ];

  function handleQuizComplete(score: number, total: number) {
    courseStore.completeModule(2, score, total);
    if (score >= 3) {
      courseStore.unlockBadge('tipado-fuerte');
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

  <!-- Tipos basicos -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Tipos Basicos de Go</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go es un lenguaje de <strong class="text-go-text">tipado estatico</strong>: cada variable tiene
      un tipo definido en tiempo de compilacion. No hay sorpresas en runtime.
    </p>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-go-border">
            <th class="text-left py-2 text-go-accent">Categoria</th>
            <th class="text-left py-2 text-go-accent">Tipos</th>
            <th class="text-left py-2 text-go-accent">Zero Value</th>
          </tr>
        </thead>
        <tbody class="text-go-muted">
          <tr class="border-b border-go-border/30">
            <td class="py-2 font-semibold text-go-text">Booleano</td>
            <td class="py-2 font-mono">bool</td>
            <td class="py-2 font-mono">false</td>
          </tr>
          <tr class="border-b border-go-border/30">
            <td class="py-2 font-semibold text-go-text">Cadenas</td>
            <td class="py-2 font-mono">string</td>
            <td class="py-2 font-mono">"" (vacio)</td>
          </tr>
          <tr class="border-b border-go-border/30">
            <td class="py-2 font-semibold text-go-text">Enteros</td>
            <td class="py-2 font-mono">int, int8, int16, int32, int64</td>
            <td class="py-2 font-mono">0</td>
          </tr>
          <tr class="border-b border-go-border/30">
            <td class="py-2 font-semibold text-go-text">Sin signo</td>
            <td class="py-2 font-mono">uint, uint8, uint16, uint32, uint64</td>
            <td class="py-2 font-mono">0</td>
          </tr>
          <tr class="border-b border-go-border/30">
            <td class="py-2 font-semibold text-go-text">Flotantes</td>
            <td class="py-2 font-mono">float32, float64</td>
            <td class="py-2 font-mono">0</td>
          </tr>
          <tr class="border-b border-go-border/30">
            <td class="py-2 font-semibold text-go-text">Complejos</td>
            <td class="py-2 font-mono">complex64, complex128</td>
            <td class="py-2 font-mono">(0+0i)</td>
          </tr>
          <tr>
            <td class="py-2 font-semibold text-go-text">Alias</td>
            <td class="py-2 font-mono">byte (uint8), rune (int32)</td>
            <td class="py-2 font-mono">0</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Declaracion de variables -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Declaracion de Variables</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go ofrece tres formas de declarar variables. Cada una tiene su momento y lugar:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// 1. Declaracion completa (usada a nivel de paquete)</span>
<span class="text-go-accent">var</span> nombre <span class="text-go-warning">string</span> = <span class="text-go-success">"Gopher"</span>

<span class="text-go-muted">// 2. Con inferencia de tipo (Go deduce el tipo)</span>
<span class="text-go-accent">var</span> edad = <span class="text-go-success">15</span>   <span class="text-go-muted">// Go infiere: int</span>

<span class="text-go-muted">// 3. Declaracion corta (SOLO dentro de funciones)</span>
lenguaje := <span class="text-go-success">"Go"</span>   <span class="text-go-muted">// La mas comun e idiomatica</span></code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 border-l-4 border-go-warning">
      <p class="text-go-warning font-semibold text-sm mb-1">Importante</p>
      <p class="text-go-muted text-sm">
        El operador <code class="text-go-accent">:=</code> solo funciona dentro de funciones.
        A nivel de paquete, debes usar <code class="text-go-accent">var</code>.
      </p>
    </div>
  </section>

  <!-- Zero Values -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Zero Values: Sin Sorpresas</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      En Go, toda variable declarada sin valor explicito recibe su <strong class="text-go-text">zero value</strong>.
      No existe el concepto de variable "sin inicializar" o "undefined". Esto elimina toda una categoria de bugs.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">var</span> i <span class="text-go-warning">int</span>       <span class="text-go-muted">// 0</span>
<span class="text-go-accent">var</span> f <span class="text-go-warning">float64</span>   <span class="text-go-muted">// 0</span>
<span class="text-go-accent">var</span> b <span class="text-go-warning">bool</span>      <span class="text-go-muted">// false</span>
<span class="text-go-accent">var</span> s <span class="text-go-warning">string</span>    <span class="text-go-muted">// "" (string vacio)</span>
<span class="text-go-accent">var</span> p <span class="text-go-warning">*int</span>      <span class="text-go-muted">// nil</span></code></pre>`}
  </section>

  <!-- Conversiones -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Conversiones Explicitas</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go <strong class="text-go-text">NO</strong> hace conversiones implicitas. Ni siquiera entre int y float64.
      Esto es deliberado: las conversiones implicitas son fuente de bugs sutiles en otros lenguajes.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">var</span> entero <span class="text-go-warning">int</span> = 42
<span class="text-go-accent">var</span> flotante <span class="text-go-warning">float64</span> = <span class="text-go-warning">float64</span>(entero)   <span class="text-go-muted">// Conversion explicita</span>
<span class="text-go-accent">var</span> otro <span class="text-go-warning">uint</span> = <span class="text-go-warning">uint</span>(flotante)           <span class="text-go-muted">// Otra conversion explicita</span>

<span class="text-go-muted">// Esto NO compila:</span>
<span class="text-go-muted">// var x float64 = entero   // Error: cannot use entero (int) as float64</span></code></pre>`}
  </section>

  <!-- Constantes e iota -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Constantes e Iota</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Las constantes se definen con <code class="text-go-accent">const</code> y son inmutables. Go tiene un generador
      especial llamado <strong class="text-go-text">iota</strong> para crear enumeraciones de forma elegante:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">const</span> Pi = 3.14159

<span class="text-go-muted">// iota: generador de constantes enumeradas</span>
<span class="text-go-accent">type</span> <span class="text-go-warning">Color</span> int
<span class="text-go-accent">const</span> (
    <span class="text-go-text">Rojo</span>    <span class="text-go-warning">Color</span> = <span class="text-go-accent">iota</span>  <span class="text-go-muted">// 0</span>
    <span class="text-go-text">Verde</span>                   <span class="text-go-muted">// 1 (iota se incrementa)</span>
    <span class="text-go-text">Azul</span>                    <span class="text-go-muted">// 2</span>
)

<span class="text-go-muted">// iota con expresiones</span>
<span class="text-go-accent">const</span> (
    _  = <span class="text-go-accent">iota</span>             <span class="text-go-muted">// 0 (descartado con _)</span>
    <span class="text-go-text">KB</span> = 1 &lt;&lt; (10 * <span class="text-go-accent">iota</span>) <span class="text-go-muted">// 1024</span>
    <span class="text-go-text">MB</span>                      <span class="text-go-muted">// 1048576</span>
    <span class="text-go-text">GB</span>                      <span class="text-go-muted">// 1073741824</span>
)</code></pre>`}
  </section>

  <!-- GoPlayground -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Experimenta con Tipos</h2>
    <p class="text-go-muted mb-4">
      Prueba declarar variables de diferentes formas, observa los zero values y experimenta con iota.
    </p>
    <GoPlayground
      code={playgroundCode}
      title="Variables, Tipos y Constantes"
      description="Modifica el codigo: agrega nuevas variables, prueba conversiones entre tipos, crea tus propias constantes con iota."
    />
  </section>

  <!-- Quiz -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Pon a Prueba tu Conocimiento</h2>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  <SourcesSection sources={module.sources} />
  <ModuleNav currentModule={2} />
</div>

<VocabularyFloat moduleId={2} />

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

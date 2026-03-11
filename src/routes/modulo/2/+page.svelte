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
  import { exercises, workedExamples } from '$lib/data/exercises/module-2';
  import { reviewCards } from '$lib/data/exercises/review-cards';

  const module = modules.find(m => m.id === 2)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'tipado-fuerte')!);

  courseStore.startModule(2);

  const playgroundCode = `package main

import "fmt"

func main() {
\t// Tipos básicos y zero values
\tvar entero int
\tvar flotante float64
\tvar texto string
\tvar booleano bool
\tvar caracter rune
\tvar octeto byte

\tfmt.Println("--- Zero Values ---")
\tfmt.Printf("int:     %d\\n", entero)
\tfmt.Printf("float64: %f\\n", flotante)
\tfmt.Printf("string:  %q\\n", texto)
\tfmt.Printf("bool:    %t\\n", booleano)
\tfmt.Printf("rune:    %d\\n", caracter)
\tfmt.Printf("byte:    %d\\n", octeto)

\t// Short declaration con inferencia
\tnombre := "Gopher"
\tedad := 42
\tpi := 3.14159

\tfmt.Println("\\n--- Tipos Inferidos ---")
\tfmt.Printf("nombre: %s (tipo: %T)\\n", nombre, nombre)
\tfmt.Printf("edad:   %d (tipo: %T)\\n", edad, edad)
\tfmt.Printf("pi:     %.4f (tipo: %T)\\n", pi, pi)

\t// Conversión explícita
\tfmt.Println("\\n--- Conversiones ---")
\tvar x int = 42
\ty := float64(x)
\tz := int(3.99) // trunca, NO redondea
\tfmt.Printf("int %d -> float64 %.1f\\n", x, y)
\tfmt.Printf("float64 3.99 -> int %d (truncado!)\\n", z)
}`;

  const quizQuestions = [
    {
      question: '¿Cuál es el zero value de una variable string en Go?',
      options: [
        { text: 'nil', correct: false, explanation: 'nil solo aplica a punteros, slices, maps, channels e interfaces. Los strings tienen zero value "".' },
        { text: '"" (string vacío)', correct: true, explanation: '¡Correcto! En Go, toda variable se inicializa automáticamente. Para string es "", para int es 0, para bool es false.' },
        { text: 'undefined', correct: false, explanation: 'Go no tiene el concepto de "undefined". Toda variable siempre tiene un valor.' },
        { text: '"null"', correct: false, explanation: 'No es el string "null" — es un string vacío "".' },
      ],
      source: 'Go Specification: Zero Value',
      sourceUrl: 'https://go.dev/ref/spec#The_zero_value',
    },
    {
      question: '¿Cuál es la diferencia entre var x int = 5 y x := 5?',
      type: 'code' as const,
      options: [
        { text: 'No hay diferencia, son exactamente iguales', correct: false, explanation: 'Tienen diferencias de uso: := solo funciona dentro de funciones.' },
        { text: ':= declara con tipo inferido y solo funciona dentro de funciones; var se puede usar en cualquier scope', correct: true, explanation: '¡Correcto! := es short declaration (infiere el tipo), var es declaration explícita (puede usarse a nivel de paquete).' },
        { text: ':= crea variables mutables y var crea inmutables', correct: false, explanation: 'Ambas crean variables mutables. Para inmutables usas const.' },
        { text: 'var es más rápido en runtime', correct: false, explanation: 'El rendimiento es idéntico. La diferencia es de sintaxis y scope.' },
      ],
      source: 'Effective Go: Names',
      sourceUrl: 'https://go.dev/doc/effective_go#names',
    },
    {
      question: '¿Qué imprime este código?\nvar x int\nx := 10\nfmt.Println(x)',
      type: 'code' as const,
      options: [
        { text: '10', correct: false, explanation: 'El código no compila. No puedes usar := en una variable que ya existe en el mismo scope.' },
        { text: '0', correct: false, explanation: 'No llega a imprimir — hay error de compilación.' },
        { text: 'Error de compilación: no new variables on left side of :=', correct: true, explanation: '¡Correcto! := declara una variable NUEVA. Si x ya existe en el mismo scope, debes usar = para reasignar.' },
        { text: 'undefined', correct: false, explanation: 'Go no tiene "undefined". El error es de compilación por redeclaración.' },
      ],
    },
    {
      question: '¿Qué valor tiene GB en este código?\nconst (\n  _ = iota\n  KB = 1 << (10 * iota)\n  MB\n  GB\n)',
      type: 'code' as const,
      options: [
        { text: '3', correct: false, explanation: 'iota se usa en una expresión con bit shifting, no se asigna directamente.' },
        { text: '1073741824 (1 << 30)', correct: true, explanation: '¡Correcto! iota=3 para GB, entonces 1 << (10*3) = 1 << 30 = 1073741824 bytes = 1 GB.' },
        { text: '30', correct: false, explanation: '30 es el número de bits a desplazar (10*3), pero el valor es 1 << 30.' },
        { text: '1048576', correct: false, explanation: 'Ese es MB (1 << 20). GB es 1 << 30.' },
      ],
    },
    {
      question: '¿Qué tipo infiere Go para r := \'A\'?',
      type: 'code' as const,
      options: [
        { text: 'string', correct: false, explanation: 'Las comillas simples denotan un rune, no un string. Los strings usan comillas dobles.' },
        { text: 'byte', correct: false, explanation: 'Aunque \'A\' cabe en un byte, Go infiere rune (int32) para character literals.' },
        { text: 'rune (alias de int32)', correct: true, explanation: '¡Correcto! En Go, un literal con comillas simples es un rune que representa un code point Unicode.' },
        { text: 'char', correct: false, explanation: 'Go no tiene tipo char. Usa rune (int32) para caracteres Unicode.' },
      ],
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

  <!-- Review Cards (spaced repetition from module 1) -->
  <ReviewCards moduleId={2} cards={reviewCards} />

  <!-- Tipos Básicos -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Los Tipos Básicos de Go</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go es un lenguaje de <strong class="text-go-text">tipado estático fuerte</strong>. Cada variable tiene un
      tipo definido en tiempo de compilación. No puedes mezclar tipos sin conversión explícita.
      Piensa en los tipos como contratos: el compilador los verifica por ti antes de que tu código se ejecute.
    </p>
    <div class="bg-go-darker rounded-lg p-4 text-sm overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="text-go-accent">
            <th class="pb-2 pr-4">Tipo</th>
            <th class="pb-2 pr-4">Tamaño</th>
            <th class="pb-2 pr-4">Zero Value</th>
            <th class="pb-2">Ejemplo</th>
          </tr>
        </thead>
        <tbody class="text-go-muted">
          <tr><td class="py-1 pr-4 text-go-text font-mono">int</td><td class="pr-4">32/64 bits</td><td class="pr-4 font-mono">0</td><td class="font-mono">42</td></tr>
          <tr><td class="py-1 pr-4 text-go-text font-mono">float64</td><td class="pr-4">64 bits</td><td class="pr-4 font-mono">0.0</td><td class="font-mono">3.14</td></tr>
          <tr><td class="py-1 pr-4 text-go-text font-mono">string</td><td class="pr-4">variable</td><td class="pr-4 font-mono">""</td><td class="font-mono">"hola"</td></tr>
          <tr><td class="py-1 pr-4 text-go-text font-mono">bool</td><td class="pr-4">1 byte</td><td class="pr-4 font-mono">false</td><td class="font-mono">true</td></tr>
          <tr><td class="py-1 pr-4 text-go-text font-mono">byte</td><td class="pr-4">8 bits</td><td class="pr-4 font-mono">0</td><td class="font-mono">'A' (uint8)</td></tr>
          <tr><td class="py-1 pr-4 text-go-text font-mono">rune</td><td class="pr-4">32 bits</td><td class="pr-4 font-mono">0</td><td class="font-mono">'&#x1F600;' (int32)</td></tr>
        </tbody>
      </table>
    </div>
    <div class="bg-go-accent/5 border border-go-accent/20 rounded-lg p-3 mt-4">
      <p class="text-go-accent font-semibold text-sm mb-1">byte vs rune</p>
      <p class="text-go-muted text-sm">
        <strong class="text-go-text">byte</strong> es un alias de <code class="text-go-accent">uint8</code> (1 byte, 0-255).
        <strong class="text-go-text">rune</strong> es un alias de <code class="text-go-accent">int32</code> (4 bytes, cualquier Unicode).
        Un string en Go es una secuencia de bytes, no de runes. Por eso <code class="text-go-accent">len("café")</code> da 5, no 4
        — la "é" ocupa 2 bytes en UTF-8.
      </p>
    </div>
  </section>

  <!-- Declaraciones -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Dos Formas de Declarar Variables</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go ofrece dos sintaxis principales para declarar variables. Cada una tiene su momento:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// 1. var — tipo explícito, funciona en cualquier scope</span>
<span class="text-go-accent">var</span> nombre <span class="text-go-warning">string</span> = <span class="text-go-success">"Gopher"</span>
<span class="text-go-accent">var</span> edad <span class="text-go-warning">int</span>                  <span class="text-go-muted">// zero value: 0</span>

<span class="text-go-muted">// Bloque var para agrupar</span>
<span class="text-go-accent">var</span> (
    host   = <span class="text-go-success">"localhost"</span>
    puerto = 8080
)

<span class="text-go-muted">// 2. := — tipo inferido, solo dentro de funciones</span>
ciudad := <span class="text-go-success">"Buenos Aires"</span>     <span class="text-go-muted">// Go infiere string</span>
pi := 3.14159                   <span class="text-go-muted">// Go infiere float64</span>
activo := true                  <span class="text-go-muted">// Go infiere bool</span></code></pre>`}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm mb-1">var (explícito)</p>
        <ul class="text-go-muted text-sm space-y-1">
          <li>&#8226; Funciona en cualquier scope (paquete o función)</li>
          <li>&#8226; Útil cuando quieres el zero value</li>
          <li>&#8226; Puedes agrupar: <code class="text-go-accent">var ( ... )</code></li>
        </ul>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm mb-1">:= (inferido)</p>
        <ul class="text-go-muted text-sm space-y-1">
          <li>&#8226; Solo dentro de funciones</li>
          <li>&#8226; Más conciso y el estilo preferido</li>
          <li>&#8226; Go infiere el tipo del valor</li>
        </ul>
      </div>
    </div>
    <div class="bg-go-danger/5 border border-go-danger/20 rounded-lg p-3 mt-4">
      <p class="text-go-danger font-semibold text-sm mb-1">Trampa clásica: := vs =</p>
      <p class="text-go-muted text-sm">
        <code class="text-go-accent">x := 5</code> <strong class="text-go-text">declara</strong> una variable nueva.
        <code class="text-go-accent">x = 10</code> <strong class="text-go-text">reasigna</strong> una existente.
        Si usas <code class="text-go-accent">:=</code> en una variable que ya existe en el mismo scope, el compilador te da error:
        <em>no new variables on left side of :=</em>.
      </p>
    </div>
  </section>

  <!-- Zero Values -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Zero Values: Sin Variables Sin Inicializar</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      En Go, <strong class="text-go-text">toda variable tiene un valor desde el momento en que se declara</strong>.
      No existe "undefined" ni "null" para tipos básicos. Piénsalo así: en C, una variable sin inicializar puede
      contener basura de memoria. En JavaScript, puede ser <code class="text-go-accent">undefined</code>.
      En Go, siempre tiene un valor predecible y seguro.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">var</span> i <span class="text-go-warning">int</span>       <span class="text-go-muted">// 0</span>
<span class="text-go-accent">var</span> f <span class="text-go-warning">float64</span>   <span class="text-go-muted">// 0.0</span>
<span class="text-go-accent">var</span> b <span class="text-go-warning">bool</span>      <span class="text-go-muted">// false</span>
<span class="text-go-accent">var</span> s <span class="text-go-warning">string</span>    <span class="text-go-muted">// "" (string vacío)</span>
<span class="text-go-accent">var</span> p <span class="text-go-warning">*int</span>      <span class="text-go-muted">// nil (solo punteros, slices, maps, channels, interfaces)</span></code></pre>`}
    <p class="text-go-muted text-sm mt-3">
      Esto significa que puedes declarar un <code class="text-go-accent">var contador int</code> y empezar a usar
      <code class="text-go-accent">contador++</code> inmediatamente — ya vale 0. No necesitas inicializarlo.
    </p>
  </section>

  <!-- Constantes e iota -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Constantes e iota</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Las constantes en Go se declaran con <code class="text-go-accent">const</code>. A diferencia de las variables,
      se resuelven en tiempo de compilación y las constantes sin tipo tienen precisión arbitraria.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">const</span> pi = 3.14159              <span class="text-go-muted">// constante sin tipo (untyped)</span>
<span class="text-go-accent">const</span> maxConexiones <span class="text-go-warning">int</span> = 100   <span class="text-go-muted">// constante tipada</span>

<span class="text-go-muted">// iota: enumeraciones elegantes</span>
<span class="text-go-accent">type</span> <span class="text-go-warning">DiaSemana</span> int
<span class="text-go-accent">const</span> (
    Lunes <span class="text-go-warning">DiaSemana</span> = <span class="text-go-accent">iota</span>  <span class="text-go-muted">// 0</span>
    Martes                     <span class="text-go-muted">// 1 (iota se incrementa)</span>
    Miercoles                  <span class="text-go-muted">// 2</span>
    Jueves                     <span class="text-go-muted">// 3</span>
)

<span class="text-go-muted">// iota con expresiones: tamaños de almacenamiento</span>
<span class="text-go-accent">const</span> (
    _  = <span class="text-go-accent">iota</span>             <span class="text-go-muted">// 0 descartado con _</span>
    KB = 1 &lt;&lt; (10 * <span class="text-go-accent">iota</span>) <span class="text-go-muted">// 1 &lt;&lt; 10 = 1024</span>
    MB                      <span class="text-go-muted">// 1 &lt;&lt; 20 = 1,048,576</span>
    GB                      <span class="text-go-muted">// 1 &lt;&lt; 30 = 1,073,741,824</span>
)</code></pre>`}
    <div class="bg-go-accent/5 border border-go-accent/20 rounded-lg p-3 mt-3">
      <p class="text-go-accent font-semibold text-sm mb-1">El poder de iota</p>
      <p class="text-go-muted text-sm">
        <code class="text-go-accent">iota</code> se reinicia a 0 en cada nuevo bloque <code class="text-go-accent">const</code>.
        Se incrementa por cada línea, incluyendo líneas con <code class="text-go-accent">_</code>.
        Combinado con expresiones como bit shifting, genera constantes complejas sin números mágicos.
      </p>
    </div>
  </section>

  <!-- Conversión de tipos -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Conversión Explícita de Tipos</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go <strong class="text-go-text">no hace conversión implícita</strong> entre tipos. Ni siquiera entre
      <code class="text-go-accent">int</code> y <code class="text-go-accent">float64</code>. Esto previene bugs
      sutiles donde datos se pierden silenciosamente.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code>entero := 42
flotante := <span class="text-go-warning">float64</span>(entero)       <span class="text-go-muted">// int → float64</span>
texto := fmt.Sprintf(<span class="text-go-success">"%d"</span>, entero) <span class="text-go-muted">// int → string</span>
truncado := <span class="text-go-warning">int</span>(3.99)             <span class="text-go-muted">// float64 → int (trunca a 3, NO redondea)</span></code></pre>`}
    <div class="bg-go-warning/5 border border-go-warning/20 rounded-lg p-3 mt-3">
      <p class="text-go-warning font-semibold text-sm mb-1">Cuidado con la truncación</p>
      <p class="text-go-muted text-sm">
        <code class="text-go-accent">int(3.99)</code> da <strong class="text-go-text">3</strong>, no 4.
        La conversión de float a int siempre trunca hacia cero. Si necesitas redondear, usa
        <code class="text-go-accent">math.Round()</code>.
      </p>
    </div>
  </section>

  <!-- Worked Examples -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Ejemplos Guiados</h2>
    <p class="text-go-muted mb-4">
      Sigue cada ejemplo paso a paso para ver cómo funcionan los zero values, las declaraciones y el poder de iota.
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
    <h2 class="text-xl font-bold mb-3">Experimenta con Tipos</h2>
    <p class="text-go-muted mb-4">
      Prueba declarar variables con <code class="text-go-accent">var</code> y <code class="text-go-accent">:=</code>.
      Usa <code class="text-go-accent">%T</code> en Printf para verificar los tipos que Go infiere.
    </p>
    <GoPlayground
      code={playgroundCode}
      title="Playground de Tipos"
      description="Experimenta con tipos básicos, zero values y conversiones."
    />
  </section>

  <!-- Code Challenges -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Desafíos de Código</h2>
    <p class="text-go-muted mb-4">
      Practica declaraciones, zero values e iota. Cada ejercicio aumenta la dificultad.
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
  <ModuleNav currentModule={2} />
</div>

<VocabularyFloat moduleId={2} />

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

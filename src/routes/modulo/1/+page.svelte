<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';

  const module = modules.find(m => m.id === 1)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'primer-printf')!);

  const helloWorldCode = `package main

import "fmt"

func main() {
\tfmt.Println("Hola, mundo!")
\tfmt.Println("Bienvenido a Go")

\t// Prueba cambiar el mensaje
\tnombre := "Gopher"
\tfmt.Printf("Hola, %s! Go fue creado en %d\\n", nombre, 2009)
}`;

  const quizQuestions = [
    {
      question: '¿En qué año se hizo público Go como proyecto open source?',
      options: [
        { text: '2007', correct: false, explanation: 'En 2007 comenzó el diseño interno en Google, pero no se hizo público hasta 2009.' },
        { text: '2009', correct: true, explanation: '¡Correcto! Go fue anunciado públicamente en noviembre de 2009.' },
        { text: '2012', correct: false, explanation: 'En 2012 se lanzó Go 1.0, la primera versión estable, pero ya era público desde 2009.' },
        { text: '2015', correct: false, explanation: 'Para 2015 Go ya llevaba años como proyecto open source.' },
      ],
      source: 'Go at Google',
      sourceUrl: 'https://go.dev/talks/2012/splash.article',
    },
    {
      question: '¿Cuáles son los tres creadores originales de Go?',
      options: [
        { text: 'Guido van Rossum, James Gosling, Bjarne Stroustrup', correct: false, explanation: 'Esos son los creadores de Python, Java y C++ respectivamente.' },
        { text: 'Rob Pike, Ken Thompson, Robert Griesemer', correct: true, explanation: '¡Correcto! Estos tres ingenieros de Google diseñaron Go.' },
        { text: 'Linus Torvalds, Dennis Ritchie, Brian Kernighan', correct: false, explanation: 'Ellos son iconos de Linux y C, pero no crearon Go.' },
        { text: 'Rob Pike, Dennis Ritchie, Ken Thompson', correct: false, explanation: 'Ken Thompson y Rob Pike sí, pero Dennis Ritchie no participó. El tercero es Robert Griesemer.' },
      ],
      source: 'Go Documentary',
      sourceUrl: 'https://golang.design/history/',
    },
    {
      question: '¿Cuál es la filosofía principal de diseño de Go?',
      options: [
        { text: 'Máxima expresividad y muchas características', correct: false, explanation: 'Go deliberadamente OMITE características para mantener la simplicidad.' },
        { text: 'Simplicidad, compilación rápida y concurrencia integrada', correct: true, explanation: '¡Correcto! Go prioriza la simplicidad, velocidad de compilación y concurrencia nativa.' },
        { text: 'Orientación a objetos pura con herencia', correct: false, explanation: 'Go NO tiene herencia ni clases. Usa composición e interfaces implícitas.' },
        { text: 'Máximo rendimiento sacrificando legibilidad', correct: false, explanation: 'Go busca un balance: buen rendimiento SIN sacrificar legibilidad.' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go',
    },
    {
      question: '¿Qué hace el comando "go fmt"?',
      options: [
        { text: 'Compila el programa', correct: false, explanation: '"go build" compila. "go fmt" formatea el código fuente.' },
        { text: 'Ejecuta los tests', correct: false, explanation: '"go test" ejecuta tests. "go fmt" se encarga del formato.' },
        { text: 'Formatea el código según el estilo estándar de Go', correct: true, explanation: '¡Correcto! "go fmt" aplica el formato oficial, eliminando debates de estilo.' },
        { text: 'Descarga dependencias', correct: false, explanation: '"go get" o "go mod tidy" manejan dependencias, no "go fmt".' },
      ],
      source: 'Go Documentation',
      sourceUrl: 'https://go.dev/doc/effective_go#formatting',
    },
    {
      question: '¿Qué función es el punto de entrada de un programa Go?',
      options: [
        { text: 'func init()', correct: false, explanation: 'init() se ejecuta automáticamente al cargar un paquete, pero NO es el punto de entrada del programa.' },
        { text: 'func start()', correct: false, explanation: 'No existe una función start() especial en Go.' },
        { text: 'func main() en el paquete main', correct: true, explanation: '¡Correcto! Todo programa ejecutable en Go necesita func main() dentro de package main.' },
        { text: 'func run()', correct: false, explanation: 'No existe una función run() como punto de entrada estándar.' },
      ],
      source: 'Go Specification',
      sourceUrl: 'https://go.dev/ref/spec#Program_execution',
    },
  ];

  function handleQuizComplete(score: number, total: number) {
    courseStore.completeModule(1, score, total);
    if (score >= 3) {
      courseStore.unlockBadge('primer-printf');
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

  <!-- Historia de Go -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">El Origen de Go</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go nació en <strong class="text-go-text">2007</strong> dentro de Google, creado por tres leyendas de la computación:
      <strong class="text-go-accent">Rob Pike</strong> (co-creador de UTF-8 y Plan 9),
      <strong class="text-go-accent">Ken Thompson</strong> (co-creador de Unix y C) y
      <strong class="text-go-accent">Robert Griesemer</strong> (trabajo en V8 y Java HotSpot).
    </p>
    <p class="text-go-muted leading-relaxed mb-4">
      El problema que querían resolver era real: en Google, compilar proyectos grandes en C++ tomaba
      <strong class="text-go-text">minutos u horas</strong>. Necesitaban un lenguaje que compilara rápido,
      manejara concurrencia nativamente y fuera simple de aprender.
    </p>
    <div class="bg-go-darker rounded-lg p-4 text-sm">
      <p class="text-go-accent font-semibold mb-2">Hitos clave:</p>
      <ul class="space-y-1 text-go-muted">
        <li>&#8226; <strong class="text-go-text">2007</strong> - Inicio del diseño en Google</li>
        <li>&#8226; <strong class="text-go-text">2009</strong> - Anuncio público como open source</li>
        <li>&#8226; <strong class="text-go-text">2012</strong> - Go 1.0 con la promesa de compatibilidad</li>
        <li>&#8226; <strong class="text-go-text">2022</strong> - Go 1.18 introduce Generics</li>
      </ul>
    </div>
  </section>

  <!-- Filosofía -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Filosofía de Go</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go fue diseñado con una filosofía clara: <strong class="text-go-text">menos es más</strong>.
      Mientras otros lenguajes añaden características, Go deliberadamente las omite para mantener la simplicidad.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Simplicidad</p>
        <p class="text-go-muted text-sm">Pocas keywords (25), una sola forma de hacer las cosas.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Compilacion Rapida</p>
        <p class="text-go-muted text-sm">Compila a binarios nativos en segundos, no minutos.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Concurrencia Nativa</p>
        <p class="text-go-muted text-sm">Goroutines y channels integrados en el lenguaje.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Garbage Collection</p>
        <p class="text-go-muted text-sm">Manejo automatico de memoria sin sacrificar rendimiento.</p>
      </div>
    </div>
  </section>

  <!-- Estructura de un programa -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Estructura de un Programa Go</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Todo programa ejecutable en Go tiene tres elementos esenciales:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">package</span> main          <span class="text-go-muted">// Declara que este es un programa ejecutable</span>

<span class="text-go-accent">import</span> <span class="text-go-success">"fmt"</span>           <span class="text-go-muted">// Importa el paquete de formateo</span>

<span class="text-go-accent">func</span> <span class="text-go-warning">main</span>() {          <span class="text-go-muted">// Punto de entrada del programa</span>
    fmt.Println(<span class="text-go-success">"Hola, mundo!"</span>)
}</code></pre>`}
    <ul class="space-y-2 text-go-muted text-sm">
      <li>&#8226; <strong class="text-go-text">package main</strong> - Indica que este archivo es parte de un programa ejecutable</li>
      <li>&#8226; <strong class="text-go-text">import "fmt"</strong> - Importa el paquete de formato estándar</li>
      <li>&#8226; <strong class="text-go-text">func main()</strong> - La función que se ejecuta al correr el programa</li>
    </ul>
  </section>

  <!-- Toolchain -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">El Toolchain de Go</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go incluye herramientas poderosas de serie. No necesitas configurar nada extra:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">go run</span> main.go      <span class="text-go-muted"># Compila y ejecuta en un solo paso</span>
<span class="text-go-accent">go build</span> main.go    <span class="text-go-muted"># Compila a un binario ejecutable</span>
<span class="text-go-accent">go fmt</span> ./...         <span class="text-go-muted"># Formatea TODO el codigo (un solo estilo)</span>
<span class="text-go-accent">go vet</span> ./...         <span class="text-go-muted"># Detecta errores comunes en el codigo</span>
<span class="text-go-accent">go test</span> ./...        <span class="text-go-muted"># Ejecuta todos los tests</span>
<span class="text-go-accent">go mod init</span> ejemplo  <span class="text-go-muted"># Inicializa un nuevo modulo</span></code></pre>`}
  </section>

  <!-- GoPlayground -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Tu Primer Programa</h2>
    <p class="text-go-muted mb-4">
      Experimenta con el codigo. Modifica los mensajes, agrega nuevas lineas con
      <code class="text-go-accent">fmt.Println()</code> y prueba
      <code class="text-go-accent">fmt.Printf()</code> con diferentes formatos.
    </p>
    <GoPlayground
      code={helloWorldCode}
      title="Hola Mundo en Go"
      description="Presiona Ejecutar para ver tu primer programa Go en accion. Prueba modificarlo!"
    />
  </section>

  <!-- Quiz -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Pon a Prueba tu Conocimiento</h2>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  <SourcesSection sources={module.sources} />
  <ModuleNav currentModule={1} />
</div>

<VocabularyFloat moduleId={1} />

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

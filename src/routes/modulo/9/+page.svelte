<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import DragDrop from '$lib/components/DragDrop.svelte';
  import Quiz from '$lib/components/Quiz.svelte';

  const mod = modules.find(m => m.id === 9)!;

  let dragDropScore = $state(0);
  let quizScore = $state(0);
  let dragDropDone = $state(false);
  let quizDone = $state(false);
  let moduleCompleted = $state(false);

  courseStore.startModule(9);

  const dragItems = [
    { id: 'main-go', label: 'main.go (punto de entrada)' },
    { id: 'server-cmd', label: 'server/main.go (binario servidor)' },
    { id: 'db-internal', label: 'database.go (lógica privada)' },
    { id: 'utils-pkg', label: 'helpers.go (utilidades públicas)' },
    { id: 'go-mod', label: 'go.mod (definición del módulo)' },
    { id: 'handler-test', label: 'handler_test.go (tests)' },
  ];

  const dropZones = [
    { id: 'root', label: 'Raíz del proyecto (/)', correctItemId: 'go-mod' },
    { id: 'cmd-root', label: 'cmd/app/', correctItemId: 'main-go' },
    { id: 'cmd-server', label: 'cmd/server/', correctItemId: 'server-cmd' },
    { id: 'internal', label: 'internal/storage/', correctItemId: 'db-internal' },
    { id: 'pkg', label: 'pkg/utils/', correctItemId: 'utils-pkg' },
    { id: 'test', label: 'internal/handler/', correctItemId: 'handler-test' },
  ];

  const quizQuestions = [
    {
      question: '¿Qué determina si un identificador (variable, función, tipo) es exportado en Go?',
      options: [
        { text: 'La palabra clave "export"', correct: false, explanation: 'Go no tiene una keyword "export". La visibilidad se controla por convención de nombres.' },
        { text: 'Que la primera letra sea mayúscula', correct: true, explanation: '¡Correcto! En Go, si un nombre empieza con mayúscula (ej: MiFuncion) es exportado/público. Minúscula = privado al paquete.' },
        { text: 'Que esté en un archivo público', correct: false, explanation: 'No existen archivos públicos o privados en Go. La visibilidad depende del nombre.' },
        { text: 'Que tenga la anotación @public', correct: false, explanation: 'Go no usa anotaciones. La convención de mayúscula/minúscula es suficiente.' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go#package-names',
    },
    {
      question: '¿Qué archivo define un módulo Go y sus dependencias?',
      options: [
        { text: 'package.json', correct: false, explanation: 'Ese es el archivo de dependencias de Node.js, no de Go.' },
        { text: 'go.mod', correct: true, explanation: '¡Correcto! go.mod declara el path del módulo, la versión de Go y las dependencias.' },
        { text: 'requirements.txt', correct: false, explanation: 'Ese es el formato de Python (pip). Go usa go.mod.' },
        { text: 'Makefile', correct: false, explanation: 'Makefile es para automatización de builds, no para gestionar módulos.' },
      ],
      source: 'Go Modules Reference',
      sourceUrl: 'https://go.dev/ref/mod',
    },
    {
      question: '¿Qué hace "go vet"?',
      options: [
        { text: 'Formatea el código fuente', correct: false, explanation: '"go fmt" formatea el código. "go vet" analiza errores.' },
        { text: 'Descarga dependencias', correct: false, explanation: '"go get" y "go mod tidy" manejan dependencias.' },
        { text: 'Analiza el código en busca de errores comunes y sospechosos', correct: true, explanation: '¡Correcto! go vet detecta errores que compilan pero probablemente son bugs: Printf con argumentos incorrectos, unreachable code, etc.' },
        { text: 'Ejecuta los benchmarks', correct: false, explanation: '"go test -bench" ejecuta benchmarks. go vet es análisis estático.' },
      ],
      source: 'Go Documentation',
      sourceUrl: 'https://go.dev/doc/code',
    },
    {
      question: '¿Para qué sirve el directorio "internal/" en un proyecto Go?',
      options: [
        { text: 'Para archivos temporales de compilación', correct: false, explanation: 'Los archivos de compilación van en el cache de Go, no en internal/.' },
        { text: 'Para código que solo puede ser importado por el módulo padre', correct: true, explanation: '¡Correcto! El compilador de Go IMPIDE que otros módulos importen paquetes dentro de internal/. Es privacidad a nivel de módulo.' },
        { text: 'Para almacenar configuraciones', correct: false, explanation: 'Las configuraciones pueden ir en cualquier lugar. internal/ tiene significado especial para el compilador.' },
        { text: 'Es solo una convención, no tiene efecto real', correct: false, explanation: 'internal/ SÍ tiene efecto real: el compilador rechaza imports desde fuera del módulo padre.' },
      ],
      source: 'Go Modules Reference',
      sourceUrl: 'https://go.dev/ref/mod',
    },
    {
      question: '¿Cuál es la diferencia entre "go fmt" y "gofmt"?',
      options: [
        { text: 'Son exactamente lo mismo', correct: false, explanation: 'Son similares pero no idénticos. "go fmt" invoca gofmt internamente pero con comportamiento diferente.' },
        { text: '"go fmt" opera sobre paquetes, "gofmt" opera sobre archivos', correct: true, explanation: '¡Correcto! "go fmt" usa el sistema de paquetes de Go (./...), mientras que gofmt trabaja directamente con archivos y tiene más flags.' },
        { text: '"gofmt" es la versión antigua y obsoleta', correct: false, explanation: 'gofmt sigue siendo una herramienta válida y útil, con opciones que go fmt no expone.' },
        { text: '"go fmt" es más rápido', correct: false, explanation: '"go fmt" internamente llama a gofmt. La diferencia es en cómo se especifican los archivos.' },
      ],
      source: 'Go Documentation',
      sourceUrl: 'https://go.dev/doc/effective_go#formatting',
    },
  ];

  function handleDragDropComplete(correct: number, total: number) {
    dragDropScore = correct;
    dragDropDone = true;
    checkCompletion();
  }

  function handleQuizComplete(score: number, total: number) {
    quizScore = score;
    quizDone = true;
    checkCompletion();
  }

  function checkCompletion() {
    if (dragDropDone && quizDone) {
      const totalScore = dragDropScore + quizScore;
      const maxScore = 11;
      courseStore.completeModule(9, totalScore, maxScore);
      moduleCompleted = true;
    }
  }
</script>

<svelte:head>
  <title>{mod.title} | Curso de Go</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
  <div class="mb-8">
    <span class="text-4xl">{mod.icon}</span>
    <h1 class="text-3xl font-bold mt-2">{mod.title}</h1>
    <p class="text-go-muted mt-1">{mod.subtitle}</p>
  </div>

  <!-- Paquetes -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Paquetes en Go</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      En Go, <strong class="text-go-text">todo archivo pertenece a un paquete</strong>. La primera línea de cada
      archivo <code class="text-go-accent">.go</code> declara a qué paquete pertenece. Hay dos tipos fundamentales:
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">package main</p>
        <p class="text-go-muted text-sm">Crea un <strong class="text-go-text">programa ejecutable</strong>. Necesita una función main().</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">package milib</p>
        <p class="text-go-muted text-sm">Crea una <strong class="text-go-text">biblioteca</strong> reutilizable que otros paquetes pueden importar.</p>
      </div>
    </div>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// archivo: mathutil/calc.go</span>
<span class="text-go-accent">package</span> mathutil

<span class="text-go-muted">// Sumar está exportada (mayúscula) - visible fuera del paquete</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">Sumar</span>(a, b <span class="text-go-accent">int</span>) <span class="text-go-accent">int</span> {
    <span class="text-go-accent">return</span> a + b
}

<span class="text-go-muted">// validar NO está exportada (minúscula) - privada al paquete</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">validar</span>(n <span class="text-go-accent">int</span>) <span class="text-go-accent">bool</span> {
    <span class="text-go-accent">return</span> n &gt; 0
}</code></pre>`}
  </section>

  <!-- Visibilidad -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Reglas de Visibilidad</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go tiene una regla de visibilidad elegantemente simple: <strong class="text-go-text">la primera letra decide todo</strong>.
    </p>
    <div class="bg-go-darker rounded-lg p-4 text-sm mb-4">
      <ul class="space-y-2 text-go-muted">
        <li>&#8226; <code class="text-go-success">MiFuncion</code> → <strong class="text-go-success">Exportada</strong> (pública) - Accesible desde otros paquetes</li>
        <li>&#8226; <code class="text-go-danger">miFuncion</code> → <strong class="text-go-danger">No exportada</strong> (privada) - Solo dentro del paquete</li>
        <li>&#8226; <code class="text-go-success">Tipo</code>, <code class="text-go-success">Constante</code>, <code class="text-go-success">Variable</code> → Misma regla aplica a TODOS los identificadores</li>
      </ul>
    </div>
    <p class="text-go-muted text-sm">
      Esta convención elimina la necesidad de keywords como <code class="text-go-accent">public</code> o
      <code class="text-go-accent">private</code>. Es simple, visual y uniforme.
    </p>
  </section>

  <!-- Go Modules -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Go Modules</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Un <strong class="text-go-text">módulo</strong> es una colección de paquetes que se versionan juntos.
      Se define con <code class="text-go-accent">go mod init</code> y se registra en <code class="text-go-accent">go.mod</code>.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">$</span> go mod init github.com/usuario/miproyecto

<span class="text-go-muted">// Esto crea go.mod:</span>
<span class="text-go-accent">module</span> github.com/usuario/miproyecto

<span class="text-go-accent">go</span> 1.22

<span class="text-go-accent">require</span> (
    github.com/gin-gonic/gin v1.9.1
    github.com/lib/pq v1.10.9
)</code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 text-sm">
      <p class="text-go-accent font-semibold mb-2">Comandos clave:</p>
      <ul class="space-y-1 text-go-muted">
        <li>&#8226; <code class="text-go-text">go mod init</code> - Inicializa un nuevo módulo</li>
        <li>&#8226; <code class="text-go-text">go get paquete@v1.2.3</code> - Agrega o actualiza una dependencia</li>
        <li>&#8226; <code class="text-go-text">go mod tidy</code> - Limpia dependencias no usadas y agrega las faltantes</li>
        <li>&#8226; <code class="text-go-text">go.sum</code> - Checksums de seguridad (no editar manualmente)</li>
      </ul>
    </div>
  </section>

  <!-- Estructura del proyecto -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Estructura de Proyecto</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go tiene convenciones de estructura que la comunidad sigue ampliamente:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code>miproyecto/
├── <span class="text-go-accent">go.mod</span>              <span class="text-go-muted">// Definición del módulo</span>
├── <span class="text-go-accent">go.sum</span>              <span class="text-go-muted">// Checksums de dependencias</span>
├── <span class="text-go-warning">cmd/</span>                <span class="text-go-muted">// Puntos de entrada (binarios)</span>
│   ├── <span class="text-go-warning">app/</span>
│   │   └── main.go       <span class="text-go-muted">// go run ./cmd/app</span>
│   └── <span class="text-go-warning">server/</span>
│       └── main.go       <span class="text-go-muted">// go run ./cmd/server</span>
├── <span class="text-go-danger">internal/</span>           <span class="text-go-muted">// Código PRIVADO al módulo</span>
│   ├── handler/
│   └── storage/
└── <span class="text-go-success">pkg/</span>                <span class="text-go-muted">// Código reutilizable (público)</span>
    └── utils/</code></pre>`}
  </section>

  <!-- Herramientas esenciales -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Herramientas Esenciales</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go incluye un <strong class="text-go-text">toolchain completo</strong> de serie. No necesitas herramientas externas para lo esencial:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">go fmt</span> ./...       <span class="text-go-muted"># Formatea TODOS los archivos del proyecto</span>
<span class="text-go-accent">go vet</span> ./...       <span class="text-go-muted"># Detecta errores comunes y sospechosos</span>
<span class="text-go-accent">go test</span> ./...      <span class="text-go-muted"># Ejecuta TODOS los tests</span>
<span class="text-go-accent">go build</span> ./...     <span class="text-go-muted"># Compila todos los paquetes</span>
<span class="text-go-accent">go run</span> main.go     <span class="text-go-muted"># Compila y ejecuta en un solo paso</span>
<span class="text-go-accent">go doc</span> fmt.Println <span class="text-go-muted"># Muestra documentación de un símbolo</span></code></pre>`}
  </section>

  <!-- DragDrop Exercise -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Ejercicio: Organiza el Proyecto</h2>
    <p class="text-go-muted mb-4">
      Arrastra cada archivo a su ubicación correcta dentro de la estructura del proyecto Go.
    </p>
    <DragDrop
      items={dragItems}
      zones={dropZones}
      onComplete={handleDragDropComplete}
      instruction="Arrastra cada archivo/componente a la carpeta correcta del proyecto"
    />
  </section>

  <!-- Quiz -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Quiz: Paquetes y Módulos</h2>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  {#if moduleCompleted}
    <div class="card mb-6 border-go-success/30 bg-go-success/5">
      <div class="text-center">
        <span class="text-4xl">&#10003;</span>
        <h3 class="text-xl font-bold text-go-success mt-2">Módulo Completado</h3>
        <p class="text-go-muted mt-1">
          Obtuviste {dragDropScore + quizScore} de 11 puntos
        </p>
      </div>
    </div>
  {/if}

  <SourcesSection sources={mod.sources} />
  <ModuleNav currentModule={9} />
</div>

<VocabularyFloat moduleId={9} />

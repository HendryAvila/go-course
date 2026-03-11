<script lang="ts">
  import { courseStore } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';
  import WorkedExample from '$lib/components/WorkedExample.svelte';
  import CodeChallenge from '$lib/components/CodeChallenge.svelte';
  import ReviewCards from '$lib/components/ReviewCards.svelte';
  import { exercises, workedExamples } from '$lib/data/exercises/module-9';
  import { reviewCards } from '$lib/data/exercises/review-cards';

  const module = modules.find(m => m.id === 9)!;

  const slogComparisonCode = `package main

import (
\t"log"
\t"log/slog"
\t"os"
)

func main() {
\t// Viejo: log clásico — texto plano, sin estructura
\tlog.Println("usuario autenticado: user_id=123 rol=admin")

\t// Nuevo: slog — estructurado, con niveles y handlers
\tlogger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
\tlogger.Info("usuario autenticado",
\t\t"user_id", 123,
\t\t"rol", "admin",
\t)

\t// Sub-logger con contexto fijo
\treqLogger := logger.With("request_id", "req-abc", "servicio", "auth")
\treqLogger.Info("token verificado", "expira_en", "2h")
\treqLogger.Warn("rate limit cercano", "uso", 95, "limite", 100)
}`;

  const quizQuestions = [
    {
      question: '¿Qué determina si un nombre es exportado (público) en Go?',
      options: [
        { text: 'La keyword public', correct: false, explanation: 'Go no tiene keywords public/private. Usa una convención más elegante.' },
        { text: 'La primera letra: mayúscula = exportado, minúscula = no exportado', correct: true, explanation: '¡Correcto! Es así de simple. Aplica a funciones, tipos, variables, constantes y campos de structs.' },
        { text: 'Un archivo de configuración de exports', correct: false, explanation: 'No hay archivo de exports. La primera letra del nombre es todo lo que necesitas.' },
        { text: 'La carpeta donde está el archivo', correct: false, explanation: 'La ubicación no determina visibilidad (excepto el caso especial de internal/).' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go#package-names',
    },
    {
      question: '¿Qué archivos genera go mod init y para qué sirven?',
      options: [
        { text: 'go.config — configuración del proyecto', correct: false, explanation: 'No existe go.config. Go usa go.mod y go.sum.' },
        { text: 'go.mod (dependencias y versión de Go) y go.sum (checksums de integridad)', correct: true, explanation: '¡Correcto! go.mod define el módulo, la versión de Go y las dependencias. go.sum contiene los hashes criptográficos para verificar que las dependencias no fueron alteradas.' },
        { text: 'package.json y package-lock.json', correct: false, explanation: 'Esos son de Node.js. Go usa go.mod y go.sum.' },
        { text: 'Solo go.mod — go.sum se genera al compilar', correct: false, explanation: 'go.sum se genera con go mod tidy o al descargar dependencias, no al compilar.' },
      ],
      source: 'Go Modules Reference',
      sourceUrl: 'https://go.dev/ref/mod',
    },
    {
      question: '¿Qué ventaja tiene slog sobre el paquete log clásico?',
      options: [
        { text: 'Es más rápido porque usa goroutines', correct: false, explanation: 'La ventaja no es de goroutines sino de estructura y handlers.' },
        { text: 'Logging estructurado con key-value, niveles, y handlers intercambiables (JSON/Text)', correct: true, explanation: '¡Correcto! slog produce logs estructurados que herramientas como Grafana o Datadog pueden parsear. Los handlers permiten cambiar formato sin cambiar código.' },
        { text: 'Reemplaza completamente a fmt', correct: false, explanation: 'slog es para logging de aplicación. fmt sigue existiendo para output general.' },
        { text: 'Solo agrega colores al terminal', correct: false, explanation: 'slog es un rediseño completo del logging con estructura, niveles y handlers.' },
      ],
      source: 'Go Blog: Structured Logging',
      sourceUrl: 'https://go.dev/blog/slog',
    },
    {
      question: '¿Qué hace go vet que el compilador NO hace?',
      options: [
        { text: 'Compila más rápido', correct: false, explanation: 'go vet no compila. Analiza código buscando errores sutiles.' },
        { text: 'Detecta errores sutiles como Printf con args incorrectos, copies de locks, código inalcanzable', correct: true, explanation: '¡Correcto! go vet es análisis estático que va más allá de la compilación. Encuentra errores que compilan pero son bugs.' },
        { text: 'Formatea el código', correct: false, explanation: 'Eso es go fmt. go vet analiza, no modifica.' },
        { text: 'Ejecuta los tests', correct: false, explanation: 'Eso es go test. go vet hace análisis estático.' },
      ],
      source: 'Go Documentation',
      sourceUrl: 'https://pkg.go.dev/cmd/vet',
    },
    {
      question: '¿Qué hace la carpeta internal/ de especial en un proyecto Go?',
      options: [
        { text: 'Nada especial, es solo una convención', correct: false, explanation: 'internal/ tiene una restricción REAL del compilador, no es solo convención.' },
        { text: 'Go impide que paquetes fuera del árbol padre importen paquetes dentro de internal/', correct: true, explanation: '¡Correcto! Si tienes myapp/internal/auth, solo paquetes dentro de myapp/ pueden importar auth. Paquetes externos reciben error de compilación. Es privacidad real.' },
        { text: 'Los archivos en internal/ no se compilan', correct: false, explanation: 'Sí se compilan, pero solo son accesibles desde el módulo padre.' },
        { text: 'Es donde van los tests', correct: false, explanation: 'Los tests van junto al código con sufijo _test.go. internal/ es para código privado del módulo.' },
      ],
      source: 'Go Command: Internal Directories',
      sourceUrl: 'https://pkg.go.dev/cmd/go#hdr-Internal_Directories',
    },
  ];

  function handleQuizComplete(score: number, total: number) {
    courseStore.completeModule(9, score, total);
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
  <ReviewCards moduleId={9} cards={reviewCards} />

  <!-- Packages y Visibilidad -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Paquetes: La Unidad de Organización en Go</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      En Go, cada directorio es un <strong class="text-go-text">paquete</strong>. Todos los archivos
      <code class="text-go-accent">.go</code> en el mismo directorio pertenecen al mismo paquete.
      La visibilidad se controla de la forma más simple posible:
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div class="bg-go-success/10 border border-go-success/30 rounded-lg p-3">
        <p class="text-go-success font-semibold text-sm mb-1">MAYUSCULA = Exportado</p>
        {@html `<pre class="font-mono text-xs mt-2"><code><span class="text-go-accent">func</span> <span class="text-go-warning">Sumar</span>(a, b <span class="text-go-accent">int</span>) <span class="text-go-accent">int</span>
<span class="text-go-accent">type</span> <span class="text-go-warning">Usuario</span> <span class="text-go-accent">struct</span> { ... }
<span class="text-go-accent">const</span> <span class="text-go-warning">Version</span> = <span class="text-go-success">"1.0"</span></code></pre>`}
        <p class="text-go-muted text-xs mt-2">Visible desde cualquier paquete que importe este.</p>
      </div>
      <div class="bg-go-danger/10 border border-go-danger/30 rounded-lg p-3">
        <p class="text-go-danger font-semibold text-sm mb-1">minuscula = Privado</p>
        {@html `<pre class="font-mono text-xs mt-2"><code><span class="text-go-accent">func</span> restar(a, b <span class="text-go-accent">int</span>) <span class="text-go-accent">int</span>
<span class="text-go-accent">type</span> conexion <span class="text-go-accent">struct</span> { ... }
<span class="text-go-accent">const</span> maxRetries = 3</code></pre>`}
        <p class="text-go-muted text-xs mt-2">Solo accesible dentro del mismo paquete.</p>
      </div>
    </div>
    <div class="bg-go-accent/5 border border-go-accent/20 rounded-lg p-3">
      <p class="text-go-accent font-semibold text-sm mb-1">Analogía</p>
      <p class="text-sm text-go-muted">
        Piensa en los paquetes como departamentos de una empresa. Lo que empieza con mayúscula es
        la fachada pública (recepción). Lo de minúscula es interno del departamento.
      </p>
    </div>
  </section>

  <!-- go.mod y Módulos -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Go Modules: Gestión de Dependencias</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Desde Go 1.11, los módulos son la forma estándar de gestionar dependencias.
      Todo proyecto empieza con <code class="text-go-accent">go mod init</code>:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">$</span> go mod init github.com/usuario/miproyecto

<span class="text-go-muted"># Esto crea go.mod:</span>
module github.com/usuario/miproyecto

go 1.23

<span class="text-go-muted"># Comandos esenciales:</span>
<span class="text-go-accent">go get</span> github.com/pkg/errors    <span class="text-go-muted"># Agregar dependencia</span>
<span class="text-go-accent">go mod tidy</span>                     <span class="text-go-muted"># Limpiar: agregar faltantes, quitar sobrantes</span>
<span class="text-go-accent">go mod download</span>                 <span class="text-go-muted"># Descargar todas las dependencias</span></code></pre>`}
    <div class="bg-go-darker rounded-lg p-4">
      <p class="text-go-accent font-semibold text-sm mb-2">Archivos clave</p>
      <ul class="space-y-2 text-go-muted text-sm">
        <li>&#8226; <strong class="text-go-text">go.mod</strong> — Define el módulo, versión de Go y dependencias directas</li>
        <li>&#8226; <strong class="text-go-text">go.sum</strong> — Checksums criptográficos para verificar integridad de dependencias</li>
        <li>&#8226; <strong class="text-go-text">go.work</strong> — Workspaces para trabajar con múltiples módulos locales (Go 1.18+)</li>
      </ul>
    </div>
  </section>

  <!-- Estructura de proyecto -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Estructura de Proyecto Convencional</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go no impone estructura, pero la comunidad sigue convenciones claras:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code>miproyecto/
├── <span class="text-go-accent">go.mod</span>                 <span class="text-go-muted"># Raíz del módulo</span>
├── <span class="text-go-accent">go.sum</span>
├── <span class="text-go-warning">cmd/</span>
│   └── <span class="text-go-warning">miapp/</span>
│       └── main.go          <span class="text-go-muted"># Punto de entrada (package main)</span>
├── <span class="text-go-warning">internal/</span>               <span class="text-go-muted"># Código privado del módulo</span>
│   ├── <span class="text-go-warning">auth/</span>
│   │   └── auth.go
│   └── <span class="text-go-warning">database/</span>
│       └── db.go
├── <span class="text-go-warning">pkg/</span>                    <span class="text-go-muted"># Código reutilizable (público)</span>
│   └── <span class="text-go-warning">mathutil/</span>
│       ├── mathutil.go
│       └── mathutil_test.go <span class="text-go-muted"># Tests junto al código</span>
└── README.md</code></pre>`}
    <div class="bg-go-warning/10 border border-go-warning/30 rounded-lg p-3 mt-3">
      <p class="text-go-warning font-semibold text-sm mb-1">La carpeta internal/ es especial</p>
      <p class="text-sm text-go-muted">
        Go <strong>impide</strong> que paquetes fuera del árbol padre importen código de
        <code class="text-go-accent">internal/</code>. Es privacidad real, no solo convención.
      </p>
    </div>
  </section>

  <!-- Tooling -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">El Toolchain de Go: Todo Incluido</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Una de las grandes fortalezas de Go es que viene con herramientas de primera clase <strong class="text-go-text">de serie</strong>.
      No necesitas instalar nada extra para empezar:
    </p>
    <div class="bg-go-darker rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-go-border text-go-accent">
            <th class="text-left p-3 font-semibold">Comando</th>
            <th class="text-left p-3 font-semibold">Qué hace</th>
          </tr>
        </thead>
        <tbody class="text-go-muted">
          <tr class="border-b border-go-border/50">
            <td class="p-3"><code class="text-go-accent">go run</code></td>
            <td class="p-3">Compila y ejecuta en un solo paso</td>
          </tr>
          <tr class="border-b border-go-border/50">
            <td class="p-3"><code class="text-go-accent">go build</code></td>
            <td class="p-3">Compila a binario nativo (un solo archivo)</td>
          </tr>
          <tr class="border-b border-go-border/50">
            <td class="p-3"><code class="text-go-accent">go test</code></td>
            <td class="p-3">Ejecuta tests, benchmarks y fuzzing</td>
          </tr>
          <tr class="border-b border-go-border/50">
            <td class="p-3"><code class="text-go-accent">go fmt</code></td>
            <td class="p-3">Formatea TODO el código (un estilo, cero debates)</td>
          </tr>
          <tr class="border-b border-go-border/50">
            <td class="p-3"><code class="text-go-accent">go vet</code></td>
            <td class="p-3">Análisis estático: detecta bugs que compilan pero son errores</td>
          </tr>
          <tr class="border-b border-go-border/50">
            <td class="p-3"><code class="text-go-accent">go mod tidy</code></td>
            <td class="p-3">Sincroniza dependencias (agrega faltantes, quita sobrantes)</td>
          </tr>
          <tr>
            <td class="p-3"><code class="text-go-accent">go doc</code></td>
            <td class="p-3">Documentación desde los comentarios del código</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- slog: Structured Logging -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">log/slog: Logging Estructurado (Go 1.21+)</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El paquete <code class="text-go-accent">log</code> clásico de Go produce texto plano.
      En producción, necesitas logs <strong class="text-go-text">estructurados</strong> que herramientas
      como Grafana, Datadog o CloudWatch puedan parsear.
    </p>
    <p class="text-go-muted leading-relaxed mb-4">
      Desde Go 1.21, <code class="text-go-accent">log/slog</code> viene incluido en la stdlib:
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div class="bg-go-danger/10 border border-go-danger/30 rounded-lg p-3">
        <p class="text-go-danger font-semibold text-sm mb-2">Antes: log clasico</p>
        {@html `<pre class="font-mono text-xs"><code>log.Println(<span class="text-go-success">"usuario 123 autenticado como admin"</span>)

<span class="text-go-muted">// Output: texto plano</span>
<span class="text-go-muted">// 2024/01/15 10:30:00 usuario 123 autenticado como admin</span>
<span class="text-go-muted">// ¿Cómo filtras por user_id? Regex...</span></code></pre>`}
      </div>
      <div class="bg-go-success/10 border border-go-success/30 rounded-lg p-3">
        <p class="text-go-success font-semibold text-sm mb-2">Ahora: slog (Go 1.21+)</p>
        {@html `<pre class="font-mono text-xs"><code>slog.Info(<span class="text-go-success">"usuario autenticado"</span>,
    <span class="text-go-success">"user_id"</span>, 123,
    <span class="text-go-success">"rol"</span>, <span class="text-go-success">"admin"</span>,
)

<span class="text-go-muted">// Output JSON: filtrar por user_id es trivial</span>
<span class="text-go-muted">// {"level":"INFO","msg":"usuario autenticado",</span>
<span class="text-go-muted">//  "user_id":123,"rol":"admin"}</span></code></pre>`}
      </div>
    </div>

    <h3 class="font-bold text-lg mb-2 mt-6">Conceptos Clave de slog</h3>
    <div class="space-y-3">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Niveles</p>
        <p class="text-go-muted text-sm">
          <code class="text-go-accent">Debug</code> &lt;
          <code class="text-go-accent">Info</code> &lt;
          <code class="text-go-accent">Warn</code> &lt;
          <code class="text-go-accent">Error</code>
          — En producción configuras el nivel mínimo para filtrar ruido.
        </p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Handlers</p>
        <p class="text-go-muted text-sm">
          <code class="text-go-accent">TextHandler</code> para desarrollo (legible),
          <code class="text-go-accent">JSONHandler</code> para producción (parseable).
          Cambiar formato sin tocar el código de logging.
        </p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Sub-loggers con With()</p>
        <p class="text-go-muted text-sm">
          <code class="text-go-accent">logger.With("request_id", "abc")</code> crea un sub-logger
          donde CADA log incluye request_id automáticamente. Esencial para trazar peticiones en microservicios.
        </p>
      </div>
    </div>
  </section>

  <!-- GoPlayground: slog comparación -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Experimenta: log vs slog</h2>
    <p class="text-go-muted mb-4">
      Compara el output del log clásico con slog. Prueba cambiar el handler y los niveles:
    </p>
    <GoPlayground
      code={slogComparisonCode}
      title="log vs slog"
      description="Compara los dos estilos de logging. Prueba cambiar LevelDebug por LevelWarn."
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
      Practica la organización de paquetes, visibilidad y logging estructurado:
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
  <ModuleNav currentModule={9} />
</div>

<VocabularyFloat moduleId={9} />

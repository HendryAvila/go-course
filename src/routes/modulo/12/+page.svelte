<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';

  const mod = modules.find(m => m.id === 12)!;
  let showBadge = $state(false);
  let showMasterBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'go-master')!);
  let moduleCompleted = $state(false);

  courseStore.startModule(12);

  const httpCode = `package main

import (
\t"encoding/json"
\t"fmt"
\t"log"
\t"net/http"
)

type Usuario struct {
\tID     int    \`json:"id"\`
\tNombre string \`json:"nombre"\`
\tEmail  string \`json:"email"\`
}

var usuarios = []Usuario{
\t{ID: 1, Nombre: "Ana", Email: "ana@go.dev"},
\t{ID: 2, Nombre: "Carlos", Email: "carlos@go.dev"},
}

func handleUsuarios(w http.ResponseWriter, r *http.Request) {
\tw.Header().Set("Content-Type", "application/json")

\tswitch r.Method {
\tcase http.MethodGet:
\t\tjson.NewEncoder(w).Encode(usuarios)
\tcase http.MethodPost:
\t\tvar nuevo Usuario
\t\tif err := json.NewDecoder(r.Body).Decode(&nuevo); err != nil {
\t\t\thttp.Error(w, err.Error(), http.StatusBadRequest)
\t\t\treturn
\t\t}
\t\tnuevo.ID = len(usuarios) + 1
\t\tusuarios = append(usuarios, nuevo)
\t\tw.WriteHeader(http.StatusCreated)
\t\tjson.NewEncoder(w).Encode(nuevo)
\tdefault:
\t\thttp.Error(w, "Metodo no permitido", http.StatusMethodNotAllowed)
\t}
}

func main() {
\thttp.HandleFunc("/usuarios", handleUsuarios)
\tfmt.Println("Servidor en :8080")
\tlog.Fatal(http.ListenAndServe(":8080", nil))
}`;

  const quizQuestions = [
    {
      question: '¿Cuál es la convención de nombre para funciones de test en Go?',
      options: [
        { text: 'test_mi_funcion()', correct: false, explanation: 'Go no usa snake_case para tests. Usa CamelCase con el prefijo Test.' },
        { text: 'func TestMiFuncion(t *testing.T)', correct: true, explanation: '¡Correcto! Los tests DEBEN empezar con "Test" seguido de mayúscula, y recibir *testing.T como parámetro.' },
        { text: 'func test_mi_funcion(t *Test)', correct: false, explanation: 'Ni el nombre ni el tipo del parámetro son correctos. Es TestXxx con *testing.T.' },
        { text: 'func MiTest() error', correct: false, explanation: 'Los tests no retornan error. Usan t.Error() o t.Fatal() para reportar fallos.' },
      ],
      source: 'Go by Example: Testing',
      sourceUrl: 'https://gobyexample.com/testing-and-benchmarking',
    },
    {
      question: '¿Qué son los "table-driven tests" en Go?',
      options: [
        { text: 'Tests que usan una base de datos de tabla', correct: false, explanation: 'No tiene nada que ver con bases de datos. Es un patrón de organización de test cases.' },
        { text: 'Un slice de casos de test que se iteran con un loop, cada uno con input y output esperado', correct: true, explanation: '¡Correcto! Es el patrón idiomático de Go: defines los casos en un slice de structs y los iteras con t.Run() para subtests nombrados.' },
        { text: 'Tests que se ejecutan en una tabla HTML', correct: false, explanation: 'No tiene relación con HTML. Es un patrón de código Go puro.' },
        { text: 'Tests que corren en paralelo en una grid', correct: false, explanation: 'Los tests paralelos son otra cosa (t.Parallel()). Table-driven es un patrón de organización.' },
      ],
      source: 'Practical Go: Dave Cheney',
      sourceUrl: 'https://dave.cheney.net/practical-go/presentations/qcon-china.html',
    },
    {
      question: '¿Para qué sirve httptest.NewRecorder()?',
      options: [
        { text: 'Para grabar video de los tests HTTP', correct: false, explanation: 'No graba video. Captura la respuesta HTTP del handler para inspeccionarla en tests.' },
        { text: 'Para crear un ResponseWriter falso que captura lo que el handler escribe', correct: true, explanation: '¡Correcto! httptest.Recorder implementa http.ResponseWriter y guarda el status code, headers y body para que puedas verificarlos en el test.' },
        { text: 'Para crear un servidor HTTP de prueba', correct: false, explanation: 'Eso lo hace httptest.NewServer(). Recorder es para capturar respuestas sin levantar un servidor.' },
        { text: 'Para registrar logs durante los tests', correct: false, explanation: 'Recorder no tiene nada que ver con logs. Captura respuestas HTTP.' },
      ],
      source: 'Go Documentation',
      sourceUrl: 'https://go.dev/doc/articles/wiki/',
    },
    {
      question: '¿Cuál es la diferencia entre t.Error() y t.Fatal()?',
      options: [
        { text: 'No hay diferencia, son sinónimos', correct: false, explanation: 'Tienen diferencia importante: uno continúa y el otro detiene.' },
        { text: 't.Error marca el test como fallido pero continúa; t.Fatal marca como fallido y DETIENE el test', correct: true, explanation: '¡Correcto! t.Fatal es como t.Error + return. Úsalo cuando el resto del test no tiene sentido si esta condición falla.' },
        { text: 't.Error es para warnings, t.Fatal es para errores reales', correct: false, explanation: 'Ambos marcan el test como fallido. La diferencia es si continúa ejecutando o se detiene.' },
        { text: 't.Fatal no existe, solo t.Error', correct: false, explanation: 'Ambos existen y se usan extensamente en tests de Go.' },
      ],
      source: 'Go by Example: Testing',
      sourceUrl: 'https://gobyexample.com/testing-and-benchmarking',
    },
    {
      question: '¿Qué struct tag se usa para controlar los nombres JSON de los campos de un struct?',
      options: [
        { text: 'xml:"nombre"', correct: false, explanation: 'Esa tag es para XML, no JSON. Cada formato tiene su propia tag.' },
        { text: 'json:"nombre"', correct: true, explanation: '¡Correcto! json:"nombre" controla cómo se serializa/deserializa el campo. También acepta opciones como omitempty y "-" para ignorar.' },
        { text: 'name:"nombre"', correct: false, explanation: 'No existe una tag "name" estándar. Para JSON se usa json:"nombre".' },
        { text: 'field:"nombre"', correct: false, explanation: 'No existe una tag "field" estándar. La tag para encoding/json es json:"nombre".' },
      ],
      source: 'Go by Example: JSON',
      sourceUrl: 'https://gobyexample.com/json',
    },
  ];

  function handleQuizComplete(score: number, total: number) {
    courseStore.completeModule(12, score, total);
    moduleCompleted = true;

    // Check if ALL 12 modules are completed for Go Master badge
    const unsubscribe = courseStore.subscribe(state => {
      const completedCount = Object.values(state.modules).filter(m => m.completed).length;
      if (completedCount >= 12) {
        courseStore.unlockBadge('go-master');
        showMasterBadge = true;
      }
    });
    // Immediately unsubscribe after checking
    unsubscribe();
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

  <!-- net/http -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">El Paquete net/http</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go incluye un servidor HTTP de <strong class="text-go-text">producción</strong> en la librería estándar.
      No necesitas frameworks externos para empezar.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Handler más simple posible</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">hola</span>(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, <span class="text-go-success">"Hola, %s!"</span>, r.URL.Path[1:])
}

<span class="text-go-accent">func</span> <span class="text-go-warning">main</span>() {
    http.HandleFunc(<span class="text-go-success">"/"</span>, hola)
    log.Fatal(http.ListenAndServe(<span class="text-go-success">":8080"</span>, <span class="text-go-accent">nil</span>))
}</code></pre>`}
    <p class="text-go-muted text-sm">
      <code class="text-go-accent">http.HandleFunc</code> registra una función como handler para una ruta.
      <code class="text-go-accent">ListenAndServe</code> arranca el servidor.
    </p>
  </section>

  <!-- Handler Interface -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">La Interfaz Handler</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      En Go, cualquier tipo que implemente <code class="text-go-accent">ServeHTTP(ResponseWriter, *Request)</code>
      es un Handler. <code class="text-go-accent">HandlerFunc</code> es un adapter que convierte funciones normales en Handlers.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-muted">// La interfaz Handler:</span>
<span class="text-go-accent">type</span> Handler <span class="text-go-accent">interface</span> {
    ServeHTTP(ResponseWriter, *Request)
}

<span class="text-go-muted">// HandlerFunc adapta una función a Handler:</span>
<span class="text-go-accent">type</span> HandlerFunc <span class="text-go-accent">func</span>(ResponseWriter, *Request)

<span class="text-go-muted">// ServeMux para routing:</span>
mux := http.NewServeMux()
mux.HandleFunc(<span class="text-go-success">"GET /usuarios"</span>, listarUsuarios)
mux.HandleFunc(<span class="text-go-success">"POST /usuarios"</span>, crearUsuario)
mux.HandleFunc(<span class="text-go-success">"GET /usuarios/{id}"</span>, obtenerUsuario)</code></pre>`}
  </section>

  <!-- JSON -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">JSON: Encoding y Decoding</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El paquete <code class="text-go-accent">encoding/json</code> convierte entre structs Go y JSON.
      Los <strong class="text-go-text">struct tags</strong> controlan el mapeo de nombres.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">type</span> Usuario <span class="text-go-accent">struct</span> {
    ID     <span class="text-go-accent">int</span>    <span class="text-go-success">\`json:"id"\`</span>
    Nombre <span class="text-go-accent">string</span> <span class="text-go-success">\`json:"nombre"\`</span>
    Email  <span class="text-go-accent">string</span> <span class="text-go-success">\`json:"email,omitempty"\`</span>
    Clave  <span class="text-go-accent">string</span> <span class="text-go-success">\`json:"-"\`</span>  <span class="text-go-muted">// Nunca se serializa</span>
}

<span class="text-go-muted">// Encoding: struct → JSON</span>
json.NewEncoder(w).Encode(usuario)     <span class="text-go-muted">// Escribe directo al writer</span>
bytes, _ := json.Marshal(usuario)      <span class="text-go-muted">// Retorna []byte</span>

<span class="text-go-muted">// Decoding: JSON → struct</span>
json.NewDecoder(r.Body).Decode(&amp;usuario) <span class="text-go-muted">// Lee directo del reader</span>
json.Unmarshal(bytes, &amp;usuario)          <span class="text-go-muted">// Desde []byte</span></code></pre>`}
  </section>

  <!-- Middleware -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Patrón Middleware</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Un middleware es una <strong class="text-go-text">función que envuelve un handler</strong> para agregar
      comportamiento (logging, autenticación, CORS). Es composición pura.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">logging</span>(next http.Handler) http.Handler {
    <span class="text-go-accent">return</span> http.HandlerFunc(<span class="text-go-accent">func</span>(w http.ResponseWriter, r *http.Request) {
        log.Printf(<span class="text-go-success">"%s %s"</span>, r.Method, r.URL.Path)
        next.ServeHTTP(w, r)  <span class="text-go-muted">// Pasa al siguiente handler</span>
    })
}

<span class="text-go-muted">// Uso:</span>
http.Handle(<span class="text-go-success">"/"</span>, logging(miHandler))</code></pre>`}
  </section>

  <!-- Testing -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Testing en Go</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go tiene testing integrado. Los archivos <code class="text-go-accent">_test.go</code> contienen tests
      que se ejecutan con <code class="text-go-accent">go test</code>.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// archivo: math_test.go</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">TestSumar</span>(t *testing.T) {
    resultado := Sumar(2, 3)
    <span class="text-go-accent">if</span> resultado != 5 {
        t.Errorf(<span class="text-go-success">"Sumar(2, 3) = %d; quería 5"</span>, resultado)
    }
}

<span class="text-go-muted">// Subtests con t.Run:</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">TestSumar</span>(t *testing.T) {
    t.Run(<span class="text-go-success">"positivos"</span>, <span class="text-go-accent">func</span>(t *testing.T) {
        <span class="text-go-accent">if</span> Sumar(2, 3) != 5 { t.Error(<span class="text-go-success">"fallo"</span>) }
    })
    t.Run(<span class="text-go-success">"negativos"</span>, <span class="text-go-accent">func</span>(t *testing.T) {
        <span class="text-go-accent">if</span> Sumar(-1, -2) != -3 { t.Error(<span class="text-go-success">"fallo"</span>) }
    })
}</code></pre>`}
  </section>

  <!-- Table-Driven Tests -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Table-Driven Tests</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El patrón <strong class="text-go-text">más idiomático</strong> de testing en Go. Define casos en un slice
      y recórrelos con subtests. Fácil de leer, fácil de ampliar.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">func</span> <span class="text-go-warning">TestSumar</span>(t *testing.T) {
    tests := []<span class="text-go-accent">struct</span> {
        nombre   <span class="text-go-accent">string</span>
        a, b     <span class="text-go-accent">int</span>
        esperado <span class="text-go-accent">int</span>
    }{
        {<span class="text-go-success">"positivos"</span>, 2, 3, 5},
        {<span class="text-go-success">"negativos"</span>, -1, -2, -3},
        {<span class="text-go-success">"cero"</span>, 0, 0, 0},
        {<span class="text-go-success">"mixto"</span>, -5, 10, 5},
    }

    <span class="text-go-accent">for</span> _, tt := <span class="text-go-accent">range</span> tests {
        t.Run(tt.nombre, <span class="text-go-accent">func</span>(t *testing.T) {
            resultado := Sumar(tt.a, tt.b)
            <span class="text-go-accent">if</span> resultado != tt.esperado {
                t.Errorf(<span class="text-go-success">"Sumar(%d, %d) = %d; quería %d"</span>,
                    tt.a, tt.b, resultado, tt.esperado)
            }
        })
    }
}</code></pre>`}
  </section>

  <!-- httptest -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Testing HTTP con httptest</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El paquete <code class="text-go-accent">net/http/httptest</code> te permite testear handlers
      <strong class="text-go-text">sin levantar un servidor real</strong>.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">func</span> <span class="text-go-warning">TestHandleUsuarios</span>(t *testing.T) {
    <span class="text-go-muted">// Crear request y recorder</span>
    req := httptest.NewRequest(http.MethodGet, <span class="text-go-success">"/usuarios"</span>, <span class="text-go-accent">nil</span>)
    rec := httptest.NewRecorder()

    <span class="text-go-muted">// Ejecutar el handler</span>
    handleUsuarios(rec, req)

    <span class="text-go-muted">// Verificar resultado</span>
    <span class="text-go-accent">if</span> rec.Code != http.StatusOK {
        t.Errorf(<span class="text-go-success">"status = %d; quería %d"</span>, rec.Code, http.StatusOK)
    }

    <span class="text-go-accent">var</span> usuarios []Usuario
    json.NewDecoder(rec.Body).Decode(&amp;usuarios)
    <span class="text-go-accent">if</span> <span class="text-go-accent">len</span>(usuarios) == 0 {
        t.Error(<span class="text-go-success">"esperaba al menos un usuario"</span>)
    }
}</code></pre>`}
  </section>

  <!-- Benchmarks -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Benchmarks</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go incluye benchmarking integrado. Las funciones empiezan con
      <code class="text-go-accent">Benchmark</code> y reciben <code class="text-go-accent">*testing.B</code>.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">BenchmarkSumar</span>(b *testing.B) {
    <span class="text-go-accent">for</span> i := 0; i &lt; b.N; i++ {
        Sumar(100, 200)
    }
}

<span class="text-go-muted">// Ejecutar:</span>
<span class="text-go-muted">// go test -bench=. -benchmem</span>
<span class="text-go-muted">// BenchmarkSumar-8  1000000000  0.25 ns/op  0 B/op  0 allocs/op</span></code></pre>`}
  </section>

  <!-- GoPlayground -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-3">Experimenta: API REST con JSON</h2>
    <p class="text-go-muted mb-4">
      Una API completa con GET y POST. Analiza cómo se manejan los métodos HTTP, la serialización JSON con
      <code class="text-go-accent">Encoder</code>/<code class="text-go-accent">Decoder</code>, y los códigos de estado.
    </p>
    <GoPlayground
      code={httpCode}
      title="API REST con net/http"
      description="Servidor HTTP con JSON. Analiza el handler, los struct tags y los status codes."
    />
  </section>

  <!-- Quiz -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Quiz: Testing y APIs</h2>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  {#if moduleCompleted}
    <div class="card mb-6 border-go-success/30 bg-go-success/5">
      <div class="text-center">
        <span class="text-4xl">&#127760;</span>
        <h3 class="text-xl font-bold text-go-success mt-2">Módulo Completado</h3>
        <p class="text-go-muted mt-1">APIs REST y Testing dominados</p>
        {#if showMasterBadge}
          <div class="mt-4 p-4 bg-go-accent/10 rounded-lg border border-go-accent/30">
            <span class="text-5xl">&#127942;</span>
            <p class="text-go-accent font-bold text-lg mt-2">Completaste TODOS los módulos</p>
            <p class="text-go-muted">Eres un Go Master</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <SourcesSection sources={mod.sources} />
  <ModuleNav currentModule={12} />
</div>

<VocabularyFloat moduleId={12} />

{#if showMasterBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showMasterBadge = false} />
{/if}

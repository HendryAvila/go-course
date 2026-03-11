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
  import { exercises, workedExamples } from '$lib/data/exercises/module-12';
  import { reviewCards } from '$lib/data/exercises/review-cards';

  const mod = modules.find(m => m.id === 12)!;
  let showBadge = $state(false);
  let earnedBadge = $state<typeof allBadges[number]>(allBadges.find(b => b.id === 'go-master')!);
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
\tmux := http.NewServeMux()
\tmux.HandleFunc("GET /usuarios", handleUsuarios)
\tmux.HandleFunc("POST /usuarios", handleUsuarios)
\tfmt.Println("Servidor en :8080")
\tlog.Fatal(http.ListenAndServe(":8080", mux))
}`;

  const quizQuestions = [
    {
      question: 'Cual es la convencion de nombre para funciones de test en Go?',
      options: [
        { text: 'test_mi_funcion()', correct: false, explanation: 'Go no usa snake_case para tests. Usa CamelCase con el prefijo Test.' },
        { text: 'func TestMiFuncion(t *testing.T)', correct: true, explanation: 'Correcto! Los tests DEBEN empezar con "Test" seguido de mayuscula, y recibir *testing.T como parametro.' },
        { text: 'func test_mi_funcion(t *Test)', correct: false, explanation: 'Ni el nombre ni el tipo del parametro son correctos. Es TestXxx con *testing.T.' },
        { text: 'func MiTest() error', correct: false, explanation: 'Los tests no retornan error. Usan t.Error() o t.Fatal() para reportar fallos.' },
      ],
      source: 'Go by Example: Testing',
      sourceUrl: 'https://gobyexample.com/testing-and-benchmarking',
    },
    {
      question: 'Que ventaja tiene el enhanced routing de ServeMux en Go 1.22+?',
      options: [
        { text: 'Solo mejora el rendimiento del router', correct: false, explanation: 'La mejora principal es funcional, no solo de rendimiento.' },
        { text: 'Permite especificar el metodo HTTP y path params directo en el patron: "GET /users/{id}"', correct: true, explanation: 'Correcto! Go 1.22 agrego soporte para metodos HTTP y wildcards en ServeMux. Antes necesitabas routers externos como chi o gorilla/mux.' },
        { text: 'Agrega soporte para WebSockets', correct: false, explanation: 'WebSockets se manejan con el paquete x/net/websocket o gorilla/websocket, no con ServeMux.' },
        { text: 'Reemplaza completamente a frameworks como Gin o Echo', correct: false, explanation: 'Los frameworks siguen ofreciendo mas funcionalidad (middleware chains, validation, etc.), pero la brecha se redujo.' },
      ],
      source: 'Go 1.22 Release Notes',
      sourceUrl: 'https://go.dev/blog/go1.22',
    },
    {
      question: 'Que es un table-driven test en Go?',
      options: [
        { text: 'Tests que usan una base de datos de tabla', correct: false, explanation: 'No tiene que ver con bases de datos. Es un patron de organizacion de test cases.' },
        { text: 'Un slice de structs con casos de test que se iteran con t.Run()', correct: true, explanation: 'Correcto! Es el patron mas idiomatico de Go. Defines casos en un slice y los iteras con subtests nombrados usando t.Run().' },
        { text: 'Tests que se ejecutan en paralelo', correct: false, explanation: 'Los tests paralelos son otra cosa (t.Parallel()). Table-driven es sobre organizacion de casos.' },
        { text: 'Tests generados automaticamente', correct: false, explanation: 'Table-driven tests son escritos manualmente. La generacion automatica seria otra herramienta.' },
      ],
    },
    {
      question: 'Que hace la constraint "comparable" en generics?\n\nfunc Contains[T comparable](s []T, val T) bool',
      options: [
        { text: 'Permite cualquier tipo', correct: false, explanation: 'Eso seria "any". comparable restringe a tipos que soportan == y !=.' },
        { text: 'Restringe T a tipos que soportan == y != (int, string, structs sin campos no-comparables)', correct: true, explanation: 'Correcto! comparable incluye tipos basicos, structs cuyos campos son todos comparables, y punteros. Excluye slices, maps y funciones.' },
        { text: 'Solo permite tipos numericos', correct: false, explanation: 'Para numericos seria cmp.Ordered. comparable es mas amplio: incluye strings, bools, structs, etc.' },
        { text: 'Requiere implementar un metodo Compare()', correct: false, explanation: 'No hay metodo Compare en la constraint comparable. Es un constraint built-in basado en operadores == y !=.' },
      ],
      source: 'Go Blog: When To Use Generics',
      sourceUrl: 'https://go.dev/blog/when-generics',
    },
    {
      question: 'Que permite el paquete iter (Go 1.23+)?',
      options: [
        { text: 'Iterar sobre strings caracter por caracter', correct: false, explanation: 'Eso ya se podia con for range sobre strings. iter agrega algo mas fundamental.' },
        { text: 'Definir iteradores custom que funcionen con for-range usando funciones yield', correct: true, explanation: 'Correcto! iter permite crear funciones que producen valores usando yield, y se pueden consumir con for-range. Esto unifica la iteracion en Go.' },
        { text: 'Solo mejorar el rendimiento de slices.All()', correct: false, explanation: 'iter habilita un patron general de iteracion, no solo optimizacion.' },
        { text: 'Reemplazar los channels como mecanismo de comunicacion', correct: false, explanation: 'iter es para iteracion secuencial. Channels siguen siendo para comunicacion concurrente.' },
      ],
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
        earnedBadge = allBadges.find(b => b.id === 'go-master')!;
        showBadge = true;
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

  <!-- Repaso Espaciado -->
  <ReviewCards moduleId={12} cards={reviewCards} />

  <!-- ===== SECCION 1: HTTP ===== -->

  <!-- net/http -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">El Paquete net/http</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go incluye un servidor HTTP de <strong class="text-go-text">produccion</strong> en la libreria estandar.
      No necesitas frameworks externos para empezar. Empresas como Cloudflare, Twitch y Uber lo usan directamente.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Handler mas simple posible</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">hola</span>(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, <span class="text-go-success">"Hola, %s!"</span>, r.URL.Path[1:])
}

<span class="text-go-accent">func</span> <span class="text-go-warning">main</span>() {
    http.HandleFunc(<span class="text-go-success">"/"</span>, hola)
    log.Fatal(http.ListenAndServe(<span class="text-go-success">":8080"</span>, <span class="text-go-accent">nil</span>))
}</code></pre>`}
    <p class="text-go-muted text-sm">
      <code class="text-go-accent">http.HandleFunc</code> registra una funcion como handler para una ruta.
      <code class="text-go-accent">ListenAndServe</code> arranca el servidor. La firma del handler siempre es
      <code class="text-go-accent">(http.ResponseWriter, *http.Request)</code>.
    </p>
  </section>

  <!-- ServeMux Go 1.22 -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">ServeMux Mejorado (Go 1.22+)</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Desde Go 1.22, <code class="text-go-accent">ServeMux</code> soporta <strong class="text-go-text">metodos HTTP</strong>
      y <strong class="text-go-text">path parameters</strong> directamente. Antes necesitabas routers externos.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code>mux := http.NewServeMux()

<span class="text-go-muted">// Metodo + ruta</span>
mux.HandleFunc(<span class="text-go-success">"GET /usuarios"</span>, listarUsuarios)
mux.HandleFunc(<span class="text-go-success">"POST /usuarios"</span>, crearUsuario)

<span class="text-go-muted">// Path parameters con {nombre}</span>
mux.HandleFunc(<span class="text-go-success">"GET /usuarios/{id}"</span>, <span class="text-go-accent">func</span>(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue(<span class="text-go-success">"id"</span>) <span class="text-go-muted">// Extraer el parametro</span>
    fmt.Fprintf(w, <span class="text-go-success">"Usuario: %s"</span>, id)
})

<span class="text-go-muted">// Wildcard para subrutas</span>
mux.HandleFunc(<span class="text-go-success">"GET /archivos/{path...}"</span>, servirArchivos)

log.Fatal(http.ListenAndServe(<span class="text-go-success">":8080"</span>, mux))</code></pre>`}
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
    Email  <span class="text-go-accent">string</span> <span class="text-go-success">\`json:"email,omitempty"\`</span>  <span class="text-go-muted">// Omitir si vacio</span>
    Clave  <span class="text-go-accent">string</span> <span class="text-go-success">\`json:"-"\`</span>               <span class="text-go-muted">// Nunca se serializa</span>
}

<span class="text-go-muted">// Encoding: struct -> JSON</span>
json.NewEncoder(w).Encode(usuario)     <span class="text-go-muted">// Escribe directo al writer</span>
bytes, _ := json.Marshal(usuario)      <span class="text-go-muted">// Retorna []byte</span>

<span class="text-go-muted">// Decoding: JSON -> struct</span>
json.NewDecoder(r.Body).Decode(&amp;usuario) <span class="text-go-muted">// Lee directo del reader</span>
json.Unmarshal(bytes, &amp;usuario)          <span class="text-go-muted">// Desde []byte</span></code></pre>`}
  </section>

  <!-- Middleware -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Patron Middleware</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Un middleware es una <strong class="text-go-text">funcion que envuelve un handler</strong> para agregar
      comportamiento (logging, autenticacion, CORS). Es composicion pura.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">logging</span>(next http.Handler) http.Handler {
    <span class="text-go-accent">return</span> http.HandlerFunc(<span class="text-go-accent">func</span>(w http.ResponseWriter, r *http.Request) {
        inicio := time.Now()
        next.ServeHTTP(w, r)  <span class="text-go-muted">// Pasa al siguiente handler</span>
        log.Printf(<span class="text-go-success">"%s %s %v"</span>, r.Method, r.URL.Path, time.Since(inicio))
    })
}

<span class="text-go-muted">// Componer middlewares</span>
handler := logging(auth(miHandler))</code></pre>`}
  </section>

  <!-- ===== SECCION 2: TESTING ===== -->

  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Testing en Go</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go tiene testing integrado. Los archivos <code class="text-go-accent">_test.go</code> contienen tests
      que se ejecutan con <code class="text-go-accent">go test</code>. No necesitas frameworks externos.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// archivo: math_test.go</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">TestSumar</span>(t *testing.T) {
    resultado := Sumar(2, 3)
    <span class="text-go-accent">if</span> resultado != 5 {
        t.Errorf(<span class="text-go-success">"Sumar(2, 3) = %d; queria 5"</span>, resultado)
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">t.Error()</p>
        <p class="text-go-muted text-sm">Marca como fallido pero continua ejecutando el test.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-warning font-semibold text-sm">t.Fatal()</p>
        <p class="text-go-muted text-sm">Marca como fallido y DETIENE el test inmediatamente.</p>
      </div>
    </div>
  </section>

  <!-- Table-Driven Tests -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Table-Driven Tests</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      El patron <strong class="text-go-text">mas idiomatico</strong> de testing en Go. Define casos en un slice
      y recorrelos con subtests. Facil de leer, facil de ampliar.
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
                t.Errorf(<span class="text-go-success">"Sumar(%d, %d) = %d; queria %d"</span>,
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
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto"><code><span class="text-go-accent">func</span> <span class="text-go-warning">TestHandleUsuarios</span>(t *testing.T) {
    <span class="text-go-muted">// Crear request y recorder</span>
    req := httptest.NewRequest(http.MethodGet, <span class="text-go-success">"/usuarios"</span>, <span class="text-go-accent">nil</span>)
    rec := httptest.NewRecorder()

    <span class="text-go-muted">// Ejecutar el handler</span>
    handleUsuarios(rec, req)

    <span class="text-go-muted">// Verificar resultado</span>
    <span class="text-go-accent">if</span> rec.Code != http.StatusOK {
        t.Errorf(<span class="text-go-success">"status = %d; queria %d"</span>, rec.Code, http.StatusOK)
    }

    <span class="text-go-accent">var</span> usuarios []Usuario
    json.NewDecoder(rec.Body).Decode(&amp;usuarios)
    <span class="text-go-accent">if</span> <span class="text-go-accent">len</span>(usuarios) == 0 {
        t.Error(<span class="text-go-success">"esperaba al menos un usuario"</span>)
    }
}</code></pre>`}
  </section>

  <!-- ===== SECCION 3: GO MODERNO ===== -->

  <!-- Generics -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Generics (Go 1.18+)</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Los generics permiten escribir funciones y tipos que trabajan con <strong class="text-go-text">multiples tipos</strong>
      sin perder type safety. Go los agrego en 1.18 con una filosofia minimalista.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Funcion generica con constraint</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">Min</span>[T cmp.Ordered](a, b T) T {
    <span class="text-go-accent">if</span> a &lt; b {
        <span class="text-go-accent">return</span> a
    }
    <span class="text-go-accent">return</span> b
}

<span class="text-go-muted">// Uso — el tipo se infiere automaticamente</span>
fmt.Println(Min(3, 7))         <span class="text-go-muted">// 3 (int)</span>
fmt.Println(Min(<span class="text-go-success">"abc"</span>, <span class="text-go-success">"xyz"</span>)) <span class="text-go-muted">// "abc" (string)</span>
fmt.Println(Min(3.14, 2.71))   <span class="text-go-muted">// 2.71 (float64)</span></code></pre>`}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">any</p>
        <p class="text-go-muted text-sm">Alias de interface. Acepta cualquier tipo.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">comparable</p>
        <p class="text-go-muted text-sm">Tipos que soportan == y !=.</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">cmp.Ordered</p>
        <p class="text-go-muted text-sm">Tipos que soportan &lt; &gt; &lt;= &gt;= (numericos + string).</p>
      </div>
      <div class="bg-go-darker rounded-lg p-3">
        <p class="text-go-accent font-semibold text-sm">Custom constraints</p>
        <p class="text-go-muted text-sm">Define tus propias interfaces como constraints.</p>
      </div>
    </div>
  </section>

  <!-- Generic Functions -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Funciones Genericas Utiles</h2>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Map: transforma cada elemento</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">Map</span>[T, U <span class="text-go-accent">any</span>](s []T, fn <span class="text-go-accent">func</span>(T) U) []U {
    resultado := <span class="text-go-accent">make</span>([]U, <span class="text-go-accent">len</span>(s))
    <span class="text-go-accent">for</span> i, v := <span class="text-go-accent">range</span> s {
        resultado[i] = fn(v)
    }
    <span class="text-go-accent">return</span> resultado
}

<span class="text-go-muted">// Filter: retorna elementos que cumplen condicion</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">Filter</span>[T <span class="text-go-accent">any</span>](s []T, fn <span class="text-go-accent">func</span>(T) <span class="text-go-accent">bool</span>) []T {
    <span class="text-go-accent">var</span> resultado []T
    <span class="text-go-accent">for</span> _, v := <span class="text-go-accent">range</span> s {
        <span class="text-go-accent">if</span> fn(v) {
            resultado = <span class="text-go-accent">append</span>(resultado, v)
        }
    }
    <span class="text-go-accent">return</span> resultado
}

<span class="text-go-muted">// Uso</span>
nums := []<span class="text-go-accent">int</span>{1, 2, 3, 4, 5}
dobles := Map(nums, <span class="text-go-accent">func</span>(n <span class="text-go-accent">int</span>) <span class="text-go-accent">int</span> { <span class="text-go-accent">return</span> n * 2 })
pares := Filter(nums, <span class="text-go-accent">func</span>(n <span class="text-go-accent">int</span>) <span class="text-go-accent">bool</span> { <span class="text-go-accent">return</span> n%2 == 0 })</code></pre>`}
  </section>

  <!-- Iterators -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Iterators con iter (Go 1.23+)</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Go 1.23 introdujo <strong class="text-go-text">range over functions</strong>: puedes definir funciones que
      producen valores y consumirlas con <code class="text-go-accent">for-range</code>. Esto unifica la iteracion en Go.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Tipo iter.Seq[V] = func(yield func(V) bool)</span>

<span class="text-go-muted">// Iterador que genera numeros del 1 al n</span>
<span class="text-go-accent">func</span> <span class="text-go-warning">Rango</span>(n <span class="text-go-accent">int</span>) iter.Seq[<span class="text-go-accent">int</span>] {
    <span class="text-go-accent">return func</span>(yield <span class="text-go-accent">func</span>(<span class="text-go-accent">int</span>) <span class="text-go-accent">bool</span>) {
        <span class="text-go-accent">for</span> i := 1; i &lt;= n; i++ {
            <span class="text-go-accent">if</span> !yield(i) {
                <span class="text-go-accent">return</span> <span class="text-go-muted">// El consumidor pidio parar</span>
            }
        }
    }
}

<span class="text-go-muted">// Consumir con for-range</span>
<span class="text-go-accent">for</span> n := <span class="text-go-accent">range</span> Rango(5) {
    fmt.Println(n) <span class="text-go-muted">// 1, 2, 3, 4, 5</span>
}

<span class="text-go-muted">// Funciones del paquete slices que retornan iteradores:</span>
<span class="text-go-accent">for</span> i, v := <span class="text-go-accent">range</span> slices.All(miSlice) { ... }
<span class="text-go-accent">for</span> v := <span class="text-go-accent">range</span> slices.Values(miSlice) { ... }
<span class="text-go-accent">for</span> k, v := <span class="text-go-accent">range</span> maps.All(miMap) { ... }</code></pre>`}
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
      Una API completa con GET y POST usando ServeMux mejorado. Analiza como se manejan los metodos HTTP,
      la serializacion JSON con <code class="text-go-accent">Encoder</code>/<code class="text-go-accent">Decoder</code>,
      y los codigos de estado.
    </p>
    <GoPlayground
      code={httpCode}
      title="API REST con net/http"
      description="Servidor HTTP con JSON y ServeMux mejorado. Analiza el handler, los struct tags y los status codes."
    />
  </section>

  <!-- Worked Examples -->
  {#if workedExamples.length > 0}
    <section class="mb-6">
      <h2 class="text-xl font-bold mb-4">Ejemplos Guiados</h2>
      <p class="text-go-muted mb-4">
        Sigue cada ejemplo paso a paso para entender los conceptos antes de practicar.
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
  {/if}

  <!-- Code Challenges -->
  {#if exercises.length > 0}
    <section class="mb-6">
      <h2 class="text-xl font-bold mb-4">Desafíos de Código</h2>
      <p class="text-go-muted mb-4">
        El módulo final. Demuestra todo lo que aprendiste.
      </p>
      <div class="space-y-6">
        {#each exercises as exercise}
          <CodeChallenge {exercise} onComplete={(id, score, hints) => courseStore.completeExercise(id, score, hints)} />
        {/each}
      </div>
    </section>
  {/if}

  <!-- Quiz -->
  <section class="mb-6">
    <h2 class="text-xl font-bold mb-4">Quiz Final: HTTP + Testing + Go Moderno</h2>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  {#if moduleCompleted}
    <div class="card mb-6 border-go-success/30 bg-go-success/5">
      <div class="text-center">
        <span class="text-4xl">&#127760;</span>
        <h3 class="text-xl font-bold text-go-success mt-2">Modulo Completado</h3>
        <p class="text-go-muted mt-1">APIs REST, Testing y Go Moderno dominados</p>
        {#if showBadge}
          <div class="mt-4 p-4 bg-go-accent/10 rounded-lg border border-go-accent/30">
            <span class="text-5xl">&#127942;</span>
            <p class="text-go-accent font-bold text-lg mt-2">Completaste TODOS los modulos</p>
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

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

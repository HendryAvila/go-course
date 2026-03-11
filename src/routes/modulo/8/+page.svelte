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
  import { exercises, workedExamples } from '$lib/data/exercises/module-8';
  import { reviewCards } from '$lib/data/exercises/review-cards';

  const module = modules.find(m => m.id === 8)!;
  let showBadge = $state(false);
  let earnedBadge = $state(allBadges.find(b => b.id === 'error-handler')!);

  const panicRecoverCode = `package main

import "fmt"

func arriesgado() {
\tdefer func() {
\t\tif r := recover(); r != nil {
\t\t\tfmt.Println("Recuperado de panic:", r)
\t\t}
\t}()

\tfmt.Println("Antes del panic")
\tpanic("algo terrible pasó")
\tfmt.Println("Esto nunca se ejecuta")
}

func main() {
\tarriesgado()
\tfmt.Println("El programa sigue ejecutándose")
}`;

  const quizQuestions = [
    {
      question: '¿Cuál es la interfaz que define un error en Go?',
      options: [
        { text: 'type error interface { Msg() string }', correct: false, explanation: 'El método se llama Error(), no Msg().' },
        { text: 'type error interface { Error() string }', correct: true, explanation: '¡Correcto! La interfaz error es minimalista: un solo método Error() string. Cualquier tipo que lo implemente es un error.' },
        { text: 'type Error interface { String() string }', correct: false, explanation: 'La interfaz se llama "error" (minúscula) y el método es Error(), no String().' },
        { text: 'No existe una interfaz, error es un tipo primitivo', correct: false, explanation: 'error es una interfaz definida en el builtin package. Cualquier tipo puede implementarla.' },
      ],
      source: 'Go Specification',
      sourceUrl: 'https://go.dev/ref/spec#Errors',
    },
    {
      question: '¿Qué hace fmt.Errorf con el verbo %w?',
      options: [
        { text: 'Imprime el error en formato ancho (wide)', correct: false, explanation: '%w no es un formato de impresión. Es para envolver errores.' },
        { text: 'Envuelve (wraps) el error original para que errors.Is/As puedan encontrarlo', correct: true, explanation: '¡Correcto! %w crea una cadena de errores. errors.Is y errors.As pueden recorrer toda la cadena para encontrar la causa raiz.' },
        { text: 'Convierte el error a warning', correct: false, explanation: 'Go no tiene concepto de warnings. %w envuelve el error manteniendo la cadena.' },
        { text: 'Es equivalente a %v para errores', correct: false, explanation: '%v solo formatea el texto. %w además envuelve el error para la cadena de errores.' },
      ],
      source: 'Go Blog: Errors in Go 1.13',
      sourceUrl: 'https://go.dev/blog/go1.13-errors',
    },
    {
      question: '¿Cuál es la diferencia entre errors.Is y errors.As?',
      options: [
        { text: 'Son lo mismo con diferente nombre', correct: false, explanation: 'Hacen cosas muy distintas: Is compara, As extrae.' },
        { text: 'Is compara identidad del error, As extrae el tipo concreto del error', correct: true, explanation: '¡Correcto! errors.Is(err, target) pregunta "¿es este error target?" recorriendo la cadena. errors.As(err, &target) extrae el error a un tipo concreto para acceder a sus campos.' },
        { text: 'Is es para errores nuevos, As para errores wrapped', correct: false, explanation: 'Ambos recorren la cadena de wrapping. Is compara valor, As extrae tipo.' },
        { text: 'Is retorna string, As retorna bool', correct: false, explanation: 'Ambos retornan bool. As además asigna el error al target si lo encuentra.' },
      ],
      source: 'Go Blog: Errors in Go 1.13',
      sourceUrl: 'https://go.dev/blog/go1.13-errors',
    },
    {
      question: '¿Cuándo es apropiado usar panic() en Go?',
      options: [
        { text: 'Para cualquier error — reemplaza a try/catch', correct: false, explanation: 'Go usa retorno de errores, no panic, para el flujo normal. panic es excepcional.' },
        { text: 'Solo para errores del programador: invariantes rotos, bugs, inicialización fallida', correct: true, explanation: '¡Correcto! panic es para situaciones irrecuperables: nil dereference, indice fuera de rango, configuración faltante al startup. Para errores esperados, siempre retorna error.' },
        { text: 'Nunca — panic no se usa en Go', correct: false, explanation: 'Se usa en casos específicos: regexp.MustCompile, template.Must, init(). Pero es raro.' },
        { text: 'En cada función que puede fallar', correct: false, explanation: 'Eso sería un anti-patrón grave. Go favorece retornar errores explícitamente.' },
      ],
      source: 'Effective Go',
      sourceUrl: 'https://go.dev/doc/effective_go#panic',
    },
    {
      question: '¿Qué patrón resuelve el problema de perder errores de defer?',
      options: [
        { text: 'Usar try/finally', correct: false, explanation: 'Go no tiene try/finally. Usa defer con named returns.' },
        { text: 'Named return + defer con closure que captura el error', correct: true, explanation: '¡Correcto! func f() (retErr error) { defer func() { cerr := cleanup(); if retErr == nil { retErr = cerr } }() }' },
        { text: 'Ignorar el error de defer, nunca es importante', correct: false, explanation: 'Los errores de cierre (flush a disco, cerrar conexión) pueden perder datos. Son importantes.' },
        { text: 'Usar log.Fatal en el defer', correct: false, explanation: 'log.Fatal termina el programa. No es una solución — es esconder el problema.' },
      ],
      source: 'Go Blog: Error handling',
      sourceUrl: 'https://go.dev/blog/error-handling-and-go',
    },
  ];

  function handleQuizComplete(score: number, total: number) {
    courseStore.completeModule(8, score, total);
    if (score >= 3) {
      courseStore.unlockBadge('error-handler');
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

  <!-- Repaso Espaciado -->
  <ReviewCards moduleId={8} cards={reviewCards} />

  <!-- Intro: No try/catch -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Go no tiene try/catch — y eso es BUENO</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      En Java, Python o JavaScript, los errores "vuelan" por el stack como excepciones invisibles.
      Puedes olvidar el catch y tu programa explota en producción.
    </p>
    <p class="text-go-muted leading-relaxed mb-4">
      En Go, los errores son <strong class="text-go-accent">valores</strong>. Se retornan explícitamente
      y se manejan donde ocurren. No hay magia, no hay sorpresas.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <div class="bg-go-danger/10 border border-go-danger/30 rounded-lg p-3">
        <p class="text-go-danger font-semibold text-sm mb-2">Anti-patron (otros lenguajes)</p>
        {@html `<pre class="font-mono text-xs"><code><span class="text-go-muted">// El error puede pasar desapercibido</span>
<span class="text-go-danger">try</span> {
    resultado = arriesgar()
} <span class="text-go-danger">catch</span> (e) {
    <span class="text-go-muted">// ¿Qué tipo de error? ¿Quién sabe?</span>
    log(e)
}</code></pre>`}
      </div>
      <div class="bg-go-success/10 border border-go-success/30 rounded-lg p-3">
        <p class="text-go-success font-semibold text-sm mb-2">Patron idiomatico Go</p>
        {@html `<pre class="font-mono text-xs"><code>resultado, err := arriesgar()
<span class="text-go-accent">if</span> err != <span class="text-go-accent">nil</span> {
    <span class="text-go-muted">// Explícito: sabes QUÉ falló</span>
    <span class="text-go-accent">return</span> fmt.Errorf(<span class="text-go-success">"contexto: %w"</span>, err)
}
<span class="text-go-muted">// Continuar con confianza</span></code></pre>`}
      </div>
    </div>
  </section>

  <!-- La interfaz error -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">La Interfaz error: Minimalismo Puro</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      La interfaz <code class="text-go-accent">error</code> de Go es una de las más simples del lenguaje:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">type</span> <span class="text-go-warning">error</span> <span class="text-go-accent">interface</span> {
    Error() <span class="text-go-accent">string</span>
}

<span class="text-go-muted">// Crear errores simples</span>
err1 := errors.New(<span class="text-go-success">"algo falló"</span>)
err2 := fmt.Errorf(<span class="text-go-success">"usuario %d no encontrado"</span>, 42)

<span class="text-go-muted">// El patrón universal</span>
<span class="text-go-accent">if</span> err != <span class="text-go-accent">nil</span> {
    <span class="text-go-muted">// manejar el error</span>
}</code></pre>`}
    <p class="text-go-muted text-sm">
      <code class="text-go-accent">errors.New</code> crea errores simples.
      <code class="text-go-accent">fmt.Errorf</code> permite formato con contexto.
      Cualquier tipo con el método <code>Error() string</code> es un error válido.
    </p>
  </section>

  <!-- Error Wrapping -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Error Wrapping: Contexto sin Perder la Causa</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      Cuando un error sube por las capas de tu aplicación, necesitas agregar contexto
      <strong class="text-go-text">sin perder la causa raíz</strong>. El verbo <code class="text-go-accent">%w</code>
      hace exactamente eso:
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Capa 1: error original</span>
<span class="text-go-accent">var</span> ErrNoEncontrado = errors.New(<span class="text-go-success">"no encontrado"</span>)

<span class="text-go-muted">// Capa 2: agrega contexto con %w</span>
<span class="text-go-accent">return</span> fmt.Errorf(<span class="text-go-success">"buscarUsuario(id=%d): %w"</span>, id, ErrNoEncontrado)

<span class="text-go-muted">// Capa 3: más contexto</span>
<span class="text-go-accent">return</span> fmt.Errorf(<span class="text-go-success">"cargarPerfil: %w"</span>, err)

<span class="text-go-muted">// Resultado: "cargarPerfil: buscarUsuario(id=42): no encontrado"</span>
<span class="text-go-muted">// Y errors.Is(err, ErrNoEncontrado) == true ¡atraviesa toda la cadena!</span></code></pre>`}
    <div class="bg-go-darker rounded-lg p-4 mt-3">
      <p class="text-go-accent font-semibold text-sm mb-2">errors.Is vs errors.As</p>
      <ul class="space-y-2 text-go-muted text-sm">
        <li>&#8226; <code class="text-go-accent">errors.Is(err, target)</code> — Pregunta: "¿Es este error (o alguno en la cadena) igual a target?"</li>
        <li>&#8226; <code class="text-go-accent">errors.As(err, &target)</code> — Pregunta: "¿Hay un error de tipo T en la cadena?" y lo extrae</li>
      </ul>
    </div>
  </section>

  <!-- Custom Error Types -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">Errores Personalizados con Datos Estructurados</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      A veces un string no es suficiente. Necesitas errores con <strong class="text-go-text">datos estructurados</strong>:
      un código HTTP, un campo de validación, un ID de recurso.
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-accent">type</span> <span class="text-go-warning">ErrorValidacion</span> <span class="text-go-accent">struct</span> {
    Campo   <span class="text-go-accent">string</span>
    Mensaje <span class="text-go-accent">string</span>
}

<span class="text-go-muted">// Implementar la interfaz error</span>
<span class="text-go-accent">func</span> (e *ErrorValidacion) <span class="text-go-warning">Error</span>() <span class="text-go-accent">string</span> {
    <span class="text-go-accent">return</span> fmt.Sprintf(<span class="text-go-success">"validación en '%s': %s"</span>, e.Campo, e.Mensaje)
}

<span class="text-go-muted">// Usar con errors.As para extraer los datos</span>
<span class="text-go-accent">var</span> ve *ErrorValidacion
<span class="text-go-accent">if</span> errors.As(err, &ve) {
    fmt.Printf(<span class="text-go-success">"Campo: %s, Detalle: %s\\n"</span>, ve.Campo, ve.Mensaje)
}</code></pre>`}
    <div class="bg-go-warning/10 border border-go-warning/30 rounded-lg p-3 mt-3">
      <p class="text-go-warning font-semibold text-sm mb-1">Truco importante</p>
      <p class="text-sm text-go-muted">
        Si retornas <code class="text-go-accent">&ErrorValidacion{'{'}'...{'}'}</code> (puntero),
        entonces <code>errors.As</code> necesita <code class="text-go-accent">var ve *ErrorValidacion</code> (puntero).
        Los tipos deben coincidir.
      </p>
    </div>
  </section>

  <!-- panic/recover -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">panic y recover: Solo para Emergencias</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      <code class="text-go-danger">panic</code> termina la ejecución del programa (subiendo el stack y ejecutando defers).
      <code class="text-go-accent">recover</code> lo intercepta dentro de un defer. Pero:
    </p>
    <div class="bg-go-danger/10 border border-go-danger/30 rounded-lg p-4 mb-4">
      <p class="text-go-danger font-semibold text-sm mb-2">Regla de oro</p>
      <p class="text-sm text-go-muted">
        Si puedes retornar un <code class="text-go-accent">error</code>, hazlo. Usa <code class="text-go-danger">panic</code>
        solo para bugs del programador (invariantes rotos, nil inesperado) o en funciones <code>Must*</code>
        que fallan al inicializar.
      </p>
    </div>
    <GoPlayground
      code={panicRecoverCode}
      title="panic y recover"
      description="Observa cómo recover intercepta el panic y el programa sigue ejecutándose."
    />
  </section>

  <!-- defer para cleanup -->
  <section class="card mb-6">
    <h2 class="text-xl font-bold mb-3">defer: Tu Red de Seguridad para Cleanup</h2>
    <p class="text-go-muted leading-relaxed mb-4">
      <code class="text-go-accent">defer</code> garantiza que el cleanup ocurra <strong class="text-go-text">siempre</strong>,
      sin importar cómo sale la función (return normal, error, o panic):
    </p>
    {@html `<pre class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-4"><code><span class="text-go-muted">// Patrón idiomático: abrir → verificar → defer cerrar → usar</span>
conn, err := abrirConexion(<span class="text-go-success">"db"</span>)
<span class="text-go-accent">if</span> err != <span class="text-go-accent">nil</span> {
    <span class="text-go-accent">return</span> err
}
<span class="text-go-accent">defer</span> conn.Cerrar() <span class="text-go-muted">// Se ejecuta AL SALIR de la función</span>

<span class="text-go-muted">// Usar conn con tranquilidad...</span>
resultado, err := conn.Consultar(<span class="text-go-success">"SELECT ..."</span>)
<span class="text-go-muted">// Aunque haya error aquí, conn.Cerrar() se ejecuta</span></code></pre>`}
    <div class="bg-go-accent/5 border border-go-accent/20 rounded-lg p-3 mt-3">
      <p class="text-go-accent font-semibold text-sm mb-1">Recuerda</p>
      <p class="text-sm text-go-muted">
        Multiples <code class="text-go-accent">defer</code> se apilan en orden <strong>LIFO</strong>
        (Last In, First Out). El último defer registrado se ejecuta primero.
      </p>
    </div>
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
      Practica el manejo de errores con ejercicios progresivos:
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
  <ModuleNav currentModule={8} />
</div>

<VocabularyFloat moduleId={8} />

{#if showBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

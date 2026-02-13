<script lang="ts">
  import { onMount } from 'svelte';
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';
  import Quiz from '$lib/components/Quiz.svelte';

  const MODULE_ID = 8;
  const BADGE_ID = 'error-handler';
  const mod = modules.find(m => m.id === MODULE_ID)!;

  let quizCompleted = $state(false);
  let quizScore = $state(0);
  let quizTotal = $state(0);
  let showBadge = $state(false);
  let earnedBadge = $state<typeof allBadges[0] | null>(null);

  onMount(() => {
    courseStore.startModule(MODULE_ID);
  });

  function handleQuizComplete(score: number, total: number) {
    quizCompleted = true;
    quizScore = score;
    quizTotal = total;
    courseStore.completeModule(MODULE_ID, score, total);
    const badge = allBadges.find(b => b.id === BADGE_ID);
    if (badge) {
      courseStore.unlockBadge(BADGE_ID);
      earnedBadge = badge;
      showBadge = true;
    }
  }

  const playgroundCode = `package main

import (
\t"errors"
\t"fmt"
)

// --- Error personalizado ---
type ValidationError struct {
\tField   string
\tMessage string
}

func (e *ValidationError) Error() string {
\treturn fmt.Sprintf("campo '%s': %s", e.Field, e.Message)
}

// --- Sentinel errors ---
var (
\tErrNotFound     = errors.New("recurso no encontrado")
\tErrUnauthorized = errors.New("no autorizado")
)

// --- Funciones que retornan errores ---
func findUser(id int) (string, error) {
\tif id <= 0 {
\t\treturn "", &ValidationError{
\t\t\tField:   "id",
\t\t\tMessage: "debe ser mayor a 0",
\t\t}
\t}
\tif id > 100 {
\t\treturn "", ErrNotFound
\t}
\treturn "Usuario Go", nil
}

func getProfile(id int) (string, error) {
\tuser, err := findUser(id)
\tif err != nil {
\t\t// Error wrapping con %w
\t\treturn "", fmt.Errorf("getProfile(id=%d): %w", id, err)
\t}
\treturn fmt.Sprintf("Perfil de %s", user), nil
}

func main() {
\t// Caso exitoso
\tprofile, err := getProfile(42)
\tif err != nil {
\t\tfmt.Println("Error:", err)
\t} else {
\t\tfmt.Println(profile)
\t}

\t// Caso: error de validacion
\t_, err = getProfile(-1)
\tif err != nil {
\t\tfmt.Println("\\nError:", err)

\t\t// errors.As: extraer tipo concreto del error
\t\tvar valErr *ValidationError
\t\tif errors.As(err, &valErr) {
\t\t\tfmt.Printf("  -> Campo: %s, Detalle: %s\\n", valErr.Field, valErr.Message)
\t\t}
\t}

\t// Caso: sentinel error
\t_, err = getProfile(999)
\tif err != nil {
\t\tfmt.Println("\\nError:", err)

\t\t// errors.Is: comparar con sentinel (funciona a traves de wrapping)
\t\tif errors.Is(err, ErrNotFound) {
\t\t\tfmt.Println("  -> Es un error de 'no encontrado'")
\t\t}
\t}
}`;

  const quizQuestions = [
    {
      question: 'La interfaz error en Go tiene:',
      options: [
        { text: 'Dos metodos: Error() string y Code() int', correct: false, explanation: 'La interfaz error solo tiene un metodo: Error() string. Si necesitas codigos, crea un tipo personalizado.' },
        { text: 'Un solo metodo: Error() string', correct: true, explanation: 'Correcto. La interfaz error es minimalista: solo requiere Error() string. Cualquier tipo que lo implemente es un error.' },
        { text: 'Tres metodos: Error(), Unwrap() y Is()', correct: false, explanation: 'Unwrap() e Is() son metodos opcionales para error wrapping, pero no forman parte de la interfaz error basica.' },
        { text: 'Ningun metodo, es una interfaz vacia', correct: false, explanation: 'No, error tiene un metodo requerido: Error() string. No es interface{}.' },
      ],
    },
    {
      question: 'Que hace el verbo %w en fmt.Errorf?',
      options: [
        { text: 'Formatea el error como warning en lugar de error', correct: false, explanation: '%w no tiene que ver con severity. Es para envolver (wrap) errores.' },
        { text: 'Envuelve (wraps) el error original para que errors.Is y errors.As puedan encontrarlo', correct: true, explanation: 'Correcto. fmt.Errorf("contexto: %w", err) crea un error que contiene al original. errors.Is/As pueden "desenvoverlo" para inspeccionar la cadena.' },
        { text: 'Imprime el error en formato ancho (wide)', correct: false, explanation: 'No existe el formato "wide". %w es exclusivo para error wrapping.' },
        { text: 'Convierte el error a un tipo personalizado', correct: false, explanation: '%w envuelve el error, no lo convierte. El error original se mantiene accesible via Unwrap().' },
      ],
    },
    {
      question: 'Cual es la diferencia entre errors.Is y errors.As?',
      options: [
        { text: 'Son lo mismo, solo cambia la sintaxis', correct: false, explanation: 'Son diferentes. Is compara identidad, As extrae un tipo concreto.' },
        { text: 'errors.Is compara con un valor especifico (sentinel), errors.As extrae un error de un tipo concreto', correct: true, explanation: 'Correcto. Is es para sentinels: errors.Is(err, ErrNotFound). As es para tipos: errors.As(err, &myErr). Ambos recorren la cadena de wrapping.' },
        { text: 'errors.Is funciona con strings, errors.As funciona con structs', correct: false, explanation: 'errors.Is compara con cualquier valor error, no solo strings. errors.As extrae cualquier tipo que implemente error.' },
        { text: 'errors.Is es para errores de Go 1.13+, errors.As es para versiones anteriores', correct: false, explanation: 'Ambos fueron introducidos en Go 1.13 juntos.' },
      ],
    },
    {
      question: 'Cuando es apropiado usar panic en Go?',
      options: [
        { text: 'Para cualquier error que no se pueda manejar', correct: false, explanation: 'En Go, los errores se retornan como valores. panic es para situaciones verdaderamente irrecuperables.' },
        { text: 'Como reemplazo de try/catch para errores comunes', correct: false, explanation: 'Go deliberadamente no tiene try/catch. Los errores se manejan con if err != nil.' },
        { text: 'Solo para errores de programacion irrecuperables (bugs), no para errores de runtime esperados', correct: true, explanation: 'Correcto. panic es para bugs como index out of bounds, nil pointer, o invariantes violados. Errores de I/O, red, validacion, etc. se manejan con error.' },
        { text: 'Siempre que quieras detener la ejecucion', correct: false, explanation: 'Para detener la ejecucion normalmente usas os.Exit() o log.Fatal(). panic es para bugs irrecuperables.' },
      ],
    },
    {
      question: 'Que son los sentinel errors en Go?',
      options: [
        { text: 'Errores que se crean con errors.New() como variables de paquete para comparar con errors.Is()', correct: true, explanation: 'Correcto. Sentinel errors como io.EOF o sql.ErrNoRows son variables de paquete predefinidas. Se comparan con errors.Is() a traves de cadenas de wrapping.' },
        { text: 'Errores que automáticamente detienen el programa', correct: false, explanation: 'Los sentinel errors son valores normales. No detienen nada, se comparan con errors.Is().' },
        { text: 'Errores que solo se usan en testing', correct: false, explanation: 'Los sentinel errors se usan en codigo de produccion. io.EOF es un ejemplo clasico.' },
        { text: 'Errores con un codigo numerico especial', correct: false, explanation: 'Los sentinel errors no tienen codigos numericos. Son instancias de error para comparar por identidad.' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Modulo 8: {mod.title} | Go Mastery</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-2">
      <span class="text-3xl">{mod.icon}</span>
      <div>
        <p class="text-sm text-go-accent font-mono">Modulo {MODULE_ID}</p>
        <h1 class="text-3xl font-black">{mod.title}</h1>
      </div>
    </div>
    <p class="text-go-muted mt-2">{mod.subtitle}</p>
  </div>

  <!-- Teoria: La interfaz error -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">La interfaz error</h2>
    <p class="text-go-muted mb-4">
      En Go, un error es simplemente un valor que implementa la interfaz <code>error</code>.
      No hay excepciones, no hay try/catch. Los errores se <strong class="text-go-text">retornan</strong> como
      valores y se manejan <strong class="text-go-text">explicitamente</strong>.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// La interfaz error es increiblemente simple</span>
<span class="text-go-accent">type</span> error <span class="text-go-accent">interface</span> {
    Error() <span class="text-go-accent">string</span>
}

<span class="text-go-muted">// Crear errores simples</span>
err1 := errors.New("algo salio mal")
err2 := fmt.Errorf("usuario %d no encontrado", 42)`}</pre>
    </div>
  </section>

  <!-- Teoria: if err != nil -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">El patron if err != nil</h2>
    <p class="text-go-muted mb-4">
      Este es el patron mas comun en Go. Las funciones retornan el error como ultimo valor, y el caller lo verifica
      inmediatamente. Si, vas a escribir <code>if err != nil</code> muchas veces. Eso es intencional: te obliga a
      <strong class="text-go-text">pensar en cada error</strong>.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-accent">func</span> ReadFile(path <span class="text-go-accent">string</span>) ([]<span class="text-go-accent">byte</span>, <span class="text-go-accent">error</span>) {
    data, err := os.ReadFile(path)
    <span class="text-go-accent">if</span> err != nil {
        <span class="text-go-accent">return</span> nil, fmt.Errorf("leyendo %s: %w", path, err)
    }
    <span class="text-go-accent">return</span> data, nil
}

<span class="text-go-muted">// Uso</span>
data, err := ReadFile("config.json")
<span class="text-go-accent">if</span> err != nil {
    log.Fatal(err)  <span class="text-go-muted">// o manejar de otra forma</span>
}
<span class="text-go-muted">// usar data aqui...</span>`}</pre>
    </div>
    <div class="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mb-4">
      <p class="text-yellow-300 text-sm font-bold">No ignores errores:</p>
      <p class="text-go-muted text-sm">
        Escribir <code>result, _ := puedefallar()</code> es una bomba de tiempo. Siempre maneja o propaga el error.
      </p>
    </div>
  </section>

  <!-- Teoria: Errores personalizados -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Errores personalizados</h2>
    <p class="text-go-muted mb-4">
      Puedes crear tus propios tipos de error implementando la interfaz <code>error</code>. Esto te permite
      incluir contexto adicional como campos, codigos HTTP, o metadata.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-accent">type</span> NotFoundError <span class="text-go-accent">struct</span> {
    Resource <span class="text-go-accent">string</span>
    ID       <span class="text-go-accent">int</span>
}

<span class="text-go-accent">func</span> (e *NotFoundError) Error() <span class="text-go-accent">string</span> {
    <span class="text-go-accent">return</span> fmt.Sprintf("%s con id %d no encontrado", e.Resource, e.ID)
}

<span class="text-go-muted">// Uso</span>
<span class="text-go-accent">func</span> FindUser(id <span class="text-go-accent">int</span>) (*User, <span class="text-go-accent">error</span>) {
    <span class="text-go-muted">// ...</span>
    <span class="text-go-accent">return</span> nil, &amp;NotFoundError{Resource: "usuario", ID: id}
}`}</pre>
    </div>
  </section>

  <!-- Teoria: Error wrapping -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Error Wrapping con %w</h2>
    <p class="text-go-muted mb-4">
      Desde Go 1.13, puedes <strong class="text-go-text">envolver</strong> errores con <code>fmt.Errorf</code> y el verbo
      <code>%w</code>. Esto crea una cadena de errores que agrega contexto sin perder el error original.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// Envolver agrega contexto</span>
<span class="text-go-accent">func</span> GetUserProfile(id <span class="text-go-accent">int</span>) (*Profile, <span class="text-go-accent">error</span>) {
    user, err := FindUser(id)
    <span class="text-go-accent">if</span> err != nil {
        <span class="text-go-accent">return</span> nil, fmt.Errorf("obteniendo perfil: %w", err)
    }
    <span class="text-go-muted">// ...</span>
}

<span class="text-go-muted">// El error resultante contiene toda la cadena:</span>
<span class="text-go-muted">// "obteniendo perfil: usuario con id 42 no encontrado"</span>`}</pre>
    </div>

    <h3 class="text-lg font-bold text-go-text mb-3">errors.Is y errors.As</h3>
    <p class="text-go-muted mb-4">
      Para inspeccionar errores a traves de cadenas de wrapping, usa <code>errors.Is</code> (comparar con sentinel) y
      <code>errors.As</code> (extraer tipo concreto):
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// errors.Is: busca un error especifico en la cadena</span>
<span class="text-go-accent">if</span> errors.Is(err, ErrNotFound) {
    <span class="text-go-muted">// manejar "no encontrado"</span>
}

<span class="text-go-muted">// errors.As: extrae un tipo concreto de la cadena</span>
<span class="text-go-accent">var</span> nfErr *NotFoundError
<span class="text-go-accent">if</span> errors.As(err, &amp;nfErr) {
    fmt.Println("Recurso:", nfErr.Resource)
    fmt.Println("ID:", nfErr.ID)
}`}</pre>
    </div>
  </section>

  <!-- Teoria: Sentinel errors -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Sentinel Errors</h2>
    <p class="text-go-muted mb-4">
      Los <strong class="text-go-text">sentinel errors</strong> son variables de paquete predefinidas que representan
      errores conocidos. Se comparan con <code>errors.Is</code>.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// Definir sentinels en tu paquete</span>
<span class="text-go-accent">var</span> (
    ErrNotFound     = errors.New("no encontrado")
    ErrUnauthorized = errors.New("no autorizado")
    ErrConflict     = errors.New("conflicto de datos")
)

<span class="text-go-muted">// Sentinels famosos del stdlib</span>
io.EOF            <span class="text-go-muted">// fin de archivo/stream</span>
sql.ErrNoRows     <span class="text-go-muted">// query sin resultados</span>
context.Canceled  <span class="text-go-muted">// contexto cancelado</span>`}</pre>
    </div>
  </section>

  <!-- Teoria: panic y recover -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">panic y recover: Casi nunca los uses</h2>
    <p class="text-go-muted mb-4">
      <code>panic</code> detiene la ejecucion del goroutine actual y desenrolla el stack. <code>recover</code> puede
      capturar un panic dentro de un <code>defer</code>. Pero en Go idiomatico, <strong class="text-go-text">casi nunca se usan</strong>.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// panic: solo para bugs irrecuperables</span>
<span class="text-go-accent">func</span> MustParseTemplate(name <span class="text-go-accent">string</span>) *Template {
    t, err := template.ParseFiles(name)
    <span class="text-go-accent">if</span> err != nil {
        <span class="text-go-accent">panic</span>("template invalido: " + err.Error())
    }
    <span class="text-go-accent">return</span> t
}

<span class="text-go-muted">// recover: capturar panic en un defer</span>
<span class="text-go-accent">func</span> SafeExecute(f <span class="text-go-accent">func</span>()) (<span class="text-go-accent">err error</span>) {
    <span class="text-go-accent">defer func</span>() {
        <span class="text-go-accent">if</span> r := <span class="text-go-accent">recover</span>(); r != nil {
            err = fmt.Errorf("panic recuperado: %v", r)
        }
    }()
    f()
    <span class="text-go-accent">return</span> nil
}`}</pre>
    </div>
    <div class="bg-red-900/20 border border-red-700/30 rounded-lg p-3 mb-4">
      <p class="text-red-300 text-sm font-bold">Regla de oro:</p>
      <p class="text-go-muted text-sm">
        Usa <code>panic</code> solo para errores de <strong>programacion</strong> (bugs), nunca para errores de
        <strong>runtime esperados</strong> (archivo no existe, red caida, input invalido). Esos son <code>error</code>.
      </p>
    </div>
  </section>

  <!-- Playground -->
  <section class="mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Playground: Errores en accion</h2>
    <p class="text-go-muted mb-4">
      Experimenta con errores personalizados, wrapping con <code>%w</code>, y las funciones <code>errors.Is</code>
      y <code>errors.As</code>. Intenta modificar el codigo para crear tu propio tipo de error.
    </p>
    <GoPlayground
      code={playgroundCode}
      title="Manejo de Errores"
      description="Errores personalizados, wrapping, errors.Is y errors.As"
    />
  </section>

  <!-- Quiz -->
  <section class="mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Quiz: Manejo de Errores</h2>
    <p class="text-go-muted mb-4">
      Verifica tu comprension sobre el manejo de errores idiomatico en Go.
    </p>
    <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />
  </section>

  {#if quizCompleted}
    <div class="bg-go-card border border-go-accent/30 rounded-lg p-4 mb-8 text-center">
      <p class="text-go-accent font-bold text-lg">Modulo completado</p>
      <p class="text-go-muted">Obtuviste {quizScore} de {quizTotal} en el quiz.</p>
    </div>
  {/if}

  <!-- Sources -->
  <SourcesSection sources={mod.sources} />

  <!-- Navigation -->
  <ModuleNav currentModule={MODULE_ID} />
</div>

<!-- Vocabulary -->
<VocabularyFloat moduleId={MODULE_ID} />

<!-- Badge Notification -->
{#if showBadge && earnedBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}

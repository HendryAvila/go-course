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

  const MODULE_ID = 6;
  const BADGE_ID = 'struct-architect';
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
\t"encoding/json"
\t"fmt"
\t"math"
)

// Struct con tags JSON
type Punto struct {
\tX float64 \`json:"x"\`
\tY float64 \`json:"y"\`
}

// Metodo con value receiver
func (p Punto) Distancia(q Punto) float64 {
\treturn math.Sqrt(math.Pow(p.X-q.X, 2) + math.Pow(p.Y-q.Y, 2))
}

// Metodo con pointer receiver (modifica el struct)
func (p *Punto) Mover(dx, dy float64) {
\tp.X += dx
\tp.Y += dy
}

// Embedding: Circulo "hereda" de Punto
type Circulo struct {
\tCentro Punto
\tRadio  float64 \`json:"radio"\`
}

func (c Circulo) Area() float64 {
\treturn math.Pi * c.Radio * c.Radio
}

func main() {
\t// Inicializacion por campos nombrados
\tp1 := Punto{X: 3, Y: 4}
\tp2 := Punto{X: 0, Y: 0}
\tfmt.Printf("Distancia de %v a %v: %.2f\\n", p1, p2, p1.Distancia(p2))

\t// Pointer receiver modifica el original
\tp1.Mover(1, 1)
\tfmt.Printf("Despues de mover: %v\\n", p1)

\t// Composicion con embedding
\tc := Circulo{
\t\tCentro: Punto{X: 0, Y: 0},
\t\tRadio:  5,
\t}
\tfmt.Printf("Area del circulo: %.2f\\n", c.Area())

\t// JSON serialization con struct tags
\tdata, _ := json.Marshal(c)
\tfmt.Printf("JSON: %s\\n", data)

\t// Struct anonimo
\tconfig := struct {
\t\tHost string
\t\tPort int
\t}{Host: "localhost", Port: 8080}
\tfmt.Printf("Config: %+v\\n", config)
}`;

  const quizQuestions = [
    {
      question: 'En Go, al declarar "var p Punto" sin inicializar, los campos del struct tendran:',
      options: [
        { text: 'Valores nil', correct: false, explanation: 'nil solo aplica a punteros, interfaces, slices, maps, channels y funciones. Los campos numericos tienen zero value 0.' },
        { text: 'Sus zero values correspondientes (0 para numericos, "" para strings, false para bool)', correct: true, explanation: 'Correcto. Go inicializa todos los campos a su zero value. No hay valores "basura" como en C.' },
        { text: 'Un error de compilacion por no inicializar', correct: false, explanation: 'Go siempre proporciona zero values. Declarar sin inicializar es perfectamente valido.' },
        { text: 'Valores aleatorios en memoria', correct: false, explanation: 'Go garantiza que toda variable tiene su zero value al declararse. No hay comportamiento indefinido.' },
      ],
    },
    {
      question: 'Cuando deberias usar un pointer receiver en lugar de un value receiver?',
      options: [
        { text: 'Siempre, es la convencion en Go', correct: false, explanation: 'No es una regla absoluta. Para structs pequenos e inmutables, un value receiver es apropiado.' },
        { text: 'Cuando el metodo necesita modificar el receptor, o cuando el struct es grande', correct: true, explanation: 'Correcto. Pointer receivers evitan copiar el struct y permiten mutacion. Si el struct es grande, pointer evita copias costosas.' },
        { text: 'Solo cuando trabajas con interfaces', correct: false, explanation: 'El tipo de receiver no depende de si usas interfaces o no, sino de si necesitas mutar o evitar copias.' },
        { text: 'Nunca, Go siempre pasa por referencia', correct: false, explanation: 'Go SIEMPRE pasa por valor. Un pointer receiver pasa una copia del puntero, pero permite acceder al struct original.' },
      ],
    },
    {
      question: 'Que es struct embedding en Go?',
      options: [
        { text: 'Herencia de clases como en Java o Python', correct: false, explanation: 'Go NO tiene herencia. Embedding es composicion: el struct embebido se incluye como un campo sin nombre.' },
        { text: 'Incluir un struct dentro de otro sin nombre de campo, promoviendo sus metodos', correct: true, explanation: 'Correcto. Los campos y metodos del struct embebido se "promueven" y se pueden acceder directamente.' },
        { text: 'Una forma de crear structs anonimos', correct: false, explanation: 'Structs anonimos son una cosa diferente. Embedding es incluir un tipo con nombre como campo sin nombre.' },
        { text: 'Una optimizacion del compilador para reducir memoria', correct: false, explanation: 'Embedding es un mecanismo de composicion del lenguaje, no una optimizacion de compilador.' },
      ],
    },
    {
      question: 'Que hacen los struct tags como `json:"nombre"`?',
      options: [
        { text: 'Cambian el nombre del campo dentro del programa', correct: false, explanation: 'Los tags NO cambian el nombre del campo en el codigo Go. Solo afectan como las librerias externas lo procesan.' },
        { text: 'Son metadatos que librerias como encoding/json usan via reflection para serializar', correct: true, explanation: 'Correcto. Los tags son strings de metadatos que se leen con el paquete reflect. encoding/json los usa para mapear campos a nombres JSON.' },
        { text: 'Validan el tipo de dato del campo en tiempo de compilacion', correct: false, explanation: 'Los tags no participan en la validacion de tipos. Son metadatos en forma de string crudo.' },
        { text: 'Hacen que el campo sea exportado aunque comience en minuscula', correct: false, explanation: 'La visibilidad siempre depende de la primera letra del campo. Tags y visibilidad son independientes.' },
      ],
    },
    {
      question: 'Cual es la diferencia clave entre mezclar pointer receivers y value receivers en un tipo?',
      options: [
        { text: 'No hay diferencia, Go los trata igual', correct: false, explanation: 'Si hay diferencia. Mezclar receivers puede ser confuso y afecta que tipos satisfacen interfaces.' },
        { text: 'Es recomendado mezclarlos para optimizar rendimiento', correct: false, explanation: 'La convencion es ser consistente. Mezclar receivers es una senal de diseno confuso.' },
        { text: 'Si un tipo tiene pointer receivers, se recomienda que TODOS sus metodos los usen por consistencia', correct: true, explanation: 'Correcto. La convencion en Go es ser consistente. Si un metodo necesita pointer receiver, generalmente todos deberian usarlo.' },
        { text: 'Go no permite mezclar pointer y value receivers', correct: false, explanation: 'Go si lo permite tecnicamente, pero la convencion recomienda consistencia.' },
      ],
    },
  ];
</script>

<svelte:head>
  <title>Modulo 6: {mod.title} | Go Mastery</title>
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

  <!-- Teoria: Structs -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Structs: Tus propios tipos</h2>
    <p class="text-go-muted mb-4">
      Go no tiene clases. En su lugar, usas <strong class="text-go-text">structs</strong> para agrupar datos relacionados
      y <strong class="text-go-text">metodos</strong> para darles comportamiento. Esto sigue el principio de
      <strong class="text-go-text">composicion sobre herencia</strong>.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-accent">type</span> Persona <span class="text-go-accent">struct</span> {
    Nombre   <span class="text-go-accent">string</span>
    Edad     <span class="text-go-accent">int</span>
    Activo   <span class="text-go-accent">bool</span>
}

<span class="text-go-muted">// Inicializacion con campos nombrados (recomendado)</span>
p1 := Persona{Nombre: "Ana", Edad: 30, Activo: true}

<span class="text-go-muted">// Inicializacion posicional (fragil, evitar)</span>
p2 := Persona{"Pedro", 25, false}

<span class="text-go-muted">// Zero value: todos los campos en su zero value</span>
<span class="text-go-accent">var</span> p3 Persona  <span class="text-go-muted">// {Nombre:"", Edad:0, Activo:false}</span>`}</pre>
    </div>
    <div class="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mb-4">
      <p class="text-yellow-300 text-sm font-bold">Buena practica:</p>
      <p class="text-go-muted text-sm">
        Siempre usa campos nombrados al inicializar structs. La forma posicional se rompe si agregas un campo al struct.
      </p>
    </div>
  </section>

  <!-- Teoria: Metodos -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Metodos: Funciones con receptor</h2>
    <p class="text-go-muted mb-4">
      Un metodo es una funcion con un <strong class="text-go-text">receptor</strong> (receiver). El receptor aparece
      entre <code>func</code> y el nombre del metodo, y vincula el metodo a un tipo.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// Value receiver: trabaja con una COPIA del struct</span>
<span class="text-go-accent">func</span> (p Persona) Saludar() <span class="text-go-accent">string</span> {
    <span class="text-go-accent">return</span> "Hola, soy " + p.Nombre
}

<span class="text-go-muted">// Pointer receiver: trabaja con el struct ORIGINAL</span>
<span class="text-go-accent">func</span> (p *Persona) CumplirAnios() {
    p.Edad++  <span class="text-go-muted">// modifica el struct original</span>
}`}</pre>
    </div>

    <h3 class="text-lg font-bold text-go-text mb-3">Pointer vs Value Receiver</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="bg-go-card border border-go-border rounded-lg p-4">
        <h4 class="text-go-accent font-bold text-sm mb-2">Value Receiver (p Tipo)</h4>
        <ul class="text-go-muted text-sm space-y-1">
          <li>Trabaja con una copia</li>
          <li>No puede modificar el original</li>
          <li>Seguro para uso concurrente</li>
          <li>Para structs pequenos e inmutables</li>
        </ul>
      </div>
      <div class="bg-go-card border border-go-border rounded-lg p-4">
        <h4 class="text-go-accent font-bold text-sm mb-2">Pointer Receiver (p *Tipo)</h4>
        <ul class="text-go-muted text-sm space-y-1">
          <li>Trabaja con el original</li>
          <li>Puede modificar campos</li>
          <li>Evita copiar structs grandes</li>
          <li>Cuando hay mutacion o struct grande</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Teoria: Embedding -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Embedding: Composicion sobre herencia</h2>
    <p class="text-go-muted mb-4">
      Go promueve <strong class="text-go-text">composicion</strong> en lugar de herencia. Con <strong class="text-go-text">embedding</strong>,
      incluyes un tipo dentro de otro sin nombre de campo, y sus metodos se <strong class="text-go-text">promueven</strong> automaticamente.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-accent">type</span> Animal <span class="text-go-accent">struct</span> {
    Nombre <span class="text-go-accent">string</span>
}

<span class="text-go-accent">func</span> (a Animal) Hablar() <span class="text-go-accent">string</span> {
    <span class="text-go-accent">return</span> a.Nombre + " hace un sonido"
}

<span class="text-go-accent">type</span> Perro <span class="text-go-accent">struct</span> {
    Animal          <span class="text-go-muted">// embedding (sin nombre de campo)</span>
    Raza <span class="text-go-accent">string</span>
}

d := Perro{Animal: Animal{Nombre: "Rex"}, Raza: "Pastor"}
d.Hablar()          <span class="text-go-muted">// metodo promovido de Animal</span>
d.Nombre            <span class="text-go-muted">// campo promovido de Animal</span>
d.Animal.Nombre     <span class="text-go-muted">// acceso explicito tambien funciona</span>`}</pre>
    </div>
  </section>

  <!-- Teoria: Struct Tags y Anonimos -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Struct Tags y Structs Anonimos</h2>
    <p class="text-go-muted mb-4">
      Los <strong class="text-go-text">struct tags</strong> son metadatos de string que se leen via reflection.
      El caso mas comun es controlar la serializacion JSON.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-accent">type</span> Usuario <span class="text-go-accent">struct</span> {
    ID       <span class="text-go-accent">int</span>    \`json:"id"\`
    Nombre   <span class="text-go-accent">string</span> \`json:"nombre"\`
    Password <span class="text-go-accent">string</span> \`json:"-"\`          <span class="text-go-muted">// se omite del JSON</span>
    Email    <span class="text-go-accent">string</span> \`json:"email,omitempty"\` <span class="text-go-muted">// se omite si vacio</span>
}

<span class="text-go-muted">// Struct anonimo: util para datos temporales</span>
config := <span class="text-go-accent">struct</span> {
    Host <span class="text-go-accent">string</span>
    Port <span class="text-go-accent">int</span>
}{Host: "localhost", Port: 8080}`}</pre>
    </div>
  </section>

  <!-- Playground -->
  <section class="mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Playground: Structs y Metodos en accion</h2>
    <p class="text-go-muted mb-4">
      Experimenta con structs, metodos, embedding y JSON serialization. Intenta agregar un nuevo metodo
      o crear tu propio struct con embedding.
    </p>
    <GoPlayground
      code={playgroundCode}
      title="Structs y Metodos"
      description="Crea structs, define metodos y experimenta con composicion"
    />
  </section>

  <!-- Quiz -->
  <section class="mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Quiz: Structs y Metodos</h2>
    <p class="text-go-muted mb-4">
      Pon a prueba tu comprension sobre structs, receivers y composicion en Go.
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

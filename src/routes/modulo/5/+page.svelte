<script lang="ts">
  import { onMount } from 'svelte';
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';
  import DragDrop from '$lib/components/DragDrop.svelte';
  import GoPlayground from '$lib/components/GoPlayground.svelte';

  const MODULE_ID = 5;
  const BADGE_ID = 'slice-ninja';
  const mod = modules.find(m => m.id === MODULE_ID)!;

  let dragDropCompleted = $state(false);
  let dragDropScore = $state(0);
  let dragDropTotal = $state(0);
  let showBadge = $state(false);
  let earnedBadge = $state<typeof allBadges[0] | null>(null);

  onMount(() => {
    courseStore.startModule(MODULE_ID);
  });

  function handleDragDropComplete(correct: number, total: number) {
    dragDropCompleted = true;
    dragDropScore = correct;
    dragDropTotal = total;
    courseStore.completeModule(MODULE_ID, correct, total);
    const badge = allBadges.find(b => b.id === BADGE_ID);
    if (badge) {
      courseStore.unlockBadge(BADGE_ID);
      earnedBadge = badge;
      showBadge = true;
    }
  }

  const dragItems = [
    { id: 'append', label: 'append()' },
    { id: 'len', label: 'len()' },
    { id: 'cap', label: 'cap()' },
    { id: 'make', label: 'make()' },
    { id: 'delete', label: 'delete()' },
    { id: 'range', label: 'range' },
  ];

  const dropZones = [
    { id: 'zone-append', label: 'Agrega elementos al final de un slice, expandiendo su capacidad si es necesario', correctItemId: 'append' },
    { id: 'zone-len', label: 'Retorna la cantidad de elementos actuales en un slice o map', correctItemId: 'len' },
    { id: 'zone-cap', label: 'Retorna la capacidad total del array subyacente de un slice', correctItemId: 'cap' },
    { id: 'zone-make', label: 'Crea un slice o map inicializado con longitud y capacidad definidas', correctItemId: 'make' },
    { id: 'zone-delete', label: 'Elimina una clave y su valor asociado de un map', correctItemId: 'delete' },
    { id: 'zone-range', label: 'Itera sobre slices, maps o strings devolviendo indice y valor', correctItemId: 'range' },
  ];

  const playgroundCode = `package main

import "fmt"

func main() {
\t// 1. Crea un slice de enteros con make (len=3, cap=5)
\tnums := make([]int, 3, 5)
\tfmt.Printf("nums: %v, len=%d, cap=%d\\n", nums, len(nums), cap(nums))

\t// 2. Agrega elementos con append
\tnums = append(nums, 10, 20)
\tfmt.Printf("despues de append: %v, len=%d, cap=%d\\n", nums, len(nums), cap(nums))

\t// 3. Slice expression: obtener sub-slice
\tsub := nums[1:4]
\tfmt.Printf("sub-slice [1:4]: %v\\n", sub)

\t// 4. Maps: crear y usar
\tedades := map[string]int{
\t\t"Ana":   25,
\t\t"Pedro": 30,
\t}

\t// comma-ok pattern
\tif edad, ok := edades["Ana"]; ok {
\t\tfmt.Printf("Ana tiene %d anios\\n", edad)
\t}

\t// delete
\tdelete(edades, "Pedro")
\tfmt.Println("Despues de delete:", edades)

\t// 5. Strings y runes
\tpalabra := "cafe\\u0301" // cafe con acento
\tfmt.Printf("string: %s, bytes: %d, runes: %d\\n",
\t\tpalabra, len(palabra), len([]rune(palabra)))

\tfor i, r := range palabra {
\t\tfmt.Printf("  indice=%d rune=%c (U+%04X)\\n", i, r, r)
\t}
}`;
</script>

<svelte:head>
  <title>Modulo 5: {mod.title} | Go Mastery</title>
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

  <!-- Teoria: Arrays -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Arrays: Tamano fijo, tipo valor</h2>
    <p class="text-go-muted mb-4">
      En Go, un <strong class="text-go-text">array</strong> tiene un tamano fijo que forma parte de su tipo.
      Esto significa que <code>[3]int</code> y <code>[5]int</code> son tipos completamente diferentes.
      Los arrays son <strong class="text-go-text">tipos valor</strong>: al asignar un array a otra variable, se copia todo el contenido.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-accent">var</span> nums [3]<span class="text-go-accent">int</span>         <span class="text-go-muted">// [0, 0, 0] - zero value</span>
colores := [3]<span class="text-go-accent">string</span>{"rojo", "verde", "azul"}
auto := [...]<span class="text-go-accent">int</span>{1, 2, 3}  <span class="text-go-muted">// el compilador cuenta: [3]int</span>

<span class="text-go-muted">// Copiar un array copia TODOS los valores</span>
copia := nums              <span class="text-go-muted">// copia independiente</span>
copia[0] = 99              <span class="text-go-muted">// nums[0] sigue siendo 0</span>`}</pre>
    </div>
    <p class="text-go-muted text-sm">
      En la practica, los arrays se usan poco directamente. El verdadero protagonista en Go es el <strong class="text-go-text">slice</strong>.
    </p>
  </section>

  <!-- Teoria: Slices -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Slices: Dinamicos y poderosos</h2>
    <p class="text-go-muted mb-4">
      Un slice es una <strong class="text-go-text">vista dinamica</strong> sobre un array subyacente. Internamente, un slice tiene tres componentes:
    </p>
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-go-card border border-go-border rounded-lg p-3 text-center">
        <p class="text-go-accent font-bold text-sm">Pointer</p>
        <p class="text-go-muted text-xs mt-1">Apunta al primer elemento del array subyacente</p>
      </div>
      <div class="bg-go-card border border-go-border rounded-lg p-3 text-center">
        <p class="text-go-accent font-bold text-sm">Length (len)</p>
        <p class="text-go-muted text-xs mt-1">Cantidad de elementos actualmente en el slice</p>
      </div>
      <div class="bg-go-card border border-go-border rounded-lg p-3 text-center">
        <p class="text-go-accent font-bold text-sm">Capacity (cap)</p>
        <p class="text-go-muted text-xs mt-1">Tamano del array subyacente desde el pointer</p>
      </div>
    </div>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// Declaracion de slices</span>
<span class="text-go-accent">var</span> s []<span class="text-go-accent">int</span>                   <span class="text-go-muted">// nil slice (== nil, len=0, cap=0)</span>
s2 := []<span class="text-go-accent">int</span>{}                  <span class="text-go-muted">// empty slice (!= nil, len=0, cap=0)</span>
s3 := []<span class="text-go-accent">int</span>{1, 2, 3}            <span class="text-go-muted">// literal</span>
s4 := <span class="text-go-accent">make</span>([]<span class="text-go-accent">int</span>, 5)           <span class="text-go-muted">// len=5, cap=5</span>
s5 := <span class="text-go-accent">make</span>([]<span class="text-go-accent">int</span>, 3, 10)        <span class="text-go-muted">// len=3, cap=10</span>`}</pre>
    </div>

    <h3 class="text-lg font-bold text-go-text mb-3">nil slice vs empty slice</h3>
    <p class="text-go-muted mb-4">
      Un <code>nil slice</code> no tiene array subyacente (es <code>nil</code>), mientras que un <code>empty slice</code>
      apunta a un array de tamano cero. Ambos tienen <code>len=0</code> y <code>cap=0</code>, pero
      <code>nil slice == nil</code> es <code>true</code> y <code>empty slice == nil</code> es <code>false</code>.
      En la practica, <code>append</code>, <code>len</code> y <code>cap</code> funcionan igual con ambos.
    </p>

    <h3 class="text-lg font-bold text-go-text mb-3">Operaciones con slices</h3>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// append: agrega elementos (puede crear nuevo array si cap se agota)</span>
s := []<span class="text-go-accent">int</span>{1, 2, 3}
s = <span class="text-go-accent">append</span>(s, 4, 5)           <span class="text-go-muted">// [1, 2, 3, 4, 5]</span>

<span class="text-go-muted">// Slice expressions: s[low:high:max]</span>
a := []<span class="text-go-accent">int</span>{0, 1, 2, 3, 4, 5}
b := a[1:4]                     <span class="text-go-muted">// [1, 2, 3] len=3, cap=5</span>
c := a[1:4:4]                   <span class="text-go-muted">// [1, 2, 3] len=3, cap=3 (limita cap)</span>

<span class="text-go-muted">// copy: copia elementos entre slices</span>
src := []<span class="text-go-accent">int</span>{1, 2, 3}
dst := <span class="text-go-accent">make</span>([]<span class="text-go-accent">int</span>, 3)
n := <span class="text-go-accent">copy</span>(dst, src)             <span class="text-go-muted">// n=3, dst=[1, 2, 3]</span>`}</pre>
    </div>
    <div class="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mb-4">
      <p class="text-yellow-300 text-sm font-bold">Importante:</p>
      <p class="text-go-muted text-sm">
        <code>append</code> puede devolver un slice que apunta a un NUEVO array si la capacidad se agota.
        Por eso siempre debes reasignar: <code>s = append(s, val)</code>.
      </p>
    </div>
  </section>

  <!-- Teoria: Maps -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Maps: Clave-Valor</h2>
    <p class="text-go-muted mb-4">
      Un <strong class="text-go-text">map</strong> es una tabla hash que asocia claves con valores. Las claves deben ser
      tipos comparables (no slices ni maps). Un map no inicializado es <code>nil</code> y no puedes escribir en el.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `<span class="text-go-muted">// Declaracion e inicializacion</span>
m := <span class="text-go-accent">map</span>[<span class="text-go-accent">string</span>]<span class="text-go-accent">int</span>{
    "go":     2009,
    "rust":   2010,
    "python": 1991,
}

<span class="text-go-muted">// Acceso, asignacion y delete</span>
year := m["go"]               <span class="text-go-muted">// 2009</span>
m["zig"] = 2016               <span class="text-go-muted">// agregar nueva clave</span>
<span class="text-go-accent">delete</span>(m, "rust")             <span class="text-go-muted">// eliminar clave</span>

<span class="text-go-muted">// comma-ok pattern: verificar si una clave existe</span>
val, ok := m["java"]          <span class="text-go-muted">// ok=false, val=0 (zero value)</span>
<span class="text-go-accent">if</span> ok {
    fmt.Println(val)
}`}</pre>
    </div>
    <p class="text-go-muted text-sm mb-4">
      El <strong class="text-go-text">comma-ok pattern</strong> es fundamental: sin el, no puedes distinguir entre
      una clave con valor cero y una clave que no existe.
    </p>
  </section>

  <!-- Teoria: Strings y Runes -->
  <section class="prose-section mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Strings y Runes: UTF-8 nativo</h2>
    <p class="text-go-muted mb-4">
      En Go, los strings son secuencias de <strong class="text-go-text">bytes</strong> (no de caracteres).
      Go usa <strong class="text-go-text">UTF-8</strong> de forma nativa, lo que significa que un caracter puede ocupar
      1 a 4 bytes. El tipo <code>rune</code> (alias de <code>int32</code>) representa un <strong class="text-go-text">code point</strong> Unicode.
    </p>
    <div class="bg-go-dark rounded-lg p-4 mb-4 overflow-x-auto">
      <pre class="text-sm font-mono text-go-text">{@html `s := "Hola mundo"
fmt.Println(<span class="text-go-accent">len</span>(s))        <span class="text-go-muted">// bytes, no caracteres</span>

emoji := "Go es genial"
<span class="text-go-muted">// range itera por RUNES, no por bytes</span>
<span class="text-go-accent">for</span> i, r := <span class="text-go-accent">range</span> emoji {
    fmt.Printf("%d: %c\\n", i, r)
}

<span class="text-go-muted">// Convertir entre string, []byte y []rune</span>
bytes := []<span class="text-go-accent">byte</span>(s)
runes := []<span class="text-go-accent">rune</span>(s)
back := <span class="text-go-accent">string</span>(runes)`}</pre>
    </div>
    <div class="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 mb-4">
      <p class="text-blue-300 text-sm font-bold">Tip clave:</p>
      <p class="text-go-muted text-sm">
        Usa <code>range</code> sobre strings para iterar por runes. Un <code>for</code> clasico con indice itera por bytes,
        lo que puede romper caracteres multibyte.
      </p>
    </div>
  </section>

  <!-- Ejercicio DragDrop -->
  <section class="mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Ejercicio: Operaciones de Colecciones</h2>
    <p class="text-go-muted mb-4">
      Arrastra cada funcion u operador a la descripcion que le corresponde.
    </p>
    <DragDrop
      items={dragItems}
      zones={dropZones}
      onComplete={handleDragDropComplete}
      instruction="Arrastra cada operacion a su descripcion correcta"
    />
  </section>

  <!-- Playground -->
  <section class="mb-8">
    <h2 class="text-xl font-bold text-go-accent mb-4">Playground: Experimenta con Colecciones</h2>
    <p class="text-go-muted mb-4">
      Ejecuta y modifica este codigo para explorar slices, maps y runes. Intenta cambiar valores, agregar
      elementos con <code>append</code>, o probar la diferencia entre <code>len</code> de un string en bytes vs runes.
    </p>
    <GoPlayground
      code={playgroundCode}
      title="Colecciones en Go"
      description="Experimenta con arrays, slices, maps y strings"
    />
  </section>

  {#if dragDropCompleted}
    <div class="bg-go-card border border-go-accent/30 rounded-lg p-4 mb-8 text-center">
      <p class="text-go-accent font-bold text-lg">Modulo completado</p>
      <p class="text-go-muted">Obtuviste {dragDropScore} de {dragDropTotal} en el ejercicio de Drag &amp; Drop.</p>
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

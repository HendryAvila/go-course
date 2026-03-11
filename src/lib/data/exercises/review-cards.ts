import type { ReviewCard } from './types';

export const reviewCards: ReviewCard[] = [
  // ============================================================
  // MODULE 1 — Go basics (package main, func main, fmt, toolchain)
  // ============================================================
  {
    id: 'rc-001',
    sourceModuleId: 1,
    question: '¿Qué pasa si renombrás la función main() a inicio() en un archivo con package main?',
    options: [
      { text: 'Compila pero no se ejecuta nada', correct: false, explanation: 'No llega a compilar como ejecutable — el linker necesita main() como punto de entrada.' },
      { text: 'Error de compilación: runtime.main_main·f: function main is undeclared', correct: true, explanation: 'Go requiere que el paquete main tenga una función main(). Sin ella, el build falla porque el runtime no encuentra el entry point.' },
      { text: 'Se ejecuta inicio() automáticamente', correct: false, explanation: 'Go no busca funciones por convención de nombre — solo main() en package main es el entry point.' },
      { text: 'Compila pero panic en runtime', correct: false, explanation: 'El error es en tiempo de compilación/link, no en runtime.' },
    ],
    difficulty: 'easy',
    concept: 'entry point',
  },
  {
    id: 'rc-002',
    sourceModuleId: 1,
    question: '¿Qué hace `go run main.go` que `go build main.go` NO hace?',
    options: [
      { text: 'Compila con optimizaciones extras', correct: false, explanation: 'Ambos usan el mismo compilador con las mismas optimizaciones por defecto.' },
      { text: 'Compila a un binario temporal y lo ejecuta inmediatamente', correct: true, explanation: '`go run` compila a un directorio temporal y ejecuta el binario resultante. `go build` solo genera el binario sin ejecutarlo.' },
      { text: 'Interpreta el código sin compilar', correct: false, explanation: 'Go SIEMPRE compila — no es un lenguaje interpretado. `go run` es compilar+ejecutar en un paso.' },
      { text: 'Descarga las dependencias automáticamente', correct: false, explanation: 'Ambos descargan dependencias si faltan. Eso no es exclusivo de `go run`.' },
    ],
    difficulty: 'easy',
    concept: 'go toolchain',
  },
  {
    id: 'rc-003',
    sourceModuleId: 1,
    question: '¿Por qué Go no compila si importás un paquete y no lo usás?',
    options: [
      { text: 'Es un bug conocido del compilador', correct: false, explanation: 'Es una decisión de diseño deliberada, no un bug.' },
      { text: 'Para forzar código limpio — imports no usados son dead code que confunde', correct: true, explanation: 'Los diseñadores de Go decidieron que los imports no usados son un error, no un warning. Esto mantiene el código limpio y las builds rápidas al no compilar paquetes innecesarios.' },
      { text: 'Porque el garbage collector no puede manejar paquetes sin usar', correct: false, explanation: 'El GC no tiene nada que ver con imports — es una decisión del compilador para mantener higiene de código.' },
      { text: 'Solo pasa en modo estricto, se puede desactivar', correct: false, explanation: 'No hay modo "no estricto" en Go. Los imports no usados SIEMPRE son error de compilación.' },
    ],
    difficulty: 'medium',
    concept: 'imports y diseño del lenguaje',
  },
  {
    id: 'rc-004',
    sourceModuleId: 1,
    question: '¿Cuál es la diferencia entre fmt.Println y fmt.Printf?',
    options: [
      { text: 'Println es para strings y Printf para números', correct: false, explanation: 'Ambas pueden imprimir cualquier tipo. La diferencia es el formateo.' },
      { text: 'Printf permite format strings con verbos (%s, %d, %v) y Println agrega newline automático', correct: true, explanation: 'Printf usa format strings como C (ej: "%s tiene %d años") y NO agrega newline. Println imprime los argumentos separados por espacio y agrega newline al final.' },
      { text: 'Son exactamente iguales, Printf es un alias', correct: false, explanation: 'Tienen comportamientos muy distintos. Printf usa format strings, Println no.' },
      { text: 'Printf es más rápida porque no agrega newline', correct: false, explanation: 'La performance es similar. La diferencia real es que Printf usa format verbs y Println no.' },
    ],
    difficulty: 'easy',
    concept: 'fmt package',
  },

  // ============================================================
  // MODULE 2 — Types, variables, constants
  // ============================================================
  {
    id: 'rc-005',
    sourceModuleId: 2,
    question: '¿Qué imprime este código?\n\nvar x int\nvar s string\nvar b bool\nfmt.Printf("%d %q %t", x, s, b)',
    options: [
      { text: '0 "" false', correct: false, explanation: 'Casi — pero %q agrega comillas alrededor del string.' },
      { text: '0 \"\" false', correct: true, explanation: 'Los zero values de Go: int es 0, string es "" (que %q muestra con comillas), bool es false. Go SIEMPRE inicializa variables — no hay "undefined".' },
      { text: 'nil nil nil', correct: false, explanation: 'nil solo aplica a punteros, slices, maps, channels, interfaces y functions. Los tipos básicos tienen zero values concretos.' },
      { text: 'Error de compilación: variables no inicializadas', correct: false, explanation: 'En Go, toda variable se inicializa automáticamente a su zero value. No hay variables "sin inicializar".' },
    ],
    difficulty: 'easy',
    concept: 'zero values',
  },
  {
    id: 'rc-006',
    sourceModuleId: 2,
    question: '¿Por qué este código NO compila?\n\nx := 42\nx := 100',
    options: [
      { text: 'Porque := no existe en Go', correct: false, explanation: ':= sí existe — es short variable declaration. El problema es otro.' },
      { text: 'Porque no se puede reasignar variables en Go', correct: false, explanation: 'Sí se puede reasignar con `=`. El problema es usar `:=` dos veces.' },
      { text: 'Porque := declara una variable NUEVA y x ya existe en ese scope', correct: true, explanation: ':= es declaración + asignación. Usar := con una variable que ya existe en el mismo scope es error: "no new variables on left side of :=". Usá `x = 100` para reasignar.' },
      { text: 'Porque 42 y 100 son tipos diferentes', correct: false, explanation: 'Ambos son int. El error es por redeclaración, no por tipos.' },
    ],
    difficulty: 'easy',
    concept: 'short variable declaration',
  },
  {
    id: 'rc-007',
    sourceModuleId: 2,
    question: '¿Qué valor tiene `c` al final?\n\nconst (\n  a = iota     // 0\n  b            // 1\n  _            // 2 (descartado)\n  c            // ?\n)',
    options: [
      { text: '2', correct: false, explanation: 'iota no se "salta" al usar _. Sigue incrementando.' },
      { text: '3', correct: true, explanation: 'iota incrementa con cada línea del bloque const, sin importar si usás _ o un nombre. a=0, b=1, _=2, c=3.' },
      { text: '1', correct: false, explanation: 'iota no se reinicia al descartar con _. Sigue su secuencia.' },
      { text: 'Error: no se puede usar _ en const', correct: false, explanation: 'El blank identifier _ es válido en const blocks. Simplemente descarta ese valor.' },
    ],
    difficulty: 'medium',
    concept: 'iota',
  },
  {
    id: 'rc-008',
    sourceModuleId: 2,
    question: '¿Qué tipo tiene la variable `r` en `r := \'A\'`?',
    options: [
      { text: 'string', correct: false, explanation: 'Las comillas simples denotan un rune literal, no un string. Los strings usan comillas dobles.' },
      { text: 'byte', correct: false, explanation: 'Aunque \'A\' cabe en un byte, Go infiere rune (int32) para character literals.' },
      { text: 'rune (alias de int32)', correct: true, explanation: 'En Go, un literal con comillas simples es un rune, que es un alias de int32. Representa un code point Unicode. Si necesitás byte, tenés que declarar explícitamente: var b byte = \'A\'.' },
      { text: 'char', correct: false, explanation: 'Go no tiene tipo char. Usa rune (int32) para caracteres Unicode y byte (uint8) para bytes individuales.' },
    ],
    difficulty: 'medium',
    concept: 'rune',
  },

  // ============================================================
  // MODULE 3 — Control flow
  // ============================================================
  {
    id: 'rc-009',
    sourceModuleId: 3,
    question: '¿Qué imprime este código?\n\nif x := 10; x > 5 {\n  fmt.Println(x)\n}\nfmt.Println(x)',
    options: [
      { text: '10 y luego 10', correct: false, explanation: 'La variable x declarada en el if tiene scope limitado al bloque if/else.' },
      { text: '10 y luego error de compilación', correct: true, explanation: 'La x del `if init statement` solo vive dentro del if/else. El segundo fmt.Println(x) no compila porque x no existe en ese scope. Este patrón es útil para limitar el scope de variables temporales.' },
      { text: 'Error de compilación en las dos líneas', correct: false, explanation: 'La primera línea dentro del if sí funciona — x es visible ahí.' },
      { text: '10 y luego 0', correct: false, explanation: 'No hay un "x exterior" con zero value. Directamente no compila.' },
    ],
    difficulty: 'medium',
    concept: 'if init statement',
  },
  {
    id: 'rc-010',
    sourceModuleId: 3,
    question: '¿Cuál es la forma correcta de un loop infinito en Go?',
    options: [
      { text: 'while true { }', correct: false, explanation: 'Go NO tiene keyword while. Solo existe for.' },
      { text: 'for { }', correct: true, explanation: 'En Go, `for` sin condición es un loop infinito. Es equivalente al `while(true)` de otros lenguajes. Go unificó todos los loops en la keyword `for`.' },
      { text: 'loop { }', correct: false, explanation: 'Go no tiene keyword loop. Usa `for { }` para loops infinitos.' },
      { text: 'for (;;) { }', correct: false, explanation: 'Go no usa paréntesis en el for. La forma correcta es simplemente `for { }`.' },
    ],
    difficulty: 'easy',
    concept: 'for loop',
  },
  {
    id: 'rc-011',
    sourceModuleId: 3,
    question: '¿Qué pasa con los `defer` en este código?\n\nfunc ejemplo() {\n  defer fmt.Println("A")\n  defer fmt.Println("B")\n  defer fmt.Println("C")\n}',
    options: [
      { text: 'Imprime A B C (en orden)', correct: false, explanation: 'Los defers NO se ejecutan en orden — usan una pila (LIFO).' },
      { text: 'Imprime C B A (orden inverso)', correct: true, explanation: 'Los defer se apilan: el último en registrarse es el primero en ejecutarse (LIFO — Last In, First Out). Se ejecutan cuando la función retorna.' },
      { text: 'Imprime solo C (los anteriores se pierden)', correct: false, explanation: 'TODOS los defers se ejecutan, no solo el último.' },
      { text: 'No imprime nada — defer cancela la ejecución', correct: false, explanation: 'defer no cancela nada — pospone la ejecución hasta que la función retorna.' },
    ],
    difficulty: 'easy',
    concept: 'defer stack',
  },
  {
    id: 'rc-012',
    sourceModuleId: 3,
    question: '¿Qué diferencia clave tiene el switch de Go respecto al de C/Java?',
    options: [
      { text: 'Go no tiene switch', correct: false, explanation: 'Go sí tiene switch, y es bastante más flexible que en otros lenguajes.' },
      { text: 'En Go cada case tiene break implícito — no hay fall-through por defecto', correct: true, explanation: 'En C/Java, sin break explícito, la ejecución "cae" al siguiente case. En Go es al revés: cada case termina automáticamente. Si querés fall-through, usás la keyword `fallthrough` explícitamente.' },
      { text: 'El switch de Go solo acepta strings', correct: false, explanation: 'El switch de Go acepta cualquier tipo comparable, e incluso puede no tener expresión (switch sin valor = cadena de if/else).' },
      { text: 'No se pueden poner múltiples valores en un case', correct: false, explanation: 'Sí se puede: `case 1, 2, 3:` es válido en Go.' },
    ],
    difficulty: 'medium',
    concept: 'switch',
  },

  // ============================================================
  // MODULE 4 — Functions
  // ============================================================
  {
    id: 'rc-013',
    sourceModuleId: 4,
    question: '¿Qué imprime este código?\n\nfunc divide(a, b float64) (float64, error) {\n  if b == 0 {\n    return 0, fmt.Errorf("división por cero")\n  }\n  return a / b, nil\n}\n\nresult, _ := divide(10, 0)\nfmt.Println(result)',
    options: [
      { text: 'panic: división por cero', correct: false, explanation: 'No hay panic — la función retorna un error que estamos descartando con _.' },
      { text: '0', correct: true, explanation: 'La función retorna (0, error) cuando b==0. Al usar `_` descartamos el error y nos queda result=0. Este es un antipatrón clásico: ignorar errores con _ puede ocultar bugs.' },
      { text: 'NaN', correct: false, explanation: 'La función nunca llega a dividir — retorna 0 antes de la división.' },
      { text: 'Error de compilación', correct: false, explanation: 'El código compila perfecto. Descartar con _ es legal aunque sea mala práctica.' },
    ],
    difficulty: 'medium',
    concept: 'multiple returns',
  },
  {
    id: 'rc-014',
    sourceModuleId: 4,
    question: '¿Qué imprime este código con closure?\n\nfunc counter() func() int {\n  n := 0\n  return func() int {\n    n++\n    return n\n  }\n}\n\nc := counter()\nfmt.Println(c(), c(), c())',
    options: [
      { text: '1 1 1', correct: false, explanation: 'El closure captura n por referencia — n persiste entre llamadas.' },
      { text: '1 2 3', correct: true, explanation: 'El closure captura la variable n (no su valor). Cada llamada a c() incrementa la MISMA n. Las closures en Go capturan variables por referencia, no por copia.' },
      { text: '0 0 0', correct: false, explanation: 'n se incrementa ANTES del return, así que empieza en 1.' },
      { text: 'Error: no se puede retornar una función', correct: false, explanation: 'En Go las funciones son first-class citizens — se pueden retornar, asignar a variables, pasar como argumentos.' },
    ],
    difficulty: 'medium',
    concept: 'closures',
  },
  {
    id: 'rc-015',
    sourceModuleId: 4,
    question: '¿Qué hace `nums ...int` en `func sum(nums ...int) int`?',
    options: [
      { text: 'Declara un array fijo de ints', correct: false, explanation: 'No es un array fijo — es un slice que acepta cualquier cantidad de argumentos.' },
      { text: 'Acepta 0 o más argumentos int que se reciben como un slice', correct: true, explanation: '`...int` es un parámetro variádico: `sum(1, 2, 3)` recibe nums como []int{1, 2, 3}. También podés pasar un slice con `sum(miSlice...)`.' },
      { text: 'Es un spread operator como en JavaScript', correct: false, explanation: 'Es similar pero no idéntico. En la definición de función es variádico. `...` después de un slice al llamar es "unpack", no spread.' },
      { text: 'Significa que nums puede ser int o nil', correct: false, explanation: 'int es un tipo valor, nunca puede ser nil. Lo que cambia es que podés pasar 0 argumentos (nums sería un slice vacío).' },
    ],
    difficulty: 'easy',
    concept: 'variadic functions',
  },
  {
    id: 'rc-016',
    sourceModuleId: 4,
    question: '¿Cuál es la salida de `fmt.Println(min(5, 3, 8, 1, 4))` en Go 1.21+?',
    options: [
      { text: 'Error: min no existe en Go', correct: false, explanation: 'Desde Go 1.21, min y max son builtins del lenguaje.' },
      { text: '1', correct: true, explanation: 'Go 1.21 agregó min() y max() como funciones builtin. Aceptan cualquier tipo ordered y cantidad variádica de argumentos. min(5, 3, 8, 1, 4) retorna 1.' },
      { text: '[1 3 4 5 8]', correct: false, explanation: 'min retorna el valor mínimo, no ordena los elementos.' },
      { text: 'Error: min solo acepta 2 argumentos', correct: false, explanation: 'Desde Go 1.21, min y max aceptan 2 o más argumentos.' },
    ],
    difficulty: 'easy',
    concept: 'min/max builtins',
  },

  // ============================================================
  // MODULE 5 — Collections (arrays, slices, maps)
  // ============================================================
  {
    id: 'rc-017',
    sourceModuleId: 5,
    question: '¿Cuál es la diferencia fundamental entre array y slice en Go?',
    options: [
      { text: 'Los arrays pueden contener cualquier tipo, los slices solo ints', correct: false, explanation: 'Ambos pueden contener cualquier tipo. La diferencia es en tamaño y comportamiento.' },
      { text: 'El array tiene tamaño fijo que es parte del tipo; el slice es dinámico y referencia un array subyacente', correct: true, explanation: '[3]int y [5]int son tipos DIFERENTES. Un slice []int no tiene tamaño fijo, tiene len y cap, y es una referencia (header) a un array subyacente. En la práctica, casi siempre usás slices.' },
      { text: 'Son lo mismo, "slice" es solo otro nombre para array', correct: false, explanation: 'Son tipos completamente distintos. Un array se copia por valor, un slice es un header (ptr, len, cap).' },
      { text: 'Los slices son más lentos porque usan heap', correct: false, explanation: 'No necesariamente — el compilador puede optimizar. La diferencia es semántica, no de performance pura.' },
    ],
    difficulty: 'easy',
    concept: 'arrays vs slices',
  },
  {
    id: 'rc-018',
    sourceModuleId: 5,
    question: '¿Qué imprime este código?\n\na := []int{1, 2, 3}\nb := a\nb[0] = 99\nfmt.Println(a[0])',
    options: [
      { text: '1', correct: false, explanation: 'Los slices son referencias — b apunta al mismo array subyacente que a.' },
      { text: '99', correct: true, explanation: 'Asignar un slice NO copia los datos — b y a comparten el mismo array subyacente. Modificar b[0] modifica a[0]. Para copiar, usá `b := slices.Clone(a)` o `copy(b, a)`.' },
      { text: 'Error de compilación', correct: false, explanation: 'El código es válido — los slices se pueden asignar libremente.' },
      { text: '0', correct: false, explanation: 'No se resetea a zero value. b y a apuntan a los mismos datos.' },
    ],
    difficulty: 'medium',
    concept: 'slice reference semantics',
  },
  {
    id: 'rc-019',
    sourceModuleId: 5,
    question: '¿Qué pasa al acceder a una key inexistente en un map?',
    options: [
      { text: 'panic: key not found', correct: false, explanation: 'Go no hace panic por keys inexistentes — retorna el zero value del tipo.' },
      { text: 'Retorna el zero value del tipo y false en el segundo valor (comma ok idiom)', correct: true, explanation: '`val, ok := m["key"]` retorna (zero_value, false) si no existe. Esto es el "comma ok idiom" de Go. Sin el segundo valor, simplemente obtenés el zero value sin forma de distinguir "no existe" de "existe con valor cero".' },
      { text: 'Retorna nil', correct: false, explanation: 'Solo si el value type del map es un puntero, slice, map, etc. Para int retorna 0, para string retorna "".' },
      { text: 'Error de compilación', correct: false, explanation: 'Acceder a keys inexistentes es válido — Go lo maneja con zero values.' },
    ],
    difficulty: 'medium',
    concept: 'maps comma ok idiom',
  },
  {
    id: 'rc-020',
    sourceModuleId: 5,
    question: '¿Qué hace `slices.Contains(s, val)` del paquete slices (Go 1.21+)?',
    options: [
      { text: 'Retorna el índice donde está val', correct: false, explanation: 'Eso es `slices.Index`. Contains retorna un bool.' },
      { text: 'Busca val en el slice s y retorna true/false', correct: true, explanation: '`slices.Contains` es un genérico que busca linealmente en el slice. Antes de Go 1.21 tenías que escribir un loop manual para esto. También tenés slices.Sort, slices.Index, etc.' },
      { text: 'Agrega val al slice si no existe', correct: false, explanation: 'Contains solo consulta, no modifica. Para agregar usás append.' },
      { text: 'Error: ese paquete no existe', correct: false, explanation: 'El paquete slices se agregó en Go 1.21 como parte de la standard library.' },
    ],
    difficulty: 'easy',
    concept: 'slices package',
  },

  // ============================================================
  // MODULE 6 — Structs & methods
  // ============================================================
  {
    id: 'rc-021',
    sourceModuleId: 6,
    question: '¿Cuándo usarías un pointer receiver (*T) en vez de value receiver (T)?',
    options: [
      { text: 'Siempre — es más eficiente', correct: false, explanation: 'Para structs chicos, value receivers pueden ser más eficientes por cache locality.' },
      { text: 'Cuando el método necesita modificar el receiver, o el struct es grande', correct: true, explanation: 'Pointer receiver: (1) necesitás mutar el receiver, (2) el struct es grande y copiar es costoso, (3) consistencia — si un método usa pointer receiver, todos deberían. Value receiver: struct chico e inmutable.' },
      { text: 'Solo cuando trabajás con interfaces', correct: false, explanation: 'La elección de receiver no depende de interfaces. Un *T implementa métodos de T y *T, pero T solo los de T.' },
      { text: 'Nunca — Go maneja todo automáticamente', correct: false, explanation: 'La elección es del programador y tiene consecuencias reales en mutabilidad y performance.' },
    ],
    difficulty: 'medium',
    concept: 'value vs pointer receivers',
  },
  {
    id: 'rc-022',
    sourceModuleId: 6,
    question: '¿Qué imprime este código?\n\ntype Base struct{ Name string }\ntype Derived struct{ Base }\n\nd := Derived{Base{"Go"}}\nfmt.Println(d.Name)',
    options: [
      { text: 'Error: Derived no tiene campo Name', correct: false, explanation: 'La embedding promueve los campos — Name es accesible directamente.' },
      { text: '"Go"', correct: true, explanation: 'Go tiene embedding (composición), no herencia. Al embeber Base en Derived, los campos y métodos de Base se "promueven" — podés acceder a d.Name directamente (equivale a d.Base.Name).' },
      { text: 'Error: Go no soporta herencia', correct: false, explanation: 'Correcto que no hay herencia, pero sí embedding. Y embedding promueve campos.' },
      { text: '""', correct: false, explanation: 'El campo se inicializa con "Go" en la declaración.' },
    ],
    difficulty: 'easy',
    concept: 'embedding',
  },
  {
    id: 'rc-023',
    sourceModuleId: 6,
    question: '¿Qué pasa si dos campos embebidos tienen el mismo nombre de método?',
    options: [
      { text: 'El último embebido gana', correct: false, explanation: 'No hay prioridad por orden — es ambiguo.' },
      { text: 'Error de compilación al intentar llamar al método (ambigüedad)', correct: true, explanation: 'Si dos tipos embebidos exponen el mismo método, Go NO elige automáticamente. Al llamar d.MetodoComun() da error de compilación. Tenés que desambiguar: d.Tipo1.MetodoComun() o d.Tipo2.MetodoComun().' },
      { text: 'Se ejecutan ambos métodos', correct: false, explanation: 'Go no ejecuta ambos — no puede decidir cuál usar.' },
      { text: 'El struct exterior siempre tiene prioridad', correct: false, explanation: 'Si el struct exterior define su propio método con ese nombre, sí tiene prioridad. Pero entre dos embebidos del mismo nivel, es ambiguo.' },
    ],
    difficulty: 'hard',
    concept: 'embedding ambiguity',
  },

  // ============================================================
  // MODULE 7 — Interfaces
  // ============================================================
  {
    id: 'rc-024',
    sourceModuleId: 7,
    question: '¿Qué significa que las interfaces en Go son "implícitas"?',
    options: [
      { text: 'Que se declaran con la keyword implicit', correct: false, explanation: 'No existe keyword implicit en Go.' },
      { text: 'Que un tipo implementa una interface automáticamente al tener los métodos correctos — sin declarar "implements"', correct: true, explanation: 'En Go, no escribís `type Dog implements Animal`. Si Dog tiene todos los métodos que pide Animal, automáticamente la satisface. Esto permite interfaces después del hecho y desacoplamiento total.' },
      { text: 'Que todas las interfaces están definidas en la stdlib', correct: false, explanation: 'Podés definir tus propias interfaces en cualquier paquete.' },
      { text: 'Que no necesitás declarar interfaces', correct: false, explanation: 'Sí necesitás declararlas. Lo implícito es la IMPLEMENTACIÓN, no la declaración.' },
    ],
    difficulty: 'easy',
    concept: 'implicit interfaces',
  },
  {
    id: 'rc-025',
    sourceModuleId: 7,
    question: '¿Qué hace este código?\n\nvar w io.Writer\nfmt.Println(w == nil)',
    options: [
      { text: 'Error de compilación', correct: false, explanation: 'Es código válido — una interface sin asignar tiene valor nil.' },
      { text: 'true', correct: true, explanation: 'Una interface no asignada es nil (tanto su tipo como su valor son nil). Pero cuidado: una interface que contiene un puntero nil NO es nil — tiene tipo asignado. Ese es uno de los bugs más sutiles de Go.' },
      { text: 'false', correct: false, explanation: 'Una interface declarada sin asignar es nil.' },
      { text: 'panic: nil pointer dereference', correct: false, explanation: 'Comparar con nil no causa panic. Solo llamar a métodos sobre una interface nil lo haría.' },
    ],
    difficulty: 'medium',
    concept: 'nil interfaces',
  },
  {
    id: 'rc-026',
    sourceModuleId: 7,
    question: '¿Cuál es la diferencia entre type assertion y type switch?',
    options: [
      { text: 'Son lo mismo con diferente sintaxis', correct: false, explanation: 'Tienen propósitos y sintaxis distintos.' },
      { text: 'Type assertion extrae UN tipo concreto (val, ok := i.(T)); type switch maneja MÚLTIPLES tipos posibles', correct: true, explanation: '`val, ok := i.(string)` prueba un tipo específico. `switch v := i.(type) { case string: ... case int: ... }` maneja múltiples tipos elegantemente. Usá assertion cuando esperás un tipo, switch cuando hay varios posibles.' },
      { text: 'Type assertion es más rápida', correct: false, explanation: 'Performance similar — la diferencia es de uso, no de velocidad.' },
      { text: 'Type switch solo funciona con interfaces vacías (any)', correct: false, explanation: 'Funciona con cualquier tipo de interface, no solo any/interface{}.' },
    ],
    difficulty: 'medium',
    concept: 'type assertions y type switches',
  },
  {
    id: 'rc-027',
    sourceModuleId: 7,
    question: '¿Para qué sirve implementar la interface fmt.Stringer?',
    options: [
      { text: 'Para poder comparar structs con ==', correct: false, explanation: 'La comparabilidad depende de los campos del struct, no de Stringer.' },
      { text: 'Para personalizar cómo se imprime un tipo con fmt.Println, %v, etc.', correct: true, explanation: 'fmt.Stringer requiere `String() string`. Cuando fmt.Println o %v encuentran un tipo que implementa Stringer, llaman a String() en vez del formateo por defecto. Es el equivalente a __str__ en Python o toString() en Java.' },
      { text: 'Para convertir cualquier tipo a string', correct: false, explanation: 'No convierte — personaliza la representación en texto cuando se imprime con el paquete fmt.' },
      { text: 'Es obligatorio para todos los structs', correct: false, explanation: 'Es opcional. Sin Stringer, fmt usa su formateo por defecto ({campo1 campo2}).' },
    ],
    difficulty: 'easy',
    concept: 'fmt.Stringer',
  },

  // ============================================================
  // MODULE 8 — Error handling
  // ============================================================
  {
    id: 'rc-028',
    sourceModuleId: 8,
    question: '¿Qué método necesita implementar un tipo para satisfacer la interface error?',
    options: [
      { text: 'Err() string', correct: false, explanation: 'El método se llama Error, no Err.' },
      { text: 'Error() string', correct: true, explanation: 'La interface error de Go es mínima: solo requiere `Error() string`. Cualquier tipo que tenga ese método es un error. Esto permite crear errores custom con campos extras manteniendo compatibilidad.' },
      { text: 'String() string', correct: false, explanation: 'Eso es fmt.Stringer, no error. Son interfaces diferentes.' },
      { text: 'Message() string', correct: false, explanation: 'Go usa Error(), no Message(). La simplicidad de la interface es deliberada.' },
    ],
    difficulty: 'easy',
    concept: 'error interface',
  },
  {
    id: 'rc-029',
    sourceModuleId: 8,
    question: '¿Cuál es la diferencia entre errors.Is y errors.As?',
    options: [
      { text: 'Son lo mismo — aliases por conveniencia', correct: false, explanation: 'Hacen cosas muy diferentes: uno compara, el otro extrae.' },
      { text: 'Is compara identidad/valor del error; As extrae el error a un tipo concreto para acceder a sus campos', correct: true, explanation: '`errors.Is(err, ErrNotFound)` pregunta "¿es este error (o alguno en la cadena) ErrNotFound?". `errors.As(err, &target)` pregunta "¿hay un error de tipo *MyError en la cadena?" y si lo hay, lo asigna a target para acceder a sus campos.' },
      { text: 'Is es para errores wrapped, As para errores directos', correct: false, explanation: 'Ambos recorren la cadena de errores wrapped con Unwrap().' },
      { text: 'Is retorna bool, As retorna el error', correct: false, explanation: 'Is retorna bool, correcto. Pero As también retorna bool y asigna a un puntero target.' },
    ],
    difficulty: 'hard',
    concept: 'errors.Is vs errors.As',
  },
  {
    id: 'rc-030',
    sourceModuleId: 8,
    question: '¿Qué hace `%w` en fmt.Errorf?\n\nreturn fmt.Errorf("fallo al guardar usuario: %w", err)',
    options: [
      { text: 'Es igual a %v — imprime el error', correct: false, explanation: '%v solo formatea, %w además envuelve el error para la cadena.' },
      { text: 'Envuelve (wraps) el error original para que errors.Is/As puedan encontrarlo en la cadena', correct: true, explanation: '%w crea un error que contiene al original. Podés ir "desenvolviendo" la cadena. `errors.Is(err, io.EOF)` encontraría io.EOF aunque esté envuelto en varios niveles. Sin %w, el error original se pierde.' },
      { text: 'Convierte el error a un warning', correct: false, explanation: 'Go no tiene concepto de warnings. %w envuelve errores.' },
      { text: 'Hace panic si el error no es nil', correct: false, explanation: '%w no causa panic — crea un nuevo error que envuelve al original.' },
    ],
    difficulty: 'medium',
    concept: 'error wrapping',
  },
  {
    id: 'rc-031',
    sourceModuleId: 8,
    question: '¿Cuándo es apropiado usar panic() en Go?',
    options: [
      { text: 'Para cualquier error — es la forma estándar de manejar errores', correct: false, explanation: 'La forma estándar en Go es retornar error. panic es excepcional.' },
      { text: 'Solo en situaciones verdaderamente irrecuperables: bugs del programador, invariantes rotos, inicialización fallida', correct: true, explanation: 'panic es para errores que NO deberían ocurrir si el código es correcto: índices fuera de rango, nil dereferences, configuración faltante al startup. Para errores esperados (archivo no existe, red falló), SIEMPRE retorná error.' },
      { text: 'Nunca — panic no existe en Go idiomático', correct: false, explanation: 'panic sí se usa: regex.MustCompile, template.Must, inicialización. Pero es raro y acotado.' },
      { text: 'Cada vez que querés loggear un error', correct: false, explanation: 'Para logging usás log.Println o slog. panic termina el programa (a menos que haya recover).' },
    ],
    difficulty: 'medium',
    concept: 'panic vs error',
  },

  // ============================================================
  // MODULE 9 — Packages & tooling
  // ============================================================
  {
    id: 'rc-032',
    sourceModuleId: 9,
    question: '¿Qué determina si un nombre es exportado (público) en Go?',
    options: [
      { text: 'La keyword public/private', correct: false, explanation: 'Go no tiene keywords public/private. Usa una convención más simple.' },
      { text: 'Si empieza con mayúscula es exportado, con minúscula es no exportado', correct: true, explanation: 'En Go, la visibilidad se determina por la primera letra: `Nombre` es público (exportado), `nombre` es privado al paquete. Aplica a funciones, tipos, variables, constantes y campos de structs.' },
      { text: 'Un archivo de configuración de exports', correct: false, explanation: 'No hay archivo de exports. La convención de mayúsculas/minúsculas es todo.' },
      { text: 'La ubicación del archivo dentro del módulo', correct: false, explanation: 'La ubicación del archivo no afecta visibilidad. Solo la primera letra del nombre importa.' },
    ],
    difficulty: 'easy',
    concept: 'visibility',
  },
  {
    id: 'rc-033',
    sourceModuleId: 9,
    question: '¿Qué hace `go vet` que el compilador NO hace?',
    options: [
      { text: 'Compila con optimizaciones', correct: false, explanation: 'go vet no compila — analiza el código buscando errores sutiles.' },
      { text: 'Detecta errores sutiles como Printf con args incorrectos, variables shadowed, unreachable code', correct: true, explanation: '`go vet` es análisis estático más allá de la compilación. Detecta: format strings con argumentos mal tipados, copias de locks, tests con nombres incorrectos, métodos con signatures rotas, etc. Es tu segunda línea de defensa después del compilador.' },
      { text: 'Formatea el código automáticamente', correct: false, explanation: 'Eso es `go fmt` o `gofmt`. go vet analiza, no modifica.' },
      { text: 'Corre los tests', correct: false, explanation: 'Eso es `go test`. go vet hace análisis estático.' },
    ],
    difficulty: 'medium',
    concept: 'go vet',
  },
  {
    id: 'rc-034',
    sourceModuleId: 9,
    question: '¿Qué ventaja principal tiene log/slog (Go 1.21+) sobre el paquete log clásico?',
    options: [
      { text: 'Es más rápido por usar goroutines internas', correct: false, explanation: 'La ventaja no es de goroutines sino de estructura y handlers.' },
      { text: 'Logging estructurado con key-value pairs, niveles, y handlers intercambiables (JSON, text, custom)', correct: true, explanation: 'slog permite `slog.Info("usuario creado", "id", 42, "nombre", "Ana")` que produce logs estructurados. Podés cambiar el handler a JSON para producción sin cambiar el código. Además tiene niveles (Debug, Info, Warn, Error) y groups.' },
      { text: 'Solo agrega colores a la salida', correct: false, explanation: 'slog no es solo colores — es un rediseño completo del logging con estructura y niveles.' },
      { text: 'Reemplaza fmt.Println', correct: false, explanation: 'slog es para logging de aplicación. fmt.Println sigue existiendo para output general.' },
    ],
    difficulty: 'medium',
    concept: 'log/slog',
  },

  // ============================================================
  // MODULE 10 — Concurrency basics
  // ============================================================
  {
    id: 'rc-035',
    sourceModuleId: 10,
    question: '¿Qué pasa si main() termina antes de que una goroutine complete su trabajo?',
    options: [
      { text: 'La goroutine sigue corriendo en background', correct: false, explanation: 'Cuando main() termina, TODAS las goroutines se cancelan inmediatamente.' },
      { text: 'El programa termina y la goroutine se pierde — no hay output ni cleanup', correct: true, explanation: 'Cuando main() retorna, el runtime de Go mata todas las goroutines pendientes sin esperar. Por eso necesitás mecanismos de sincronización: channels, WaitGroup, etc. para asegurar que las goroutines completen.' },
      { text: 'Go automáticamente espera a todas las goroutines', correct: false, explanation: 'Go NO espera automáticamente. Es responsabilidad del programador sincronizar.' },
      { text: 'Panic: goroutine leak detected', correct: false, explanation: 'Go no detecta ni reporta goroutine leaks automáticamente. Simplemente termina.' },
    ],
    difficulty: 'easy',
    concept: 'goroutine lifecycle',
  },
  {
    id: 'rc-036',
    sourceModuleId: 10,
    question: '¿Cuál es la diferencia entre un channel buffered y uno unbuffered?\n\nch1 := make(chan int)    // unbuffered\nch2 := make(chan int, 5) // buffered',
    options: [
      { text: 'No hay diferencia — el buffer es solo una optimización interna', correct: false, explanation: 'Hay una diferencia FUNDAMENTAL en el comportamiento de send/receive.' },
      { text: 'Unbuffered bloquea al sender hasta que alguien recibe; buffered bloquea solo cuando el buffer está lleno', correct: true, explanation: 'Un channel unbuffered es un punto de sincronización: el send bloquea hasta que otro goroutine hace receive (y viceversa). Un buffered channel tiene capacidad: send solo bloquea cuando está lleno, receive cuando está vacío. Unbuffered = handshake, buffered = mailbox.' },
      { text: 'Unbuffered es más rápido', correct: false, explanation: 'No necesariamente. Depende del patrón de uso. Unbuffered tiene más sincronización.' },
      { text: 'Buffered channels no pueden cerrarse', correct: false, explanation: 'Ambos tipos de channels se pueden cerrar con close().' },
    ],
    difficulty: 'medium',
    concept: 'buffered vs unbuffered channels',
  },
  {
    id: 'rc-037',
    sourceModuleId: 10,
    question: '¿Para qué sirve `select` con channels?',
    options: [
      { text: 'Para ordenar los mensajes por prioridad', correct: false, explanation: 'select no ordena — elige aleatoriamente si hay múltiples cases listos.' },
      { text: 'Para esperar múltiples operaciones de channel simultáneamente y ejecutar la primera disponible', correct: true, explanation: '`select` es como switch pero para channels. Espera a que alguna operación de channel esté lista y ejecuta ese case. Si varios están listos, elige uno al azar. Con `default:` no bloquea. Es esencial para multiplexar comunicación entre goroutines.' },
      { text: 'Para filtrar mensajes de un channel', correct: false, explanation: 'select no filtra — ejecuta la primera operación disponible de cualquier channel.' },
      { text: 'Es equivalente a un SQL SELECT', correct: false, explanation: 'No tiene nada que ver con SQL. Es para operaciones con channels.' },
    ],
    difficulty: 'medium',
    concept: 'select',
  },
  {
    id: 'rc-038',
    sourceModuleId: 10,
    question: '¿Qué imprime este código?\n\nch := make(chan int, 2)\nch <- 1\nch <- 2\nfmt.Println(<-ch)\nfmt.Println(<-ch)',
    options: [
      { text: '2 luego 1 (LIFO)', correct: false, explanation: 'Los channels son FIFO — primero en entrar, primero en salir.' },
      { text: '1 luego 2 (FIFO)', correct: true, explanation: 'Los channels mantienen orden FIFO (First In, First Out). El primer valor enviado (1) es el primero en recibirse. Esto es posible sin goroutines extra porque el channel tiene buffer de 2.' },
      { text: 'Deadlock', correct: false, explanation: 'No hay deadlock porque el buffer es 2 — ambos sends completan sin bloquear.' },
      { text: 'Aleatorio', correct: false, explanation: 'Los channels siempre son FIFO. La aleatoriedad solo aparece en select entre múltiples channels.' },
    ],
    difficulty: 'easy',
    concept: 'channel FIFO',
  },

  // ============================================================
  // MODULE 11 — Advanced concurrency
  // ============================================================
  {
    id: 'rc-039',
    sourceModuleId: 11,
    question: '¿Qué problema resuelve sync.WaitGroup?',
    options: [
      { text: 'Limitar el número de goroutines activas', correct: false, explanation: 'Eso sería un semáforo. WaitGroup espera a que goroutines terminen.' },
      { text: 'Esperar a que un grupo de goroutines termine antes de continuar', correct: true, explanation: 'WaitGroup tiene tres métodos: Add(n) incrementa el contador, Done() lo decrementa (defer wg.Done()), Wait() bloquea hasta que el contador llega a 0. Es la forma estándar de "esperar a que todas terminen".' },
      { text: 'Proteger memoria compartida entre goroutines', correct: false, explanation: 'Eso es sync.Mutex. WaitGroup es para sincronización de completion.' },
      { text: 'Cancelar goroutines que toman demasiado tiempo', correct: false, explanation: 'Eso es context.WithTimeout. WaitGroup no cancela — espera.' },
    ],
    difficulty: 'easy',
    concept: 'sync.WaitGroup',
  },
  {
    id: 'rc-040',
    sourceModuleId: 11,
    question: '¿Por qué este código tiene un data race?\n\ncounter := 0\nfor i := 0; i < 1000; i++ {\n  go func() { counter++ }()\n}',
    options: [
      { text: 'Porque for no funciona con goroutines', correct: false, explanation: 'for con goroutines funciona bien. El problema es el acceso concurrente a counter.' },
      { text: 'Porque múltiples goroutines leen y escriben counter sin sincronización — counter++ NO es atómico', correct: true, explanation: 'counter++ es en realidad read-increment-write (3 operaciones). Si dos goroutines leen el mismo valor antes de escribir, una escritura se pierde. Soluciones: sync.Mutex, sync/atomic.AddInt64, o un channel.' },
      { text: 'Porque counter debería ser un puntero', correct: false, explanation: 'Usar puntero no soluciona el data race. El problema es acceso concurrente sin protección.' },
      { text: 'No hay data race — Go maneja esto automáticamente', correct: false, explanation: 'Go NO protege automáticamente contra data races. Usá `go run -race` para detectarlas.' },
    ],
    difficulty: 'medium',
    concept: 'data races',
  },
  {
    id: 'rc-041',
    sourceModuleId: 11,
    question: '¿Qué hace context.WithTimeout y por qué es importante?',
    options: [
      { text: 'Retrasa la ejecución de una función', correct: false, explanation: 'No retrasa — establece un deadline máximo de espera.' },
      { text: 'Crea un contexto que se cancela automáticamente después del timeout — permite cancelación cooperativa de goroutines', correct: true, explanation: '`ctx, cancel := context.WithTimeout(ctx, 5*time.Second)` crea un contexto que envía señal de cancelación a ctx.Done() después de 5 segundos. Las goroutines deben verificar `<-ctx.Done()` en un select para responder. Siempre llamá `defer cancel()` para liberar recursos.' },
      { text: 'Mata goroutines forzosamente después del timeout', correct: false, explanation: 'Context NO mata goroutines — envía una señal. Las goroutines deben cooperar y terminar ellas mismas.' },
      { text: 'Solo sirve para HTTP requests', correct: false, explanation: 'Se usa en HTTP, DB, gRPC, y cualquier operación que necesite un deadline.' },
    ],
    difficulty: 'hard',
    concept: 'context',
  },
  {
    id: 'rc-042',
    sourceModuleId: 11,
    question: '¿Qué es el patrón fan-out/fan-in en concurrencia?',
    options: [
      { text: 'Un tipo de load balancer', correct: false, explanation: 'Está relacionado pero es un patrón de concurrencia más específico.' },
      { text: 'Fan-out: distribuir trabajo a múltiples goroutines; Fan-in: unificar los resultados en un solo channel', correct: true, explanation: 'Fan-out: lanzás N goroutines que procesan items en paralelo (ej: N workers leyendo de un channel). Fan-in: los resultados de las N goroutines se envían a un solo channel que el consumidor lee. Combinados multiplican throughput manteniendo un punto de recolección simple.' },
      { text: 'Un patrón de error handling para goroutines', correct: false, explanation: 'No es de error handling — es de distribución y recolección de trabajo paralelo.' },
      { text: 'Crear goroutines que crean más goroutines recursivamente', correct: false, explanation: 'No es recursivo. Fan-out es distribución plana a N workers, fan-in es recolección en un punto.' },
    ],
    difficulty: 'hard',
    concept: 'fan-out/fan-in',
  },
];

export interface Source {
  name: string;
  url: string;
}

export interface ModuleInfo {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  duration: string;
  type: string;
  description: string;
  objectives: string[];
  sources: Source[];
}

export const modules: ModuleInfo[] = [
  {
    id: 1,
    title: 'Bienvenido a Go',
    subtitle: 'Historia, filosofía y tu primer programa',
    icon: '🐹',
    duration: '20 min',
    type: 'Teoría + Quiz + Playground',
    description: 'Conoce Go: por qué fue creado, su filosofía de simplicidad, y escribe tu primer programa.',
    objectives: [
      'Entender la historia y motivación detrás de Go',
      'Conocer la filosofía de diseño del lenguaje',
      'Escribir y ejecutar tu primer programa en Go',
      'Conocer el toolchain de Go (go run, go build, go fmt)',
    ],
    sources: [
      { name: 'Go at Google: Language Design in the Service of Software Engineering', url: 'https://go.dev/talks/2012/splash.article' },
      { name: 'The Go Programming Language Specification', url: 'https://go.dev/ref/spec' },
      { name: 'Effective Go', url: 'https://go.dev/doc/effective_go' },
      { name: 'Go: A Documentary', url: 'https://golang.design/history/' },
    ],
  },
  {
    id: 2,
    title: 'Tipos, Variables y Constantes',
    subtitle: 'El sistema de tipos de Go',
    icon: '🔒',
    duration: '25 min',
    type: 'Teoría + Playground + Quiz',
    description: 'Domina el sistema de tipos estático de Go: declaraciones, zero values, y el poder de iota.',
    objectives: [
      'Conocer los tipos básicos de Go (int, float64, string, bool, byte, rune)',
      'Declarar variables con var y el operador :=',
      'Entender zero values y por qué importan',
      'Usar constantes e iota para enumeraciones',
    ],
    sources: [
      { name: 'The Go Programming Language - Donovan & Kernighan, Cap. 2', url: 'https://www.gopl.io/' },
      { name: 'Go Specification: Types', url: 'https://go.dev/ref/spec#Types' },
      { name: 'Go by Example: Variables', url: 'https://gobyexample.com/variables' },
      { name: 'Effective Go: Names and Declarations', url: 'https://go.dev/doc/effective_go#names' },
    ],
  },
  {
    id: 3,
    title: 'Control de Flujo',
    subtitle: 'if, for, switch y defer',
    icon: '🔄',
    duration: '25 min',
    type: 'Teoría + Playground + Quiz',
    description: 'Go tiene un solo loop: for. Descubre cómo if, switch y defer hacen el código más limpio.',
    objectives: [
      'Usar if con init statements',
      'Dominar for como el único loop de Go',
      'Entender switch sin break automático',
      'Comprender defer y su orden LIFO',
    ],
    sources: [
      { name: 'The Go Programming Language - Donovan & Kernighan, Cap. 1', url: 'https://www.gopl.io/' },
      { name: 'Go by Example: For', url: 'https://gobyexample.com/for' },
      { name: 'Effective Go: Control structures', url: 'https://go.dev/doc/effective_go#control-structures' },
      { name: 'Go Specification: Statements', url: 'https://go.dev/ref/spec#Statements' },
    ],
  },
  {
    id: 4,
    title: 'Funciones',
    subtitle: 'Múltiples returns, closures y first-class',
    icon: '⚙️',
    duration: '25 min',
    type: 'Teoría + Playground + Quiz',
    description: 'Las funciones en Go son ciudadanos de primera clase: múltiples retornos, closures, variadic args.',
    objectives: [
      'Declarar funciones con múltiples valores de retorno',
      'Entender named returns y cuándo usarlos',
      'Crear funciones variadic',
      'Usar closures y funciones como valores',
    ],
    sources: [
      { name: 'The Go Programming Language - Donovan & Kernighan, Cap. 5', url: 'https://www.gopl.io/' },
      { name: 'Go by Example: Functions', url: 'https://gobyexample.com/functions' },
      { name: 'Go by Example: Closures', url: 'https://gobyexample.com/closures' },
      { name: 'Effective Go: Functions', url: 'https://go.dev/doc/effective_go#functions' },
    ],
  },
  {
    id: 5,
    title: 'Colecciones',
    subtitle: 'Arrays, Slices y Maps',
    icon: '📦',
    duration: '30 min',
    type: 'Teoría + DragDrop + Playground',
    description: 'Slices son el corazón de Go. Aprende cómo funcionan internamente y por qué son tan poderosos.',
    objectives: [
      'Diferenciar arrays (fijos) de slices (dinámicos)',
      'Entender la estructura interna de un slice (pointer, len, cap)',
      'Dominar append, copy y slice expressions',
      'Usar maps para almacenamiento clave-valor',
    ],
    sources: [
      { name: 'The Go Programming Language - Donovan & Kernighan, Cap. 4', url: 'https://www.gopl.io/' },
      { name: 'Go Blog: Go Slices usage and internals', url: 'https://go.dev/blog/slices-intro' },
      { name: 'Go by Example: Slices', url: 'https://gobyexample.com/slices' },
      { name: 'Go by Example: Maps', url: 'https://gobyexample.com/maps' },
    ],
  },
  {
    id: 6,
    title: 'Structs y Métodos',
    subtitle: 'Composición sobre herencia',
    icon: '🏗️',
    duration: '25 min',
    type: 'Teoría + Playground + Quiz',
    description: 'Go no tiene clases. Usa structs y métodos para modelar tu dominio con composición.',
    objectives: [
      'Declarar y usar structs',
      'Definir métodos con value y pointer receivers',
      'Entender embedding y promoción de métodos',
      'Aplicar composición en lugar de herencia',
    ],
    sources: [
      { name: 'The Go Programming Language - Donovan & Kernighan, Cap. 6', url: 'https://www.gopl.io/' },
      { name: 'Go by Example: Structs', url: 'https://gobyexample.com/structs' },
      { name: 'Effective Go: Methods', url: 'https://go.dev/doc/effective_go#methods' },
      { name: 'Go Specification: Struct types', url: 'https://go.dev/ref/spec#Struct_types' },
    ],
  },
  {
    id: 7,
    title: 'Interfaces y Polimorfismo',
    subtitle: 'El poder de las interfaces implícitas',
    icon: '🧩',
    duration: '30 min',
    type: 'Teoría + Scenario + Quiz',
    description: 'Las interfaces en Go son implícitas: no hay "implements". Esto cambia todo sobre el polimorfismo.',
    objectives: [
      'Entender interfaces implícitas (duck typing estático)',
      'Usar type assertions y type switches',
      'Conocer interfaces clave del stdlib (io.Reader, fmt.Stringer, error)',
      'Diseñar interfaces pequeñas y composables',
    ],
    sources: [
      { name: 'The Go Programming Language - Donovan & Kernighan, Cap. 7', url: 'https://www.gopl.io/' },
      { name: 'Effective Go: Interfaces', url: 'https://go.dev/doc/effective_go#interfaces' },
      { name: 'Go Specification: Interface types', url: 'https://go.dev/ref/spec#Interface_types' },
      { name: 'Go by Example: Interfaces', url: 'https://gobyexample.com/interfaces' },
    ],
  },
  {
    id: 8,
    title: 'Manejo de Errores',
    subtitle: 'Errores como valores, no excepciones',
    icon: '🛡️',
    duration: '25 min',
    type: 'Teoría + Playground + Quiz',
    description: 'Go no tiene try/catch. Los errores son valores que se retornan y se manejan explícitamente.',
    objectives: [
      'Entender la interfaz error y el patrón if err != nil',
      'Crear errores personalizados con errors.New y fmt.Errorf',
      'Usar errors.Is y errors.As para inspección',
      'Aplicar error wrapping con %w',
    ],
    sources: [
      { name: 'Go Blog: Error handling and Go', url: 'https://go.dev/blog/error-handling-and-go' },
      { name: 'Go Blog: Working with Errors in Go 1.13', url: 'https://go.dev/blog/go1.13-errors' },
      { name: 'The Go Programming Language - Donovan & Kernighan, Cap. 5.4', url: 'https://www.gopl.io/' },
      { name: 'Effective Go: Errors', url: 'https://go.dev/doc/effective_go#errors' },
    ],
  },
  {
    id: 9,
    title: 'Paquetes, Módulos y Tooling',
    subtitle: 'Organización y herramientas de Go',
    icon: '📁',
    duration: '20 min',
    type: 'Teoría + DragDrop + Quiz',
    description: 'Aprende a organizar tu código en paquetes, manejar dependencias con modules, y usar las herramientas.',
    objectives: [
      'Entender paquetes y visibilidad (mayúscula = exportado)',
      'Crear y gestionar Go modules (go.mod, go.sum)',
      'Usar las herramientas esenciales: go fmt, go vet, go test, go build',
      'Organizar la estructura de un proyecto Go',
    ],
    sources: [
      { name: 'Go Blog: Using Go Modules', url: 'https://go.dev/blog/using-go-modules' },
      { name: 'Go Modules Reference', url: 'https://go.dev/ref/mod' },
      { name: 'How to Write Go Code', url: 'https://go.dev/doc/code' },
      { name: 'Effective Go: Package names', url: 'https://go.dev/doc/effective_go#package-names' },
    ],
  },
  {
    id: 10,
    title: 'Concurrencia: Goroutines y Channels',
    subtitle: "Don't communicate by sharing memory",
    icon: '⚡',
    duration: '35 min',
    type: 'Teoría + Scenario + Playground',
    description: 'El superpoder de Go: goroutines livianas y channels para comunicación segura entre procesos.',
    objectives: [
      'Lanzar goroutines y entender su modelo de ejecución',
      'Usar channels para comunicación entre goroutines',
      'Diferenciar unbuffered vs buffered channels',
      'Usar select para multiplexar channels',
    ],
    sources: [
      { name: 'The Go Programming Language - Donovan & Kernighan, Cap. 8', url: 'https://www.gopl.io/' },
      { name: 'Effective Go: Concurrency', url: 'https://go.dev/doc/effective_go#concurrency' },
      { name: 'Go Wiki: LearnConcurrency', url: 'https://go.dev/wiki/LearnConcurrency' },
      { name: 'Go by Example: Goroutines', url: 'https://gobyexample.com/goroutines' },
    ],
  },
  {
    id: 11,
    title: 'Concurrencia Avanzada',
    subtitle: 'Patterns, sync y context',
    icon: '🧬',
    duration: '35 min',
    type: 'Teoría + Scenario + Timer',
    description: 'Domina los patrones avanzados: WaitGroup, Mutex, context, y patterns como fan-out/fan-in.',
    objectives: [
      'Usar sync.WaitGroup y sync.Mutex para sincronización',
      'Entender el paquete context para cancelación y timeouts',
      'Implementar patrones: fan-in, fan-out, pipeline, worker pool',
      'Detectar y prevenir race conditions',
    ],
    sources: [
      { name: 'The Go Programming Language - Donovan & Kernighan, Cap. 9', url: 'https://www.gopl.io/' },
      { name: 'Go Blog: Go Concurrency Patterns', url: 'https://go.dev/blog/pipelines' },
      { name: 'Go Blog: Context', url: 'https://go.dev/blog/context' },
      { name: 'Google Go Style: Best Practices', url: 'https://google.github.io/styleguide/go/best-practices.html' },
    ],
  },
  {
    id: 12,
    title: 'APIs REST y Testing',
    subtitle: 'Construyendo y testeando APIs',
    icon: '🌐',
    duration: '30 min',
    type: 'Teoría + Quiz + Playground',
    description: 'Construye APIs REST con net/http y aprende testing idiomático con table-driven tests.',
    objectives: [
      'Crear HTTP handlers con net/http',
      'Codificar y decodificar JSON',
      'Escribir tests con el paquete testing',
      'Implementar table-driven tests y benchmarks',
    ],
    sources: [
      { name: 'Go Doc: Writing Web Applications', url: 'https://go.dev/doc/articles/wiki/' },
      { name: 'Go by Example: HTTP Server', url: 'https://gobyexample.com/http-server' },
      { name: 'Go by Example: Testing', url: 'https://gobyexample.com/testing-and-benchmarking' },
      { name: 'Practical Go: Dave Cheney', url: 'https://dave.cheney.net/practical-go/presentations/qcon-china.html' },
    ],
  },
];

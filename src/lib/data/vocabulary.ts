export interface VocabularyTerm {
  term: string;
  definition: string;
  module: number;
  category: string;
}

export const vocabulary: VocabularyTerm[] = [
  // Módulo 1 - Bienvenido a Go
  { term: 'Gopher', definition: 'La mascota de Go y el nombre con el que se identifican los programadores de Go.', module: 1, category: 'Cultura' },
  { term: 'go run', definition: 'Comando que compila y ejecuta un programa Go en un solo paso.', module: 1, category: 'Toolchain' },
  { term: 'go build', definition: 'Comando que compila un programa Go a un binario ejecutable.', module: 1, category: 'Toolchain' },
  { term: 'package main', definition: 'El paquete especial que define un programa ejecutable en Go.', module: 1, category: 'Sintaxis' },

  // Módulo 2 - Tipos, Variables y Constantes
  { term: 'Zero Value', definition: 'El valor por defecto que Go asigna a una variable no inicializada (0, "", false, nil).', module: 2, category: 'Tipos' },
  { term: 'Short Declaration (:=)', definition: 'Operador que declara e inicializa una variable infiriendo el tipo automáticamente.', module: 2, category: 'Sintaxis' },
  { term: 'iota', definition: 'Generador de constantes que se incrementa automáticamente dentro de un bloque const.', module: 2, category: 'Constantes' },
  { term: 'rune', definition: 'Alias de int32, representa un code point Unicode. Es el tipo para caracteres individuales.', module: 2, category: 'Tipos' },

  // Módulo 3 - Control de Flujo
  { term: 'defer', definition: 'Pospone la ejecución de una función hasta que la función contenedora retorne. Orden LIFO.', module: 3, category: 'Control' },
  { term: 'Init Statement', definition: 'Declaración opcional antes de la condición en if y switch (ej: if err := f(); err != nil).', module: 3, category: 'Sintaxis' },
  { term: 'fallthrough', definition: 'Keyword que fuerza la ejecución del siguiente case en un switch (no es el default en Go).', module: 3, category: 'Control' },

  // Módulo 4 - Funciones
  { term: 'Closure', definition: 'Función que captura variables de su scope contenedor, manteniéndolas vivas.', module: 4, category: 'Funciones' },
  { term: 'Variadic Function', definition: 'Función que acepta un número variable de argumentos usando ...tipo.', module: 4, category: 'Funciones' },
  { term: 'Named Return', definition: 'Valores de retorno con nombre que pueden usarse como variables locales y retornarse con return vacío.', module: 4, category: 'Funciones' },
  { term: 'First-class Function', definition: 'Funciones que pueden ser asignadas a variables, pasadas como argumentos y retornadas.', module: 4, category: 'Funciones' },

  // Módulo 5 - Colecciones
  { term: 'Slice', definition: 'Vista dinámica sobre un array. Tiene pointer, length y capacity. Es la colección más usada en Go.', module: 5, category: 'Colecciones' },
  { term: 'append()', definition: 'Función builtin que agrega elementos a un slice, potencialmente creando un nuevo array subyacente.', module: 5, category: 'Colecciones' },
  { term: 'make()', definition: 'Función builtin para crear slices, maps y channels con tamaño/capacidad inicial.', module: 5, category: 'Colecciones' },
  { term: 'Map', definition: 'Estructura de datos clave-valor (hash table). Las claves deben ser comparables.', module: 5, category: 'Colecciones' },

  // Módulo 6 - Structs y Métodos
  { term: 'Struct', definition: 'Tipo compuesto que agrupa campos con nombre. El equivalente a una clase sin herencia.', module: 6, category: 'Tipos' },
  { term: 'Pointer Receiver', definition: 'Método que recibe un puntero al struct, permitiendo modificar el original.', module: 6, category: 'Métodos' },
  { term: 'Embedding', definition: 'Incluir un struct dentro de otro sin nombre de campo, promoviendo sus métodos automáticamente.', module: 6, category: 'Composición' },

  // Módulo 7 - Interfaces
  { term: 'Interface', definition: 'Conjunto de métodos que un tipo debe implementar. En Go son implícitas: no hay "implements".', module: 7, category: 'Interfaces' },
  { term: 'Duck Typing', definition: '"Si camina como pato y grazna como pato, es un pato." Así funcionan las interfaces en Go.', module: 7, category: 'Interfaces' },
  { term: 'Type Assertion', definition: 'Operación que extrae el valor concreto de una interface: val, ok := i.(Tipo)', module: 7, category: 'Interfaces' },
  { term: 'any', definition: 'Alias de interface{} (Go 1.18+). Representa cualquier tipo.', module: 7, category: 'Interfaces' },

  // Módulo 8 - Errores
  { term: 'error', definition: 'Interfaz con un solo método Error() string. El mecanismo estándar de errores en Go.', module: 8, category: 'Errores' },
  { term: 'Sentinel Error', definition: 'Error predefinido como variable (ej: io.EOF, sql.ErrNoRows) para comparación directa.', module: 8, category: 'Errores' },
  { term: 'Error Wrapping', definition: 'Envolver un error con contexto usando fmt.Errorf("...: %w", err) para trazabilidad.', module: 8, category: 'Errores' },

  // Módulo 9 - Paquetes y Módulos
  { term: 'go.mod', definition: 'Archivo que define un módulo Go: su path, versión de Go y dependencias.', module: 9, category: 'Módulos' },
  { term: 'Exported', definition: 'Un identificador que empieza con mayúscula es público/exportado. Minúscula = privado al paquete.', module: 9, category: 'Paquetes' },
  { term: 'go vet', definition: 'Herramienta de análisis estático que detecta errores comunes que el compilador no atrapa.', module: 9, category: 'Toolchain' },

  // Módulo 10 - Concurrencia
  { term: 'Goroutine', definition: 'Hilo liviano gestionado por el runtime de Go. Se lanza con la keyword "go".', module: 10, category: 'Concurrencia' },
  { term: 'Channel', definition: 'Conducto tipado para comunicación entre goroutines. Envía y recibe valores de forma segura.', module: 10, category: 'Concurrencia' },
  { term: 'select', definition: 'Statement que permite esperar en múltiples operaciones de channel simultáneamente.', module: 10, category: 'Concurrencia' },
  { term: 'Buffered Channel', definition: 'Channel con capacidad interna. No bloquea al enviar hasta que el buffer esté lleno.', module: 10, category: 'Concurrencia' },

  // Módulo 11 - Concurrencia Avanzada
  { term: 'sync.WaitGroup', definition: 'Contador que permite esperar a que un grupo de goroutines termine su ejecución.', module: 11, category: 'Sincronización' },
  { term: 'sync.Mutex', definition: 'Mutual exclusion lock. Protege secciones críticas de acceso concurrente.', module: 11, category: 'Sincronización' },
  { term: 'context.Context', definition: 'Mecanismo para propagar deadlines, cancelación y valores entre goroutines.', module: 11, category: 'Concurrencia' },
  { term: 'Race Condition', definition: 'Bug donde el resultado depende del orden impredecible de ejecución de goroutines.', module: 11, category: 'Concurrencia' },

  // Módulo 12 - APIs y Testing
  { term: 'http.Handler', definition: 'Interfaz con ServeHTTP(w, r) que define cómo manejar una petición HTTP.', module: 12, category: 'HTTP' },
  { term: 'Table-Driven Test', definition: 'Patrón idiomático de Go: definir casos de test en un slice y recorrerlos con un loop.', module: 12, category: 'Testing' },
  { term: 'httptest', definition: 'Paquete del stdlib para testear HTTP handlers sin levantar un servidor real.', module: 12, category: 'Testing' },
];

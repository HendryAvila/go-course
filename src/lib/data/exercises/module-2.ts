import type { Exercise, WorkedExample } from './types';

// =============================================================================
// Module 2: Tipos, Variables y Constantes
// Topics: int, float64, string, bool, byte, rune, var, :=, zero values,
//         const, iota
// =============================================================================

export const workedExamples: WorkedExample[] = [
	{
		id: 'm2-we-001',
		moduleId: 2,
		title: 'Zero values: lo que Go te regala gratis',
		description:
			'Exploramos cómo Go inicializa automáticamente las variables y por qué eso elimina una clase entera de bugs.',
		steps: [
			{
				code: `package main

import "fmt"

func main() {
	var entero int
	var flotante float64
	var texto string
	var booleano bool

	fmt.Println(entero, flotante, texto, booleano)
}`,
				explanation:
					'Declaramos 4 variables con `var` sin asignar valor. En Go, toda variable tiene un "zero value" por defecto: `0` para números, `""` para strings, `false` para bool. Nunca hay variables sin inicializar.',
				highlightLines: [6, 7, 8, 9],
			},
			{
				code: `package main

import "fmt"

func main() {
	var entero int
	var flotante float64
	var texto string
	var booleano bool

	fmt.Printf("int:     %d (zero value)\n", entero)
	fmt.Printf("float64: %f (zero value)\n", flotante)
	fmt.Printf("string:  %q (zero value)\n", texto)
	fmt.Printf("bool:    %t (zero value)\n", booleano)
}`,
				explanation:
					'Usamos `Printf` para ver cada zero value con su verbo: `%d` enteros, `%f` flotantes, `%q` strings con comillas (muestra `""` vacío), `%t` booleanos. Nota que el string vacío es `""`, no `nil`.',
				highlightLines: [11, 12, 13, 14],
			},
			{
				code: `package main

import "fmt"

func main() {
	var entero int
	var flotante float64
	var texto string
	var booleano bool

	fmt.Printf("int:     %d (zero value)\n", entero)
	fmt.Printf("float64: %f (zero value)\n", flotante)
	fmt.Printf("string:  %q (zero value)\n", texto)
	fmt.Printf("bool:    %t (zero value)\n", booleano)

	// Short declaration con tipo inferido
	nombre := "Gopher"       // Go infiere string
	edad := 42               // Go infiere int
	promedio := 9.8           // Go infiere float64
	activo := true            // Go infiere bool

	fmt.Printf("\nnombre:   %s (tipo: %T)\n", nombre, nombre)
	fmt.Printf("edad:     %d (tipo: %T)\n", edad, edad)
	fmt.Printf("promedio: %.1f (tipo: %T)\n", promedio, promedio)
	fmt.Printf("activo:   %t (tipo: %T)\n", activo, activo)
}`,
				explanation:
					'Con `:=` Go infiere el tipo automáticamente. Usamos `%T` para confirmar los tipos inferidos. La regla: `:=` solo funciona dentro de funciones, `var` se puede usar en cualquier parte.',
				highlightLines: [17, 18, 19, 20],
			},
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

func main() {
	var entero int
	var flotante float64
	var texto string
	var booleano bool

	fmt.Printf("int:     %d (zero value)\n", entero)
	fmt.Printf("float64: %f (zero value)\n", flotante)
	fmt.Printf("string:  %q (zero value)\n", texto)
	fmt.Printf("bool:    %t (zero value)\n", booleano)

	// Short declaration con tipo inferido
	nombre := "Gopher"
	edad := 42
	promedio := 9.8
	activo := true

	fmt.Printf("\nnombre:   %s (tipo: %T)\n", nombre, nombre)
	fmt.Printf("edad:     %d (tipo: %T)\n", edad, edad)
	fmt.Printf("promedio: %.1f (tipo: %T)\n", promedio, promedio)
	fmt.Printf("activo:   %t (tipo: %T)\n", activo, activo)
}`,
	},
	{
		id: 'm2-we-002',
		moduleId: 2,
		title: 'Constantes e iota: enumeraciones en Go',
		description:
			'Aprendemos a usar constantes y el mágico `iota` para crear enumeraciones de forma elegante.',
		steps: [
			{
				code: `package main

import "fmt"

const pi = 3.14159

func main() {
	fmt.Println("Pi:", pi)
}`,
				explanation:
					'Las constantes en Go se declaran con `const`. No necesitan tipo explícito — Go las trata como "untyped constants" con precisión arbitraria hasta que las usas en contexto.',
				highlightLines: [5],
			},
			{
				code: `package main

import "fmt"

const pi = 3.14159

const (
	lunes     = 1
	martes    = 2
	miercoles = 3
)

func main() {
	fmt.Println("Pi:", pi)
	fmt.Println("Martes es el día:", martes)
}`,
				explanation:
					'Podemos agrupar constantes en un bloque `const(...)`. Pero asignar números manualmente es tedioso y propenso a errores. Aquí entra `iota`.',
				highlightLines: [7, 8, 9, 10],
			},
			{
				code: `package main

import "fmt"

const pi = 3.14159

type DiaSemana int

const (
	Lunes DiaSemana = iota // 0
	Martes                 // 1
	Miercoles              // 2
	Jueves                 // 3
	Viernes                // 4
	Sabado                 // 5
	Domingo                // 6
)

func main() {
	fmt.Println("Pi:", pi)
	fmt.Printf("Lunes=%d, Viernes=%d, Domingo=%d\n", Lunes, Viernes, Domingo)
}`,
				explanation:
					'`iota` empieza en 0 y se incrementa en 1 por cada constante del bloque. Lo combinamos con un tipo personalizado `DiaSemana` para tener enumeraciones type-safe. Cada línea después de `iota` repite implícitamente la expresión.',
				highlightLines: [7, 10, 11, 12],
			},
			{
				code: `package main

import "fmt"

const pi = 3.14159

type DiaSemana int

const (
	Lunes DiaSemana = iota
	Martes
	Miercoles
	Jueves
	Viernes
	Sabado
	Domingo
)

// iota con expresiones: tamaños de almacenamiento
const (
	_  = iota             // 0 descartado con blank identifier
	KB = 1 << (10 * iota) // 1 << 10 = 1024
	MB                    // 1 << 20 = 1048576
	GB                    // 1 << 30
)

func main() {
	fmt.Println("Pi:", pi)
	fmt.Printf("Lunes=%d, Viernes=%d, Domingo=%d\n", Lunes, Viernes, Domingo)
	fmt.Printf("KB=%d, MB=%d, GB=%d\n", KB, MB, GB)
}`,
				explanation:
					'El poder real de `iota` es combinarlo con expresiones. Aquí usamos bit shifting (`<<`) para crear constantes de KB, MB, GB. El `_` (blank identifier) descarta el valor 0. Cada línea repite la expresión `1 << (10 * iota)` con el iota incrementado.',
				highlightLines: [21, 22, 23, 24],
			},
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

type DiaSemana int

const (
	Lunes DiaSemana = iota
	Martes
	Miercoles
	Jueves
	Viernes
	Sabado
	Domingo
)

const (
	_  = iota
	KB = 1 << (10 * iota)
	MB
	GB
)

func main() {
	fmt.Printf("Lunes=%d, Viernes=%d, Domingo=%d\n", Lunes, Viernes, Domingo)
	fmt.Printf("KB=%d, MB=%d, GB=%d\n", KB, MB, GB)

	// Experimenta: ¿qué pasa si agregas TB después de GB?
}`,
	},
];

export const exercises: Exercise[] = [
	// --- Tier 1: Completion ---
	{
		id: 'm2-ex-001',
		moduleId: 2,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Declaraciones con var y :=',
		description:
			'Completa el programa declarando variables de dos formas: con `var` (explícito) y con `:=` (inferido).',
		baseCode: `package main

import "fmt"

func main() {
	// Declara con var explícito
	var ciudad string = "___"
	var temperatura float64 = ___

	// Declara con := (inferido)
	// TODO: declara 'humedad' como entero con valor 72
	// TODO: declara 'lloviendo' como bool con valor true

	fmt.Printf("Ciudad: %s\n", ciudad)
	fmt.Printf("Temperatura: %.1f°C\n", temperatura)
	fmt.Printf("Humedad: %d%%\n", humedad)
	fmt.Printf("¿Lloviendo? %t\n", lloviendo)
}`,
		solution: `package main

import "fmt"

func main() {
	// Declara con var explícito
	var ciudad string = "Lima"
	var temperatura float64 = 22.5

	// Declara con := (inferido)
	humedad := 72
	lloviendo := true

	fmt.Printf("Ciudad: %s\n", ciudad)
	fmt.Printf("Temperatura: %.1f°C\n", temperatura)
	fmt.Printf("Humedad: %d%%\n", humedad)
	fmt.Printf("¿Lloviendo? %t\n", lloviendo)
}`,
		expectedOutput:
			'Ciudad: Lima\nTemperatura: 22.5°C\nHumedad: 72%\n¿Lloviendo? true',
		hints: [
			'Para := solo escribe: humedad := 72 — Go infiere que es int',
			'Los booleanos se declaran igual: lloviendo := true — Go infiere bool',
		],
		points: 3,
		concepts: ['var', 'short-declaration', 'type-inference'],
	},
	{
		id: 'm2-ex-002',
		moduleId: 2,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Constantes con iota',
		description:
			'Completa la enumeración de estaciones del año usando `iota` y luego imprime los valores.',
		baseCode: `package main

import "fmt"

type Estacion int

const (
	Primavera Estacion = iota
	// TODO: Agrega Verano, Otono, Invierno
)

func main() {
	// TODO: Imprime cada estación con su valor numérico
	// Formato: "Primavera = 0", "Verano = 1", etc.
}`,
		solution: `package main

import "fmt"

type Estacion int

const (
	Primavera Estacion = iota
	Verano
	Otono
	Invierno
)

func main() {
	fmt.Printf("Primavera = %d\n", Primavera)
	fmt.Printf("Verano = %d\n", Verano)
	fmt.Printf("Otoño = %d\n", Otono)
	fmt.Printf("Invierno = %d\n", Invierno)
}`,
		expectedOutput:
			'Primavera = 0\nVerano = 1\nOtoño = 2\nInvierno = 3',
		hints: [
			'Después de la primera constante con iota, las siguientes repiten la misma expresión automáticamente — solo pon el nombre',
			'iota empieza en 0 y se incrementa en 1 por cada línea dentro del bloque const',
		],
		points: 3,
		concepts: ['const', 'iota', 'custom-types'],
	},

	// --- Tier 2: Fill-in-blank ---
	{
		id: 'm2-ex-003',
		moduleId: 2,
		tier: 'fill-in-blank',
		difficulty: 'intermediate',
		title: 'Zero values y conversión de tipos',
		description:
			'Rellena los blancos para demostrar zero values y conversión explícita entre tipos numéricos.',
		baseCode: `package main

import "fmt"

func main() {
	// Zero values
	var cantidad ___   // zero value: 0
	var precio ___     // zero value: 0.0
	var nombre ___     // zero value: ""
	var activo ___     // zero value: false

	fmt.Printf("cantidad=%d precio=%.2f nombre=%q activo=%t\n",
		cantidad, precio, nombre, activo)

	// Conversión de tipos
	entero := 42
	flotante := ___(entero)       // Convertir int a float64
	texto := fmt.Sprintf("%d", ___) // Convertir int a string

	fmt.Printf("entero=%d flotante=%.1f texto=%q\n",
		entero, flotante, texto)
}`,
		solution: `package main

import "fmt"

func main() {
	// Zero values
	var cantidad int
	var precio float64
	var nombre string
	var activo bool

	fmt.Printf("cantidad=%d precio=%.2f nombre=%q activo=%t\n",
		cantidad, precio, nombre, activo)

	// Conversión de tipos
	entero := 42
	flotante := float64(entero)
	texto := fmt.Sprintf("%d", entero)

	fmt.Printf("entero=%d flotante=%.1f texto=%q\n",
		entero, flotante, texto)
}`,
		expectedOutput:
			'cantidad=0 precio=0.00 nombre="" activo=false\nentero=42 flotante=42.0 texto="42"',
		hints: [
			'Los tipos básicos son: int, float64, string, bool. Cada uno tiene su zero value',
			'En Go la conversión es explícita: float64(miEntero). No hay casting implícito como en C',
		],
		points: 4,
		concepts: ['zero-values', 'type-conversion', 'var-declaration'],
	},

	// --- Tier 3: Debugging ---
	{
		id: 'm2-ex-004',
		moduleId: 2,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'Bugs en declaraciones y tipos',
		description:
			'Este programa tiene 3 errores relacionados con tipos y declaraciones. Encuéntralos y corrígelos.',
		baseCode: `package main

import "fmt"

func main() {
	var edad int = "25"
	peso := 70.5
	altura := 1.75

	imc := peso / (altura * altura)
	fmt.Printf("Edad: %d años\n", edad)
	fmt.Printf("IMC: %.1f\n", imc)

	edad := 26
	fmt.Printf("Edad actualizada: %d\n", edad)
}`,
		solution: `package main

import "fmt"

func main() {
	var edad int = 25
	peso := 70.5
	altura := 1.75

	imc := peso / (altura * altura)
	fmt.Printf("Edad: %d años\n", edad)
	fmt.Printf("IMC: %.1f\n", imc)

	edad = 26
	fmt.Printf("Edad actualizada: %d\n", edad)
}`,
		expectedOutput: 'Edad: 25 años\nIMC: 23.0\nEdad actualizada: 26',
		hints: [
			'Revisa los tipos: ¿puedes asignar un string a una variable declarada como int?',
			'Error 1: "25" es string, no int. Error 2: No puedes usar := para re-declarar una variable que ya existe en el mismo scope — usa = para reasignar',
		],
		metacognitivePrompt:
			'¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['type-mismatch', 'redeclaration', 'assignment-vs-declaration'],
	},
];

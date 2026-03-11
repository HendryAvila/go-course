import type { Exercise, WorkedExample } from './types';

// =============================================================================
// Module 3: Control de Flujo
// Topics: if with init, for (classic, range, range over integers Go 1.22+),
//         switch, defer LIFO
// =============================================================================

export const workedExamples: WorkedExample[] = [
	{
		id: 'm3-we-001',
		moduleId: 3,
		title: 'El for es el único loop de Go',
		description:
			'Exploramos las múltiples caras del `for`: clásico, while-style, infinito, range sobre slices y range over integers (Go 1.22+).',
		steps: [
			{
				code: `package main

import "fmt"

func main() {
	// For clásico (estilo C)
	for i := 0; i < 5; i++ {
		fmt.Printf("i=%d ", i)
	}
	fmt.Println()
}`,
				explanation:
					'El for clásico tiene 3 partes: init, condición, post. Nota que NO hay paréntesis alrededor de la condición — en Go las llaves `{}` son obligatorias pero los paréntesis no se usan.',
				highlightLines: [7],
			},
			{
				code: `package main

import "fmt"

func main() {
	// For clásico
	for i := 0; i < 5; i++ {
		fmt.Printf("i=%d ", i)
	}
	fmt.Println()

	// While-style (solo condición)
	contador := 0
	for contador < 3 {
		fmt.Printf("c=%d ", contador)
		contador++
	}
	fmt.Println()
}`,
				explanation:
					'Si omites init y post, el `for` se comporta como un `while`. Go no tiene la keyword `while` — `for` hace todo. Menos keywords, mismo poder.',
				highlightLines: [14],
			},
			{
				code: `package main

import "fmt"

func main() {
	// For clásico
	for i := 0; i < 5; i++ {
		fmt.Printf("i=%d ", i)
	}
	fmt.Println()

	// While-style
	contador := 0
	for contador < 3 {
		fmt.Printf("c=%d ", contador)
		contador++
	}
	fmt.Println()

	// Range sobre slice
	frutas := []string{"manzana", "banana", "cereza"}
	for idx, fruta := range frutas {
		fmt.Printf("[%d] %s\n", idx, fruta)
	}
}`,
				explanation:
					'`range` itera sobre colecciones devolviendo índice y valor. Si no necesitas el índice, usas `_` como blank identifier: `for _, fruta := range frutas`.',
				highlightLines: [21, 22],
			},
			{
				code: `package main

import "fmt"

func main() {
	// For clásico
	for i := 0; i < 5; i++ {
		fmt.Printf("i=%d ", i)
	}
	fmt.Println()

	// While-style
	contador := 0
	for contador < 3 {
		fmt.Printf("c=%d ", contador)
		contador++
	}
	fmt.Println()

	// Range sobre slice
	frutas := []string{"manzana", "banana", "cereza"}
	for idx, fruta := range frutas {
		fmt.Printf("[%d] %s\n", idx, fruta)
	}

	// Range over integers (Go 1.22+)
	fmt.Print("Countdown: ")
	for i := range 5 {
		fmt.Printf("%d ", 4-i)
	}
	fmt.Println("¡Despegue!")
}`,
				explanation:
					'Desde Go 1.22 puedes hacer `range N` para iterar de 0 a N-1. Es más limpio que el for clásico cuando solo necesitas contar. Aquí lo usamos para un countdown.',
				highlightLines: [28, 29],
			},
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

func main() {
	// For clásico
	for i := 0; i < 5; i++ {
		fmt.Printf("i=%d ", i)
	}
	fmt.Println()

	// While-style
	contador := 0
	for contador < 3 {
		fmt.Printf("c=%d ", contador)
		contador++
	}
	fmt.Println()

	// Range sobre slice
	frutas := []string{"manzana", "banana", "cereza"}
	for idx, fruta := range frutas {
		fmt.Printf("[%d] %s\n", idx, fruta)
	}

	// Range over integers (Go 1.22+)
	fmt.Print("Countdown: ")
	for i := range 5 {
		fmt.Printf("%d ", 4-i)
	}
	fmt.Println("¡Despegue!")
}`,
	},
	{
		id: 'm3-we-002',
		moduleId: 3,
		title: 'defer: ejecutar al salir (LIFO)',
		description:
			'Entendemos cómo `defer` pospone la ejecución hasta que la función retorna, y por qué el orden es LIFO (último en entrar, primero en salir).',
		steps: [
			{
				code: `package main

import "fmt"

func main() {
	fmt.Println("inicio")
	defer fmt.Println("esto se ejecuta al final")
	fmt.Println("medio")
}`,
				explanation:
					'`defer` programa una llamada para que se ejecute justo antes de que la función retorne. Aunque la línea está en el medio del código, se ejecuta al final. Muy útil para cerrar archivos, conexiones, etc.',
				highlightLines: [7],
			},
			{
				code: `package main

import "fmt"

func main() {
	fmt.Println("inicio")

	defer fmt.Println("primero en defer (último en ejecutar)")
	defer fmt.Println("segundo en defer")
	defer fmt.Println("tercero en defer (primero en ejecutar)")

	fmt.Println("fin del código normal")
}`,
				explanation:
					'Cuando hay múltiples `defer`, se ejecutan en orden LIFO (Last In, First Out) — como una pila. El último defer registrado se ejecuta primero. Esto es intencional: permite "anidar" recursos donde el último abierto se cierra primero.',
				highlightLines: [8, 9, 10],
			},
			{
				code: `package main

import "fmt"

func main() {
	fmt.Println("inicio")

	defer fmt.Println("primero en defer (último en ejecutar)")
	defer fmt.Println("segundo en defer")
	defer fmt.Println("tercero en defer (primero en ejecutar)")

	fmt.Println("fin del código normal")

	// Patrón común: defer con loop
	fmt.Println("\n--- Countdown con defer ---")
	for i := range 5 {
		defer fmt.Printf("%d ", i)
	}
	fmt.Println("¡Lanzando defers!")
}`,
				explanation:
					'Cada iteración del loop registra un `defer` separado. Como es LIFO, se imprimen en orden inverso: 4, 3, 2, 1, 0. Ten cuidado con defer dentro de loops en código real — puede acumular muchos defers en funciones largas.',
				highlightLines: [16, 17],
			},
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

func main() {
	fmt.Println("inicio")

	defer fmt.Println("primero en defer (último en ejecutar)")
	defer fmt.Println("segundo en defer")
	defer fmt.Println("tercero en defer (primero en ejecutar)")

	fmt.Println("fin del código normal")

	// Patrón: defer con loop
	fmt.Println("\n--- Countdown con defer ---")
	for i := range 5 {
		defer fmt.Printf("%d ", i)
	}
	fmt.Println("¡Lanzando defers!")
}`,
	},
];

export const exercises: Exercise[] = [
	// --- Tier 1: Completion ---
	{
		id: 'm3-ex-001',
		moduleId: 3,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Clasificador de notas',
		description:
			'Completa el programa que clasifica una nota numérica usando `if` con init statement y `switch`.',
		baseCode: `package main

import "fmt"

func clasificar(nota int) string {
	// TODO: Usa switch para retornar:
	// 10: "Excelente"
	// 8, 9: "Muy bien"
	// 6, 7: "Aprobado"
	// default: "Reprobado"
	return ""
}

func main() {
	notas := []int{10, 8, 6, 4}

	for _, n := range notas {
		// TODO: Usa if con init statement para validar
		// que la nota esté entre 0 y 10 antes de clasificar
		// if resultado := clasificar(n); ... {
		fmt.Printf("Nota %d: ???\n", n)
	}
}`,
		solution: `package main

import "fmt"

func clasificar(nota int) string {
	switch nota {
	case 10:
		return "Excelente"
	case 8, 9:
		return "Muy bien"
	case 6, 7:
		return "Aprobado"
	default:
		return "Reprobado"
	}
}

func main() {
	notas := []int{10, 8, 6, 4}

	for _, n := range notas {
		if resultado := clasificar(n); n >= 0 && n <= 10 {
			fmt.Printf("Nota %d: %s\n", n, resultado)
		} else {
			fmt.Printf("Nota %d: fuera de rango\n", n)
		}
	}
}`,
		expectedOutput:
			'Nota 10: Excelente\nNota 8: Muy bien\nNota 6: Aprobado\nNota 4: Reprobado',
		hints: [
			'En switch de Go no necesitas break — cada case termina automáticamente. Puedes listar múltiples valores: case 8, 9:',
			'El if con init statement tiene la forma: if variable := expresion; condicion { ... }. La variable solo existe dentro del if/else.',
		],
		points: 3,
		concepts: ['switch', 'if-init', 'range'],
	},
	{
		id: 'm3-ex-002',
		moduleId: 3,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Tabla de multiplicar con range',
		description:
			'Completa el programa que imprime la tabla de multiplicar de un número usando range over integers (Go 1.22+).',
		baseCode: `package main

import "fmt"

func main() {
	numero := 7

	fmt.Printf("Tabla del %d:\n", numero)
	// TODO: Usa "for i := range 11" para imprimir
	// la tabla del 7 (de 0 a 10)
	// Formato: "7 x 0 = 0", "7 x 1 = 7", etc.
}`,
		solution: `package main

import "fmt"

func main() {
	numero := 7

	fmt.Printf("Tabla del %d:\n", numero)
	for i := range 11 {
		fmt.Printf("%d x %d = %d\n", numero, i, numero*i)
	}
}`,
		expectedOutput:
			'Tabla del 7:\n7 x 0 = 0\n7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70',
		hints: [
			'range 11 genera números de 0 a 10 (11 no incluido). Es como range(11) en Python.',
			'Para multiplicar: numero * i. Para formatear: fmt.Printf("%d x %d = %d\\n", numero, i, numero*i)',
		],
		points: 3,
		concepts: ['range-over-integers', 'for-loop', 'fmt.Printf'],
	},

	// --- Tier 2: Fill-in-blank ---
	{
		id: 'm3-ex-003',
		moduleId: 3,
		tier: 'fill-in-blank',
		difficulty: 'intermediate',
		title: 'FizzBuzz con switch',
		description:
			'Rellena los blancos para implementar FizzBuzz usando switch sin expresión (switch true pattern).',
		baseCode: `package main

import "fmt"

func main() {
	for i := range ___ {
		if i == 0 {
			continue
		}
		switch {
		case i%15 == 0:
			fmt.Printf("%d: ___\n", i)
		case i%___ == 0:
			fmt.Printf("%d: Fizz\n", i)
		case i%___ == 0:
			fmt.Printf("%d: Buzz\n", i)
		default:
			fmt.Printf("%d: %d\n", i, i)
		}
	}
}`,
		solution: `package main

import "fmt"

func main() {
	for i := range 21 {
		if i == 0 {
			continue
		}
		switch {
		case i%15 == 0:
			fmt.Printf("%d: FizzBuzz\n", i)
		case i%3 == 0:
			fmt.Printf("%d: Fizz\n", i)
		case i%5 == 0:
			fmt.Printf("%d: Buzz\n", i)
		default:
			fmt.Printf("%d: %d\n", i, i)
		}
	}
}`,
		expectedOutput:
			'1: 1\n2: 2\n3: Fizz\n4: 4\n5: Buzz\n6: Fizz\n7: 7\n8: 8\n9: Fizz\n10: Buzz\n11: 11\n12: Fizz\n13: 13\n14: 14\n15: FizzBuzz\n16: 16\n17: 17\n18: Fizz\n19: 19\n20: Buzz',
		hints: [
			'El switch sin expresión es como switch true — evalúa cada case como un booleano. FizzBuzz usa divisibilidad por 3 y 5.',
			'Divisible por 3 → Fizz, por 5 → Buzz, por ambos (15) → FizzBuzz. El caso de 15 va primero porque es más específico.',
		],
		points: 4,
		concepts: ['switch-true', 'range-over-integers', 'modulo'],
	},

	// --- Tier 3: Debugging ---
	{
		id: 'm3-ex-004',
		moduleId: 3,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'Errores en control de flujo',
		description:
			'Este programa tiene 3 errores de control de flujo. Encuéntralos y corrígelos. Pista: involucran el scope de variables y la lógica del defer.',
		baseCode: `package main

import "fmt"

func main() {
	// Error 1: if con init statement
	if x := 10; x > 5 {
		fmt.Println("x es mayor que 5")
	}
	fmt.Println("Valor de x:", x)

	// Error 2: for con range
	numeros := []int{1, 2, 3, 4, 5}
	suma := 0
	for i := range numeros {
		suma += i
	}
	fmt.Println("Suma:", suma)

	// Error 3: defer y evaluación de argumentos
	valor := "inicio"
	defer fmt.Println("Defer dice:", valor)
	valor = "final"
	fmt.Println("Valor actual:", valor)
}`,
		solution: `package main

import "fmt"

func main() {
	// Fix 1: x solo existe dentro del if
	x := 10
	if x > 5 {
		fmt.Println("x es mayor que 5")
	}
	fmt.Println("Valor de x:", x)

	// Fix 2: range devuelve (indice, valor) — necesitamos el valor
	numeros := []int{1, 2, 3, 4, 5}
	suma := 0
	for _, n := range numeros {
		suma += n
	}
	fmt.Println("Suma:", suma)

	// Nota: El defer captura el valor en el momento del defer, no al final.
	// Imprime "inicio", no "final". Esto NO es un bug de compilación
	// sino de lógica: defer evalúa sus argumentos inmediatamente.
	valor := "inicio"
	defer fmt.Println("Defer dice:", valor)
	valor = "final"
	fmt.Println("Valor actual:", valor)
}`,
		expectedOutput:
			'x es mayor que 5\nValor de x: 10\nSuma: 15\nValor actual: final\nDefer dice: inicio',
		hints: [
			'Error 1: La variable declarada en el init del if solo existe dentro del bloque if/else. Error 2: `for i := range numeros` te da los índices (0,1,2,3,4), no los valores.',
			'Error 3 es de lógica: defer evalúa los argumentos al momento de registrar el defer, no cuando se ejecuta. Esto es por diseño en Go.',
		],
		metacognitivePrompt:
			'¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['if-scope', 'range-index-value', 'defer-evaluation'],
	},
];

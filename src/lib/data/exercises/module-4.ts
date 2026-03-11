import type { Exercise, WorkedExample } from './types';

// =============================================================================
// Module 4: Funciones
// Topics: multiple returns, named returns, variadic, closures,
//         first-class functions, min/max builtins (Go 1.21+)
// =============================================================================

export const workedExamples: WorkedExample[] = [
	{
		id: 'm4-we-001',
		moduleId: 4,
		title: 'Múltiples retornos y el patrón (valor, error)',
		description:
			'Construimos paso a paso una función con múltiples valores de retorno — el patrón más idiomático de Go.',
		steps: [
			{
				code: `package main

import "fmt"

func dividir(a, b float64) float64 {
	return a / b
}

func main() {
	resultado := dividir(10, 3)
	fmt.Printf("10 / 3 = %.2f\n", resultado)
}`,
				explanation:
					'Empezamos con una función simple que retorna un solo valor. Funciona, pero tiene un problema: ¿qué pasa si `b` es 0? En Go no usamos excepciones — retornamos el error como segundo valor.',
				highlightLines: [5],
			},
			{
				code: `package main

import (
	"errors"
	"fmt"
)

func dividir(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("división por cero")
	}
	return a / b, nil
}

func main() {
	resultado, err := dividir(10, 3)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Printf("10 / 3 = %.2f\n", resultado)
}`,
				explanation:
					'Ahora retornamos `(float64, error)`. Si todo sale bien, error es `nil`. Si hay error, retornamos zero value + error. El llamador DEBE manejar ambos — este es el patrón más importante de Go.',
				highlightLines: [8, 10, 12, 16, 17],
			},
			{
				code: `package main

import (
	"errors"
	"fmt"
)

func dividir(a, b float64) (resultado float64, err error) {
	if b == 0 {
		err = errors.New("división por cero")
		return
	}
	resultado = a / b
	return
}

func main() {
	// Caso exitoso
	if res, err := dividir(10, 3); err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("10 / 3 = %.2f\n", res)
	}

	// Caso con error
	if res, err := dividir(10, 0); err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("10 / 0 = %.2f\n", res)
	}
}`,
				explanation:
					'Con "named returns" le damos nombre a los valores de retorno. Un `return` vacío retorna los valores actuales de esas variables. Úsalo con funciones cortas — en funciones largas un return vacío es confuso.',
				highlightLines: [8, 11, 14],
			},
		],
		playground: true,
		playgroundCode: `package main

import (
	"errors"
	"fmt"
)

func dividir(a, b float64) (resultado float64, err error) {
	if b == 0 {
		err = errors.New("división por cero")
		return
	}
	resultado = a / b
	return
}

func main() {
	if res, err := dividir(10, 3); err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("10 / 3 = %.2f\n", res)
	}

	if res, err := dividir(10, 0); err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Printf("10 / 0 = %.2f\n", res)
	}
}`,
	},
	{
		id: 'm4-we-002',
		moduleId: 4,
		title: 'Closures y funciones como valores',
		description:
			'Exploramos cómo las funciones en Go son ciudadanos de primera clase: se pueden asignar a variables, pasar como argumentos y retornar como valores.',
		steps: [
			{
				code: `package main

import "fmt"

func main() {
	// Función anónima asignada a variable
	saludar := func(nombre string) string {
		return "¡Hola, " + nombre + "!"
	}

	fmt.Println(saludar("Gopher"))
}`,
				explanation:
					'Las funciones en Go son "first-class": puedes asignarlas a variables. `saludar` es una variable cuyo tipo es `func(string) string`. La función no tiene nombre propio — es anónima.',
				highlightLines: [7, 8, 9],
			},
			{
				code: `package main

import "fmt"

func crear_contador() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}

func main() {
	contador := crear_contador()

	fmt.Println(contador()) // 1
	fmt.Println(contador()) // 2
	fmt.Println(contador()) // 3
}`,
				explanation:
					'Un closure "captura" variables del scope donde fue creada. `count` vive dentro de `crear_contador`, pero la función retornada sigue teniendo acceso a ella. Cada llamada modifica la misma variable — esto es estado encapsulado sin necesidad de structs.',
				highlightLines: [6, 7, 8, 9],
			},
			{
				code: `package main

import "fmt"

func crear_contador() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}

func aplicar(numeros []int, transformar func(int) int) []int {
	resultado := make([]int, len(numeros))
	for i, n := range numeros {
		resultado[i] = transformar(n)
	}
	return resultado
}

func main() {
	contador := crear_contador()
	fmt.Println(contador(), contador(), contador())

	// Pasar función como argumento
	nums := []int{1, 2, 3, 4, 5}

	dobles := aplicar(nums, func(n int) int { return n * 2 })
	fmt.Println("Dobles:", dobles)

	cuadrados := aplicar(nums, func(n int) int { return n * n })
	fmt.Println("Cuadrados:", cuadrados)
}`,
				explanation:
					'`aplicar` recibe una función como parámetro — esto es programación funcional en Go. Pasamos funciones anónimas inline que transforman cada número. El mismo `aplicar` sirve para cualquier transformación.',
				highlightLines: [13, 27, 30],
			},
			{
				code: `package main

import "fmt"

func crear_contador() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}

func aplicar(numeros []int, transformar func(int) int) []int {
	resultado := make([]int, len(numeros))
	for i, n := range numeros {
		resultado[i] = transformar(n)
	}
	return resultado
}

func main() {
	contador := crear_contador()
	fmt.Println(contador(), contador(), contador())

	nums := []int{1, 2, 3, 4, 5}

	dobles := aplicar(nums, func(n int) int { return n * 2 })
	fmt.Println("Dobles:", dobles)

	cuadrados := aplicar(nums, func(n int) int { return n * n })
	fmt.Println("Cuadrados:", cuadrados)

	// Builtins min/max (Go 1.21+)
	fmt.Println("Min:", min(3, 1, 4, 1, 5))
	fmt.Println("Max:", max(3, 1, 4, 1, 5))
}`,
				explanation:
					'Desde Go 1.21, `min` y `max` son builtins — no necesitas importar nada. Aceptan cualquier cantidad de argumentos del mismo tipo ordenable. Antes había que escribirlos a mano o usar math.Min (solo float64).',
				highlightLines: [34, 35],
			},
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

func crear_contador() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}

func aplicar(numeros []int, transformar func(int) int) []int {
	resultado := make([]int, len(numeros))
	for i, n := range numeros {
		resultado[i] = transformar(n)
	}
	return resultado
}

func main() {
	contador := crear_contador()
	fmt.Println(contador(), contador(), contador())

	nums := []int{1, 2, 3, 4, 5}

	dobles := aplicar(nums, func(n int) int { return n * 2 })
	fmt.Println("Dobles:", dobles)

	cuadrados := aplicar(nums, func(n int) int { return n * n })
	fmt.Println("Cuadrados:", cuadrados)

	// Builtins Go 1.21+
	fmt.Println("Min:", min(3, 1, 4, 1, 5))
	fmt.Println("Max:", max(3, 1, 4, 1, 5))
}`,
	},
];

export const exercises: Exercise[] = [
	// --- Tier 1: Completion ---
	{
		id: 'm4-ex-001',
		moduleId: 4,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Función variadic: suma flexible',
		description:
			'Completa la función variadic `sumar` que acepta cualquier cantidad de enteros y retorna la suma total.',
		baseCode: `package main

import "fmt"

// TODO: Completa la función variadic
// func sumar(numeros ...int) int {
//     ...
// }

func main() {
	fmt.Println(sumar(1, 2, 3))
	fmt.Println(sumar(10, 20, 30, 40))
	fmt.Println(sumar())

	// Expandir un slice con ...
	nums := []int{5, 10, 15}
	fmt.Println(sumar(nums...))
}`,
		solution: `package main

import "fmt"

func sumar(numeros ...int) int {
	total := 0
	for _, n := range numeros {
		total += n
	}
	return total
}

func main() {
	fmt.Println(sumar(1, 2, 3))
	fmt.Println(sumar(10, 20, 30, 40))
	fmt.Println(sumar())

	// Expandir un slice con ...
	nums := []int{5, 10, 15}
	fmt.Println(sumar(nums...))
}`,
		expectedOutput: '6\n100\n0\n30',
		hints: [
			'Una función variadic usa ... antes del tipo: func sumar(numeros ...int). Dentro de la función, numeros es un []int normal',
			'Itera con for _, n := range numeros y acumula en una variable total. Si no se pasan argumentos, el slice está vacío y el total es 0',
		],
		points: 3,
		concepts: ['variadic', 'range', 'slice-expansion'],
	},
	{
		id: 'm4-ex-002',
		moduleId: 4,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Retornos múltiples: estadísticas',
		description:
			'Completa la función `estadisticas` que recibe un slice de float64 y retorna el mínimo, máximo y promedio.',
		baseCode: `package main

import "fmt"

// TODO: Completa la función
// Debe retornar (minimo, maximo, promedio float64)
// Usa los builtins min() y max() de Go 1.21+
// Para el promedio: suma todos y divide por la cantidad
func estadisticas(datos []float64) (float64, float64, float64) {
	if len(datos) == 0 {
		return 0, 0, 0
	}
	// TODO: calcula minimo, maximo y promedio
	return 0, 0, 0
}

func main() {
	notas := []float64{7.5, 9.0, 6.5, 8.0, 10.0}
	minimo, maximo, promedio := estadisticas(notas)
	fmt.Printf("Mín: %.1f, Máx: %.1f, Prom: %.1f\n",
		minimo, maximo, promedio)
}`,
		solution: `package main

import "fmt"

func estadisticas(datos []float64) (float64, float64, float64) {
	if len(datos) == 0 {
		return 0, 0, 0
	}

	minimo := datos[0]
	maximo := datos[0]
	suma := 0.0

	for _, v := range datos {
		minimo = min(minimo, v)
		maximo = max(maximo, v)
		suma += v
	}

	promedio := suma / float64(len(datos))
	return minimo, maximo, promedio
}

func main() {
	notas := []float64{7.5, 9.0, 6.5, 8.0, 10.0}
	minimo, maximo, promedio := estadisticas(notas)
	fmt.Printf("Mín: %.1f, Máx: %.1f, Prom: %.1f\n",
		minimo, maximo, promedio)
}`,
		expectedOutput: 'Mín: 6.5, Máx: 10.0, Prom: 8.2',
		hints: [
			'Inicializa minimo y maximo con datos[0]. Luego itera con range comparando con min() y max() de Go 1.21+',
			'Para el promedio necesitas convertir len(datos) a float64: suma / float64(len(datos))',
		],
		points: 3,
		concepts: ['multiple-returns', 'min-max-builtins', 'type-conversion'],
	},

	// --- Tier 2: Fill-in-blank ---
	{
		id: 'm4-ex-003',
		moduleId: 4,
		tier: 'fill-in-blank',
		difficulty: 'intermediate',
		title: 'Closure como generador',
		description:
			'Rellena los blancos para crear un generador de Fibonacci usando closures. La función retorna otra función que produce el siguiente número de la secuencia en cada llamada.',
		baseCode: `package main

import "fmt"

func fibonacci() ___ {
	a, b := 0, 1
	return func() int {
		valor := ___
		a, b = ___, ___
		return valor
	}
}

func main() {
	fib := fibonacci()
	for i := range 10 {
		fmt.Printf("fib(%d) = %d\n", i, fib())
	}
}`,
		solution: `package main

import "fmt"

func fibonacci() func() int {
	a, b := 0, 1
	return func() int {
		valor := a
		a, b = b, a+b
		return valor
	}
}

func main() {
	fib := fibonacci()
	for i := range 10 {
		fmt.Printf("fib(%d) = %d\n", i, fib())
	}
}`,
		expectedOutput:
			'fib(0) = 0\nfib(1) = 1\nfib(2) = 1\nfib(3) = 2\nfib(4) = 3\nfib(5) = 5\nfib(6) = 8\nfib(7) = 13\nfib(8) = 21\nfib(9) = 34',
		hints: [
			'El tipo de retorno de fibonacci() es func() int — una función sin argumentos que retorna int',
			'Fibonacci: cada número es la suma de los dos anteriores. Guardas el valor actual (a), luego avanzas: a toma el valor de b, y b toma a+b',
		],
		points: 4,
		concepts: ['closures', 'function-types', 'fibonacci', 'state-encapsulation'],
	},

	// --- Tier 3: Debugging ---
	{
		id: 'm4-ex-004',
		moduleId: 4,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'Bugs en funciones y closures',
		description:
			'Este programa tiene 3 errores en el uso de funciones. Encuéntralos y corrígelos para obtener la salida esperada.',
		baseCode: `package main

import "fmt"

func swap(a, b int) (int, int) {
	a = b
	b = a
	return a, b
}

func crearMultiplicador(factor int) func(int) int {
	return func(n int) int {
		return n + factor
	}
}

func main() {
	x, y := 10, 20
	x, y = swap(x, y)
	fmt.Printf("Swap: x=%d, y=%d\n", x, y)

	doble := crearMultiplicador(2)
	triple := crearMultiplicador(3)
	fmt.Printf("Doble de 5: %d\n", doble(5))
	fmt.Printf("Triple de 5: %d\n", triple(5))

	fmt.Println("Mayor:", max(3, 7, 1, 9, 2))
}`,
		solution: `package main

import "fmt"

func swap(a, b int) (int, int) {
	return b, a
}

func crearMultiplicador(factor int) func(int) int {
	return func(n int) int {
		return n * factor
	}
}

func main() {
	x, y := 10, 20
	x, y = swap(x, y)
	fmt.Printf("Swap: x=%d, y=%d\n", x, y)

	doble := crearMultiplicador(2)
	triple := crearMultiplicador(3)
	fmt.Printf("Doble de 5: %d\n", doble(5))
	fmt.Printf("Triple de 5: %d\n", triple(5))

	fmt.Println("Mayor:", max(3, 7, 1, 9, 2))
}`,
		expectedOutput:
			'Swap: x=20, y=10\nDoble de 5: 10\nTriple de 5: 15\nMayor: 9',
		hints: [
			'Bug 1: En swap, después de a = b, ambas variables valen lo mismo. La solución es más simple de lo que parece con múltiples retornos.',
			'Bug 2: La función se llama crearMultiplicador pero usa + en vez de *. Es un error de lógica — el código compila pero da resultados incorrectos.',
		],
		metacognitivePrompt:
			'¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['swap-pattern', 'closures', 'operator-logic'],
	},
];

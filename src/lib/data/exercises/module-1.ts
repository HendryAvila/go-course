import type { Exercise, WorkedExample } from './types';

// =============================================================================
// Module 1: Bienvenido a Go
// Topics: package main, fmt.Println, fmt.Printf, variables basics, toolchain
// =============================================================================

export const workedExamples: WorkedExample[] = [
	{
		id: 'm1-we-001',
		moduleId: 1,
		title: 'Tu primer programa en Go',
		description:
			'Construimos paso a paso el clásico "Hello, World" y entendemos la estructura mínima de un programa Go.',
		steps: [
			{
				code: `package main`,
				explanation:
					'Todo programa ejecutable en Go empieza con `package main`. Este nombre especial le dice al compilador que este paquete produce un binario, no una librería.',
				highlightLines: [1],
			},
			{
				code: `package main

import "fmt"`,
				explanation:
					'Importamos el paquete `fmt` (format) del standard library. Go no permite imports sin usar — si lo dejas ahí sin usarlo, el compilador te da error. Nada de código muerto.',
				highlightLines: [3],
			},
			{
				code: `package main

import "fmt"

func main() {
}`,
				explanation:
					'La función `main()` es el punto de entrada. No recibe argumentos ni retorna nada. Cuando `main()` termina, el programa termina.',
				highlightLines: [5, 6],
			},
			{
				code: `package main

import "fmt"

func main() {
	fmt.Println("¡Hola, Gopher!")
}`,
				explanation:
					'`fmt.Println` imprime texto seguido de un salto de línea. Nota que `Println` empieza con mayúscula — en Go eso significa que es una función exportada (pública). Las minúsculas son privadas al paquete.',
				highlightLines: [6],
			},
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

func main() {
	fmt.Println("¡Hola, Gopher!")
}`,
	},
	{
		id: 'm1-we-002',
		moduleId: 1,
		title: 'Formateando salida con fmt.Printf',
		description:
			'Aprendemos a usar verbos de formato para imprimir variables con control preciso.',
		steps: [
			{
				code: `package main

import "fmt"

func main() {
	nombre := "Go"
	fmt.Println(nombre)
}`,
				explanation:
					'Empezamos con una variable declarada con `:=` (short declaration). Por ahora solo la imprimimos con `Println`. Funciona, pero no tenemos control sobre el formato.',
				highlightLines: [6],
			},
			{
				code: `package main

import "fmt"

func main() {
	nombre := "Go"
	version := 1.23
	fmt.Printf("Lenguaje: %s\n", nombre)
	fmt.Printf("Versión: %.2f\n", version)
}`,
				explanation:
					'`Printf` usa verbos de formato: `%s` para strings, `%f` para flotantes (`.2f` = 2 decimales). A diferencia de `Println`, `Printf` NO agrega salto de línea — tienes que poner `\\n` manualmente.',
				highlightLines: [8, 9],
			},
			{
				code: `package main

import "fmt"

func main() {
	nombre := "Go"
	version := 1.23
	anio := 2009

	fmt.Printf("Lenguaje: %s\n", nombre)
	fmt.Printf("Versión: %.2f\n", version)
	fmt.Printf("Creado en: %d\n", anio)
	fmt.Printf("Debug: nombre=%q tipo=%T\n", nombre, nombre)
}`,
				explanation:
					'Más verbos útiles: `%d` para enteros, `%q` para strings con comillas (ideal para debug), y `%T` que imprime el tipo de la variable. El verbo `%T` es muy útil cuando estás aprendiendo porque te confirma qué tipo infirió Go.',
				highlightLines: [12, 13],
			},
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

func main() {
	nombre := "Go"
	version := 1.23
	anio := 2009

	fmt.Printf("Lenguaje: %s\n", nombre)
	fmt.Printf("Versión: %.2f\n", version)
	fmt.Printf("Creado en: %d\n", anio)
	fmt.Printf("Debug: nombre=%q tipo=%T\n", nombre, nombre)
}`,
	},
];

export const exercises: Exercise[] = [
	// --- Tier 1: Completion (70% dado, completar el 30%) ---
	{
		id: 'm1-ex-001',
		moduleId: 1,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Saludo personalizado',
		description:
			'Completa el programa para que imprima un saludo con tu nombre usando `fmt.Println`.',
		baseCode: `package main

import "fmt"

func main() {
	nombre := "___"
	// TODO: Usa fmt.Println para imprimir "¡Hola, <nombre>!"
}`,
		solution: `package main

import "fmt"

func main() {
	nombre := "Gopher"
	fmt.Println("¡Hola, " + nombre + "!")
}`,
		expectedOutput: '¡Hola, Gopher!',
		hints: [
			'Recuerda que puedes concatenar strings con el operador +',
			'fmt.Println("¡Hola, " + nombre + "!") une los textos antes de imprimir',
		],
		points: 3,
		concepts: ['fmt.Println', 'variables', 'string-concatenation'],
	},
	{
		id: 'm1-ex-002',
		moduleId: 1,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Tarjeta de presentación',
		description:
			'Completa el programa para que imprima una tarjeta con nombre, edad y lenguaje favorito usando `fmt.Printf`.',
		baseCode: `package main

import "fmt"

func main() {
	nombre := "Ada"
	edad := 25
	lenguaje := "Go"

	// TODO: Usa fmt.Printf con los verbos correctos
	// Salida esperada:
	// Nombre: Ada
	// Edad: 25 años
	// Lenguaje favorito: Go
}`,
		solution: `package main

import "fmt"

func main() {
	nombre := "Ada"
	edad := 25
	lenguaje := "Go"

	fmt.Printf("Nombre: %s\n", nombre)
	fmt.Printf("Edad: %d años\n", edad)
	fmt.Printf("Lenguaje favorito: %s\n", lenguaje)
}`,
		expectedOutput: 'Nombre: Ada\nEdad: 25 años\nLenguaje favorito: Go',
		hints: [
			'Usa %s para strings y %d para enteros. No olvides \\n al final de cada Printf',
			'fmt.Printf("Nombre: %s\\n", nombre) — el verbo %s se reemplaza por el valor del string',
		],
		points: 3,
		concepts: ['fmt.Printf', 'format-verbs', 'variables'],
	},

	// --- Tier 2: Fill-in-blank ---
	{
		id: 'm1-ex-003',
		moduleId: 1,
		tier: 'fill-in-blank',
		difficulty: 'beginner',
		title: 'Verbos de formato',
		description:
			'Rellena los blancos con los verbos de formato correctos para que el programa compile y muestre la salida esperada.',
		baseCode: `package main

import "fmt"

func main() {
	ciudad := "Buenos Aires"
	poblacion := 15000000
	latitud := -34.6037

	fmt.Printf("Ciudad: ___\n", ciudad)
	fmt.Printf("Población: ___ habitantes\n", poblacion)
	fmt.Printf("Latitud: ___\n", latitud)
	fmt.Printf("Tipo de latitud: ___\n", latitud)
}`,
		solution: `package main

import "fmt"

func main() {
	ciudad := "Buenos Aires"
	poblacion := 15000000
	latitud := -34.6037

	fmt.Printf("Ciudad: %s\n", ciudad)
	fmt.Printf("Población: %d habitantes\n", poblacion)
	fmt.Printf("Latitud: %f\n", latitud)
	fmt.Printf("Tipo de latitud: %T\n", latitud)
}`,
		expectedOutput:
			'Ciudad: Buenos Aires\nPoblación: 15000000 habitantes\nLatitud: -34.603700\nTipo de latitud: float64',
		hints: [
			'Los verbos básicos son: %s (string), %d (entero), %f (float), %T (tipo)',
			'%T imprime el tipo de Go de una variable — muy útil para debug',
		],
		points: 4,
		concepts: ['fmt.Printf', 'format-verbs', '%T'],
	},

	// --- Tier 3: Debugging ---
	{
		id: 'm1-ex-004',
		moduleId: 1,
		tier: 'debugging',
		difficulty: 'beginner',
		title: 'Encuentra los errores',
		description:
			'Este programa tiene 3 errores. Encuéntralos y corrígelos para que compile y muestre la salida esperada.',
		baseCode: `package Main

import "fmt"

func main() {
	lenguaje = "Go"
	anio := 2009
	fmt.printf("Go fue creado en %d por Google\n", anio)
	fmt.Println("Estamos aprendiendo " + lenguaje)
}`,
		solution: `package main

import "fmt"

func main() {
	lenguaje := "Go"
	anio := 2009
	fmt.Printf("Go fue creado en %d por Google\n", anio)
	fmt.Println("Estamos aprendiendo " + lenguaje)
}`,
		expectedOutput:
			'Go fue creado en 2009 por Google\nEstamos aprendiendo Go',
		hints: [
			'Go es case-sensitive: revisa nombres de paquetes y funciones con cuidado',
			'Hay 3 errores: uno en el nombre del paquete, otro en la declaración de variable, y otro en el nombre de la función Printf',
		],
		metacognitivePrompt:
			'¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['package-main', 'short-declaration', 'case-sensitivity'],
	},
];

import type { Exercise, WorkedExample } from './types';

// =============================================================================
// Module 5: Collections — Arrays, Slices, Maps
// =============================================================================

export const workedExamples: WorkedExample[] = [
	// -------------------------------------------------------------------------
	// WE-001: Slices desde cero — puntero, len, cap y append
	// -------------------------------------------------------------------------
	{
		id: 'm5-we-001',
		moduleId: 5,
		title: 'Anatomía de un Slice',
		description:
			'Construimos un slice paso a paso, observando cómo cambian len, cap y el puntero interno con cada operación.',
		steps: [
			{
				code: `package main

import "fmt"

func main() {
	// Un array tiene tamaño fijo
	arr := [5]int{10, 20, 30, 40, 50}
	fmt.Println("Array:", arr)
	fmt.Println("Tipo: [5]int — tamaño fijo, parte del tipo")
}`,
				explanation:
					'Empezamos con un array. En Go, el tamaño es parte del tipo: [5]int y [3]int son tipos distintos. No puedes pasar uno donde se espera el otro.',
				highlightLines: [6]
			},
			{
				code: `package main

import "fmt"

func main() {
	arr := [5]int{10, 20, 30, 40, 50}

	// Un slice es una "ventana" sobre un array
	s := arr[1:4] // elementos en índices 1, 2, 3
	fmt.Println("Slice:", s)          // [20 30 40]
	fmt.Println("Len:", len(s))       // 3
	fmt.Println("Cap:", cap(s))       // 4 (desde índice 1 hasta el final del array)
}`,
				explanation:
					'Un slice tiene 3 componentes: un puntero al array subyacente, longitud (len) y capacidad (cap). La capacidad va desde el inicio del slice hasta el final del array.',
				highlightLines: [9, 11, 12]
			},
			{
				code: `package main

import "fmt"

func main() {
	// make crea un slice con array subyacente propio
	s := make([]int, 3, 5)
	fmt.Printf("Len: %d, Cap: %d, Valores: %v\n", len(s), cap(s), s)
	// Len: 3, Cap: 5, Valores: [0 0 0]

	// append agrega elementos
	s = append(s, 10, 20)
	fmt.Printf("Len: %d, Cap: %d, Valores: %v\n", len(s), cap(s), s)
	// Len: 5, Cap: 5, Valores: [0 0 0 10 20]

	// Si superamos la capacidad, Go crea un nuevo array más grande
	s = append(s, 30)
	fmt.Printf("Len: %d, Cap: %d, Valores: %v\n", len(s), cap(s), s)
	// Len: 6, Cap: 10, Valores: [0 0 0 10 20 30]
}`,
				explanation:
					'make([]T, len, cap) reserva un array subyacente de tamaño cap. Cuando append supera la capacidad, Go duplica el tamaño (aprox.) y copia los datos. Por eso siempre reasignamos: s = append(s, ...).',
				highlightLines: [7, 12, 17]
			},
			{
				code: `package main

import "fmt"

func main() {
	original := []int{1, 2, 3, 4, 5}

	// copy crea una copia independiente
	copia := make([]int, len(original))
	copy(copia, original)

	copia[0] = 999
	fmt.Println("Original:", original) // [1 2 3 4 5]
	fmt.Println("Copia:", copia)       // [999 2 3 4 5]

	// Sin copy, los slices comparten el array:
	compartido := original[1:3]
	compartido[0] = 888
	fmt.Println("Original después:", original) // [1 888 3 4 5]
}`,
				explanation:
					'copy() es esencial cuando necesitas independencia. Sin copy, modificar un slice afecta a todos los que comparten el mismo array subyacente. Este es uno de los bugs más comunes en Go.',
				highlightLines: [9, 10, 17, 18]
			}
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

func main() {
	// Experimenta con slices
	s := make([]int, 0, 3)
	fmt.Printf("Inicio — Len: %d, Cap: %d\\n", len(s), cap(s))

	for i := 1; i <= 6; i++ {
		s = append(s, i*10)
		fmt.Printf("Append %d — Len: %d, Cap: %d, Valores: %v\\n", i, len(s), cap(s), s)
	}

	// Prueba slice expressions
	sub := s[2:4]
	fmt.Printf("\\nSub-slice s[2:4]: %v (len=%d, cap=%d)\\n", sub, len(sub), cap(sub))

	// Prueba copy
	copia := make([]int, len(s))
	copy(copia, s)
	copia[0] = -1
	fmt.Println("Original:", s)
	fmt.Println("Copia:", copia)
}`
	},

	// -------------------------------------------------------------------------
	// WE-002: Maps — creación, acceso seguro e iteración
	// -------------------------------------------------------------------------
	{
		id: 'm5-we-002',
		moduleId: 5,
		title: 'Maps en acción',
		description:
			'Exploramos cómo crear, consultar y recorrer mapas, incluyendo el idiom de la "comma ok" y los nuevos helpers de Go 1.21+.',
		steps: [
			{
				code: `package main

import "fmt"

func main() {
	// Crear un map con literal
	edades := map[string]int{
		"Ana":   28,
		"Bruno": 35,
		"Clara": 22,
	}
	fmt.Println("Edades:", edades)
}`,
				explanation:
					'Un map asocia claves a valores. La clave debe ser un tipo comparable (string, int, etc.). Los maps no garantizan orden de iteración.',
				highlightLines: [7]
			},
			{
				code: `package main

import "fmt"

func main() {
	edades := map[string]int{
		"Ana":   28,
		"Bruno": 35,
	}

	// Acceso directo — devuelve zero value si no existe
	fmt.Println("Ana:", edades["Ana"])       // 28
	fmt.Println("Nadie:", edades["Nadie"])   // 0 (¡no es error!)

	// Idiom "comma ok" para distinguir ausencia de zero value
	edad, existe := edades["Nadie"]
	if !existe {
		fmt.Println("Nadie no está en el mapa")
	} else {
		fmt.Println("Edad:", edad)
	}
}`,
				explanation:
					'El zero value de int es 0, así que edades["Nadie"] devuelve 0 sin error. Usa el segundo valor de retorno (ok) para saber si la clave realmente existe.',
				highlightLines: [13, 16, 17]
			},
			{
				code: `package main

import "fmt"

func main() {
	conteo := map[string]int{}

	palabras := []string{"go", "es", "genial", "go", "es", "rápido", "go"}

	for _, p := range palabras {
		conteo[p]++ // zero value de int es 0, así que funciona directo
	}

	for palabra, n := range conteo {
		fmt.Printf("%s: %d veces\n", palabra, n)
	}

	// Eliminar una clave
	delete(conteo, "es")
	fmt.Println("\nDespués de delete:", conteo)

	// clear vacía todo el mapa (Go 1.21+)
	clear(conteo)
	fmt.Println("Después de clear:", conteo, "len:", len(conteo))
}`,
				explanation:
					'Los maps son perfectos para conteos porque el zero value de int ya es 0. delete() elimina una clave, y clear() (Go 1.21+) vacía el mapa completo sin reasignar.',
				highlightLines: [11, 19, 23]
			},
			{
				code: `package main

import (
	"fmt"
	"slices"
)

func main() {
	nums := []int{5, 3, 8, 1, 9, 2}
	fmt.Println("Original:", nums)

	// slices.Sort ordena in-place
	slices.Sort(nums)
	fmt.Println("Ordenado:", nums)

	// slices.Contains busca un valor
	fmt.Println("¿Contiene 8?", slices.Contains(nums, 8))
	fmt.Println("¿Contiene 7?", slices.Contains(nums, 7))
}`,
				explanation:
					'Desde Go 1.21, el paquete slices ofrece funciones genéricas para ordenar, buscar y manipular slices sin escribir loops manuales. Mucho más limpio que sort.Slice().',
				highlightLines: [5, 13, 17]
			}
		],
		playground: true,
		playgroundCode: `package main

import (
	"fmt"
	"slices"
)

func main() {
	// Experimenta con maps y slices helpers
	inventario := map[string]int{
		"manzanas": 5,
		"naranjas": 12,
		"plátanos": 3,
	}

	for fruta, cant := range inventario {
		fmt.Printf("%s: %d\\n", fruta, cant)
	}

	// Prueba slices.Sort y slices.Contains
	nombres := []string{"Zara", "Ana", "Miguel", "Bruno"}
	slices.Sort(nombres)
	fmt.Println("\\nOrdenados:", nombres)
	fmt.Println("¿Está Ana?", slices.Contains(nombres, "Ana"))

	// Prueba clear
	clear(inventario)
	fmt.Println("\\nInventario después de clear:", inventario)
}`
	}
];

export const exercises: Exercise[] = [
	// -------------------------------------------------------------------------
	// Tier 1: Completion — Crear y manipular slices
	// -------------------------------------------------------------------------
	{
		id: 'm5-ex-001',
		moduleId: 5,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Operaciones básicas con slices',
		description:
			'Completa el código para crear un slice, agregar elementos y obtener un sub-slice. Fíjate en los comentarios que indican qué hacer.',
		baseCode: `package main

import "fmt"

func main() {
	// 1. Crea un slice de strings con make, longitud 0, capacidad 5
	frutas := ___

	// 2. Agrega "manzana", "naranja" y "plátano" con append
	frutas = ___

	// 3. Obtén un sub-slice con los dos primeros elementos
	dosPrimeras := ___

	fmt.Println("Todas:", frutas)
	fmt.Println("Primeras dos:", dosPrimeras)
	fmt.Printf("Len: %d, Cap: %d\\n", len(frutas), cap(frutas))
}`,
		solution: `package main

import "fmt"

func main() {
	// 1. Crea un slice de strings con make, longitud 0, capacidad 5
	frutas := make([]string, 0, 5)

	// 2. Agrega "manzana", "naranja" y "plátano" con append
	frutas = append(frutas, "manzana", "naranja", "plátano")

	// 3. Obtén un sub-slice con los dos primeros elementos
	dosPrimeras := frutas[:2]

	fmt.Println("Todas:", frutas)
	fmt.Println("Primeras dos:", dosPrimeras)
	fmt.Printf("Len: %d, Cap: %d\\n", len(frutas), cap(frutas))
}`,
		expectedOutput: `Todas: [manzana naranja plátano]
Primeras dos: [manzana naranja]
Len: 3, Cap: 5`,
		hints: [
			'make([]string, longitud, capacidad) crea un slice. Para agregar a uno vacío, usa longitud 0.',
			'append puede recibir varios valores: append(s, "a", "b", "c"). Para sub-slices usa s[inicio:fin].'
		],
		points: 3,
		concepts: ['slices', 'make', 'append', 'slice-expressions']
	},

	// -------------------------------------------------------------------------
	// Tier 2: Fill-in-blank — Map con comma ok
	// -------------------------------------------------------------------------
	{
		id: 'm5-ex-002',
		moduleId: 5,
		tier: 'fill-in-blank',
		difficulty: 'beginner',
		title: 'Búsqueda segura en maps',
		description:
			'Rellena los blancos para implementar una función que busca en un map de forma segura usando el idiom "comma ok".',
		baseCode: `package main

import "fmt"

func buscarUsuario(usuarios map[string]int, nombre string) {
	// Usa el idiom "comma ok" para verificar si el nombre existe
	___, ___ := ___
	if ___ {
		fmt.Printf("%s tiene %d años\\n", nombre, ___)
	} else {
		fmt.Printf("%s no encontrado\\n", nombre)
	}
}

func main() {
	usuarios := map[string]int{
		"Ana":   25,
		"Bruno": 30,
		"Clara": 28,
	}

	buscarUsuario(usuarios, "Ana")
	buscarUsuario(usuarios, "David")
}`,
		solution: `package main

import "fmt"

func buscarUsuario(usuarios map[string]int, nombre string) {
	// Usa el idiom "comma ok" para verificar si el nombre existe
	edad, existe := usuarios[nombre]
	if existe {
		fmt.Printf("%s tiene %d años\\n", nombre, edad)
	} else {
		fmt.Printf("%s no encontrado\\n", nombre)
	}
}

func main() {
	usuarios := map[string]int{
		"Ana":   25,
		"Bruno": 30,
		"Clara": 28,
	}

	buscarUsuario(usuarios, "Ana")
	buscarUsuario(usuarios, "David")
}`,
		expectedOutput: `Ana tiene 25 años
David no encontrado`,
		hints: [
			'El idiom es: valor, ok := miMapa[clave]. ok es un bool que indica si la clave existe.',
			'La variable ok (o "existe") va en la condición del if. El valor (edad) se usa dentro del bloque.'
		],
		points: 4,
		concepts: ['maps', 'comma-ok', 'functions']
	},

	// -------------------------------------------------------------------------
	// Tier 3: Debugging — Slice compartido
	// -------------------------------------------------------------------------
	{
		id: 'm5-ex-003',
		moduleId: 5,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'El slice que cambió solo',
		description:
			'Este programa filtra números pares de un slice, pero el slice original se modifica inesperadamente. Encuentra y corrige los 2 bugs.',
		baseCode: `package main

import "fmt"

func filtrarPares(nums []int) []int {
	resultado := nums[:0] // Reutiliza el array subyacente
	for _, n := range nums {
		if n%2 == 0 {
			resultado = append(resultado, n)
		}
	}
	return resultado
}

func main() {
	numeros := []int{1, 2, 3, 4, 5, 6, 7, 8}
	fmt.Println("Original:", numeros)

	pares := filtrarPares(numeros)
	fmt.Println("Pares:", pares)
	fmt.Println("Original después:", numeros) // ¡Sorpresa!
}`,
		solution: `package main

import "fmt"

func filtrarPares(nums []int) []int {
	resultado := make([]int, 0, len(nums)) // Array propio
	for _, n := range nums {
		if n%2 == 0 {
			resultado = append(resultado, n)
		}
	}
	return resultado
}

func main() {
	numeros := []int{1, 2, 3, 4, 5, 6, 7, 8}
	fmt.Println("Original:", numeros)

	pares := filtrarPares(numeros)
	fmt.Println("Pares:", pares)
	fmt.Println("Original después:", numeros)
}`,
		expectedOutput: `Original: [1 2 3 4 5 6 7 8]
Pares: [2 4 6 8]
Original después: [1 2 3 4 5 6 7 8]`,
		hints: [
			'nums[:0] crea un slice con longitud 0 pero que apunta al mismo array que nums.',
			'Cuando append escribe en resultado, en realidad está sobreescribiendo los elementos de nums.'
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['slices', 'shared-backing-array', 'copy', 'append']
	},

	// -------------------------------------------------------------------------
	// Tier 3: Debugging — Map y nil
	// -------------------------------------------------------------------------
	{
		id: 'm5-ex-004',
		moduleId: 5,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'El map que explota',
		description:
			'Este programa cuenta la frecuencia de letras en un string, pero tiene 2 bugs que causan un panic en runtime. Encuéntralos.',
		baseCode: `package main

import "fmt"

func contarLetras(texto string) map[rune]int {
	var frecuencia map[rune]int // Declarar el map

	for _, letra := range texto {
		frecuencia[letra]++ // Incrementar conteo
	}

	return frecuencia
}

func main() {
	texto := "golang"
	resultado := contarLetras(texto)

	for letra, conteo := range resultado {
		fmt.Printf("%c: %d\\n", letra, conteo)
	}
}`,
		solution: `package main

import "fmt"

func contarLetras(texto string) map[rune]int {
	frecuencia := make(map[rune]int) // Inicializar el map

	for _, letra := range texto {
		frecuencia[letra]++ // Incrementar conteo
	}

	return frecuencia
}

func main() {
	texto := "golang"
	resultado := contarLetras(texto)

	for letra, conteo := range resultado {
		fmt.Printf("%c: %d\\n", letra, conteo)
	}
}`,
		expectedOutput: `g: 2
o: 1
l: 1
a: 1
n: 1`,
		hints: [
			'var m map[K]V declara un map nil. ¿Qué pasa si escribes en un map nil?',
			'Escribir en un map nil causa panic. Usa make() o un literal para inicializarlo.'
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['maps', 'nil-map', 'make', 'panic']
	}
];

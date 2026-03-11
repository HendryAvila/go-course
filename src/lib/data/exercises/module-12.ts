// Module 12: REST APIs, Testing & Modern Go (Generics, Iterators)
// Covers: net/http ServeMux, JSON encoding/decoding, struct tags, table-driven tests,
//         generics (type parameters, constraints), iterators (iter package)

import type { Exercise, WorkedExample } from './types';

export const workedExamples: WorkedExample[] = [
	{
		id: 'm12-we-001',
		moduleId: 12,
		title: 'HTTP Handler con JSON',
		description:
			'Construimos paso a paso un endpoint REST que recibe y responde JSON, usando ServeMux, structs con tags y manejo correcto de errores HTTP.',
		steps: [
			{
				code: `package main

import (
	"fmt"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	// Go 1.22+: patrones con método y parámetros
	mux.HandleFunc("GET /saludar", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "¡Hola desde Go!")
	})

	fmt.Println("Servidor en :8080")
	http.ListenAndServe(":8080", mux)
}`,
				explanation:
					'ServeMux es el enrutador estándar de Go. Desde Go 1.22, soporta métodos HTTP directamente en el patrón ("GET /ruta"). HandleFunc registra una función que recibe ResponseWriter (para escribir la respuesta) y *Request (la petición entrante).',
				highlightLines: [9, 12, 13],
			},
			{
				code: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Los struct tags controlan cómo se serializa/deserializa JSON
type Producto struct {
	ID     int     \`json:"id"\`
	Nombre string  \`json:"nombre"\`
	Precio float64 \`json:"precio"\`
	Stock  int     \`json:"stock,omitempty"\` // omitempty: no incluir si es 0
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /productos", func(w http.ResponseWriter, r *http.Request) {
		productos := []Producto{
			{ID: 1, Nombre: "Teclado", Precio: 49.99, Stock: 25},
			{ID: 2, Nombre: "Mouse", Precio: 29.99},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(productos)
	})

	fmt.Println("Servidor en :8080")
	http.ListenAndServe(":8080", mux)
}`,
				explanation:
					'Los struct tags (entre backticks) le dicen a encoding/json cómo mapear campos. "omitempty" omite el campo si tiene valor cero. json.NewEncoder(w).Encode() escribe directamente al ResponseWriter. Siempre establece Content-Type ANTES de escribir el body.',
				highlightLines: [11, 12, 13, 14, 27, 28],
			},
			{
				code: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Producto struct {
	ID     int     \`json:"id"\`
	Nombre string  \`json:"nombre"\`
	Precio float64 \`json:"precio"\`
}

type ErrorResp struct {
	Error string \`json:"error"\`
}

func crearProducto(w http.ResponseWriter, r *http.Request) {
	var p Producto
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest) // 400
		json.NewEncoder(w).Encode(ErrorResp{Error: "JSON inválido: " + err.Error()})
		return
	}

	if p.Nombre == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResp{Error: "nombre es requerido"})
		return
	}

	p.ID = 1 // simulamos asignación de ID
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // 201
	json.NewEncoder(w).Encode(p)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /productos", crearProducto)
	fmt.Println("Servidor en :8080")
	http.ListenAndServe(":8080", mux)
}`,
				explanation:
					'json.NewDecoder(r.Body).Decode(&p) lee y parsea el JSON del body. Siempre verifica el error de Decode: podría ser JSON malformado. Usa WriteHeader para establecer el status code (400, 201, etc.). Importante: WriteHeader DEBE ir después de Header().Set() pero ANTES de Encode().',
				highlightLines: [21, 22, 23, 24, 37, 38],
			},
			{
				code: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

type Producto struct {
	ID     int     \`json:"id"\`
	Nombre string  \`json:"nombre"\`
	Precio float64 \`json:"precio"\`
}

type ErrorResp struct {
	Error string \`json:"error"\`
}

// Store en memoria con mutex para seguridad concurrente
var (
	productos   = make(map[int]Producto)
	nextID      = 1
	mu          sync.Mutex
)

func responderJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func listarProductos(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()
	lista := make([]Producto, 0, len(productos))
	for _, p := range productos {
		lista = append(lista, p)
	}
	responderJSON(w, http.StatusOK, lista)
}

func crearProducto(w http.ResponseWriter, r *http.Request) {
	var p Producto
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		responderJSON(w, http.StatusBadRequest, ErrorResp{Error: "JSON inválido"})
		return
	}
	if p.Nombre == "" || p.Precio <= 0 {
		responderJSON(w, http.StatusBadRequest, ErrorResp{Error: "nombre y precio son requeridos"})
		return
	}
	mu.Lock()
	p.ID = nextID
	nextID++
	productos[p.ID] = p
	mu.Unlock()
	responderJSON(w, http.StatusCreated, p)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /productos", listarProductos)
	mux.HandleFunc("POST /productos", crearProducto)
	fmt.Println("API en :8080")
	http.ListenAndServe(":8080", mux)
}`,
				explanation:
					'El patrón completo: una función helper responderJSON evita repetir código. El map con Mutex es seguro para acceso concurrente (cada request HTTP es una goroutine). La validación va antes de la lógica de negocio. Separa cada handler en su propia función para legibilidad y testing.',
				highlightLines: [27, 28, 29, 30, 34, 35, 54, 55, 56],
			},
		],
		playground: true,
		playgroundCode: `package main

import (
	"encoding/json"
	"fmt"
)

// Los struct tags controlan la serialización JSON
type Producto struct {
	ID     int     \`json:"id"\`
	Nombre string  \`json:"nombre"\`
	Precio float64 \`json:"precio"\`
	Stock  int     \`json:"stock,omitempty"\`
}

type ErrorResp struct {
	Error string \`json:"error"\`
}

func main() {
	// Serializar (struct → JSON)
	p := Producto{ID: 1, Nombre: "Teclado", Precio: 49.99, Stock: 0}
	data, _ := json.MarshalIndent(p, "", "  ")
	fmt.Println("Serializado:")
	fmt.Println(string(data))
	// Stock no aparece por omitempty

	// Deserializar (JSON → struct)
	jsonStr := \`{"id": 2, "nombre": "Mouse", "precio": 29.99}\`
	var p2 Producto
	if err := json.Unmarshal([]byte(jsonStr), &p2); err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Printf("\\nDeserializado: %+v\\n", p2)

	// Error de JSON inválido
	jsonMalo := \`{"nombre": sin comillas}\`
	var p3 Producto
	if err := json.Unmarshal([]byte(jsonMalo), &p3); err != nil {
		fmt.Println("\\nError esperado:", err)
	}

	// Experimenta:
	// 1. Agrega un campo "Activo bool" con tag json:"activo"
	// 2. Prueba con json:"-" para ignorar un campo
	// 3. Intenta deserializar con campos extra — ¿qué pasa?
}`,
	},
	{
		id: 'm12-we-002',
		moduleId: 12,
		title: 'Generics en acción',
		description:
			'Exploramos los genéricos de Go paso a paso: desde una función Min genérica hasta un Stack genérico y patrones funcionales como Map y Filter.',
		steps: [
			{
				code: `package main

import (
	"fmt"
	"golang.org/x/exp/constraints"
)

// Sin generics: una función por cada tipo
func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func minFloat(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

// Con generics: UNA función para todos los tipos ordenables
func Min[T constraints.Ordered](a, b T) T {
	if a < b {
		return a
	}
	return b
}

func main() {
	fmt.Println(Min(3, 7))         // int
	fmt.Println(Min(3.14, 2.71))   // float64
	fmt.Println(Min("alfa", "beta")) // string
}`,
				explanation:
					'[T constraints.Ordered] es un parámetro de tipo: T puede ser cualquier tipo que soporte el operador <. constraints.Ordered incluye todos los int, float y string. El compilador genera código especializado para cada tipo usado — no hay costo en runtime.',
				highlightLines: [24, 25, 33, 34, 35],
			},
			{
				code: `package main

import "fmt"

// Stack genérico: funciona con cualquier tipo
type Stack[T any] struct {
	items []T
}

func (s *Stack[T]) Push(item T) {
	s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
	if len(s.items) == 0 {
		var zero T // valor cero del tipo T
		return zero, false
	}
	ultimo := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return ultimo, true
}

func (s *Stack[T]) Peek() (T, bool) {
	if len(s.items) == 0 {
		var zero T
		return zero, false
	}
	return s.items[len(s.items)-1], true
}

func (s *Stack[T]) Len() int {
	return len(s.items)
}

func main() {
	// Stack de strings
	nombres := &Stack[string]{}
	nombres.Push("Alice")
	nombres.Push("Bob")
	nombres.Push("Carlos")

	for nombres.Len() > 0 {
		val, _ := nombres.Pop()
		fmt.Println(val)
	}

	fmt.Println("---")

	// Stack de ints
	numeros := &Stack[int]{}
	numeros.Push(10)
	numeros.Push(20)
	numeros.Push(30)

	tope, ok := numeros.Peek()
	fmt.Printf("Tope: %d (ok: %v)\\n", tope, ok)
}`,
				explanation:
					'Stack[T any] define un struct genérico donde T puede ser cualquier tipo (any = interface{}). Los métodos usan [T] en el receiver: (s *Stack[T]). "var zero T" obtiene el valor cero de cualquier tipo (0 para int, "" para string, nil para punteros). La instanciación es explícita: Stack[string]{}, Stack[int]{}.',
				highlightLines: [6, 7, 10, 14, 16, 38, 50],
			},
			{
				code: `package main

import "fmt"

// Map transforma cada elemento de un slice
func Map[T any, U any](slice []T, fn func(T) U) []U {
	result := make([]U, len(slice))
	for i, v := range slice {
		result[i] = fn(v)
	}
	return result
}

// Filter retorna solo los elementos que cumplen el predicado
func Filter[T any](slice []T, pred func(T) bool) []T {
	var result []T
	for _, v := range slice {
		if pred(v) {
			result = append(result, v)
		}
	}
	return result
}

// Reduce acumula todos los elementos en un valor
func Reduce[T any, U any](slice []T, initial U, fn func(U, T) U) U {
	acc := initial
	for _, v := range slice {
		acc = fn(acc, v)
	}
	return acc
}

func main() {
	nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

	// Filtrar pares
	pares := Filter(nums, func(n int) bool { return n%2 == 0 })
	fmt.Println("Pares:", pares)

	// Cuadrados de los pares
	cuadrados := Map(pares, func(n int) int { return n * n })
	fmt.Println("Cuadrados:", cuadrados)

	// Suma total
	suma := Reduce(cuadrados, 0, func(acc, n int) int { return acc + n })
	fmt.Println("Suma:", suma)

	// Encadenar: nombres → mayúsculas → filtrar cortos
	nombres := []string{"Ana", "Alejandro", "Bo", "Bernardo", "Carlos"}
	largos := Filter(nombres, func(s string) bool { return len(s) > 3 })
	fmt.Println("Nombres largos:", largos)
}`,
				explanation:
					'Map[T, U] permite transformar el tipo: de []T a []U. Filter[T] conserva el tipo. Reduce[T, U] acumula en un tipo diferente. Go infiere los tipos de T y U automáticamente de los argumentos — no necesitas escribir Map[int, int]. Estos patrones funcionales son seguros en tipos y sin costo extra.',
				highlightLines: [6, 15, 26, 38, 42, 46],
			},
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

func Map[T any, U any](s []T, fn func(T) U) []U {
	r := make([]U, len(s))
	for i, v := range s {
		r[i] = fn(v)
	}
	return r
}

func Filter[T any](s []T, pred func(T) bool) []T {
	var r []T
	for _, v := range s {
		if pred(v) {
			r = append(r, v)
		}
	}
	return r
}

func Reduce[T any, U any](s []T, init U, fn func(U, T) U) U {
	acc := init
	for _, v := range s {
		acc = fn(acc, v)
	}
	return acc
}

func main() {
	nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

	// Pipeline: filtrar pares → cuadrados → suma
	resultado := Reduce(
		Map(
			Filter(nums, func(n int) bool { return n%2 == 0 }),
			func(n int) int { return n * n },
		),
		0,
		func(acc, n int) int { return acc + n },
	)
	fmt.Println("Suma de cuadrados de pares:", resultado)

	// Experimenta:
	// 1. Crea una función Contains[T comparable](slice []T, target T) bool
	// 2. Haz un Map que convierta []int a []string con fmt.Sprintf
	// 3. Implementa Unique[T comparable](slice []T) []T
}`,
	},
];

export const exercises: Exercise[] = [
	{
		id: 'm12-ex-001',
		moduleId: 12,
		tier: 'fill-in-blank',
		difficulty: 'intermediate',
		title: 'Table-driven test para función de suma',
		description:
			'Completa los blancos para crear un test table-driven que verifique una función Sumar. Este es el patrón estándar de testing en Go.',
		baseCode: `package main

import "testing"

func Sumar(a, b int) int {
	return a + b
}

func TestSumar(t *testing.T) {
	___ := []struct {
		nombre   string
		a, b     int
		esperado int
	}{
		{"positivos", 2, 3, 5},
		{"negativos", -1, -2, -3},
		{"cero", 0, 0, 0},
		{"mixto", -5, 10, 5},
	}

	for _, ___ := range tests {
		t.___(tc.nombre, func(t *testing.T) {
			resultado := Sumar(tc.a, tc.___)
			if resultado != tc.___ {
				t.___("Sumar(%d, %d) = %d, esperado %d",
					tc.a, tc.b, resultado, tc.esperado)
			}
		})
	}
}`,
		solution: `package main

import "testing"

func Sumar(a, b int) int {
	return a + b
}

func TestSumar(t *testing.T) {
	tests := []struct {
		nombre   string
		a, b     int
		esperado int
	}{
		{"positivos", 2, 3, 5},
		{"negativos", -1, -2, -3},
		{"cero", 0, 0, 0},
		{"mixto", -5, 10, 5},
	}

	for _, tc := range tests {
		t.Run(tc.nombre, func(t *testing.T) {
			resultado := Sumar(tc.a, tc.b)
			if resultado != tc.esperado {
				t.Errorf("Sumar(%d, %d) = %d, esperado %d",
					tc.a, tc.b, resultado, tc.esperado)
			}
		})
	}
}`,
		expectedOutput: `=== RUN   TestSumar
=== RUN   TestSumar/positivos
=== RUN   TestSumar/negativos
=== RUN   TestSumar/cero
=== RUN   TestSumar/mixto
--- PASS: TestSumar (0.00s)
    --- PASS: TestSumar/positivos (0.00s)
    --- PASS: TestSumar/negativos (0.00s)
    --- PASS: TestSumar/cero (0.00s)
    --- PASS: TestSumar/mixto (0.00s)
PASS`,
		hints: [
			'El patrón table-driven en Go usa un slice de structs anónimos. Cada caso tiene un nombre que se pasa a t.Run() para crear subtests. La variable del loop se llama típicamente "tc" (test case).',
			'Los blancos son: tests, tc, Run, b, esperado, Errorf. t.Run crea subtests con nombre. t.Errorf reporta un fallo sin detener el test (a diferencia de t.Fatalf que sí detiene).',
		],
		points: 4,
		concepts: ['table-driven-tests', 'subtests', 't-run', 't-errorf', 'testing-package'],
	},
	{
		id: 'm12-ex-002',
		moduleId: 12,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'Handler HTTP con bugs',
		description:
			'Este handler REST tiene 3 bugs: acepta cualquier método HTTP, no establece Content-Type, y no maneja el error de JSON decode. Encuéntralos y corrígelos.',
		baseCode: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Usuario struct {
	Nombre string \`json:"nombre"\`
	Email  string \`json:"email"\`
	Edad   int    \`json:"edad"\`
}

type ErrorResp struct {
	Error string \`json:"error"\`
}

func crearUsuario(w http.ResponseWriter, r *http.Request) {
	// Bug 1: no verifica el método HTTP
	var u Usuario
	json.NewDecoder(r.Body).Decode(&u) // Bug 2: ignora el error de Decode

	// Bug 3: no establece Content-Type antes de escribir
	if u.Nombre == "" || u.Email == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResp{Error: "nombre y email son requeridos"})
		return
	}

	u.Edad = maxEdad(u.Edad, 0) // asegurar no negativa
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(u)
}

func maxEdad(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/usuarios", crearUsuario)
	fmt.Println("Servidor en :8080")
	http.ListenAndServe(":8080", mux)
}`,
		solution: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Usuario struct {
	Nombre string \`json:"nombre"\`
	Email  string \`json:"email"\`
	Edad   int    \`json:"edad"\`
}

type ErrorResp struct {
	Error string \`json:"error"\`
}

func crearUsuario(w http.ResponseWriter, r *http.Request) {
	// Fix 1: verificar que el método sea POST
	if r.Method != http.MethodPost {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed) // 405
		json.NewEncoder(w).Encode(ErrorResp{Error: "solo se permite POST"})
		return
	}

	var u Usuario
	// Fix 2: manejar el error de Decode
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResp{Error: "JSON inválido: " + err.Error()})
		return
	}

	// Fix 3: establecer Content-Type antes de escribir
	w.Header().Set("Content-Type", "application/json")
	if u.Nombre == "" || u.Email == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResp{Error: "nombre y email son requeridos"})
		return
	}

	u.Edad = maxEdad(u.Edad, 0)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(u)
}

func maxEdad(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/usuarios", crearUsuario)
	fmt.Println("Servidor en :8080")
	http.ListenAndServe(":8080", mux)
}`,
		hints: [
			'Piensa como un atacante: ¿qué pasa si envío un GET a este endpoint? ¿qué pasa si el body no es JSON válido? ¿cómo sabe el cliente que la respuesta es JSON?',
			'Bug 1: agrega verificación de r.Method != http.MethodPost al inicio, retornando 405. Bug 2: guarda el error de Decode y retorna 400 si falla. Bug 3: agrega w.Header().Set("Content-Type", "application/json") antes de cada respuesta.',
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['http-handler', 'method-check', 'content-type', 'json-decode', 'error-handling'],
	},
	{
		id: 'm12-ex-003',
		moduleId: 12,
		tier: 'debugging',
		difficulty: 'advanced',
		title: 'Función genérica con errores de constraint',
		description:
			'Este código con genéricos tiene 3 bugs: un constraint incorrecto, un tipo que no cumple la interfaz, y un error en la instanciación del tipo genérico. Encuéntralos.',
		baseCode: `package main

import "fmt"

// Constraint personalizado para tipos numéricos
type Numero interface {
	int | float64 // Bug 1: falta ~ para tipos derivados
}

// Sumar todos los elementos de un slice
func Sumar[T Numero](nums []T) T {
	var total T
	for _, n := range nums {
		total += n
	}
	return total
}

// Tipo derivado de int
type Puntos int

// Contains busca un elemento en un slice
func Contains[T any](slice []T, target T) bool { // Bug 2: any no soporta ==
	for _, v := range slice {
		if v == target {
			return true
		}
	}
	return false
}

// Pair genérico
type Pair[T any, U any] struct {
	First  T
	Second U
}

func main() {
	// Sumar enteros
	enteros := []int{1, 2, 3, 4, 5}
	fmt.Println("Suma enteros:", Sumar(enteros))

	// Sumar con tipo derivado
	puntos := []Puntos{10, 20, 30}
	fmt.Println("Suma puntos:", Sumar(puntos)) // falla sin ~

	// Contains
	nombres := []string{"Ana", "Bob", "Carlos"}
	fmt.Println("¿Tiene Bob?:", Contains(nombres, "Bob"))

	// Pair — Bug 3: sintaxis de instanciación incorrecta
	p := Pair{First: "edad", Second: 25} // falta parámetros de tipo
	fmt.Printf("Par: %s = %d\\n", p.First, p.Second)
}`,
		solution: `package main

import "fmt"

// Fix 1: ~ permite tipos derivados (type Puntos int)
type Numero interface {
	~int | ~float64
}

// Sumar todos los elementos de un slice
func Sumar[T Numero](nums []T) T {
	var total T
	for _, n := range nums {
		total += n
	}
	return total
}

// Tipo derivado de int
type Puntos int

// Fix 2: comparable permite usar == y !=
func Contains[T comparable](slice []T, target T) bool {
	for _, v := range slice {
		if v == target {
			return true
		}
	}
	return false
}

// Pair genérico
type Pair[T any, U any] struct {
	First  T
	Second U
}

func main() {
	// Sumar enteros
	enteros := []int{1, 2, 3, 4, 5}
	fmt.Println("Suma enteros:", Sumar(enteros))

	// Sumar con tipo derivado
	puntos := []Puntos{10, 20, 30}
	fmt.Println("Suma puntos:", Sumar(puntos))

	// Contains
	nombres := []string{"Ana", "Bob", "Carlos"}
	fmt.Println("¿Tiene Bob?:", Contains(nombres, "Bob"))

	// Fix 3: especificar parámetros de tipo en la instanciación
	p := Pair[string, int]{First: "edad", Second: 25}
	fmt.Printf("Par: %s = %d\\n", p.First, p.Second)
}`,
		expectedOutput: `Suma enteros: 15
Suma puntos: 60
¿Tiene Bob?: true
Par: edad = 25`,
		hints: [
			'El operador ~ en constraints permite tipos cuyo tipo subyacente coincida (ej: ~int acepta tanto int como type Puntos int). Sin ~, solo acepta el tipo exacto.',
			'Bug 1: cambia "int | float64" a "~int | ~float64". Bug 2: cambia "any" a "comparable" — any no garantiza que el tipo soporte ==. Bug 3: cambia Pair{...} a Pair[string, int]{...} — Go necesita los parámetros de tipo explícitos al instanciar structs genéricos.',
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: [
			'generics',
			'type-constraints',
			'comparable',
			'tilde-operator',
			'type-instantiation',
		],
	},
	{
		id: 'm12-ex-004',
		moduleId: 12,
		tier: 'mini-project',
		difficulty: 'advanced',
		title: 'API REST con tests y generics',
		description:
			'Construye una mini API REST con almacenamiento en memoria, table-driven tests y una función utilitaria genérica. Requisitos:\n\n1. Struct `Tarea` con ID, Titulo, Completada y tags JSON\n2. Handler `GET /tareas` que responda JSON con lista de tareas\n3. Handler `POST /tareas` que cree una tarea (validar titulo no vacío)\n4. Función genérica `Filter[T any]` que filtre slices por predicado\n5. Test table-driven para `Filter` con al menos 3 casos\n6. Test para el handler GET usando httptest.NewRecorder',
		baseCode: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
)

// --- Modelos ---

// TODO: Definir struct Tarea con campos ID (int), Titulo (string),
// Completada (bool) y tags JSON apropiados
type Tarea struct {
	// TODO
}

type ErrorResp struct {
	Error string \`json:"error"\`
}

// --- Store en memoria ---

var (
	tareas = make(map[int]Tarea)
	nextID = 1
	mu     sync.Mutex
)

// --- Función genérica ---

// TODO: Implementar Filter[T any] que reciba un []T y un predicado func(T) bool
// y retorne un nuevo []T solo con los elementos que cumplen el predicado

// --- Handlers ---

func responderJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// TODO: Implementar listarTareas — lee todas las tareas del map,
// usa Filter para retornar solo las no completadas si query param
// "pendientes=true" está presente

// TODO: Implementar crearTarea — decode JSON, validar titulo no vacío,
// asignar ID, guardar en map, responder 201

// --- Tests ---

// TODO: Implementar TestFilter con table-driven tests
// Casos mínimos: filtrar pares, filtrar strings largos, slice vacío
func TestFilter(t *testing.T) {
	// TODO
}

// TODO: Implementar TestListarTareas usando httptest
// Crear algunas tareas en el store, hacer request GET, verificar status y body
func TestListarTareas(t *testing.T) {
	// TODO
}

// --- Main ---

func main() {
	mux := http.NewServeMux()
	// TODO: registrar handlers
	fmt.Println("API de Tareas en :8080")
	http.ListenAndServe(":8080", mux)
}`,
		solution: `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
)

// --- Modelos ---

type Tarea struct {
	ID         int    \`json:"id"\`
	Titulo     string \`json:"titulo"\`
	Completada bool   \`json:"completada"\`
}

type ErrorResp struct {
	Error string \`json:"error"\`
}

// --- Store en memoria ---

var (
	tareas = make(map[int]Tarea)
	nextID = 1
	mu     sync.Mutex
)

// --- Función genérica ---

func Filter[T any](slice []T, pred func(T) bool) []T {
	var result []T
	for _, v := range slice {
		if pred(v) {
			result = append(result, v)
		}
	}
	return result
}

// --- Handlers ---

func responderJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func listarTareas(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	lista := make([]Tarea, 0, len(tareas))
	for _, t := range tareas {
		lista = append(lista, t)
	}
	mu.Unlock()

	// Filtrar pendientes si se solicita
	if r.URL.Query().Get("pendientes") == "true" {
		lista = Filter(lista, func(t Tarea) bool {
			return !t.Completada
		})
	}

	responderJSON(w, http.StatusOK, lista)
}

func crearTarea(w http.ResponseWriter, r *http.Request) {
	var t Tarea
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		responderJSON(w, http.StatusBadRequest, ErrorResp{Error: "JSON inválido"})
		return
	}

	if strings.TrimSpace(t.Titulo) == "" {
		responderJSON(w, http.StatusBadRequest, ErrorResp{Error: "titulo es requerido"})
		return
	}

	mu.Lock()
	t.ID = nextID
	nextID++
	t.Completada = false
	tareas[t.ID] = t
	mu.Unlock()

	responderJSON(w, http.StatusCreated, t)
}

// --- Tests ---

func TestFilter(t *testing.T) {
	tests := []struct {
		nombre   string
		input    []int
		pred     func(int) bool
		esperado []int
	}{
		{
			nombre:   "filtrar pares",
			input:    []int{1, 2, 3, 4, 5, 6},
			pred:     func(n int) bool { return n%2 == 0 },
			esperado: []int{2, 4, 6},
		},
		{
			nombre:   "ninguno cumple",
			input:    []int{1, 3, 5},
			pred:     func(n int) bool { return n%2 == 0 },
			esperado: nil,
		},
		{
			nombre:   "slice vacío",
			input:    []int{},
			pred:     func(n int) bool { return true },
			esperado: nil,
		},
		{
			nombre:   "todos cumplen",
			input:    []int{2, 4, 6},
			pred:     func(n int) bool { return n%2 == 0 },
			esperado: []int{2, 4, 6},
		},
	}

	for _, tc := range tests {
		t.Run(tc.nombre, func(t *testing.T) {
			resultado := Filter(tc.input, tc.pred)
			if len(resultado) != len(tc.esperado) {
				t.Errorf("Filter() retornó %d elementos, esperado %d", len(resultado), len(tc.esperado))
				return
			}
			for i := range resultado {
				if resultado[i] != tc.esperado[i] {
					t.Errorf("Filter()[%d] = %d, esperado %d", i, resultado[i], tc.esperado[i])
				}
			}
		})
	}
}

func TestListarTareas(t *testing.T) {
	// Limpiar store y agregar datos de prueba
	mu.Lock()
	tareas = map[int]Tarea{
		1: {ID: 1, Titulo: "Aprender Go", Completada: false},
		2: {ID: 2, Titulo: "Escribir tests", Completada: true},
		3: {ID: 3, Titulo: "Crear API", Completada: false},
	}
	mu.Unlock()

	tests := []struct {
		nombre         string
		queryString    string
		expectedStatus int
		expectedCount  int
	}{
		{"todas las tareas", "", http.StatusOK, 3},
		{"solo pendientes", "?pendientes=true", http.StatusOK, 2},
	}

	for _, tc := range tests {
		t.Run(tc.nombre, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/tareas"+tc.queryString, nil)
			rec := httptest.NewRecorder()
			listarTareas(rec, req)

			if rec.Code != tc.expectedStatus {
				t.Errorf("status = %d, esperado %d", rec.Code, tc.expectedStatus)
			}

			var resultado []Tarea
			json.NewDecoder(rec.Body).Decode(&resultado)
			if len(resultado) != tc.expectedCount {
				t.Errorf("retornó %d tareas, esperado %d", len(resultado), tc.expectedCount)
			}
		})
	}
}

// --- Main ---

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /tareas", listarTareas)
	mux.HandleFunc("POST /tareas", crearTarea)
	fmt.Println("API de Tareas en :8080")
	http.ListenAndServe(":8080", mux)
}`,
		hints: [
			'Filter[T any] sigue el patrón: crear slice resultado, iterar con range, hacer append si pred(v) es true. Para httptest, usa httptest.NewRequest para crear un request falso y httptest.NewRecorder para capturar la respuesta.',
			'Para los tests de Filter, usa un slice de structs con nombre, input, predicado y esperado. Para TestListarTareas: (1) pre-carga el map con datos de prueba, (2) crea request con httptest.NewRequest("GET", "/tareas", nil), (3) crea recorder con httptest.NewRecorder(), (4) llama listarTareas(rec, req) directamente, (5) verifica rec.Code y decodifica rec.Body.',
		],
		points: 8,
		concepts: [
			'rest-api',
			'json-encoding',
			'table-driven-tests',
			'httptest',
			'generics',
			'filter',
			'mutex',
			'http-handlers',
		],
	},
];

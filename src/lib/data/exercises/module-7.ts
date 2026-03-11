import type { Exercise, WorkedExample } from './types';

// =============================================================================
// Module 7: Interfaces — Duck Typing, Type Assertions, Composición
// =============================================================================

export const workedExamples: WorkedExample[] = [
	// -------------------------------------------------------------------------
	// WE-001: Interfaces implícitas y fmt.Stringer
	// -------------------------------------------------------------------------
	{
		id: 'm7-we-001',
		moduleId: 7,
		title: 'Interfaces implícitas',
		description:
			'Entendemos cómo Go implementa interfaces de forma implícita (sin "implements") y cómo usar fmt.Stringer.',
		steps: [
			{
				code: `package main

import "fmt"

// Definir una interfaz
type Describible interface {
	Describir() string
}

// Cualquier tipo con Describir() string la satisface automáticamente
type Perro struct {
	Nombre string
	Raza   string
}

func (p Perro) Describir() string {
	return fmt.Sprintf("%s (%s)", p.Nombre, p.Raza)
}

func main() {
	var d Describible = Perro{Nombre: "Rex", Raza: "Pastor Alemán"}
	fmt.Println(d.Describir())
}`,
				explanation:
					'En Go, no escribes "implements". Si un tipo tiene todos los métodos de una interfaz, la satisface automáticamente. Esto es "duck typing": si camina como pato y hace cuac, es un pato.',
				highlightLines: [6, 7, 8, 16, 21]
			},
			{
				code: `package main

import "fmt"

type Describible interface {
	Describir() string
}

type Perro struct {
	Nombre string
	Raza   string
}

func (p Perro) Describir() string {
	return fmt.Sprintf("%s (%s)", p.Nombre, p.Raza)
}

type Gato struct {
	Nombre string
	Indoor bool
}

func (g Gato) Describir() string {
	tipo := "exterior"
	if g.Indoor {
		tipo = "interior"
	}
	return fmt.Sprintf("%s (gato %s)", g.Nombre, tipo)
}

// Función que acepta la interfaz — polimorfismo
func presentar(d Describible) {
	fmt.Println("Presentando:", d.Describir())
}

func main() {
	animales := []Describible{
		Perro{Nombre: "Rex", Raza: "Pastor Alemán"},
		Gato{Nombre: "Michi", Indoor: true},
		Perro{Nombre: "Luna", Raza: "Labrador"},
	}

	for _, a := range animales {
		presentar(a)
	}
}`,
				explanation:
					'Múltiples tipos pueden satisfacer la misma interfaz. Esto permite crear slices polimórficos y funciones que trabajan con cualquier tipo que cumpla el contrato.',
				highlightLines: [33, 38, 39, 40, 41]
			},
			{
				code: `package main

import "fmt"

// fmt.Stringer es una interfaz de la librería estándar:
// type Stringer interface { String() string }

type Moneda struct {
	Cantidad float64
	Divisa   string
}

// Al implementar String(), fmt.Println usará nuestro formato
func (m Moneda) String() string {
	return fmt.Sprintf("%.2f %s", m.Cantidad, m.Divisa)
}

func main() {
	precio := Moneda{Cantidad: 42.50, Divisa: "EUR"}
	fmt.Println(precio)         // Llama a String() automáticamente
	fmt.Println("Precio:", precio)
}`,
				explanation:
					'fmt.Stringer es una de las interfaces más útiles de Go. Cualquier tipo que implemente String() string controla cómo se muestra con fmt.Println, Printf %v, etc.',
				highlightLines: [14, 15, 16, 20, 21]
			},
			{
				code: `package main

import "fmt"

// Interfaces pequeñas y componibles — estilo Go
type Lector interface {
	Leer() string
}

type Escritor interface {
	Escribir(datos string)
}

// Componer interfaces
type LectorEscritor interface {
	Lector
	Escritor
}

type Archivo struct {
	nombre    string
	contenido string
}

func (a Archivo) Leer() string {
	return a.contenido
}

func (a *Archivo) Escribir(datos string) {
	a.contenido = datos
}

func main() {
	arch := &Archivo{nombre: "notas.txt"}

	// Satisface Escritor
	var w Escritor = arch
	w.Escribir("Hola desde Go")

	// Satisface Lector
	var r Lector = arch
	fmt.Println(r.Leer())

	// Satisface LectorEscritor (ambas)
	var rw LectorEscritor = arch
	rw.Escribir("Actualizado")
	fmt.Println(rw.Leer())
}`,
				explanation:
					'Go favorece interfaces pequeñas (1-2 métodos) que se componen. io.Reader, io.Writer, io.ReadWriter siguen exactamente este patrón. Menos es más.',
				highlightLines: [6, 10, 15, 16, 17, 44]
			}
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

type Describible interface {
	Describir() string
}

type Perro struct {
	Nombre string
	Raza   string
}

func (p Perro) Describir() string {
	return fmt.Sprintf("%s (%s)", p.Nombre, p.Raza)
}

type Gato struct {
	Nombre string
	Indoor bool
}

func (g Gato) Describir() string {
	tipo := "exterior"
	if g.Indoor {
		tipo = "interior"
	}
	return fmt.Sprintf("%s (gato %s)", g.Nombre, tipo)
}

// Prueba agregar un nuevo tipo que implemente Describible
func main() {
	animales := []Describible{
		Perro{"Rex", "Pastor Alemán"},
		Gato{"Michi", true},
	}

	for _, a := range animales {
		fmt.Println(a.Describir())
	}
}`
	},

	// -------------------------------------------------------------------------
	// WE-002: Type assertions y type switches
	// -------------------------------------------------------------------------
	{
		id: 'm7-we-002',
		moduleId: 7,
		title: 'Type assertions y type switches',
		description:
			'Aprendemos a recuperar el tipo concreto detrás de una interfaz de forma segura.',
		steps: [
			{
				code: `package main

import "fmt"

type Forma interface {
	Area() float64
}

type Circulo struct {
	Radio float64
}

func (c Circulo) Area() float64 {
	return 3.14159 * c.Radio * c.Radio
}

type Cuadrado struct {
	Lado float64
}

func (cu Cuadrado) Area() float64 {
	return cu.Lado * cu.Lado
}

func main() {
	var f Forma = Circulo{Radio: 5}

	// Type assertion — puede causar panic si falla
	c := f.(Circulo)
	fmt.Printf("Es un círculo con radio %.1f\\n", c.Radio)
}`,
				explanation:
					'Una type assertion f.(Tipo) extrae el tipo concreto de una interfaz. Si el tipo no coincide, causa panic. Útil cuando estás 100% seguro del tipo.',
				highlightLines: [28, 29]
			},
			{
				code: `package main

import "fmt"

type Forma interface {
	Area() float64
}

type Circulo struct{ Radio float64 }
type Cuadrado struct{ Lado float64 }

func (c Circulo) Area() float64  { return 3.14159 * c.Radio * c.Radio }
func (cu Cuadrado) Area() float64 { return cu.Lado * cu.Lado }

func main() {
	var f Forma = Cuadrado{Lado: 4}

	// Type assertion SEGURA con "comma ok"
	c, ok := f.(Circulo)
	if ok {
		fmt.Printf("Círculo con radio %.1f\\n", c.Radio)
	} else {
		fmt.Println("No es un círculo")
	}

	// Verificar el tipo real
	cu, ok := f.(Cuadrado)
	if ok {
		fmt.Printf("Cuadrado con lado %.1f\\n", cu.Lado)
	}
}`,
				explanation:
					'La forma segura usa dos valores de retorno: valor, ok. Si ok es false, valor tiene el zero value del tipo. Nunca causa panic.',
				highlightLines: [19, 20, 28, 29]
			},
			{
				code: `package main

import "fmt"

type Forma interface {
	Area() float64
}

type Circulo struct{ Radio float64 }
type Cuadrado struct{ Lado float64 }
type Triangulo struct{ Base, Altura float64 }

func (c Circulo) Area() float64    { return 3.14159 * c.Radio * c.Radio }
func (cu Cuadrado) Area() float64  { return cu.Lado * cu.Lado }
func (t Triangulo) Area() float64  { return t.Base * t.Altura / 2 }

// Type switch — la forma idiomática de manejar múltiples tipos
func describir(f Forma) string {
	switch v := f.(type) {
	case Circulo:
		return fmt.Sprintf("Círculo (radio=%.1f, área=%.2f)", v.Radio, v.Area())
	case Cuadrado:
		return fmt.Sprintf("Cuadrado (lado=%.1f, área=%.2f)", v.Lado, v.Area())
	case Triangulo:
		return fmt.Sprintf("Triángulo (base=%.1f, altura=%.1f, área=%.2f)", v.Base, v.Altura, v.Area())
	default:
		return fmt.Sprintf("Forma desconocida (área=%.2f)", f.Area())
	}
}

func main() {
	formas := []Forma{
		Circulo{Radio: 5},
		Cuadrado{Lado: 4},
		Triangulo{Base: 6, Altura: 3},
	}

	for _, f := range formas {
		fmt.Println(describir(f))
	}
}`,
				explanation:
					'El type switch es la forma idiomática en Go para actuar según el tipo concreto. La variable v ya tiene el tipo correcto en cada case — no necesitas otra assertion.',
				highlightLines: [19, 20, 22, 24, 27]
			}
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

type Forma interface {
	Area() float64
}

type Circulo struct{ Radio float64 }
type Cuadrado struct{ Lado float64 }
type Triangulo struct{ Base, Altura float64 }

func (c Circulo) Area() float64    { return 3.14159 * c.Radio * c.Radio }
func (cu Cuadrado) Area() float64  { return cu.Lado * cu.Lado }
func (t Triangulo) Area() float64  { return t.Base * t.Altura / 2 }

func describir(f Forma) string {
	switch v := f.(type) {
	case Circulo:
		return fmt.Sprintf("Círculo (radio=%.1f, área=%.2f)", v.Radio, v.Area())
	case Cuadrado:
		return fmt.Sprintf("Cuadrado (lado=%.1f, área=%.2f)", v.Lado, v.Area())
	case Triangulo:
		return fmt.Sprintf("Triángulo (base=%.1f, h=%.1f, área=%.2f)", v.Base, v.Altura, v.Area())
	default:
		return fmt.Sprintf("Forma desconocida (área=%.2f)", f.Area())
	}
}

func main() {
	formas := []Forma{
		Circulo{5},
		Cuadrado{4},
		Triangulo{6, 3},
	}

	for _, f := range formas {
		fmt.Println(describir(f))
	}

	// Prueba type assertion segura
	var f Forma = Circulo{Radio: 10}
	if c, ok := f.(Circulo); ok {
		fmt.Printf("\\nRadio extraído: %.1f\\n", c.Radio)
	}
}`
	}
];

export const exercises: Exercise[] = [
	// -------------------------------------------------------------------------
	// Tier 1: Completion — Implementar una interfaz
	// -------------------------------------------------------------------------
	{
		id: 'm7-ex-001',
		moduleId: 7,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Animales que hablan',
		description:
			'Completa el código para que Perro y Gato implementen la interfaz Hablante y puedan usarse polimórficamente.',
		baseCode: `package main

import "fmt"

type Hablante interface {
	Hablar() string
}

type Perro struct {
	Nombre string
}

type Gato struct {
	Nombre string
}

// Implementa Hablar() para Perro — debe retornar "¡Guau! Soy <nombre>"
___

// Implementa Hablar() para Gato — debe retornar "¡Miau! Soy <nombre>"
___

func presentar(h Hablante) {
	fmt.Println(h.Hablar())
}

func main() {
	animales := []Hablante{
		Perro{Nombre: "Rex"},
		Gato{Nombre: "Michi"},
		Perro{Nombre: "Luna"},
	}

	for _, a := range animales {
		presentar(a)
	}
}`,
		solution: `package main

import "fmt"

type Hablante interface {
	Hablar() string
}

type Perro struct {
	Nombre string
}

type Gato struct {
	Nombre string
}

// Implementa Hablar() para Perro
func (p Perro) Hablar() string {
	return fmt.Sprintf("¡Guau! Soy %s", p.Nombre)
}

// Implementa Hablar() para Gato
func (g Gato) Hablar() string {
	return fmt.Sprintf("¡Miau! Soy %s", g.Nombre)
}

func presentar(h Hablante) {
	fmt.Println(h.Hablar())
}

func main() {
	animales := []Hablante{
		Perro{Nombre: "Rex"},
		Gato{Nombre: "Michi"},
		Perro{Nombre: "Luna"},
	}

	for _, a := range animales {
		presentar(a)
	}
}`,
		expectedOutput: `¡Guau! Soy Rex
¡Miau! Soy Michi
¡Guau! Soy Luna`,
		hints: [
			'Un método en Go se declara: func (receptor Tipo) NombreMetodo() TipoRetorno { ... }',
			'Para satisfacer la interfaz Hablante, cada tipo necesita: func (x Tipo) Hablar() string'
		],
		points: 3,
		concepts: ['interfaces', 'implicit-implementation', 'polymorphism']
	},

	// -------------------------------------------------------------------------
	// Tier 2: Fill-in-blank — Type switch
	// -------------------------------------------------------------------------
	{
		id: 'm7-ex-002',
		moduleId: 7,
		tier: 'fill-in-blank',
		difficulty: 'intermediate',
		title: 'Clasificador de formas',
		description:
			'Rellena los blancos en el type switch para clasificar formas geométricas y calcular sus áreas.',
		baseCode: `package main

import (
	"fmt"
	"math"
)

type Forma interface {
	Area() float64
}

type Circulo struct{ Radio float64 }
type Rectangulo struct{ Ancho, Alto float64 }

func (c Circulo) Area() float64    { return math.Pi * c.Radio * c.Radio }
func (r Rectangulo) Area() float64 { return r.Ancho * r.Alto }

func clasificar(f Forma) string {
	switch ___ := f.___ {
	case ___:
		return fmt.Sprintf("Círculo de radio %.1f → área: %.2f", ___.Radio, ___.Area())
	case ___:
		return fmt.Sprintf("Rectángulo %gx%g → área: %.2f", ___.Ancho, ___.Alto, ___.Area())
	___:
		return fmt.Sprintf("Forma desconocida → área: %.2f", f.Area())
	}
}

func main() {
	formas := []Forma{
		Circulo{Radio: 3},
		Rectangulo{Ancho: 4, Alto: 6},
	}

	for _, f := range formas {
		fmt.Println(clasificar(f))
	}
}`,
		solution: `package main

import (
	"fmt"
	"math"
)

type Forma interface {
	Area() float64
}

type Circulo struct{ Radio float64 }
type Rectangulo struct{ Ancho, Alto float64 }

func (c Circulo) Area() float64    { return math.Pi * c.Radio * c.Radio }
func (r Rectangulo) Area() float64 { return r.Ancho * r.Alto }

func clasificar(f Forma) string {
	switch v := f.(type) {
	case Circulo:
		return fmt.Sprintf("Círculo de radio %.1f → área: %.2f", v.Radio, v.Area())
	case Rectangulo:
		return fmt.Sprintf("Rectángulo %gx%g → área: %.2f", v.Ancho, v.Alto, v.Area())
	default:
		return fmt.Sprintf("Forma desconocida → área: %.2f", f.Area())
	}
}

func main() {
	formas := []Forma{
		Circulo{Radio: 3},
		Rectangulo{Ancho: 4, Alto: 6},
	}

	for _, f := range formas {
		fmt.Println(clasificar(f))
	}
}`,
		expectedOutput: `Círculo de radio 3.0 → área: 28.27
Rectángulo 4x6 → área: 24.00`,
		hints: [
			'La sintaxis del type switch es: switch v := f.(type) { case Tipo: ... }',
			'Cada case nombra un tipo concreto (Circulo, Rectangulo). v ya tiene el tipo correcto dentro del case. El caso por defecto es "default:".'
		],
		points: 4,
		concepts: ['interfaces', 'type-switch', 'type-assertion']
	},

	// -------------------------------------------------------------------------
	// Tier 3: Debugging — Interfaz no satisfecha
	// -------------------------------------------------------------------------
	{
		id: 'm7-ex-003',
		moduleId: 7,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'La interfaz que nadie implementa',
		description:
			'Este programa define una interfaz Imprimible pero falla al compilar. Encuentra los 2 errores que impiden que los tipos satisfagan la interfaz.',
		baseCode: `package main

import "fmt"

type Imprimible interface {
	String() string
	Tipo() string
}

type Libro struct {
	Titulo string
	Autor  string
}

func (l Libro) String() string {
	return fmt.Sprintf("%s por %s", l.Titulo, l.Autor)
}

type Pelicula struct {
	Titulo   string
	Director string
	Año      int
}

func (p Pelicula) string() string {
	return fmt.Sprintf("%s (%d) dir. %s", p.Titulo, p.Año, p.Director)
}

func (p Pelicula) Tipo() string {
	return "Película"
}

func imprimir(items []Imprimible) {
	for _, item := range items {
		fmt.Printf("[%s] %s\\n", item.Tipo(), item.String())
	}
}

func main() {
	items := []Imprimible{
		Libro{Titulo: "El Quijote", Autor: "Cervantes"},
		Pelicula{Titulo: "Inception", Director: "Nolan", Año: 2010},
	}
	imprimir(items)
}`,
		solution: `package main

import "fmt"

type Imprimible interface {
	String() string
	Tipo() string
}

type Libro struct {
	Titulo string
	Autor  string
}

func (l Libro) String() string {
	return fmt.Sprintf("%s por %s", l.Titulo, l.Autor)
}

func (l Libro) Tipo() string {
	return "Libro"
}

type Pelicula struct {
	Titulo   string
	Director string
	Año      int
}

func (p Pelicula) String() string {
	return fmt.Sprintf("%s (%d) dir. %s", p.Titulo, p.Año, p.Director)
}

func (p Pelicula) Tipo() string {
	return "Película"
}

func imprimir(items []Imprimible) {
	for _, item := range items {
		fmt.Printf("[%s] %s\\n", item.Tipo(), item.String())
	}
}

func main() {
	items := []Imprimible{
		Libro{Titulo: "El Quijote", Autor: "Cervantes"},
		Pelicula{Titulo: "Inception", Director: "Nolan", Año: 2010},
	}
	imprimir(items)
}`,
		expectedOutput: `[Libro] El Quijote por Cervantes
[Película] Inception (2010) dir. Nolan`,
		hints: [
			'La interfaz requiere DOS métodos: String() y Tipo(). ¿Los implementan ambos tipos?',
			'Libro no tiene Tipo(). Pelicula tiene string() con minúscula — en Go, los métodos exportados empiezan con mayúscula.'
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['interfaces', 'implicit-implementation', 'exported-methods']
	},

	// -------------------------------------------------------------------------
	// Tier 3: Debugging — Type assertion panic
	// -------------------------------------------------------------------------
	{
		id: 'm7-ex-004',
		moduleId: 7,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'El type assertion explosivo',
		description:
			'Este programa usa type assertions pero causa panic en runtime. Encuentra los 2 bugs y haz que sea seguro.',
		baseCode: `package main

import "fmt"

type Vehiculo interface {
	Velocidad() int
}

type Auto struct {
	Marca string
	VelMax int
}

func (a Auto) Velocidad() int { return a.VelMax }

type Bicicleta struct {
	Tipo string
}

func (b Bicicleta) Velocidad() int { return 25 }

func describir(v Vehiculo) {
	// Bug 1: type assertion sin verificación
	auto := v.(Auto)
	fmt.Printf("Auto marca %s, vel máx: %d km/h\\n", auto.Marca, auto.VelMax)
}

func main() {
	vehiculos := []Vehiculo{
		Auto{Marca: "Toyota", VelMax: 180},
		Bicicleta{Tipo: "montaña"},
	}

	for _, v := range vehiculos {
		describir(v)
	}
}`,
		solution: `package main

import "fmt"

type Vehiculo interface {
	Velocidad() int
}

type Auto struct {
	Marca  string
	VelMax int
}

func (a Auto) Velocidad() int { return a.VelMax }

type Bicicleta struct {
	Tipo string
}

func (b Bicicleta) Velocidad() int { return 25 }

func describir(v Vehiculo) {
	switch veh := v.(type) {
	case Auto:
		fmt.Printf("Auto marca %s, vel máx: %d km/h\n", veh.Marca, veh.VelMax)
	case Bicicleta:
		fmt.Printf("Bicicleta tipo %s, vel máx: %d km/h\n", veh.Tipo, veh.Velocidad())
	default:
		fmt.Printf("Vehículo desconocido, vel: %d km/h\n", v.Velocidad())
	}
}

func main() {
	vehiculos := []Vehiculo{
		Auto{Marca: "Toyota", VelMax: 180},
		Bicicleta{Tipo: "montaña"},
	}

	for _, v := range vehiculos {
		describir(v)
	}
}`,
		expectedOutput: `Auto marca Toyota, vel máx: 180 km/h
Bicicleta tipo montaña, vel máx: 25 km/h`,
		hints: [
			'v.(Auto) causa panic si v no es un Auto. ¿Qué pasa cuando v es una Bicicleta?',
			'Usa un type switch o la forma segura auto, ok := v.(Auto) para evitar panics.'
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['interfaces', 'type-assertion', 'type-switch', 'panic']
	},

	// -------------------------------------------------------------------------
	// Tier 4: Mini-project — Calculadora de formas con interfaces
	// -------------------------------------------------------------------------
	{
		id: 'm7-ex-005',
		moduleId: 7,
		tier: 'mini-project',
		difficulty: 'advanced',
		title: 'Calculadora de formas geométricas',
		description:
			'Construye una calculadora que use interfaces para trabajar con distintas formas geométricas. Requisitos:\n\n1. Interfaz Forma con métodos Area() float64 y Perimetro() float64\n2. Interfaz Describible con método String() string\n3. Tipos: Circulo (radio), Rectangulo (ancho, alto), Triangulo (lados a, b, c)\n4. Todos los tipos implementan ambas interfaces\n5. Función totalArea(formas []Forma) float64 que suma todas las áreas\n6. Función formaMaxima(formas []Forma) Forma que retorna la de mayor área\n7. Función describirTodas(formas []Forma) que imprime cada forma usando type switch\n\nUsa math.Pi para el círculo y la fórmula de Herón para el área del triángulo.',
		baseCode: `package main

import (
	"fmt"
	"math"
)

// Define la interfaz Forma
// Define la interfaz Describible

// Define los tipos Circulo, Rectangulo, Triangulo
// Implementa los métodos para cada tipo

// Implementa totalArea, formaMaxima, describirTodas

func main() {
	formas := []Forma{
		Circulo{Radio: 5},
		Rectangulo{Ancho: 4, Alto: 6},
		Triangulo{A: 3, B: 4, C: 5},
	}

	describirTodas(formas)

	fmt.Printf("\\nÁrea total: %.2f\\n", totalArea(formas))

	mayor := formaMaxima(formas)
	fmt.Printf("Forma con mayor área: %.2f\\n", mayor.Area())
}`,
		solution: `package main

import (
	"fmt"
	"math"
)

type Forma interface {
	Area() float64
	Perimetro() float64
}

type Describible interface {
	String() string
}

type Circulo struct {
	Radio float64
}

func (c Circulo) Area() float64 {
	return math.Pi * c.Radio * c.Radio
}

func (c Circulo) Perimetro() float64 {
	return 2 * math.Pi * c.Radio
}

func (c Circulo) String() string {
	return fmt.Sprintf("Círculo(radio=%.1f)", c.Radio)
}

type Rectangulo struct {
	Ancho float64
	Alto  float64
}

func (r Rectangulo) Area() float64 {
	return r.Ancho * r.Alto
}

func (r Rectangulo) Perimetro() float64 {
	return 2 * (r.Ancho + r.Alto)
}

func (r Rectangulo) String() string {
	return fmt.Sprintf("Rectángulo(%gx%g)", r.Ancho, r.Alto)
}

type Triangulo struct {
	A, B, C float64
}

func (t Triangulo) Area() float64 {
	// Fórmula de Herón
	s := t.Perimetro() / 2
	return math.Sqrt(s * (s - t.A) * (s - t.B) * (s - t.C))
}

func (t Triangulo) Perimetro() float64 {
	return t.A + t.B + t.C
}

func (t Triangulo) String() string {
	return fmt.Sprintf("Triángulo(%.1f, %.1f, %.1f)", t.A, t.B, t.C)
}

func totalArea(formas []Forma) float64 {
	total := 0.0
	for _, f := range formas {
		total += f.Area()
	}
	return total
}

func formaMaxima(formas []Forma) Forma {
	if len(formas) == 0 {
		return nil
	}
	mayor := formas[0]
	for _, f := range formas[1:] {
		if f.Area() > mayor.Area() {
			mayor = f
		}
	}
	return mayor
}

func describirTodas(formas []Forma) {
	for _, f := range formas {
		switch v := f.(type) {
		case Circulo:
			fmt.Printf("  %s → área: %.2f, perímetro: %.2f\n", v.String(), v.Area(), v.Perimetro())
		case Rectangulo:
			fmt.Printf("  %s → área: %.2f, perímetro: %.2f\n", v.String(), v.Area(), v.Perimetro())
		case Triangulo:
			fmt.Printf("  %s → área: %.2f, perímetro: %.2f\n", v.String(), v.Area(), v.Perimetro())
		default:
			fmt.Printf("  Forma desconocida → área: %.2f\n", f.Area())
		}
	}
}

func main() {
	formas := []Forma{
		Circulo{Radio: 5},
		Rectangulo{Ancho: 4, Alto: 6},
		Triangulo{A: 3, B: 4, C: 5},
	}

	describirTodas(formas)

	fmt.Printf("\nÁrea total: %.2f\n", totalArea(formas))

	mayor := formaMaxima(formas)
	fmt.Printf("Forma con mayor área: %.2f\n", mayor.Area())
}`,
		expectedOutput: `  Círculo(radio=5.0) → área: 78.54, perímetro: 31.42
  Rectángulo(4x6) → área: 24.00, perímetro: 20.00
  Triángulo(3.0, 4.0, 5.0) → área: 6.00, perímetro: 12.00

Área total: 108.54
Forma con mayor área: 78.54`,
		hints: [
			'Define cada tipo por separado, luego implementa Area(), Perimetro() y String() para cada uno. El triángulo usa la fórmula de Herón: s = perímetro/2, área = sqrt(s*(s-a)*(s-b)*(s-c)).',
			'formaMaxima recorre el slice comparando áreas. totalArea las suma. describirTodas usa un type switch para obtener el tipo concreto.'
		],
		points: 8,
		concepts: [
			'interfaces',
			'polymorphism',
			'type-switch',
			'composition',
			'fmt.Stringer'
		]
	}
];

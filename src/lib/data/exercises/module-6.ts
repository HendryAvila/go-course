import type { Exercise, WorkedExample } from './types';

// =============================================================================
// Module 6: Structs & Methods
// =============================================================================

export const workedExamples: WorkedExample[] = [
	// -------------------------------------------------------------------------
	// WE-001: Structs y métodos desde cero
	// -------------------------------------------------------------------------
	{
		id: 'm6-we-001',
		moduleId: 6,
		title: 'Definir structs y métodos',
		description:
			'Construimos un tipo Rectangulo con métodos de valor y puntero, entendiendo cuándo usar cada uno.',
		steps: [
			{
				code: `package main

import "fmt"

// Declarar un struct
type Rectangulo struct {
	Ancho  float64
	Alto   float64
}

func main() {
	// Crear instancias
	r1 := Rectangulo{Ancho: 10, Alto: 5}
	r2 := Rectangulo{3, 7} // por posición (menos legible)

	fmt.Println("R1:", r1)
	fmt.Println("R2:", r2)
}`,
				explanation:
					'Un struct agrupa campos con nombre y tipo. Siempre prefiere la sintaxis con nombres de campo — es más legible y resistente a cambios en el orden.',
				highlightLines: [6, 7, 8, 13]
			},
			{
				code: `package main

import "fmt"

type Rectangulo struct {
	Ancho float64
	Alto  float64
}

// Método con value receiver — NO modifica el original
func (r Rectangulo) Area() float64 {
	return r.Ancho * r.Alto
}

// Método con value receiver — lectura solamente
func (r Rectangulo) Perimetro() float64 {
	return 2 * (r.Ancho + r.Alto)
}

func main() {
	r := Rectangulo{Ancho: 10, Alto: 5}
	fmt.Printf("Área: %.1f\\n", r.Area())
	fmt.Printf("Perímetro: %.1f\\n", r.Perimetro())
}`,
				explanation:
					'Un value receiver (r Rectangulo) recibe una COPIA del struct. Perfecto para métodos que solo leen datos. Go copia todo el struct en cada llamada.',
				highlightLines: [11, 16]
			},
			{
				code: `package main

import "fmt"

type Rectangulo struct {
	Ancho float64
	Alto  float64
}

func (r Rectangulo) Area() float64 {
	return r.Ancho * r.Alto
}

// Pointer receiver — SÍ modifica el original
func (r *Rectangulo) Escalar(factor float64) {
	r.Ancho *= factor
	r.Alto *= factor
}

func main() {
	r := Rectangulo{Ancho: 10, Alto: 5}
	fmt.Printf("Antes: %+v, Área: %.1f\\n", r, r.Area())

	r.Escalar(2)
	fmt.Printf("Después: %+v, Área: %.1f\\n", r, r.Area())
}`,
				explanation:
					'Un pointer receiver (r *Rectangulo) recibe un puntero al struct original. Úsalo cuando el método necesita modificar el struct o cuando el struct es grande (evita copiar).',
				highlightLines: [15, 16, 17, 24]
			},
			{
				code: `package main

import "fmt"

type Rectangulo struct {
	Ancho float64
	Alto  float64
}

func (r Rectangulo) Area() float64 {
	return r.Ancho * r.Alto
}

func (r *Rectangulo) Escalar(factor float64) {
	r.Ancho *= factor
	r.Alto *= factor
}

// Constructor idiomático en Go
func NuevoRectangulo(ancho, alto float64) *Rectangulo {
	if ancho <= 0 || alto <= 0 {
		return nil
	}
	return &Rectangulo{Ancho: ancho, Alto: alto}
}

func main() {
	r := NuevoRectangulo(10, 5)
	if r != nil {
		fmt.Printf("Rect: %+v, Área: %.1f\\n", *r, r.Area())
	}

	invalido := NuevoRectangulo(-1, 5)
	fmt.Println("Inválido:", invalido) // <nil>
}`,
				explanation:
					'Go no tiene constructores como otros lenguajes. La convención es crear una función NuevoX() que valida y retorna un puntero. Esto permite controlar la inicialización.',
				highlightLines: [20, 21, 22, 24]
			}
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

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

func (r *Rectangulo) Escalar(factor float64) {
	r.Ancho *= factor
	r.Alto *= factor
}

func NuevoRectangulo(ancho, alto float64) *Rectangulo {
	if ancho <= 0 || alto <= 0 {
		return nil
	}
	return &Rectangulo{Ancho: ancho, Alto: alto}
}

func main() {
	r := NuevoRectangulo(10, 5)
	if r != nil {
		fmt.Printf("Rect: %+v\\n", *r)
		fmt.Printf("Área: %.1f\\n", r.Area())
		fmt.Printf("Perímetro: %.1f\\n", r.Perimetro())

		r.Escalar(3)
		fmt.Printf("Escalado x3: %+v, Área: %.1f\\n", *r, r.Area())
	}
}`
	},

	// -------------------------------------------------------------------------
	// WE-002: Embedding y composición
	// -------------------------------------------------------------------------
	{
		id: 'm6-we-002',
		moduleId: 6,
		title: 'Composición con embedding',
		description:
			'Aprendemos a usar embedding para componer structs, la alternativa de Go a la herencia.',
		steps: [
			{
				code: `package main

import "fmt"

type Direccion struct {
	Calle  string
	Ciudad string
	Pais   string
}

func (d Direccion) Completa() string {
	return d.Calle + ", " + d.Ciudad + ", " + d.Pais
}

func main() {
	dir := Direccion{
		Calle:  "Av. Siempre Viva 742",
		Ciudad: "Springfield",
		Pais:   "USA",
	}
	fmt.Println(dir.Completa())
}`,
				explanation:
					'Primero definimos un tipo Direccion con su propio método. Este tipo será reutilizado por otros structs a través de embedding.',
				highlightLines: [5, 6, 7, 8, 11]
			},
			{
				code: `package main

import "fmt"

type Direccion struct {
	Calle  string
	Ciudad string
	Pais   string
}

func (d Direccion) Completa() string {
	return d.Calle + ", " + d.Ciudad + ", " + d.Pais
}

// Persona EMBEBE Direccion (sin nombre de campo)
type Persona struct {
	Nombre string
	Edad   int
	Direccion // <-- embedding, no "Dir Direccion"
}

func main() {
	p := Persona{
		Nombre: "Ana",
		Edad:   30,
		Direccion: Direccion{
			Calle:  "Calle Falsa 123",
			Ciudad: "Buenos Aires",
			Pais:   "Argentina",
		},
	}

	// Los campos y métodos se "promueven"
	fmt.Println(p.Nombre)
	fmt.Println(p.Ciudad)     // Acceso directo al campo embebido
	fmt.Println(p.Completa()) // Método promovido
}`,
				explanation:
					'Al embeber Direccion sin nombre, sus campos y métodos se "promueven" a Persona. Puedes acceder a p.Ciudad directamente en lugar de p.Direccion.Ciudad. Esto NO es herencia — es composición.',
				highlightLines: [19, 35, 36]
			},
			{
				code: `package main

import "fmt"

type Direccion struct {
	Calle  string
	Ciudad string
	Pais   string
}

func (d Direccion) Completa() string {
	return d.Calle + ", " + d.Ciudad + ", " + d.Pais
}

type Persona struct {
	Nombre string
	Edad   int
	Direccion
}

// Persona puede tener sus propios métodos
func (p Persona) Presentarse() string {
	return fmt.Sprintf("%s, %d años, vive en %s", p.Nombre, p.Edad, p.Ciudad)
}

// Empresa también embebe Direccion
type Empresa struct {
	Nombre string
	Direccion
}

func (e Empresa) Info() string {
	return fmt.Sprintf("%s — %s", e.Nombre, e.Completa())
}

func main() {
	p := Persona{
		Nombre:    "Bruno",
		Edad:      28,
		Direccion: Direccion{"Gran Vía 1", "Madrid", "España"},
	}

	e := Empresa{
		Nombre:    "GoSoft",
		Direccion: Direccion{"Tech Park 42", "Berlín", "Alemania"},
	}

	fmt.Println(p.Presentarse())
	fmt.Println(e.Info())
}`,
				explanation:
					'Múltiples tipos pueden embeber el mismo struct. Cada uno obtiene los métodos promovidos y puede agregar los suyos propios. Esto es "composición sobre herencia" en acción.',
				highlightLines: [22, 28, 32]
			}
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

type Direccion struct {
	Calle  string
	Ciudad string
	Pais   string
}

func (d Direccion) Completa() string {
	return d.Calle + ", " + d.Ciudad + ", " + d.Pais
}

type Persona struct {
	Nombre string
	Edad   int
	Direccion
}

func (p Persona) Presentarse() string {
	return fmt.Sprintf("%s, %d años, vive en %s", p.Nombre, p.Edad, p.Ciudad)
}

type Empresa struct {
	Nombre string
	Direccion
}

func (e Empresa) Info() string {
	return fmt.Sprintf("%s — %s", e.Nombre, e.Completa())
}

func main() {
	p := Persona{
		Nombre:    "Bruno",
		Edad:      28,
		Direccion: Direccion{"Gran Vía 1", "Madrid", "España"},
	}

	e := Empresa{
		Nombre:    "GoSoft",
		Direccion: Direccion{"Tech Park 42", "Berlín", "Alemania"},
	}

	fmt.Println(p.Presentarse())
	fmt.Println(e.Info())

	// También puedes acceder al tipo embebido directamente
	fmt.Println("Dirección completa de Bruno:", p.Direccion.Completa())
}`
	}
];

export const exercises: Exercise[] = [
	// -------------------------------------------------------------------------
	// Tier 1: Completion — Struct básico con métodos
	// -------------------------------------------------------------------------
	{
		id: 'm6-ex-001',
		moduleId: 6,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Cuenta bancaria',
		description:
			'Completa el struct CuentaBancaria y sus métodos para depositar y consultar saldo.',
		baseCode: `package main

import "fmt"

type CuentaBancaria struct {
	Titular string
	___     ___ // campo para el saldo (float64)
}

// Método para depositar dinero (necesita modificar el struct)
func (c ___) Depositar(monto float64) {
	if monto > 0 {
		c.saldo += monto
	}
}

// Método para consultar saldo (solo lectura)
func (c ___) Saldo() float64 {
	return c.saldo
}

func main() {
	cuenta := CuentaBancaria{Titular: "Ana García"}
	cuenta.Depositar(1000)
	cuenta.Depositar(500)
	fmt.Printf("Titular: %s\\n", cuenta.Titular)
	fmt.Printf("Saldo: $%.2f\\n", cuenta.Saldo())
}`,
		solution: `package main

import "fmt"

type CuentaBancaria struct {
	Titular string
	saldo   float64 // campo privado (minúscula)
}

// Método para depositar dinero (necesita modificar el struct)
func (c *CuentaBancaria) Depositar(monto float64) {
	if monto > 0 {
		c.saldo += monto
	}
}

// Método para consultar saldo (solo lectura)
func (c CuentaBancaria) Saldo() float64 {
	return c.saldo
}

func main() {
	cuenta := CuentaBancaria{Titular: "Ana García"}
	cuenta.Depositar(1000)
	cuenta.Depositar(500)
	fmt.Printf("Titular: %s\\n", cuenta.Titular)
	fmt.Printf("Saldo: $%.2f\\n", cuenta.Saldo())
}`,
		expectedOutput: `Titular: Ana García
Saldo: $1500.00`,
		hints: [
			'Un campo privado empieza en minúscula. El tipo del saldo es float64.',
			'Depositar modifica el struct, así que necesita pointer receiver (*CuentaBancaria). Saldo solo lee, usa value receiver (CuentaBancaria).'
		],
		points: 3,
		concepts: ['structs', 'methods', 'pointer-receiver', 'value-receiver', 'encapsulation']
	},

	// -------------------------------------------------------------------------
	// Tier 2: Fill-in-blank — Embedding
	// -------------------------------------------------------------------------
	{
		id: 'm6-ex-002',
		moduleId: 6,
		tier: 'fill-in-blank',
		difficulty: 'intermediate',
		title: 'Empleado con embedding',
		description:
			'Rellena los blancos para que Empleado embeba Persona y use sus campos promovidos.',
		baseCode: `package main

import "fmt"

type Persona struct {
	Nombre string
	Edad   int
}

func (p Persona) Saludo() string {
	return fmt.Sprintf("Hola, soy %s y tengo %d años", p.Nombre, p.Edad)
}

type Empleado struct {
	___ // Embebe Persona (sin nombre de campo)
	Cargo   string
	Salario float64
}

func (e Empleado) Info() string {
	// Usa los campos promovidos de Persona
	return fmt.Sprintf("%s — %s ($%.0f)", ___, e.Cargo, e.Salario)
}

func main() {
	emp := Empleado{
		___: ___{ // Inicializa el campo embebido
			Nombre: "Carlos",
			Edad:   35,
		},
		Cargo:   "Desarrollador Go",
		Salario: 75000,
	}

	fmt.Println(emp.Saludo()) // Método promovido
	fmt.Println(emp.Info())
}`,
		solution: `package main

import "fmt"

type Persona struct {
	Nombre string
	Edad   int
}

func (p Persona) Saludo() string {
	return fmt.Sprintf("Hola, soy %s y tengo %d años", p.Nombre, p.Edad)
}

type Empleado struct {
	Persona // Embebe Persona (sin nombre de campo)
	Cargo   string
	Salario float64
}

func (e Empleado) Info() string {
	// Usa los campos promovidos de Persona
	return fmt.Sprintf("%s — %s ($%.0f)", e.Nombre, e.Cargo, e.Salario)
}

func main() {
	emp := Empleado{
		Persona: Persona{ // Inicializa el campo embebido
			Nombre: "Carlos",
			Edad:   35,
		},
		Cargo:   "Desarrollador Go",
		Salario: 75000,
	}

	fmt.Println(emp.Saludo()) // Método promovido
	fmt.Println(emp.Info())
}`,
		expectedOutput: `Hola, soy Carlos y tengo 35 años
Carlos — Desarrollador Go ($75000)`,
		hints: [
			'Para embeber, pon solo el nombre del tipo (Persona) sin darle nombre de campo.',
			'Al inicializar, usa Persona: Persona{...}. Los campos promovidos se acceden como e.Nombre directamente.'
		],
		points: 4,
		concepts: ['structs', 'embedding', 'promotion', 'composition']
	},

	// -------------------------------------------------------------------------
	// Tier 3: Debugging — Value receiver que no modifica
	// -------------------------------------------------------------------------
	{
		id: 'm6-ex-003',
		moduleId: 6,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'El contador que no cuenta',
		description:
			'Este contador debería incrementar y decrementar, pero siempre muestra 0. Encuentra los 2 bugs.',
		baseCode: `package main

import "fmt"

type Contador struct {
	valor int
}

func (c Contador) Incrementar() {
	c.valor++
}

func (c Contador) Decrementar() {
	c.valor--
}

func (c Contador) Valor() int {
	return c.valor
}

func main() {
	c := Contador{}
	c.Incrementar()
	c.Incrementar()
	c.Incrementar()
	c.Decrementar()

	fmt.Println("Valor esperado: 2")
	fmt.Println("Valor actual:", c.Valor())
}`,
		solution: `package main

import "fmt"

type Contador struct {
	valor int
}

func (c *Contador) Incrementar() {
	c.valor++
}

func (c *Contador) Decrementar() {
	c.valor--
}

func (c Contador) Valor() int {
	return c.valor
}

func main() {
	c := Contador{}
	c.Incrementar()
	c.Incrementar()
	c.Incrementar()
	c.Decrementar()

	fmt.Println("Valor esperado: 2")
	fmt.Println("Valor actual:", c.Valor())
}`,
		expectedOutput: `Valor esperado: 2
Valor actual: 2`,
		hints: [
			'Incrementar y Decrementar reciben una COPIA del struct. Los cambios se pierden cuando el método termina.',
			'Cambia el receiver de valor (c Contador) a puntero (c *Contador) en los métodos que modifican estado.'
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['methods', 'value-receiver', 'pointer-receiver']
	},

	// -------------------------------------------------------------------------
	// Tier 3: Debugging — Struct inicialización parcial
	// -------------------------------------------------------------------------
	{
		id: 'm6-ex-004',
		moduleId: 6,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'El servidor mal configurado',
		description:
			'Este programa configura un servidor con valores por defecto, pero hay 2 bugs: uno lógico y uno de inicialización.',
		baseCode: `package main

import "fmt"

type Servidor struct {
	Host     string
	Puerto   int
	MaxConns int
	Debug    bool
}

func NuevoServidor(host string) Servidor {
	return Servidor{
		Host: host,
	}
	// Puerto y MaxConns quedan en 0 (zero value)
}

func (s Servidor) Iniciar() string {
	return fmt.Sprintf("Servidor en %s:%d (max: %d conexiones, debug: %v)",
		s.Host, s.Puerto, s.MaxConns, s.Debug)
}

func (s Servidor) EsValido() bool {
	return s.Host != "" && s.Puerto > 0 && s.MaxConns > 0
}

func main() {
	srv := NuevoServidor("localhost")
	fmt.Println(srv.Iniciar())
	fmt.Println("¿Válido?", srv.EsValido())
}`,
		solution: `package main

import "fmt"

type Servidor struct {
	Host     string
	Puerto   int
	MaxConns int
	Debug    bool
}

func NuevoServidor(host string) Servidor {
	return Servidor{
		Host:     host,
		Puerto:   8080,
		MaxConns: 100,
	}
}

func (s Servidor) Iniciar() string {
	return fmt.Sprintf("Servidor en %s:%d (max: %d conexiones, debug: %v)",
		s.Host, s.Puerto, s.MaxConns, s.Debug)
}

func (s Servidor) EsValido() bool {
	return s.Host != "" && s.Puerto > 0 && s.MaxConns > 0
}

func main() {
	srv := NuevoServidor("localhost")
	fmt.Println(srv.Iniciar())
	fmt.Println("¿Válido?", srv.EsValido())
}`,
		expectedOutput: `Servidor en localhost:8080 (max: 100 conexiones, debug: false)
¿Válido? true`,
		hints: [
			'Los zero values de int son 0. Un servidor con puerto 0 y 0 conexiones máximas no es muy útil.',
			'El constructor debe asignar valores por defecto razonables: Puerto: 8080, MaxConns: 100.'
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['structs', 'zero-values', 'constructors', 'initialization']
	}
];

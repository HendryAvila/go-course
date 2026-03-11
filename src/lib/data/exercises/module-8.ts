import type { Exercise, WorkedExample } from './types';

// =============================================================================
// Module 8: Error Handling — error interface, wrapping, custom errors, defer
// =============================================================================

export const workedExamples: WorkedExample[] = [
	// -------------------------------------------------------------------------
	// WE-001: Manejo de errores idiomático
	// -------------------------------------------------------------------------
	{
		id: 'm8-we-001',
		moduleId: 8,
		title: 'Errores en Go: el patrón if err != nil',
		description:
			'Aprendemos el manejo de errores idiomático en Go, desde errors.New hasta fmt.Errorf con %w para wrapping.',
		steps: [
			{
				code: `package main

import (
	"errors"
	"fmt"
)

// Función que puede fallar
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

	_, err = dividir(10, 0)
	if err != nil {
		fmt.Println("Error:", err)
	}
}`,
				explanation:
					'En Go, los errores son valores. Una función que puede fallar retorna (resultado, error). El llamador verifica con if err != nil. errors.New crea un error simple con un mensaje.',
				highlightLines: [9, 10, 11, 17, 18]
			},
			{
				code: `package main

import (
	"errors"
	"fmt"
)

var ErrNoEncontrado = errors.New("usuario no encontrado")
var ErrSinPermiso = errors.New("sin permiso de acceso")

func buscarUsuario(id int) (string, error) {
	if id <= 0 {
		return "", fmt.Errorf("ID inválido: %d", id)
	}
	if id > 100 {
		return "", ErrNoEncontrado
	}
	return "Ana García", nil
}

func main() {
	nombre, err := buscarUsuario(1)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Usuario:", nombre)

	_, err = buscarUsuario(200)
	if errors.Is(err, ErrNoEncontrado) {
		fmt.Println("El usuario no existe")
	}

	_, err = buscarUsuario(-5)
	fmt.Println("Error:", err)
}`,
				explanation:
					'Los errores centinela (sentinel errors) son variables de paquete que permiten comparaciones con errors.Is(). fmt.Errorf crea errores con formato, útil para incluir contexto.',
				highlightLines: [8, 9, 13, 30, 31]
			},
			{
				code: `package main

import (
	"errors"
	"fmt"
)

var ErrNoEncontrado = errors.New("no encontrado")

func buscarEnDB(id int) (string, error) {
	if id > 100 {
		return "", ErrNoEncontrado
	}
	return "dato-" + fmt.Sprint(id), nil
}

func buscarUsuario(id int) (string, error) {
	dato, err := buscarEnDB(id)
	if err != nil {
		// %w envuelve (wraps) el error original — permite unwrap después
		return "", fmt.Errorf("buscarUsuario(id=%d): %w", id, err)
	}
	return dato, nil
}

func obtenerPerfil(id int) (string, error) {
	usuario, err := buscarUsuario(id)
	if err != nil {
		return "", fmt.Errorf("obtenerPerfil: %w", err)
	}
	return "Perfil de " + usuario, nil
}

func main() {
	_, err := obtenerPerfil(200)
	if err != nil {
		fmt.Println("Error completo:", err)
		// errors.Is atraviesa toda la cadena de wrapping
		if errors.Is(err, ErrNoEncontrado) {
			fmt.Println("→ Causa raíz: recurso no encontrado")
		}
	}
}`,
				explanation:
					'El verbo %w en fmt.Errorf envuelve el error original. errors.Is() puede atravesar toda la cadena de wrapping para encontrar el error original. Esto da contexto sin perder la causa raíz.',
				highlightLines: [21, 30, 39, 40]
			},
			{
				code: `package main

import (
	"errors"
	"fmt"
)

// Error personalizado con contexto extra
type ErrorValidacion struct {
	Campo   string
	Mensaje string
}

func (e *ErrorValidacion) Error() string {
	return fmt.Sprintf("validación fallida en '%s': %s", e.Campo, e.Mensaje)
}

func validarEdad(edad int) error {
	if edad < 0 {
		return &ErrorValidacion{Campo: "edad", Mensaje: "no puede ser negativa"}
	}
	if edad > 150 {
		return &ErrorValidacion{Campo: "edad", Mensaje: "valor no realista"}
	}
	return nil
}

func procesarRegistro(edad int) error {
	if err := validarEdad(edad); err != nil {
		return fmt.Errorf("registro fallido: %w", err)
	}
	return nil
}

func main() {
	err := procesarRegistro(-5)
	if err != nil {
		fmt.Println("Error:", err)

		// errors.As extrae el tipo concreto del error
		var ve *ErrorValidacion
		if errors.As(err, &ve) {
			fmt.Printf("Campo: %s, Detalle: %s\n", ve.Campo, ve.Mensaje)
		}
	}
}`,
				explanation:
					'Los custom error types implementan la interfaz error (método Error() string) y pueden llevar datos estructurados. errors.As() extrae el tipo concreto atravesando la cadena de wrapping.',
				highlightLines: [9, 10, 11, 14, 41, 42]
			}
		],
		playground: true,
		playgroundCode: `package main

import (
	"errors"
	"fmt"
)

var ErrNoEncontrado = errors.New("no encontrado")

type ErrorValidacion struct {
	Campo   string
	Mensaje string
}

func (e *ErrorValidacion) Error() string {
	return fmt.Sprintf("validación en '%s': %s", e.Campo, e.Mensaje)
}

func validar(nombre string, edad int) error {
	if nombre == "" {
		return &ErrorValidacion{Campo: "nombre", Mensaje: "requerido"}
	}
	if edad < 0 || edad > 150 {
		return &ErrorValidacion{Campo: "edad", Mensaje: "fuera de rango"}
	}
	return nil
}

func registrar(nombre string, edad int) error {
	if err := validar(nombre, edad); err != nil {
		return fmt.Errorf("registrar(%s): %w", nombre, err)
	}
	fmt.Printf("Registrado: %s, %d años\\n", nombre, edad)
	return nil
}

func main() {
	// Caso exitoso
	registrar("Ana", 28)

	// Caso con error
	err := registrar("", 25)
	if err != nil {
		fmt.Println("Error:", err)
		var ve *ErrorValidacion
		if errors.As(err, &ve) {
			fmt.Printf("  → Campo: %s, Detalle: %s\\n", ve.Campo, ve.Mensaje)
		}
	}

	// Prueba errors.Is con sentinel
	err2 := fmt.Errorf("capa superior: %w", ErrNoEncontrado)
	fmt.Println("\\n¿Es NoEncontrado?", errors.Is(err2, ErrNoEncontrado))
}`
	},

	// -------------------------------------------------------------------------
	// WE-002: defer para cleanup
	// -------------------------------------------------------------------------
	{
		id: 'm8-we-002',
		moduleId: 8,
		title: 'defer para limpieza de recursos',
		description:
			'Aprendemos a usar defer para garantizar que los recursos se liberen, incluso si ocurre un error.',
		steps: [
			{
				code: `package main

import "fmt"

func ejemplo() {
	fmt.Println("1. Inicio")
	defer fmt.Println("3. Defer ejecutado (al salir)")
	fmt.Println("2. Continúa")
}

func main() {
	ejemplo()
}`,
				explanation:
					'defer programa la ejecución de una función para cuando la función contenedora retorne. Se ejecuta SIEMPRE, sin importar si hay error o return anticipado.',
				highlightLines: [7]
			},
			{
				code: `package main

import "fmt"

func multiDefer() {
	fmt.Println("Inicio")
	defer fmt.Println("Defer 1 (primero en defer, último en ejecutar)")
	defer fmt.Println("Defer 2")
	defer fmt.Println("Defer 3 (último en defer, primero en ejecutar)")
	fmt.Println("Fin del cuerpo")
}

func main() {
	multiDefer()
}`,
				explanation:
					'Múltiples defer se apilan (LIFO: Last In, First Out). El último defer registrado se ejecuta primero. Es como una pila de platos.',
				highlightLines: [7, 8, 9]
			},
			{
				code: `package main

import (
	"fmt"
	"strings"
)

// Simula abrir/cerrar un recurso
type Conexion struct {
	nombre string
	abierta bool
}

func abrirConexion(nombre string) (*Conexion, error) {
	if nombre == "" {
		return nil, fmt.Errorf("nombre de conexión vacío")
	}
	fmt.Printf("Abriendo conexión: %s\n", nombre)
	return &Conexion{nombre: nombre, abierta: true}, nil
}

func (c *Conexion) Cerrar() {
	c.abierta = false
	fmt.Printf("Cerrando conexión: %s\n", c.nombre)
}

func (c *Conexion) Consultar(query string) (string, error) {
	if !c.abierta {
		return "", fmt.Errorf("conexión cerrada")
	}
	if strings.Contains(query, "DROP") {
		return "", fmt.Errorf("operación peligrosa: %s", query)
	}
	return fmt.Sprintf("Resultado de '%s'", query), nil
}

func procesarDatos(nombre string) error {
	conn, err := abrirConexion(nombre)
	if err != nil {
		return fmt.Errorf("procesarDatos: %w", err)
	}
	defer conn.Cerrar() // Se cierra SIEMPRE al salir

	resultado, err := conn.Consultar("SELECT * FROM users")
	if err != nil {
		return fmt.Errorf("consulta fallida: %w", err)
	}
	fmt.Println(resultado)

	return nil
}

func main() {
	err := procesarDatos("db-principal")
	if err != nil {
		fmt.Println("Error:", err)
	}
}`,
				explanation:
					'El patrón idiomático: abrir recurso → verificar error → defer cerrar → usar recurso. defer garantiza que Cerrar() se ejecuta incluso si la consulta falla. Es imposible olvidarse de cerrar.',
				highlightLines: [42, 38, 39, 40, 41]
			}
		],
		playground: true,
		playgroundCode: `package main

import (
	"fmt"
	"strings"
)

type Conexion struct {
	nombre  string
	abierta bool
}

func abrirConexion(nombre string) (*Conexion, error) {
	if nombre == "" {
		return nil, fmt.Errorf("nombre vacío")
	}
	fmt.Printf("Abriendo: %s\\n", nombre)
	return &Conexion{nombre: nombre, abierta: true}, nil
}

func (c *Conexion) Cerrar() {
	c.abierta = false
	fmt.Printf("Cerrando: %s\\n", c.nombre)
}

func (c *Conexion) Consultar(q string) (string, error) {
	if !c.abierta {
		return "", fmt.Errorf("conexión cerrada")
	}
	if strings.Contains(q, "DROP") {
		return "", fmt.Errorf("operación peligrosa")
	}
	return "OK: " + q, nil
}

func procesarDatos(nombre string) error {
	conn, err := abrirConexion(nombre)
	if err != nil {
		return fmt.Errorf("procesarDatos: %w", err)
	}
	defer conn.Cerrar()

	res, err := conn.Consultar("SELECT * FROM users")
	if err != nil {
		return err
	}
	fmt.Println(res)
	return nil
}

func main() {
	// Caso exitoso
	procesarDatos("db-main")
	fmt.Println("---")
	// Caso con error
	err := procesarDatos("")
	if err != nil {
		fmt.Println("Error:", err)
	}
}`
	}
];

export const exercises: Exercise[] = [
	// -------------------------------------------------------------------------
	// Tier 1: Completion — Manejo básico de errores
	// -------------------------------------------------------------------------
	{
		id: 'm8-ex-001',
		moduleId: 8,
		tier: 'completion',
		difficulty: 'beginner',
		title: 'Validador de edad',
		description:
			'Completa la función validarEdad que retorna un error si la edad no es válida, y el manejo en main.',
		baseCode: `package main

import (
	"errors"
	"fmt"
)

func validarEdad(edad int) error {
	if edad < 0 {
		// Retorna un error con errors.New
		return ___
	}
	if edad > 150 {
		// Retorna un error con fmt.Errorf incluyendo el valor
		return ___
	}
	return ___ // Sin error
}

func main() {
	edades := []int{25, -3, 200, 0}

	for _, edad := range edades {
		err := validarEdad(edad)
		if ___ { // Verifica si hay error
			fmt.Printf("Edad %d: ERROR — %s\\n", edad, err)
		} else {
			fmt.Printf("Edad %d: OK\\n", edad)
		}
	}
}`,
		solution: `package main

import (
	"errors"
	"fmt"
)

// Usamos errors para que el import no falle
var _ = errors.New

func validarEdad(edad int) error {
	if edad < 0 {
		return errors.New("la edad no puede ser negativa")
	}
	if edad > 150 {
		return fmt.Errorf("edad no realista: %d", edad)
	}
	return nil // Sin error
}

func main() {
	edades := []int{25, -3, 200, 0}

	for _, edad := range edades {
		err := validarEdad(edad)
		if err != nil {
			fmt.Printf("Edad %d: ERROR — %s\n", edad, err)
		} else {
			fmt.Printf("Edad %d: OK\n", edad)
		}
	}
}`,
		expectedOutput: `Edad 25: OK
Edad -3: ERROR — la edad no puede ser negativa
Edad 200: ERROR — edad no realista: 200
Edad 0: OK`,
		hints: [
			'errors.New("mensaje") crea un error simple. fmt.Errorf("texto: %d", valor) crea uno con formato.',
			'Una función sin error retorna nil. Para verificar: if err != nil { ... }'
		],
		points: 3,
		concepts: ['errors', 'errors.New', 'fmt.Errorf', 'nil']
	},

	// -------------------------------------------------------------------------
	// Tier 2: Fill-in-blank — Error wrapping con %w
	// -------------------------------------------------------------------------
	{
		id: 'm8-ex-002',
		moduleId: 8,
		tier: 'fill-in-blank',
		difficulty: 'intermediate',
		title: 'Cadena de errores con wrapping',
		description:
			'Rellena los blancos para crear una cadena de error wrapping y verificar la causa raíz con errors.Is.',
		baseCode: `package main

import (
	"errors"
	"fmt"
)

var ErrConexion = errors.New("fallo de conexión")

func conectarDB() error {
	return ErrConexion
}

func obtenerUsuario(id int) (string, error) {
	err := conectarDB()
	if err != nil {
		// Envuelve el error con contexto usando %w
		return "", fmt.Errorf("obtenerUsuario(id=%d): ___", id, ___)
	}
	return "Ana", nil
}

func cargarPerfil(id int) error {
	_, err := obtenerUsuario(id)
	if err != nil {
		return fmt.Errorf("cargarPerfil: ___", ___)
	}
	return nil
}

func main() {
	err := cargarPerfil(42)
	if err != nil {
		fmt.Println("Error:", err)

		// Verifica si la causa raíz es ErrConexion
		if errors.___(err, ___) {
			fmt.Println("→ Causa: problema de conexión a la base de datos")
		}
	}
}`,
		solution: `package main

import (
	"errors"
	"fmt"
)

var ErrConexion = errors.New("fallo de conexión")

func conectarDB() error {
	return ErrConexion
}

func obtenerUsuario(id int) (string, error) {
	err := conectarDB()
	if err != nil {
		return "", fmt.Errorf("obtenerUsuario(id=%d): %w", id, err)
	}
	return "Ana", nil
}

func cargarPerfil(id int) error {
	_, err := obtenerUsuario(id)
	if err != nil {
		return fmt.Errorf("cargarPerfil: %w", err)
	}
	return nil
}

func main() {
	err := cargarPerfil(42)
	if err != nil {
		fmt.Println("Error:", err)

		if errors.Is(err, ErrConexion) {
			fmt.Println("→ Causa: problema de conexión a la base de datos")
		}
	}
}`,
		expectedOutput: `Error: cargarPerfil: obtenerUsuario(id=42): fallo de conexión
→ Causa: problema de conexión a la base de datos`,
		hints: [
			'El verbo %w en fmt.Errorf envuelve el error: fmt.Errorf("contexto: %w", err)',
			'errors.Is(err, target) recorre la cadena de wrapping buscando el error target.'
		],
		points: 4,
		concepts: ['error-wrapping', 'fmt.Errorf', 'errors.Is', 'sentinel-errors']
	},

	// -------------------------------------------------------------------------
	// Tier 3: Debugging — Custom error mal implementado
	// -------------------------------------------------------------------------
	{
		id: 'm8-ex-003',
		moduleId: 8,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'El error personalizado que no se detecta',
		description:
			'Este programa define un error personalizado, pero errors.As no logra detectarlo. Encuentra los 2 bugs.',
		baseCode: `package main

import (
	"errors"
	"fmt"
)

type ErrorHTTP struct {
	Codigo  int
	Mensaje string
}

// Bug: ¿value receiver o pointer receiver?
func (e ErrorHTTP) Error() string {
	return fmt.Sprintf("HTTP %d: %s", e.Codigo, e.Mensaje)
}

func hacerPeticion(url string) error {
	if url == "" {
		return &ErrorHTTP{Codigo: 400, Mensaje: "URL vacía"}
	}
	return &ErrorHTTP{Codigo: 404, Mensaje: "no encontrado"}
}

func obtenerDatos(url string) error {
	err := hacerPeticion(url)
	if err != nil {
		return fmt.Errorf("obtenerDatos: %w", err)
	}
	return nil
}

func main() {
	err := obtenerDatos("https://api.ejemplo.com/datos")
	if err != nil {
		fmt.Println("Error:", err)

		// Intenta extraer el ErrorHTTP
		var httpErr ErrorHTTP
		if errors.As(err, &httpErr) {
			fmt.Printf("Código HTTP: %d\\n", httpErr.Codigo)
		} else {
			fmt.Println("No se pudo detectar el tipo de error HTTP")
		}
	}
}`,
		solution: `package main

import (
	"errors"
	"fmt"
)

type ErrorHTTP struct {
	Codigo  int
	Mensaje string
}

func (e *ErrorHTTP) Error() string {
	return fmt.Sprintf("HTTP %d: %s", e.Codigo, e.Mensaje)
}

func hacerPeticion(url string) error {
	if url == "" {
		return &ErrorHTTP{Codigo: 400, Mensaje: "URL vacía"}
	}
	return &ErrorHTTP{Codigo: 404, Mensaje: "no encontrado"}
}

func obtenerDatos(url string) error {
	err := hacerPeticion(url)
	if err != nil {
		return fmt.Errorf("obtenerDatos: %w", err)
	}
	return nil
}

func main() {
	err := obtenerDatos("https://api.ejemplo.com/datos")
	if err != nil {
		fmt.Println("Error:", err)

		var httpErr *ErrorHTTP
		if errors.As(err, &httpErr) {
			fmt.Printf("Código HTTP: %d\n", httpErr.Codigo)
		} else {
			fmt.Println("No se pudo detectar el tipo de error HTTP")
		}
	}
}`,
		expectedOutput: `Error: obtenerDatos: HTTP 404: no encontrado
Código HTTP: 404`,
		hints: [
			'hacerPeticion retorna &ErrorHTTP (puntero). ¿Qué tipo deberías usar con errors.As: ErrorHTTP o *ErrorHTTP?',
			'Si retornas *ErrorHTTP, el método Error() debe tener pointer receiver (*ErrorHTTP), y errors.As necesita var httpErr *ErrorHTTP (puntero a puntero internamente).'
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['custom-errors', 'errors.As', 'pointer-receiver', 'error-wrapping']
	},

	// -------------------------------------------------------------------------
	// Tier 3: Debugging — defer y error mal capturado
	// -------------------------------------------------------------------------
	{
		id: 'm8-ex-004',
		moduleId: 8,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'El defer que pierde el error',
		description:
			'Este programa usa defer para cerrar un recurso, pero el error de cierre se pierde silenciosamente. Encuentra los 2 problemas.',
		baseCode: `package main

import (
	"fmt"
)

type Archivo struct {
	nombre string
	abierto bool
}

func abrirArchivo(nombre string) (*Archivo, error) {
	return &Archivo{nombre: nombre, abierto: true}, nil
}

func (a *Archivo) Escribir(datos string) error {
	if !a.abierto {
		return fmt.Errorf("archivo %s cerrado", a.nombre)
	}
	fmt.Printf("Escribiendo en %s: %s\\n", a.nombre, datos)
	return nil
}

func (a *Archivo) Cerrar() error {
	a.abierto = false
	fmt.Printf("Cerrando %s\\n", a.nombre)
	// Simula un error de cierre
	return fmt.Errorf("error al hacer flush de %s", a.nombre)
}

func guardarDatos(nombre string) error {
	archivo, err := abrirArchivo(nombre)
	if err != nil {
		return err
	}
	defer archivo.Cerrar() // El error de Cerrar() se ignora

	err = archivo.Escribir("datos importantes")
	if err != nil {
		return err
	}

	return nil
}

func main() {
	err := guardarDatos("notas.txt")
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Println("Todo OK (pero ¿realmente?)")
	}
}`,
		solution: `package main

import (
	"fmt"
)

type Archivo struct {
	nombre  string
	abierto bool
}

func abrirArchivo(nombre string) (*Archivo, error) {
	return &Archivo{nombre: nombre, abierto: true}, nil
}

func (a *Archivo) Escribir(datos string) error {
	if !a.abierto {
		return fmt.Errorf("archivo %s cerrado", a.nombre)
	}
	fmt.Printf("Escribiendo en %s: %s\n", a.nombre, datos)
	return nil
}

func (a *Archivo) Cerrar() error {
	a.abierto = false
	fmt.Printf("Cerrando %s\n", a.nombre)
	return fmt.Errorf("error al hacer flush de %s", a.nombre)
}

func guardarDatos(nombre string) (retErr error) {
	archivo, err := abrirArchivo(nombre)
	if err != nil {
		return err
	}
	defer func() {
		cerr := archivo.Cerrar()
		if retErr == nil {
			retErr = cerr
		}
	}()

	err = archivo.Escribir("datos importantes")
	if err != nil {
		return err
	}

	return nil
}

func main() {
	err := guardarDatos("notas.txt")
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Println("Todo OK (pero ¿realmente?)")
	}
}`,
		expectedOutput: `Escribiendo en notas.txt: datos importantes
Cerrando notas.txt
Error: error al hacer flush de notas.txt`,
		hints: [
			'defer archivo.Cerrar() descarta el error retornado por Cerrar(). ¿Cómo puedes capturarlo?',
			'Usa un named return (retErr error) y un defer con closure: defer func() { cerr := archivo.Cerrar(); if retErr == nil { retErr = cerr } }()'
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['defer', 'named-returns', 'error-handling', 'resource-cleanup']
	},

	// -------------------------------------------------------------------------
	// Tier 4: Mini-project — Lector de configuración con error handling
	// -------------------------------------------------------------------------
	{
		id: 'm8-ex-005',
		moduleId: 8,
		tier: 'mini-project',
		difficulty: 'advanced',
		title: 'Lector de configuración con manejo robusto de errores',
		description:
			'Construye un lector de configuración que parsea pares clave=valor con error handling completo. Requisitos:\n\n1. Tipo Config (map[string]string internamente)\n2. ErrorConfiguracion personalizado con campos: Linea int, Campo string, Mensaje string\n3. Función ParsearConfig(input string) (*Config, error) que:\n   - Divide el input por líneas\n   - Ignora líneas vacías y comentarios (empiezan con #)\n   - Parsea pares clave=valor\n   - Retorna ErrorConfiguracion si una línea no tiene "=" o si la clave está vacía\n4. Método (c *Config) Obtener(clave string) (string, error) que retorna error si la clave no existe\n5. Método (c *Config) ObtenerInt(clave string) (int, error) que intenta convertir a entero\n6. Usa fmt.Errorf con %w para wrapping en cada capa\n7. Demuestra errors.Is y errors.As en main',
		baseCode: `package main

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
)

// Define ErrorConfiguracion, Config y sus métodos
// Implementa ParsearConfig, Obtener, ObtenerInt

func main() {
	input := \`# Configuración del servidor
host=localhost
puerto=8080

# Base de datos
db_host=127.0.0.1
db_puerto=5432
db_nombre=miapp
max_conns=abc
linea_mala_sin_igual
\`

	config, err := ParsearConfig(input)
	if err != nil {
		fmt.Println("Error de parseo:", err)
		var ce *ErrorConfiguracion
		if errors.As(err, &ce) {
			fmt.Printf("  Línea %d, campo '%s': %s\\n", ce.Linea, ce.Campo, ce.Mensaje)
		}
	}

	// Si hay config parcial, intentar leer valores
	if config != nil {
		host, _ := config.Obtener("host")
		fmt.Println("\\nHost:", host)

		puerto, err := config.ObtenerInt("puerto")
		if err != nil {
			fmt.Println("Error puerto:", err)
		} else {
			fmt.Println("Puerto:", puerto)
		}

		_, err = config.Obtener("no_existe")
		fmt.Println("Clave inexistente:", err)

		_, err = config.ObtenerInt("max_conns")
		fmt.Println("Entero inválido:", err)
	}
}`,
		solution: `package main

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
)

var ErrClaveNoEncontrada = errors.New("clave no encontrada")

type ErrorConfiguracion struct {
	Linea   int
	Campo   string
	Mensaje string
}

func (e *ErrorConfiguracion) Error() string {
	return fmt.Sprintf("línea %d: campo '%s' — %s", e.Linea, e.Campo, e.Mensaje)
}

type Config struct {
	datos map[string]string
}

func ParsearConfig(input string) (*Config, error) {
	config := &Config{datos: make(map[string]string)}
	lineas := strings.Split(input, "\n")

	for i, linea := range lineas {
		linea = strings.TrimSpace(linea)
		numLinea := i + 1

		// Ignorar vacías y comentarios
		if linea == "" || strings.HasPrefix(linea, "#") {
			continue
		}

		// Verificar que tenga "="
		idx := strings.Index(linea, "=")
		if idx == -1 {
			return config, &ErrorConfiguracion{
				Linea:   numLinea,
				Campo:   linea,
				Mensaje: "formato inválido, falta '='",
			}
		}

		clave := strings.TrimSpace(linea[:idx])
		valor := strings.TrimSpace(linea[idx+1:])

		if clave == "" {
			return config, &ErrorConfiguracion{
				Linea:   numLinea,
				Campo:   "(vacío)",
				Mensaje: "la clave no puede estar vacía",
			}
		}

		config.datos[clave] = valor
	}

	return config, nil
}

func (c *Config) Obtener(clave string) (string, error) {
	valor, existe := c.datos[clave]
	if !existe {
		return "", fmt.Errorf("Obtener(%s): %w", clave, ErrClaveNoEncontrada)
	}
	return valor, nil
}

func (c *Config) ObtenerInt(clave string) (int, error) {
	valor, err := c.Obtener(clave)
	if err != nil {
		return 0, fmt.Errorf("ObtenerInt(%s): %w", clave, err)
	}

	num, err := strconv.Atoi(valor)
	if err != nil {
		return 0, fmt.Errorf("ObtenerInt(%s): valor '%s' no es entero: %w", clave, valor, err)
	}

	return num, nil
}

func main() {
	input := ` + "`" + `# Configuración del servidor
host=localhost
puerto=8080

# Base de datos
db_host=127.0.0.1
db_puerto=5432
db_nombre=miapp
max_conns=abc
linea_mala_sin_igual
` + "`" + `

	config, err := ParsearConfig(input)
	if err != nil {
		fmt.Println("Error de parseo:", err)
		var ce *ErrorConfiguracion
		if errors.As(err, &ce) {
			fmt.Printf("  Línea %d, campo '%s': %s\n", ce.Linea, ce.Campo, ce.Mensaje)
		}
	}

	if config != nil {
		host, _ := config.Obtener("host")
		fmt.Println("\nHost:", host)

		puerto, err := config.ObtenerInt("puerto")
		if err != nil {
			fmt.Println("Error puerto:", err)
		} else {
			fmt.Println("Puerto:", puerto)
		}

		_, err = config.Obtener("no_existe")
		fmt.Println("Clave inexistente:", err)

		_, err = config.ObtenerInt("max_conns")
		fmt.Println("Entero inválido:", err)
	}
}`,
		expectedOutput: `Error de parseo: línea 10: campo 'linea_mala_sin_igual' — formato inválido, falta '='
  Línea 10, campo 'linea_mala_sin_igual': formato inválido, falta '='

Host: localhost
Puerto: 8080
Clave inexistente: Obtener(no_existe): clave no encontrada
Entero inválido: ObtenerInt(max_conns): valor 'abc' no es entero: strconv.Atoi: parsing "abc": invalid syntax`,
		hints: [
			'ParsearConfig retorna el config parcial junto con el error (permite usar las líneas válidas que ya parseó). ErrorConfiguracion necesita pointer receiver para Error().',
			'Obtener usa el idiom comma-ok del map. ObtenerInt llama a Obtener primero, luego strconv.Atoi. Ambos envuelven errores con %w.'
		],
		points: 8,
		concepts: [
			'custom-errors',
			'error-wrapping',
			'errors.Is',
			'errors.As',
			'strconv',
			'strings',
			'maps'
		]
	}
];

// Module 9: Packages, Modules & Tooling
// Covers: package visibility, go.mod, go tools, project structure, slog logging

import type { Exercise, WorkedExample } from './types';

export const workedExamples: WorkedExample[] = [
	{
		id: 'm9-we-001',
		moduleId: 9,
		title: 'Estructura de un proyecto multi-paquete',
		description:
			'Construimos paso a paso un proyecto Go con múltiples paquetes, entendiendo la visibilidad de nombres y la organización estándar.',
		steps: [
			{
				code: `// go.mod — raíz del módulo
module github.com/usuario/miapp

go 1.23`,
				explanation:
					'Todo proyecto Go empieza con go.mod. La directiva "module" define la ruta de importación base. Todos los paquetes dentro de este directorio usan esta ruta como prefijo.',
				highlightLines: [2],
			},
			{
				code: `// internal/mathutil/mathutil.go
package mathutil

// Sumar es exportada (mayúscula) — visible fuera del paquete.
func Sumar(a, b int) int {
	return a + b
}

// restar es privada (minúscula) — solo visible dentro de mathutil.
func restar(a, b int) int {
	return a - b
}`,
				explanation:
					'En Go, la visibilidad se controla con la primera letra: mayúscula = exportado (público), minúscula = no exportado (privado al paquete). No hay keywords como public/private.',
				highlightLines: [4, 9],
			},
			{
				code: `// internal/mathutil/mathutil_test.go
package mathutil

import "testing"

func TestSumar(t *testing.T) {
	resultado := Sumar(2, 3)
	if resultado != 5 {
		t.Errorf("Sumar(2, 3) = %d; esperado 5", resultado)
	}
}`,
				explanation:
					'Los tests van en el mismo paquete con sufijo _test.go. Esto les da acceso a funciones no exportadas también. Ejecutas con "go test ./internal/mathutil/".',
				highlightLines: [2, 6],
			},
			{
				code: `// cmd/miapp/main.go
package main

import (
	"fmt"
	"github.com/usuario/miapp/internal/mathutil"
)

func main() {
	resultado := mathutil.Sumar(10, 20)
	fmt.Println("Resultado:", resultado)

	// mathutil.restar(10, 5) // ERROR: no exportada
}`,
				explanation:
					'El paquete main importa mathutil usando la ruta completa del módulo. Solo puede acceder a Sumar (exportada). La carpeta internal/ es especial: Go impide que paquetes externos la importen.',
				highlightLines: [6, 10],
			},
		],
		playground: true,
		playgroundCode: `package main

import "fmt"

// Simulamos la estructura — en el playground todo va en un archivo.
// En un proyecto real, cada sección sería un paquete separado.

// --- Paquete "mathutil" (exportado vs no exportado) ---

// Sumar — exportada (mayúscula)
func Sumar(a, b int) int {
	return a + b
}

// restar — no exportada (minúscula, solo accesible aquí)
func restar(a, b int) int {
	return a - b
}

func main() {
	fmt.Println("Sumar(10, 20) =", Sumar(10, 20))
	fmt.Println("restar(10, 5) =", restar(10, 5)) // Funciona aquí porque estamos en el mismo paquete

	// Experimenta:
	// 1. Crea una función Multiplicar exportada
	// 2. Crea una función dividir no exportada
	// 3. ¿Qué pasa si intentas llamar una función no exportada desde otro paquete?
}`,
	},
	{
		id: 'm9-we-002',
		moduleId: 9,
		title: 'Logging estructurado con slog',
		description:
			'Aprendemos a usar slog (Go 1.21+) para crear logs estructurados con niveles, atributos y handlers configurables.',
		steps: [
			{
				code: `package main

import "log/slog"

func main() {
	// slog por defecto usa TextHandler a stderr
	slog.Info("servidor iniciado", "puerto", 8080)
	slog.Warn("conexión lenta", "latencia_ms", 250)
}`,
				explanation:
					'slog es el paquete estándar de logging estructurado desde Go 1.21. A diferencia de log.Println, slog organiza los datos en pares clave-valor, lo que facilita filtrar y buscar en herramientas como Grafana o Datadog.',
				highlightLines: [7, 8],
			},
			{
				code: `package main

import (
	"log/slog"
	"os"
)

func main() {
	// JSONHandler produce logs en formato JSON — ideal para producción
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}))

	logger.Debug("detalle interno", "paso", 1)
	logger.Info("usuario autenticado", "user_id", "abc123", "rol", "admin")
	logger.Error("falló la consulta", "error", "connection refused", "db", "postgres")
}`,
				explanation:
					'slog.New crea un logger personalizado. JSONHandler formatea cada entrada como un objeto JSON con timestamp, level, msg y los atributos que pases. HandlerOptions permite configurar el nivel mínimo.',
				highlightLines: [10, 11, 12],
			},
			{
				code: `package main

import (
	"context"
	"log/slog"
	"os"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	// With() crea un sub-logger con atributos fijos
	reqLogger := logger.With("request_id", "req-789", "servicio", "api-usuarios")

	reqLogger.Info("procesando petición", "método", "GET", "ruta", "/users")
	reqLogger.Warn("rate limit cercano", "uso_actual", 95, "límite", 100)

	// slog.SetDefault hace que slog.Info() global use tu logger
	slog.SetDefault(logger)
	slog.Info("ahora el logger global es JSON")
}`,
				explanation:
					'With() es clave para inyectar contexto: creas un sub-logger con campos fijos (como request_id) y cada log posterior los incluye automáticamente. Esto es esencial para trazar peticiones en microservicios.',
				highlightLines: [13, 15, 16],
			},
		],
		playground: true,
		playgroundCode: `package main

import (
	"log/slog"
	"os"
)

func main() {
	// Logger con JSONHandler
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}))

	// Log básico
	logger.Info("aplicación iniciada", "versión", "1.0.0")

	// Sub-logger con contexto fijo
	userLogger := logger.With("módulo", "auth")
	userLogger.Info("login exitoso", "user", "gopher42")
	userLogger.Warn("intento fallido", "user", "hacker99", "intentos", 3)

	// Experimenta:
	// 1. Cambia LevelDebug por LevelWarn — ¿qué logs desaparecen?
	// 2. Usa slog.NewTextHandler en vez de JSONHandler
	// 3. Agrega más atributos con With()
}`,
	},
];

export const exercises: Exercise[] = [
	{
		id: 'm9-ex-001',
		moduleId: 9,
		tier: 'fill-in-blank',
		difficulty: 'beginner',
		title: 'Visibilidad y go.mod',
		description:
			'Completa los blancos para que el código compile correctamente. Recuerda: en Go la visibilidad depende de la primera letra del nombre.',
		baseCode: `package main

import (
	"fmt"
	"log/slog"
	"os"
)

// ___ define un tipo exportado (visible fuera del paquete)
type ___ struct {
	Nombre string
	edad   int // no exportado
}

// ___ es una función exportada que crea un Usuario
func ___Usuario(nombre string, edad int) Usuario {
	return Usuario{Nombre: nombre, edad: edad}
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.___, nil))

	u := NuevoUsuario("Gopher", 5)
	logger.Info("usuario creado",
		"nombre", u.Nombre,
		"edad_accesible", u.___,
	)
	fmt.Println("Hola,", u.Nombre)
}`,
		solution: `package main

import (
	"fmt"
	"log/slog"
	"os"
)

// Usuario define un tipo exportado (visible fuera del paquete)
type Usuario struct {
	Nombre string
	edad   int // no exportado
}

// NuevoUsuario es una función exportada que crea un Usuario
func NuevoUsuario(nombre string, edad int) Usuario {
	return Usuario{Nombre: nombre, edad: edad}
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	u := NuevoUsuario("Gopher", 5)
	logger.Info("usuario creado",
		"nombre", u.Nombre,
		"edad_accesible", u.edad,
	)
	fmt.Println("Hola,", u.Nombre)
}`,
		expectedOutput: `{"time":"...","level":"INFO","msg":"usuario creado","nombre":"Gopher","edad_accesible":5}
Hola, Gopher`,
		hints: [
			'Los nombres exportados en Go empiezan con mayúscula. Para tipos, funciones y campos que deben ser accesibles desde otros paquetes, usa mayúscula inicial.',
			'El tipo se llama "Usuario", la función constructora "NuevoUsuario", el output va a os.Stdout, y el campo no exportado "edad" se accede dentro del mismo paquete.',
		],
		points: 4,
		concepts: ['package-visibility', 'exported-names', 'slog', 'struct-fields'],
	},
	{
		id: 'm9-ex-002',
		moduleId: 9,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'Bugs en la estructura del proyecto',
		description:
			'Este código tiene 3 bugs relacionados con paquetes, imports y visibilidad. Encuéntralos y corrígelos.',
		baseCode: `package main

import (
	"fmt"
	"log/slog"
	"os"
)

// configuracion guarda los ajustes de la app
type configuracion struct {
	Puerto int
	host   string
}

// NuevaConfiguracion crea una configuración por defecto
func NuevaConfiguracion() configuracion {
	return configuracion{Puerto: 8080, host: "localhost"}
}

// iniciar arranca el servidor con la configuración dada
func iniciar(cfg configuracion) {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	logger.info("servidor iniciado",
		"puerto", cfg.Puerto,
		"host", cfg.host,
	)
	fmt.Printf("Escuchando en %s:%d\\n", cfg.host, cfg.Puerto)
}

func main() {
	cfg := NuevaConfiguracion()
	iniciar(cfg)
}`,
		solution: `package main

import (
	"fmt"
	"log/slog"
	"os"
)

// Configuracion guarda los ajustes de la app
type Configuracion struct {
	Puerto int
	host   string
}

// NuevaConfiguracion crea una configuración por defecto
func NuevaConfiguracion() Configuracion {
	return Configuracion{Puerto: 8080, host: "localhost"}
}

// Iniciar arranca el servidor con la configuración dada
func Iniciar(cfg Configuracion) {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	logger.Info("servidor iniciado",
		"puerto", cfg.Puerto,
		"host", cfg.host,
	)
	fmt.Printf("Escuchando en %s:%d\\n", cfg.host, cfg.Puerto)
}

func main() {
	cfg := NuevaConfiguracion()
	Iniciar(cfg)
}`,
		expectedOutput: `{"time":"...","level":"INFO","msg":"servidor iniciado","puerto":8080,"host":"localhost"}
Escuchando en localhost:8080`,
		hints: [
			'Revisa los métodos de slog: ¿se llaman con mayúscula o minúscula? Recuerda que en Go los métodos exportados empiezan con mayúscula.',
			'Bug 1: logger.info → logger.Info (método exportado). Bug 2: el tipo "configuracion" debería ser "Configuracion" si queremos que sea exportado. Bug 3: "iniciar" debería ser "Iniciar" para ser exportada.',
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['package-visibility', 'exported-names', 'slog-methods', 'naming-conventions'],
	},
	{
		id: 'm9-ex-003',
		moduleId: 9,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'Logger mal configurado',
		description:
			'El programa compila pero el logging no funciona como se espera. Encuentra los 2 bugs en la configuración de slog.',
		baseCode: `package main

import (
	"log/slog"
	"os"
)

func main() {
	// Queremos: logs en JSON a stdout, nivel mínimo Debug
	handler := slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{
		Level: slog.LevelError,
	})
	logger := slog.New(handler)

	logger.Debug("iniciando diagnóstico", "paso", 1)
	logger.Info("conectando a base de datos", "host", "localhost", "puerto", 5432)
	logger.Warn("latencia alta", "ms", 500)
	logger.Error("conexión rechazada", "error", "timeout")

	// Esperamos ver TODOS los niveles en formato JSON por stdout
	// Pero solo vemos el Error en formato texto por stderr... ¿por qué?
}`,
		solution: `package main

import (
	"log/slog"
	"os"
)

func main() {
	// Queremos: logs en JSON a stdout, nivel mínimo Debug
	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	})
	logger := slog.New(handler)

	logger.Debug("iniciando diagnóstico", "paso", 1)
	logger.Info("conectando a base de datos", "host", "localhost", "puerto", 5432)
	logger.Warn("latencia alta", "ms", 500)
	logger.Error("conexión rechazada", "error", "timeout")

	// Ahora vemos TODOS los niveles en formato JSON por stdout
}`,
		expectedOutput: `{"time":"...","level":"DEBUG","msg":"iniciando diagnóstico","paso":1}
{"time":"...","level":"INFO","msg":"conectando a base de datos","host":"localhost","puerto":5432}
{"time":"...","level":"WARN","msg":"latencia alta","ms":500}
{"time":"...","level":"ERROR","msg":"conexión rechazada","error":"timeout"}`,
		hints: [
			'Lee el comentario: queremos JSON a stdout con nivel Debug. Compara lo que dice el comentario con lo que realmente hace el código.',
			'Bug 1: NewTextHandler debería ser NewJSONHandler (queremos JSON). Bug 2: LevelError debería ser LevelDebug (queremos ver todos los niveles).',
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['slog', 'json-handler', 'log-levels', 'handler-options'],
	},
	{
		id: 'm9-ex-004',
		moduleId: 9,
		tier: 'mini-project',
		difficulty: 'advanced',
		title: 'Organizador multi-paquete con slog',
		description:
			'Crea un programa con estructura multi-paquete simulada que gestione tareas. Incluye un "paquete" de modelos con tipos exportados, un "paquete" de servicio con lógica de negocio, y logging estructurado con slog en todo el flujo. Requisitos:\n\n1. Tipo Tarea con campos ID, Titulo (exportados) y prioridad (no exportado)\n2. Tipo Servicio que contenga un slice de tareas y un *slog.Logger\n3. Métodos: Agregar(titulo, prioridad), Listar(), BuscarPorID(id)\n4. Logging con slog.New + JSONHandler en cada operación\n5. Sub-loggers con With() para contexto por operación',
		baseCode: `package main

import (
	"fmt"
	"log/slog"
	"os"
)

// --- "Paquete" modelos ---

// Tarea representa una tarea del sistema
type Tarea struct {
	// TODO: campos ID (int), Titulo (string) exportados
	// y prioridad (string) no exportado
}

// NuevaTarea crea una tarea con los datos proporcionados
func NuevaTarea(id int, titulo, prioridad string) Tarea {
	// TODO: retornar una Tarea con los campos inicializados
	return Tarea{}
}

// ObtenerPrioridad devuelve la prioridad (acceso controlado)
func (t Tarea) ObtenerPrioridad() string {
	// TODO: retornar el campo no exportado
	return ""
}

// --- "Paquete" servicio ---

// Servicio gestiona las tareas
type Servicio struct {
	tareas  []Tarea
	logger  *slog.Logger
	nextID  int
}

// NuevoServicio crea un servicio con logging JSON
func NuevoServicio() *Servicio {
	// TODO: crear logger con slog.New + JSONHandler a Stdout
	// TODO: retornar el servicio inicializado
	return nil
}

// Agregar añade una nueva tarea y loguea la operación
func (s *Servicio) Agregar(titulo, prioridad string) Tarea {
	// TODO: incrementar nextID, crear tarea, agregarla al slice
	// TODO: loguear con sub-logger (With) incluyendo "op"="agregar"
	return Tarea{}
}

// Listar retorna todas las tareas y loguea cuántas hay
func (s *Servicio) Listar() []Tarea {
	// TODO: loguear con Info el total de tareas
	// TODO: retornar el slice
	return nil
}

// BuscarPorID busca una tarea por ID, retorna puntero o nil
func (s *Servicio) BuscarPorID(id int) *Tarea {
	// TODO: recorrer tareas, si encuentra retornar &tarea
	// TODO: loguear Warn si no se encuentra
	return nil
}

func main() {
	svc := NuevoServicio()

	svc.Agregar("Aprender paquetes en Go", "alta")
	svc.Agregar("Configurar slog", "media")
	svc.Agregar("Escribir tests", "alta")

	tareas := svc.Listar()
	for _, t := range tareas {
		fmt.Printf("[%d] %s (prioridad: %s)\\n", t.ID, t.Titulo, t.ObtenerPrioridad())
	}

	if t := svc.BuscarPorID(2); t != nil {
		fmt.Printf("\\nEncontrada: %s\\n", t.Titulo)
	}

	svc.BuscarPorID(99) // no existe — debe loguear warning
}`,
		solution: `package main

import (
	"fmt"
	"log/slog"
	"os"
)

// --- "Paquete" modelos ---

// Tarea representa una tarea del sistema
type Tarea struct {
	ID       int
	Titulo   string
	prioridad string
}

// NuevaTarea crea una tarea con los datos proporcionados
func NuevaTarea(id int, titulo, prioridad string) Tarea {
	return Tarea{ID: id, Titulo: titulo, prioridad: prioridad}
}

// ObtenerPrioridad devuelve la prioridad (acceso controlado)
func (t Tarea) ObtenerPrioridad() string {
	return t.prioridad
}

// --- "Paquete" servicio ---

// Servicio gestiona las tareas
type Servicio struct {
	tareas []Tarea
	logger *slog.Logger
	nextID int
}

// NuevoServicio crea un servicio con logging JSON
func NuevoServicio() *Servicio {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}))
	return &Servicio{
		tareas: make([]Tarea, 0),
		logger: logger,
		nextID: 0,
	}
}

// Agregar añade una nueva tarea y loguea la operación
func (s *Servicio) Agregar(titulo, prioridad string) Tarea {
	s.nextID++
	tarea := NuevaTarea(s.nextID, titulo, prioridad)
	s.tareas = append(s.tareas, tarea)

	opLogger := s.logger.With("op", "agregar")
	opLogger.Info("tarea creada",
		"id", tarea.ID,
		"titulo", tarea.Titulo,
		"prioridad", tarea.ObtenerPrioridad(),
	)
	return tarea
}

// Listar retorna todas las tareas y loguea cuántas hay
func (s *Servicio) Listar() []Tarea {
	s.logger.Info("listando tareas", "total", len(s.tareas))
	return s.tareas
}

// BuscarPorID busca una tarea por ID, retorna puntero o nil
func (s *Servicio) BuscarPorID(id int) *Tarea {
	for i := range s.tareas {
		if s.tareas[i].ID == id {
			s.logger.Info("tarea encontrada", "id", id, "titulo", s.tareas[i].Titulo)
			return &s.tareas[i]
		}
	}
	s.logger.Warn("tarea no encontrada", "id", id)
	return nil
}

func main() {
	svc := NuevoServicio()

	svc.Agregar("Aprender paquetes en Go", "alta")
	svc.Agregar("Configurar slog", "media")
	svc.Agregar("Escribir tests", "alta")

	tareas := svc.Listar()
	for _, t := range tareas {
		fmt.Printf("[%d] %s (prioridad: %s)\\n", t.ID, t.Titulo, t.ObtenerPrioridad())
	}

	if t := svc.BuscarPorID(2); t != nil {
		fmt.Printf("\\nEncontrada: %s\\n", t.Titulo)
	}

	svc.BuscarPorID(99)
}`,
		expectedOutput: `{"time":"...","level":"INFO","msg":"tarea creada","op":"agregar","id":1,"titulo":"Aprender paquetes en Go","prioridad":"alta"}
{"time":"...","level":"INFO","msg":"tarea creada","op":"agregar","id":2,"titulo":"Configurar slog","prioridad":"media"}
{"time":"...","level":"INFO","msg":"tarea creada","op":"agregar","id":3,"titulo":"Escribir tests","prioridad":"alta"}
{"time":"...","level":"INFO","msg":"listando tareas","total":3}
[1] Aprender paquetes en Go (prioridad: alta)
[2] Configurar slog (prioridad: media)
[3] Escribir tests (prioridad: alta)
{"time":"...","level":"INFO","msg":"tarea encontrada","id":2,"titulo":"Configurar slog"}

Encontrada: Configurar slog
{"time":"...","level":"WARN","msg":"tarea no encontrada","id":99}`,
		hints: [
			'Recuerda: slog.New(slog.NewJSONHandler(os.Stdout, opts)) crea un logger JSON. Usa logger.With("clave", "valor") para crear sub-loggers con contexto fijo.',
			'Para BuscarPorID, recorre con "for i := range s.tareas" y retorna &s.tareas[i] (no &tarea del range, que es una copia).',
		],
		points: 8,
		concepts: [
			'package-visibility',
			'exported-names',
			'slog',
			'json-handler',
			'sub-logger',
			'struct-methods',
			'project-structure',
		],
	},
];

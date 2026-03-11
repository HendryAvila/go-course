// Module 10: Concurrency Basics
// Covers: goroutines, channels (unbuffered/buffered), select, channel directions

import type { Exercise, WorkedExample } from './types';

export const workedExamples: WorkedExample[] = [
	{
		id: 'm10-we-001',
		moduleId: 10,
		title: 'Goroutines y canales paso a paso',
		description:
			'Construimos desde una goroutine simple hasta la comunicación con canales unbuffered y buffered.',
		steps: [
			{
				code: `package main

import (
	"fmt"
	"time"
)

func saludar(nombre string) {
	fmt.Printf("¡Hola, %s!\\n", nombre)
}

func main() {
	go saludar("Gopher")   // lanza goroutine
	go saludar("Mundo")    // lanza otra goroutine

	time.Sleep(100 * time.Millisecond) // espera (forma incorrecta)
	fmt.Println("Fin")
}`,
				explanation:
					'La keyword "go" lanza una función en una goroutine (hilo ligero). Sin sincronización, main podría terminar antes de que las goroutines ejecuten. time.Sleep funciona pero es frágil — vamos a mejorarlo.',
				highlightLines: [13, 14],
			},
			{
				code: `package main

import "fmt"

func calcular(n int, resultado chan<- int) {
	suma := 0
	for i := 1; i <= n; i++ {
		suma += i
	}
	resultado <- suma // envía por el canal
}

func main() {
	ch := make(chan int) // canal unbuffered

	go calcular(100, ch)

	total := <-ch // recibe — bloquea hasta que haya dato
	fmt.Println("Suma 1..100 =", total)
}`,
				explanation:
					'Un canal unbuffered sincroniza: el envío (ch <- valor) bloquea hasta que alguien reciba (<-ch), y viceversa. La dirección chan<- indica que la función solo puede enviar por ese canal.',
				highlightLines: [5, 10, 14, 18],
			},
			{
				code: `package main

import "fmt"

func productor(ch chan<- string) {
	mensajes := []string{"hola", "mundo", "go"}
	for _, m := range mensajes {
		ch <- m
	}
	close(ch) // señala que no hay más datos
}

func main() {
	ch := make(chan string, 2) // canal buffered (capacidad 2)

	go productor(ch)

	// range sobre canal: itera hasta que se cierre
	for msg := range ch {
		fmt.Println("Recibido:", msg)
	}
	fmt.Println("Canal cerrado, fin.")
}`,
				explanation:
					'Un canal buffered permite enviar sin bloquear mientras haya capacidad. close(ch) señala que no habrá más envíos. "for range" sobre un canal lee hasta que se cierre — es el patrón idiomático para consumir todos los mensajes.',
				highlightLines: [10, 14, 19],
			},
			{
				code: `package main

import (
	"fmt"
	"time"
)

func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	go func() {
		time.Sleep(50 * time.Millisecond)
		ch1 <- "uno"
	}()
	go func() {
		time.Sleep(30 * time.Millisecond)
		ch2 <- "dos"
	}()

	// select espera al primer canal que tenga dato
	select {
	case msg := <-ch1:
		fmt.Println("Recibido de ch1:", msg)
	case msg := <-ch2:
		fmt.Println("Recibido de ch2:", msg)
	case <-time.After(1 * time.Second):
		fmt.Println("Timeout!")
	}
}`,
				explanation:
					'select es como un switch para canales: espera a que uno de los cases esté listo y ejecuta ese. Si varios están listos, elige uno al azar. time.After devuelve un canal que recibe después del tiempo indicado — perfecto para timeouts.',
				highlightLines: [22, 23, 25, 27],
			},
		],
		playground: true,
		playgroundCode: `package main

import (
	"fmt"
	"time"
)

func trabajador(id int, trabajos <-chan int, resultados chan<- int) {
	for j := range trabajos {
		fmt.Printf("Trabajador %d procesando trabajo %d\\n", id, j)
		time.Sleep(50 * time.Millisecond)
		resultados <- j * 2
	}
}

func main() {
	trabajos := make(chan int, 5)
	resultados := make(chan int, 5)

	// Lanzar 3 trabajadores
	for w := 1; w <= 3; w++ {
		go trabajador(w, trabajos, resultados)
	}

	// Enviar 5 trabajos
	for j := 1; j <= 5; j++ {
		trabajos <- j
	}
	close(trabajos)

	// Recoger resultados
	for r := 1; r <= 5; r++ {
		fmt.Println("Resultado:", <-resultados)
	}
}`,
	},
	{
		id: 'm10-we-002',
		moduleId: 10,
		title: 'Patrones de canal: generador y fan-out',
		description:
			'Exploramos dos patrones fundamentales de concurrencia: generador (función que retorna un canal) y fan-out (múltiples lectores de un canal).',
		steps: [
			{
				code: `package main

import "fmt"

// generador retorna un canal de solo lectura con los números
func generador(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		for _, n := range nums {
			out <- n
		}
		close(out)
	}()
	return out
}

func main() {
	ch := generador(2, 3, 5, 7, 11)

	for n := range ch {
		fmt.Println(n)
	}
}`,
				explanation:
					'El patrón generador encapsula la goroutine dentro de la función. Retorna <-chan int (canal de solo lectura). La goroutine interna envía los valores y cierra el canal cuando termina. El caller solo consume.',
				highlightLines: [6, 7, 12, 14],
			},
			{
				code: `package main

import "fmt"

func duplicar(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		for n := range in {
			out <- n * 2
		}
		close(out)
	}()
	return out
}

func sumarUno(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		for n := range in {
			out <- n + 1
		}
		close(out)
	}()
	return out
}

func generador(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		for _, n := range nums {
			out <- n
		}
		close(out)
	}()
	return out
}

func main() {
	// Pipeline: generador → duplicar → sumarUno
	ch := sumarUno(duplicar(generador(1, 2, 3, 4, 5)))

	for resultado := range ch {
		fmt.Println(resultado) // 3, 5, 7, 9, 11
	}
}`,
				explanation:
					'Un pipeline conecta etapas: cada función recibe <-chan y retorna <-chan. Los datos fluyen como en una tubería Unix. Cada etapa corre en su propia goroutine. close() se propaga: cuando una etapa cierra su salida, la siguiente termina su range.',
				highlightLines: [5, 16, 40],
			},
			{
				code: `package main

import (
	"fmt"
	"sync"
)

func generador(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		for _, n := range nums {
			out <- n
		}
		close(out)
	}()
	return out
}

func cuadrado(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		for n := range in {
			out <- n * n
		}
		close(out)
	}()
	return out
}

// merge combina múltiples canales en uno (fan-in)
func merge(canales ...<-chan int) <-chan int {
	var wg sync.WaitGroup
	out := make(chan int)

	// Lanzar una goroutine por cada canal de entrada
	for _, ch := range canales {
		wg.Add(1)
		go func(c <-chan int) {
			defer wg.Done()
			for n := range c {
				out <- n
			}
		}(ch)
	}

	// Cerrar out cuando todas las goroutines terminen
	go func() {
		wg.Wait()
		close(out)
	}()

	return out
}

func main() {
	// Fan-out: dos goroutines leen del mismo generador
	entrada := generador(1, 2, 3, 4, 5, 6)
	c1 := cuadrado(entrada)
	c2 := cuadrado(entrada)

	// Fan-in: merge combina los resultados
	for resultado := range merge(c1, c2) {
		fmt.Println(resultado)
	}
}`,
				explanation:
					'Fan-out: múltiples goroutines leen del mismo canal (el runtime distribuye los valores). Fan-in: merge() combina múltiples canales en uno usando WaitGroup para saber cuándo cerrar. Este patrón es la base de los worker pools.',
				highlightLines: [31, 37, 38, 47, 48, 58, 59],
			},
		],
		playground: true,
		playgroundCode: `package main

import (
	"fmt"
	"sync"
)

func generador(nums ...int) <-chan int {
	out := make(chan int)
	go func() {
		for _, n := range nums {
			out <- n
		}
		close(out)
	}()
	return out
}

func cuadrado(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		for n := range in {
			out <- n * n
		}
		close(out)
	}()
	return out
}

func merge(canales ...<-chan int) <-chan int {
	var wg sync.WaitGroup
	out := make(chan int)
	for _, ch := range canales {
		wg.Add(1)
		go func(c <-chan int) {
			defer wg.Done()
			for n := range c {
				out <- n
			}
		}(ch)
	}
	go func() {
		wg.Wait()
		close(out)
	}()
	return out
}

func main() {
	entrada := generador(1, 2, 3, 4, 5, 6, 7, 8)
	c1 := cuadrado(entrada)
	c2 := cuadrado(entrada)

	for r := range merge(c1, c2) {
		fmt.Print(r, " ")
	}
	fmt.Println()

	// Experimenta:
	// 1. Agrega una tercera goroutine c3 := cuadrado(entrada)
	// 2. Crea una función "filtrar" que solo pase números pares
	// 3. Combina todo: generador → filtrar → cuadrado → merge
}`,
	},
];

export const exercises: Exercise[] = [
	{
		id: 'm10-ex-001',
		moduleId: 10,
		tier: 'fill-in-blank',
		difficulty: 'beginner',
		title: 'Canales y goroutines básicos',
		description:
			'Completa los blancos para que las goroutines se comuniquen correctamente a través de canales.',
		baseCode: `package main

import "fmt"

func cuadrado(n int, resultado ___) {
	resultado <- n * n
}

func main() {
	ch := ___(chan int) // crear canal unbuffered

	nums := []int{2, 3, 4, 5}

	for _, n := range nums {
		___ cuadrado(n, ch) // lanzar goroutine
	}

	suma := 0
	for range nums {
		valor := ___  // recibir del canal
		suma += valor
	}

	fmt.Println("Suma de cuadrados:", suma) // 4+9+16+25 = 54
}`,
		solution: `package main

import "fmt"

func cuadrado(n int, resultado chan<- int) {
	resultado <- n * n
}

func main() {
	ch := make(chan int) // crear canal unbuffered

	nums := []int{2, 3, 4, 5}

	for _, n := range nums {
		go cuadrado(n, ch) // lanzar goroutine
	}

	suma := 0
	for range nums {
		valor := <-ch // recibir del canal
		suma += valor
	}

	fmt.Println("Suma de cuadrados:", suma) // 4+9+16+25 = 54
}`,
		expectedOutput: 'Suma de cuadrados: 54',
		hints: [
			'Las direcciones de canal son: chan<- (solo enviar), <-chan (solo recibir). Para crear un canal se usa make(). Para lanzar una goroutine se usa la keyword "go".',
			'Los blancos son: chan<- int (dirección de envío), make (crear canal), go (lanzar goroutine), <-ch (recibir del canal).',
		],
		points: 4,
		concepts: ['goroutines', 'channels', 'channel-directions', 'make'],
	},
	{
		id: 'm10-ex-002',
		moduleId: 10,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'Deadlock por canal sin cerrar',
		description:
			'Este programa causa un deadlock. Encuentra los 2 bugs y corrígelos para que funcione correctamente.',
		baseCode: `package main

import "fmt"

func productor(mensajes chan string) {
	datos := []string{"alpha", "beta", "gamma", "delta"}
	for _, d := range datos {
		mensajes <- d
	}
	// Nota: no cerramos el canal
}

func main() {
	mensajes := make(chan string)

	productor(mensajes) // llamada síncrona (no goroutine)

	for msg := range mensajes {
		fmt.Println("Recibido:", msg)
	}

	fmt.Println("Todos los mensajes procesados")
}`,
		solution: `package main

import "fmt"

func productor(mensajes chan<- string) {
	datos := []string{"alpha", "beta", "gamma", "delta"}
	for _, d := range datos {
		mensajes <- d
	}
	close(mensajes) // cerrar para que range termine
}

func main() {
	mensajes := make(chan string)

	go productor(mensajes) // goroutine para no bloquear

	for msg := range mensajes {
		fmt.Println("Recibido:", msg)
	}

	fmt.Println("Todos los mensajes procesados")
}`,
		expectedOutput: `Recibido: alpha
Recibido: beta
Recibido: gamma
Recibido: delta
Todos los mensajes procesados`,
		hints: [
			'Un canal unbuffered bloquea al enviar hasta que alguien reciba. Si productor y main corren en la misma goroutine, ¿quién recibe?',
			'Bug 1: productor debe correr como goroutine (go productor). Bug 2: el canal debe cerrarse con close(mensajes) para que "for range" termine.',
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['deadlock', 'goroutines', 'close-channel', 'range-channel'],
	},
	{
		id: 'm10-ex-003',
		moduleId: 10,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'Select con timeout roto',
		description:
			'El programa debería usar select para manejar un timeout, pero tiene 2 bugs que causan comportamiento inesperado.',
		baseCode: `package main

import (
	"fmt"
	"time"
)

func buscarEnDB(consulta string, resultado chan string) {
	time.Sleep(200 * time.Millisecond)
	resultado <- fmt.Sprintf("Resultado para: %s", consulta)
}

func main() {
	resultado := make(chan string)

	go buscarEnDB("SELECT * FROM users", resultado)

	select {
	case r := <-resultado:
		fmt.Println(r)
	case <-time.After(100 * time.Millisecond):
		fmt.Println("Timeout: la consulta tardó demasiado")
	}

	// Segunda consulta — debería funcionar (timeout más largo)
	resultado2 := make(chan string)
	go buscarEnDB("SELECT * FROM orders", resultado2)

	select {
	case r := <-resultado:  // Bug: canal equivocado
		fmt.Println(r)
	case <-time.After(50 * time.Millisecond): // Bug: timeout muy corto
		fmt.Println("Timeout: la consulta tardó demasiado")
	}
}`,
		solution: `package main

import (
	"fmt"
	"time"
)

func buscarEnDB(consulta string, resultado chan<- string) {
	time.Sleep(200 * time.Millisecond)
	resultado <- fmt.Sprintf("Resultado para: %s", consulta)
}

func main() {
	resultado := make(chan string)

	go buscarEnDB("SELECT * FROM users", resultado)

	select {
	case r := <-resultado:
		fmt.Println(r)
	case <-time.After(100 * time.Millisecond):
		fmt.Println("Timeout: la consulta tardó demasiado")
	}

	// Segunda consulta — ahora funciona
	resultado2 := make(chan string)
	go buscarEnDB("SELECT * FROM orders", resultado2)

	select {
	case r := <-resultado2: // canal correcto
		fmt.Println(r)
	case <-time.After(500 * time.Millisecond): // timeout suficiente
		fmt.Println("Timeout: la consulta tardó demasiado")
	}
}`,
		expectedOutput: `Timeout: la consulta tardó demasiado
Resultado para: SELECT * FROM orders`,
		hints: [
			'Mira cuidadosamente qué canal se lee en cada select. ¿El segundo select lee del canal correcto?',
			'Bug 1: el segundo select lee de "resultado" en vez de "resultado2". Bug 2: el timeout de 50ms es menor que los 200ms de la consulta, debería ser 500ms o más.',
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['select', 'timeout', 'channels', 'time-after'],
	},
	{
		id: 'm10-ex-004',
		moduleId: 10,
		tier: 'mini-project',
		difficulty: 'advanced',
		title: 'Fetcher concurrente de URLs',
		description:
			'Construye un fetcher concurrente que simule descargar múltiples URLs en paralelo usando goroutines y canales. Requisitos:\n\n1. Tipo Resultado con campos URL, Contenido, Error y Duracion\n2. Función fetchURL que simule una descarga (time.Sleep random) y envíe resultado por canal\n3. Función fetchTodas que lance goroutines para todas las URLs y recolecte resultados\n4. Usar select con timeout global de 2 segundos\n5. Imprimir resumen: exitosas, fallidas, tiempo total',
		baseCode: `package main

import (
	"fmt"
	"math/rand"
	"time"
)

// Resultado contiene la info de una descarga
type Resultado struct {
	// TODO: URL string, Contenido string, Error error, Duracion time.Duration
}

// fetchURL simula la descarga de una URL y envía el resultado
func fetchURL(url string, resultados chan<- Resultado) {
	// TODO: simular descarga con time.Sleep aleatorio (50-300ms)
	// TODO: simular error si la duración > 250ms
	// TODO: enviar Resultado por el canal
}

// fetchTodas lanza goroutines para cada URL y recolecta resultados con timeout
func fetchTodas(urls []string, timeout time.Duration) []Resultado {
	// TODO: crear canal de resultados
	// TODO: lanzar goroutine por cada URL
	// TODO: recolectar con select + timeout global
	// TODO: retornar los resultados recolectados
	return nil
}

func main() {
	urls := []string{
		"https://go.dev",
		"https://pkg.go.dev",
		"https://gobyexample.com",
		"https://play.golang.org",
		"https://blog.golang.org",
	}

	fmt.Println("Iniciando fetch concurrente...")
	inicio := time.Now()

	resultados := fetchTodas(urls, 2*time.Second)

	exitosas := 0
	fallidas := 0
	for _, r := range resultados {
		if r.Error != nil {
			fmt.Printf("  FAIL  %s (%v) — %v\\n", r.URL, r.Duracion, r.Error)
			fallidas++
		} else {
			fmt.Printf("  OK    %s (%v) — %s\\n", r.URL, r.Duracion, r.Contenido)
			exitosas++
		}
	}

	fmt.Printf("\\nResumen: %d exitosas, %d fallidas, tiempo total: %v\\n",
		exitosas, fallidas, time.Since(inicio).Round(time.Millisecond))
}`,
		solution: `package main

import (
	"fmt"
	"math/rand"
	"time"
)

// Resultado contiene la info de una descarga
type Resultado struct {
	URL      string
	Contenido string
	Error    error
	Duracion time.Duration
}

// fetchURL simula la descarga de una URL y envía el resultado
func fetchURL(url string, resultados chan<- Resultado) {
	inicio := time.Now()
	duracion := time.Duration(50+rand.Intn(250)) * time.Millisecond
	time.Sleep(duracion)

	r := Resultado{
		URL:      url,
		Duracion: time.Since(inicio).Round(time.Millisecond),
	}

	if duracion > 250*time.Millisecond {
		r.Error = fmt.Errorf("timeout: descarga demasiado lenta")
	} else {
		r.Contenido = fmt.Sprintf("HTML de %s (%d bytes)", url, 1000+rand.Intn(9000))
	}

	resultados <- r
}

// fetchTodas lanza goroutines para cada URL y recolecta resultados con timeout
func fetchTodas(urls []string, timeout time.Duration) []Resultado {
	resultados := make(chan Resultado, len(urls))
	var recolectados []Resultado

	for _, url := range urls {
		go fetchURL(url, resultados)
	}

	timer := time.After(timeout)
	for i := 0; i < len(urls); i++ {
		select {
		case r := <-resultados:
			recolectados = append(recolectados, r)
		case <-timer:
			fmt.Println("  TIMEOUT global alcanzado, abortando restantes")
			return recolectados
		}
	}

	return recolectados
}

func main() {
	urls := []string{
		"https://go.dev",
		"https://pkg.go.dev",
		"https://gobyexample.com",
		"https://play.golang.org",
		"https://blog.golang.org",
	}

	fmt.Println("Iniciando fetch concurrente...")
	inicio := time.Now()

	resultados := fetchTodas(urls, 2*time.Second)

	exitosas := 0
	fallidas := 0
	for _, r := range resultados {
		if r.Error != nil {
			fmt.Printf("  FAIL  %s (%v) — %v\\n", r.URL, r.Duracion, r.Error)
			fallidas++
		} else {
			fmt.Printf("  OK    %s (%v) — %s\\n", r.URL, r.Duracion, r.Contenido)
			exitosas++
		}
	}

	fmt.Printf("\\nResumen: %d exitosas, %d fallidas, tiempo total: %v\\n",
		exitosas, fallidas, time.Since(inicio).Round(time.Millisecond))
}`,
		expectedOutput: `Iniciando fetch concurrente...
  OK    https://go.dev (120ms) — HTML de https://go.dev (4523 bytes)
  OK    https://pkg.go.dev (85ms) — HTML de https://pkg.go.dev (7201 bytes)
  FAIL  https://gobyexample.com (275ms) — timeout: descarga demasiado lenta
  OK    https://play.golang.org (190ms) — HTML de https://play.golang.org (3100 bytes)
  OK    https://blog.golang.org (65ms) — HTML de https://blog.golang.org (8432 bytes)

Resumen: 4 exitosas, 1 fallidas, tiempo total: 280ms`,
		hints: [
			'Usa make(chan Resultado, len(urls)) para un canal buffered. Lanza una goroutine por URL con "go fetchURL(url, resultados)". Recolecta con un for + select.',
			'En fetchTodas, usa time.After(timeout) fuera del loop. En el select, un case lee del canal de resultados y otro del timer. Si el timer gana, retorna lo que tengas.',
		],
		points: 8,
		concepts: [
			'goroutines',
			'buffered-channels',
			'channel-directions',
			'select',
			'timeout',
			'concurrent-patterns',
		],
	},
];

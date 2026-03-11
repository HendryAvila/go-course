// Module 11: Advanced Concurrency
// Covers: sync.WaitGroup, sync.Mutex, context, fan-out/fan-in, pipeline, worker pool, race conditions

import type { Exercise, WorkedExample } from './types';

export const workedExamples: WorkedExample[] = [
	{
		id: 'm11-we-001',
		moduleId: 11,
		title: 'WaitGroup, Mutex y race conditions',
		description:
			'Construimos paso a paso un contador concurrente seguro, mostrando el problema de las race conditions y cómo resolverlo con sync.Mutex.',
		steps: [
			{
				code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	contador := 0

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			contador++ // RACE CONDITION: acceso no sincronizado
		}()
	}

	wg.Wait()
	fmt.Println("Contador:", contador) // Resultado impredecible: 980? 995? 1000?
}`,
				explanation:
					'WaitGroup permite esperar a que todas las goroutines terminen: Add(1) antes de lanzar, Done() al terminar, Wait() para bloquear. Pero el código tiene una race condition: múltiples goroutines modifican "contador" sin sincronización.',
				highlightLines: [9, 13, 15, 16, 20],
			},
			{
				code: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	var mu sync.Mutex
	contador := 0

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			mu.Lock()   // adquirir el lock
			contador++  // sección crítica protegida
			mu.Unlock() // liberar el lock
		}()
	}

	wg.Wait()
	fmt.Println("Contador:", contador) // Siempre 1000
}`,
				explanation:
					'sync.Mutex protege la sección crítica: Lock() bloquea hasta obtener acceso exclusivo, Unlock() lo libera. Solo una goroutine puede estar entre Lock y Unlock a la vez. Ahora el resultado siempre es 1000.',
				highlightLines: [10, 17, 18, 19],
			},
			{
				code: `package main

import (
	"fmt"
	"sync"
)

// ContadorSeguro encapsula el mutex con los datos
type ContadorSeguro struct {
	mu    sync.Mutex
	valor int
}

func (c *ContadorSeguro) Incrementar() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.valor++
}

func (c *ContadorSeguro) Valor() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.valor
}

func main() {
	var wg sync.WaitGroup
	c := &ContadorSeguro{}

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.Incrementar()
		}()
	}

	wg.Wait()
	fmt.Println("Contador:", c.Valor()) // Siempre 1000
}`,
				explanation:
					'El patrón idiomático en Go es encapsular el mutex dentro del struct que protege. Usa "defer mu.Unlock()" para garantizar que se libera incluso si hay un panic. Esto evita olvidar el Unlock y hace el código más limpio.',
				highlightLines: [9, 10, 15, 16],
			},
		],
		playground: true,
		playgroundCode: `package main

import (
	"fmt"
	"sync"
)

type ContadorSeguro struct {
	mu    sync.Mutex
	valor int
}

func (c *ContadorSeguro) Incrementar() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.valor++
}

func (c *ContadorSeguro) Valor() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.valor
}

func main() {
	var wg sync.WaitGroup
	c := &ContadorSeguro{}

	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.Incrementar()
		}()
	}

	wg.Wait()
	fmt.Println("Contador:", c.Valor())

	// Experimenta:
	// 1. Quita el mutex (comenta Lock/Unlock) y corre varias veces
	// 2. Agrega un método Decrementar()
	// 3. Usa "go run -race main.go" localmente para detectar races
}`,
	},
	{
		id: 'm11-we-002',
		moduleId: 11,
		title: 'Context: cancelación y timeout',
		description:
			'Aprendemos a usar el paquete context para controlar el ciclo de vida de goroutines con cancelación manual y timeouts.',
		steps: [
			{
				code: `package main

import (
	"context"
	"fmt"
	"time"
)

func operacionLenta(ctx context.Context, id int) {
	select {
	case <-time.After(500 * time.Millisecond):
		fmt.Printf("Operación %d completada\\n", id)
	case <-ctx.Done():
		fmt.Printf("Operación %d cancelada: %v\\n", id, ctx.Err())
	}
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel() // siempre defer cancel()

	go operacionLenta(ctx, 1)
	go operacionLenta(ctx, 2)

	time.Sleep(200 * time.Millisecond)
	cancel() // cancelar todo después de 200ms
	time.Sleep(100 * time.Millisecond) // dar tiempo a que impriman
}`,
				explanation:
					'context.WithCancel retorna un ctx y una función cancel. Cuando llamas cancel(), ctx.Done() se cierra y todas las goroutines que lo escuchen pueden terminar limpiamente. SIEMPRE usa "defer cancel()" para evitar leaks.',
				highlightLines: [13, 14, 19, 20, 26],
			},
			{
				code: `package main

import (
	"context"
	"fmt"
	"time"
)

func consulta(ctx context.Context, nombre string) (string, error) {
	select {
	case <-time.After(300 * time.Millisecond):
		return fmt.Sprintf("datos de %s", nombre), nil
	case <-ctx.Done():
		return "", fmt.Errorf("consulta %s cancelada: %w", nombre, ctx.Err())
	}
}

func main() {
	// WithTimeout cancela automáticamente después del tiempo indicado
	ctx, cancel := context.WithTimeout(context.Background(), 200*time.Millisecond)
	defer cancel()

	resultado, err := consulta(ctx, "usuarios")
	if err != nil {
		fmt.Println("Error:", err)
	} else {
		fmt.Println("OK:", resultado)
	}
}`,
				explanation:
					'context.WithTimeout es como WithCancel pero se cancela solo después del timeout. ctx.Err() retorna context.DeadlineExceeded si fue por timeout, o context.Canceled si fue manual. El %w en Errorf permite unwrapping del error.',
				highlightLines: [13, 14, 20, 21],
			},
			{
				code: `package main

import (
	"context"
	"fmt"
	"time"
)

func procesarLote(ctx context.Context, items []string) error {
	for i, item := range items {
		// Verificar cancelación antes de cada item
		select {
		case <-ctx.Done():
			return fmt.Errorf("cancelado en item %d: %w", i, ctx.Err())
		default:
			// continuar procesando
		}

		fmt.Printf("Procesando [%d/%d]: %s\\n", i+1, len(items), item)
		time.Sleep(100 * time.Millisecond) // simular trabajo
	}
	return nil
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 350*time.Millisecond)
	defer cancel()

	items := []string{"alpha", "beta", "gamma", "delta", "epsilon"}

	if err := procesarLote(ctx, items); err != nil {
		fmt.Println("\\nAbortado:", err)
	} else {
		fmt.Println("\\nTodo completado")
	}
}`,
				explanation:
					'El patrón select con default es clave para loops: en cada iteración verificas si ctx está cancelado. Si no, el case default permite continuar inmediatamente. Esto hace que las goroutines sean "cooperativamente cancelables".',
				highlightLines: [12, 13, 14, 15],
			},
			{
				code: `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

func worker(ctx context.Context, id int, trabajos <-chan int, resultados chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for {
		select {
		case <-ctx.Done():
			fmt.Printf("Worker %d: contexto cancelado\\n", id)
			return
		case trabajo, ok := <-trabajos:
			if !ok {
				return // canal cerrado
			}
			time.Sleep(50 * time.Millisecond)
			resultados <- trabajo * trabajo
		}
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 300*time.Millisecond)
	defer cancel()

	trabajos := make(chan int, 10)
	resultados := make(chan int, 10)
	var wg sync.WaitGroup

	// Lanzar 3 workers
	for w := 1; w <= 3; w++ {
		wg.Add(1)
		go worker(ctx, w, trabajos, resultados, &wg)
	}

	// Enviar trabajos
	for j := 1; j <= 20; j++ {
		trabajos <- j
	}
	close(trabajos)

	// Cerrar resultados cuando todos los workers terminen
	go func() {
		wg.Wait()
		close(resultados)
	}()

	// Recolectar
	for r := range resultados {
		fmt.Println("Resultado:", r)
	}
}`,
				explanation:
					'Worker pool con context: cada worker escucha tanto el canal de trabajos como ctx.Done(). Si el contexto expira, los workers terminan limpiamente. WaitGroup coordina el cierre del canal de resultados. Este es el patrón de producción más común en Go.',
				highlightLines: [10, 13, 14, 17, 18, 28, 29],
			},
		],
		playground: true,
		playgroundCode: `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

func worker(ctx context.Context, id int, trabajos <-chan int, resultados chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for {
		select {
		case <-ctx.Done():
			fmt.Printf("Worker %d cancelado\\n", id)
			return
		case t, ok := <-trabajos:
			if !ok {
				return
			}
			time.Sleep(50 * time.Millisecond)
			resultados <- t * t
		}
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 200*time.Millisecond)
	defer cancel()

	trabajos := make(chan int, 10)
	resultados := make(chan int, 10)
	var wg sync.WaitGroup

	for w := 1; w <= 3; w++ {
		wg.Add(1)
		go worker(ctx, w, trabajos, resultados, &wg)
	}

	for j := 1; j <= 15; j++ {
		trabajos <- j
	}
	close(trabajos)

	go func() {
		wg.Wait()
		close(resultados)
	}()

	count := 0
	for r := range resultados {
		count++
		fmt.Printf("[%d] %d\\n", count, r)
	}
	fmt.Printf("Total procesados: %d de 15\\n", count)

	// Experimenta:
	// 1. Cambia el timeout a 500ms — ¿se procesan todos?
	// 2. Agrega más workers — ¿mejora el throughput?
	// 3. Usa context.WithCancel y cancela manualmente después de 5 resultados
}`,
	},
];

export const exercises: Exercise[] = [
	{
		id: 'm11-ex-001',
		moduleId: 11,
		tier: 'fill-in-blank',
		difficulty: 'intermediate',
		title: 'WaitGroup y Mutex juntos',
		description:
			'Completa los blancos para crear un mapa concurrente seguro que acumule resultados de múltiples goroutines.',
		baseCode: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg ___
	var mu sync.Mutex
	resultados := make(map[string]int)

	palabras := []string{"go", "es", "genial", "go", "es", "rápido", "go"}

	for _, p := range palabras {
		wg.___(1) // registrar goroutine
		go func(palabra string) {
			defer wg.___() // marcar completada
			mu.___()       // adquirir lock
			resultados[palabra]++
			mu.___()       // liberar lock
		}(p)
	}

	wg.___() // esperar a todas
	fmt.Println("Conteo de palabras:")
	for palabra, conteo := range resultados {
		fmt.Printf("  %s: %d\\n", palabra, conteo)
	}
}`,
		solution: `package main

import (
	"fmt"
	"sync"
)

func main() {
	var wg sync.WaitGroup
	var mu sync.Mutex
	resultados := make(map[string]int)

	palabras := []string{"go", "es", "genial", "go", "es", "rápido", "go"}

	for _, p := range palabras {
		wg.Add(1)
		go func(palabra string) {
			defer wg.Done()
			mu.Lock()
			resultados[palabra]++
			mu.Unlock()
		}(p)
	}

	wg.Wait()
	fmt.Println("Conteo de palabras:")
	for palabra, conteo := range resultados {
		fmt.Printf("  %s: %d\\n", palabra, conteo)
	}
}`,
		expectedOutput: `Conteo de palabras:
  go: 3
  es: 2
  genial: 1
  rápido: 1`,
		hints: [
			'WaitGroup tiene tres métodos: Add(n) para registrar goroutines pendientes, Done() para marcar una como completada, y Wait() para bloquear hasta que todas terminen.',
			'Los blancos son: sync.WaitGroup, Add, Done, Lock, Unlock, Wait. El Mutex protege el mapa que es compartido entre goroutines.',
		],
		points: 4,
		concepts: ['waitgroup', 'mutex', 'concurrent-map', 'goroutine-safety'],
	},
	{
		id: 'm11-ex-002',
		moduleId: 11,
		tier: 'debugging',
		difficulty: 'intermediate',
		title: 'Context leak y WaitGroup desbalanceado',
		description:
			'Este programa tiene 3 bugs: un context leak, un WaitGroup desbalanceado, y un canal que nunca se cierra. Encuéntralos.',
		baseCode: `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

func procesar(ctx context.Context, id int, resultados chan<- string, wg *sync.WaitGroup) {
	select {
	case <-time.After(100 * time.Millisecond):
		resultados <- fmt.Sprintf("Worker %d listo", id)
	case <-ctx.Done():
		resultados <- fmt.Sprintf("Worker %d cancelado", id)
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	// Bug 1: falta defer cancel()

	var wg sync.WaitGroup
	resultados := make(chan string, 5)

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go procesar(ctx, i, resultados, &wg) // Bug 2: procesar no llama wg.Done()
	}

	wg.Wait()
	// Bug 3: el canal nunca se cierra, pero intentamos hacer range

	for r := range resultados {
		fmt.Println(r)
	}

	cancel()
	fmt.Println("Todo completado")
}`,
		solution: `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

func procesar(ctx context.Context, id int, resultados chan<- string, wg *sync.WaitGroup) {
	defer wg.Done() // Fix 2: marcar goroutine como completada
	select {
	case <-time.After(100 * time.Millisecond):
		resultados <- fmt.Sprintf("Worker %d listo", id)
	case <-ctx.Done():
		resultados <- fmt.Sprintf("Worker %d cancelado", id)
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel() // Fix 1: prevenir context leak

	var wg sync.WaitGroup
	resultados := make(chan string, 5)

	for i := 1; i <= 5; i++ {
		wg.Add(1)
		go procesar(ctx, i, resultados, &wg)
	}

	// Fix 3: cerrar canal cuando todos los workers terminen
	go func() {
		wg.Wait()
		close(resultados)
	}()

	for r := range resultados {
		fmt.Println(r)
	}

	fmt.Println("Todo completado")
}`,
		expectedOutput: `Worker 1 listo
Worker 2 listo
Worker 3 listo
Worker 4 listo
Worker 5 listo
Todo completado`,
		hints: [
			'Piensa en tres cosas: ¿quién cancela el context? ¿quién llama wg.Done()? ¿quién cierra el canal para que "for range" termine?',
			'Bug 1: falta "defer cancel()" después de WithTimeout. Bug 2: procesar no llama wg.Done() — agrega "defer wg.Done()" al inicio. Bug 3: usa una goroutine que espere wg.Wait() y luego close(resultados).',
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['context-leak', 'waitgroup', 'close-channel', 'defer-cancel'],
	},
	{
		id: 'm11-ex-003',
		moduleId: 11,
		tier: 'debugging',
		difficulty: 'advanced',
		title: 'Race condition en el pipeline',
		description:
			'Este pipeline concurrente tiene 2 bugs sutiles: una race condition y un deadlock potencial. Encuéntralos y corrígelos.',
		baseCode: `package main

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

func merge(canales ...<-chan int) <-chan int {
	var wg sync.WaitGroup
	out := make(chan int)

	for _, ch := range canales {
		wg.Add(1)
		go func() {            // Bug 1: closure captura variable del loop
			defer wg.Done()
			for n := range ch {
				out <- n
			}
		}()
	}

	wg.Wait()    // Bug 2: bloquea main, nadie lee de out
	close(out)

	return out
}

func main() {
	entrada := generador(1, 2, 3, 4, 5, 6, 7, 8)

	c1 := duplicar(entrada)
	c2 := duplicar(entrada)

	for r := range merge(c1, c2) {
		fmt.Println(r)
	}
}`,
		solution: `package main

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

func merge(canales ...<-chan int) <-chan int {
	var wg sync.WaitGroup
	out := make(chan int)

	for _, ch := range canales {
		wg.Add(1)
		go func(c <-chan int) { // Fix 1: pasar canal como parámetro
			defer wg.Done()
			for n := range c {
				out <- n
			}
		}(ch)
	}

	go func() { // Fix 2: mover Wait+close a goroutine separada
		wg.Wait()
		close(out)
	}()

	return out
}

func main() {
	entrada := generador(1, 2, 3, 4, 5, 6, 7, 8)

	c1 := duplicar(entrada)
	c2 := duplicar(entrada)

	for r := range merge(c1, c2) {
		fmt.Println(r)
	}
}`,
		hints: [
			'En Go, las closures en loops capturan la variable por referencia. Si el loop termina antes de que la goroutine ejecute, todas leen el mismo valor final.',
			'Bug 1: la goroutine captura "ch" del loop — pásalo como parámetro: go func(c <-chan int) {...}(ch). Bug 2: wg.Wait() bloquea en main, pero nadie lee de out → deadlock. Muévelo a una goroutine: go func() { wg.Wait(); close(out) }().',
		],
		metacognitivePrompt:
			'Antes de ver la solución: ¿Qué tipo de error es? (compilación / lógica / runtime)',
		points: 5,
		concepts: ['race-condition', 'closure-loop', 'deadlock', 'pipeline', 'fan-in'],
	},
	{
		id: 'm11-ex-004',
		moduleId: 11,
		tier: 'mini-project',
		difficulty: 'advanced',
		title: 'Pipeline concurrente con context',
		description:
			'Construye un pipeline de procesamiento de datos concurrente con cancelación por context. Requisitos:\n\n1. Etapa "generador": produce números del 1 al N en un canal\n2. Etapa "filtrar": solo pasa los números que cumplen un predicado\n3. Etapa "transformar": aplica una función a cada número (ej: cuadrado)\n4. Worker pool con M workers para la etapa de transformación\n5. context.WithTimeout para cancelar todo si tarda más de 500ms\n6. Imprimir resultados y estadísticas (procesados, cancelados, tiempo)',
		baseCode: `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// generar produce números del 1 a n en un canal, respetando el context
func generar(ctx context.Context, n int) <-chan int {
	// TODO: crear canal, goroutine que envíe 1..n
	// TODO: respetar ctx.Done() para cancelación
	// TODO: cerrar canal al terminar
	return nil
}

// filtrar pasa solo los valores que cumplen el predicado
func filtrar(ctx context.Context, in <-chan int, predicado func(int) bool) <-chan int {
	// TODO: crear canal, goroutine que lea de in
	// TODO: enviar solo si predicado(n) es true
	// TODO: respetar ctx.Done()
	return nil
}

// transformar aplica fn a cada valor usando un pool de workers
func transformar(ctx context.Context, in <-chan int, fn func(int) int, numWorkers int) <-chan int {
	// TODO: crear canal de salida
	// TODO: lanzar numWorkers goroutines
	// TODO: cada worker lee de in, aplica fn, envía a out
	// TODO: WaitGroup para cerrar out cuando todos terminen
	// TODO: respetar ctx.Done()
	return nil
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	inicio := time.Now()

	// Pipeline: generar 1..50 → filtrar pares → cuadrado (3 workers)
	numeros := generar(ctx, 50)
	pares := filtrar(ctx, numeros, func(n int) bool { return n%2 == 0 })
	cuadrados := transformar(ctx, pares, func(n int) int { return n * n }, 3)

	// Recolectar resultados
	var resultados []int
	for r := range cuadrados {
		resultados = append(resultados, r)
	}

	duracion := time.Since(inicio)

	fmt.Printf("Resultados (%d valores): ", len(resultados))
	for _, r := range resultados {
		fmt.Printf("%d ", r)
	}
	fmt.Printf("\\nTiempo: %v\\n", duracion.Round(time.Millisecond))

	if ctx.Err() != nil {
		fmt.Println("Pipeline cancelado:", ctx.Err())
	} else {
		fmt.Println("Pipeline completado exitosamente")
	}
}`,
		solution: `package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// generar produce números del 1 a n en un canal, respetando el context
func generar(ctx context.Context, n int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for i := 1; i <= n; i++ {
			select {
			case <-ctx.Done():
				return
			case out <- i:
			}
		}
	}()
	return out
}

// filtrar pasa solo los valores que cumplen el predicado
func filtrar(ctx context.Context, in <-chan int, predicado func(int) bool) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for n := range in {
			if predicado(n) {
				select {
				case <-ctx.Done():
					return
				case out <- n:
				}
			}
		}
	}()
	return out
}

// transformar aplica fn a cada valor usando un pool de workers
func transformar(ctx context.Context, in <-chan int, fn func(int) int, numWorkers int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup

	for w := 0; w < numWorkers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for n := range in {
				select {
				case <-ctx.Done():
					return
				case out <- fn(n):
				}
			}
		}()
	}

	go func() {
		wg.Wait()
		close(out)
	}()

	return out
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
	defer cancel()

	inicio := time.Now()

	// Pipeline: generar 1..50 → filtrar pares → cuadrado (3 workers)
	numeros := generar(ctx, 50)
	pares := filtrar(ctx, numeros, func(n int) bool { return n%2 == 0 })
	cuadrados := transformar(ctx, pares, func(n int) int { return n * n }, 3)

	// Recolectar resultados
	var resultados []int
	for r := range cuadrados {
		resultados = append(resultados, r)
	}

	duracion := time.Since(inicio)

	fmt.Printf("Resultados (%d valores): ", len(resultados))
	for _, r := range resultados {
		fmt.Printf("%d ", r)
	}
	fmt.Printf("\\nTiempo: %v\\n", duracion.Round(time.Millisecond))

	if ctx.Err() != nil {
		fmt.Println("Pipeline cancelado:", ctx.Err())
	} else {
		fmt.Println("Pipeline completado exitosamente")
	}
}`,
		expectedOutput: `Resultados (25 valores): 4 16 36 64 100 144 196 256 324 400 484 576 676 784 900 1024 1156 1296 1444 1600 1764 1936 2116 2304 2500
Tiempo: 1ms
Pipeline completado exitosamente`,
		hints: [
			'Cada etapa sigue el mismo patrón: crear canal out, lanzar goroutine(s), defer close(out), usar select con ctx.Done() y out <- valor. Para transformar, usa WaitGroup para saber cuándo cerrar out.',
			'En el select, pon "case <-ctx.Done(): return" como primer case y "case out <- valor:" como segundo. Para el worker pool, la goroutine que cierra out debe esperar wg.Wait() en su propia goroutine.',
		],
		points: 8,
		concepts: [
			'context',
			'pipeline',
			'worker-pool',
			'waitgroup',
			'channel-directions',
			'fan-out',
			'graceful-cancellation',
		],
	},
];

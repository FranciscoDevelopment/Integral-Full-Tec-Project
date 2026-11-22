# Ámbito D · Colaboraciones

Entregables propios del ámbito D, para que se consoliden en `docs/justificacion.md`, `docs/uso-de-ia.md` y el README.

## 1. Justificación de herramientas (R6): validación y estados

| Herramienta | Rol | Por qué | Alternativas | Qué resignamos |
|---|---|---|---|---|
| class-validator + ValidationPipe (NestJS) | Validar en el servidor lo que llega al crear una colaboración y al cambiar su estado | Con `whitelist` y `forbidNonWhitelisted` rechaza los campos no declarados: si alguien manda `collaboratorId` en el cuerpo, responde 400, porque el colaborador siempre sale de la sesión. Las reglas (rol hasta 80 caracteres, descripción hasta 1000, fechas ISO, hasta 10 links con URL válida) quedan declaradas en la clase del DTO | Zod en el backend, Joi, validar a mano en el service | La validación queda atada a decoradores y a clases. La regla de que la fecha de fin no sea anterior a la de inicio no entra en un decorador y se controla en el service |
| React Hook Form + Zod | Validar el formulario "Quiero ayudar" en el navegador | Muestra los errores por campo antes de enviar y refleja las reglas del servidor, con la fecha de fin controlada por un `refine`. El front es un poco más estricto (rol de 2 caracteres y descripción de 10 como mínimo) para guiar mejor a la persona | Formik, validar a mano con `useState` | Las reglas viven en dos lugares y hay que mantenerlas parejas. El servidor sigue siendo quien decide: el front solo ayuda al usuario |
| Tabla de transiciones propia (`ALLOWED_TRANSITIONS` y `canTransition`) | Máquina de estados de la colaboración: pending pasa a accepted o rejected, y accepted pasa a confirmed | Son 4 estados y 3 transiciones: una tabla y una función pura se leen de un vistazo y se prueban sin base de datos (17 tests unitarios). Cualquier otro movimiento responde 409 | XState, una cadena de if/else dentro del service | No hay diagrama ni eventos, y si aparecen estados nuevos hay que mantener la tabla a mano. El front tiene su propia lista de acciones permitidas por estado |
| LoadingState, ErrorState y EmptyState compartidos + Sonner | Estados de carga, error y vacío, y avisos de éxito | Son los componentes de `shared/components/ui` que usa todo el equipo, así las pantallas se ven y se comportan igual. Cada pantalla cubre los cuatro estados que pide R5: cargando, vacío, error y éxito | Componentes propios por feature (lo que hicimos primero y después reemplazamos), una librería de UI | Dependemos de componentes de otro ámbito: si cambian sus props, hay que ajustar nuestras pantallas |

## 2. Uso de IA (ámbito D)

**Herramientas:** Claude (chat) para diseñar, escribir código, depurar y preparar el trabajo con Git, y la IA integrada de VS Code, en modo solo lectura, para informes del estado del repositorio.

**Tareas:** diseño del módulo, código del backend y de las pantallas, tests, depuración de errores de terminal, revisión de ramas y PR, y preparación de la presentación.

### Un caso en que la IA ayudó bien

Se le pidió armar el módulo de colaboraciones a partir del reparto. Propuso verificar al dueño dentro del service, comparando el dueño del proyecto con el id del usuario que viene en el token, y modelar los estados como una tabla de transiciones con una función pura. Fue útil porque la regla "solo el dueño decide, sin importar su rol" quedó en un único lugar y se pudo probar con 17 tests unitarios y con un e2e (401, 403, 404, 409 y 400).

### Tres casos en que hubo que corregirla

1. **Pruebas con `curl.exe`.** Propuso probar la API con `curl.exe` y un JSON con valores con espacios. PowerShell rompió las comillas y el servidor respondió 400 con "Unterminated string". Se detectó por el mensaje del servidor y se pasó a `Invoke-RestMethod` con `ConvertTo-Json`.
2. **Listados incompletos.** El primer service devolvía solo `collaboratorId` y `projectId`, sin el nombre del colaborador ni el título del proyecto, que las pantallas necesitan. Se detectó leyendo las respuestas reales y se corrigió con `include` y `select` de `id` y `name`, para no exponer el email.
3. **Build roto con el `typecheck` en verde.** Al reemplazar imports se perdió la línea `"use client"` de una lista. El `typecheck` pasó pero el build falló con "Attempted to call useResource() from the server". Se restauró la línea y quedó como regla correr siempre el build antes de abrir un PR. Algo parecido pasó con los componentes de carga y error: se crearon duplicados sin revisar antes qué existía en `shared/components/ui`, y se reemplazaron por los compartidos.

### Funcionalidad de IA en el producto

No aplica a este ámbito.

## 3. Línea para el README (integrantes y aportes)

- **Agustín (Agustinn19):** ámbito Colaboraciones de punta a punta. Backend (6 endpoints, máquina de estados y la regla de que solo el dueño decide), tests unitarios y e2e, y las pantallas "Quiero ayudar", "Mis colaboraciones" y "Solicitudes recibidas".
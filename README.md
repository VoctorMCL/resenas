# Reseñas de Restaurantes — Final de Desarrollo Web

Aplicación web para la gestión de reseñas de restaurantes, desarrollada como entrega final de la asignatura **Desarrollo Web** (Unilasallista, docente Néstor Vélez Vargas).

## Integrantes

- **Ricardo Jaraba Gallego**
- **Victor Manuel Cordoba Larez**

## En qué consiste la entrega

En el repositorio se encuentran los dos proyectos que conforman la solución:

- `frontend/` — aplicación desarrollada en Angular.
- `backend/` — API desarrollada en Node.js con Express y MongoDB.

La entrega no incluye carpetas propias del entorno de desarrollo (`node_modules`, `dist`, `.angular`, `.idea`, etc.), según lo indicado en el enunciado. Para esto se incluyen los archivos `.gitignore` en la raíz y en cada proyecto.

## Qué hace la aplicación

- **Registro e inicio de sesión:** el usuario se registra con su nombre, usuario y contraseña. La contraseña se almacena encriptada con `bcrypt` y, al iniciar sesión, la API devuelve un token JWT que se guarda en el `sessionStorage` del navegador.
- **Rutas protegidas:** los guards validan que el token exista y no esté vencido para acceder a `/home`, y evitan que un usuario autenticado vuelva a `/login`. Un interceptor agrega el header `Authorization` a las peticiones y, si la API responde `401`, cierra la sesión y redirige al login.
- **CRUD de reseñas:** el usuario autenticado puede crear, listar, consultar, editar y eliminar sus reseñas. Cada reseña tiene nombre del restaurante, calificación de 0 a 5 marcada con estrellas (con decimales como 4.5 o 4.7), fecha de visita (hasta el día actual) y observaciones.
- **Aislamiento por usuario:** todas las consultas filtran por el usuario del token (`usuario: req.userID`), por lo que ningún usuario puede ver, editar ni eliminar reseñas de otro. Si se intenta acceder a un identificador ajeno, la API responde `404`.

## Tecnologías utilizadas

| Parte | Tecnología |
| --- | --- |
| Frontend | Angular 22 (standalone, signals, formularios reactivos, Bootstrap) |
| Backend | Node.js + Express + Mongoose |
| Base de datos | MongoDB (`mongodb://localhost:27017/resenas`) |
| Autenticación | JWT con `jwt-simple` + `bcrypt` |

El proyecto se verificó con **Node.js 26 y npm 11** (compatible con Node.js 22 o superior). El secreto JWT incluido en el código (`JWT_SECRET`) es únicamente para desarrollo; en un despliegue real debe definirse mediante la variable de entorno `JWT_SECRET`.

## Diseño e interfaz

Además de la funcionalidad exigida, se trabajó una interfaz con una identidad visual propia y definida, organizada en dos pantallas:

- **Inicio de sesión (`login`):** pantalla dividida en dos zonas, una ilustración con una taza de café en SVG y el formulario de acceso/registro.
- **Inicio (`home`):** cabecera con la identidad de la aplicación, un resumen de la actividad, la lista de reseñas con sus estrellas y un editor lateral para crear o actualizar cada entrada.

### Paleta y tipografía

- Paleta en tonos café: `#3b2418` (café oscuro), `#6f4e37` (café), `#8b6347` (café medio) y `#c99b6d` (caramelo), con miel `#d9a441` para las estrellas.
- Fondos crema (`#fffdfa`, `#fbf5ee`, `#f4e6d7`) y acentos pastel rosa (`#f3d9d2`), miel (`#f6e6c8`) y verde (`#dfe8d5`) para tarjetas y etiquetas.
- Tipografía **Nunito**, alojada localmente en `frontend/public/fonts/nunito-latin.woff2` para que la interfaz no dependa de servicios externos.

### Elementos visuales

- Iconos e ilustraciones en **SVG en línea** y favicon también SVG, sin uso de emojis en la interfaz.
- Animaciones suaves de entrada y transiciones en botones y tarjetas, con respeto por la preferencia del sistema `prefers-reduced-motion`.

### Calificación y fecha

- La calificación se marca con **5 estrellas SVG en un rango de 0 a 5 y pasos de 0.1**, por lo que se pueden registrar valores como `4.5` o `4.7`. El relleno es parcial y exacto: un `4.7` muestra cuatro estrellas completas y la quinta al 70 %.
- El valor se confirma en un campo numérico con botones **+** y **−** que ajustan de 0.1 en 0.1, como forma alternativa y precisa de calificar.
- La fecha de visita tiene como valor máximo **el día actual**: el límite se calcula al abrir la aplicación, de modo que cambia automáticamente cada día. La validación se repite en el backend para impedir fechas futuras mediante peticiones directas.

## Cómo ejecutar el proyecto

Se requiere MongoDB corriendo en local en el puerto 27017.

**Backend** (terminal 1):

```bash
cd backend
npm install
node index.js
```

Al conectar se muestra `Conexion exitosa` y el servidor queda escuchando en el puerto **2307**. Si se reutiliza una base de datos de versiones anteriores, `npm run limpiar-aliases` elimina los campos duplicados (`restaurante`, `comentario` y `fecha`) de las reseñas ya guardadas.

**Frontend** (terminal 2):

```bash
cd frontend
npm install
npm start
```

La aplicación queda disponible en **http://localhost:2305**. Desde ahí se puede registrar, iniciar sesión y administrar las reseñas. Al cerrar sesión se limpia el `sessionStorage`.

## APIs expuestas

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/usuario/registrar` | Registrar usuario |
| POST | `/api/usuario/login` | Iniciar sesión y obtener el token |
| POST | `/api/resena` | Crear reseña |
| GET | `/api/resenas` | Listar las reseñas del usuario |
| GET | `/api/resena/:_id` | Consultar una reseña propia |
| PUT | `/api/resena/:_id` | Actualizar una reseña propia |
| DELETE | `/api/resena/:_id` | Eliminar una reseña propia |

Todas las rutas de reseñas exigen el header `Authorization: Bearer <token>`.

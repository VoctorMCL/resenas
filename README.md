# Reseñas de Restaurantes — Final de Desarrollo Web

Aplicación web para la gestión de reseñas de restaurantes, desarrollada como entrega final de la asignatura **Desarrollo Web** (Unilasallista, docente Néstor Vélez Vargas).

## Integrantes

- **Ricardo Jaraba Gallego**
- **Víctor Manuel Córdoba Larez**

## En qué consiste la entrega

En el repositorio se encuentran los dos proyectos que conforman la solución:

- `frontend/` — aplicación desarrollada en Angular.
- `backend/` — API desarrollada en Node.js con Express y MongoDB.

La entrega no incluye carpetas propias del entorno de desarrollo (`node_modules`, `dist`, `.angular`, `.idea`, etc.), según lo indicado en el enunciado. Para esto se incluyen los archivos `.gitignore` en la raíz y en cada proyecto.

## Qué hace la aplicación

- **Registro e inicio de sesión:** el usuario se registra con usuario y contraseña. La contraseña se almacena encriptada con `bcrypt` y, al iniciar sesión, la API devuelve un token JWT que se guarda en el `sessionStorage` del navegador.
- **Rutas protegidas:** un guard verifica la existencia del token para acceder a `/home`, y otro evita que un usuario autenticado vuelva a `/login`.
- **CRUD de reseñas:** el usuario autenticado puede crear, listar, consultar, editar y eliminar sus reseñas. Cada reseña tiene nombre del restaurante, calificación (1 a 5), fecha de visita y observaciones.
- **Aislamiento por usuario:** todas las consultas filtran por el usuario del token (`usuario: req.userID`), por lo que ningún usuario puede ver, editar ni eliminar reseñas de otro. Si se intenta acceder a un identificador ajeno, la API responde `404`.

## Tecnologías utilizadas

| Parte | Tecnología |
| --- | --- |
| Frontend | Angular 22 (standalone, signals, formularios reactivos, Bootstrap) |
| Backend | Node.js + Express + Mongoose |
| Base de datos | MongoDB (`mongodb://localhost:27017/resenas`) |
| Autenticación | JWT con `jwt-simple` + `bcrypt` |
| Pruebas | Peticiones HTTP con `fetch` de Node |

## Cómo ejecutar el proyecto

Se requiere MongoDB corriendo en local en el puerto 27017.

**Backend** (terminal 1):

```bash
cd backend
npm install
node index.js
```

Al conectar se muestra `Conexion exitosa` y el servidor queda escuchando en el puerto **2307**.

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

## Verificación

El frontend se compiló con `npm run build` sin errores. El backend se probó con peticiones reales: registro de dos usuarios, login, validación de campos, CRUD completo y comprobación del aislamiento por usuario. En todas las pruebas, el segundo usuario no pudo ver, consultar, editar ni eliminar las reseñas del primero, y la reseña original permaneció intacta.

## Entrega

Los dos proyectos se entregan en un único repositorio público: https://github.com/VoctorMCL/resenas. El enlace se envía antes del **24 de noviembre a las 23:59** al correo `nvelez@unilasallista.edu.co`.

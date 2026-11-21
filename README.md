# Reseñas de Restaurantes — Final de Desarrollo Web

Hola, este es mi proyecto final de la materia **Desarrollo Web** (Unilasallista, docente Néstor Vélez Vargas). Es una aplicación web donde cada usuario puede iniciar sesión y manejar sus propias reseñas de restaurantes.

## Integrantes

- **Víctor Manuel Córdoba Larez** (yo) — hice el frontend, el backend, la base de datos y las pruebas.

La prueba es individual, así que todo el trabajo es mío.

## En qué consiste esta entrega

Entrego los dos proyectos en un mismo repositorio de GitHub:

- `frontend/` — mi aplicación en Angular.
- `backend/` — mi API en Node.js con Express y MongoDB.

No metí las carpetas del entorno de desarrollo (`node_modules`, `dist`, `.angular`, `.idea`, etc.), porque el enunciado quita 0.5 por cada lado si se envían. Para eso dejé los `.gitignore` en la raíz y en cada proyecto.

## Qué hace la aplicación

- **Registro e inicio de sesión:** el usuario se registra con usuario y contraseña. La contraseña se guarda encriptada con `bcrypt`, y al loguearse recibo un token JWT que guardo en el `sessionStorage` del navegador.
- **Rutas protegidas:** con un guard reviso que haya token para entrar a `/home`, y con otro evito que un usuario ya logueado vuelva a `/login`.
- **CRUD de reseñas:** ya dentro, el usuario puede crear, listar, consultar, editar y borrar sus reseñas. Cada reseña tiene nombre del restaurante, calificación (1 a 5), fecha de visita y observaciones.
- **Aislamiento por usuario:** este es el punto que más cuidé, porque el enunciado quita 1.0 si se incumple. Todas las consultas llevan el filtro del usuario del token (`usuario: req.userID`), así que nadie puede ver, editar ni borrar reseñas ajenas. Si intentan usar un id que no es suyo, la API responde 404.

## Tecnologías que usé

| Parte | Tecnología |
| --- | --- |
| Frontend | Angular 22 (standalone, signals, formularios reactivos, Bootstrap) |
| Backend | Node.js + Express + Mongoose |
| Base de datos | MongoDB (`mongodb://localhost:27017/resenas`) |
| Autenticación | JWT con `jwt-simple` + `bcrypt` |
| Pruebas | Script de peticiones HTTP con `fetch` de Node |

## Cómo correrlo en mi máquina

Primero levanté MongoDB en local (puerto 27017). Luego:

**Backend** (terminal 1):

```bash
cd backend
npm install
node index.js
```

Cuando conecta, imprime:

```
Conexion exitosa
```

y se queda escuchando en el puerto **2307**.

**Frontend** (terminal 2):

```bash
cd frontend
npm install
npm start
```

Se abre en **http://localhost:2305**. Ahí me registro o inicio sesión, y en `/home` hago el CRUD de mis reseñas. Para salir, le doy a "Cerrar sesión" y se limpia el `sessionStorage`.

## APIs que expongo

| Método | Ruta | Para qué sirve |
| --- | --- | --- |
| POST | `/api/usuario/registrar` | Crear usuario |
| POST | `/api/usuario/login` | Login y token |
| POST | `/api/resena` | Crear reseña |
| GET | `/api/resenas` | Listar solo mis reseñas |
| GET | `/api/resena/:_id` | Consultar una reseña mía |
| PUT | `/api/resena/:_id` | Editar una reseña mía |
| DELETE | `/api/resena/:_id` | Borrar una reseña mía |

Todas las de reseñas exigen el header `Authorization: Bearer <token>`.

## Cómo lo probé

Compilé el frontend con `npm run build` y salió sin errores. Después levanté el backend y corrí un script con peticiones reales: registro de dos usuarios, login, crear/listar/editar/borrar reseñas, y varios intentos de uno accediendo a las reseñas del otro. Todas las pruebas pasaron: el usuario B no pudo ver, consultar, editar ni borrar la reseña del usuario A, y la reseña quedó intacta.

## Entrega

Subo ambos proyectos a un único repositorio público (`https://github.com/VoctorMCL/resenas`) y envío el enlace antes del **24 de noviembre a las 23:59** al correo `nvelez@unilasallista.edu.co`, con mi nombre como integrante único.

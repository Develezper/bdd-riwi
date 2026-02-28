# Enunciado Integrado - Modulo 4 Bases de Datos Fullstack (ExpertSoft Fintech)

## Datos generales
- Clan: Hamilton
- Duracion maxima: 8 horas
- Modalidad: Individual

## Contexto del problema
ExpertSoft desarrolla soluciones para el sector electrico en Colombia. Un cliente recibe informacion financiera desde Nequi y Daviplata en multiples archivos Excel (`.xlsx`), con datos duplicados, desordenados y dificiles de consultar.
Debes disenar e implementar una solucion Fullstack que centralice, normalice, migre y exponga esta informacion para operacion diaria y analisis.

## Objetivo general
Construir una aplicacion web Fullstack con arquitectura hibrida:
- SQL (MySQL o PostgreSQL) para integridad y consistencia.
- MongoDB para lecturas documentales rapidas.
- Backend Node.js + Express (API REST).
- Frontend SPA con Vite + JavaScript + HTML + CSS.

## Competencias a evaluar
- Normalizacion hasta 3FN.
- Diseno de DER y modelo relacional real.
- Integridad referencial.
- Migracion/importacion de datos desde Excel.
- Diferencias y consistencia entre SQL y NoSQL.
- Consultas SQL avanzadas y vistas.
- Exposicion por API y consumo desde SPA.

## PARTE 0 - DER (OBLIGATORIO)
Antes de programar, debes entregar un DER con:
- Entidades SQL.
- PK y FK.
- Cardinalidades.
- Columnas reales.
- Tipos de datos propuestos.

### Entregable obligatorio
- `/docs/DER.png`

### Condicion critica
- Si no existe DER, el proyecto se considera incompleto.

## PARTE 1 - Normalizacion y Modelo Relacional SQL (OBLIGATORIO)
Debes partir de los archivos Excel y documentar normalizacion (1FN, 2FN, 3FN).

### Tablas minimas obligatorias
- `clients`
- `advisors`
- `platforms`
- `transactions`
- `validations`

### Relaciones minimas
- Un `client` tiene muchas `transactions`.
- Un `advisor` gestiona muchas `transactions`.
- Una `platform` tiene muchas `transactions`.
- Una `transaction` puede tener una `validation`.

### Reglas
- PK, FK, `UNIQUE`, `NOT NULL`, indices.
- Integridad referencial activa.
- Sin ORM.

## PARTE 2 - Modelo NoSQL MongoDB (OBLIGATORIO)
### Colecciones minimas
- `client_histories` (1 documento por cliente con historial completo de operaciones).
- `feedback` (comentarios y calificacion del cliente sobre el servicio).
- `logs` (auditoria de acciones del sistema).

### Justificacion esperada
- SQL para consistencia transaccional.
- MongoDB para historial completo sin JOINs costosos.

## PARTE 3 - Migracion de datos (OBLIGATORIO)
Implementar flujo de migracion con carga de archivo (Multer):
- Leer Excel.
- Insertar/actualizar datos unicos en SQL.
- Crear/actualizar documentos en MongoDB.
- Ser idempotente (ejecutar varias veces sin duplicar).

### Requisito de consistencia
- Si se actualiza el nombre de un `advisor` en SQL, debe reflejarse en `client_histories` de MongoDB.

## PARTE 4 - Consultas SQL obligatorias
Debes implementar como minimo estas consultas:
1. Top 5 clientes con mejor promedio de validacion.
2. Plataformas con mas transacciones.
3. Clientes sin validaciones.
4. Promedio de monto recaudado por plataforma.
5. Transacciones entre dos fechas.
6. Clientes con mas de 3 transacciones.
7. Plataformas sin transacciones.
8. Ranking general de desempeno financiero por cliente.
9. Ultima transaccion de cada plataforma.
10. Cliente con peor desempeno.
11. Reporte de recaudo: total general, total por plataforma y total por rango de fechas.

### Condicion critica
- Ninguna consulta vale si queda solo en SQL.
- Todas deben tener endpoint en Express, consumo en frontend y visualizacion en interfaz.

## PARTE 5 - Vistas SQL (OBLIGATORIAS)
Crear minimo:
- `v_client_performance`
- `v_platform_stats`

Estas vistas deben:
- Tener endpoints propios.
- Consumirse desde el frontend.
- Mostrar datos reales.

## PARTE 6 - Backend Express (OBLIGATORIO)
### Clientes
- `GET /api/clients`
- `POST /api/clients`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`
- `GET /api/clients/:id/report`

### Asesores
- `GET /api/advisors`
- `GET /api/advisors?channel=Nequi`
- `GET /api/advisors/:id`
- `PUT /api/advisors/:id`

### Plataformas
- `GET /api/platforms`
- `POST /api/platforms`
- `PUT /api/platforms/:id`
- `DELETE /api/platforms/:id`
- `GET /api/platforms/:id/stats`

### Reportes
- `GET /api/reports/top-clients`
- `GET /api/reports/worst-client`
- `GET /api/reports/ranking`
- `GET /api/reports/empty-platforms`
- `GET /api/reports/revenue`

### MongoDB
- `POST /api/feedback`
- `GET /api/feedback/:clientId`
- `GET /api/clients/:email/history`

### Migracion
- `POST /api/migration/upload`

## PARTE 7 - Frontend SPA (OBLIGATORIO)
La SPA debe incluir:
- Dashboard con metricas clave.
- CRUD de clientes.
- CRUD de plataformas.
- Gestion/listado de asesores.
- Vista de reportes SQL.
- Vista de vistas SQL.
- Vista de feedback e historial Mongo.
- Carga de archivo para migracion.
- Formularios con validaciones.
- Pantalla para cada consulta SQL obligatoria.

## PARTE 8 - Requisitos tecnicos
Debe evidenciarse uso de:
- `INNER JOIN`
- `LEFT JOIN`
- `GROUP BY`
- `HAVING`
- Subconsultas
- Vistas
- Manejo de errores backend
- Validaciones frontend
- Variables de entorno
- Arquitectura por capas

### Separacion minima en backend
- `index` (arranque/rutas)
- `config` (conexiones SQL/Mongo)
- `uploads` (archivos)
- Capas de negocio (controladores/servicios/repositorios)

## Librerias permitidas
- `express`
- `multer`
- `xlsx` o parser CSV equivalente
- `mongoose`
- `mysql2` o `pg`
- `knex` (opcional)

### Prohibido
- Sequelize
- Prisma
- TypeORM
- Objection
- MikroORM

## Estructura minima del proyecto
- `/frontend`
- `/backend`
- `/backend/uploads`
- `/sql/database.sql`
- `/sql/queries.sql`
- `/mongo/collections.json`
- `/docs/DER.png`
- `/docs/normalizacion.md`
- `README.md`

## Entregables
- Script SQL de creacion de tablas, constraints e indices.
- Script SQL de vistas.
- Proyecto Node.js funcional.
- Script o modulo de migracion idempotente.
- Base SQL poblada.
- Base MongoDB poblada.
- SPA funcional consumiendo la API.
- README con decisiones tecnicas y evidencias.

## Criterios de evaluacion (100%)
- DER + normalizacion (1FN, 2FN, 3FN): 20%
- Modelo SQL e integridad referencial: 15%
- Migracion idempotente Excel -> SQL + Mongo: 20%
- API backend y arquitectura por capas: 20%
- Consultas SQL + vistas + endpoints: 15%
- Frontend SPA y consumo de API: 10%

## Bonus (opcional)
- Exportar reportes en PDF.
- Graficas con JavaScript.
- Autenticacion basica.
- Filtros dinamicos.
- Dark mode.

## Tiempo sugerido (8h)
- DER + normalizacion: 1h
- Modelo SQL + vistas: 2h
- Migracion: 1.5h
- Backend: 2h
- Frontend: 1h
- Pruebas + README: 0.5h

## Anexo - Evaluacion SQL estricta (adicional, sin reemplazar lo anterior)
Este anexo complementa el enunciado y refuerza los criterios del enfoque SQL del modulo.

### 1) Reglas de nomenclatura obligatorias
- Nombre de la base de datos: `pd_primernombre_primerapellido_clan`.
- Tablas, columnas, indices, vistas y constraints en ingles.

### 2) Evidencia de normalizacion
- Entregar `docs/normalization.md` con aplicacion de 1FN, 2FN y 3FN paso a paso.
- Incluir decisiones de diseno y justificacion de separacion de entidades.

### 3) Carga masiva verificable
- Entregar archivo original y convertido en `uploads/source.xlsx` y `uploads/source.csv`.
- Documentar ejecucion de carga masiva y prueba de idempotencia (2 ejecuciones sin duplicados).

### 4) Contrato minimo del CRUD (API)
- Definir y respetar codigos HTTP: `200`, `201`, `400`, `404`, `409`, `500`.
- Validar entradas antes de insertar o actualizar.
- Responder errores con estructura consistente.

### 5) Consultas avanzadas evaluables
- Cada consulta avanzada debe tener endpoint dedicado.
- Deben probarse desde Postman.
- Al menos una consulta debe aceptar filtro por rango de fechas.

### 6) Coleccion Postman obligatoria
- Incluir carpetas: `CRUD` y `Advanced Queries`.
- Incluir variable de entorno `baseUrl`.
- Incluir ejemplos de respuesta para cada endpoint.

### 7) README minimo obligatorio (en ingles)
- Descripcion del sistema.
- Instrucciones de ejecucion.
- Proceso de carga masiva.
- Explicacion de normalizacion.
- Explicacion de consultas avanzadas.
- Captura del modelo relacional.
- Datos del desarrollador.

### 8) Criterios de rechazo explicitos
- Sin DER/modelo relacional entregado: proyecto incompleto.
- Sin script DDL (`sql/database.sql`): proyecto incompleto.
- Sin coleccion Postman: proyecto incompleto.
- Sin README en ingles: proyecto incompleto.

# Auditoría de Seguridad y Dominio — TucanGo Web

**Fecha:** noviembre de 2026
**Alcance:** API HTTP (`tucango-web/src/server.ts`), capa de aplicación (`TucanGoFacade`), modelos de dominio, autenticación, persistencia y panel de administración.
**Método:** lectura de código, pruebas de penetración manuales sobre una instancia aislada con base de datos temporal, verificación en navegador y suite automatizada.

---

## 1. Resumen ejecutivo

La auditoría encontró dos defectos críticos que anulaban el flujo de aprobación de Tucanes y la protección contra abuso, además de una puerta trasera de credenciales. Todos fueron corregidos y verificados.

| Severidad | Hallazgo | Estado |
| --- | --- | --- |
| Crítica | Alta pública de motoristas sin autenticación (`POST /api/motoristas`) | Corregido |
| Crítica | Contraseñas maestras hardcodeadas que reescribían el hash | Corregido |
| Crítica | Rate limit de registro decorativo y evadible por header | Corregido |
| Alta | Migración de semilla destructiva (`CURRENT_SEED_VERSION`) | Corregido |
| Alta | Clave de administrador por debajo de la política propia | Corregido |
| Media | Colisión de identidad entre roles | Corregido |
| Media | Estado de aprobación y cilindraje sin validación de runtime | Corregido |
| Media | Errores internos filtrados al cliente con status 400 | Corregido |
| Media | Persistencia O(n) en cada ping de ubicación | Mitigado |
| Baja | Serialización de motoristas triplicada | Pendiente |
| Alta | Documentos de identidad en texto plano en SQLite | Pendiente (plan en §6) |

---

## 2. Hallazgos corregidos

### 2.1 Bypass del onboarding por `POST /api/motoristas`

El endpoint compartía controlador con el registro público y, al no ser la ruta de Tucanes, omitía documentos, correo personal y compromiso, tomando el estado del cuerpo de la petición con valor por defecto `ACTIVO`.

**Impacto reproducido:** una petición anónima creó un Tucán `ACTIVO` y `disponible`, que inició sesión como motorista y aceptó un viaje real de un estudiante (código `TUC-102`).

**Corrección:** la ruta exige rol `admin`; el estado por defecto pasó a `PENDIENTE_APROBACION`; y todo Tucán que quede `ACTIVO` exige expediente completo, venga del registro público o de un alta administrativa. Verificado: sin sesión responde `401`.

### 2.2 Puerta trasera de credenciales

`autenticarUsuario` aceptaba contraseñas maestras (`admin123`, `AdminSeguro*2026`, `estudiante123`, entre otras) cuando el hash no coincidía, y en ese caso **reescribía el hash** de la cuenta. Cualquier persona con acceso al código podía tomar la cuenta administrativa.

**Corrección:** se eliminaron los tres bloques. La autenticación solo admite el resultado de `verificarPassword`, que usa `scrypt` y comparación en tiempo constante.

### 2.3 Rate limit inoperante

El limitador de registro consultaba el estado pero nunca incrementaba el contador; además, la IP se tomaba del primer valor de `X-Forwarded-For`, controlado por el cliente.

**Corrección:** cada intento de registro incrementa su contador, se agregó un tope global independiente de headers y la IP se resuelve priorizando `CF-Connecting-IP` y, en su defecto, el último salto del proxy.

**Verificación:** con IP fija pasan 10 registros y los siguientes reciben `429`.

### 2.4 Migración destructiva y semilla con usuarios

Subir `CURRENT_SEED_VERSION` reemplazaba todo el estado persistido. Además, la semilla creaba un estudiante de ejemplo.

**Corrección:** la migración ahora es aditiva (`completarSemillaFaltante`) y el borrado solo ocurre con `RESET_DATOS=true`, una decisión explícita de operación. La semilla crea únicamente la cuenta administrativa. En producción, `SEED_ADMIN_PASSWORD` es obligatoria y debe tener al menos 12 caracteres; el arranque falla si no cumple.

### 2.5 Invariantes de alta

`registrarMotoristaConMoto` valida cédula (6–10 dígitos), nombre, teléfono colombiano, correo, placa, cilindraje finito entre 50 y 1500 cc, estado de aprobación y número de licencia. `registrarEstudiante` y el alta de Tucanes comparten la verificación de identidad única entre administradores, estudiantes y motoristas.

### 2.6 Errores de dominio tipados

Los 57 `throw new Error` del dominio se reemplazaron por `ValidacionError`, que hereda de `AuthError` y declara su status HTTP. El controlador ya no interpreta mensajes: distingue errores de negocio (4xx) de fallos internos (500). Los fallos no controlados se registran en el servidor y el cliente recibe un mensaje genérico.

### 2.7 Persistencia de ubicación

`persistir()` serializa el snapshot completo, con los documentos en base64. Se aplicó una ventana mínima de 15 segundos por Tucán para la ubicación GPS, que es un dato efímero, sin afectar el evento de dominio ni el seguimiento en vivo.

---

## 3. Sustentación de diseño orientado a objetos

### 3.1 Invariantes en las entidades, no en el controlador

`Persona` y `Moto` rechazan estados inválidos en el constructor y en sus setters. Una entidad no puede existir en estado inconsistente, independientemente del transporte que la cree. Las reglas de alta que requieren coordinación entre agregados (identidad única, expediente completo) viven en la fachada, que es el límite de la transacción.

### 3.2 Errores como tipos

`ValidacionError`, `CredencialesInvalidasError` y `CuentaEnRevisionError` son tipos, no cadenas. El borde traduce tipos a status HTTP sin inspeccionar texto, lo que evita acoplar la API a los mensajes y permite cambiarlos sin romper contratos.

### 3.3 Tipo suma para las métricas por rol

El defecto de "campos que no corresponden" tenía raíz de diseño: las métricas eran un `Record<string, number>` que mezclaba campos de roles distintos, y el frontend adivinaba el rol con un `if`.

La corrección introduce un tipo discriminado:

```ts
type MetricasDTO =
  | (MetricasBaseDTO & { rol: "admin"; volumenMovilidadCop: number })
  | (MetricasBaseDTO & { rol: "motorista"; gananciasCop: number; kmRecorridos: number })
  | (MetricasBaseDTO & { rol: "pasajero"; gastoTotalCop: number; kmRecorridos: number })
  | (MetricasBaseDTO & { rol: "anonimo" });
```

Consecuencias:

- El compilador impide leer `gastoTotalCop` en una rama de administrador.
- El DOM renderiza por `metricas.rol`, no por heurística sobre `state.authUser`.
- La segmentación se calcula una sola vez, en `obtenerMetricasPorRol`, en lugar de repetirse en el controlador.

El administrador ahora ve **volumen de movilidad** (facturación del servicio), no un gasto personal inexistente. El Tucán ve sus ganancias y el pasajero su gasto: cada rol observa su propio recorte.

### 3.4 Separación entre migración y destrucción

Una migración de esquema y una purga de datos son operaciones distintas. `completarSemillaFaltante` preserva y agrega; `RESET_DATOS` destruye de forma explícita. Mezclarlas convertía un cambio de versión en una pérdida de datos silenciosa.

### 3.5 Encapsulamiento de la autenticación

La verificación de credenciales quedó en un único camino: hash + comparación en tiempo constante. No hay ramas alternativas que acepten valores conocidos. Un backdoor es, en términos de diseño, un segundo camino de autenticación no declarado; eliminarlo restaura la invariante de que toda sesión nace de una contraseña verificada.

---

## 4. Verificación

- `npm test`: **15/15** pruebas en verde, incluidas las nuevas de identidad única, expediente obligatorio, migración de licencia y contrato de alta administrativa.
- Instancia aislada: `/api/motoristas` sin sesión devuelve `401`; el alta con estado `ACTIVO` y sin documentos devuelve `422`.
- Rate limit: 10 registros aceptados y los siguientes `429`.
- Panel de administrador: etiquetas `VIAJES FLOTA`, `FINALIZADOS`, `EN CURSO`, `VOLUMEN MOVILIDAD`; sin `GASTO TOTAL` ni `MIS APORTES`.
- Semilla limpia: 1 administrador, 0 estudiantes, 0 motoristas.
- Migración legacy de `fotoLicenciaUrl` cubierta por prueba de ida y vuelta sobre SQLite.

---

## 5. Riesgos residuales

1. **Documentos en texto plano (§6).** La base guarda cédula, licencia y SOAT en base64 dentro del snapshot JSON, sin cifrado en reposo.
2. **Serialización triplicada.** Los datos de Tucán se proyectan en tres lugares de `server.ts`. Ya divergieron una vez; conviene extraer un proyector único.
3. **Sin pruebas de frontend.** Un error de alcance en `login.js` pasó inadvertido a la suite porque los tests no ejecutan el DOM.
4. **CSP con `unsafe-eval`.** Debilita la defensa contra inyección de scripts.
5. **Clave de Google Maps sin restricción por referer.** Debe limitarse a los dominios y APIs en uso.
6. **Sin política de backups.** El volumen de datos no tiene respaldo documentado.

---

## 6. Plan pendiente: cifrado de documentos

1. Crear la tabla `documentos_tucan` (`identificacion`, `tipo`, `contenido_cifrado`, `iv`, `tag`, `creado_en`).
2. Cifrar con AES-256-GCM usando una clave derivada de una variable `DOCS_ENCRYPTION_KEY` (nunca de `SESSION_SECRET`, para permitir rotación independiente).
3. Migrar los data URLs existentes del snapshot a la tabla y eliminarlos del JSON.
4. Servir los documentos por endpoint autenticado con rol `admin`, no embebidos en `/api/estado`.
5. Registrar auditoría de acceso a documentos (quién y cuándo).

Este cambio requiere gestión de claves y migración de datos; se documenta como trabajo separado para no mezclarlo con la corrección de accesos.

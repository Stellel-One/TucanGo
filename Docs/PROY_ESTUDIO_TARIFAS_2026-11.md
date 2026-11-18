# Estudio de tarifas y pagos — TucanGo

**Fecha:** noviembre de 2026
**Alcance:** modelo tarifario, cálculo de distancia, estados de pago y coherencia con el mercado de Florencia.

---

## 1. Situación actual

| Estrategia | Fórmula | Problema |
| --- | --- | --- |
| Tarifa plana estudiantil | $2.500 COP sin importar la distancia | No cubre el costo en trayectos largos |
| Tarifa por distancia | $3.000 + $1.200/km, mínimo 1 km | No considera tiempo ni recogida |
| Lluvia | +40% | No se combina con nocturna |
| Nocturna | +25% | No se combina con lluvia |

Además, `/api/viajes/solicitar` recibe `distanciaKm` del cuerpo de la petición y la pasa directo a `solicitarViaje` (`server.ts:1439-1455`). El servidor no recalcula la ruta: un cliente puede declarar 0,1 km y pagar la tarifa mínima.

---

## 2. Incongruencias detectadas

1. **La tarifa no depende de la distancia en el plan estudiantil.** Un viaje de 14 km (Granja Balcanes) y uno de 1 km cuestan lo mismo: $2.500.
2. **La distancia es una entrada del cliente, no un cálculo del servidor.** Es una puerta abierta a fraude tarifario.
3. **Los recargos son excluyentes.** Lluvia y noche no se suman; se aplica una u otra.
4. **No hay tarifa mínima explícita.** El mínimo real es 1 km, que no cubre recogida ni tiempo muerto.
5. **No hay comisión de plataforma ni costo de tiempo.** El modelo solo cubre kilómetros.
6. **El pago es un estado, no una transacción.** `Pago` marca `PENDIENTE/PAGADO` sin pasarela; es una simulación coherente para el prototipo, pero debe declararse como tal.

---

## 3. Fuentes

- **Decreto 1000-22-00030 de 2026**, Alcaldía de Florencia: carrera mínima de taxi **$7.400**, banderazo **$3.400**, recargo nocturno/dominical/festivo (8:00 p.m.–5:00 a.m.) **$1.100**, recargo por plataforma o radioteléfono **$900**, recargo aeropuerto **$7.400**. Vigencia 12 meses.
  https://florenciacaqueta.micolombiadigital.gov.co/normatividad/decreto-no-10002200030-----2026
- **CREG**, precios de combustibles: gasolina corriente alrededor de **$15.886/galón** (noviembre de 2026).
  https://creg.gov.co/publicaciones/15565/precios-de-combustibles-liquidos
- **Supuestos operativos** (marcados como estimación, no como dato oficial): rendimiento de 35–45 km/galón para una moto de 125–150 cc, mantenimiento y llantas, SOAT y tecnomecánica anuales, depreciación por kilómetro y valor del tiempo del conductor a $7.500/hora.

---

## 4. Costo operativo estimado

| Componente | COP por km | Base |
| --- | --- | --- |
| Combustible | ~400 | $16.000/galón ÷ 40 km/galón |
| Mantenimiento, aceite, llantas, frenos | ~120 | Estimación de taller |
| SOAT y tecnomecánica | ~20 | Prórateo anual sobre 30.000 km |
| Depreciación | ~100 | Moto de $8.000.000 / 80.000 km |
| Tiempo del conductor | ~300 | $7.500/h a 25 km/h |
| **Total** | **~940** | |

Con un margen objetivo del 30–35%, la tarifa por kilómetro debe rondar **$1.250–1.300**.

---

## 5. Modelo propuesto (revisado a precio de mercado)

La primera versión de este estudio proponía $2.500 de base y $1.100/km. Ese precio no compite en Florencia: una carrera de 5 km quedaba en $9.400, por encima del mínimo de taxi. Se ajusta a la baja.

```
tarifaBase = max(3000, 1500 + 700 * distanciaKm)
recargos aditivos: lluvia 20%, nocturno 15%, domingo/festivo 10%
tarifaEstudiante = tarifaBase * 0.85   (mínimo $2.500)
comisionPlataforma = 10% de tarifaEstudiante
```

- **Sin cobro por minuto.** Se elimina para no encarecer el viaje; el tiempo de recogida se cubre con la base.
- **Tarifa mínima:** $3.000, alineada con la carrera corta de moto en Florencia.
- **Tarifa estudiantil:** 15% de descuento, no un precio fijo.
- **Distancia:** calculada en el servidor con la ruta real. El cliente solo envía origen y destino.

---

## 6. Comparativa

| Distancia | Actual estudiante | Actual estándar | Propuesta estudiante | Propuesta estándar | Taxi mínimo |
| --- | --- | --- | --- | --- | --- |
| 1 km | $2.500 | $4.200 | $2.550 | $3.000 | $7.400 |
| 3 km | $2.500 | $6.600 | $3.060 | $3.600 | $7.400 |
| 5 km | $2.500 | $9.000 | $4.250 | $5.000 | $7.400 |
| 10 km | $2.500 | $15.000 | $7.225 | $8.500 | $7.400 + recorrido |
| 14 km | $2.500 | $19.800 | $9.605 | $11.300 | $7.400 + recorrido |

La tarifa estudiantil actual pierde dinero a partir de 3 km. La propuesta mantiene la carrera corta en el mismo orden que hoy ($2.550 vs. $2.500) y solo sube en trayectos largos, donde el costo real también sube.

---

## 6.1 Sostenibilidad del precio bajo

Con $700/km el margen es ajustado y conviene decirlo:

| Concepto (5 km) | COP |
| --- | --- |
| Combustible y mantenimiento (~$520/km) | 2.600 |
| SOAT, depreciación (~$120/km) | 600 |
| Tiempo del conductor (12 min a $5.000/h) | 1.000 |
| **Costo total** | **4.200** |
| Tarifa estudiante propuesta | 4.250 |
| **Margen** | **~50** |

A precio de mercado, el Tucán no se hace rico por viaje: necesita **3 a 4 carreras por hora** para que el turno sea rentable. Si se quiere un margen del 20%, hay que mover una de tres palancas:

1. subir el kilómetro a ~$850,
2. reducir el descuento estudiantil a 10%,
3. subsidiar la diferencia desde la universidad o la plataforma.

Esa decisión no es técnica y sigue pendiente.

---

## 7. Implementación recomendada

1. **Calcular la tarifa en el servidor.** El endpoint de solicitud no debe aceptar `distanciaKm`; debe recibir origen y destino y resolver la ruta con el proveedor configurado.
2. **Guardar el desglose** (base, km, tiempo, recargos, descuento, comisión) en el viaje, para auditoría del administrador.
3. **Convertir la tarifa estudiantil en descuento**, no en precio fijo.
4. **Hacer los recargos aditivos y combinables.**
5. **Declarar el pago como simulado** mientras no exista pasarela, o integrar una (Wompi, Mercado Pago, Nequi) con confirmación del servidor.
6. **Probar** los bordes: 0 km, 1 km, 14 km, lluvia + noche, estudiante + lluvia, distancia declarada por el cliente.

---

## 8. Decisión pendiente

El modelo propuesto cambia el precio que ve el estudiante. Antes de implementarlo hay que decidir si el subsidio estudiantil lo asume la universidad, la plataforma o el Tucán. Sin esa decisión, el descuento del 20% sale del bolsillo del conductor.

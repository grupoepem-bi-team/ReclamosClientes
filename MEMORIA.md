# MEMORIA - Tablero de Reclamos

## Proposito
Construir la materia prima (queries y datos) para un tablero de reclamos del sistema EPEM. El tablero permitira visualizar el volumen, evolucion, motivos, departamentos y estados de los reclamos recibidos.

> **Recursos compartidos en `../../_shared/`** — schema CSVs, constants, logos, guias, repo epem (solo lectura).

## 1. Datos del Reporte

### Conexion
- **Conexion omnisql**: `Prod_lectura` (mysql8-19dde67e86f-27c364d5ba448e0c)
- **Host**: 192.168.0.250
- **Base de datos**: epem

### Tablas utilizadas
| Tabla | Registros | Uso |
|-------|-----------|-----|
| `complaints` | 79,494 activos | Tabla principal de reclamos |
| `complaint_motives` | 77 activos | Motivos y departamentos (campo real: requires_cancelation_flag, no loyalty) |
| `complaint_motives_destinations` | — | Relacion N:N motivo -> destinos validos |
| `complaint_trackings` | 220,476 | Seguimientos de reclamos |
| `contracts` | 47,904 unicos | Trazabilidad: estado, tipo, plan |
| `enterprises` | 10 empresas | Trazabilidad: unidad de negocio |
| `branches` | 13 sucursales | Trazabilidad: sucursal de origen |
| `clients` | 39,620 unicos | Trazabilidad: cliente |
| `users` | — | Trazabilidad: creador, fidelizador |
| `business_departments` | — | Trazabilidad: depto del usuario |

### Filtro base
`deleted_at IS NULL` — excluye reclamos eliminados (soft delete).

### Queries definidas
Archivo: `query.md` con 30 queries verificadas:

| Query | Descripcion | Datos |
|-------|-------------|-------|
| Q1 | KPIs generales | 79,494 reclamos, 3,294 pendientes, 6,313 fidelizados |
| Q2 | Distribucion por estado | 6 estados activos (Terminado 94.14%, Nuevo 4.14%) |
| Q3 | Distribucion por departamento | 8 valores (Ventas 46%, Sin Depto 25%, Cobranzas 13%) |
| Q4 | Top 20 motivos | Cancelacion cumple requisitos lidera con 31,597 |
| Q5 | Evolucion mensual historica | 96 meses (2018-07 a 2026-06) |
| Q6 | Evolucion anual | 9 anos (2018-2026) |
| Q7 | Evolucion mensual por depto (2025+) | 18 meses x 8 departamentos |
| Q8 | Cancelacion de contrato | 24% solicita, 23% no, 53% sin info |
| Q9 | Cancelacion por anio | 9 anos x 3 categorias |
| Q10 | Fidelizacion | 7.9% con fidelizacion |
| Q11 | Pendientes por antiguedad | 3,294 pendientes, algunos de 2023 |
| Q12 | Destino del reclamo | 9 destinos (91% FIDELIZACION-OTROS) |
| Q13 | Tabla cruzada motivo x estado | 82 combinaciones |
| Q14 | Tracking diario (ult 30 dias) | Actividad diaria por estado |
| Q15 | Reclamos por empresa | ODO 61%, MEE 32%, MPP 6.4% |
| Q16 | Reclamos por sucursal | Mcal Lopez 17,255, Brasilia 14,542 |
| Q17 | Reclamos por estado de contrato | Culminado 75%, Confirmado 25% |
| Q18 | Reclamos por tipo de contrato | Cobrador 62%, Debito 38% |
| Q19 | Reclamos por tipo de plan | Individual 71.5%, Familiar 28.4% |
| Q20 | Empresa x departamento | 46 combinaciones |
| Q21 | Empresa x sucursal | 46 combinaciones |
| Q22 | Evolucion mensual por empresa (2025+) | 18 meses x empresas |
| Q23 | Top creadores de reclamos | Top 20 usuarios |
| Q24 | Top fidelizadores | Top 20 usuarios |
| Q25 | Ficha de trazabilidad completa | Reclamo + contrato + cliente + empresa + sucursal + usuario |
| Q26 | Reclamos por estado de reversion | 97.5% sin reversion, 1.6% Rechazado |
| Q27 | Doble debito | 95.1% no aplica, 1.4% corresponde |
| Q28 | Reversion por anio (tendencia) | Evolucion de reversiones por ano |
| Q29 | Destino x estado (flujo derivacion) | Cruzado destino x estado |
| Q30 | Ficha completa con reversion y destino | Trazabilidad total con todos los campos |

## 2. Reglas de Negocio Aplicadas

> Verificadas contra codigo fuente en `_shared/copy_epem_system/` (config/constants.php + ComplaintsController.php + CreateComplaintTrackingRequest.php)

### Estados de reclamos (complaints.status)
| ID | Nombre | Color label |
|----|--------|-------------|
| 1 | Nuevo | success |
| 3 | Remitido | success |
| 5 | En Proceso | warning |
| 8 | Resuelto | warning |
| 10 | Terminado | primary |
| 15 | Cancelado | info |
| 20 | Eliminado | danger |

### Flujo de estados (ComplaintsController@store_tracking)
1. **Nuevo (1)**: estado inicial al crear (date se setea automaticamente a hoy)
2. **Remitido (3)**: tracking sobre status=1 -> pasa a 3
3. **En Proceso (5)**: tracking sobre status=3 -> pasa a 5
4. **Resuelto (8)**: resolved=1 -> destiny=30, status=8
5. **Terminado (10)**: close=1 -> status=10
6. **Eliminado (20)**: soft delete (deleted_at + deleted_user_id + deleted_motive)

> Filtros de exclusion en reportes:
> - `deleted_at IS NULL` — filtro estricto (recomendado para tablero)
> - `status < 20` — excluye Eliminado, incluye Cancelado (usado en reportes)
> - `status < 15` — excluye Cancelado y Eliminado (RecoveryTrackings)

### Destino del reclamo (complaints.complaint_destiny)
| ID | Destino |
|----|---------|
| 1 | SERVICIOS |
| 5 | AGENDAMIENTO |
| 10 | VISACION |
| 15 | COBRANZAS |
| 20 | MARKETING |
| 25 | TESORERIA |
| 30 | FIDELIZACION- OTROS |
| 35 | GESTION DOCUMENTOS |
| 40 | INFORMACION COBRANZAS |

### Estados de reversion (complaints.reversion)
| ID | Estado |
|----|--------|
| 1 | Pendiente |
| 5 | En proceso / administracion |
| 10 | Revertido |
| 20 | Rechazado |

### Doble debito (complaints.double_debit_correspond)
| Valor | Significado |
|-------|------------|
| NULL | No aplica (95.1%) |
| 0 | No corresponde (2.2%) |
| 1 | Corresponde -> genera reversion=1 Pendiente (1.4%) |
| 2 | Otro caso -> genera reversion=20 Rechazado (1.2%) |

> Regla: OBLIGATORIO si complaint_motive_id=15 (DOBLE DEBITO)
> Regla: en reporte Excel solo se muestra si motive_id==15

### Departamentos (complaint_motives.department)
| ID | Nombre |
|----|--------|
| 1 | Ventas |
| 2 | ATC |
| 3 | Fidelizacion |
| 4 | Cobranzas |
| 5 | Agendamiento |
| 6 | Clinicas Terciarizadas |
| 7 | Doctores |
| 8 | Control de Calidad |

### Cancelacion de contrato (complaints.contract_cancelation)
| Valor | Significado |
|-------|------------|
| NULL | Sin info (53.2%) |
| 1 | Solicita Cancelacion (24.0%) |
| 2 | No Solicita Cancelacion (22.8%) |

### Fidelizacion (complaints.loyalty)
| Valor | Significado |
|-------|------------|
| NULL/0 | Sin fidelizacion (92.1%) |
| 1 | Con fidelizacion (7.9%) |

> Regla: al fidelizar (loyalty=1), se registran loyal_user_id y loyal_date (fecha actual)
> Regla: solo aparece en Terminados(10)=6296 y Resueltos(8)=17
> Regla: comenzo en 2021 (6.27%), pico en 2023 (12.70%)

### Motivos especiales (logica especifica en codigo)
| Motivo ID | Nombre | Regla |
|-----------|--------|-------|
| 15 | DOBLE DEBITO | double_debit_correspond obligatorio |
| 20 | DESEA CANCELAR / RENUNCIAR | inactivo, reporte muestra contract_cancelation |
| 61 | ACUERDO DE SUSPENCION | oculto en create si no tiene roles especificos |
| 63 | PEDIDO DE INFORMACION | inactivo, fallback API Infobip, busca por client_id |
| 64 | OTROS | inactivo, fallback Chatbot |
| 65 | SIN MOTIVO - INFOBIP | inactivo, fallback Infobip |

### Relacion Motivo -> Destinos (complaint_motives_destinations)
> Tabla N:N que define destinos validos por motivo. El campo `department` es independiente y se setea en null al crear.
> getDepartmentName() del modelo concatena los destinos de esta relacion.

### Origenes de reclamo
| Origen | Destiny | Motivo | Observacion |
|--------|---------|--------|-------------|
| Web | 30 | variable | - |
| Chatbot | 30 | mapeo o 64 | "Reclamo Generado mediante Chatbot" |
| Infobip | 30 | mapeo, 63 o 65 | - |

### Permisos y visibilidad
- `complaints.own-complaints`: ve solo reclamos que creo
- `complaints.close`: ve todos los reclamos
- `complaint_destiny`: ve solo reclamos remitidos a su destino
- Roles para ver motivo 61: fidelizacion-reclamos-control-de-calidad-turnos, asistente-reclamos, agendamiento-de-turnos

### Notificaciones
- SendComplaintsJob: Socket (canal complaint-destiny-{id}) + Email a usuarios del destino
- Si motivo tiene destino SERVICIOS(1): email al operational_manager de la sucursal del ultimo dental_office

### Estados de contrato (contracts.status)
| ID | Estado |
|----|--------|
| 1 | Pendiente |
| 2 | Aprobado por CC |
| 3 | Rechazado por CC |
| 4 | Rechazado por Autorizacion |
| 5 | Contrato Confirmado |
| 6 | Contrato Culminado |
| 7 | Contrato Borrado |
| 9 | Contrato Inactivado |
| 10 | Gestion de Cobranzas |

### Tipos de contrato (contracts.contract_type)
| ID | Tipo |
|----|------|
| 1 | Cobrador |
| 2 | Debito |

### Tipos de plan (contracts.type_plan)
| ID | Tipo |
|----|------|
| 1 | Individual |
| 2 | Familiar |
| 3 | Corporativo |
| 4 | Pareja |

### Reglas de validacion (CreateComplaintTrackingRequest)
1. No se puede resolver (resolved=1) si destiny=15 o destiny=25 sin contract_cancelation
2. No se puede resolver si reversion=1 sin marcar reversion
3. Si status=1, complaint_destiny es obligatorio
4. Si reversion=5, no se puede resolver sin success_reversion (Pago Revertido)
5. Si reversion=5, campos bancarios obligatorios: bank_name, account_number, document_manager, amount

## 3. Resultados Verificados

### Volumen total
- **79,494** reclamos activos (sin deleted)
- Rango: 02/07/2018 a 17/06/2026
- **3,294** reclamos pendientes (status=Nuevo), el mas antiguo del 21/12/2023

### Distribucion por estado
| Estado | Cantidad | % |
|--------|----------|---|
| Terminado | 74,833 | 94.14% |
| Nuevo | 3,294 | 4.14% |
| Remitido | 614 | 0.77% |
| Eliminado | 398 | 0.50% |
| Resuelto | 288 | 0.36% |
| En Proceso | 67 | 0.08% |

### Distribucion por departamento
| Departamento | Cantidad | % |
|-------------|----------|---|
| Ventas | 36,893 | 46.4% |
| Sin Departamento | 19,750 | 24.8% |
| Cobranzas | 10,050 | 12.6% |
| Fidelizacion | 5,017 | 6.3% |
| ATC | 4,869 | 6.1% |
| Clinicas Terciarizadas | 1,701 | 2.1% |
| Agendamiento | 1,097 | 1.4% |
| Doctores | 117 | 0.1% |

### Top 5 motivos
1. CANCELACION CUMPLE CON LOS REQUISITOS — 31,597 (39.7%)
2. RECLAMO POR GESTION DE COBRANZAS — 6,599 (8.3%)
3. SE DERIVA A EJECUTIVOS — 4,869 (6.1%)
4. CLIENTE CULMINA TRATAMIENTO — 4,092 (5.1%)
5. ACUERDO DE SUSPENCION — 3,903 (4.9%)

### Cancelacion de contrato
- Solicita Cancelacion: 19,119 (24.0%)
- No Solicita Cancelacion: 18,146 (22.8%)
- Sin Info: 42,229 (53.2%)

### Fidelizacion
- Con fidelizacion: 6,313 (7.9%)
- Sin fidelizacion: 73,181 (92.1%)

### Trazabilidad — Empresa (Unidad de Negocio)
| Empresa | Sigla | Reclamos | % |
|---------|-------|----------|---|
| Odontologia | ODO | 48,497 | 61.0% |
| Medicina Estetica | MEE | 25,608 | 32.2% |
| Medicina Prepaga | MPP | 5,105 | 6.4% |
| Tapo | TAP | 139 | 0.2% |
| Resto | — | 145 | 0.2% |

### Trazabilidad — Sucursal
| Sucursal | Reclamos |
|----------|----------|
| Matriz Mcal Lopez | 17,255 |
| Matriz Brasilia | 14,542 |
| Nemby | 11,728 |
| San Lorenzo | 10,850 |
| Encarnacion | 8,882 |
| Ciudad del Este | 7,819 |
| Mariano Roque Alonso | 4,723 |
| Luque | 2,906 |
| Resto | 584 |

### Trazabilidad — Estado del Contrato
| Estado | Reclamos | % |
|--------|----------|---|
| Contrato Culminado | 59,461 | 74.9% |
| Contrato Confirmado | 19,599 | 24.7% |
| Resto | 332 | 0.4% |

### Trazabilidad — Tipo de Contrato
| Tipo | Reclamos | % |
|------|----------|---|
| Cobrador | 49,285 | 62.1% |
| Debito | 30,107 | 37.9% |

### Trazabilidad — Tipo de Plan
| Plan | Reclamos | % |
|------|----------|---|
| Individual | 56,700 | 71.5% |
| Familiar | 22,531 | 28.4% |
| Pareja | 159 | 0.2% |

### Trazabilidad — Top 5 Creadores de Reclamos
| Usuario | Reclamos creados |
|---------|-----------------|
| FABIAN FERNANDO SANCHEZ AUVES | 7,700 |
| SUSANA JAZMIN GALEANO GAUTO | 3,899 |
| NATALIA ESTELA LEGUIZAMON SATOFF | 3,298 |
| JOSE GUSTAVO CAZURIAGA VILLAMAYOR | 2,636 |
| LORENA ROCIO ACOSTA MOLINAS | 2,583 |

### Trazabilidad — Top 5 Fidelizadores
| Usuario | Fidelizaciones |
|---------|---------------|
| FABIAN FERNANDO SANCHEZ AUVES | 1,625 |
| NATALIA ESTELA LEGUIZAMON SATOFF | 495 |
| SUSANA JAZMIN GALEANO GAUTO | 464 |
| VANNIA MIRELLA LOPEZ TABARE | 413 |
| MARIANA TROCHE FARIÑA | 410 |

### Evolucion anual
| Anio | Total |
|------|-------|
| 2018 | 642 |
| 2019 | 2,198 |
| 2020 | 7,725 |
| 2021 | 16,703 |
| 2022 | 9,777 |
| 2023 | 9,205 |
| 2024 | 13,280 |
| 2025 | 13,814 |
| 2026 | 6,150 (en curso) |

## 4. Archivos del Reporte
| Archivo | Descripcion |
|---------|-------------|
| `BITACORA.md` | Registro en caliente de la exploracion |
| `MEMORIA.md` | Este archivo - memoria pulida y verificada |
| `query.md` | 30 queries SQL verificadas para el tablero |
| `MAPA.md` | Mapa visual de entidades, flujo, dimensiones y componentes |
| `wireframe.html` | Wireframe funcional con filtros dinamicos (JS puro) |
| `datos.js` | Datos pre-cargados desde BD para el wireframe |

## 5. Historial
| Fecha | Accion |
|-------|--------|
| 2026-06-17 | Exploracion inicial de tablas y datos |
| 2026-06-17 | Definicion de 14 queries definitivas en query.md (Q1-Q14) |
| 2026-06-17 | Creacion de BITACORA.md y MEMORIA.md |
| 2026-06-17 | Trazabilidad: queries Q15-Q25 con joins a contracts, enterprises, branches, clients, users |
| 2026-06-17 | Verificacion de reglas de negocio contra codigo fuente, queries Q26-Q30 |
| 2026-06-17 | Segunda verificacion profunda: schema desactualizado, motivos especiales, origenes, permisos, notificaciones |
| 2026-06-17 | Mediciones y KPIs: 8 categorias de medidas (volumen, tiempo, conversion, empresa, sucursal, contrato, plan, derivadas) |
| 2026-06-17 | Wireframe iterativo: 5 versiones hasta llegar al diseno final con historia en 4 capitulos |
| 2026-06-17 | Filtros dinamicos funcionales (periodo, empresa, sucursal) verificados contra BD |
| 2026-06-17 | Categorizacion de 126 motivos en 9 categorias comerciales |

## 6. Categorizacion de Reclamos

Los "reclamos" son contactos/gestiones de clientes, no todos son quejas reales. Se categorizaron en:

| Categoria | Reclamos (2 años) | % | Que son |
|-----------|-------------------|---|---------|
| Cancelacion de Contrato | 11,027 | 33.2% | Clientes que quieren dar de baja |
| Fin de Relacion / Baja Natural | 9,523 | 28.7% | Tratamiento culminado, viaje, enfermedad |
| Cobranzas / Facturacion | 4,626 | 13.9% | Doble debito, cobranza, cuotas |
| Retencion / Fidelizacion | 4,334 | 13.1% | Acuerdos fidelizacion, derivacion |
| Disconformidad con Servicio | 1,696 | 5.1% | Quejas por atencion clinica, demanda |
| Consultas / Otros | 1,174 | 3.5% | Consultas varias, OTROS |
| Asesoramiento / Ventas | 479 | 1.4% | Mal asesoramiento, info falsa |
| Operativos / Devoluciones | 225 | 0.7% | Devolucion VPOS, fraude |
| Agendamiento / Turnos | 109 | 0.3% | No consigue turno |

> Mapeo de IDs en BITACORA.md y query.md

## 7. Wireframe Dinamico

Archivo: `wireframe.html` + `datos.js`

**Estructura: 4 capitulos**
1. Cuantos reclamos recibimos? (volumen, tendencia, comparativa YoY)
2. Como gestionamos los reclamos? (eficiencia, plazos, backlog)
3. Que impacto tienen en el negocio? (cancelaciones, fidelizaciones, retencion)
4. Por que reclaman los clientes? (motivos, causas) — pendiente reemplazar por categorias

**Filtros dinamicos (JS puro, sin librerias):**
- Periodo: 2 años / 2026 / 2025 / 2024 / Historico
- Empresa: Todas / MEE / MPP / ODO (solo estas 3)
- Sucursal: Todas / sucursales filtradas por empresa

**KPIs que se recalculan:**
- 4 grandes: recibidos, resueltos, cancelaciones, fidelizados
- 6 secundarios: tasa resolucion, dias prom, % mismo dia, % +30 dias, clientes, pendientes
- Tabla mensual completa
- 3 graficos SVG (evolucion, dias cierre, mismo dia vs +30 dias)
- Alertas de pendientes por antiguedad

**Verificado contra BD:** todos los filtros cuadran exactamente.

## 8. Pendiente
- [ ] Agregar seccion de categorias al tablero (9 categorias reemplazan Capitulo 4)
- [ ] Exportar datos de categorias por empresa x mes para filtros dinamicos
- [ ] Generar HTML final del tablero con logos base64
- [ ] Aplicar diseno segun agente_ui_ux.md
- [ ] Embeber logos segun GUIA_TRATAMIENTO_LOGOS.md
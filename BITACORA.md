# BITACORA - Tablero de Reclamos

## 2026-06-17 - Exploracion inicial de datos

### Tablas identificadas
- **complaints** — Tabla principal de reclamos (79,494 registros activos)
- **complaint_motives** — Motivos de reclamo (77 activos, con departamento)
- **complaint_trackings** — Seguimientos (220,476 registros)
- **complaint_destiny_users** — Usuarios destino de reclamos
- **complaint_motives_destinations** — Relacion motivo -> destino
- **complaint_files** — Archivos adjuntos
- **employee_complaints** — Reclamos de empleados (tabla separada, no incluida en este tablero)

### Estructura de `complaints`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int unsigned PK | Auto increment |
| date | date | Fecha del reclamo |
| contract_id | int unsigned FK | Contrato asociado |
| client_id | int unsigned FK | Cliente asociado |
| phone_number | varchar(191) | Telefono |
| complaint_motive_id | int unsigned FK | Motivo del reclamo |
| reversion | int | Reversion |
| json_infobip | longtext | Datos Infobip |
| contract_cancelation | tinyint(1) | 1=Solicita cancelacion, 2=No solicita |
| double_debit_correspond | tinyint(1) | Doble debito |
| complaint_destiny | int | Destino del reclamo |
| observation | longtext | Observaciones |
| status | int unsigned | Estados: 1=Nuevo, 3=Remitido, 5=En Proceso, 8=Resuelto, 10=Terminado, 20=Eliminado |
| user_id | int unsigned FK | Usuario creador |
| loyalty | tinyint(1) | Fidelizacion |
| loyal_user_id | int unsigned FK | Usuario fidelizacion |
| loyal_date | date | Fecha fidelizacion |
| tracking_user | int unsigned FK | Usuario seguimiento |
| deleted_user_id | int unsigned FK | |
| deleted_motive | longtext | |
| deleted_at | datetime | Soft delete |
| created_user_id | int unsigned FK | |
| bank_name | varchar(191) | Banco (doble debito) |
| account_number | varchar(191) | Nro cuenta |
| amount | varchar(191) | Monto |
| document_manager | varchar(191) | |
| created_at | timestamp | |
| updated_at | timestamp | |

### Estructura de `complaint_motives`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int unsigned PK | |
| name | varchar(191) | Nombre del motivo |
| department | int | Depto: 1=Ventas, 2=ATC, 3=Fidelizacion, 4=Cobranzas, 5=Agendamiento, 6=Clinicas Terciarizadas, 7=Doctores, 8=Control de Calidad |
| status | tinyint(1) | 1=Activo |
| user_id | int unsigned FK | |

### Estructura de `complaint_trackings`
| Campo | Tipo | Notas |
|-------|------|-------|
| id | int unsigned PK | |
| complaint_id | int unsigned FK | Reclamo |
| observation | longtext | Observacion del seguimiento |
| complaint_remitent | int unsigned | Remitente |
| complaint_destiny | int | Destino |
| status | tinyint(1) | Estado del tracking |
| complaint_status | int unsigned | Estado del reclamo en este tracking |
| notificated | tinyint(1) | Si fue notificado |
| user_id | int unsigned FK | Usuario |
| remited_at | datetime | Fecha remision |
| receipt_at | datetime | Fecha recepcion |
| created_at | timestamp | |
| updated_at | timestamp | |

### Datos clave explorados

**Volumen total:** 79,494 reclamos activos (sin deleted)
- Rango de fechas: 2018-07-02 a 2026-06-17

**Distribucion por estado:**
| Estado | Cantidad | % |
|--------|----------|---|
| Terminado (10) | 74,833 | 94.14% |
| Nuevo (1) | 3,294 | 4.14% |
| Remitido (3) | 614 | 0.77% |
| Eliminado (20) | 398 | 0.50% |
| Resuelto (8) | 288 | 0.36% |
| En Proceso (5) | 67 | 0.08% |

**Distribucion por departamento (motivo):**
| Depto | Cantidad |
|-------|----------|
| Ventas (1) | 36,893 |
| Sin Departamento (null) | 19,750 |
| Cobranzas (4) | 10,050 |
| Fidelizacion (3) | 5,017 |
| ATC (2) | 4,869 |
| Clinicas Terciarizadas (6) | 1,701 |
| Agendamiento (5) | 1,097 |
| Doctores (7) | 117 |

**Top 10 motivos:**
1. CANCELACION CUMPLE CON LOS REQUISITOS - 31,597
2. RECLAMO POR GESTION DE COBRANZAS - 6,599
3. SE DERIVA A EJECUTIVOS - 4,869
4. CLIENTE CULMINA TRATAMIENTO - 4,092
5. ACUERDO DE SUSPENCION - 3,903
6. ACTUALIZACION DE CUOTAS - 3,238
7. OTROS - 2,998
8. Pide la Baja del contrato - 2,481
9. NO DISPONE DE TIEMPO PARA TRATAMIENTO - 2,091
10. DOBLE DEBITO - 2,074

**Cancelacion de contrato:**
- Sin Info: 42,229 (53.2%)
- Solicita Cancelacion: 19,119 (24.0%)
- No Solicita Cancelacion: 18,146 (22.8%)

**Fidelizacion:**
- Con fidelizacion (loyalty=1): 6,313 (7.9%)
- Sin fidelizacion: 73,181 (92.1%)

**Pendientes (status=Nuevo):**
- 3,294 reclamos pendientes
- Mas antiguo: 2023-12-21
- Mas reciente: 2026-06-17

**Evolucion mensual 2025-2026 (ultimos 18 meses):** Consulta ejecutada exitosamente, datos completos disponibles.

**Evolucion por ano y estado:** Consulta ejecutada, datos completos disponibles.

### Constantes relevantes del sistema
- `complaints-status`: 1=Nuevo, 3=Remitido, 5=En Proceso, 8=Resuelto, 10=Terminado, 15=Cancelado, 20=Eliminado
- `complaints-status-label`: 1=success, 3=success, 5=warning, 8=warning, 10=primary, 15=info, 20=danger
- `complaint-departments`: 1=Ventas, 2=ATC, 3=Fidelizacion, 4=Cobranzas, 5=Agendamiento, 6=Clinicas Terciarizadas, 7=Doctores, 8=Control de Calidad

### 2026-06-17 - Queries definitivas definidas

Se creo `query.md` con 14 queries definitivas para el tablero:
- Q1: KPIs generales (total, clientes, contratos, pendientes, terminados, fidelizados)
- Q2: Distribucion por estado
- Q3: Distribucion por departamento
- Q4: Top 20 motivos de reclamo
- Q5: Evolucion mensual por estado (historico completo, 96 meses)
- Q6: Evolucion anual por estado (9 anos)
- Q7: Evolucion mensual por departamento (2025+)
- Q8: Cancelacion de contrato (resumen)
- Q9: Cancelacion de contrato por anio
- Q10: Fidelizacion (resumen)
- Q11: Reclamos pendientes con antiguedad por tramos
- Q12: Destino del reclamo
- Q13: Tabla cruzada motivo x estado
- Q14: Tracking diario por estado (ultimos 30 dias)

Todas las queries ejecutadas y verificadas contra la BD. Datos correctos.

### Observaciones de calidad de datos
- 19,750 reclamos (25%) no tienen departamento asignado en su motivo (department=null)
- El 94% de los reclamos estan en estado Terminado (casi no hay reclamos abiertos)
- Los reclamos pendientes (status=Nuevo) suman 3,294, algunos de 2023
- Los motivos de disconformidad por clinica estan sin departamento asignado (deberian ser Clinicas Terciarizadas)
- El campo contract_cancelation tiene 53% null (Sin Info) - dato historico incompleto
- A partir de 2024 se empieza a usar mejor el campo status (antes todo era Terminado)

### 2026-06-17 - Queries de trazabilidad (Q15-Q25)

Se enriquecieron las queries uniendo con las tablas del sistema:
- `contracts` — estado del contrato, tipo (cobrador/debito), tipo de plan
- `enterprises` — unidad de negocio (ODO, MEE, MPP, TAP, etc.)
- `branches` — sucursal donde se genero el contrato
- `clients` — datos del cliente (nombre, documento)
- `users` + `business_departments` — usuario creador del reclamo, usuario fidelizador, departamento

Datos clave de trazabilidad:
- **79,392 reclamos tienen contrato** (99.9%), 47,904 contratos unicos, 39,620 clientes unicos
- **Por empresa**: ODO 48,497 (61%), MEE 25,608 (32%), MPP 5,105 (6.4%), resto minoria
- **Por sucursal**: Matriz Mcal Lopez 17,255, Matriz Brasilia 14,542, Nemby 11,728
- **Estado del contrato**: 74.9% Culminado, 24.7% Confirmado
- **Tipo de contrato**: Cobrador 49,285 (62%), Debito 30,107 (38%)
- **Tipo de plan**: Individual 56,700 (71.5%), Familiar 22,531 (28.4%)
- **Top creador**: FABIAN FERNANDO SANCHEZ AUVES con 7,700 reclamos creados
- **Top fidelizador**: FABIAN FERNANDO SANCHEZ AUVES con 1,625 fidelizaciones

Se agrego Q25 — ficha completa de trazabilidad de un reclamo con todos los joins.

### 2026-06-17 - Verificacion de reglas de negocio contra codigo fuente

Se reviso el codigo fuente en _shared/copy_epem_system y se verificaron todas las constantes:

**Constantes confirmadas contra config/constants.php:**
- `complaints-status`: 1=Nuevo, 3=Remitido, 5=En Proceso, 8=Resuelto, 10=Terminado, 15=Cancelado, 20=Eliminado
- `complaints-status-label`: mapeo de colores correcto
- `complaint-departments`: 8 departamentos correctos
- `complaint-destiny`: **NUEVO** — 9 destinos (SERVICIOS, AGENDAMIENTO, VISACION, COBRANZAS, MARKETING, TESORERIA, FIDELIZACION-OTROS, GESTION DOCUMENTOS, INFORMACION COBRANZAS)
- `complaints-reversion-status`: **NUEVO** — 4 estados (Pendiente, En proceso/administracion, Revertido, Rechazado)

**Reglas de negocio verificadas contra ComplaintsController:**
1. Al crear reclamo: complaint_destiny=30 (FIDELIZACION-OTROS), status=1
2. Al hacer tracking con status=1 -> pasa a 3 (Remitido)
3. Al hacer tracking con status=3 -> pasa a 5 (En Proceso)
4. Si close=1 -> status=10 (Terminado)
5. Si resolved=1 -> complaint_destiny=30, status=8 (Resuelto)
6. Si loyalty=1 -> registra loyal_user_id y loyal_date
7. Si reversion=1 y request->reversion=5 -> actualiza datos bancarios (bank_name, account_number, amount, document_manager)
8. Si reversion=5 -> complaint_destiny=25 (TESORERIA), status=3
9. Si success_reversion y reversion=5 -> reversion=10 (Revertido)
10. Si double_debit_correspond=1 -> reversion=1 (Pendiente) al crear
11. Si double_debit_correspond != 1 -> reversion=20 (Rechazado) al crear
12. Soft delete: status=20, deleted_user_id, deleted_motive, deleted_at
13. Send to marketing: complaint_destiny=20, status=3

**Reglas de validacion (CreateComplaintTrackingRequest):**
- No se puede resolver (resolved=1) si destiny=15 o destiny=25 sin contract_cancelation
- No se puede resolver si reversion=1 sin marcar reversion
- Si status=1, complaint_destiny es obligatorio
- Si reversion=5, no se puede resolver sin success_reversion (Pago Revertido)

**Queries corregidas:**
- Q12: agregado CASE para mapear complaint_destiny con nombres
- Q26-Q30: agregadas 5 queries nuevas (reversion, doble debito, destino x estado, ficha completa con reversion)

Datos nuevos verificados:
- Reversion: 97.5% sin reversion, 1.6% Rechazado, 0.6% Revertido, 0.4% Pendiente
- Doble debito: 95.1% no aplica, 2.2% no corresponde, 1.4% corresponde, 1.2% otro caso
- Destino: 91% FIDELIZACION-OTROS, 7% Sin Destino, 0.6% COBRANZAS

### 2026-06-17 - Segunda verificacion profunda de reglas de negocio

Se reviso TODO el codigo fuente de reclamos: ComplaintsController completo, Models, Requests, Jobs, ReportsController, API controllers.

**Hallazgos NUEVOS:**

1. **Schema desactualizado**: el CSV schema_columns.csv no tiene el campo `requires_cancelation_flag` en complaint_motives (la BD real si lo tiene). El codigo fuente referencia `loyalty` en el modelo pero la BD tiene `requires_cancelation_flag`. Todos los motivos activos tienen requires_cancelation_flag=0.

2. **Filtros de exclusion en reportes**:
   - ReportsController usa `status < 20` (excluye Eliminado pero incluye Cancelado=15)
   - RecoveryTrackingsController usa `status < 15` (excluye Cancelado y Eliminado)
   - AccountStatusController usa `status < 20`

3. **Motivos especiales con logica especifica**:
   - Motivo 15 (DOBLE DEBITO): double_debit_correspond es OBLIGATORIO
   - Motivo 20 (DESEA CANCELAR / RENUNCIAR): inactivo, reporte muestra contract_cancelation
   - Motivo 61 (ACUERDO DE SUSPENCION): se oculta del create si el usuario no tiene roles especificos
   - Motivo 63 (PEDIDO DE INFORMACION): inactivo, fallback en API Infobip
   - Motivo 64 (OTROS): inactivo, fallback en Chatbot
   - Motivo 65 (SIN MOTIVO - INFOBIP): inactivo, fallback en Infobip
   - Motivo 63 tiene logica especial en show(): busca reclamos por client_id en vez de contract_id

4. **Relacion N:N Motivo -> Destinos**: complaint_motives_destinations define a que destinos puede derivarse cada motivo. El campo `department` en complaint_motives es independiente y se setea en null al crear.

5. **Origenes de reclamo**: Web, Chatbot (destiny=30, motive mapeado o 64), Infobip (destiny=30, motive mapeado o 65/63)

6. **Permisos**: complaints.own-complaints (ve solo los suyos), complaints.close (ve todos), complaint_destiny (ve solo su destino)

7. **Notificaciones**: SendComplaintsJob envia via Socket (canal complaint-destiny-{id}) + Email a usuarios del destino. Si motivo tiene destino SERVICIOS, envia email al operational_manager.

8. **Reporte Excel (complaints_list_xls)**: columnas = UN, SU, FECHA, NRO.CONTRATO, TITULAR, NRO.CEDULA, EMPRESA CLIENTE, VIA COBRO, VENDEDOR, SUPERVISOR, GESTOR, MOTIVO, DEPARTAMENTO, CORRESPONDE DOBLE DEBITO (solo motive=15), CANCELA (solo motive=20), OBSERVACION, ULTIMA GESTION, ESTADO, ESTADO REVERSION, USUARIO CIERRE, FECHA CIERRE, FIDELIZADO, ELIMINADO POR

9. **Reporte Tracking Excel (complaints_trackings_xls)**: incluye tiempos de recepcion, gestion, remision y total. Calcula diff entre created_at del reclamo y los timestamps de cada tracking.

10. **Fidelizacion por estado**: los reclamos fidelizados (loyalty=1) solo aparecen en Terminados(10)=6296 y Resueltos(8)=17. No hay fidelizacion en Nuevos, Remitidos, En Proceso ni Eliminados.

11. **Fidelizacion por anio**: comenzo en 2021 (6.27%), pico en 2023 (12.70%), 2026 va 9.92%.

12. **Regla de vista show()**: si el reclamo no tiene reversion, se excluye el destino 25 (TESORERIA) del dropdown de destinos disponibles.

13. **Regla de creacion**: date se setea automaticamente a hoy (date('d/m/Y')), el modelo lo convierte a Y-m-d via setDateAttribute.

14. **Regla de document_manager**: el modelo quita los puntos del documento (str_replace('.', '', $value)).

### 2026-06-17 - Mediciones y KPIs

Se calcularon todas las medidas posibles con los datos disponibles:

**Volumen:**
- 79,494 reclamos totales, 39,653 clientes, 47,904 contratos
- 73,976 reclamos con tracking (93%), 220,463 trackings (2.98 por reclamo)
- 347 creadores distintos, 82 motivos usados, 8 destinos

**Tiempo:**
- Promedio cierre (Terminados): 13.8 dias desde fecha reclamo
- Min 0 dias, Max 908 dias
- Evolucion: 2020-2021 ~2 dias, 2024 pico 35 dias, 2026 solo 1.2 dias
- Pendientes: 377 dias promedio (!), 46.7% mas de 1 ano

**Tasas:**
- Tasa cierre: 94.50% (Resueltos+Terminados)/Total
- Tasa fidelizacion: 8.40% Fidelizados/(Terminados+Resueltos)
- Tasa cancelacion efectiva: 51.30% Solicita/(Solicita+NoSolicita)
- Cobertura tracking: 93.06%

**Concentracion:**
- ODO+MEE = 93.2% de reclamos
- Top 3 sucursales = 54.8%
- 2.00 reclamos por cliente, 1.66 por contrato

Se actualizo MAPA.md con seccion 7 completa de medidas y KPIs.

### 2026-06-17 - Wireframe del tablero

Se crearon multiples versiones del wireframe:
- v1: estructura basica con KPIs, donas, rankings, tabla
- v2: KPIs como protagonistas (hero)
- v3: rediseño comercial con foco en ultimos 2 años
- v4: rediseño con historia en 4 capitulos (volumen, gestion, impacto, causas)
- v5 (final): wireframe dinamico con filtros funcionales en JS puro

Archivo: `wireframe.html` + `datos.js` (datos pre-cargados desde BD)

### 2026-06-17 - Filtros dinamicos funcionales

El wireframe tiene 3 filtros que recalculan todo en tiempo real:
1. **Periodo**: Ultimos 2 años (default) / 2026 / 2025 / 2024 / Historico
2. **Empresa**: Todas / MEE / MPP / ODO (solo estas 3, excluidas TAP/MEP/EME/ALV-ODO)
3. **Sucursal**: Todas / o sucursales filtradas segun empresa seleccionada

Logica de filtrado:
- Empresa=all + Sucursal=all: agrega las 3 empresas validas (excluye menores)
- Empresa=X + Sucursal=all: agrega todas las sucursales de esa empresa por mes
- Empresa=all + Sucursal=X: agrega las 3 empresas para esa sucursal
- Empresa=X + Sucursal=Y: combinacion exacta

Verificacion contra BD: todos los filtros cuadran perfectamente:
- Todas/Todas: 33,190 (BD: 33,190) OK
- MEE/Todas: 17,020 (BD: 17,020) OK
- ODO/Todas: 14,547 (BD: 14,547) OK
- MPP/Todas: 1,623 (BD: 1,623) OK
- Todas/Brasilia: 11,762 (BD: 11,762) OK
- MEE/Brasilia: 6,949 (BD: 6,949) OK

### 2026-06-17 - Categorizacion de reclamos

El usuario observo que los "reclamos" en realidad son contactos/gestiones de clientes, no todos son quejas reales. Se categorizaron los 126 motivos en 9 categorias:

| Categoria | Reclamos | % | Que son |
|-----------|----------|---|---------|
| Cancelacion de Contrato | 11,027 | 33.2% | Clientes que quieren dar de baja |
| Fin de Relacion / Baja Natural | 9,523 | 28.7% | Tratamiento culminado, viaje, enfermedad |
| Cobranzas / Facturacion | 4,626 | 13.9% | Doble debito, cobranza, cuotas |
| Retencion / Fidelizacion | 4,334 | 13.1% | Acuerdos fidelizacion, derivacion |
| Disconformidad con Servicio | 1,696 | 5.1% | Quejas por atencion clinica, demanda |
| Consultas / Otros | 1,174 | 3.5% | Consultas varias, OTROS |
| Asesoramiento / Ventas | 479 | 1.4% | Mal asesoramiento, info falsa |
| Operativos / Devoluciones | 225 | 0.7% | Devolucion VPOS, fraude |
| Agendamiento / Turnos | 109 | 0.3% | No consigue turno |

Mapeo de IDs de motivos a categorias (para queries futuras):
- Cancelacion: 54,68,83,96,127,20,49,108
- Fin de Relacion: 16,27,2,35,39,99,33,97,50,124,107,106,102,11
- Cobranzas: 66,18,37,53,15,19,41,43,44,40,25,29,36,46,47,59,112
- Retencion: 105,58,61,56,111,101,98,14,22,42,38,30,62,69,26,13,51,31,28
- Disconformidad: 76,77,78,79,80,81,84,85,86,87,88,89,90,91,92,93,94,95,126,74,75,48,32,10,9,118,119,120,121,122,123,115,116,117,125,70
- Asesoramiento: 1,3,4,5,6,7,34,73,72,71,82,60,45,21
- Agendamiento: 12,55,109,100
- Operativos: 113,114,110
- Consultas: 64,65,63,52,24,103,104,67

### Estado actual del proyecto
- query.md: 30 queries SQL verificadas (Q1-Q30)
- MAPA.md: 7 secciones (entidades, flujo, reversion, dimensiones, queries->componentes, reglas, medidas)
- BITACORA.md: registro completo de la sesion
- MEMORIA.md: memoria pulida
- wireframe.html: wireframe funcional con filtros dinamicos
- datos.js: datos pre-cargados desde BD (33,190 reclamos MEE+MPP+ODO, 2024-2026)

### Pendiente para proxima sesion
- [ ] Agregar seccion de categorias al tablero (reemplazar Capitulo 4 con las 9 categorias)
- [ ] Generar HTML final del tablero con logos base64
- [ ] Aplicar diseno segun agente_ui_ux.md
- [ ] Exportar datos de categorias por empresa x mes para filtros dinamicos
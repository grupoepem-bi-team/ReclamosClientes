# QUERIES - Tablero de Reclamos

> Conexion: `Prod_lectura` (mysql8-19dde67e86f-27c364d5ba448e0c) — 192.168.0.250 / epem
> Filtro base: `deleted_at IS NULL` (reclamos no eliminados)

---

# REGLAS DE NEGOCIO VERIFICADAS (fuente: codigo fuente _shared/copy_epem_system)

## Estados de reclamos (complaints.status)
> Fuente: config/constants.php 'complaints-status' + 'complaints-status-label'

| ID | Nombre | Label color |
|----|--------|-------------|
| 1 | Nuevo | success |
| 3 | Remitido | success |
| 5 | En Proceso | warning |
| 8 | Resuelto | warning |
| 10 | Terminado | primary |
| 15 | Cancelado | info |
| 20 | Eliminado | danger |

> IMPORTANTE: el codigo fuente usa dos formas de filtrar eliminados:
> - `deleted_at IS NULL` — filtro por soft delete (mas estricto)
> - `status < 20` — filtro por estado (usado en reportes y dashboards, incluye Cancelado=15)
> - `status < 15` — filtro mas restrictivo (usado en RecoveryTrackingsController, excluye Cancelado y Eliminado)
> Recomendacion: usar `deleted_at IS NULL` para el tablero general, pero considerar `status < 20` para reportes operativos

## Flujo de estados (fuente: ComplaintsController@store_tracking)
1. **Nuevo (1)**: estado inicial al crear reclamo (date se setea a hoy automaticamente)
2. **Remitido (3)**: cuando se hace tracking y status=1 -> pasa a 3
3. **En Proceso (5)**: cuando se hace tracking y status=3 -> pasa a 5
4. **Resuelto (8)**: cuando request->resolved=1 -> destiny=30, status=8
5. **Terminado (10)**: cuando request->close=1 -> status=10
6. **Eliminado (20)**: soft delete (deleted_at + deleted_user_id + deleted_motive)
> Nota: el dashboard muestra pestañas separadas: Nuevos(1), Remitidos(3), En Proceso(5), Resueltos(8), Terminados(10)
> Nota: getStatus() hace array_pop para excluir el ultimo estado (Eliminado=20) del dropdown

## Destino del reclamo (complaints.complaint_destiny)
> Fuente: config/constants.php 'complaint-destiny'

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

> Regla: al crear reclamo, complaint_destiny se setea en 30 (FIDELIZACION-OTROS) por defecto
> Regla: al resolver (resolved=1), complaint_destiny se setea en 30
> Regla: al enviar a marketing, complaint_destiny=20 y status=3
> Regla: si reversion=5, complaint_destiny=25 (TESORERIA)
> Regla: en la vista show, si el reclamo no tiene reversion, se excluye el destino 25 (TESORERIA) del dropdown
> Regla: cada motivo tiene destinos validos definidos en complaint_motives_destinations (relacion N:N)
> Regla: los usuarios se asignan a destinos via complaint_destiny_users (tabla intermedia)

## Relacion Motivo -> Destinos (complaint_motives_destinations)
> Tabla intermedia N:N que define a que destinos puede derivarse cada motivo

| Motivo ID | Nombre | Destinos validos |
|-----------|--------|-----------------|
| 1 | ASESOR INDICO QUE PUEDE CANCELAR | 5,15,30,40 |
| 15 | DOBLE DEBITO | 15,25,30 |
| 16 | CLIENTE CULMINA TRATAMIENTO | 1 |
| 53 | RECLAMO POR GESTION DE COBRANZAS | 5,15,30,35 |
| 54 | CANCELACION CUMPLE CON LOS REQUISITOS | 5,15,30 |
| 56 | SE DERIVA A EJECUTIVOS | 1,5,30 |
| 58 | ACUERDO DE RECA | 5,10,30 |
| 66 | ACTUALIZACION DE CUOTAS | 15 |
| 67 | REINGRESO DE RECLAMO POR LABORATORIO | 1 |
| 70 | DEMANDA EN SEDECO | 1 |

> Regla: getDepartmentName() del modelo ComplaintMotive concatena los destinos (no usa el campo department)
> Regla: al crear/editar motivo, el campo 'department' se setea en null y se usan complaint_motives_destinations

## Estados de reversion (complaints.reversion)
> Fuente: config/constants.php 'complaints-reversion-status'

| ID | Estado |
|----|--------|
| 1 | Pendiente |
| 5 | En proceso / administracion |
| 10 | Revertido |
| 20 | Rechazado |

> Regla: reversion se setea al crear reclamo si double_debit_correspond=1 -> reversion=1 (Pendiente)
> Regla: si double_debit_correspond != 1 -> reversion=20 (Rechazado) o null
> Regla: si reversion=1 y request->reversion=5 -> actualiza datos bancarios (bank_name, account_number, amount, document_manager)
> Regla: si reversion=5 y success_reversion -> reversion=10 (Revertido)
> Regla: si reversion=5 -> complaint_destiny=25 (TESORERIA)
> Regla: si reversion=5 y request->reversion no viene -> status=5 (En Proceso)

## Doble debito (complaints.double_debit_correspond)
> Campo tinyint(1) que indica si el reclamo es por doble debito

| Valor | Significado |
|-------|-------------|
| NULL | No aplica (95.1%) |
| 0 | No corresponde (2.2%) |
| 1 | Corresponde (genera reversion=1 Pendiente) (1.4%) |
| 2 | Otro caso (genera reversion=20 Rechazado) (1.2%) |

> Regla: double_debit_correspond es OBLIGATORIO si complaint_motive_id=15 (DOBLE DEBITO)
> (fuente: CreateComplaintRequest line 20: required_if:complaint_motive_id,15)
> Regla: en el reporte Excel, el campo "CORRESPONDE DOBLE DEBITO" solo se muestra si motive_id==15
> Regla: usa la constante 'yes-no' (1=SI, 2=NO) para mostrar el valor

## Motivos especiales (complaint_motive_id)
> Algunos motivos tienen logica especifica en el codigo:

| Motivo ID | Nombre | Regla especial |
|-----------|--------|----------------|
| 15 | DOBLE DEBITO | requiere double_debit_correspond obligatorio |
| 20 | DESEA CANCELAR / RENUNCIAR | inactivo (status=0), reporte muestra contract_cancelation |
| 61 | ACUERDO DE SUSPENCION | se oculta del formulario create si el usuario no tiene roles especificos |
| 63 | PEDIDO DE INFORMACION | inactivo (status=0), usado como fallback en API Infobip |
| 64 | OTROS | inactivo (status=0), usado como fallback en Chatbot |
| 65 | SIN MOTIVO - INFOBIP | inactivo (status=0), usado como fallback en Infobip |

> Regla: getComplaintMotives() filtra where('loyalty',0) - en la BD real este campo es requires_cancelation_flag (todos en 0)
> Regla: en create(), si el usuario no tiene roles 'fidelizacion-reclamos-control-de-calidad-turnos', 'asistente-reclamos' o 'agendamiento-de-turnos', se excluye el motivo 61 (ACUERDO DE SUSPENCION)
> Regla: en show(), si complaint_motive_id==63 y tiene contracts_id, busca reclamos por client_id en vez de contract_id

## Departamentos (complaint_motives.department)
> Fuente: config/constants.php 'complaint-departments'

| ID | Departamento |
|----|-------------|
| 1 | Ventas |
| 2 | ATC |
| 3 | Fidelizacion |
| 4 | Cobranzas |
| 5 | Agendamiento |
| 6 | Clinicas Terciarizadas |
| 7 | Doctores |
| 8 | Control de Calidad |

> Nota: 25% de los reclamos tienen department=NULL (motivos creados sin departamento asignado)
> Nota: el campo department en complaint_motives es independiente de complaint_motives_destinations

## Cancelacion de contrato (complaints.contract_cancelation)
| Valor | Significado |
|-------|------------|
| NULL | Sin info (53.2%) |
| 1 | Solicita Cancelacion (24.0%) |
| 2 | No Solicita Cancelacion (22.8%) |

> Regla: no se puede marcar "Caso Resuelto" si destiny=15 o destiny=25 sin contract_cancelation
> (fuente: CreateComplaintTrackingRequest line 38)
> Regla: en el reporte Excel, el campo "CANCELA" solo se muestra si motive_id==20
> Regla: usa la constante 'yes-no' (1=SI, 2=NO) para mostrar el valor

## Fidelizacion (complaints.loyalty)
| Valor | Significado |
|-------|------------|
| NULL/0 | Sin fidelizacion (92.1%) |
| 1 | Con fidelizacion (7.9%) |

> Regla: al fidelizar (loyalty=1), se registran loyal_user_id y loyal_date (fecha actual)
> Regla: la fidelizacion solo aparece en reclamos Terminados (status=10) o Resueltos (status=8)
> Regla: en el reporte Excel, el campo "FIDELIZADO" muestra "Fidelizado" si loyalty==1

## Estados de contrato (contracts.status)
> Fuente: config/constants.php 'contract_status'

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

## Tipos de contrato (contracts.contract_type)
| ID | Tipo |
|----|------|
| 1 | Cobrador |
| 2 | Debito |

> Regla: en el reporte Excel, si contract_type==2 (Debito) muestra la entidad debitaria, si ==1 muestra 'COBRADOR'

## Tipos de plan (contracts.type_plan)
| ID | Tipo |
|----|------|
| 1 | Individual |
| 2 | Familiar |
| 3 | Corporativo |
| 4 | Pareja |

## Empresas (enterprises)
> Fuente: tabla enterprises

| ID | Nombre | Sigla |
|----|--------|-------|
| 1 | ODONTOLOGIA | ODO |
| 2 | MEDICINA PREPAGA | MPP |
| 3 | EMERGENCIAS | EME |
| 4 | TAPO | TAP |
| 5 | MEDICINA ESTETICA | MEE |
| 8 | VITALPLAN SEPELIOS | VIP |
| 9 | TAPO DESCUENTO CHEQUES | TDC |
| 10 | TAPO ALIVIO | ALV |
| 14 | MEDICINA ESTETICA PAQUETES | MEP |
| 17 | ALIVIO - ODONTOLOGIA | ALV-ODO |

## Origenes de reclamo (fuentes externas)
> Reclamos pueden crearse desde multiples origenes:

| Origen | complaint_destiny | Motivo usado | Observacion |
|--------|-------------------|-------------|--------------|
| Web (ComplaintsController) | 30 | variable | - |
| Chatbot | 30 | mapeo por tipo o 64 (OTROS) | "Reclamo Generado mediante Chatbot" |
| Infobip | 30 | mapeo por tipo o 65 (SIN MOTIVO) | - |
| Infobip (sin tipo) | 30 | 63 (PEDIDO DE INFORMACION) | - |

## Permisos y visibilidad
> Regla: usuario con permiso 'complaints.own-complaints' solo ve reclamos que el creo (created_user_id)
> Regla: usuario con complaint_destiny asignado solo ve reclamos remitidos a su destino
> Regla: usuario con permiso 'complaints.close' ve todos los reclamos
> Regla: al ver detalle (show), si tiene 'complaints.close', marca todos los trackings como notificated=1

## Notificaciones
> Regla: al remitir reclamo, se dispatcha SendComplaintsJob que envia notificacion via Socket + Email
> Regla: el Socket envia al canal 'complaint-destiny-{destino}'
> Regla: el Email se envia a todos los usuarios asignados a ese destino en complaint_destiny_users
> Regla: si el motivo tiene destino=1 (SERVICIOS), se envia email al operational_manager de la sucursal del ultimo dental_office del cliente

---

## Q1 — KPIs Generales (Tarjetas de resumen)

```sql
SELECT 
  COUNT(*) as total_reclamos,
  COUNT(DISTINCT c.client_id) as clientes_unicos,
  COUNT(DISTINCT c.contract_id) as contratos_unicos,
  SUM(CASE WHEN c.status = 1 THEN 1 ELSE 0 END) as pendientes_nuevo,
  SUM(CASE WHEN c.status = 10 THEN 1 ELSE 0 END) as terminados,
  SUM(CASE WHEN c.loyalty = 1 THEN 1 ELSE 0 END) as fidelizados,
  MIN(c.date) as reclamo_mas_antiguo,
  MAX(c.date) as reclamo_mas_reciente
FROM complaints c
WHERE c.deleted_at IS NULL;
```

## Q2 — Distribucion por Estado

```sql
SELECT 
  c.status,
  CASE c.status
    WHEN 1 THEN 'Nuevo'
    WHEN 3 THEN 'Remitido'
    WHEN 5 THEN 'En Proceso'
    WHEN 8 THEN 'Resuelto'
    WHEN 10 THEN 'Terminado'
    WHEN 15 THEN 'Cancelado'
    WHEN 20 THEN 'Eliminado'
    ELSE 'Desconocido'
  END as estado,
  CASE c.status
    WHEN 1 THEN 'success'
    WHEN 3 THEN 'success'
    WHEN 5 THEN 'warning'
    WHEN 8 THEN 'warning'
    WHEN 10 THEN 'primary'
    WHEN 15 THEN 'info'
    WHEN 20 THEN 'danger'
    ELSE 'default'
  END as label_color,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints WHERE deleted_at IS NULL), 2) as pct
FROM complaints c
WHERE c.deleted_at IS NULL
GROUP BY c.status, estado, label_color
ORDER BY cantidad DESC;
```

## Q3 — Distribucion por Departamento

```sql
SELECT 
  cm.department,
  CASE cm.department
    WHEN 1 THEN 'Ventas'
    WHEN 2 THEN 'ATC'
    WHEN 3 THEN 'Fidelizacion'
    WHEN 4 THEN 'Cobranzas'
    WHEN 5 THEN 'Agendamiento'
    WHEN 6 THEN 'Clinicas Terciarizadas'
    WHEN 7 THEN 'Doctores'
    WHEN 8 THEN 'Control de Calidad'
    ELSE 'Sin Departamento'
  END as departamento,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints WHERE deleted_at IS NULL), 2) as pct
FROM complaints c
JOIN complaint_motives cm ON c.complaint_motive_id = cm.id
WHERE c.deleted_at IS NULL
GROUP BY cm.department, departamento
ORDER BY cantidad DESC;
```

## Q4 — Top Motivos de Reclamo

```sql
SELECT 
  cm.id as motivo_id,
  cm.name as motivo,
  CASE cm.department
    WHEN 1 THEN 'Ventas'
    WHEN 2 THEN 'ATC'
    WHEN 3 THEN 'Fidelizacion'
    WHEN 4 THEN 'Cobranzas'
    WHEN 5 THEN 'Agendamiento'
    WHEN 6 THEN 'Clinicas Terciarizadas'
    WHEN 7 THEN 'Doctores'
    WHEN 8 THEN 'Control de Calidad'
    ELSE 'Sin Depto'
  END as departamento,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints WHERE deleted_at IS NULL), 2) as pct
FROM complaints c
JOIN complaint_motives cm ON c.complaint_motive_id = cm.id
WHERE c.deleted_at IS NULL
GROUP BY cm.id, cm.name, cm.department
ORDER BY cantidad DESC
LIMIT 20;
```

## Q5 — Evolucion Mensual por Estado (Historico completo)

```sql
SELECT 
  YEAR(c.date) as anio,
  MONTH(c.date) as mes,
  COUNT(*) as total,
  SUM(CASE WHEN c.status = 1 THEN 1 ELSE 0 END) as nuevo,
  SUM(CASE WHEN c.status = 3 THEN 1 ELSE 0 END) as remitido,
  SUM(CASE WHEN c.status = 5 THEN 1 ELSE 0 END) as en_proceso,
  SUM(CASE WHEN c.status = 8 THEN 1 ELSE 0 END) as resuelto,
  SUM(CASE WHEN c.status = 10 THEN 1 ELSE 0 END) as terminado,
  SUM(CASE WHEN c.status = 20 THEN 1 ELSE 0 END) as eliminado
FROM complaints c
WHERE c.deleted_at IS NULL
GROUP BY anio, mes
ORDER BY anio, mes;
```

## Q6 — Evolucion Anual por Estado

```sql
SELECT 
  YEAR(c.date) as anio,
  COUNT(*) as total,
  SUM(CASE WHEN c.status = 1 THEN 1 ELSE 0 END) as nuevo,
  SUM(CASE WHEN c.status = 3 THEN 1 ELSE 0 END) as remitido,
  SUM(CASE WHEN c.status = 5 THEN 1 ELSE 0 END) as en_proceso,
  SUM(CASE WHEN c.status = 8 THEN 1 ELSE 0 END) as resuelto,
  SUM(CASE WHEN c.status = 10 THEN 1 ELSE 0 END) as terminado,
  SUM(CASE WHEN c.status = 20 THEN 1 ELSE 0 END) as eliminado
FROM complaints c
WHERE c.deleted_at IS NULL
GROUP BY anio
ORDER BY anio;
```

## Q7 — Evolucion Mensual por Departamento (2025+)

```sql
SELECT 
  YEAR(c.date) as anio,
  MONTH(c.date) as mes,
  CASE cm.department
    WHEN 1 THEN 'Ventas'
    WHEN 2 THEN 'ATC'
    WHEN 3 THEN 'Fidelizacion'
    WHEN 4 THEN 'Cobranzas'
    WHEN 5 THEN 'Agendamiento'
    WHEN 6 THEN 'Clinicas Terciarizadas'
    WHEN 7 THEN 'Doctores'
    WHEN 8 THEN 'Control de Calidad'
    ELSE 'Sin Depto'
  END as departamento,
  COUNT(*) as cantidad
FROM complaints c
JOIN complaint_motives cm ON c.complaint_motive_id = cm.id
WHERE c.deleted_at IS NULL
  AND c.date >= '2025-01-01'
GROUP BY anio, mes, departamento
ORDER BY anio DESC, mes DESC;
```

## Q8 — Cancelacion de Contrato

```sql
SELECT 
  CASE 
    WHEN c.contract_cancelation = 1 THEN 'Solicita Cancelacion'
    WHEN c.contract_cancelation = 2 THEN 'No Solicita Cancelacion'
    ELSE 'Sin Info'
  END as tipo_cancelacion,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints WHERE deleted_at IS NULL), 2) as pct
FROM complaints c
WHERE c.deleted_at IS NULL
GROUP BY tipo_cancelacion
ORDER BY cantidad DESC;
```

## Q9 — Cancelacion de Contrato por Anio

```sql
SELECT 
  CASE 
    WHEN c.contract_cancelation = 1 THEN 'Solicita Cancelacion'
    WHEN c.contract_cancelation = 2 THEN 'No Solicita Cancelacion'
    ELSE 'Sin Info'
  END as tipo_cancelacion,
  YEAR(c.date) as anio,
  COUNT(*) as cantidad
FROM complaints c
WHERE c.deleted_at IS NULL
GROUP BY tipo_cancelacion, anio
ORDER BY anio, tipo_cancelacion;
```

## Q10 — Fidelizacion

```sql
SELECT 
  CASE 
    WHEN c.loyalty = 1 THEN 'Con Fidelizacion'
    ELSE 'Sin Fidelizacion'
  END as fidelizacion,
  COUNT(*) as cantidad,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM complaints WHERE deleted_at IS NULL), 2) as pct
FROM complaints c
WHERE c.deleted_at IS NULL
GROUP BY fidelizacion
ORDER BY cantidad DESC;
```

## Q11 — Reclamos Pendientes (Status = Nuevo)

```sql
SELECT 
  COUNT(*) as pendientes,
  MIN(c.date) as mas_antiguo,
  MAX(c.date) as mas_reciente,
  SUM(CASE WHEN DATEDIFF(CURDATE(), c.date) > 365 THEN 1 ELSE 0 END) as pendientes_mas_1_ano,
  SUM(CASE WHEN DATEDIFF(CURDATE(), c.date) BETWEEN 180 AND 365 THEN 1 ELSE 0 END) as pendientes_6m_12m,
  SUM(CASE WHEN DATEDIFF(CURDATE(), c.date) BETWEEN 30 AND 180 THEN 1 ELSE 0 END) as pendientes_1m_6m,
  SUM(CASE WHEN DATEDIFF(CURDATE(), c.date) < 30 THEN 1 ELSE 0 END) as pendientes_menos_1m
FROM complaints c
WHERE c.deleted_at IS NULL AND c.status = 1;
```

## Q12 — Destino del Reclamo

```sql
SELECT 
  c.complaint_destiny,
  CASE c.complaint_destiny
    WHEN 1 THEN 'SERVICIOS'
    WHEN 5 THEN 'AGENDAMIENTO'
    WHEN 10 THEN 'VISACION'
    WHEN 15 THEN 'COBRANZAS'
    WHEN 20 THEN 'MARKETING'
    WHEN 25 THEN 'TESORERIA'
    WHEN 30 THEN 'FIDELIZACION- OTROS'
    WHEN 35 THEN 'GESTION DOCUMENTOS'
    WHEN 40 THEN 'INFORMACION COBRANZAS'
    ELSE 'Sin Destino'
  END as destino,
  COUNT(*) as cantidad
FROM complaints c
WHERE c.deleted_at IS NULL
GROUP BY c.complaint_destiny, destino
ORDER BY cantidad DESC;
```

## Q13 — Motivo x Estado (Cruzado)

```sql
SELECT 
  cm.name as motivo,
  CASE cm.department
    WHEN 1 THEN 'Ventas'
    WHEN 2 THEN 'ATC'
    WHEN 3 THEN 'Fidelizacion'
    WHEN 4 THEN 'Cobranzas'
    WHEN 5 THEN 'Agendamiento'
    WHEN 6 THEN 'Clinicas Terciarizadas'
    WHEN 7 THEN 'Doctores'
    WHEN 8 THEN 'Control de Calidad'
    ELSE 'Sin Depto'
  END as departamento,
  COUNT(*) as total,
  SUM(CASE WHEN c.status = 1 THEN 1 ELSE 0 END) as nuevo,
  SUM(CASE WHEN c.status = 3 THEN 1 ELSE 0 END) as remitido,
  SUM(CASE WHEN c.status = 5 THEN 1 ELSE 0 END) as en_proceso,
  SUM(CASE WHEN c.status = 8 THEN 1 ELSE 0 END) as resuelto,
  SUM(CASE WHEN c.status = 10 THEN 1 ELSE 0 END) as terminado,
  SUM(CASE WHEN c.status = 20 THEN 1 ELSE 0 END) as eliminado
FROM complaints c
JOIN complaint_motives cm ON c.complaint_motive_id = cm.id
WHERE c.deleted_at IS NULL
GROUP BY cm.name, cm.department
ORDER BY total DESC;
```

## Q14 — Tracking Diario por Estado (Ultimos 30 dias)

```sql
SELECT 
  DATE(ct.created_at) as fecha,
  ct.complaint_status,
  CASE ct.complaint_status
    WHEN 1 THEN 'Nuevo'
    WHEN 3 THEN 'Remitido'
    WHEN 5 THEN 'En Proceso'
    WHEN 8 THEN 'Resuelto'
    WHEN 10 THEN 'Terminado'
    WHEN 15 THEN 'Cancelado'
    WHEN 20 THEN 'Eliminado'
    ELSE 'Desconocido'
  END as estado,
  COUNT(*) as cantidad
FROM complaint_trackings ct
WHERE ct.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY fecha, ct.complaint_status
ORDER BY fecha DESC;
```

---

# QUERIES DE TRAZABILIDAD

> Joins con contracts, enterprises, branches, users, business_departments, complaint_motives
> Para conectar reclamos con la estructura del sistema

---

## Q15 — Reclamos por Empresa (Unidad de Negocio)

```sql
SELECT 
  e.id as empresa_id,
  e.name as empresa,
  e.abbreviation as sigla,
  COUNT(c.id) as reclamos
FROM complaints c
JOIN contracts ct ON c.contract_id = ct.id
JOIN enterprises e ON ct.enterprise_id = e.id
WHERE c.deleted_at IS NULL
GROUP BY e.id, e.name, e.abbreviation
ORDER BY reclamos DESC;
```

## Q16 — Reclamos por Sucursal

```sql
SELECT 
  b.id as sucursal_id,
  b.name as sucursal,
  COUNT(c.id) as reclamos
FROM complaints c
JOIN contracts ct ON c.contract_id = ct.id
JOIN branches b ON ct.branch_id = b.id
WHERE c.deleted_at IS NULL
GROUP BY b.id, b.name
ORDER BY reclamos DESC;
```

## Q17 — Reclamos por Estado de Contrato

```sql
SELECT 
  ct.status as contract_status,
  CASE ct.status
    WHEN 1 THEN 'Pendiente'
    WHEN 2 THEN 'Aprobado por CC'
    WHEN 3 THEN 'Rechazado por CC'
    WHEN 4 THEN 'Rechazado por Autorizacion'
    WHEN 5 THEN 'Contrato Confirmado'
    WHEN 6 THEN 'Contrato Culminado'
    WHEN 7 THEN 'Contrato Borrado'
    WHEN 9 THEN 'Contrato Inactivado'
    WHEN 10 THEN 'Gestion de Cobranzas'
    ELSE 'Otro'
  END as estado_contrato,
  COUNT(c.id) as reclamos
FROM complaints c
JOIN contracts ct ON c.contract_id = ct.id
WHERE c.deleted_at IS NULL
GROUP BY ct.status, estado_contrato
ORDER BY reclamos DESC;
```

## Q18 — Reclamos por Tipo de Contrato (Cobrador vs Debito)

```sql
SELECT 
  ct.contract_type,
  CASE ct.contract_type
    WHEN 1 THEN 'Cobrador'
    WHEN 2 THEN 'Debito'
    ELSE 'Otro'
  END as tipo,
  COUNT(c.id) as reclamos
FROM complaints c
JOIN contracts ct ON c.contract_id = ct.id
WHERE c.deleted_at IS NULL
GROUP BY ct.contract_type, tipo
ORDER BY reclamos DESC;
```

## Q19 — Reclamos por Tipo de Plan

```sql
SELECT 
  ct.type_plan,
  CASE ct.type_plan
    WHEN 1 THEN 'Individual'
    WHEN 2 THEN 'Familiar'
    WHEN 3 THEN 'Corporativo'
    WHEN 4 THEN 'Pareja'
    ELSE 'Otro'
  END as tipo_plan,
  COUNT(c.id) as reclamos
FROM complaints c
JOIN contracts ct ON c.contract_id = ct.id
WHERE c.deleted_at IS NULL
GROUP BY ct.type_plan, tipo_plan
ORDER BY reclamos DESC;
```

## Q20 — Reclamos por Empresa x Departamento

```sql
SELECT 
  e.abbreviation as empresa,
  CASE cm.department
    WHEN 1 THEN 'Ventas'
    WHEN 2 THEN 'ATC'
    WHEN 3 THEN 'Fidelizacion'
    WHEN 4 THEN 'Cobranzas'
    WHEN 5 THEN 'Agendamiento'
    WHEN 6 THEN 'Clinicas Terciarizadas'
    WHEN 7 THEN 'Doctores'
    WHEN 8 THEN 'Control de Calidad'
    ELSE 'Sin Depto'
  END as departamento,
  COUNT(c.id) as reclamos
FROM complaints c
JOIN complaint_motives cm ON c.complaint_motive_id = cm.id
JOIN contracts ct ON c.contract_id = ct.id
JOIN enterprises e ON ct.enterprise_id = e.id
WHERE c.deleted_at IS NULL
GROUP BY e.abbreviation, departamento
ORDER BY e.abbreviation, reclamos DESC;
```

## Q21 — Reclamos por Empresa x Sucursal

```sql
SELECT 
  e.abbreviation as empresa,
  b.name as sucursal,
  COUNT(c.id) as reclamos
FROM complaints c
JOIN contracts ct ON c.contract_id = ct.id
JOIN enterprises e ON ct.enterprise_id = e.id
JOIN branches b ON ct.branch_id = b.id
WHERE c.deleted_at IS NULL
GROUP BY e.abbreviation, b.name
ORDER BY e.abbreviation, reclamos DESC;
```

## Q22 — Evolucion Mensual por Empresa (2025+)

```sql
SELECT 
  YEAR(c.date) as anio,
  MONTH(c.date) as mes,
  e.abbreviation as empresa,
  COUNT(c.id) as reclamos
FROM complaints c
JOIN contracts ct ON c.contract_id = ct.id
JOIN enterprises e ON ct.enterprise_id = e.id
WHERE c.deleted_at IS NULL AND c.date >= '2025-01-01'
GROUP BY anio, mes, empresa
ORDER BY anio DESC, mes DESC, empresa;
```

## Q23 — Top Usuarios Creadores de Reclamos

```sql
SELECT 
  u_creador.id as user_id,
  u_creador.first_name,
  u_creador.last_name,
  bd.name as departamento,
  COUNT(c.id) as reclamos_creados
FROM complaints c
JOIN users u_creador ON c.created_user_id = u_creador.id
LEFT JOIN business_departments bd ON u_creador.business_department_id = bd.id
WHERE c.deleted_at IS NULL
GROUP BY u_creador.id, u_creador.first_name, u_creador.last_name, bd.name
ORDER BY reclamos_creados DESC
LIMIT 20;
```

## Q24 — Top Usuarios Fidelizadores

```sql
SELECT 
  u_fideliza.id as user_id,
  u_fideliza.first_name,
  u_fideliza.last_name,
  bd.name as departamento,
  COUNT(c.id) as reclamos_fidelizados
FROM complaints c
JOIN users u_fideliza ON c.loyal_user_id = u_fideliza.id
LEFT JOIN business_departments bd ON u_fideliza.business_department_id = bd.id
WHERE c.deleted_at IS NULL AND c.loyalty = 1
GROUP BY u_fideliza.id, u_fideliza.first_name, u_fideliza.last_name, bd.name
ORDER BY reclamos_fidelizados DESC
LIMIT 20;
```

## Q25 — Detalle completo de Reclamo (Ficha de trazabilidad)

```sql
SELECT 
  c.id as reclamo_id,
  c.date as fecha_reclamo,
  c.status as status_id,
  CASE c.status
    WHEN 1 THEN 'Nuevo'
    WHEN 3 THEN 'Remitido'
    WHEN 5 THEN 'En Proceso'
    WHEN 8 THEN 'Resuelto'
    WHEN 10 THEN 'Terminado'
    WHEN 15 THEN 'Cancelado'
    WHEN 20 THEN 'Eliminado'
    ELSE 'Desconocido'
  END as estado,
  cm.name as motivo,
  CASE cm.department
    WHEN 1 THEN 'Ventas'
    WHEN 2 THEN 'ATC'
    WHEN 3 THEN 'Fidelizacion'
    WHEN 4 THEN 'Cobranzas'
    WHEN 5 THEN 'Agendamiento'
    WHEN 6 THEN 'Clinicas Terciarizadas'
    WHEN 7 THEN 'Doctores'
    WHEN 8 THEN 'Control de Calidad'
    ELSE 'Sin Depto'
  END as departamento,
  c.contract_cancelation,
  c.loyalty,
  c.loyal_date,
  c.observation,
  c.created_at,
  e.name as empresa,
  e.abbreviation as empresa_sigla,
  b.name as sucursal,
  ct.number as contrato_numero,
  ct.status as contrato_status,
  CASE ct.status
    WHEN 1 THEN 'Pendiente'
    WHEN 5 THEN 'Contrato Confirmado'
    WHEN 6 THEN 'Contrato Culminado'
    WHEN 7 THEN 'Contrato Borrado'
    WHEN 9 THEN 'Contrato Inactivado'
    WHEN 10 THEN 'Gestion de Cobranzas'
    ELSE 'Otro'
  END as contrato_estado_nombre,
  ct.contract_type,
  CASE ct.contract_type
    WHEN 1 THEN 'Cobrador'
    WHEN 2 THEN 'Debito'
    ELSE 'Otro'
  END as tipo_contrato,
  ct.type_plan,
  CASE ct.type_plan
    WHEN 1 THEN 'Individual'
    WHEN 2 THEN 'Familiar'
    WHEN 3 THEN 'Corporativo'
    WHEN 4 THEN 'Pareja'
    ELSE 'Otro'
  END as plan,
  CONCAT(cl.first_name, ' ', cl.last_name) as cliente,
  cl.document_number as cliente_documento,
  u_creador.first_name as creador_nombre,
  u_creador.last_name as creador_apellido,
  u_creador.id as creador_id
FROM complaints c
LEFT JOIN complaint_motives cm ON c.complaint_motive_id = cm.id
LEFT JOIN contracts ct ON c.contract_id = ct.id
LEFT JOIN enterprises e ON ct.enterprise_id = e.id
LEFT JOIN branches b ON ct.branch_id = b.id
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN users u_creador ON c.created_user_id = u_creador.id
WHERE c.deleted_at IS NULL
ORDER BY c.date DESC;
```

## Q26 — Reclamos por Estado de Reversion

```sql
SELECT 
  c.reversion,
  CASE c.reversion
    WHEN 1 THEN 'Pendiente'
    WHEN 5 THEN 'En proceso / administracion'
    WHEN 10 THEN 'Revertido'
    WHEN 20 THEN 'Rechazado'
    ELSE 'Sin Reversion'
  END as estado_reversion,
  COUNT(*) as cantidad
FROM complaints c
WHERE c.deleted_at IS NULL
GROUP BY c.reversion, estado_reversion
ORDER BY cantidad DESC;
```

## Q27 — Doble Debito

```sql
SELECT 
  c.double_debit_correspond,
  CASE c.double_debit_correspond
    WHEN 0 THEN 'No corresponde'
    WHEN 1 THEN 'Corresponde (genera reversion Pendiente)'
    WHEN 2 THEN 'Otro caso (genera reversion Rechazado)'
    ELSE 'No aplica'
  END as doble_debito,
  COUNT(*) as cantidad
FROM complaints c
WHERE c.deleted_at IS NULL
GROUP BY c.double_debit_correspond, doble_debito
ORDER BY cantidad DESC;
```

## Q28 — Reversion por Anio (Tendencia)

```sql
SELECT 
  YEAR(c.date) as anio,
  CASE c.reversion
    WHEN 1 THEN 'Pendiente'
    WHEN 5 THEN 'En proceso / administracion'
    WHEN 10 THEN 'Revertido'
    WHEN 20 THEN 'Rechazado'
    ELSE 'Sin Reversion'
  END as estado_reversion,
  COUNT(*) as cantidad
FROM complaints c
WHERE c.deleted_at IS NULL AND c.reversion IS NOT NULL
GROUP BY anio, estado_reversion
ORDER BY anio, estado_reversion;
```

## Q29 — Reclamos por Destino x Estado (Flujo de derivacion)

```sql
SELECT 
  c.complaint_destiny,
  CASE c.complaint_destiny
    WHEN 1 THEN 'SERVICIOS'
    WHEN 5 THEN 'AGENDAMIENTO'
    WHEN 10 THEN 'VISACION'
    WHEN 15 THEN 'COBRANZAS'
    WHEN 20 THEN 'MARKETING'
    WHEN 25 THEN 'TESORERIA'
    WHEN 30 THEN 'FIDELIZACION- OTROS'
    WHEN 35 THEN 'GESTION DOCUMENTOS'
    WHEN 40 THEN 'INFORMACION COBRANZAS'
    ELSE 'Sin Destino'
  END as destino,
  c.status,
  CASE c.status
    WHEN 1 THEN 'Nuevo'
    WHEN 3 THEN 'Remitido'
    WHEN 5 THEN 'En Proceso'
    WHEN 8 THEN 'Resuelto'
    WHEN 10 THEN 'Terminado'
    WHEN 15 THEN 'Cancelado'
    WHEN 20 THEN 'Eliminado'
    ELSE 'Desconocido'
  END as estado,
  COUNT(*) as cantidad
FROM complaints c
WHERE c.deleted_at IS NULL
GROUP BY c.complaint_destiny, destino, c.status, estado
ORDER BY c.complaint_destiny, c.status;
```

## Q30 — Ficha de Trazabilidad Completa (con reversion y destino)

```sql
SELECT 
  c.id as reclamo_id,
  c.date as fecha_reclamo,
  c.status as status_id,
  CASE c.status
    WHEN 1 THEN 'Nuevo'
    WHEN 3 THEN 'Remitido'
    WHEN 5 THEN 'En Proceso'
    WHEN 8 THEN 'Resuelto'
    WHEN 10 THEN 'Terminado'
    WHEN 15 THEN 'Cancelado'
    WHEN 20 THEN 'Eliminado'
    ELSE 'Desconocido'
  END as estado,
  c.reversion,
  CASE c.reversion
    WHEN 1 THEN 'Pendiente'
    WHEN 5 THEN 'En proceso / administracion'
    WHEN 10 THEN 'Revertido'
    WHEN 20 THEN 'Rechazado'
    ELSE 'Sin Reversion'
  END as estado_reversion,
  c.double_debit_correspond,
  c.complaint_destiny,
  CASE c.complaint_destiny
    WHEN 1 THEN 'SERVICIOS'
    WHEN 5 THEN 'AGENDAMIENTO'
    WHEN 10 THEN 'VISACION'
    WHEN 15 THEN 'COBRANZAS'
    WHEN 20 THEN 'MARKETING'
    WHEN 25 THEN 'TESORERIA'
    WHEN 30 THEN 'FIDELIZACION- OTROS'
    WHEN 35 THEN 'GESTION DOCUMENTOS'
    WHEN 40 THEN 'INFORMACION COBRANZAS'
    ELSE 'Sin Destino'
  END as destino,
  cm.name as motivo,
  CASE cm.department
    WHEN 1 THEN 'Ventas'
    WHEN 2 THEN 'ATC'
    WHEN 3 THEN 'Fidelizacion'
    WHEN 4 THEN 'Cobranzas'
    WHEN 5 THEN 'Agendamiento'
    WHEN 6 THEN 'Clinicas Terciarizadas'
    WHEN 7 THEN 'Doctores'
    WHEN 8 THEN 'Control de Calidad'
    ELSE 'Sin Depto'
  END as departamento,
  CASE c.contract_cancelation
    WHEN 1 THEN 'Solicita Cancelacion'
    WHEN 2 THEN 'No Solicita Cancelacion'
    ELSE 'Sin Info'
  END as cancelacion,
  c.loyalty,
  c.loyal_date,
  c.bank_name,
  c.account_number,
  c.amount,
  c.document_manager,
  c.observation,
  c.created_at,
  e.name as empresa,
  e.abbreviation as empresa_sigla,
  b.name as sucursal,
  ct.number as contrato_numero,
  ct.status as contrato_status,
  CASE ct.status
    WHEN 1 THEN 'Pendiente'
    WHEN 2 THEN 'Aprobado por CC'
    WHEN 3 THEN 'Rechazado por CC'
    WHEN 4 THEN 'Rechazado por Autorizacion'
    WHEN 5 THEN 'Contrato Confirmado'
    WHEN 6 THEN 'Contrato Culminado'
    WHEN 7 THEN 'Contrato Borrado'
    WHEN 9 THEN 'Contrato Inactivado'
    WHEN 10 THEN 'Gestion de Cobranzas'
    ELSE 'Otro'
  END as contrato_estado_nombre,
  ct.contract_type,
  CASE ct.contract_type
    WHEN 1 THEN 'Cobrador'
    WHEN 2 THEN 'Debito'
    ELSE 'Otro'
  END as tipo_contrato,
  ct.type_plan,
  CASE ct.type_plan
    WHEN 1 THEN 'Individual'
    WHEN 2 THEN 'Familiar'
    WHEN 3 THEN 'Corporativo'
    WHEN 4 THEN 'Pareja'
    ELSE 'Otro'
  END as plan,
  CONCAT(cl.first_name, ' ', cl.last_name) as cliente,
  cl.document_number as cliente_documento,
  u_creador.first_name as creador_nombre,
  u_creador.last_name as creador_apellido,
  u_creador.id as creador_id,
  u_fideliza.first_name as fidelizador_nombre,
  u_fideliza.last_name as fidelizador_apellido
FROM complaints c
LEFT JOIN complaint_motives cm ON c.complaint_motive_id = cm.id
LEFT JOIN contracts ct ON c.contract_id = ct.id
LEFT JOIN enterprises e ON ct.enterprise_id = e.id
LEFT JOIN branches b ON ct.branch_id = b.id
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN users u_creador ON c.created_user_id = u_creador.id
LEFT JOIN users u_fideliza ON c.loyal_user_id = u_fideliza.id
WHERE c.deleted_at IS NULL
ORDER BY c.date DESC;
```
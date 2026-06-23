# MAPA - Tablero de Reclamos

## 1. Mapa de Entidades y Relaciones

```
                                    MAPA DE DATOS - TABLERO DE RECLAMOS

  ┌──────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
  │   complaint_      │     │                  │     │   complaint_motives │
  │   motives_dest    │     │  complaints      │     │                     │
  │   (N:N)           │     │  (79,494 activos)│     │   (77 activos)      │
  ├──────────────────┤     ├──────────────────┤     ├─────────────────────┤
  │ id          PK   │     │ id            PK │     │ id             PK   │
  │ complaint_        │     │ date              │     │ name                 │
  │   motive_id  FK──┼────►│ contract_id   FK──┼────►│ department           │
  │ destiny_id        │     │ client_id     FK──┼─┐  │ requires_cancel_     │
  │ created_at        │     │ complaint_        │ │  │   flag               │
  │ updated_at        │     │   motive_id FK──┼─┼─►│ status               │
  └──────────────────┘     │ phone_number      │ │  │ user_id          FK  │
                           │ reversion         │ │  └─────────────────────┘
  ┌──────────────────┐     │ json_infobip      │ │
  │ complaint_       │     │ contract_         │ │  ┌─────────────────────┐
  │ destiny_users    │     │   cancelation     │ │  │   complaint_        │
  ├──────────────────┤     │ double_debit_     │ │  │   trackings         │
  │ id          PK   │     │   correspond      │ │  │   (220,476)         │
  │ complaint_        │     │ complaint_        │ │  ├─────────────────────┤
  │   destiny         │     │   destiny         │ │  │ id              PK  │
  │ user_id      FK──┼─┐   │ observation       │ │  │ complaint_id    FK──┼─┐
  │ created_at        │ │   │ status            │ │  │ observation         │ │
  │ updated_at        │ │   │ user_id       FK──┼─┼─►│ complaint_remitent │ │
  └──────────────────┘ │   │ loyalty           │ │  │ complaint_destiny   │ │
                       │   │ loyal_user_id FK──┼─┼─►│ status              │ │
                       │   │ loyal_date        │ │  │ complaint_status    │ │
                       │   │ tracking_user FK──┼─┼─►│ notificated         │ │
                       │   │ deleted_user_idFK │ │  │ user_id        FK──┼─┼─► users
                       │   │ deleted_motive    │ │  │ remited_at          │ │
                       │   │ deleted_at        │ │  │ receipt_at          │ │
                       │   │ bank_name         │ │  │ created_at          │ │
                       │   │ account_number    │ │  │ updated_at          │ │
                       │   │ amount            │ │  └─────────────────────┘ │
                       │   │ document_manager   │ │              ▲          │
                       │   │ created_user_idFK │ │              │          │
                       │   │ created_at        │ │  ┌───────────┘          │
                       │   │ updated_at        │ │  │                      │
                       │   └──────────────────┘  │  │                      │
                       │           ▲             │  │                      │
                       │           │             │  │                      │
                       │     ┌─────┘             │  │                      │
                       │     │                   │  │                      │
                  ┌────┴─────┴────┐     ┌────────┴──┴───┐          ┌──────┴──────┐
                  │   users       │     │   clients      │          │  contracts  │
                  │   (creadores, │     │   (39,620)     │          │  (47,904)   │
                  │   fidelizad.) │     ├────────────────┤          ├─────────────┤
                  ├───────────────┤     │ id          PK │     ┌───│ id       PK │
                  │ id        PK  │     │ first_name     │     │   │ enterprise_id│
                  │ first_name    │     │ last_name      │     │   │ branch_id  │
                  │ last_name     │     │ document_number│     │   │ account_   │
                  │ username      │     │ birth_date     │     │   │  holder_id│
                  │ email         │     │ gender         │     │   │ number     │
                  │ branch_id FK  │     │ status         │     │   │ seller_id  │
                  │ business_     │     │ email           │     │   │ status      │
                  │  dept_id  FK  │     └────────────────┘     │   │ contract_  │
                  │ person_id FK  │              ▲             │   │  type       │
                  │ status        │              │             │   │ type_plan   │
                  └───────────────┘              └─────────────┘   │ amount      │
                        │                              │             │ total_debt  │
                        │                              │             └─────────────┘
                        ▼                              ▼                   │
                  ┌──────────────┐              ┌──────────┐                 │
                  │ business_     │              │ (join)   │                 │
                  │ departments   │              └──────────┘                 │
                  ├──────────────┤                                         │
                  │ id       PK  │              ┌──────────┐                  │
                  │ name         │              │branches  │                  │
                  │ gerency_idFK │              │(13)      │                  │
                  │ status       │              ├──────────┤                  │
                  └──────────────┘              │ id   PK  │◄─────────────────┘
                                                │ name     │
                                                │ abbrev.. │
                                                │ status   │
                                                └──────────┘
                                                     │
                                                     ▲
                                                     │
                                              ┌──────────────┐
                                              │ enterprises  │
                                              │ (10)         │
                                              ├──────────────┤
                                              │ id       PK  │
                                              │ name         │
                                              │ abbreviation │
                                              │ status       │
                                              └──────────────┘
```

---

## 2. Mapa de Flujo de Estados

```
                         FLUJO DE RECLAMOS

    CREACION (Web / Chatbot / Infobip)
    │
    │  complaint_destiny = 30 (FIDELIZACION-OTROS)
    │  date = hoy
    │  status = 1 (NUEVO)
    │  si double_debit_correspond=1 -> reversion=1 (Pendiente)
    │  si double_debit_correspond=2 -> reversion=20 (Rechazado)
    │
    ▼
  ┌─────────────────────────────────────────────────────┐
  │                  ESTADO 1: NUEVO                     │
  │  success                                             │
  │  Pendiente de derivar                                │
  │                                                      │
  │  REGLA: si motive=15 (DOBLE DEBITO)                  │
  │         -> double_debit_correspond obligatorio        │
  │                                                      │
  │  ACCION: tracking con complaint_destiny obligatorio   │
  │                                                      │
  │  VALIDACION:                                         │
  │  - complaint_destiny obligatorio si status=1          │
  └──────────────────────┬──────────────────────────────┘
                         │
                    tracking
                         │
                         ▼
  ┌─────────────────────────────────────────────────────┐
  │                 ESTADO 3: REMITIDO                   │
  │  success                                             │
  │  Derivado a area responsable                         │
  │                                                      │
  │  Notifica via Socket + Email a usuarios del destino  │
  │  Si motive->destiny=1 (SERVICIOS): email al mgr      │
  └──────────────────────┬──────────────────────────────┘
                         │
                    tracking
                         │
                         ▼
  ┌─────────────────────────────────────────────────────┐
  │               ESTADO 5: EN PROCESO                   │
  │  warning                                             │
  │  Area responsable trabajando el reclamo             │
  │                                                      │
  │  Si reversion=5 -> complaint_destiny=25 (TESORERIA)  │
  │  Si reversion=5 -> requiere datos bancarios          │
  │    (bank_name, account_number, amount, doc_manager)  │
  └──────────┬──────────────────────┬───────────────────┘
             │                      │
        resolved=1              close=1
             │                      │
             ▼                      ▼
  ┌──────────────────┐    ┌──────────────────────────┐
  │  ESTADO 8:       │    │    ESTADO 10: TERMINADO  │
  │  RESUELTO        │    │    primary               │
  │  warning         │    │                          │
  │                  │    │    Reclamo cerrado        │
  │  destiny=30      │    │                          │
  │                  │    │    Si loyalty=1:          │
  │  Puede pasar a   │    │    -> Fidelizado         │
  │  Terminado       │    │    -> loyal_user_id      │
  │  (close=1)       │    │    -> loyal_date         │
  └────────┬─────────┘    └──────────────────────────┘
           │                           ▲
           └───────────────────────────┘
                  close=1


  ┌──────────────────────────────────────────────────────┐
  │                ESTADO 20: ELIMINADO                   │
  │  danger                                              │
  │  Soft delete: deleted_at + deleted_user_id + motive  │
  │  Reclamo eliminado del listado principal             │
  └──────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │                ESTADO 15: CANCELADO                   │
  │  info                                                 │
  │  (existe en constante pero no en datos reales)        │
  └──────────────────────────────────────────────────────┘
```

---

## 3. Mapa de Flujo de Reversion (Doble Debito)

```
                    FLUJO DE REVERSION

    Creacion de reclamo con motive=15 (DOBLE DEBITO)
    │
    │  double_debit_correspond (obligatorio)
    │
    ├──► valor=1 (Corresponde)
    │        │
    │        ▼
    │    reversion = 1 (PENDIENTE)
    │    status = 1 (Nuevo)
    │    complaint_destiny = 30
    │        │
    │        ▼
    │    tracking con reversion=5
    │    (requiere: bank_name, account_number,
    │     document_manager, amount)
    │        │
    │        ▼
    │    reversion = 5 (EN PROCESO / ADMINISTRACION)
    │    complaint_destiny = 25 (TESORERIA)
    │    status = 3 (Remitido)
    │        │
    │        ├──► success_reversion=1
    │        │        │
    │        │        ▼
    │        │    reversion = 10 (REVERTIDO)
    │        │    Pago devuelto al cliente
    │        │
    │        └──► sin success_reversion
    │                 │
    │                 ▼
    │             (sigue en proceso)
    │
    ├──► valor=2 (Otro caso)
    │        │
    │        ▼
    │    reversion = 20 (RECHAZADO)
    │    No corresponde devolucion
    │
    └──► valor=0 (No corresponde)
             │
             ▼
         reversion = null
         No genera flujo de reversion

    VALIDACIONES:
    - No se puede "Caso Resuelto" si destiny=15 o 25 sin contract_cancelation
    - No se puede "Caso Resuelto" si reversion=1 sin marcar reversion
    - No se puede "Caso Resuelto" si reversion=5 sin success_reversion
```

---

## 4. Mapa de Dimensiones del Tablero

```
              DIMENSIONES Y METRICAS DEL TABLERO

  ┌─────────────────────────────────────────────────────────┐
  │                     KPIs (Q1)                           │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
  │  │  Total   │ │ Pendien. │ │ Termina. │ │ Fideli.  │     │
  │  │ 79,494   │ │  3,294   │ │ 74,833   │ │  6,313   │     │
  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
  │  │ Clientes │ │ Contratos│ │ Trackings│                   │
  │ │ 39,620    │ │ 47,904   │ │ 220,476  │                   │
  │  └──────────┘ └──────────┘ └──────────┘                   │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │              DISTRIBUCIONES (Grafos de torta/dona)       │
  │                                                         │
  │  POR ESTADO (Q2)          POR DEPARTAMENTO (Q3)          │
  │  ├ Terminado 94.1%        ├ Ventas 46.4%                 │
  │  ├ Nuevo 4.1%             ├ Sin Depto 24.8%             │
  │  ├ Remitido 0.8%          ├ Cobranzas 12.6%             │
  │  ├ Eliminado 0.5%         ├ Fidelizacion 6.3%           │
  │  ├ Resuelto 0.4%          ├ ATC 6.1%                    │
  │  └ En Proceso 0.1%        ├ Clinicas 2.1%              │
  │                           ├ Agendamiento 1.4%          │
  │  POR EMPRESA (Q15)        └ Doctores 0.1%              │
  │  ├ ODO 61.0%                                           │
  │  ├ MEE 32.2%              POR DESTINO (Q12)              │
  │  ├ MPP 6.4%               ├ Fideliz-Otros 91%           │
  │  └ Resto 0.4%             ├ Sin Destino 7%             │
  │                            ├ Cobranzas 0.6%             │
  │  POR SUCURSAL (Q16)       └ Resto <1%                  │
  │  ├ Mcal Lopez 21.7%                                    │
  │  ├ Brasilia 18.3%          POR REVERSION (Q26)          │
  │  ├ Nemby 14.8%            ├ Sin Reversion 97.5%        │
  │  ├ San Lorenzo 13.7%      ├ Rechazado 1.6%             │
  │  ├ Encarnacion 11.2%      ├ Revertido 0.6%             │
  │  ├ CDE 9.8%               └ Pendiente 0.4%            │
  │  ├ MRA 5.9%                                             │
  │  └ Luque 3.7%             POR CANCELACION (Q8)          │
  │                            ├ Sin Info 53.2%            │
  │  POR TIPO CONTRATO (Q18)   ├ Solicita 24.0%            │
  │  ├ Cobrador 62.1%         └ No Solicita 22.8%          │
  │  └ Debito 37.9%                                        │
  │                            POR TIPO PLAN (Q19)          │
  │  POR ESTADO CONTRATO (Q17) ├ Individual 71.5%           │
  │  ├ Culminado 74.9%        ├ Familiar 28.4%             │
  │  └ Confirmado 24.7%      └ Pareja 0.2%                │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │             EVOLUCION TEMPORAL (Series de tiempo)       │
  │                                                         │
  │  MENSUAL HISTORICO (Q5)                                 │
  │  96 meses: 2018-07 a 2026-06                            │
  │  Columnas: total, nuevo, remitido, en_proceso,          │
  │           resuelto, terminado, eliminado                 │
  │                                                         │
  │  ANUAL (Q6)                                             │
  │  9 anos: 2018-2026                                      │
  │  Mismo desglose por estado                              │
  │                                                         │
  │  MENSUAL POR DEPTO (Q7)          MENSUAL POR EMPRESA(Q22)│
  │  2025+, 18 meses               2025+, 18 meses         │
  │  8 departamentos               ODO, MEE, MPP, etc.     │
  │                                                         │
  │  REVERSION POR ANIO (Q28)                               │
  │  Tendencia de reversiones 2018-2026                     │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │                   TOPS (Rankings)                       │
  │                                                         │
  │  TOP 20 MOTIVOS (Q4)          TOP CREADORES (Q23)        │
  │  ├ Cancelacion 31,597         ├ FABIAN SANCHEZ 7,700    │
  │  ├ Cobranzas 6,599            ├ SUSANA GALEANO 3,899    │
  │  ├ Ejecutivos 4,869           ├ NATALIA LEGUIZAMON 3,298│
  │  ├ Culmina trat. 4,092        └ ...                     │
  │  └ ...                                                  │
  │                               TOP FIDELIZADORES (Q24)   │
  │  TOP MOTIVO x ESTADO (Q13)    ├ FABIAN SANCHEZ 1,625    │
  │  Tabla cruzada 82 combos      ├ NATALIA LEGUIZAMON 495  │
  │                               └ ...                     │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │                  CRUZADOS (Tablas/Heatmaps)             │
  │                                                         │
  │  EMPRESA x DEPTO (Q20)        EMPRESA x SUCURSAL (Q21)  │
  │  46 combinaciones              46 combinaciones         │
  │                                                         │
  │  DESTINO x ESTADO (Q29)        MOTIVO x ESTADO (Q13)    │
  │  Flujo de derivacion            82 combinaciones        │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │              PENDIENTES Y ALERTAS                       │
  │                                                         │
  │  PENDIENTES POR ANTIGUEDAD (Q11)                        │
  │  ├ Total pendientes: 3,294                              │
  │  ├ Mas antiguo: 2023-12-21                              │
  │  ├ Mas reciente: 2026-06-17                            │
  │  ├ >1 ano: (a calcular)                                │
  │  ├ 6m-12m: (a calcular)                                │
  │  ├ 1m-6m: (a calcular)                                 │
  │  └ <1m: (a calcular)                                   │
  │                                                         │
  │  TRACKING DIARIO (Q14)                                  │
  │  Ultimos 30 dias, actividad por estado                  │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │              FICHA DE TRAZABILIDAD (Q30)                │
  │                                                         │
  │  Para cada reclamo:                                     │
  │  ├ Fecha, estado, reversion, destino                   │
  │  ├ Motivo, departamento                                 │
  │  ├ Cancelacion, fidelizacion, datos bancarios           │
  │  ├ Empresa, sucursal                                    │
  │  ├ Contrato (numero, estado, tipo, plan)               │
  │  ├ Cliente (nombre, documento)                         │
  │  ├ Creador (nombre, apellido, id)                      │
  │  └ Fidelizador (nombre, apellido)                      │
  └─────────────────────────────────────────────────────────┘
```

---

## 5. Mapa de Queries → Componentes del Tablero

```
  TABLERO HTML                    QUERIES QUE LO ALIMENTAN
  ─────────────────────────────────────────────────────────────
  Header + KPIs                   Q1 (KPIs generales)
  Tarjetas de pendientes           Q11 (pendientes por antiguedad)

  Grafico de torta Estados         Q2 (distribucion por estado)
  Grafico de torta Departamentos   Q3 (distribucion por depto)
  Grafico de torta Empresas        Q15 (reclamos por empresa)
  Grafico de torta Sucursales      Q16 (reclamos por sucursal)
  Grafico de torta Destinos        Q12 (destino del reclamo)
  Grafico de torta Reversion       Q26 (estado de reversion)
  Grafico de torta Cancelacion     Q8 (cancelacion de contrato)
  Grafico de torta Tipo Contrato   Q18 (cobrador vs debito)
  Grafico de torta Tipo Plan       Q19 (individual/familiar)
  Grafico de torta Estado Contrato Q17 (estado del contrato)

  Serie temporal mensual           Q5 (evolucion mensual historica)
  Serie temporal anual             Q6 (evolucion anual)
  Serie temporal por depto         Q7 (mensual por depto 2025+)
  Serie temporal por empresa       Q22 (mensual por empresa 2025+)
  Serie temporal reversion         Q28 (reversion por anio)

  Barra horizontal Top Motivos     Q4 (top 20 motivos)
  Barra horizontal Top Creadores   Q23 (top creadores)
  Barra horizontal Top Fideli.     Q24 (top fidelizadores)

  Tabla cruzada Emp x Depto       Q20 (empresa x departamento)
  Tabla cruzada Emp x Sucursal     Q21 (empresa x sucursal)
  Tabla cruzada Destino x Estado   Q29 (flujo de derivacion)
  Tabla cruzada Motivo x Estado    Q13 (motivo x estado)

  Tabla detalle de reclamos        Q30 (ficha de trazabilidad)
  Tabla tracking diario            Q14 (tracking ult 30 dias)

  Grafico de area cancelacion      Q9 (cancelacion por anio)
  KPI fidelizacion por anio        (calculado de Q6 + loyalty)
```

---

## 6. Mapa de Reglas de Negocio (Resumen)

```
  REGLAS CRITICAS
  ─────────────────────────────────────────────────────────────

  FILTRO BASE:
  ├ deleted_at IS NULL (tablero general)
  ├ status < 20 (reportes operativos, incluye Cancelado=15)
  └ status < 15 (recovery trackings, excluye Cancelado+Eliminado)

  CREACION:
  ├ date = hoy (automatico)
  ├ complaint_destiny = 30 (FIDELIZACION-OTROS)
  ├ status = 1 (Nuevo)
  ├ si motive=15 -> double_debit_correspond OBLIGATORIO
  │   ├ valor=1 -> reversion=1 (Pendiente)
  │   ├ valor=2 -> reversion=20 (Rechazado)
  │   └ valor=0 -> reversion=null
  └ client_id = contract.account_holder_id (si hay contract_id)

  TRACKING:
  ├ status 1 -> 3 (Remitido)
  ├ status 3 -> 5 (En Proceso)
  ├ close=1 -> status=10 (Terminado)
  ├ resolved=1 -> destiny=30, status=8 (Resuelto)
  ├ loyalty=1 -> registra loyal_user_id + loyal_date
  └ reversion=5 -> destiny=25 (TESORERIA) + datos bancarios

  VALIDACIONES (no se puede resolver si):
  ├ destiny=15 o 25 sin contract_cancelation
  ├ reversion=1 sin marcar reversion
  ├ reversion=5 sin success_reversion
  ├ status=1 sin complaint_destiny
  └ reversion=5 sin datos bancarios (bank, account, amount, doc)

  ELIMINACION:
  └ status=20 + deleted_user_id + deleted_motive + deleted_at

  MOTIVOS ESPECIALES:
  ├ 15 (DOBLE DEBITO) -> double_debit obligatorio
  ├ 61 (ACUERDO SUSPENCION) -> oculto sin roles especificos
  ├ 63 (PEDIDO INFO) -> fallback Infobip, busca por client_id
  ├ 64 (OTROS) -> fallback Chatbot
  └ 65 (SIN MOTIVO) -> fallback Infobip

  PERMISOS:
  ├ complaints.own-complaints -> ve solo los suyos
  ├ complaints.close -> ve todos
  └ complaint_destiny -> ve solo su destino
```

---

## 7. Mapa de Medidas y KPIs

### Medidas de Volumen (Conteos)

```
  MEDIDAS DE VOLUMEN
  ─────────────────────────────────────────────────────────────

  VOLUMEN PRINCIPAL
  ├ Total Reclamos ................ 79,494
  ├ Reclamos Abiertos ............. 4,263  (Nuevo+Remitido+EnProceso+Resuelto)
  ├ Reclamos Pendientes (Nuevo) ... 3,294
  ├ Reclamos Terminados ........... 74,833  (94.1%)
  ├ Reclamos Resueltos ............ 288
  ├ Reclamos Remitidos ............ 614
  ├ Reclamos En Proceso ........... 67
  └ Reclamos Eliminados ........... 398  (soft delete)

  ALCANCE
  ├ Clientes afectados ........... 39,653
  ├ Contratos afectados .......... 47,904
  ├ Motivos distintos usados ..... 82
  ├ Creadores distintos .......... 347
  ├ Destinos distintos ........... 8
  ├ Departamentos distintos ....... 8 (incluye null)

  TRACKINGS (seguimientos)
  ├ Reclamos con tracking ......... 73,976  (93%)
  ├ Reclamos sin tracking ......... 5,518  (7%)
  ├ Total trackings .............. 220,463
  └ Trackings por reclamo (avg) .. 2.98
```

### Medidas de Tiempo

```
  MEDIDAS DE TIEMPO
  ─────────────────────────────────────────────────────────────

  TIEMPO DE CIERRE (reclamos Terminados)
  ├ Promedio (desde fecha reclamo) .. 13.8 dias
  ├ Promedio (desde created_at) .... 13.3 dias
  ├ Minimo ........................ 0 dias
  ├ Maximo ........................ 908 dias
  └ (varia mucho por anio, ver tabla abajo)

  TIEMPO DE CIERRE POR ANIO
  ├ 2018: 78.7 dias
  ├ 2019: 45.1 dias
  ├ 2020:  3.1 dias  ← mas rapido (pandemia?)
  ├ 2021:  1.4 dias  ← mas rapido
  ├ 2022: 10.4 dias
  ├ 2023: 28.7 dias
  ├ 2024: 35.2 dias  ← mas lento (excluyendo 2018)
  ├ 2025:  5.4 dias
  └ 2026:  1.2 dias  ← mas rapido reciente

  ANTIGUEDAD DE PENDIENTES (status=Nuevo, 3,294 total)
  ├ Promedio dias pendiente ....... 377.1 dias  (!)
  ├ Pendientes > 1 ano ............ 1,541  (46.7%)
  ├ Pendientes 6m-12m .............. 897  (27.2%)
  ├ Pendientes 1m-6m .............. 735  (22.3%)
  └ Pendientes < 1m ............... 134  (4.1%)
```

### Medidas de Conversion / Tasas

```
  MEDIDAS DE CONVERSION
  ─────────────────────────────────────────────────────────────

  TASA DE CIERRE
  ├ Terminados / Total ............ 94.14%
  └ Abiertos / Total .............. 5.36%

  TASA DE FIDELIZACION
  ├ Fidelizados / Total ........... 7.94%
  ├ Fidelizados / Terminados ...... 8.43%
  └ Por anio:
     ├ 2021: 6.27%
     ├ 2022: 6.18%
     ├ 2023: 12.74%  ← pico
     ├ 2024: 13.39%  ← pico
     ├ 2025: 10.73%
     └ 2026: 11.96%

  TASA DE CANCELACION (solicita cancelacion)
  ├ Solicita / Total ............. 24.05%  (19,119)
  ├ No Solicita / Total .......... 22.83%  (18,146)
  ├ Sin Info / Total ............. 53.12%  (42,229)
  └ Por anio:
     ├ 2018: 0.16%
     ├ 2019: 4.09%
     ├ 2020: 3.77%
     ├ 2021: 10.69%
     ├ 2022: 34.08%  ← salto
     ├ 2023: 57.11%  ← pico
     ├ 2024: 35.17%
     ├ 2025: 19.60%
     └ 2026: 16.00%

  TASA DE REVERSION (doble debito)
  ├ Corresponde / Total .......... 1.44%  (1,145)
  ├ Revertidos ................... 457  (0.58% del total)
  ├ Rechazados ................... 1,237 (1.56%)
  └ Pendientes ................... 308  (0.39%)
```

### Medidas por Empresa (Unidad de Negocio)

```
  MEDIDAS POR EMPRESA
  ─────────────────────────────────────────────────────────────

  EMPRESA    RECLAMOS    %        CONTRATOS   CLIENTES
  ─────────────────────────────────────────────────────
  ODO        48,497     61.0%    ~30,000     ~25,000
  MEE        25,608     32.2%    ~16,000     ~13,000
  MPP         5,105      6.4%    ~3,200      ~2,800
  TAP           139      0.2%
  MEP            19      0.0%
  EME             9      0.0%
  Resto          13      0.0%
```

### Medidas por Sucursal

```
  MEDIDAS POR SUCURSAL
  ─────────────────────────────────────────────────────────────

  SUCURSAL                  RECLAMOS    %
  ──────────────────────────────────────
  Matriz Mcal Lopez         17,255    21.7%
  Matriz Brasilia           14,542    18.3%
  Nemby                     11,728    14.8%
  San Lorenzo               10,850    13.7%
  Encarnacion                8,882    11.2%
  Ciudad del Este            7,819     9.8%
  Mariano Roque Alonso       4,723     5.9%
  Luque                      2,906     3.7%
  Resto                        584     0.7%
```

### Medidas por Estado de Contrato

```
  MEDIDAS POR ESTADO DE CONTRATO
  ─────────────────────────────────────────────────────────────

  ESTADO                  RECLAMOS    %
  ──────────────────────────────────────
  Contrato Culminado       59,461    74.9%
  Contrato Confirmado       19,599    24.7%
  Contrato Borrado             219     0.3%
  Resto                         104     0.1%
```

### Medidas por Tipo de Contrato y Plan

```
  MEDIDAS POR TIPO DE CONTRATO Y PLAN
  ─────────────────────────────────────────────────────────────

  TIPO CONTRATO    RECLAMOS    %         TIPO PLAN     RECLAMOS    %
  ──────────────────────────────────    ──────────────────────────
  Cobrador         49,285    62.1%     Individual   56,700    71.5%
  Debito           30,107    37.9%     Familiar     22,531    28.4%
                              Pareja          159     0.2%
                              Corporativo       2     0.0%
```

### Medidas de Evolucion Mensual (2025-2026)

```
  MEDIDAS DE VOLUMEN MENSUAL (2025-2026)
  ─────────────────────────────────────────────────────────────

  ANIO-MES    TOTAL   NUEVO  REMITIDO  PROCESO  RESUELTO  TERMINADO
  ────────────────────────────────────────────────────────────────
  2026-06       428      75       14        0        16        323
  2026-05       944      97       14        1        26        806
  2026-04     1,100     127       21        1        17        934
  2026-03       991     144        9        0        12        826
  2026-02     1,156     130       25        3        25        973
  2026-01     1,531     250       25        2        14      1,240
  2025-12       984     125       23        1        12        823
  2025-11       996     117       26        1        13        839
  2025-10     1,266     173       28        2         8      1,055
  2025-09     1,198     176       22        1         8        991
  2025-08     1,152     129       25        0        12        986
  2025-07     1,175     151       17        2         6        999
  2025-06       959      97       11        1         3        847
  2025-05     1,120      96       16        0         3      1,005
  2025-04     1,125      97       12        1         4      1,011
  2025-03     1,234     109       18        0        10      1,097
  2025-02     1,219     113       22        1         8      1,075
  2025-01     1,386     110       13        1         9      1,253
  ────────────────────────────────────────────────────────────────
  Promedio mensual 2025: ~1,091
  Promedio mensual 2026: ~1,025 (en curso)
```

### Medidas Calculables (Derivadas)

```
  MEDIDAS DERIVADAS CALCULABLES
  ─────────────────────────────────────────────────────────────

  TASA DE RESOLUCION
  ├ (Resueltos + Terminados) / Total
  ├ = (288 + 74,833) / 79,494 = 94.50%

  TASA DE ABANDONO / PENDIENTE
  ├ (Nuevo + Remitido + En Proceso) / Total
  ├ = (3,294 + 614 + 67) / 79,494 = 5.01%

  TASA DE FIDELIZACION EFECTIVA
  ├ Fidelizados / (Terminados + Resueltos)
  ├ = 6,313 / 75,121 = 8.40%

  TASA DE CANCELACION EFECTIVA
  ├ Solicita Cancelacion / Total con info
  ├ = 19,119 / (19,119 + 18,146) = 51.30%
  └ (excluyendo los 42,229 sin info)

  RATIO TRACKINGS/RECLAMO
  ├ 220,463 / 73,976 = 2.98 trackings por reclamo con seguimiento

  COBERTURA DE TRACKING
  ├ 73,976 / 79,494 = 93.06% reclamos con al menos un tracking

  DIAS PROMEDIO DE CIERRE POR ANIO (tendencia)
  ├ 2020-2021: ~2 dias (cierre casi inmediato)
  ├ 2022-2023: ~20 dias (empeora)
  ├ 2024: 35 dias (pico de demora)
  ├ 2025: 5 dias (mejora)
  └ 2026: 1 dia (cierre rapido)

  % RECLAMOS POR EMPRESA (concentracion)
  ├ ODO+MEE = 93.2% (alta concentracion)
  └ MPP = 6.4%

  % RECLAMOS POR SUCURSAL TOP 3
  ├ Mcal Lopez + Brasilia + Nemby = 54.8%

  RECLAMOS POR CLIENTE
  ├ 79,494 / 39,653 = 2.00 reclamos por cliente en promedio

  RECLAMOS POR CONTRATO
  ├ 79,494 / 47,904 = 1.66 reclamos por contrato en promedio
```
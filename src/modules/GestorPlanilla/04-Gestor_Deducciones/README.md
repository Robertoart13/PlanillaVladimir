# Módulo REBAJO A COMPENSACIÓN

## Descripción General

El módulo **REBAJO A COMPENSACIÓN** es un sistema integral para la gestión de deducciones salariales en el contexto de la legislación laboral costarricense. Permite calcular automáticamente los montos de rebajo según las fórmulas establecidas por la ley, garantizando precisión y cumplimiento legal.

## Características Principales

### 🔧 Cálculo Automático
- **Fórmulas Legales**: Implementa las fórmulas estándar de la legislación laboral costarricense
- **Tipos de Jornada**: Soporta jornadas mensuales, quincenales, semanales y diarias
- **Validación Automática**: Verifica que los datos ingresados cumplan con los requisitos legales

### 📊 Tipos de Rebajo Soportados

#### Rebajos con Fórmula Automática

1. **Horas no laboradas**
   - Campo requerido: Horas
   - Fórmula: `(Salario / Horas según jornada) × Horas no trabajadas`

2. **Retardos (llegadas tardías)**
   - Campo requerido: Horas
   - Fórmula: `(Salario / Horas según jornada) × Horas de retardo`

3. **Ausencias injustificadas**
   - Campo requerido: Días
   - Fórmula: `(Salario / Días según jornada) × Días de ausencia`

4. **Permisos no remunerados**
   - Campo requerido: Días
   - Fórmula: `(Salario / Días según jornada) × Días de permiso`

5. **Incapacidades no autorizadas**
   - Campo requerido: Días
   - Fórmula: `(Salario / Días según jornada) × Días de incapacidad`

6. **Suspensión disciplinaria**
   - Campo requerido: Días
   - Fórmula: `(Salario / Días según jornada) × Días de suspensión`

7. **Licencias sin goce de salario**
   - Campo requerido: Días
   - Fórmula: `(Salario / Días según jornada) × Días de licencia`

8. **Días no trabajados en periodo parcial**
   - Campo requerido: Días
   - Fórmula: `(Salario / Días según jornada) × Días no trabajados`

9. **Faltas reiteradas**
   - Campo requerido: Días
   - Fórmula: `(Salario / Días según jornada) × Días de faltas`

#### Rebajos con Monto Fijo

10. **Descuentos judiciales (embargos)**
    - Campo requerido: Monto fijo
    - Cálculo: Monto especificado directamente

11. **Anticipos o préstamos**
    - Campo requerido: Monto fijo
    - Cálculo: Monto especificado directamente

12. **Devolución de equipo o materiales**
    - Campo requerido: Monto fijo
    - Cálculo: Monto especificado directamente

13. **Errores o pérdidas ocasionadas**
    - Campo requerido: Monto fijo
    - Cálculo: Monto especificado directamente

### 🎯 Aplica a Compensación Anual

El sistema incluye un campo especial `aplica_compensacion_anual` que permite indicar si un rebajo específico debe ser considerado en el cálculo de la compensación anual del empleado.

#### Propósito
- **Identificación**: Marca rebajos que afectan el cálculo anual de compensaciones
- **Filtrado**: Permite filtrar rebajos que aplican al cálculo anual vs. los que no
- **Auditoría**: Facilita la revisión de rebajos que impactan la compensación anual

#### Uso
- **Checkbox en formularios**: Los usuarios pueden marcar/desmarcar esta opción
- **Visualización en lista**: Se muestra claramente con badges "Sí/No"
- **Filtrado**: Permite buscar rebajos que aplican o no a compensación anual

#### Casos de Uso
- **Rebajos temporales**: No aplican a compensación anual
- **Rebajos permanentes**: Sí aplican a compensación anual
- **Descuentos judiciales**: Generalmente aplican a compensación anual
- **Anticipos**: Pueden o no aplicar según política de la empresa

## Fórmulas de Cálculo

### Divisores por Tipo de Jornada

```javascript
const divisores = {
   mensual: { horas: 240, dias: 30 },
   quincenal: { horas: 120, dias: 15 },
   semanal: { horas: 48, dias: 6 },
   diario: { horas: 8, dias: 1 }
};
```

### Ejemplos de Cálculo

#### Ejemplo 1: Horas no laboradas
- **Salario**: ₡500,000
- **Tipo de jornada**: Mensual
- **Horas no trabajadas**: 8 horas
- **Cálculo**: (₡500,000 ÷ 240) × 8 = ₡16,666.67

#### Ejemplo 2: Ausencias injustificadas
- **Salario**: ₡500,000
- **Tipo de jornada**: Mensual
- **Días de ausencia**: 2 días
- **Cálculo**: (₡500,000 ÷ 30) × 2 = ₡33,333.33

## Estructura de la Base de Datos

### Tabla: `gestor_rebajo_compensacion_tbl`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_rebajo_compensacion` | INT | Clave primaria, autoincremental |
| `empresa_id_rebajo` | INT | ID de la empresa (FK a empresas_tbl) |
| `planilla_id_rebajo` | INT | ID de la planilla (FK a planilla_tbl) |
| `empleado_id_rebajo` | INT | ID del empleado (FK a gestor_empleado_tbl) |
| `tipo_rebajo` | VARCHAR(50) | Tipo de rebajo (ej: 'horas_no_laboradas') |
| `tipo_jornada_laboral` | VARCHAR(20) | Tipo de jornada (mensual, quincenal, etc.) |
| `horas_rebajadas` | DECIMAL(10,2) | Horas rebajadas (si aplica) |
| `dias_rebajados` | DECIMAL(10,2) | Días rebajados (si aplica) |
| `monto_fijo_rebajo` | DECIMAL(12,2) | Monto fijo (si aplica) |
| `salario_actual` | DECIMAL(12,2) | Salario actual del empleado |
| `monto_rebajo_calculado` | DECIMAL(12,2) | Monto calculado automáticamente |
| `motivo_rebajo` | TEXT | Motivo del rebajo (opcional) |
| `fecha_rebajo` | DATE | Fecha del rebajo |
| `aplica_compensacion_anual` | TINYINT(1) | Indica si aplica al cálculo de compensación anual |
| `estado_rebajo` | VARCHAR(20) | Estado del rebajo (Pendiente, Activo, etc.) |
| `usuario_id_rebajo` | INT | ID del usuario que creó el registro |
| `fecha_creacion` | TIMESTAMP | Fecha de creación del registro |
| `fecha_actualizacion` | TIMESTAMP | Fecha de última actualización |

## API Endpoints

### 1. Crear Rebajo a Compensación
- **URL**: `POST /gestor/planilla/deducciones/crear`
- **Descripción**: Crea un nuevo registro de rebajo a compensación
- **Parámetros requeridos**:
  - `planilla`: ID de la planilla
  - `empleado`: ID del empleado
  - `tipo_rebajo`: Tipo de rebajo
  - `salario_actual`: Salario actual del empleado
  - `fecha_rebajo`: Fecha del rebajo
  - `aplica_compensacion_anual`: Boolean (opcional, default: false)
  - Campos específicos según el tipo de rebajo

### 2. Editar Rebajo a Compensación
- **URL**: `
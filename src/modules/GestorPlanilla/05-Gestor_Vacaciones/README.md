# Módulo Gestor de Vacaciones

Este módulo proporciona las funcionalidades necesarias para gestionar los registros de vacaciones de los empleados en el sistema.

## Archivos del Módulo

### 1. Gestor_Vacaciones_Crear.js
- **Propósito**: Crear nuevos registros de vacaciones
- **Endpoint**: `POST /gestor/vacaciones/crear`
- **Funcionalidad**: 
  - Valida los datos de entrada
  - Crea un nuevo registro en la tabla `gestor_vacaciones_tbl`
  - Establece el estado como 'Aprobado' (automático)
  - Retorna el ID del registro creado

### 2. Gestor_Vacaciones_Editar.js
- **Propósito**: Actualizar registros de vacaciones existentes
- **Endpoint**: `PUT /gestor/vacaciones/editar`
- **Funcionalidad**:
  - Valida los datos de entrada
  - Actualiza el registro existente en la base de datos
  - Permite modificar todos los campos excepto el ID
  - Retorna confirmación de la actualización

### 3. Gestor_Vacaciones_Lista.js
- **Propósito**: Listar y consultar registros de vacaciones
- **Endpoints**: 
  - `GET /gestor/vacaciones/lista` - Lista completa con filtros
  - `GET /gestor/vacaciones/obtener` - Obtener registro específico por ID
- **Funcionalidad**:
  - Lista todos los registros de vacaciones de la empresa
  - Permite filtrar por estado
  - Incluye información de empresa, planilla, empleado y usuario creador
  - Ordena por fecha de creación descendente

## Estructura de la Base de Datos

### Tabla: `gestor_vacaciones_tbl`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_vacacion_vacaciones_gestor` | INT(11) UNSIGNED | ID único del registro (AUTO_INCREMENT) |
| `empresa_id_vacaciones_gestor` | INT(10) UNSIGNED | ID de la empresa (FK) |
| `empleado_id_vacaciones_gestor` | INT(10) UNSIGNED | ID del empleado (FK) |
| `fecha_inicio_vacaciones_gestor` | DATE | Fecha de inicio de vacaciones |
| `dias_vacaciones_vacaciones_gestor` | DECIMAL(5,2) | Cantidad de días de vacaciones |
| `motivo_vacaciones_gestor` | TEXT | Motivo u observaciones |
| `estado_vacaciones_gestor` | ENUM | Estado: 'Pendiente', 'Aprobado', 'Aplicado', 'Cancelado' |
| `activo_vacaciones_gestor` | TINYINT(1) | Estado lógico: 1=Activo, 0=Inactivo |
| `usuario_id_vacaciones_gestor` | INT(11) | Usuario que registró |
| `fecha_creacion_vacaciones_gestor` | TIMESTAMP | Fecha de creación |
| `fecha_modificacion_vacaciones_gestor` | TIMESTAMP | Fecha de última modificación |

## Estados de Vacaciones

- **Aprobado**: Estado único para todas las vacaciones (automático)

## Validaciones

### Crear Vacaciones
- Empleado obligatorio
- Fecha de inicio obligatoria
- Días de vacaciones obligatorio y mayor a 0
- Motivo opcional
- Estado siempre "Aprobado" (automático)

### Editar Vacaciones
- ID del registro obligatorio
- Empleado, fecha de inicio, días y motivo editables
- Estado siempre "Aprobado" (no editable)
- Validación de existencia del registro

## Relaciones

- **Empresa**: `empresa_id_vacaciones_gestor` → `empresas_tbl.id_empresa`
- **Empleado**: `empleado_id_vacaciones_gestor` → `gestor_empleado_tbl.id_empleado_gestor`
- **Usuario**: `usuario_id_vacaciones_gestor` → `usuarios_tbl.id_usuario`

## Uso del Frontend

El componente `CrearVacaciones.jsx` utiliza este módulo para:
- Cargar empleados disponibles
- Crear registros de vacaciones
- Validar datos antes del envío
- Mostrar confirmaciones y errores

## Seguridad

- Validación de permisos de usuario
- Validación de pertenencia a empresa
- Consultas preparadas para prevenir SQL injection
- Manejo estructurado de errores 
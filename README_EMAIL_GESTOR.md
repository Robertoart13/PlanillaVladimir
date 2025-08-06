# Sistema de Envío de Correos - Gestor de Compensaciones

## Descripción

Este módulo implementa un sistema automatizado para enviar correos electrónicos a empleados con los detalles de su compensación. El sistema procesa planillas procesadas y envía correos personalizados a cada empleado con un desglose detallado de sus aumentos, rebajos, horas extras y compensaciones por métrica.

## Características

- ✅ **Envío automático**: Procesa planillas procesadas automáticamente
- ✅ **Plantilla personalizada**: Email HTML con diseño profesional
- ✅ **Formato de moneda**: Soporte para colones (CRC) y dólares (USD)
- ✅ **Validación de emails**: Verifica formato de email antes del envío
- ✅ **Logging detallado**: Registro completo de envíos y errores
- ✅ **Manejo de errores**: Gestión robusta de errores de envío

## Configuración

### Configuración del Servidor SMTP

El sistema está configurado para usar Hostinger SMTP:

```javascript
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true, // SSL
        auth: {
            user: 'info@gt3cr.com',
            pass: 'Locos2023@joal'
        }
    });
};
```

### Dependencias

Asegúrate de tener instaladas las siguientes dependencias:

```bash
npm install nodemailer node-cron mysql2
```

## Uso

### 1. Iniciar el Sistema Automático

El sistema se ejecuta automáticamente cada 10 segundos para procesar planillas:

```javascript
import { iniciarCronJob } from './src/modules/enviarCorreoGestor/enviarCorreoGestor.js';

// Iniciar el cron job
iniciarCronJob();
```

### 2. Probar el Sistema

Para probar el sistema de correos:

```bash
# Probar con un email específico
node test-email-gestor.js tu-email@ejemplo.com
```

### 3. Funcionamiento Automático

El sistema:

1. **Busca planillas procesadas** en la base de datos
2. **Obtiene empleados** de cada planilla
3. **Recopila datos adicionales**:
   - Aumentos (`gestor_aumento_tbl`)
   - Rebajos (`gestor_rebajo_compensacion_tbl`)
   - Horas extras (`gestor_compensacion_extra_tbl`)
   - Compensación por métrica (`gestor_compensacion_metrica_tbl`)
4. **Envía correos** a cada empleado con sus datos
5. **Registra resultados** en consola

## Estructura del Email

### Encabezado
- Título: "Detalles del Empleado"
- Información básica del empleado

### Sección de Detalles del Empleado
- **Panel Izquierdo**:
  - Código del empleado
  - Cédula
  - Compensación normal

- **Panel Derecho**:
  - Referencia de la planilla
  - Nombre completo
  - Puesto
  - Tipo de compensación

### Tabla de Compensaciones
| CATEGORÍA | TIPO DE ACCIÓN | MONTO | TIPO (+/-) |
|-----------|----------------|-------|------------|
| Compensación Anual | Aumento | ₡150,000.00 | + |
| Compensación Extra | Ingreso | ₡0.08 | + |
| Compensación por Métrica | Ingreso | ₡12,222.00 | + |
| Rebajo a Compensación | Deducción | ₡0.40 | - |

## Formato de Moneda

### Colones (CRC)
```javascript
formatCurrency(150000, 'colones')
// Resultado: ₡150,000.00
```

### Dólares (USD)
```javascript
formatCurrency(150000, 'dolares')
// Resultado: $150,000.00
```

## Logs del Sistema

### Ejemplo de Logs Exitosos
```
📧 Preparando correo para: Roberto socio nuevo
   - Correo: carlosroart13@gmail.com
   - Planilla: PLC-GT3-Mens-20250805-AUU100
   - Aumentos: 1
   - Rebajos: 1
   - Horas Extras: 1
   - Compensación Métrica: 1
📤 Enviando correo...
✅ Correo enviado exitosamente. Message ID: <abc123@hostinger.com>
```

### Ejemplo de Logs de Error
```
❌ Error enviando correo a Juan Pérez: Email inválido: juan.perez
⚠️ Empleado María García no tiene correo configurado
```

## Base de Datos

### Tablas Principales

1. **`gestor_empleado_tbl`**: Datos de empleados
2. **`gestor_aumento_tbl`**: Aumentos de compensación
3. **`gestor_rebajo_compensacion_tbl`**: Rebajos/deducciones
4. **`gestor_compensacion_extra_tbl`**: Horas extras
5. **`gestor_compensacion_metrica_tbl`**: Compensación por métrica
6. **`planilla_tbl`**: Planillas procesadas

### Consultas Principales

```sql
-- Empleados de una empresa
SELECT * FROM gestor_empleado_tbl 
WHERE empresa_id = ? AND moneda_pago_empleado_gestor = ? 
AND tipo_planilla_empleado_gestor = ?

-- Aumentos procesados
SELECT * FROM gestor_aumento_tbl 
WHERE planilla_id_aumento_gestor = ? 
AND estado_planilla_aumento_gestor = "Procesada"

-- Planillas procesadas
SELECT * FROM planilla_tbl 
WHERE planilla_estado = "Procesada"
```

## Manejo de Errores

### Errores Comunes

1. **Email inválido**: El empleado no tiene email configurado o formato incorrecto
2. **Error de SMTP**: Problemas de conexión con el servidor de correo
3. **Timeout**: Consultas de base de datos que tardan demasiado
4. **Datos faltantes**: Empleados sin datos de compensación

### Estrategias de Recuperación

- **Reintentos automáticos**: El sistema continúa con el siguiente empleado
- **Logging detallado**: Registro completo para debugging
- **Validación previa**: Verificación de datos antes del envío
- **Manejo de timeouts**: Límites de tiempo para consultas

## Personalización

### Modificar Plantilla de Email

Para cambiar el diseño del email, edita la función `generateGestorEmailTemplate()`:

```javascript
const generateGestorEmailTemplate = (empleado, planilla, aumentos, rebajos, horasExtras, compensacionMetrica) => {
    // Tu HTML personalizado aquí
    return `<!DOCTYPE html>...`;
};
```

### Agregar Nuevos Tipos de Compensación

1. Agregar la consulta en `QUERIES`
2. Procesar en `procesarDatosAdicionales()`
3. Incluir en el template de email

### Cambiar Configuración SMTP

Modifica la función `createTransporter()`:

```javascript
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: 'tu-servidor-smtp.com',
        port: 587,
        secure: false,
        auth: {
            user: 'tu-email@dominio.com',
            pass: 'tu-password'
        }
    });
};
```

## Seguridad

### Consideraciones de Seguridad

1. **Credenciales**: Las credenciales SMTP están hardcodeadas (considerar variables de entorno)
2. **Validación**: Validación de emails antes del envío
3. **Logs**: No registrar información sensible en logs
4. **Rate Limiting**: Considerar límites de envío del servidor SMTP

### Mejoras Recomendadas

1. **Variables de entorno**: Mover credenciales a `.env`
2. **Rate limiting**: Implementar límites de envío
3. **Encriptación**: Encriptar credenciales sensibles
4. **Auditoría**: Logs de auditoría para envíos

## Troubleshooting

### Problemas Comunes

1. **"Email inválido"**
   - Verificar que el empleado tenga email configurado
   - Verificar formato del email

2. **"Error de conexión SMTP"**
   - Verificar credenciales SMTP
   - Verificar conectividad de red
   - Verificar configuración del servidor

3. **"Timeout en consulta"**
   - Verificar rendimiento de la base de datos
   - Ajustar timeouts en `ejecutarConsultaConTimeout()`

4. **"No se encontraron planillas procesadas"**
   - Verificar que existan planillas con estado "Procesada"
   - Verificar filtros en la consulta

### Comandos de Debug

```bash
# Probar conexión SMTP
node test-email-gestor.js tu-email@ejemplo.com

# Ver logs en tiempo real
tail -f logs/app.log

# Verificar estado de planillas
SELECT * FROM planilla_tbl WHERE planilla_estado = "Procesada";
```

## Contribución

Para contribuir al sistema:

1. **Fork** el repositorio
2. **Crear** una rama para tu feature
3. **Implementar** cambios con tests
4. **Documentar** cambios en README
5. **Crear** Pull Request

## Licencia

Este proyecto está bajo la licencia ISC.

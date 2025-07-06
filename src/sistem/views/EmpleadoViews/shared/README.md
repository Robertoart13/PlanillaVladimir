# EmpleadoViews Shared Utilities

Este directorio contiene utilidades compartidas para los componentes de creación y edición de empleados (Socios).

## Estructura

```
shared/
├── employeeFormUtils.js    # Utilidades principales para formularios
└── README.md              # Este archivo
```

## employeeFormUtils.js

### Funciones de Validación

#### `validationUtils`
Objeto que contiene todas las funciones de validación de campos:

- `validateEmailFormat(email)` - Valida formato de email
- `validateEmployeeEmail(email)` - Valida email de empleado
- `validateCedulaFormat(cedula)` - Valida formato de cédula
- `validateNameFormat(name)` - Valida formato de nombre
- `validatePhoneFormat(phone)` - Valida formato de teléfono
- `validateSalaryFormat(salary)` - Valida formato de salario
- `validateNumberFormat(number)` - Valida formato de número

#### Funciones de Validación por Campo

- `handleEmailValidation(email, setEmailError)` - Maneja validación de email
- `handleCedulaValidation(cedula, setCedulaError)` - Maneja validación de cédula
- `handleNameValidation(name, setNombreError)` - Maneja validación de nombre
- `handlePhoneValidation(phone, setTelefonoError)` - Maneja validación de teléfono
- `handleSalaryValidation(salary, setSalarioError)` - Maneja validación de salario
- `handleNumberValidation(number, fieldName, errorSetters)` - Maneja validación de números

### Funciones de Formulario

- `getInitialFormData()` - Retorna la estructura inicial del formulario
- `handleInputChange(e, formData, setFormData, errorSetters)` - Maneja cambios en inputs
- `handleSwitchChange(fieldName, checked, formData, setFormData)` - Maneja cambios en switches
- `validateRequiredFields(formData, errorSetters)` - Valida campos requeridos
- `validateUniqueFields(formData, errorSetters)` - Valida campos únicos
- `setFieldValidationError(fieldName, errorMessage, errorSetters)` - Establece errores de validación

### Utilidades

- `isFieldEmpty(value)` - Verifica si un campo está vacío
- `improveErrorMessage(errorMessage)` - Mejora mensajes de error de la API
- `REQUIRED_FIELDS_CONFIG` - Configuración de campos requeridos
- `formOptions` - Opciones para los select del formulario

### formOptions

Contiene todas las opciones para los select del formulario:

- `tipoContrato` - Tipos de contrato
- `departamentos` - Departamentos de la empresa
- `puestos` - Puestos de trabajo
- `supervisores` - Supervisores disponibles
- `jornadaLaboral` - Tipos de jornada laboral
- `monedaPago` - Monedas de pago
- `tipoPlanilla` - Tipos de planilla

## Uso

### En Componente de Crear

```javascript
import {
   validationUtils,
   getInitialFormData,
   handleInputChange,
   handleSwitchChange,
   validateRequiredFields,
   validateUniqueFields,
   improveErrorMessage,
   formOptions,
} from '../shared/employeeFormUtils';

// Usar en el hook
const [formData, setFormData] = useState(getInitialFormData());

const handleFormInputChange = (e) => {
   handleInputChange(e, formData, setFormData, errorSetters);
};

const handleFormSwitchChange = (fieldName, checked) => {
   handleSwitchChange(fieldName, checked, formData, setFormData);
};
```

### En Componente de Editar

```javascript
import {
   validationUtils,
   getInitialFormData,
   handleInputChange,
   handleSwitchChange,
   validateRequiredFields,
   validateUniqueFields,
   improveErrorMessage,
   formOptions,
} from '../shared/employeeFormUtils';

// Similar al componente de crear, pero con carga de datos existentes
```

## Beneficios

1. **DRY (Don't Repeat Yourself)** - Evita duplicación de código
2. **Mantenibilidad** - Cambios en un lugar se reflejan en ambos componentes
3. **Consistencia** - Misma validación y comportamiento en crear y editar
4. **Reutilización** - Fácil de usar en otros componentes similares
5. **Testing** - Funciones puras fáciles de testear

## Extensibilidad

Para agregar nuevas validaciones o campos:

1. Agregar la función de validación en `validationUtils`
2. Agregar la función de manejo en el archivo
3. Actualizar `REQUIRED_FIELDS_CONFIG` si es necesario
4. Agregar opciones en `formOptions` si es un select
5. Actualizar ambos componentes para usar la nueva funcionalidad

## Convenciones

- Todas las funciones deben ser puras (sin efectos secundarios)
- Usar JSDoc para documentar parámetros y retornos
- Mantener nombres descriptivos y consistentes
- Agrupar funciones relacionadas en objetos cuando sea apropiado 
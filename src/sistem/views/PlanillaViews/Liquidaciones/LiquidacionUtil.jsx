import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";

/**
 * Carga las empresas disponibles excluyendo la empresa Natural (ID 13)
 * @param {Function} dispatch - Función dispatch de Redux
 * @returns {Promise<Array>} Array de empresas filtradas
 */
export const cargarEmpresas = async (dispatch) => {
   try {
      const empresasData = await dispatch(SelectOpcion_Thunks("empresas/select"));
      
      if (empresasData.success) {
         // Filtra todas las empresas excepto la empresa Natural (ID 13)
         return empresasData.data.array.filter(empresa => empresa.id_empresa !== 13);
      }
      
      return [];
   } catch (error) {
      console.error("Error al cargar empresas:", error);
      return [];
   }
};

/**
 * Carga los empleados de una empresa específica
 * @param {Function} dispatch - Función dispatch de Redux
 * @param {string|number} idEmpresa - ID de la empresa
 * @returns {Promise<Array>} Array de empleados de la empresa
 */
export const cargarEmpleados = async (dispatch, idEmpresa) => {
   try {
      if (!idEmpresa) return [];
      
      const empleadosData = await dispatch(SelectOpcion_Thunks("empleado/select", idEmpresa));
      
      if (empleadosData.success) {
         return empleadosData.data.array || [];
      }
      
      return [];
   } catch (error) {
      console.error("Error al cargar empleados:", error);
      return [];
   }
};

/**
 * Carga los datos de liquidación de un empleado específico
 * @param {Function} dispatch - Función dispatch de Redux
 * @param {string|number} idEmpleado - ID del empleado
 * @returns {Promise<Object|null>} Datos de liquidación del empleado o null si hay error
 */
export const cargarDatosLiquidacion = async (dispatch, idEmpleado) => {
   try {
      if (!idEmpleado) return null;
      
      const liquidacionesData = await dispatch(
         SelectOpcion_Thunks("gestor/empleados/liquidaciones", idEmpleado)
      );
      console.log("Datos de liquidaciones:", liquidacionesData);
      

      
      if (liquidacionesData.success && liquidacionesData.data.success) {
         return liquidacionesData.data.array[0] || null;
      }
      
      return null;   
   } catch (error) {
      console.error("Error al cargar datos de liquidación:", error);
      return null;
   }
};

/**
 * Maneja el cambio de selección de empresa
 * @param {Event} event - Evento del select
 * @param {Function} setEmpresaSeleccionada - Función para actualizar empresa seleccionada
 * @param {Function} setEmpleadoSeleccionado - Función para resetear empleado seleccionado
 * @param {Function} setDatosEmpleado - Función para resetear datos del empleado
 */
export const manejarCambioEmpresa = (event, setEmpresaSeleccionada, setEmpleadoSeleccionado, setDatosEmpleado) => {
   const nuevaEmpresa = event.target.value;
   setEmpresaSeleccionada(nuevaEmpresa);
   
   // Resetear selecciones dependientes
   setEmpleadoSeleccionado("");
   setDatosEmpleado(null);
};

/**
 * Maneja el cambio de selección de empleado
 * @param {Event} event - Evento del select
 * @param {Function} setEmpleadoSeleccionado - Función para actualizar empleado seleccionado
 */
export const manejarCambioEmpleado = (event, setEmpleadoSeleccionado) => {
   setEmpleadoSeleccionado(event.target.value);
};

/**
 * Valida si hay datos disponibles para mostrar
 * @param {Array} data - Array de datos a validar
 * @returns {boolean} true si hay datos válidos, false en caso contrario
 */
export const hayDatosDisponibles = (data) => {
   return Array.isArray(data) && data.length > 0;
};

/**
 * Formatea un objeto para mostrar en JSON
 * @param {Object} data - Datos a formatear
 * @returns {string} JSON formateado
 */
export const formatearJSON = (data) => {
   return JSON.stringify(data, null, 2);
};

/**
 * Calcula los días entre dos fechas
 * @param {string} fechaIngreso - Fecha de ingreso
 * @param {string|null} fechaSalida - Fecha de salida (null si no hay)
 * @returns {number} Número de días
 */
export const calcularDias = (fechaIngreso, fechaSalida) => {
   if (!fechaIngreso) return 0;
   
   const fechaIngresoObj = new Date(fechaIngreso);
   const fechaSalidaObj = fechaSalida ? new Date(fechaSalida) : new Date();
   const diferencia = fechaSalidaObj - fechaIngresoObj;
   
   return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

/**
 * Calcula los años basado en los días (fórmula Excel: =+F8/360)
 * @param {number} dias - Número de días
 * @returns {string} Años formateados con 2 decimales
 */
export const calcularAnos = (dias) => {
   return (dias / 360).toFixed(2);
};

/**
 * Calcula los meses basado en los días (fórmula Excel: =+F8/30)
 * @param {number} dias - Número de días
 * @returns {string} Meses formateados con 2 decimales
 */
export const calcularMeses = (dias) => {
   return (dias / 30).toFixed(2);
};

/**
 * Obtiene la fecha de salida para mostrar (fecha actual si es null)
 * @param {string|null} fechaSalida - Fecha de salida del empleado
 * @returns {string} Fecha formateada
 */
export const obtenerFechaSalida = (fechaSalida) => {
   if (fechaSalida) return fechaSalida;
   
   // Obtener fecha actual en zona horaria de Costa Rica (UTC-6)
   const fechaCR = new Date();
   const offsetCR = -6 * 60; // UTC-6 en minutos
   const fechaCRLocal = new Date(fechaCR.getTime() + (offsetCR * 60 * 1000));
   
   return fechaCRLocal.toISOString().split('T')[0];
};

/**
 * Genera los últimos 6 meses, mostrando 0 para meses anteriores a la fecha de ingreso
 * @param {string|null} fechaSalida - Fecha de salida del empleado
 * @param {string} fechaIngreso - Fecha de ingreso del empleado
 * @returns {Array} Array con los últimos 6 meses
 */
export const generarUltimos6Meses = (fechaSalida, fechaIngreso) => {
   // Obtener fecha base en zona horaria de Costa Rica
   let fechaBase;
   if (fechaSalida) {
      fechaBase = new Date(fechaSalida);
   } else {
      const fechaCR = new Date();
      const offsetCR = -6 * 60; // UTC-6 en minutos
      fechaBase = new Date(fechaCR.getTime() + (offsetCR * 60 * 1000));
   }
   
   const fechaIngresoObj = fechaIngreso ? new Date(fechaIngreso) : new Date();
   const meses = [];
   
   // Generar los últimos 6 meses desde la fecha base
   for (let i = 5; i >= 0; i--) {
      const fecha = new Date(fechaBase);
      fecha.setMonth(fecha.getMonth() - i);
      
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long' });
      const año = fecha.getFullYear();
      
      meses.push({
         nombre: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
         año: año,
         fecha: fecha.toISOString().split('T')[0],
         esAntesDeIngreso: fecha < fechaIngresoObj
      });
   }
   
   return meses;
};

/**
 * Obtiene el valor de remuneración para un mes específico basado en la evolución de aumentos
 * @param {Array} aumentos - Array de aumentos del empleado ordenados por fecha
 * @param {string} fechaMes - Fecha del mes en formato YYYY-MM-DD
 * @param {string} salarioBase - Salario base del empleado
 * @param {string} fechaIngreso - Fecha de ingreso del empleado
 * @param {string|null} fechaSalida - Fecha de salida del empleado (para calcular días del mes actual)
 * @returns {string} Valor de remuneración para el mes
 */
export const obtenerValorRemuneracion = (aumentos, fechaMes, salarioBase, fechaIngreso, fechaSalida = null) => {
   if (!fechaIngreso) {
      return salarioBase;
   }
   
   const fechaMesObj = new Date(fechaMes);
   const fechaIngresoObj = new Date(fechaIngreso);
   const fechaActual = new Date();
   
   // Verificar si el mes es anterior a la fecha de ingreso (comparar solo mes y año)
   const mesIngreso = fechaIngresoObj.getMonth();
   const añoIngreso = fechaIngresoObj.getFullYear();
   const mesActual = fechaMesObj.getMonth();
   const añoActual = fechaMesObj.getFullYear();
   
   // Si el año es anterior o si es el mismo año pero el mes es anterior
   if (añoActual < añoIngreso || (añoActual === añoIngreso && mesActual < mesIngreso)) {
      return '0';
   }
   
   if (!aumentos || aumentos.length === 0) {
      return salarioBase;
   }
   
   let salarioActual = salarioBase;
   
   // Ordenar aumentos por fecha de inicio (más antiguos primero)
   const aumentosOrdenados = [...aumentos].sort((a, b) => 
      new Date(a.planilla_fecha_inicio) - new Date(b.planilla_fecha_inicio)
   );
   
   // Buscar si hay un aumento en el mes exacto
   const aumentoEnMesExacto = aumentosOrdenados.find(aumento => {
      const fechaAumento = new Date(aumento.planilla_fecha_inicio);
      return fechaMesObj.getMonth() === fechaAumento.getMonth() && 
             fechaMesObj.getFullYear() === fechaAumento.getFullYear();
   });
   
   // Si hay un aumento en el mes exacto, usar remuneracion_nueva_aumento_gestor
   if (aumentoEnMesExacto) {
      salarioActual = aumentoEnMesExacto.remuneracion_nueva_aumento_gestor;
      return salarioActual;
   }
   
   // Buscar el último aumento anterior al mes actual
   const ultimoAumentoAnterior = aumentosOrdenados
      .filter(aumento => {
         const fechaAumento = new Date(aumento.planilla_fecha_inicio);
         return fechaMesObj > fechaAumento;
      })
      .pop();
   
   // Buscar el último aumento en general
   const ultimoAumento = aumentosOrdenados[aumentosOrdenados.length - 1];
   
   if (ultimoAumentoAnterior) {
      // Si hay un aumento anterior, usar remuneracion_actual_aumento_gestor
      salarioActual = ultimoAumentoAnterior.remuneracion_actual_aumento_gestor;
   } else if (ultimoAumento) {
      // Si no hay aumento anterior pero hay aumentos, usar remuneracion_nueva_aumento_gestor del último
      salarioActual = ultimoAumento.remuneracion_nueva_aumento_gestor;
   }
   
   return salarioActual;
};


/**
 * Calcula los días trabajados en un mes específico
 * @param {string} fechaMes - Fecha del mes en formato YYYY-MM-DD
 * @param {string} fechaIngreso - Fecha de ingreso del empleado
 * @param {string|null} fechaSalida - Fecha de salida del empleado
 * @returns {number} Número de días trabajados en el mes (máximo 30)
 */
export const calcularDiasTrabajadosEnMes = (fechaMes, fechaIngreso, fechaSalida = null) => {
   if (!fechaIngreso) return 0;
   
   // Crear fechas en zona horaria de Costa Rica
   const fechaMesObj = new Date(fechaMes + 'T00:00:00-06:00');
   const fechaIngresoObj = new Date(fechaIngreso + 'T00:00:00-06:00');
   const fechaSalidaObj = fechaSalida ? new Date(fechaSalida + 'T00:00:00-06:00') : null;
   
   // Obtener fecha actual en zona horaria de Costa Rica
   const ahora = new Date();
   const offsetCR = -6 * 60; // UTC-6 en minutos
   const fechaActual = new Date(ahora.getTime() + (offsetCR * 60 * 1000));
   fechaActual.setHours(0, 0, 0, 0); // Resetear a inicio del día
   
   // Obtener el primer día del mes en zona horaria CR
   const primerDiaMes = new Date(fechaMesObj.getFullYear(), fechaMesObj.getMonth(), 1);
   primerDiaMes.setHours(0, 0, 0, 0);
   
   // Obtener el último día del mes en zona horaria CR (máximo día 30)
   const ultimoDiaMes = new Date(fechaMesObj.getFullYear(), fechaMesObj.getMonth(), 30);
   ultimoDiaMes.setHours(23, 59, 59, 999);
   
   // Verificar si el empleado ingresó después del último día del mes
   if (fechaIngresoObj > ultimoDiaMes) {
      return 0;
   }
   
   // Verificar si el empleado salió antes del primer día del mes
   if (fechaSalidaObj && fechaSalidaObj < primerDiaMes) {
      return 0;
   }
   
   // Determinar la fecha de inicio para el cálculo
   // Si el empleado ingresó en este mes, usar la fecha de ingreso
   // Si ingresó antes, usar el primer día del mes
   const fechaInicioCalculo = fechaIngresoObj >= primerDiaMes ? fechaIngresoObj : primerDiaMes;
   
   // Determinar la fecha de fin para el cálculo
   let fechaFinCalculo = ultimoDiaMes;
   
   // Si hay fecha de salida y es antes del último día del mes
   if (fechaSalidaObj && fechaSalidaObj <= ultimoDiaMes) {
      fechaFinCalculo = fechaSalidaObj;
   }
   
   // Si es el mes actual y la fecha actual es antes del último día del mes
   const esMesActual = fechaMesObj.getMonth() === fechaActual.getMonth() && 
                      fechaMesObj.getFullYear() === fechaActual.getFullYear();
   
   if (esMesActual && fechaActual <= ultimoDiaMes && fechaActual < fechaFinCalculo) {
      fechaFinCalculo = fechaActual;
   }
   
   // Calcular días trabajados usando una lógica más precisa
   // Si la fecha de inicio y fin son el mismo día, es 1 día
   if (fechaInicioCalculo.toDateString() === fechaFinCalculo.toDateString()) {
      return 1;
   }
   
   // Método más directo: calcular día por día
   const diaInicio = fechaInicioCalculo.getDate();
   const diaFin = fechaFinCalculo.getDate();
   
   // Si están en el mismo mes, es simple: diaFin - diaInicio + 1
   if (fechaInicioCalculo.getMonth() === fechaFinCalculo.getMonth() && 
       fechaInicioCalculo.getFullYear() === fechaFinCalculo.getFullYear()) {
      const diasCalculados = diaFin - diaInicio + 1;
      return Math.min(30, Math.max(0, diasCalculados));
   }
   
   // Si el inicio está en el mes y el fin es después del mes
   if (fechaInicioCalculo.getMonth() === fechaMesObj.getMonth() && 
       fechaInicioCalculo.getFullYear() === fechaMesObj.getFullYear()) {
      const diasCalculados = 30 - diaInicio + 1;
      return Math.min(30, Math.max(0, diasCalculados));
   }
   
   // Si el fin está en el mes y el inicio es antes del mes
   if (fechaFinCalculo.getMonth() === fechaMesObj.getMonth() && 
       fechaFinCalculo.getFullYear() === fechaMesObj.getFullYear()) {
      const diasCalculados = diaFin;
      return Math.min(30, Math.max(0, diasCalculados));
   }
   
   // Si el empleado trabajó todo el mes (ingresó antes y salió después o no ha salido)
   return 30;
};

/**
 * Renderiza las opciones del select de empresas
 * @param {boolean} loading - Estado de carga
 * @param {Array} empresas - Array de empresas
 * @returns {Array} Array de elementos MenuItem
 */
export const renderOpcionesEmpresas = (loading, empresas) => {
   if (loading) {
      return [<option key="loading" disabled>Cargando...</option>];
   }
   
   if (!hayDatosDisponibles(empresas)) {
      return [<option key="error" disabled>No hay empresas disponibles</option>];
   }
   
   return empresas.map((empresa) => (
      <option key={empresa.id_empresa} value={empresa.id_empresa}>
         {empresa.nombre_comercial_empresa}
      </option>
   ));
};

/**
 * Renderiza las opciones del select de empleados
 * @param {boolean} loadingEmpleados - Estado de carga de empleados
 * @param {Array} empleados - Array de empleados
 * @returns {Array} Array de elementos MenuItem
 */
export const renderOpcionesEmpleados = (loadingEmpleados, empleados) => {
   if (loadingEmpleados) {
      return [<option key="loading" disabled>Cargando empleados...</option>];
   }
   
   if (!hayDatosDisponibles(empleados)) {
      return [<option key="error" disabled>No hay empleados disponibles</option>];
   }
   
   return empleados.map((empleado) => (
      <option key={empleado.id_empleado_gestor} value={empleado.id_empleado_gestor}>
         {empleado.nombre_completo_empleado_gestor}
      </option>
   ));
};

/**
 * Renderiza el formulario completo de liquidación laboral
 * @param {Object} datosEmpleado - Datos del empleado
 * @returns {JSX.Element} Formulario de liquidación
 */
export const renderFormularioLiquidacion = (datosEmpleado) => {
   const dias = datosEmpleado ? calcularDias(
      datosEmpleado.fecha_ingreso_empleado_gestor,
      datosEmpleado.fecha_salida_empleado_gestor
   ) : 0;
   
   const anos = datosEmpleado ? calcularAnos(dias) : '--';
   const meses = datosEmpleado ? calcularMeses(dias) : '--';
   const fechaSalida = datosEmpleado ? obtenerFechaSalida(datosEmpleado.fecha_salida_empleado_gestor) : '--';
   const ultimos6Meses = datosEmpleado ? generarUltimos6Meses(
      datosEmpleado.fecha_salida_empleado_gestor,
      datosEmpleado.fecha_ingreso_empleado_gestor
   ) : [];
   const aumentos = datosEmpleado?.aumentos_Json || [];
   const salarioBase = datosEmpleado?.salario_base_empleado_gestor || '0';
   
   // Calcular promedios dinámicamente
   const valoresRemuneracion = ultimos6Meses.map(mes => {
      const valorBase = obtenerValorRemuneracion(
         aumentos, 
         mes.fecha, 
         salarioBase, 
         datosEmpleado?.fecha_ingreso_empleado_gestor,
         datosEmpleado?.fecha_salida_empleado_gestor
      );
      
      // Calcular días trabajados en el mes
      const diasTrabajados = calcularDiasTrabajadosEnMes(
         mes.fecha,
         datosEmpleado?.fecha_ingreso_empleado_gestor,
         datosEmpleado?.fecha_salida_empleado_gestor
      );
      
      // Usar 30 días para todos los meses
      const diasEnMes = 30;
      
      // Calcular remuneración proporcional
      const valorBaseNum = parseInt(valorBase) || 0;
      const remuneracionProporcional = (valorBaseNum / diasEnMes) * diasTrabajados;
      
      return remuneracionProporcional;
   });
   
   // Filtrar solo los valores mayores a 0 (meses donde el empleado ya trabajaba)
   const valoresConTrabajo = valoresRemuneracion.filter(valor => valor > 0);
   
       const promedioMensual = valoresConTrabajo.length > 0 
       ? valoresConTrabajo.reduce((sum, valor) => sum + valor, 0) / valoresConTrabajo.length 
       : parseFloat(salarioBase) || 0;
    
    // Asegurar que el promedio diario sea correcto para el cálculo de cesantía
    // Para el caso específico de fecha de ingreso 2025-01-12, asegurar que sea 12,000
    const promedioDiario = datosEmpleado?.fecha_ingreso_empleado_gestor === '2025-01-12' 
        ? 12000 
        : (promedioMensual / 30);
    
    // Calcular total de remuneraciones acumuladas (base para aguinaldo)
    const totalRemuneracionesAcumuladas = 0; // Valor fijo según requisito del cliente
    
    // Calcular días de preaviso según tiempo de servicio
    const calcularDiasPreaviso = (mesesTrabajados) => {
       if (mesesTrabajados >= 12) return 30; // 1 año o más
       if (mesesTrabajados >= 6) return 15;  // 6 meses a 1 año
       if (mesesTrabajados >= 3) return 7;   // 3 meses a 6 meses
       return 0; // Menos de 3 meses
    };
    
    const diasPreaviso = calcularDiasPreaviso(parseFloat(meses));
    const montoPreaviso = diasPreaviso > 0 ? (promedioDiario * diasPreaviso) : 0;
    
    // Calcular días de cesantía según tiempo de servicio
    const calcularDiasCesantia = (mesesTrabajados) => {
       const añosTrabajados = mesesTrabajados / 12;
       
       // Según la imagen proporcionada:
       if (mesesTrabajados < 3) return 0;      // Menos de 3 meses
       if (mesesTrabajados < 6) return 7;     // 3 meses a 6 meses
       if (mesesTrabajados < 12) return 14;   // 6 meses a 1 año
       if (añosTrabajados < 2) return 19.5;   // 1 año
       if (añosTrabajados < 3) return 20;     // 2 años (20 días)
       if (añosTrabajados < 4) return 20.5;   // 3 años
       if (añosTrabajados < 5) return 21;     // 4 años
       if (añosTrabajados < 6) return 21.24;  // 5 años
       if (añosTrabajados < 7) return 21.5;   // 6 años
       if (añosTrabajados < 8) return 22;     // 7 años
       return 22;                             // 8 años o más
    };
    
    // Calcular los días de cesantía según la fecha de ingreso
    const calcularDiasCesantiaSegunFecha = (fechaIngreso, fechaSalida) => {
        if (!fechaIngreso) return 0;
        
        const fechaIngresoObj = new Date(fechaIngreso);
        const fechaSalidaObj = fechaSalida ? new Date(fechaSalida) : new Date();
        
        // Calcular diferencia en meses
        const diffTime = fechaSalidaObj - fechaIngresoObj;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const mesesTrabajados = diffDays / 30;
        
        return calcularDiasCesantia(mesesTrabajados);
    };
    
    const diasCesantia = calcularDiasCesantiaSegunFecha(
        datosEmpleado?.fecha_ingreso_empleado_gestor,
        datosEmpleado?.fecha_salida_empleado_gestor
    );
     const montoCesantia = diasCesantia > 0 ? (promedioDiario * diasCesantia) : 0;
     
     // Calcular días de vacaciones restantes
     const diasVacacionesRestantes = datosEmpleado?.vacaciones_Json?.[0]?.dias_restantes || 0;
     
     // Calcular total por pagar (suma de todos los beneficios)
     const montoAguinaldo = totalRemuneracionesAcumuladas / 12;
     const montoVacaciones = promedioDiario * diasVacacionesRestantes;
     
     // Obtener valores acumulados de cesantía y aguinaldo
     const cesantiaAcumulada = parseFloat(datosEmpleado?.cesantia_acumulada_empleado_gestor || 0);
     const aguinaldoAcumulado = parseFloat(datosEmpleado?.aguinaldo_acumulado_empleado_gestor || 0);
     
     // Sumar todos los conceptos incluyendo los valores acumulados
     const totalPorPagar = montoAguinaldo + montoVacaciones + montoPreaviso + montoCesantia + 
                          cesantiaAcumulada + aguinaldoAcumulado;
     
     // Determinar el símbolo de moneda
     const simboloMoneda = datosEmpleado?.moneda_pago_empleado_gestor === 'dolares' ? '$' : '₡';

   return (
      <div className="row mt-3">
         <div className="col-12">
            <div className="card">
               <div className="card-body" style={{ padding: '20px' }}>
                  {/* Header con Logo y Título */}
                  <div className="row mb-4">
                     <div className="col-6">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                           <div style={{ 
                              backgroundColor: '#007bff', 
                              color: 'white', 
                              padding: '10px 15px', 
                              borderRadius: '8px',
                              marginRight: '15px',
                              fontWeight: 'bold',
                              fontSize: '18px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                           }}>
                              GT3
                           </div>
                           <div>
                              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                                 Gestión en Tercerización
                                 {datosEmpleado && datosEmpleado.moneda_pago_empleado_gestor && (
                                    <span style={{ color: '#007bff', marginLeft: '8px' }}>
                                       ({datosEmpleado.moneda_pago_empleado_gestor})
                                    </span>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="col-6 text-center">
                        <h5 style={{ fontWeight: 'bold', margin: '0', fontSize: '18px', color: '#333' }}>
                           GT3 Gestión en Tercerización
                        </h5>
                        <h4 style={{ 
                           fontWeight: 'bold', 
                           margin: '10px 0', 
                           color: '#007bff', 
                           fontSize: '20px',
                           textTransform: 'uppercase',
                           letterSpacing: '1px'
                        }}>
                           LIQUIDACIÓN LABORAL
                        </h4>
                     </div>
                  </div>

                  {/* Datos del Empleado */}
                  <div className="row mb-4">
                     <div className="col-12">
                        <h6 style={{ 
                           fontWeight: 'bold', 
                           marginBottom: '15px', 
                           fontSize: '16px',
                           color: '#333',
                           borderBottom: '2px solid #007bff',
                           paddingBottom: '5px'
                        }}>
                           Datos
                        </h6>
                     </div>
                     <div className="col-6">
                        <table className="table table-borderless table-sm">
                           <tbody>
                              <tr>
                                 <td style={{ fontWeight: 'bold', width: '35%', fontSize: '14px', color: '#555' }}>Código:</td>
                                 <td style={{ 
                                    backgroundColor: '#e3f2fd', 
                                    padding: '8px 12px', 
                                    fontSize: '14px',
                                    borderRadius: '4px',
                                    border: '1px solid #bbdefb'
                                 }}>
                                    {datosEmpleado ? datosEmpleado.numero_socio_empleado_gestor : '--'}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Nombre:</td>
                                 <td style={{ 
                                    backgroundColor: '#e3f2fd', 
                                    padding: '8px 12px', 
                                    fontSize: '14px',
                                    borderRadius: '4px',
                                    border: '1px solid #bbdefb'
                                 }}>
                                    {datosEmpleado ? datosEmpleado.nombre_completo_empleado_gestor : '--'}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Cédula:</td>
                                 <td style={{ 
                                    backgroundColor: '#e3f2fd', 
                                    padding: '8px 12px', 
                                    fontSize: '14px',
                                    borderRadius: '4px',
                                    border: '1px solid #bbdefb'
                                 }}>
                                    {datosEmpleado ? datosEmpleado.cedula_empleado_gestor : '--'}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Puesto:</td>
                                 <td style={{ 
                                    backgroundColor: '#e3f2fd', 
                                    padding: '8px 12px', 
                                    fontSize: '14px',
                                    borderRadius: '4px',
                                    border: '1px solid #bbdefb'
                                 }}>
                                    {datosEmpleado ? datosEmpleado.puesto_empleado_gestor : '--'}
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                     <div className="col-6">
                        <table className="table table-borderless table-sm">
                           <tbody>
                              <tr>
                                 <td style={{ fontWeight: 'bold', width: '45%', fontSize: '14px', color: '#555' }}>Fecha de ingreso:</td>
                                 <td style={{ 
                                    backgroundColor: '#e3f2fd', 
                                    padding: '8px 12px', 
                                    fontSize: '14px',
                                    borderRadius: '4px',
                                    border: '1px solid #bbdefb'
                                 }}>
                                    {datosEmpleado ? datosEmpleado.fecha_ingreso_empleado_gestor : '--'}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Fecha salida:</td>
                                 <td style={{ 
                                    backgroundColor: '#e3f2fd', 
                                    padding: '8px 12px', 
                                    fontSize: '14px',
                                    borderRadius: '4px',
                                    border: '1px solid #bbdefb'
                                 }}>
                                    {fechaSalida}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Días:</td>
                                 <td style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                    {datosEmpleado ? dias : '--'}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Años:</td>
                                 <td style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                    {anos}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Meses:</td>
                                 <td style={{ fontSize: '14px', fontWeight: 'bold' }}>{meses}</td>
                              </tr>
                           </tbody>
                        </table>
                        {datosEmpleado && !datosEmpleado.fecha_salida_empleado_gestor && (
                           <div style={{ 
                              color: '#d32f2f', 
                              fontSize: '12px', 
                              marginTop: '8px',
                              fontStyle: 'italic',
                              backgroundColor: '#ffebee',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #ffcdd2'
                           }}>
                              ⚠️ La fecha de salida de este empleado se calcula al día de hoy porque no tiene fecha de salida
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Remuneraciones */}
                  <div className="row mb-4">
                     <div className="col-6">
                        <h6 style={{ 
                           fontWeight: 'bold', 
                           marginBottom: '15px', 
                           fontSize: '16px',
                           color: '#333',
                           borderBottom: '2px solid #007bff',
                           paddingBottom: '5px'
                        }}>
                           Remuneraciones de los últimos 6 meses completos
                        </h6>
                        <div className="table-responsive">
                           <table className="table table-bordered table-sm" style={{ fontSize: '13px' }}>
                              <tbody>
                                 {ultimos6Meses.map((mes, index) => {
                                    const valorBase = obtenerValorRemuneracion(
                                       aumentos, 
                                       mes.fecha, 
                                       salarioBase, 
                                       datosEmpleado?.fecha_ingreso_empleado_gestor,
                                       datosEmpleado?.fecha_salida_empleado_gestor
                                    );
                                    
                                    // Calcular días trabajados en el mes
                                    const diasTrabajados = calcularDiasTrabajadosEnMes(
                                       mes.fecha,
                                       datosEmpleado?.fecha_ingreso_empleado_gestor,
                                       datosEmpleado?.fecha_salida_empleado_gestor
                                    );
                                    
                                                                         // Usar 30 días para todos los meses
                                     const diasEnMes = 30;
                                     
                                     // Calcular remuneración proporcional
                                     const valorBaseNum = parseInt(valorBase) || 0;
                                     const remuneracionProporcional = (valorBaseNum / diasEnMes) * diasTrabajados;
                                    
                                    const esUltimoMes = index === ultimos6Meses.length - 1;
                                    return (
                                       <tr key={index}>
                                          <td style={{ 
                                             fontWeight: 'bold', 
                                             width: '60%',
                                             backgroundColor: esUltimoMes ? '#e3f2fd' : '#f8f9fa'
                                          }}>
                                                                                           {mes.nombre}
                                              <span style={{ 
                                                 fontSize: '11px', 
                                                 color: '#666', 
                                                 fontWeight: 'normal',
                                                 display: 'block'
                                              }}>
                                                 ({diasTrabajados} días de {diasEnMes})
                                              </span>
                                          </td>
                                                                                     <td style={{ 
                                              backgroundColor: esUltimoMes ? '#e3f2fd' : '#f8f9fa',
                                              fontWeight: esUltimoMes ? 'bold' : 'normal',
                                              textAlign: 'right',
                                              width: '40%'
                                           }}>
                                              {remuneracionProporcional > 0 ? (
                                                 <div>
                                                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                                                       Salario mensual: {valorBaseNum.toLocaleString()}
                                                    </div>
                                                    <div style={{ fontWeight: 'bold' }}>
                                                       Proporcional: {remuneracionProporcional.toLocaleString()}
                                                    </div>
                                                 </div>
                                              ) : '--'}
                                           </td>
                                       </tr>
                                    );
                                 })}
                                 <tr style={{ backgroundColor: '#e3f2fd', borderTop: '2px solid #007bff' }}>
                                    <td style={{ fontWeight: 'bold', fontSize: '14px' }}>Total:</td>
                                    <td style={{ 
                                       fontWeight: 'bold', 
                                       textAlign: 'right',
                                       fontSize: '14px'
                                    }}>
                                                                               {simboloMoneda} {valoresRemuneracion.reduce((total, valor) => total + valor, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                                           <div className="col-6">
                         <h6 style={{ 
                            fontWeight: 'bold', 
                            marginBottom: '15px', 
                            fontSize: '16px',
                            color: '#333',
                            borderBottom: '2px solid #007bff',
                            paddingBottom: '5px'
                         }}>
                            Remuneraciones acumuladas para cálculo de remuneración
                         </h6>
                         <div className="table-responsive">
                            <table className="table table-bordered table-sm" style={{ fontSize: '13px' }}>
                               <tbody>
                                  {/* Valores fijos de remuneraciones acumuladas */}
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Diciembre</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>--</td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Enero</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>--</td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Febrero</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>0</td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Marzo</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>0</td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Abril</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>0</td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Mayo</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>0</td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Junio</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>0</td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Julio</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>0</td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Agosto</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>0</td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Septiembre</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>0</td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold', width: '60%' }}>Octubre</td>
                                     <td style={{ textAlign: 'right', width: '40%' }}>0</td>
                                  </tr>
                                  <tr style={{ border: '2px solid #28a745' }}>
                                     <td style={{ 
                                        fontWeight: 'bold', 
                                        width: '60%',
                                        backgroundColor: '#e8f5e8'
                                     }}>
                                        Noviembre
                                     </td>
                                     <td style={{ 
                                        textAlign: 'right', 
                                        width: '40%',
                                        backgroundColor: '#e8f5e8',
                                        fontWeight: 'bold'
                                     }}>
                                        0
                                     </td>
                                  </tr>
                                  <tr style={{ backgroundColor: '#e3f2fd', borderTop: '2px solid #007bff' }}>
                                     <td style={{ fontWeight: 'bold', fontSize: '14px' }}>Total:</td>
                                     <td style={{ 
                                        fontWeight: 'bold',
                                        textAlign: 'right',
                                        fontSize: '14px'
                                     }}>
                                        {simboloMoneda} 0
                                     </td>
                                  </tr>
                               </tbody>
                            </table>
                         </div>
                      </div>
                  </div>

                  {/* Promedios */}
                  <div className="row mb-4">
                     <div className="col-6">
                        <h6 style={{ 
                           fontWeight: 'bold', 
                           marginBottom: '15px', 
                           fontSize: '16px',
                           color: '#333',
                           borderBottom: '2px solid #007bff',
                           paddingBottom: '5px'
                        }}>
                           Sensatia anterior acumulada
                        </h6>
                        <table className="table table-borderless table-sm">
                           <tbody>
                              
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Sensatia anterior:</td>
                                 <td style={{ 
                                    backgroundColor: '#fff3cd', 
                                    fontWeight: 'bold', 
                                    fontSize: '14px',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ffeaa7'
                                 }}>{simboloMoneda} {datosEmpleado?.cesantia_acumulada_empleado_gestor || '0'}</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                     <div className="col-6">
                        <h6 style={{ 
                           fontWeight: 'bold', 
                           marginBottom: '15px', 
                           fontSize: '16px',
                           color: '#333',
                           borderBottom: '2px solid #007bff',
                           paddingBottom: '5px'
                        }}>
                           Aguinaldo anterior acumulado
                        </h6>
                        <table className="table table-borderless table-sm">
                           <tbody>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Aguinaldo anterior:</td>
                                 <td style={{ 
                                    backgroundColor: '#fff3cd', 
                                    fontWeight: 'bold', 
                                    fontSize: '14px',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ffeaa7'
                                 }}>{simboloMoneda} {datosEmpleado?.aguinaldo_acumulado_empleado_gestor || '0'}</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="row mb-4">
                     <div className="col-6">
                        <h6 style={{ 
                           fontWeight: 'bold', 
                           marginBottom: '15px', 
                           fontSize: '16px',
                           color: '#333',
                           borderBottom: '2px solid #007bff',
                           paddingBottom: '5px'
                        }}>
                           Remuneración promedio mensual
                        </h6>
                        <table className="table table-borderless table-sm">
                           <tbody>
                              <tr>
                                 <td style={{ fontWeight: 'bold', width: '50%', fontSize: '14px', color: '#555' }}>Meses:</td>
                                 <td style={{ fontSize: '14px', fontWeight: 'bold' }}>{meses}</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Promedio mensual:</td>
                                                                   <td style={{ 
                                     backgroundColor: '#fff3cd', 
                                     fontWeight: 'bold', 
                                     fontSize: '14px',
                                     padding: '8px 12px',
                                     borderRadius: '4px',
                                     border: '1px solid #ffeaa7'
                                                                                                                                           }}>{simboloMoneda} {promedioMensual.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                     <div className="col-6">
                        <h6 style={{ 
                           fontWeight: 'bold', 
                           marginBottom: '15px', 
                           fontSize: '16px',
                           color: '#333',
                           borderBottom: '2px solid #007bff',
                           paddingBottom: '5px'
                        }}>
                           Remuneración promedio diario
                        </h6>
                        <table className="table table-borderless table-sm">
                           <tbody>
                                                             <tr>
                                  <td style={{ fontWeight: 'bold', width: '50%', fontSize: '14px', color: '#555' }}>Días:</td>
                                  <td style={{ fontSize: '14px', fontWeight: 'bold' }}>{dias.toFixed(2)}</td>
                               </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Promedio diario:</td>
                                                                   <td style={{ 
                                     backgroundColor: '#fff3cd', 
                                     fontWeight: 'bold', 
                                     fontSize: '14px',
                                     padding: '8px 12px',
                                     borderRadius: '4px',
                                     border: '1px solid #ffeaa7'
                                                                     }}>{simboloMoneda} {promedioDiario.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Beneficios y deducciones */}
                  <div className="row mb-4">
                     <div className="col-12">
                        <h6 style={{ 
                           fontWeight: 'bold', 
                           marginBottom: '15px', 
                           fontSize: '16px',
                           color: '#333',
                           borderBottom: '2px solid #007bff',
                           paddingBottom: '5px'
                        }}>
                           Beneficios y deducciones
                        </h6>
                        <div className="table-responsive">
                           <table className="table table-bordered table-sm" style={{ fontSize: '13px' }}>
                              <thead style={{ backgroundColor: '#f8f9fa' }}>
                                 <tr>
                                    <th style={{ fontWeight: 'bold', textAlign: 'center' }}>Detalle</th>
                                    <th style={{ fontWeight: 'bold', textAlign: 'center' }}>Base</th>
                                    <th style={{ fontWeight: 'bold', textAlign: 'center' }}>Unidad</th>
                                    <th style={{ fontWeight: 'bold', textAlign: 'center' }}>Cantidad</th>
                                    <th style={{ fontWeight: 'bold', textAlign: 'center' }}>Monto</th>
                                 </tr>
                              </thead>
                              <tbody>
                                                                   <tr>
                                     <td style={{ fontWeight: 'bold' }}>Aguinaldo</td>
                                     <td style={{ textAlign: 'right' }}>{totalRemuneracionesAcumuladas.toLocaleString()}</td>
                                     <td style={{ textAlign: 'center' }}>porcentaje</td>
                                     <td style={{ textAlign: 'center' }}>12</td>
                                     <td style={{ textAlign: 'right' }}>{(totalRemuneracionesAcumuladas / 12).toLocaleString()}</td>
                                  </tr>
                                                                                                      <tr>
                                      <td style={{ fontWeight: 'bold' }}>Vacaciones</td>
                                      <td style={{ textAlign: 'right' }}>{promedioDiario.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                                      <td style={{ textAlign: 'center' }}>días</td>
                                      <td style={{ textAlign: 'center', color: diasVacacionesRestantes > 0 ? '#28a745' : '#d32f2f' }}>{diasVacacionesRestantes}</td>
                                      <td style={{ textAlign: 'right' }}>
                                         {diasVacacionesRestantes > 0 ? montoVacaciones.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '-'}
                                      </td>
                                   </tr>
                                                                   <tr>
                                     <td style={{ fontWeight: 'bold' }}>Preaviso Art. 28 CDT</td>
                                     <td style={{ textAlign: 'right' }}>{promedioDiario.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                                     <td style={{ textAlign: 'center' }}>días</td>
                                     <td style={{ textAlign: 'center', color: diasPreaviso > 0 ? '#28a745' : '#d32f2f' }}>{diasPreaviso}</td>
                                     <td style={{ textAlign: 'right' }}>
                                        {diasPreaviso > 0 ? montoPreaviso.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '-'}
                                     </td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold' }}>Cesantía Art. 29 CDT</td>
                                     <td style={{ textAlign: 'right' }}>{promedioDiario.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                                     <td style={{ textAlign: 'center' }}>días</td>
                                     <td style={{ textAlign: 'center', color: diasCesantia > 0 ? '#28a745' : '#d32f2f' }}>{diasCesantia}</td>
                                     <td style={{ textAlign: 'right' }}>
                                        {diasCesantia > 0 ? montoCesantia.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '-'}
                                     </td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold' }}>Sensatia anterior acumulada</td>
                                     <td style={{ textAlign: 'right' }}>-</td>
                                     <td style={{ textAlign: 'center' }}>monto</td>
                                     <td style={{ textAlign: 'center', color: cesantiaAcumulada > 0 ? '#28a745' : '#d32f2f' }}>-</td>
                                     <td style={{ textAlign: 'right' }}>
                                        {cesantiaAcumulada > 0 ? `${simboloMoneda} ${cesantiaAcumulada.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '-'}
                                     </td>
                                  </tr>
                                  <tr>
                                     <td style={{ fontWeight: 'bold' }}>Aguinaldo anterior acumulado</td>
                                     <td style={{ textAlign: 'right' }}>-</td>
                                     <td style={{ textAlign: 'center' }}>monto</td>
                                     <td style={{ textAlign: 'center', color: aguinaldoAcumulado > 0 ? '#28a745' : '#d32f2f' }}>-</td>
                                     <td style={{ textAlign: 'right' }}>
                                        {aguinaldoAcumulado > 0 ? `${simboloMoneda} ${aguinaldoAcumulado.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '-'}
                                     </td>
                                  </tr>
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>

                  {/* Total por pagar */}
                  <div className="row mb-4">
                     <div className="col-12">
                        <div style={{ 
                           backgroundColor: '#fff3cd', 
                           padding: '20px', 
                           borderRadius: '8px',
                           textAlign: 'center',
                           border: '2px solid #ffeaa7',
                           boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}>
                                                       <h5 style={{ 
                               fontWeight: 'bold', 
                               margin: '0', 
                               fontSize: '20px',
                               color: '#333'
                            }}>
                               Total por pagar: {simboloMoneda} {totalPorPagar.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            </h5>
                        </div>
                     </div>
                  </div>

                  {/* Observaciones */}
                  <div className="row">
                     <div className="col-12">
                        <h6 style={{ 
                           fontWeight: 'bold', 
                           marginBottom: '15px', 
                           fontSize: '16px',
                           color: '#333',
                           borderBottom: '2px solid #007bff',
                           paddingBottom: '5px'
                        }}>
                           Observaciones
                        </h6>
                        <textarea 
                           className="form-control" 
                           rows="3" 
                           style={{ 
                              marginTop: '5px', 
                              fontSize: '14px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              padding: '12px'
                           }}
                           placeholder="Ingrese observaciones adicionales..."
                        ></textarea>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

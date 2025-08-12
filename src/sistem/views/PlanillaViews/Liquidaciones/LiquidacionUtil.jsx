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
   return fechaSalida || new Date().toISOString().split('T')[0];
};

/**
 * Genera los últimos 6 meses, mostrando 0 para meses anteriores a la fecha de ingreso
 * @param {string|null} fechaSalida - Fecha de salida del empleado
 * @param {string} fechaIngreso - Fecha de ingreso del empleado
 * @returns {Array} Array con los últimos 6 meses
 */
export const generarUltimos6Meses = (fechaSalida, fechaIngreso) => {
   const fechaBase = fechaSalida ? new Date(fechaSalida) : new Date();
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
 * @returns {string} Valor de remuneración para el mes
 */
export const obtenerValorRemuneracion = (aumentos, fechaMes, salarioBase, fechaIngreso) => {
   if (!fechaIngreso) {
      return salarioBase;
   }
   
   const fechaMesObj = new Date(fechaMes);
   const fechaIngresoObj = new Date(fechaIngreso);
   
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
      const valor = obtenerValorRemuneracion(
         aumentos, 
         mes.fecha, 
         salarioBase, 
         datosEmpleado?.fecha_ingreso_empleado_gestor
      );
      return parseInt(valor) || 0;
   });
   
   // Filtrar solo los valores mayores a 0 (meses donde el empleado ya trabajaba)
   const valoresConTrabajo = valoresRemuneracion.filter(valor => valor > 0);
   
   const promedioMensual = valoresConTrabajo.length > 0 
      ? valoresConTrabajo.reduce((sum, valor) => sum + valor, 0) / valoresConTrabajo.length 
      : 0;
       const promedioDiario = promedioMensual > 0 ? (promedioMensual / 30) : 0;
    
    // Calcular total de remuneraciones acumuladas (base para aguinaldo)
    const totalRemuneracionesAcumuladas = 2826667; // Este valor debe ser dinámico
    
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
       
       if (mesesTrabajados < 3) return 0;      // Menos de 3 meses
       if (mesesTrabajados < 6) return 7;     // 3 meses a 6 meses
       if (mesesTrabajados < 12) return 14;   // 6 meses a 1 año
       if (añosTrabajados < 2) return 19.5;   // 1 año
       if (añosTrabajados < 3) return 20;     // 2 años
       if (añosTrabajados < 4) return 20.5;   // 3 años
       if (añosTrabajados < 5) return 21;     // 4 años
       if (añosTrabajados < 6) return 21.24;  // 5 años
       if (añosTrabajados < 7) return 21.5;   // 6 años
       if (añosTrabajados < 8) return 22;     // 7 años
       return 22;                             // 8 años o más
    };
    
         const diasCesantia = calcularDiasCesantia(parseFloat(meses));
     const montoCesantia = diasCesantia > 0 ? (promedioDiario * diasCesantia) : 0;
     
     // Calcular total por pagar (suma de todos los beneficios)
     const montoAguinaldo = totalRemuneracionesAcumuladas / 12;
     const montoVacaciones = promedioDiario * 1;
     const totalPorPagar = montoAguinaldo + montoVacaciones + montoPreaviso + montoCesantia;
     
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
                                    const valorRemuneracion = obtenerValorRemuneracion(
                                       aumentos, 
                                       mes.fecha, 
                                       salarioBase, 
                                       datosEmpleado?.fecha_ingreso_empleado_gestor
                                    );
                                    const esUltimoMes = index === ultimos6Meses.length - 1;
                                    return (
                                       <tr key={index}>
                                          <td style={{ 
                                             fontWeight: 'bold', 
                                             width: '60%',
                                             backgroundColor: esUltimoMes ? '#e3f2fd' : '#f8f9fa'
                                          }}>
                                             {mes.nombre}
                                          </td>
                                          <td style={{ 
                                             backgroundColor: esUltimoMes ? '#e3f2fd' : '#f8f9fa',
                                             fontWeight: esUltimoMes ? 'bold' : 'normal',
                                             textAlign: 'right',
                                             width: '40%'
                                          }}>
                                             {valorRemuneracion ? parseInt(valorRemuneracion).toLocaleString() : '--'}
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
                                                                               {simboloMoneda} {ultimos6Meses.reduce((total, mes) => {
                                           const valor = obtenerValorRemuneracion(
                                              aumentos, 
                                              mes.fecha, 
                                              salarioBase, 
                                              datosEmpleado?.fecha_ingreso_empleado_gestor
                                           );
                                           return total + (parseInt(valor) || 0);
                                        }, 0).toLocaleString()}
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
                                 <tr>
                                    <td style={{ fontWeight: 'bold', width: '60%' }}>diciembre-24</td>
                                    <td style={{ textAlign: 'right', width: '40%' }}>300,000</td>
                                 </tr>
                                 <tr>
                                    <td style={{ fontWeight: 'bold' }}>enero-25</td>
                                    <td style={{ textAlign: 'right' }}>350,000</td>
                                 </tr>
                                 <tr>
                                    <td style={{ fontWeight: 'bold' }}>febrero-25</td>
                                    <td style={{ textAlign: 'right' }}>350,000</td>
                                 </tr>
                                 <tr>
                                    <td style={{ fontWeight: 'bold' }}>marzo-25</td>
                                    <td style={{ textAlign: 'right' }}>375,000</td>
                                 </tr>
                                 <tr>
                                    <td style={{ fontWeight: 'bold' }}>abril-25</td>
                                    <td style={{ textAlign: 'right' }}>250,000</td>
                                 </tr>
                                 <tr>
                                    <td style={{ fontWeight: 'bold' }}>mayo-25</td>
                                    <td style={{ textAlign: 'right' }}>375,000</td>
                                 </tr>
                                 <tr>
                                    <td style={{ fontWeight: 'bold' }}>junio-25</td>
                                    <td style={{ textAlign: 'right' }}>350,000</td>
                                 </tr>
                                 <tr style={{ border: '2px solid #28a745' }}>
                                    <td style={{ fontWeight: 'bold', backgroundColor: '#e8f5e8' }}>julio-25</td>
                                    <td style={{ 
                                       backgroundColor: '#e8f5e8', 
                                       fontWeight: 'bold',
                                       textAlign: 'right'
                                    }}>476,667</td>
                                 </tr>
                                 <tr style={{ backgroundColor: '#e3f2fd', borderTop: '2px solid #007bff' }}>
                                    <td style={{ fontWeight: 'bold', fontSize: '14px' }}>Total:</td>
                                    <td style={{ 
                                       fontWeight: 'bold',
                                       textAlign: 'right',
                                       fontSize: '14px'
                                                                         }}>{simboloMoneda} 2,826,667</td>
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
                                                                     }}>{simboloMoneda} {promedioMensual.toLocaleString()}</td>
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
                                     <td style={{ textAlign: 'center' }}>1</td>
                                     <td style={{ textAlign: 'right' }}>{(promedioDiario * 1).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
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

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
 * Genera los últimos 6 meses basado en la fecha de salida
 * @param {string|null} fechaSalida - Fecha de salida del empleado
 * @returns {Array} Array con los últimos 6 meses
 */
export const generarUltimos6Meses = (fechaSalida) => {
   const fechaBase = fechaSalida ? new Date(fechaSalida) : new Date();
   const meses = [];
   
   for (let i = 5; i >= 0; i--) {
      const fecha = new Date(fechaBase);
      fecha.setMonth(fecha.getMonth() - i);
      
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'long' });
      const año = fecha.getFullYear();
      
      meses.push({
         nombre: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
         año: año,
         fecha: fecha.toISOString().split('T')[0]
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
   if (!aumentos || aumentos.length === 0) {
      return salarioBase;
   }
   
   const fechaMesObj = new Date(fechaMes);
   const fechaIngresoObj = new Date(fechaIngreso);
   let salarioActual = salarioBase;
   
   // Verificar si el mes es anterior a la fecha de ingreso
   if (fechaMesObj < fechaIngresoObj) {
      return '0';
   }
   
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
   const ultimos6Meses = datosEmpleado ? generarUltimos6Meses(datosEmpleado.fecha_salida_empleado_gestor) : [];
   const aumentos = datosEmpleado?.aumentos_Json || [];
   const salarioBase = datosEmpleado?.salario_base_empleado_gestor || '0';

   return (
      <div className="row mt-3">
         <div className="col-12">
            <div className="card">
               <div className="card-body" style={{ padding: '15px' }}>
                  {/* Header con Logo y Título */}
                  <div className="row mb-3">
                     <div className="col-6">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                           <div style={{ 
                              backgroundColor: '#007bff', 
                              color: 'white', 
                              padding: '8px 12px', 
                              borderRadius: '5px',
                              marginRight: '12px',
                              fontWeight: 'bold',
                              fontSize: '16px'
                           }}>
                              GT3
                           </div>
                                                          <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                     Gestión en Tercerización
                                     {datosEmpleado && datosEmpleado.moneda_pago_empleado_gestor && (
                                        <span style={{ color: '#007bff', marginLeft: '5px' }}>
                                           ({datosEmpleado.moneda_pago_empleado_gestor})
                                        </span>
                                     )}
                                  </div>
                               </div>
                        </div>
                     </div>
                     <div className="col-6 text-center">
                        <h5 style={{ fontWeight: 'bold', margin: '0', fontSize: '16px' }}>GT3 Gestión en Tercerización</h5>
                        <h4 style={{ fontWeight: 'bold', margin: '8px 0', color: '#007bff', fontSize: '18px' }}>LIQUIDACIÓN LABORAL</h4>
                     </div>
                  </div>

                  {/* Datos del Empleado */}
                  <div className="row mb-3">
                     <div className="col-6">
                        <table className="table table-borderless table-sm">
                           <tbody>
                              <tr>
                                 <td style={{ fontWeight: 'bold', width: '30%', fontSize: '13px' }}>Código:</td>
                                 <td style={{ backgroundColor: '#e3f2fd', padding: '3px', fontSize: '13px' }}>
                                    {datosEmpleado ? datosEmpleado.numero_socio_empleado_gestor : '--'}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '13px' }}>Nombre:</td>
                                 <td style={{ backgroundColor: '#e3f2fd', padding: '3px', fontSize: '13px' }}>
                                    {datosEmpleado ? datosEmpleado.nombre_completo_empleado_gestor : '--'}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '13px' }}>Cédula:</td>
                                 <td style={{ backgroundColor: '#e3f2fd', padding: '3px', fontSize: '13px' }}>
                                    {datosEmpleado ? datosEmpleado.cedula_empleado_gestor : '--'}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '13px' }}>Puesto:</td>
                                 <td style={{ backgroundColor: '#e3f2fd', padding: '3px', fontSize: '13px' }}>
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
                                 <td style={{ fontWeight: 'bold', width: '40%', fontSize: '13px' }}>Fecha de ingreso:</td>
                                 <td style={{ backgroundColor: '#e3f2fd', padding: '3px', fontSize: '13px' }}>
                                    {datosEmpleado ? datosEmpleado.fecha_ingreso_empleado_gestor : '--'}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '13px' }}>Fecha salida:</td>
                                 <td style={{ backgroundColor: '#e3f2fd', padding: '3px', fontSize: '13px' }}>
                                    {fechaSalida}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '13px' }}>Dias:</td>
                                 <td style={{ fontSize: '13px' }}>
                                    {datosEmpleado ? dias : '--'}
                                 </td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '13px' }}>Años:</td>
                                 <td style={{ fontSize: '13px' }}>
                                    {anos}
                                 </td>
                              </tr>
                                                               <tr>
                                    <td style={{ fontWeight: 'bold', fontSize: '13px' }}>Meses:</td>
                                    <td style={{ fontSize: '13px' }}>{meses}</td>
                                 </tr>
                           </tbody>
                        </table>
                        {datosEmpleado && !datosEmpleado.fecha_salida_empleado_gestor && (
                           <div style={{ 
                              color: 'red', 
                              fontSize: '11px', 
                              marginTop: '5px',
                              fontStyle: 'italic'
                           }}>
                              ⚠️ La fecha de salida de este empleado se calcula al día de hoy porque no tiene fecha de salida
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Remuneraciones */}
                  <div className="row mb-3">
                     <div className="col-6">
                        <h6 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>Remuneraciones de los últimos 6 meses completo</h6>
                                                 <table className="table table-bordered table-sm" style={{ fontSize: '12px' }}>
                            <tbody>
                               {ultimos6Meses.map((mes, index) => {
                                  const valorRemuneracion = obtenerValorRemuneracion(aumentos, mes.fecha, salarioBase);
                                  const esUltimoMes = index === ultimos6Meses.length - 1;
                                  return (
                                     <tr key={index}>
                                        <td style={{ fontWeight: 'bold' }}>{mes.nombre}</td>
                                        <td style={{ 
                                           backgroundColor: esUltimoMes ? '#e3f2fd' : '',
                                           fontWeight: esUltimoMes ? 'bold' : 'normal',
                                           textAlign: 'right'
                                        }}>
                                           {valorRemuneracion ? parseInt(valorRemuneracion).toLocaleString() : '--'}
                                        </td>
                                     </tr>
                                  );
                               })}
                               <tr style={{ backgroundColor: '#e3f2fd' }}>
                                  <td style={{ fontWeight: 'bold' }}>Total:</td>
                                  <td style={{ fontWeight: 'bold', textAlign: 'right' }}>
                                     ₡ {ultimos6Meses.reduce((total, mes) => {
                                        const valor = obtenerValorRemuneracion(aumentos, mes.fecha, salarioBase);
                                        return total + (parseInt(valor) || 0);
                                     }, 0).toLocaleString()}
                                  </td>
                               </tr>
                            </tbody>
                         </table>
                     </div>
                     <div className="col-6">
                        <h6 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>Remuneraciones acumuladas para calculo de remuneració 13</h6>
                        <table className="table table-bordered table-sm" style={{ fontSize: '12px' }}>
                           <tbody>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>diciembre-24</td>
                                 <td>300,000</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>enero-25</td>
                                 <td>350,000</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>febrero-25</td>
                                 <td>350,000</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>marzo-25</td>
                                 <td>375,000</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>abril-25</td>
                                 <td>250,000</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>mayo-25</td>
                                 <td>375,000</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>junio-25</td>
                                 <td>350,000</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', border: '2px solid #28a745' }}>julio-25</td>
                                 <td style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>476,667</td>
                              </tr>
                              <tr style={{ backgroundColor: '#e3f2fd' }}>
                                 <td style={{ fontWeight: 'bold' }}>Total:</td>
                                 <td style={{ fontWeight: 'bold' }}>₡ 2,826,667</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Promedios */}
                  <div className="row mb-3">
                     <div className="col-6">
                        <h6 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>Remuneración promedio mensual</h6>
                        <table className="table table-borderless table-sm">
                           <tbody>
                                                             <tr>
                                  <td style={{ fontWeight: 'bold', width: '30%', fontSize: '13px' }}>Meses:</td>
                                  <td style={{ fontSize: '13px' }}>{meses}</td>
                               </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '13px' }}>Promedio mensual:</td>
                                 <td style={{ backgroundColor: '#fff3cd', fontWeight: 'bold', fontSize: '13px' }}>₡ 476,667</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                     <div className="col-6">
                        <h6 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>Remuneración promedio diario</h6>
                        <table className="table table-borderless table-sm">
                           <tbody>
                              <tr>
                                 <td style={{ fontWeight: 'bold', width: '30%', fontSize: '13px' }}>Dias:</td>
                                 <td style={{ fontSize: '13px' }}>386.00</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold', fontSize: '13px' }}>Promedio diario:</td>
                                 <td style={{ backgroundColor: '#fff3cd', fontWeight: 'bold', fontSize: '13px' }}>₡ 15,888.90</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Beneficios y deducciones */}
                  <div className="row mb-3">
                     <div className="col-12">
                        <h6 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>Beneficios y deducciones</h6>
                        <table className="table table-bordered table-sm" style={{ fontSize: '12px' }}>
                           <thead>
                              <tr>
                                 <th style={{ fontWeight: 'bold' }}>Detalle</th>
                                 <th style={{ fontWeight: 'bold' }}>Base</th>
                                 <th style={{ fontWeight: 'bold' }}>Unidad</th>
                                 <th style={{ fontWeight: 'bold' }}>Cantidad</th>
                                 <th style={{ fontWeight: 'bold' }}>Monto</th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>Aguinaldo</td>
                                 <td>2,826,667</td>
                                 <td>porcentaje</td>
                                 <td>12</td>
                                 <td>235,556</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>Vacaciones</td>
                                 <td>15,889</td>
                                 <td>días</td>
                                 <td>1</td>
                                 <td>15,889</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>Preaviso Art. 28 CDT</td>
                                 <td>15,889</td>
                                 <td>días</td>
                                 <td style={{ color: 'red' }}>0</td>
                                 <td>-</td>
                              </tr>
                              <tr>
                                 <td style={{ fontWeight: 'bold' }}>Cesantía Art. 29 CDT</td>
                                 <td>15,889</td>
                                 <td>días</td>
                                 <td style={{ color: 'red' }}>0</td>
                                 <td>-</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Total por pagar */}
                  <div className="row mb-3">
                     <div className="col-12">
                        <div style={{ 
                           backgroundColor: '#fff3cd', 
                           padding: '10px', 
                           borderRadius: '5px',
                           textAlign: 'center'
                        }}>
                           <h5 style={{ fontWeight: 'bold', margin: '0', fontSize: '16px' }}>
                              Total por pagar: ₡ 251,444
                           </h5>
                        </div>
                     </div>
                  </div>

                  {/* Observaciones */}
                  <div className="row">
                     <div className="col-12">
                        <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Observaciones:</label>
                        <textarea 
                           className="form-control" 
                           rows="2" 
                           style={{ marginTop: '3px', fontSize: '13px' }}
                        ></textarea>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

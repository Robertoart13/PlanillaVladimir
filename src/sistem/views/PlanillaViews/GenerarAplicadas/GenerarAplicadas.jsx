import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchData_api } from "../../../../store/fetchData_api/fetchData_api_Thunks";
import { formatCurrency, formatCurrencyUSD } from "../../../../hooks/formatCurrency";
import ModalDetalleEmpleado from "./ModalDetalleEmpleado";    

/**
 * =========================
 * CONSTANTS & CONFIGURATION    
 * =========================
 */

/** Configuración de columnas para la tabla principal de planilla */
const PAYROLL_COLUMNS = [
   { key: "nombre", label: "Nombre Socio", style: { minWidth: 180 } },
   { key: "cedula", label: "Cédula", style: { minWidth: 100 } },
   { key: "compensacion_base", label: "Compensación Base", type: "number" },
   { key: "devengado", label: "Devengado", type: "number" },
   { key: "cargas_sociales", label: "S.T.I CCSS", type: "number" },
   { key: "monto_rtn_neto", label: "Monto de RTN Neto", type: "number", style: { minWidth: 150 } },
   { key: "monto_neto", label: "Monto Neto", type: "number", style: { minWidth: 180 } },
   { key: "accion", label: "Acciones" },
   { key: "estado", label: "Estado" },
];

/** Configuración de columnas para la tabla de detalles */
const SUBTABLE_COLUMNS = [
   { key: "categoria", label: "Categoria", style: { minWidth: 150 } },
   { key: "tipoAccion", label: "Tipo de Accion", style: { minWidth: 100 } },
   { key: "monto", label: "Monto", type: "number", style: { minWidth: 120 } },
   { key: "tipo", label: "Tipo (+/-)", style: { minWidth: 120 } },
   { key: "estado", label: "Estado", style: { minWidth: 200 } },
];

/** Opciones de tamaño de página para la paginación */
const PAGE_SIZES = [100000, 10, 30, 60, 80, 100];

/**
 * =========================
 * COMPENSATION CALCULATION UTILITIES
 * =========================
 */

/**
 * Calcula la compensación base según el tipo de planilla del empleado
 * @param {number} salarioBase - Compensación base del empleado
 * @param {string} tipoPlanilla - Tipo de planilla (mensual, quincenal, semanal)
 * @returns {number} Compensación base calculada
 */
const calcularCompensacionBase = (salarioBase, tipoPlanilla) => {
   if (!salarioBase || salarioBase <= 0) return 0;
   
   const salario = parseFloat(salarioBase);
   
   switch (tipoPlanilla?.toLowerCase()) {
      case 'mensual':
         // Para planilla mensual, se toma la compensación completa
         return salario;
         
      case 'quincenal':
         // Para planilla quincenal, se divide la compensación en 2
         return salario / 2;
         
      case 'semanal':
         // Para planilla semanal, se calcula según la ley costarricense
         // 52 semanas al año / 12 meses = 4.33 semanas por mes
         return salario * 4.33;
         
      default:
         // Si no se especifica tipo, se asume mensual
         // console.warn(`Tipo de planilla no reconocido: ${tipoPlanilla}. Se asume mensual.`);
         return salario;
   }
};

/**
 * Formatea la compensación base según la moneda de pago
 * @param {number} compensacionBase - Compensación base calculada
 * @param {string} monedaPago - Moneda de pago del empleado
 * @param {number} salarioBase - Compensación base original (para casos de doble moneda)
 * @param {string} tipoPlanilla - Tipo de planilla del empleado
 * @returns {string} Compensación base formateada
 */
const formatearCompensacionBase = (compensacionBase, monedaPago, salarioBase, tipoPlanilla) => {
   if (!compensacionBase || compensacionBase <= 0) return "0";
   
   switch (monedaPago?.toLowerCase()) {
      case 'dolares':
         return formatCurrencyUSD(compensacionBase);
         
      case 'colones_y_dolares':
         // Para doble moneda, calculamos ambas compensaciones usando el tipo de planilla correcto
         const compensacionColones = calcularCompensacionBase(salarioBase, tipoPlanilla);
         const compensacionDolares = calcularCompensacionBase(salarioBase, tipoPlanilla);
         return `${formatCurrency(compensacionColones)} / ${formatCurrencyUSD(compensacionDolares)}`;
         
      case 'colones':
      default:
         return formatCurrency(compensacionBase);
   }
};

/**
 * Valida y obtiene los datos básicos del empleado
 * @param {Object} empleado - Datos del empleado de la API
 * @returns {Object|null} Datos validados o null si no son válidos
 */
const validarDatosEmpleado = (empleado) => {
   if (!empleado) return null;
   
   const datosRequeridos = {
      nombre: empleado.nombre_completo_empleado_gestor,
      cedula: empleado.numero_socio_empleado_gestor,
      compensacionBase: empleado.salario_base_empleado_gestor,
      tipoPlanilla: empleado.tipo_planilla_empleado_gestor,
      monedaPago: empleado.moneda_pago_empleado_gestor,
      rtIns: empleado.rt_ins_empleado_gestor, // Campo para RTN
      ccss: empleado.ccss_empleado_gestor // Campo para CCSS
   };
   
   // Validar que existan los datos requeridos
   const datosFaltantes = Object.entries(datosRequeridos)
      .filter(([key, value]) => {
         // rtIns y ccss pueden ser 0 o 1, ambos son válidos
         if (key === 'rtIns' || key === 'ccss') return false;
         return !value;
      })
      .map(([key]) => key);
   
   if (datosFaltantes.length > 0) {
      // console.warn(`Empleado ${datosRequeridos.cedula || 'sin cédula'} - Datos faltantes:`, datosFaltantes);
      return null;
   }
   
   return datosRequeridos;
};

/**
 * Calcula el devengado total para un empleado
 * @param {Object} empleado - Datos del empleado de la API
 * @param {number} compensacionBase - Compensación base calculada
 * @returns {Object} Información del devengado total
 */
const calcularDevengado = (empleado, compensacionBase) => {
   let devengadoTotal = compensacionBase; // Empezar con compensación base
   
   // Sumar compensación anual
   if (empleado.aumentos && Array.isArray(empleado.aumentos)) {
      empleado.aumentos.forEach(aumento => {
         const montoAumento = parseFloat(aumento.monto_aumento_gestor) || 0;
         devengadoTotal += montoAumento;
      });
   }
   
   // Sumar compensación extra
   if (empleado.horas_extras && Array.isArray(empleado.horas_extras)) {
      empleado.horas_extras.forEach(horaExtra => {
         const montoHoraExtra = parseFloat(horaExtra.monto_compensacion_calculado_gestor) || 0;
         devengadoTotal += montoHoraExtra;
      });
   }
   
   // Sumar compensación por métrica
   if (empleado.compensacion_metrica && Array.isArray(empleado.compensacion_metrica)) {
      empleado.compensacion_metrica.forEach(compensacion => {
         const montoCompensacion = parseFloat(compensacion.monto_compensacion_metrica_gestor) || 0;
         devengadoTotal += montoCompensacion;
      });
   }
   
   // Restar rebajo a compensación
   if (empleado.rebajos_compensacion && Array.isArray(empleado.rebajos_compensacion)) {
      empleado.rebajos_compensacion.forEach(rebajo => {
         const montoRebajo = parseFloat(rebajo.monto_rebajo_calculado) || 0;
         devengadoTotal -= montoRebajo;
      });
   }
   
   // Formatear según moneda
   let devengadoFormateado = "0";
   if (devengadoTotal > 0) {
      switch (empleado.moneda_pago_empleado_gestor?.toLowerCase()) {
         case 'dolares':
            devengadoFormateado = formatCurrencyUSD(devengadoTotal);
            break;
         case 'colones_y_dolares':
            devengadoFormateado = formatCurrency(devengadoTotal);
            break;
         case 'colones':
         default:
            devengadoFormateado = formatCurrency(devengadoTotal);
            break;
      }
   }
   
   return {
      monto: devengadoTotal,
      formateado: devengadoFormateado
   };
};

/**
 * Transforma un empleado individual al formato de la tabla
 * @param {Object} empleado - Datos del empleado de la API
 * @returns {Object} Empleado transformado para la tabla
 */
const transformarEmpleado = (empleado) => {
   // Validar datos del empleado
   const datosEmpleado = validarDatosEmpleado(empleado);
   if (!datosEmpleado) {
      return null;
   }
   
   // Calcular compensación base
   const compensacionBaseCalculada = calcularCompensacionBase(
      datosEmpleado.compensacionBase,
      datosEmpleado.tipoPlanilla
   );
   
   // Formatear compensación base según moneda
   const compensacionBaseFormateada = formatearCompensacionBase(
      compensacionBaseCalculada,
      datosEmpleado.monedaPago,
      datosEmpleado.compensacionBase,
      datosEmpleado.tipoPlanilla
   );
   
   // Calcular devengado total
   const devengadoTotal = calcularDevengado(empleado, compensacionBaseCalculada);
   
   // Calcular RTN neto total
   const rtnNetoTotal = calcularRTNNetoTotal(empleado, compensacionBaseCalculada);
   
   // Calcular Cargas Sociales
   const cargasSociales = calcularCargasSociales(empleado);
   
   return {
      nombre: datosEmpleado.nombre,
      cedula: datosEmpleado.cedula,
      compensacion_base: compensacionBaseFormateada,
      devengado: devengadoTotal.formateado,
      devengado_numerico: devengadoTotal.monto, // Valor numérico para cálculos
      cargas_sociales: cargasSociales.formateado,
      monto_rtn_neto: rtnNetoTotal.formateado,
      monto_rtn_numerico: rtnNetoTotal.monto, // Valor numérico para cálculos
      monto_neto: devengadoTotal.formateado, // Igual al devengado
      accion: "",
      estado: "Pendiente", // Siempre pendiente
   };
};

/**
 * Función principal para transformar los datos de la API al formato de la tabla
 * @param {Array} planillaData - Datos de la API
 * @returns {Array} Datos transformados para la tabla
 */
const transformarDatosPlanilla = (planillaData) => {
   // Validar entrada
   if (!planillaData || !Array.isArray(planillaData)) {
      // console.warn('transformarDatosPlanilla: Datos de planilla inválidos o vacíos');
      return [];
   }

   // console.log('Datos de planilla recibidos:', planillaData);
   
   // Transformar cada empleado
   const empleadosTransformados = planillaData
      .map(empleado => transformarEmpleado(empleado))
      .filter(empleado => empleado !== null); // Filtrar empleados con datos inválidos
   
   // console.log('Empleados transformados:', empleadosTransformados);
   
   return empleadosTransformados;
};

/**
 * =========================
 * RTN CALCULATION UTILITIES
 * =========================
 */

/**
 * Calcula el RTN neto total para un empleado (solo sobre compensación base)
 * @param {Object} empleado - Datos del empleado de la API
 * @param {number} compensacionBase - Compensación base calculada
 * @returns {Object} Información del RTN neto total
 */
const calcularRTNNetoTotal = (empleado, compensacionBase) => {
   const rtnInfo = calcularRTN(compensacionBase, empleado.rt_ins_empleado_gestor);
   
   if (!rtnInfo.aplica) {
      return {
         monto: 0,
         formateado: "0",
         aplica: false
      };
   }
   
   // RTN es solo el 1% sobre la compensación base
   const rtnTotal = rtnInfo.monto;
   
   // Formatear según moneda
   let rtnFormateado = "0";
   if (rtnTotal > 0) {
      switch (empleado.moneda_pago_empleado_gestor?.toLowerCase()) {
         case 'dolares':
            rtnFormateado = formatCurrencyUSD(rtnTotal);
            break;
         case 'colones_y_dolares':
            rtnFormateado = formatCurrency(rtnTotal); // RTN se aplica en colones
            break;
         case 'colones':
         default:
            rtnFormateado = formatCurrency(rtnTotal);
            break;
      }
   }
   
   return {
      monto: rtnTotal,
      formateado: rtnFormateado,
      aplica: true
   };
};

/**
 * Calcula las Cargas Sociales (S.T.I CCSS) para un empleado según el tipo de planilla
 * @param {Object} empleado - Datos del empleado de la API
 * @returns {Object} Información de las Cargas Sociales
 */
const calcularCargasSociales = (empleado) => {
   const ccssEmpleado = parseInt(empleado.ccss_empleado_gestor) || 0;
   
   if (ccssEmpleado !== 1) {
      return {
         aplica: false,
         monto: 0,
         formateado: "0",
         descripcion: "No aplica"
      };
   }
   
   const montoAsegurado = parseFloat(empleado.montoAsegurado_gestor_empelado) || 0;
   
   if (montoAsegurado <= 0) {
      return {
         aplica: true,
         monto: 0,
         formateado: "0",
         descripcion: "Monto asegurado inválido"
      };
   }
   
   // Calcular S.T.I CCSS según el tipo de planilla del empleado
   const tipoPlanilla = empleado.tipo_planilla_empleado_gestor;
   let ccssCalculado = montoAsegurado;
   
   switch (tipoPlanilla?.toLowerCase()) {
      case 'mensual':
         // Para planilla mensual, se toma el monto completo
         ccssCalculado = montoAsegurado;
         break;
         
      case 'quincenal':
         // Para planilla quincenal, se divide el monto en 2
         ccssCalculado = montoAsegurado / 2;
         break;
         
      case 'semanal':
         // Para planilla semanal, se calcula según la ley costarricense
         // 52 semanas al año / 12 meses = 4.33 semanas por mes
         ccssCalculado = montoAsegurado * 4.33;
         break;
         
      default:
         // Si no se especifica tipo, se asume mensual
         // console.warn(`Tipo de planilla no reconocido para S.T.I CCSS: ${tipoPlanilla}. Se asume mensual.`);
         ccssCalculado = montoAsegurado;
         break;
   }
   
   // Formatear según moneda
   let ccssFormateado = "0";
   if (ccssCalculado > 0) {
      switch (empleado.moneda_pago_empleado_gestor?.toLowerCase()) {
         case 'dolares':
            ccssFormateado = formatCurrencyUSD(ccssCalculado);
            break;
         case 'colones_y_dolares':
            ccssFormateado = formatCurrency(ccssCalculado); // S.T.I CCSS se aplica en colones
            break;
         case 'colones':
         default:
            ccssFormateado = formatCurrency(ccssCalculado);
            break;
      }
   }
   
   return {
      aplica: true,
      monto: ccssCalculado,
      formateado: ccssFormateado,
      descripcion: `S.T.I CCSS sobre monto asegurado (${tipoPlanilla || 'mensual'})`
   };
};

/**
 * Calcula el RTN (1%) sobre la compensación base
 * @param {number} compensacionBase - Compensación base calculada
 * @param {number} rtInsEmpleado - Valor del campo rt_ins_empleado_gestor (0 o 1)
 * @returns {Object} Objeto con información del RTN
 */
const calcularRTN = (compensacionBase, rtInsEmpleado) => {
   const rtIns = parseInt(rtInsEmpleado) || 0;
   
   if (rtIns !== 1) {
      return {
         aplica: false,
         monto: 0,
         descripcion: "No aplica"
      };
   }
   
   if (!compensacionBase || compensacionBase <= 0) {
      return {
         aplica: true,
         monto: 0,
         descripcion: "Compensación base inválida"
      };
   }
   
   const montoRTN = compensacionBase * 0.01; // 1% de la compensación base
   
   return {
      aplica: true,
      monto: montoRTN,
      descripcion: "RTN 1% sobre compensación base"
   };
};

/**
 * Genera el detalle de RTN para la subtabla
 * @param {Object} empleado - Datos del empleado de la API
 * @param {number} compensacionBase - Compensación base calculada
 * @param {string} monedaPago - Moneda de pago del empleado
 * @returns {Object} Detalle de RTN formateado
 */
const generarDetalleRTN = (empleado, compensacionBase, monedaPago) => {
   // Calcular RTN (solo sobre compensación base)
   const rtnInfo = calcularRTN(compensacionBase, empleado.rt_ins_empleado_gestor);
   
   if (!rtnInfo.aplica) {
      return {
         categoria: "RTN",
         tipoAccion: "Deducción",
         monto: "0",
         tipo: "-",
         estado: "No aplica"
      };
   }
   
   // RTN es solo el 1% sobre la compensación base
   const rtnTotal = rtnInfo.monto;
   
   // Formatear monto según moneda específica del empleado
   let montoFormateado = "0";
   if (rtnTotal > 0) {
      switch (monedaPago?.toLowerCase()) {
         case 'dolares':
            montoFormateado = formatCurrencyUSD(rtnTotal);
            break;
         case 'colones_y_dolares':
            // Para doble moneda, mostramos solo en colones (RTN se aplica en colones)
            montoFormateado = formatCurrency(rtnTotal);
            break;
         case 'colones':
         default:
            montoFormateado = formatCurrency(rtnTotal);
            break;
      }
   }
   
   return {
      categoria: "RTN",
      tipoAccion: "Deducción",
      monto: montoFormateado,
      tipo: "-",
      estado: "Pendiente"
   };
};

/**
 * Genera el detalle de Cargas Sociales para la subtabla
 * @param {Object} ccssInfo - Información de las Cargas Sociales calculadas
 * @param {string} monedaPago - Moneda de pago del empleado
 * @returns {Object} Detalle de S.T.I CCSS formateado
 */
const generarDetalleCCSS = (ccssInfo, monedaPago) => {
   if (!ccssInfo.aplica) {
      return {
         categoria: "S.T.I CCSS",
         tipoAccion: "Deducción",
         monto: "0",
         tipo: "-",
         estado: "No aplica"
      };
   }
   
   return {
      categoria: "S.T.I CCSS",
      tipoAccion: "Deducción",
      monto: ccssInfo.formateado,
      tipo: "-",
      estado: "Pendiente"
   };
};

/**
 * Función para generar datos de subtabla basados en los arrays de la API
 * @param {Array} planillaData - Datos de la API
 * @returns {Object} Datos de subtabla organizados por cédula
 */
const generarDatosSubtabla = (planillaData) => {
   if (!planillaData || !Array.isArray(planillaData)) return {};
   
   const subtableData = {};
   
   planillaData.forEach(empleado => {
      const cedula = empleado.numero_socio_empleado_gestor;
      const detalles = [];
      
      // Calcular compensación base para RTN
      const compensacionBase = calcularCompensacionBase(
         empleado.salario_base_empleado_gestor,
         empleado.tipo_planilla_empleado_gestor
      );
      
      // 1. PRIMERO: Agregar compensación anual
      if (empleado.aumentos && Array.isArray(empleado.aumentos)) {
         empleado.aumentos.forEach(aumento => {
            const montoAumento = parseFloat(aumento.monto_aumento_gestor) || 0;
            let montoFormateado = "0";
            
            // Formatear según moneda del empleado
            if (montoAumento > 0) {
               switch (empleado.moneda_pago_empleado_gestor?.toLowerCase()) {
                  case 'dolares':
                     montoFormateado = formatCurrencyUSD(montoAumento);
                     break;
                  case 'colones_y_dolares':
                     montoFormateado = formatCurrency(montoAumento);
                     break;
                  case 'colones':
                  default:
                     montoFormateado = formatCurrency(montoAumento);
                     break;
               }
            }
            
            detalles.push({
               categoria: "Compensación Anual",
               tipoAccion: "Aumento",
               monto: montoFormateado,
               tipo: "+",
               estado: aumento.estado_planilla_aumento_gestor || "Pendiente"
            });
         });
      }
      
      // 2. SEGUNDO: Agregar compensación extra
      if (empleado.horas_extras && Array.isArray(empleado.horas_extras)) {
         empleado.horas_extras.forEach(horaExtra => {
            const montoHoraExtra = parseFloat(horaExtra.monto_compensacion_calculado_gestor) || 0;
            let montoFormateado = "0";
            
            // Formatear según moneda del empleado
            if (montoHoraExtra > 0) {
               switch (empleado.moneda_pago_empleado_gestor?.toLowerCase()) {
                  case 'dolares':
                     montoFormateado = formatCurrencyUSD(montoHoraExtra);
                     break;
                  case 'colones_y_dolares':
                     montoFormateado = formatCurrency(montoHoraExtra);
                     break;
                  case 'colones':
                  default:
                     montoFormateado = formatCurrency(montoHoraExtra);
                     break;
               }
            }
            
            detalles.push({
               categoria: "Compensación Extra",
               tipoAccion: "Ingreso",
               monto: montoFormateado,
               tipo: "+",
               estado: horaExtra.estado_compensacion_extra_gestor || "Pendiente"
            });
         });
      }
      
      // 3. TERCERO: Agregar compensación por métrica
      if (empleado.compensacion_metrica && Array.isArray(empleado.compensacion_metrica)) {
         empleado.compensacion_metrica.forEach(compensacion => {
            const montoCompensacion = parseFloat(compensacion.monto_compensacion_metrica_gestor) || 0;
            let montoFormateado = "0";
            
            // Formatear según moneda del empleado
            if (montoCompensacion > 0) {
               switch (empleado.moneda_pago_empleado_gestor?.toLowerCase()) {
                  case 'dolares':
                     montoFormateado = formatCurrencyUSD(montoCompensacion);
                     break;
                  case 'colones_y_dolares':
                     montoFormateado = formatCurrency(montoCompensacion);
                     break;
                  case 'colones':
                  default:
                     montoFormateado = formatCurrency(montoCompensacion);
                     break;
               }
            }
            
            detalles.push({
               categoria: "Compensación por Métrica",
               tipoAccion: "Ingreso",
               monto: montoFormateado,
               tipo: "+",
               estado: compensacion.estado_compensacion_metrica_gestor || "Pendiente"
            });
         });
      }
      
      // 4. CUARTO: Agregar rebajo a compensación
      if (empleado.rebajos_compensacion && Array.isArray(empleado.rebajos_compensacion)) {
         empleado.rebajos_compensacion.forEach(rebajo => {
            const montoRebajo = parseFloat(rebajo.monto_rebajo_calculado) || 0;
            let montoFormateado = "0";
            
            // Formatear según moneda del empleado
            if (montoRebajo > 0) {
               switch (empleado.moneda_pago_empleado_gestor?.toLowerCase()) {
                  case 'dolares':
                     montoFormateado = formatCurrencyUSD(montoRebajo);
                     break;
                  case 'colones_y_dolares':
                     montoFormateado = formatCurrency(montoRebajo);
                     break;
                  case 'colones':
                  default:
                     montoFormateado = formatCurrency(montoRebajo);
                     break;
               }
            }
            
            detalles.push({
               categoria: "Rebajo a Compensación",
               tipoAccion: "Deducción",
               monto: montoFormateado,
               tipo: "-",
               estado: rebajo.estado_rebajo || "Pendiente"
            });
         });
      }
      
      // 5. QUINTO: Calcular y agregar S.T.I CCSS (RTN removido de detalles)
      const ccssInfo = calcularCargasSociales(empleado);
      const detalleCCSS = generarDetalleCCSS(ccssInfo, empleado.moneda_pago_empleado_gestor);
      detalles.push(detalleCCSS);
      
      subtableData[cedula] = detalles;
   });
   
   return subtableData;
};

/**
 * ================
 * UTILITY FUNCTIONS
 * ================ 
 */

/**
 * Genera el estilo para las celdas de la tabla principal
 * @param {Object} col - Definición de la columna
 * @param {boolean} isSelected - Indica si la fila está seleccionada
 * @param {number} idx - Índice de la fila
 * @returns {Object} Objeto de estilos CSS
 */
const getTableCellStyle = (col, isSelected, idx) => ({
   ...col.style,
   borderRight: "1px solid #dee2e6",
   borderLeft: "1px solid #dee2e6",
   background: !isSelected && idx % 2 !== 0 ? "#f8f9fa" : undefined,
});

/**
 * Genera el estilo para los encabezados de la tabla
 * @param {Object} col - Definición de la columna
 * @returns {Object} Objeto de estilos CSS
 */
const getTableHeaderStyle = (col) => ({
   ...col.style,
   background: "#e9ecef",
   borderBottom: "2px solid #adb5bd",
   borderTop: "2px solid #adb5bd",
   textAlign: "center",
});

/**
 * =========================
 * COMPONENTS
 * =========================
 */

/**
 * Componente de skeleton loader para las filas de la tabla
 * @param {number} count - Número de filas skeleton a mostrar
 * @param {Array} columns - Definición de columnas para generar el número correcto de celdas
 * @returns {JSX.Element} Filas skeleton
 */
const TableSkeleton = ({ count = 5, columns = PAYROLL_COLUMNS }) => {
   return (
      <>
         {Array.from({ length: count }, (_, index) => (
            <tr key={`skeleton-${index}`} className="skeleton-row">
               {/* Data columns */}
               {columns.map((col, colIndex) => (
                  <td key={`skeleton-col-${colIndex}`} style={{ padding: "12px 8px" }}>
                     <div 
                        className="skeleton-text" 
                        style={{ 
                           height: "16px", 
                           width: `${Math.random() * 40 + 50}%`, 
                           borderRadius: "4px" 
                        }}
                     ></div>
                  </td>
               ))}
            </tr>
         ))}
      </>
   );
};

/**
 * Componente para mostrar los detalles de acciones de un empleado
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.columns - Definición de columnas
 * @param {Array} props.data - Datos a mostrar
 * @param {string} props.employeeName - Nombre del empleado
 * @returns {JSX.Element} Tabla de detalles
 */
const SubTable = ({ columns, data, employeeName }) => {
   return (
      <div className="employee-details-block mb-4">
         <div className="details-header">
            <i className="fas fa-user me-2"></i>
            Detalles de Acciones de personal: <b>{employeeName}</b>
         </div>
         <div className="details-table-wrapper">
            {(!data || data.length === 0) ? (
               <div className="text-center py-3 text-muted">
                  No hay datos disponibles para {employeeName}
               </div>
            ) : (
               <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                     <thead>
                        <tr>
                           {columns.map((col) => (
                              <th
                                 key={col.key}
                                 style={{
                                    ...col.style,
                                    fontSize: "0.95rem",
                                    padding: "8px 12px",
                                    textAlign: "center",
                                 }}
                              >
                                 {col.label}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        {data.map((row, idx) => (
                           <tr key={idx} style={{ fontSize: "0.93rem" }}>
                              {columns.map((col) => (
                                 <td
                                    key={col.key}
                                    style={{
                                       padding: "8px 12px",
                                       textAlign: col.key === "estado" || col.key === "tipo" ? "center" : col.type === "number" ? "right" : "left",
                                    }}
                                 >
                                    {col.key === "tipo" ? (
                                       <span
                                          className={`badge bg-light-${row[col.key] === "+" ? "success" : "danger"}`}
                                          style={{ fontSize: "0.80rem" }}
                                       >
                                          {row[col.key]}
                                       </span>
                                    ) : col.key === "estado" ? (
                                       <span
                                          className={`badge bg-light-${row[col.key] === "Pendiente" ? "warning" : "success"}`}
                                          style={{ fontSize: "0.80rem" }}
                                       >
                                          {row[col.key]}
                                       </span>
                                    ) : col.key === "monto" ? (
                                       <span style={{ fontWeight: 500, color: "#2d3748" }}>{row[col.key]}</span>
                                    ) : (
                                       row[col.key]
                                    )}
                                 </td>
                              ))}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      </div>
   );
};

/**
 * Componente principal de la tabla de planilla con funcionalidad de expansión
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Tabla de planilla
 */
const PayrollTable = ({
   columns,
   pageRows,
   disabled,
   planillaEstado,
   expandedRows,
   onRowToggle,
   subtableData,
   isLoading = false,
   pageSize = 5,
   onVerDetalle,
}) => {
   return (
      <table
         className="table table-hover table-bordered table-striped datatable-table align-middle"
         style={{
            minWidth: 1200,
            fontSize: "0.95rem",
            borderCollapse: "separate",
            borderSpacing: 0,
         }}
      >
         <thead className="table-light sticky-top" style={{ zIndex: 2 }}>
            <tr>
               {columns.map((col) => (
                  <th key={col.key} style={getTableHeaderStyle(col)}>
                     {col.label}
                  </th>
               ))}
            </tr>
         </thead>
         <tbody>
            {isLoading ? (
               <TableSkeleton count={pageSize || 5} columns={columns} />
            ) : (
               pageRows.map((row, idx) => {
                  const isExpanded = expandedRows.includes(idx);
                  // const rowDisabled = disabled || planillaEstado === "Procesada";
                  const rowDisabled = disabled; // Solo deshabilitar si se pasa explicitamente
                  const employeeData = subtableData[row.cedula] || [];

                  return (
                     <React.Fragment key={idx}>
                        <tr
                           className={`${isExpanded ? "table-active" : ""}`}
                           style={{ cursor: "pointer" }}
                           onClick={() => !rowDisabled && onRowToggle(idx)}
                        >
                           {columns.map((col) => (
                              <td
                                 key={col.key}
                                 style={getTableCellStyle(col, false, idx)}
                                 onClick={(e) => {
                                    if (col.key === "accion") {
                                       e.stopPropagation();
                                    }
                                 }}
                              >
                                 {col.key === "accion" ? (
                                    <button
                                       className="btn btn-primary btn-sm"
                                       onClick={(e) => { e.stopPropagation(); onVerDetalle(row); }}
                                       disabled={rowDisabled}
                                    >
                                       <i className="fas fa-eye"> Ver detalle</i>
                                    </button>
                                 ) : col.key === "estado" ? (
                                    <span
                                       className={`badge bg-light-${row[col.key] === "Verificado" ? "success" : "danger"}`}
                                    >
                                       {row[col.key]}
                                    </span>
                                 ) : (
                                    row[col.key]
                                 )}
                              </td>
                           ))}
                        </tr>
                        {isExpanded && (
                           <tr>
                              <td colSpan={columns.length} style={{ padding: 0, border: "none" }}>
                                 <SubTable
                                    columns={SUBTABLE_COLUMNS}
                                    data={employeeData}
                                    employeeName={row.nombre}
                                 />
                              </td>
                           </tr>
                        )}
                     </React.Fragment>
                  );
               })
            )}
         </tbody>
      </table>
   );
};

/**
 * Componente de tabla de resultados de la planilla
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.totales - Totales calculados de la planilla
 * @param {number} props.porcentajeTarifa - Porcentaje de tarifa
 * @returns {JSX.Element} Tabla de resultados
 */
const ResultsTable = ({ totales, porcentajeTarifa }) => {

   // Determinar el porcentaje en formato porcentaje (ej: 0.05 => 5)
   let porcentajeMostrar = 0;
   if (porcentajeTarifa !== undefined && porcentajeTarifa !== null) {
      let num = Number(porcentajeTarifa);
      if (num > 1) {
         porcentajeMostrar = num;
      } else {
         porcentajeMostrar = num * 100;
      }
   }
   return (
      <div className="card shadow-sm">
         <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
               <i className="fas fa-calculator me-2"></i>
               Resumen de Totales
            </h5>
         </div>
         <div className="card-body p-0">
            <table className="table table-borderless results-table mb-0">
               <thead>
                  <tr>
                     <th style={{ width: "60%" }}>Concepto</th>
                     <th style={{ width: "40%", textAlign: "right" }}>Monto</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td>Suma de todos los devengados:</td>
                     <td style={{ textAlign: "right", fontWeight: "600" }}>
                        {formatCurrency(totales.totalDevengado)}
                     </td>
                  </tr>
                  <tr>
                     <td>Tarifa ({porcentajeMostrar}%):</td>
                     <td style={{ textAlign: "right", fontWeight: "600" }}>
                        {formatCurrency(totales.tarifa)}
                     </td>
                  </tr>
                  <tr>
                     <td>Suma RTI:</td>
                     <td style={{ textAlign: "right", fontWeight: "600" }}>
                        {formatCurrency(totales.sumaRTI)}
                     </td>
                  </tr>
                  <tr>
                     <td>IVA (13%):</td>
                     <td style={{ textAlign: "right", fontWeight: "600" }}>
                        {formatCurrency(totales.iva)}
                     </td>
                  </tr>
                  <tr className="total-row">
                     <td><strong>Total a facturar:</strong></td>
                     <td style={{ textAlign: "right" }}>
                        <strong>{formatCurrency(totales.totalFacturar)}</strong>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
   );
};

/**
 * Componente de paginación reutilizable
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente de paginación
 */
const TablePagination = ({
   pageSize,
   pageSizes,
   currentPage,
   totalPages,
   onPageSizeChange,
   onPageChange,
}) => {
   const pages = useMemo(() => {
      const arr = [];
      for (let i = 1; i <= totalPages; i++) {
         arr.push(
            <li key={i} className={`dt-paging-button page-item${currentPage === i ? " active" : ""}`}>
               <button
                  className="page-link"
                  type="button"
                  aria-current={currentPage === i ? "page" : undefined}
                  onClick={() => onPageChange(i)}
               >
                  {i}
               </button>
            </li>
         );
      }
      return arr;
   }, [currentPage, totalPages, onPageChange]);

   return (
      <div className="d-flex justify-content-end align-items-center mt-2 mb-2">
         <label className="me-2 mb-0" htmlFor="pageSizeSelect">
            Filas por página:
         </label>
         <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={onPageSizeChange}
            className="form-select d-inline-block me-3"
            style={{ width: 90 }}
         >
            {pageSizes.map((size) => (
               <option key={size} value={size}>
                  {size}
               </option>
            ))}
         </select>
         <ul className="pagination justify-content-center my-2 mb-0">
            <li className={`dt-paging-button page-item${currentPage === 1 ? " disabled" : ""}`}>
               <button
                  className="page-link"
                  type="button"
                  aria-label="First"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
               >
                  «
               </button>
            </li>
            <li className={`dt-paging-button page-item${currentPage === 1 ? " disabled" : ""}`}>
               <button
                  className="page-link"
                  type="button"
                  aria-label="Previous"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
               >
                  ‹
               </button>
            </li>
            {pages}
            <li className={`dt-paging-button page-item${currentPage === totalPages ? " disabled" : ""}`}>
               <button
                  className="page-link"
                  type="button"
                  aria-label="Next"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
               >
                  ›
               </button>
            </li>
            <li className={`dt-paging-button page-item${currentPage === totalPages ? " disabled" : ""}`}>
               <button
                  className="page-link"
                  type="button"
                  aria-label="Last"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
               >
                  »
               </button>
            </li>
         </ul>
      </div>
   );
};

/**
 * =========================
 * CALCULATION UTILITIES
 * =========================
 */

/**
 * Calcula los totales de la planilla basado en los datos transformados
 * @param {Array} rows - Datos transformados de la planilla
 * @param {number} porcentajeTarifa - Porcentaje de tarifa (por defecto 0.05)
 * @returns {Object} Objeto con todos los totales calculados
 */
const calcularTotalesPlanilla = (rows, porcentajeTarifa = 0.05) => {


   if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return {
         totalDevengado: 0,
         tarifa: 0,
         sumaRTI: 0,
         iva: 0,
         totalFacturar: 0
      };
   }

   // Suma de todos los devengados
   let totalDevengado = 0;
   // Suma de todos los Monto de RTN Neto (RTI)
   let sumaRTI = 0;

   rows.forEach((row, index) => {
      // Usar valores numéricos directamente para cálculos
      const devengadoNum = row.devengado_numerico || 0;
      const rtnNum = row.monto_rtn_numerico || 0;
      
      totalDevengado += devengadoNum;
      sumaRTI += rtnNum;
   });

   // Normalizar porcentajeTarifa
   let porcentaje = Number(porcentajeTarifa);
   if (isNaN(porcentaje) || porcentaje < 0) porcentaje = 0;
   if (porcentaje > 1) porcentaje = porcentaje / 100;

   // Tarifa dinámica
   const tarifa = totalDevengado * porcentaje;

   // IVA = (Total Devengados + Tarifa + RTI) * 0.13
   const iva = (totalDevengado + tarifa + sumaRTI) * 0.13;

   // Total a facturar
   const totalFacturar = totalDevengado + tarifa + sumaRTI + iva;

   return {
      totalDevengado,
      tarifa,
      sumaRTI,
      iva,
      totalFacturar
   };
};

/**
 * =========================
 * CUSTOM HOOKS
 * =========================
 */

/**
 * Hook personalizado para manejar la expansión de filas
 * @param {Object} params - Parámetros del hook
 * @returns {Function} Función para manejar toggle de filas
 */
const useHandleRowToggle = ({ expandedRows, setExpandedRows }) => {
   return useCallback(
      (idx) => {
         setExpandedRows((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
         );
      },
      [expandedRows, setExpandedRows]
   );
};

/**
 * =========================
 * MAIN COMPONENT
 * =========================
 */

/**
 * Componente principal para la generación de planillas
 * Permite seleccionar planillas, visualizar datos de empleados y gestionar la información
 * @returns {JSX.Element} Componente de generación de planillas
 */
export const PayrollGenerator = () => {
   // Estados principales
   const [rows, setRows] = useState([]);
   const [expandedRows, setExpandedRows] = useState([]);
   const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
   const [currentPage, setCurrentPage] = useState(1);

   // Estados de configuración
   const [planillaSeleccionada, setPlanillaSeleccionada] = useState("");

   // Estados para la API
   const [planillaData, setPlanillaData] = useState(null);
   const [planillasList, setPlanillasList] = useState([]);
   const [loading, setLoading] = useState(false);
   const [loadingPlanillas, setLoadingPlanillas] = useState(false);
   const [error, setError] = useState(null);

   // Hook de Redux y navegación
   const dispatch = useDispatch();
   const navigate = useNavigate();

   // Obtener datos de la planilla seleccionada
   const selectedPlanilla = planillasList.find(
      (p) => String(p.planilla_id) === String(planillaSeleccionada)
   );

   const planillaEstado = selectedPlanilla?.planilla_estado;
   const empresaSeleccionada = selectedPlanilla?.empresa_id;
   const tipoPlanilla = selectedPlanilla?.planilla_tipo;
   const planilla_moneda = selectedPlanilla?.planilla_moneda;




   // Cargar datos de planilla cuando se selecciona una
   useEffect(() => {
      const cargarDatosPlanilla = async () => {
         if (!planillaSeleccionada || !planillasList.length) {
            setPlanillaData(null);
            setRows([]);
            return;
         }

         // Buscar la planilla seleccionada en la lista actual
         const selectedPlanilla = planillasList.find(
            (p) => String(p.planilla_id) === String(planillaSeleccionada)
         );
         if (!selectedPlanilla) {
            setPlanillaData(null);
            setRows([]);
            return;
         }

         const empresaSeleccionada = selectedPlanilla.empresa_id;
         const tipoPlanilla = selectedPlanilla.planilla_tipo;
         const planilla_moneda = selectedPlanilla.planilla_moneda;

         try {
            setLoading(true);
            setError(null);

            const params = {
               empresa_id: empresaSeleccionada,
               planilla_id: planillaSeleccionada,
               tipo_planilla: tipoPlanilla,
               planilla_moneda: planilla_moneda,
            };

            const response = await dispatch(fetchData_api(params, "gestor/planilla/gestor/global"));   
            

            if (response.success && response.data.array?.length > 0) {
               setPlanillaData(response.data.array);
            } else {
               setError("No se encontraron datos de la planilla");
               setPlanillaData(null);
            }
         } catch (error) {

            setError("Error de conexión al cargar los datos");
            setPlanillaData(null);
         } finally {
            setLoading(false);
         }
      };

      cargarDatosPlanilla();
   }, [planillaSeleccionada, planillasList, dispatch]);

   // Actualizar rows cuando cambien los datos de la planilla
   useEffect(() => {
      if (planillaData && Array.isArray(planillaData)) {
         const datosTransformados = transformarDatosPlanilla(planillaData);
         setRows(datosTransformados);;
      } else {
         setRows([]);
      }
   }, [planillaData]);

   // Cargar lista de planillas disponibles
   useEffect(() => {
      const cargarListaPlanillas = async () => {
         try {
            setLoadingPlanillas(true);
            setError(null);

            const response = await dispatch(fetchData_api(null, "gestor/planillas/listas/global"));
            console.log("response: " , response);

            if (response.success && response.data.array?.length > 0) {
               setPlanillasList(response.data.array || []);
            } else {
               setError("Error al cargar la lista de planillas");
            }
         } catch (error) {
            // console.error("Error al cargar lista de planillas:", error);
            setError("Error de conexión al cargar la lista de planillas");
         } finally {
            setLoadingPlanillas(false);
         }
      };

      cargarListaPlanillas();
   }, [dispatch]);

   // Cálculos de paginación
   const startIdx = (currentPage - 1) * pageSize;
   const totalPages = Math.ceil(rows.length / pageSize);
   const pageRows = rows.slice(startIdx, startIdx + pageSize);

   console.log("selectedPlanilla: " , selectedPlanilla);

   // Calcular totales de la planilla
   const porcentajeTarifa = selectedPlanilla?.porcentaje_empresa ?? 0.05;
   const totales = calcularTotalesPlanilla(rows, porcentajeTarifa);

   // Handlers
   const handleRowToggle = useHandleRowToggle({
      expandedRows,
      setExpandedRows,
   });

   const handlePageSizeChange = useCallback((e) => {
      setPageSize(Number(e.target.value));
      setCurrentPage(1);
   }, []);

   const handlePageChange = useCallback(
      (page) => {
         if (page >= 1 && page <= Math.ceil(rows.length / pageSize)) {
            setCurrentPage(page);
         }
      },
      [rows.length, pageSize]
   );

   const handlePlanillaChange = useCallback((e) => {
      setPlanillaSeleccionada(e.target.value);
   }, []);

   // Handler para aplicar planilla con confirmación
   const handleAplicarPlanilla = async () => {
      if (!selectedPlanilla) {
         Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No hay planilla seleccionada.',
            confirmButtonText: 'Entendido'
         });
         return;
      }

      // Mostrar confirmación
      const result = await Swal.fire({
         title: '¿Está seguro?',
         text: '¿Desea aplicar la planilla seleccionada? Esta acción no se puede deshacer.',
         icon: 'question',
         showCancelButton: true,
         confirmButtonColor: '#3085d6',
         cancelButtonColor: '#d33',
         confirmButtonText: 'Sí, procesar planilla',
         cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
         try {
            // Mostrar loading
            Swal.fire({
               title: 'Procesando planilla...',
               text: 'Por favor espere mientras se procesa la planilla',   
               allowOutsideClick: false,
               allowEscapeKey: false,
               showConfirmButton: false,
               didOpen: () => {
                  Swal.showLoading();
               }
            });

            // Ejecutar la aplicación de la planilla
            const response = await dispatch(fetchData_api(selectedPlanilla, "gestor/planilla/procesar"));
            

            // Cerrar loading
            Swal.close();

            // Verificar respuesta
            if (response.success) {
               // Mostrar éxito y navegar
               await Swal.fire({
                  icon: 'success',
                  title: '¡Planilla procesada!',
                  text: 'La planilla ha sido procesada exitosamente.',
                  confirmButtonText: 'Continuar'
               });

               // Navegar a la lista de planillas
               navigate(`/gestor/planillas-empleadosLista?planilla_id=${selectedPlanilla.planilla_id}`);
            } else {
               // Mostrar error
               Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: response.message || 'Error al aplicar la planilla. Por favor intente nuevamente.',
                  confirmButtonText: 'Entendido'
               });
            }
         } catch (error) {
            // Cerrar loading en caso de error
            Swal.close();
            
            // Mostrar error
            Swal.fire({
               icon: 'error',
               title: 'Error de conexión',
               text: 'No se pudo conectar con el servidor. Por favor verifique su conexión e intente nuevamente.',
               confirmButtonText: 'Entendido'
            });
         }
      }
   };

   // IDs únicos para accesibilidad
   const planillaSelectId = "planillaSelect";

   // MODAL DETALLE EMPLEADO
   const [modalEmpleado, setModalEmpleado] = useState({ show: false, empleado: null, calculos: null, aumentos: [], horasExtras: [], metricas: [], rebajos: [] });

   // Handler para abrir el modal con los datos del empleado
   const handleVerDetalle = (row) => {
      // Buscar el empleado original en planillaData
      const empleadoOriginal = planillaData?.find(e => String(e.numero_socio_empleado_gestor) === String(row.cedula));
      setModalEmpleado({
        show: true,
        empleado: empleadoOriginal,
        calculos: row,
        aumentos: empleadoOriginal?.aumentos || [],
        horasExtras: empleadoOriginal?.horas_extras || [],
        metricas: empleadoOriginal?.compensacion_metrica || [],
        rebajos: empleadoOriginal?.rebajos_compensacion || [],
        tipoPlanillaLabel: selectedPlanilla?.planilla_tipo || "",
        periodoLabel: selectedPlanilla?.planilla_codigo || "",
      });
   };

   return (
      <div className="container-fluid">
         {/* Estilos globales */}
         <style>
            {`
               .table-hover tbody tr:hover {
                  background-color: #e2e6ea !important;
               }
               .table th, .table td {
                  vertical-align: middle !important;
                  font-size: 0.92rem !important;
                  padding: 6px 8px !important;
               }
               .table-active {
                  background-color: #e3f2fd !important;
                  border-left: 3px solid #2196f3 !important;
               }
               .subtable-container {
                  transition: all 0.3s ease-in-out;
               }
               .btn-outline-secondary:hover {
                  background-color: #6c757d;
                  border-color: #6c757d;
                  color: white;
               }
               .btn-compact {
                  font-size: 0.98rem !important;
                  padding: 6px 18px !important;
                  min-width: 120px !important;
                  border-radius: 6px !important;
                  height: 38px !important;
                  font-weight: 600;
               }
               /* Skeleton loading animation */
               .skeleton-text {
                  animation: skeleton-loading 1.5s ease-in-out infinite;
                  background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
                  background-size: 200% 100%;
               }
               
               @keyframes skeleton-loading {
                  0% {
                     background-position: 200% 0;
                  }
                  100% {
                     background-position: -200% 0;
                  }
               }
               
               .skeleton-row {
                  pointer-events: none;
               }
               
               .skeleton-row td {
                  border: 1px solid #dee2e6 !important;
               }
               .employee-details-block {
                  background: #fff;
                  border: 1px solid #e3e6f0;
                  border-radius: 6px;
                  box-shadow: 0 1px 4px rgba(44,62,80,0.04);
                  margin: 8px 0 16px 0;
                  padding: 0 0 8px 0;
                  transition: box-shadow 0.2s;
               }
               .employee-details-block:hover {
                  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
               }
               .details-header {
                  background: #f1f3f6;
                  border-bottom: 1px solid #e3e6f0;
                  font-size: 0.99rem;
                  font-weight: 600;
                  color: #2d3748;
                  padding: 7px 12px;
                  border-radius: 6px 6px 0 0;
                  display: flex;
                  align-items: center;
               }
               .details-table-wrapper {
                  padding: 7px 12px 0 12px;
               }
               .details-table-wrapper table {
                  font-size: 0.92rem;
               }
               .details-table-wrapper th, .details-table-wrapper td {
                  padding: 4px 7px !important;
               }
               .details-table-wrapper th {
                  background: #f8fafc;
                  color: #495057;
               }
               .details-table-wrapper td {
                  background: #fff;
               }
               
               /* Estilos para la tabla de resultados */
               .results-table {
                  background: #fff;
                  border: 1px solid #e3e6f0;
                  border-radius: 6px;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.07);
               }
               .results-table th {
                  background: #f8f9fa;
                  border-bottom: 1px solid #dee2e6;
                  font-weight: 600;
                  color: #495057;
                  text-align: center;
                  font-size: 0.97rem;
                  padding: 6px 8px !important;
               }
               .results-table td {
                  border-bottom: 1px solid #dee2e6;
                  font-weight: 500;
                  font-size: 0.97rem;
                  padding: 8px 8px !important;
                  border-right: 1.5px solid #e3e6f0;
                  background: #fff;
               }
               .results-table th:last-child, .results-table td:last-child {
                  border-right: none;
               }
               .results-table tbody tr {
                  border-bottom: 2.5px solid #e3e6f0 !important;
               }
               .results-table tbody tr td {
                  background: #fcfcfc;
               }
               .results-table tbody tr:not(.total-row) td {
                  border-bottom: 2.5px solid #e3e6f0 !important;
               }
               .results-table tbody tr.total-row td {
                  border-bottom: none !important;
               }
               .results-table .total-row {
                  background: #e3f2fd;
                  font-weight: 700;
                  border-top: 1px solid #2196f3;
               }
               .results-table .total-row td {
                  font-size: 1.02rem;
                  color: #1976d2;
               }
               .card-header.bg-primary {
                  font-size: 1.01rem;
                  padding: 7px 14px !important;
                  border-radius: 6px 6px 0 0 !important;
               }
               .card.shadow-sm {
                  box-shadow: 0 1px 4px rgba(0,0,0,0.07) !important;
                  border-radius: 8px !important;
               }
            `}
         </style>

         <div className="row">
            <div className="col-12">
               <div className="card shadow-sm">
                  <div className="card-body">
                     {/* Indicadores de estado */}
                     {loading && (
                        <div className="alert alert-info text-center">
                           <i className="fas fa-spinner fa-spin me-2"></i>
                           Cargando empleados de la planilla... Esto puede tomar unos segundos.
                        </div>
                     )}

                     {loadingPlanillas && (
                        <div className="alert alert-info text-center">
                           <i className="fas fa-spinner fa-spin me-2"></i>
                           Cargando lista de planillas...
                        </div>
                     )}

                     {error && (
                        <div className="alert alert-danger text-center">
                           <i className="fas fa-exclamation-triangle me-2"></i>
                           {error}
                        </div>
                     )}

                     {planillaData && !loading && (
                        <div className="alert alert-success text-center">
                           <i className="fas fa-check-circle me-2"></i>
                           Datos de planilla cargados exitosamente
                        </div>
                     )}

                     {planillasList.length > 0 && !loadingPlanillas && (
                        <div className="alert alert-success text-center">
                           <i className="fas fa-check-circle me-2"></i>
                           Lista de planillas cargada exitosamente ({planillasList.length} planillas disponibles)
                        </div>
                     )}

                     {/* Selector de planilla */}
                     <div className="mb-3">
                        <label htmlFor={planillaSelectId} className="form-label" style={{ fontSize: '0.97rem' }}>
                           Tipo de Planilla
                        </label>
                        <select
                           className="form-select"
                           id={planillaSelectId}
                           value={planillaSeleccionada}
                           onChange={handlePlanillaChange}
                           disabled={loadingPlanillas}
                           style={{ fontSize: '0.97rem', padding: '5px 10px', height: '34px', borderRadius: '6px' }}
                        >
                           <option value="">Seleccione un tipo de planilla</option>
                           {planillasList.length > 0 ? (
                              planillasList
                                 .slice()
                                 .sort((a, b) => new Date(a.planilla_fecha_inicio) - new Date(b.planilla_fecha_inicio))
                                 .map((planilla) => (
                                    <option key={planilla.planilla_id} value={planilla.planilla_id}>
                                       {planilla.planilla_codigo} - {planilla.planilla_tipo} ({planilla.planilla_estado})
                                    </option>
                                 ))
                           ) : (
                              <option value="" disabled>
                                 {loadingPlanillas ? "Cargando planillas..." : "No hay planillas disponibles"}
                              </option>
                           )}
                        </select>
                     </div>

                     {/* Tabla principal */}
                     {empresaSeleccionada && planillaSeleccionada && selectedPlanilla && (
                        <>
                           <div className="table-responsive" style={{ overflowX: "auto" }}>
                              <div className="datatable-wrapper datatable-loading no-footer searchable fixed-columns">
                                 <div className="datatable-container">
                                    <PayrollTable
                                       columns={PAYROLL_COLUMNS}
                                       pageRows={pageRows}
                                       disabled={false}
                                       planillaEstado={planillaEstado}
                                       expandedRows={expandedRows}
                                       onRowToggle={handleRowToggle}
                                       subtableData={generarDatosSubtabla(planillaData)}
                                       isLoading={loading}
                                       pageSize={pageSize}
                                       onVerDetalle={handleVerDetalle}
                                    />
                                 </div>
                              </div>
                           </div>

                           {/* Botón Procesar Planilla */}
                           <div className="mt-3 d-flex justify-content-end" style={{ width: '100%' }}>
                              <button
                                 className="btn btn-dark btn-compact me-2"
                                 onClick={handleAplicarPlanilla}
                                 disabled={loading}
                              >
                                 <i className="fas fa-cogs me-2"></i>
                                 Procesar Planilla
                              </button>
                           </div>

                           {/* Resumen de Totales debajo de la tabla principal */}
                           <div className="mt-2 d-flex justify-content-end" style={{ width: '100%' }}>
                              <div style={{ maxWidth: '340px', width: '100%' }}>
                                <ResultsTable totales={totales} porcentajeTarifa={porcentajeTarifa} />
                              </div>
                           </div>
                        </>
                     )}
                     {/* MODAL DETALLE EMPLEADO */}
                     <ModalDetalleEmpleado
                        show={modalEmpleado.show}
                        onClose={() => setModalEmpleado({ ...modalEmpleado, show: false })}
                        empleado={modalEmpleado.empleado}
                        calculos={modalEmpleado.calculos}
                        aumentos={modalEmpleado.aumentos}
                        horasExtras={modalEmpleado.horasExtras}
                        metricas={modalEmpleado.metricas}
                        rebajos={modalEmpleado.rebajos}
                        tipoPlanillaLabel={modalEmpleado.tipoPlanillaLabel}
                        periodoLabel={modalEmpleado.periodoLabel}
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

/**
 * Exportamos también con el nombre original para mantener compatibilidad
 */
export const GenerarAplicadas = PayrollGenerator;
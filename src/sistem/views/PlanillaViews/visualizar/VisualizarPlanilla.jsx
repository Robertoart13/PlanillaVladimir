import React, { useState, useEffect } from "react";
import "./visualizarPlanilla.css";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import { Planil_Empleado_Aplicadas_Empleado_Thunks } from "../../../../store/Planilla/Planil_Empleado_Aplicadas_Empleado_Thunks";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Configuración global para el número de tarjetas por fila por defecto
const TARJETAS_POR_FILA_DEFAULT = 5;

/**
 * Función para exportar a PDF un elemento del DOM
 * @param {HTMLElement} element - Elemento DOM a convertir en PDF
 * @param {string} fileName - Nombre del archivo PDF a generar
 */
/**
 * Función para exportar a PDF un elemento del DOM
 * @param {HTMLElement} element - Elemento DOM a convertir en PDF
 * @param {string} fileName - Nombre del archivo PDF a generar
 */
const exportToPDF = async (element, fileName) => {
  try {
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Generando PDF',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });    // Crear un contenedor para la tarjeta con clases para aplicar estilos específicos de PDF
    const container = document.createElement('div');
    container.className = 'pdf-container';
    container.style.width = '400px'; // Reducimos el ancho para un PDF más pequeño
    container.style.padding = '0';
    container.style.margin = '0';
    container.style.backgroundColor = '#ffffff';
    
    // Crear un contenedor adicional para el contenido con clase específica para PDF
    const contentContainer = document.createElement('div');
    contentContainer.className = 'pdf-content';
    contentContainer.innerHTML = element.innerHTML;
    
    // Añadir el contenedor de contenido al contenedor principal
    container.appendChild(contentContainer);
      // Preservar todos los estilos originales
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (error) {
          // Ignorar hojas de estilo protegidas por CORS
          return '';
        }
      })
      .join('\n');
        // Añadir estilos específicos para PDF
    const pdfStyles = `
      .remuneracion-header {
        background-color: #343a40;
        color: white;
        padding: 10px 8px;
        font-size: 14px;
        text-align: center;
        margin-bottom: 10px;
        font-weight: bold;
      }
      .section-header {
        background-color: #343a40 !important;
        color: white;
        padding: 6px;
        text-align: center;
        border-bottom: 2px solid #000;
        font-weight: bold;
        font-size: 12px;
      }
      .inscrito {
        color: #4CAF50;
        font-weight: bold;
      }
      .no-inscrito {
        color: #f44336;
        font-weight: bold;
      }
      .remuneracion-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
      }
      .remuneracion-table td {
        border: 1px solid #ddd;
        padding: 5px;
        font-size: 10px;
      }
      .amount {
        text-align: right;
      }
    `;
      // Crear elemento de estilo e insertarlo en el contenedor
    const styleElement = document.createElement('style');
    styleElement.textContent = styles + pdfStyles;
    container.prepend(styleElement);
    
    // Asegurarse de que el contenedor sea visible pero fuera de pantalla
    document.body.appendChild(container);
    
    // Esperar un momento para que los estilos se apliquen
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Usar configuración óptima para html2canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Balance entre calidad y rendimiento
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true, // Mostrar logs para debugging
      letterRendering: true,
      width: 600,
      height: container.offsetHeight
    });
    
    // Eliminar el contenedor temporal
    document.body.removeChild(container);
    
    // Obtener la imagen como base64
    const imgData = canvas.toDataURL('image/png');
    
    // Calcular dimensiones para el PDF
    const imgWidth = 190; // Ancho en mm (A4 width = 210mm, con margen)
    const pageHeight = 295; // Alto en mm (A4 height = 297mm, con margen)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Crear nuevo documento PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Variables para manejar múltiples páginas si es necesario
    let heightLeft = imgHeight;
    let position = 10; // Posición inicial (margen superior)
    let pageNum = 1;
    
    // Añadir la imagen a la primera página
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Si el contenido es más grande que una página, añadir páginas adicionales
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight; // Reposicionar para la siguiente página
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      pageNum++;
    }
    
    // Guardar el PDF
    pdf.save(`${fileName || 'remuneracion'}.pdf`);
    
    // Cerrar el indicador de carga y mostrar mensaje de éxito
    Swal.fire({
      title: 'PDF Generado',
      text: 'El archivo PDF ha sido generado correctamente',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) {
    console.error('Error al generar PDF:', error);
    
    // Mostrar mensaje de error
    Swal.fire({
      title: 'Error',
      text: `Error al generar PDF: ${error.message}`,
      icon: 'error',
      confirmButtonText: 'Aceptar'
    });
  }
};

/**
 * Función para desencriptar un ID desde la URL
 * @param {string} encriptedId - ID encriptado
 * @returns {string|number} - ID desencriptado
 */
const desencriptarId = (encriptedId) => {
   try {
      // Reemplazar los caracteres especiales a formato base64 estándar
      const base64Fixed = encriptedId.replace(/-/g, "+").replace(/_/g, "/");
      // Decodificar de Base64
      const decodedString = atob(base64Fixed);
      // El formato es "id_timestamp", extraemos solo el ID
      const idPart = decodedString.split("_")[0];
      return idPart;
   } catch (error) {
      console.error("Error al desencriptar ID:", error);
      return null;
   }
};

/**
 * Componente para mostrar una tarjeta individual de remuneración
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.empleado - Datos del empleado a mostrar
 * @returns {JSX.Element} Tarjeta de remuneración
 */
const RemuneracionCard = ({ empleado }) => {
   // Determinar si el empleado está aplicado basado en su estado
   const estadoAplicado = empleado.estado_epd === "aplicado";
   // Inicializar el estado con el valor de aplicado del empleado
   const [aplicado, setAplicado] = useState(estadoAplicado);
   
   // Crear una referencia al componente de la tarjeta para exportar a PDF
   const cardRef = React.useRef(null);

   const aplicarEmpleado = () => {
      setAplicado(true);
      // Aquí iría la lógica para aplicar al empleado en la base de datos
   };

   const verPerfilEmpleado = () => {
      // Aquí iría la lógica para ver el perfil del empleado
      const nombreCompleto = `${empleado.nombre_empleado || ""} ${empleado.apellidos_empleado || ""}`;
      alert(`Ver perfil de ${nombreCompleto}`);
   };   // Función para descargar la tarjeta como PDF
   const descargarPDF = () => {
      if (cardRef.current) {
         // Crear un clon del elemento para manipularlo sin afectar la UI
         const cardClone = cardRef.current.cloneNode(true);
         
         // Eliminar botones y elementos que no deberían aparecer en el PDF
         const botonesParaOcultar = cardClone.querySelectorAll('.boton-container');
         botonesParaOcultar.forEach(boton => {
            boton.style.display = 'none';
         });
         
         // También ocultar los botones de copiar
         const botonesCopiar = cardClone.querySelectorAll('.boton-copiar');
         botonesCopiar.forEach(boton => {
            boton.style.display = 'none';
         });
         
         // Eliminar cualquier padding o margen innecesario para hacer el PDF más compacto
         const tablas = cardClone.querySelectorAll('.remuneracion-table');
         tablas.forEach(tabla => {
            tabla.style.marginBottom = '5px';
         });
         
         // Preparar el nombre del archivo
         const nombreEmpleado = `${empleado.nombre_empleado || ""} ${empleado.apellidos_empleado || ""}`.trim();
         const consecutivo = empleado.planilla_codigo || "PL";
         const nombreArchivo = nombreEmpleado ? 
            `${consecutivo}_remuneracion_${nombreEmpleado.replace(/\s+/g, '_').toLowerCase()}` : 
            `${consecutivo}_remuneracion_${empleado.cedula_empleado || 'empleado'}`;
         
         // Generar el PDF usando el clon modificado   
         exportToPDF(cardClone, nombreArchivo);
      }
   };

   return (
      <div 
         ref={cardRef}
         className={`remuneracion-card ${aplicado ? "aplicado" : "no-aplicado"}`}
      >
         <div className="remuneracion-header">REMUNERACIÓN OPU SAL</div>         <div className="boton-container boton-perfil-container">
            <button
               className="boton-ver-perfil"
               onClick={verPerfilEmpleado}
            >
               Ver perfil de empleado
            </button>
         </div>
         
         <div className="boton-container">
            <button
               className="boton-ver-perfil"
               onClick={descargarPDF}
            >
               Descargar PDF
            </button>
         </div>

         <InfoPersonalTable empleado={empleado} />
         <DesgloceRemuneracionTable empleado={empleado} />
         <DeduccionesTable empleado={empleado} />
         <EstadoInscripcionTable empleado={empleado} />

         <div className="boton-container">
            <button
               className="boton-aplicar"
               onClick={aplicarEmpleado}
               disabled={aplicado}
            >
               {aplicado ? "Empleado Aplicado" : "Aplicar Empleado"}
            </button>
         </div>
      </div>
   );
};

/**
 * Componente para mostrar la información personal del empleado
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.empleado - Datos del empleado
 * @returns {JSX.Element} Tabla de información personal
 */
const InfoPersonalTable = ({ empleado }) => {
   // Preparar datos del empleado
   const nombreCompleto = `${empleado.nombre_empleado || ""} ${empleado.apellidos_empleado || ""}`.trim();
   
   // Encontrar todas las cuentas IBAN para este empleado
   const cuentasIban = [];
   if (empleado.numero_cuenta_iban) {
      cuentasIban.push(empleado.numero_cuenta_iban);
   }
   
   // Agregar cuentas adicionales si existen
   if (empleado.cuentas_adicionales && Array.isArray(empleado.cuentas_adicionales)) {
      empleado.cuentas_adicionales.forEach(cuenta => {
         if (cuenta && !cuentasIban.includes(cuenta)) {
            cuentasIban.push(cuenta);
         }
      });
   }

   return (
      <table className="remuneracion-table">
         <tbody>
            <tr>
               <td>Remuneración #</td>
               <td>{empleado.semana_epd || "No disponible"}</td>
            </tr>
            <tr>
               <td>Nombre:</td>
               <td>
                  <div className="cuenta-bancaria-container">
                     <span>{nombreCompleto || "No disponible"}</span>
                     <CopyButton 
                        textToCopy={nombreCompleto} 
                        message="El nombre ha sido copiado al portapapeles"
                        title="Copiar nombre"
                     />
                  </div>
               </td>
            </tr>
            <tr>
               <td>Cedula:</td>
               <td>
                  <div className="cuenta-bancaria-container">
                     <span>{empleado.cedula_empleado || "No disponible"}</span>
                     <CopyButton 
                        textToCopy={empleado.cedula_empleado} 
                        message="La cédula ha sido copiada al portapapeles"
                        title="Copiar cédula"
                     />
                  </div>
               </td>
            </tr>
            <tr>
               <td>Puesto:</td>
               <td>{empleado.nombre_puesto || "No disponible"}</td>
            </tr>
            <tr>
               <td>Cuenta Bancaria:</td>
               <td>
                  {cuentasIban.length > 0 ? (
                     cuentasIban.map((cuenta, index) => (
                        <div
                           key={index}
                           className="cuenta-bancaria-container"
                        >
                           <span>{cuenta}</span>
                           <CopyButton 
                              textToCopy={cuenta} 
                              message="La cuenta IBAN ha sido copiada al portapapeles"
                              title="Copiar cuenta IBAN"
                           />
                           {index < cuentasIban.length - 1 && <hr />}
                        </div>
                     ))
                  ) : (
                     <div className="cuenta-bancaria-container">
                        <span>No disponible</span>
                     </div>
                  )}
               </td>
            </tr>
         </tbody>
      </table>
   );
};

/**
 * Componente para mostrar el desglose de remuneración del empleado
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.empleado - Datos del empleado
 * @returns {JSX.Element} Tabla de desglose de remuneración
 */
const DesgloceRemuneracionTable = ({ empleado }) => (
   <table className="remuneracion-table">
      <tbody>
         <tr>
            <td
               colSpan="2"
               className="section-header"
            >
               Desgloce de remuneración
            </td>
         </tr>
         <tr>
            <td>Remuneración Bruta:</td>
            <td className="amount">₡{empleado.remuneracion_bruta_epd || "0.00"}</td>
         </tr>
         <tr>
            <td>Bonificaciones</td>
            <td className="amount">₡0.00</td>
         </tr>
         <tr>
            <td>Remuneración Neta:</td>
            <td className="amount">₡{empleado.remuneracion_neta_epd || "0.00"}</td>
         </tr>
      </tbody>
   </table>
);

/**
 * Componente para mostrar las deducciones del empleado
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.empleado - Datos del empleado
 * @returns {JSX.Element} Tabla de deducciones
 */
const DeduccionesTable = ({ empleado }) => (
   <table className="remuneracion-table">
      <tbody>
         <tr>
            <td
               colSpan="2"
               className="section-header"
            >
               Deducciones
            </td>
         </tr>
         <tr>
            <td>Cuota Seguro Independiente:</td>
            <td className="amount">₡{empleado.cuota_ccss_epd || "0.00"}</td>
         </tr>
         <tr>
            <td>Rebajos de cliente</td>
            <td className="amount">₡{empleado.rebajos_cliente_epd || "0.00"}</td>
         </tr>
         <tr>
            <td>Rebajos de OPU</td>
            <td className="amount">₡{empleado.rebajos_opu_epd || "0.00"}</td>
         </tr>
         <tr>
            <td>Total Deducciones</td>
            <td className="amount">₡{empleado.total_deducciones_epd || "0.00"}</td>
         </tr>
         <tr>
            <td>Reintegros decliente</td>
            <td className="amount">₡{empleado.reintegro_cliente_epd || "0.00"}</td>
         </tr>
         <tr>
            <td>Reintegros de OPU</td>
            <td className="amount">₡{empleado.reintegro_opu_epd || "0.00"}</td>
         </tr>
         <tr>
            <td>
               <strong>Remuneración neta</strong>
            </td>
            <td className="amount">
               <strong>₡{empleado.remuneracion_neta_epd || "0.00"}</strong>
            </td>
         </tr>
      </tbody>
   </table>
);

/**
 * Componente para mostrar el estado de inscripción del empleado
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.empleado - Datos del empleado
 * @returns {JSX.Element} Tabla de estados de inscripción
 */
const EstadoInscripcionTable = ({ empleado }) => {
   // Convertimos a números para asegurar comparación correcta
   const ministerio = parseInt(empleado.ministerio_hacienda_empleado) || 0;
   const rtins = parseInt(empleado.rt_ins_empleado) || 0;
   const ccss = parseInt(empleado.caja_costarricense_seguro_social_empleado) || 0;
   
   return (
      <table className="remuneracion-table">
         <tbody>
            <tr>
               <td
                  colSpan="2"
                  className="section-header"
               >
                  Estado de Inscripción
               </td>
            </tr>
            <tr>
               <td>Ministerio de Hacienda:</td>
               <td className={ministerio === 1 ? "inscrito" : "no-inscrito"}>
                  {ministerio === 1 ? "Inscrito" : "No inscrito"}
               </td>
            </tr>
            <tr>
               <td>RT-INS:</td>
               <td className={rtins === 1 ? "inscrito" : "no-inscrito"}>
                  {rtins === 1 ? "Inscrito" : "No inscrito"}
               </td>
            </tr>
            <tr>
               <td>CCSS:</td>
               <td className={ccss === 1 ? "inscrito" : "no-inscrito"}>
                  {ccss === 1 ? "Inscrito" : "No inscrito"}
               </td>
            </tr>
         </tbody>
      </table>
   );
};

/**
 * Componente selector para el número de tarjetas por fila
 * @param {Object} props - Propiedades del componente
 * @param {number} props.value - Valor actual
 * @param {Function} props.onChange - Función para manejar el cambio
 * @returns {JSX.Element} Selector de tarjetas por fila
 */
const TarjetasSelector = ({ value, onChange }) => (
   <div className="controles">
      <label>
         Tarjetas por fila:
         <select
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="selector-tarjetas"
         >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
         </select>
      </label>
   </div>
);

/**
 * Datos estáticos de empleados (en un caso real, estos vendrían de una API)
 */
const DATOS_EMPLEADOS = [
   {
      id: 1,
      nombre: "Ronaldo Martinez Alvarez",
      cedula: "204000197",
      puesto: "Operario agricula",
      cuentaBancaria: "200011390536662",
      remuneracionBruta: "77,974.96",
      bonificaciones: "-",
      remuneracionNeta: "77,974.96",
      cuotaSeguro: "-",
      rebajosCliente: "-",
      rebajosOPU: "-",
      totalDeducciones: "-",
      reintegrosCliente: "-",
      reintegrosOPU: "-",
      ministerio_hacienda_empleado: 1,
      rt_ins_empleado: 0,
      caja_costarricense_seguro_social_empleado: 1,
      aplicado: false,
   },
   {
      id: 2,
      nombre: "Santos Morales Lira",
      cedula: "155823049002",
      puesto: "Operario agricula",
      cuentaBancaria: "200010680499667",
      remuneracionBruta: "84,000.00",
      bonificaciones: "-",
      remuneracionNeta: "84,000.00",
      cuotaSeguro: "-",
      rebajosCliente: "-",
      rebajosOPU: "-",
      totalDeducciones: "-",
      reintegrosCliente: "-",
      reintegrosOPU: "-",
      ministerio_hacienda_empleado: 0,
      rt_ins_empleado: 1,
      caja_costarricense_seguro_social_empleado: 1,
      aplicado: false,
   },
   {
      id: 3,
      nombre: "Vicente Taleno Lopez",
      cedula: "155831352304",
      puesto: "Operario agricula",
      cuentaBancaria: "200-01-068-052343-6",
      remuneracionBruta: "81,244.46",
      bonificaciones: "-",
      remuneracionNeta: "81,244.46",
      cuotaSeguro: "-",
      rebajosCliente: "-",
      rebajosOPU: "-",
      totalDeducciones: "-",
      reintegrosCliente: "-",
      reintegrosOPU: "-",
      ministerio_hacienda_empleado: 1,
      rt_ins_empleado: 1,
      caja_costarricense_seguro_social_empleado: 0,
      aplicado: false,
   },
   {
      id: 4,
      nombre: "Wilmer Sánchez Sánchez",
      cedula: "",
      puesto: "Operario agricula",
      cuentaBancaria: "",
      remuneracionBruta: "81,724.96",
      bonificaciones: "-",
      remuneracionNeta: "81,724.96",
      cuotaSeguro: "-",
      rebajosCliente: "-",
      rebajosOPU: "-",
      totalDeducciones: "-",
      reintegrosCliente: "-",
      reintegrosOPU: "-",
      ministerio_hacienda_empleado: 0,
      rt_ins_empleado: 0,
      caja_costarricense_seguro_social_empleado: 0,
      aplicado: false,
   },
   {
      id: 5,
      nombre: "Yocsan Gutierez Santa Maria",
      cedula: "206700800",
      puesto: "Operario agricula",
      cuentaBancaria: "200010680541639",
      remuneracionBruta: "103,125.00",
      bonificaciones: "-",
      remuneracionNeta: "103,125.00",
      cuotaSeguro: "-",
      rebajosCliente: "-",
      rebajosOPU: "-",
      totalDeducciones: "-",
      reintegrosCliente: "-",
      reintegrosOPU: "-",
      ministerio_hacienda_empleado: 1,
      rt_ins_empleado: 1,
      caja_costarricense_seguro_social_empleado: 1,
      aplicado: true,
   },
];

/**
 * Función para obtener datos de la planilla desde la API
 * @param {Array} empleadosData - Array con datos de los empleados
 * @returns {Object} - Objeto con datos de la planilla
 */
const obtenerDatosPlanilla = (empleadosData) => {
   if (!empleadosData || empleadosData.length === 0) {
      return {
         consecutivo: "No disponible",
         nombreEmpresa: "No disponible",
         creadoPor: "No disponible",
         tipoPlanilla: "No disponible",
         fechaInicio: "No disponible",
         fechaFin: "No disponible",
         estado: "No disponible"
      };
   }
   
   // Tomamos el primer empleado para extraer los datos de la planilla
   const primerEmpleado = empleadosData[0];
   
   return {
      consecutivo: primerEmpleado.planilla_codigo || "No disponible",
      nombreEmpresa: primerEmpleado.nombre_razon_social_empresa || "No disponible",
      creadoPor: primerEmpleado.nombre_usuario || "No disponible",
      tipoPlanilla: primerEmpleado.planilla_tipo || "No disponible",
      fechaInicio:
         (primerEmpleado.planilla_fecha_inicio &&
            primerEmpleado.planilla_fecha_inicio.substring(0, 10)) ||
         "No disponible",
      fechaFin:
         (primerEmpleado.planilla_fecha_fin &&
            primerEmpleado.planilla_fecha_fin.substring(0, 10)) ||
         "No disponible",
      estado: primerEmpleado.planilla_estado || "No disponible",
   };
};

/**
 * Servicio para obtener datos de empleados
 * En un caso real, este servicio haría una llamada a la API
 * @returns {Promise<Array>} Promesa que resuelve con los datos de empleados
 */
const obtenerEmpleados = async () => {
   // Simula el tiempo de carga de una API
   return new Promise((resolve) => {
      setTimeout(() => resolve(DATOS_EMPLEADOS), 300);
   });
};

/**
 * Componente para mostrar la información general de la planilla
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.planilla - Datos de la planilla
 * @returns {JSX.Element} Información de la planilla
 */
const InfoPlanilla = ({ planilla }) => (
   <div className="info-planilla">
      <h3>Información de la Planilla</h3>
      <div className="info-planilla-grid">
         <div className="info-planilla-item">
            <span className="info-label">Consecutivo:</span>
            <span className="info-value">{planilla.consecutivo}</span>
         </div>
         <div className="info-planilla-item">
            <span className="info-label">Nombre Empresa:</span>
            <span className="info-value">{planilla.nombreEmpresa}</span>
         </div>
         <div className="info-planilla-item">
            <span className="info-label">Creado por:</span>
            <span className="info-value">{planilla.creadoPor}</span>
         </div>
         <div className="info-planilla-item">
            <span className="info-label">Tipo Planilla:</span>
            <span className="info-value">{planilla.tipoPlanilla}</span>
         </div>
         <div className="info-planilla-item">
            <span className="info-label">Fecha Inicio:</span>
            <span className="info-value">{planilla.fechaInicio}</span>
         </div>
         <div className="info-planilla-item">
            <span className="info-label">Fecha Fin:</span>
            <span className="info-value">{planilla.fechaFin}</span>
         </div>
         <div className="info-planilla-item">
            <span className="info-label">Estado:</span>
            <span className="info-value estado-activo">{planilla.estado}</span>
         </div>
      </div>
   </div>
);

/**
 * Función utilitaria para copiar texto al portapapeles y mostrar notificación
 * @param {string} text - Texto a copiar
 * @param {string} message - Mensaje a mostrar en la notificación (opcional)
 */
const copiarAlPortapapeles = (text, message) => {
   if (!text) return;
   
   navigator.clipboard.writeText(text);
   
   // Mostrar notificación utilizando SweetAlert2 si está disponible
   if (typeof Swal !== 'undefined') {
      Swal.fire({
         title: 'Texto copiado',
         text: message || 'El texto ha sido copiado al portapapeles',
         icon: 'success',
         timer: 1500,
         showConfirmButton: false
      });
   } else {
      // Fallback a alerta estándar
      alert(message || "Texto copiado al portapapeles");
   }
};

/**
 * Componente reutilizable para mostrar un botón de copia
 * @param {Object} props - Propiedades del componente
 * @param {string} props.textToCopy - Texto que se copiará al portapapeles
 * @param {string} props.message - Mensaje a mostrar en la notificación
 * @param {string} props.title - Título para el tooltip del botón
 * @returns {JSX.Element|null} Botón de copia o null si no hay texto
 */
const CopyButton = ({ textToCopy, message, title }) => {
   if (!textToCopy) return null;
   
   const handleCopy = () => copiarAlPortapapeles(textToCopy, message);
   
   return (
      <button
         onClick={handleCopy}
         className="boton-copiar"
         title={title || "Copiar"}
      >
         <i className="fas fa-copy"></i>
      </button>
   );
};

/**
 * Componente principal para visualizar la planilla de empleados
 * @returns {JSX.Element} Grid de tarjetas de remuneración
 */
export const VisualizarPlanilla = () => {
   const [empleados, setEmpleados] = useState([]);
   const [cargando, setCargando] = useState(true);
   const [tarjetasPorFila, setTarjetasPorFila] = useState(TARJETAS_POR_FILA_DEFAULT);
   const [datosPlanilla, setDatosPlanilla] = useState({
      consecutivo: "No disponible",
      nombreEmpresa: "No disponible",
      creadoPor: "No disponible",
      tipoPlanilla: "No disponible",
      fechaInicio: "No disponible",
      fechaFin: "No disponible",
      estado: "No disponible"
   });

   const location = useLocation();
   const dispatch = useDispatch();

   // Referencia a la grid de tarjetas para exportar a PDF
   const gridRef = React.useRef(null);

   // Cargar datos de empleados al montar el componente usando el ID de la URL
   useEffect(() => {
      const cargarEmpleados = async () => {
         try {
            setCargando(true);

            // Obtener el ID encriptado de la URL
            const queryParams = new URLSearchParams(location.search);
            const idEncriptado = queryParams.get("id");

            if (idEncriptado) {
               // Desencriptar el ID
               const planillaId = desencriptarId(idEncriptado);
               if (planillaId) {
                  // Usar el ID para cargar datos de empleados de la API
                  const empleadosPlanillas = await dispatch(
                     Planil_Empleado_Aplicadas_Empleado_Thunks({
                        planilla_id: planillaId,
                     }),
                  );
                  console.log("Empleados obtenidos:", empleadosPlanillas);
                  const empleadosDataArr = empleadosPlanillas.data.array || [];
                  
                  // Procesar los datos para agrupar cuentas IBAN del mismo empleado
                  const empleadosMap = new Map();
                  
                  empleadosDataArr.forEach(empleado => {
                     const empleadoKey = `${empleado.id_empleado}-${empleado.planilla_id}-${empleado.id_empresa}`;
                     
                     if (empleadosMap.has(empleadoKey)) {
                        // Si ya existe este empleado, agregamos la cuenta IBAN a su lista
                        const empleadoExistente = empleadosMap.get(empleadoKey);
                        
                        if (empleado.numero_cuenta_iban && 
                            !empleadoExistente.cuentas_adicionales.includes(empleado.numero_cuenta_iban)) {
                           empleadoExistente.cuentas_adicionales.push(empleado.numero_cuenta_iban);
                        }
                     } else {
                        // Si es un nuevo empleado, lo inicializamos con un array para las cuentas adicionales
                        const nuevoEmpleado = {
                           ...empleado,
                           cuentas_adicionales: empleado.numero_cuenta_iban ? [empleado.numero_cuenta_iban] : []
                        };
                        empleadosMap.set(empleadoKey, nuevoEmpleado);
                     }
                  });
                  
                  // Convertir el Map a un array
                  const empleadosArr = Array.from(empleadosMap.values());
                  
                  setEmpleados(empleadosArr);
                  // Actualizar los datos de la planilla
                  setDatosPlanilla(obtenerDatosPlanilla(empleadosArr));
               } else {
                  // Si no se pudo desencriptar, cargamos datos de prueba
                  const datos = await obtenerEmpleados();
                  setEmpleados(datos);
                  // Con datos de prueba, no actualizamos la planilla
               }
            } else {
               // Si no hay ID en la URL, cargamos datos de prueba
               const datos = await obtenerEmpleados();
               setEmpleados(datos);
               // Con datos de prueba, no actualizamos la planilla
            }
         } catch (error) {
            console.error("Error al cargar los empleados:", error);
            // En caso de error, cargamos datos de prueba
            const datos = await obtenerEmpleados();
            setEmpleados(datos);
         } finally {
            setCargando(false);
         }
      };

      cargarEmpleados();
   }, [location, dispatch]);

   // Estilos dinámicos para la cuadrícula basados en la configuración actual
   const gridStyle = {
      "--tarjetas-por-fila": tarjetasPorFila,
   };

   // Maneja el cambio en el número de tarjetas por fila
   const handleTarjetasPorFilaChange = (valor) => {
      setTarjetasPorFila(valor);
      // Podría guardarse en localStorage para persistencia entre sesiones
      localStorage.setItem("tarjetasPorFila", valor);
   };

   return (
      <TarjetaRow
         texto="Visualizar Planilla"
         subtitulo="Visualiza la planilla de empleados con sus remuneraciones y estados de inscripción."
         icono="fa-solid fa-users"
      >
         <div className="remuneraciones-container">            
            <InfoPlanilla planilla={datosPlanilla} />

            <TarjetasSelector
               value={tarjetasPorFila}
               onChange={handleTarjetasPorFilaChange}
            />

            {cargando ? (
               <div className="cargando-mensaje">Cargando información de empleados...</div>
            ) : (
               <div
                  className="remuneraciones-grid"
                  style={gridStyle}
                  ref={gridRef}
               >
                  {empleados.map((empleado, index) => (
                     <RemuneracionCard
                        key={index}
                        empleado={empleado}
                     />
                  ))}
               </div>
            )}
         </div>
      </TarjetaRow>
   );
};

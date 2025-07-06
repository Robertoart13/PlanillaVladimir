import React, { useState, useEffect } from "react";
import "./visualizarPlanilla.css";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { Planil_Empleado_Aplicadas_Empleado_Thunks } from "../../../../store/Planilla/Planil_Empleado_Aplicadas_Empleado_Thunks";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Planilla_Aplicado } from "../../../../store/Planilla/Planilla_Aplicado_Thunks";
import { Planilla_Incritos_Thunks } from "../../../../store/Planilla/Planilla_Incritos_Thunks";
import { Planilla_CmabioEstado_Thunks } from "../../../../store/Planilla/Planilla_CmabioEstado_Thunks";
import { Planilla_Habilitar } from "../../../../store/Planilla/Planilla_Habilitar";

// Add MUI Dialog imports
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

// Configuración global para el número de tarjetas por fila por defecto
const TARJETAS_POR_FILA_DEFAULT = 5;

/**
 * Función para formatear valores monetarios con separadores de miles
 * @param {number|string} value - Valor a formatear
 * @returns {string} Valor formateado con separadores de miles
 */
const formatCurrency = (value) => {
   if (value === null || value === undefined || isNaN(value)) return "₡0.00";
   return (
      "₡" +
      Number(value)
         .toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
         })
   );
};

/**
 * Función para exportar a PDF un elemento del DOM
 * @param {HTMLElement} element - Elemento DOM a convertir en PDF
 * @param {string} fileName - Nombre del archivo PDF a generar
 */
const exportToPDF = async (element, fileName) => {
   try {
      // Mostrar indicador de carga
      Swal.fire({
         title: "Generando PDF",
         text: "Por favor espere...",
         allowOutsideClick: false,
         didOpen: () => {
            Swal.showLoading();
         },
      }); // Crear un contenedor para la tarjeta con clases para aplicar estilos específicos de PDF
      const container = document.createElement("div");
      container.className = "pdf-container";
      // Ensure the PDF container is wide enough for full-page formatting
      container.style.width = Math.max(element.offsetWidth, 800) + "px";
      container.style.padding = "30px";
      container.style.margin = "0";
      container.style.backgroundColor = "#ffffff";

      // Crear un contenedor adicional para el contenido con clase específica para PDF
      const contentContainer = document.createElement("div");
      contentContainer.className = "pdf-content";
      contentContainer.innerHTML = element.innerHTML;

      // Añadir el contenedor de contenido al contenedor principal
      container.appendChild(contentContainer);
      // Preservar todos los estilos originales
      const styles = Array.from(document.styleSheets)
         .map((styleSheet) => {
            try {
               return Array.from(styleSheet.cssRules)
                  .map((rule) => rule.cssText)
                  .join("\n");
            } catch (error) {
               // Ignorar hojas de estilo protegidas por CORS
               return "";
            }
         })
         .join("\n");
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
      /* Center the PDF content and allow full width */
      .pdf-container {
        display: flex !important;
        justify-content: center !important;
      }
      .pdf-container .pdf-content {
        width: 100% !important;
        max-width: none !important;
      }
    `;
      // Crear elemento de estilo e insertarlo en el contenedor
      const styleElement = document.createElement("style");
      styleElement.textContent = styles + pdfStyles;
      container.prepend(styleElement);

      // Asegurarse de que el contenedor sea visible pero fuera de pantalla
      document.body.appendChild(container);

      // Esperar un momento para que los estilos se apliquen
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Usar configuración óptima para html2canvas
      const canvas = await html2canvas(container, {
         scale: 2,
         useCORS: true,
         allowTaint: true,
         backgroundColor: "#ffffff",
         logging: true,
         letterRendering: true,
         width: container.offsetWidth,
         height: container.offsetHeight,
      });

      // Eliminar el contenedor temporal
      document.body.removeChild(container);

      // Obtener la imagen como base64
      const imgData = canvas.toDataURL("image/png");

      // Crear PDF en landscape orientation with dynamic page sizing
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      // Obtener dimensiones de la página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      // Escalar contenido para que se vea más pequeño
      const scaleFactor = 0.8;
      // Calcular dimensiones de la imagen en PDF con escala
      const contentWidth = pageWidth - margin * 2;
      const imgWidth = contentWidth * scaleFactor;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      // Centrar horizontalmente
      const xPosition = (pageWidth - imgWidth) / 2;
      let positionY = margin;

      // Añadir imagen a la primera página, centrada y escalada
      pdf.addImage(imgData, "PNG", xPosition, positionY, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Añadir páginas adicionales si es necesario (manteniendo escala y centrado)
      while (heightLeft >= 0) {
         positionY = heightLeft - imgHeight + margin;
         pdf.addPage();
         pdf.addImage(imgData, "PNG", xPosition, positionY, imgWidth, imgHeight);
         heightLeft -= pageHeight;
      }

      // Guardar el PDF
      pdf.save(`${fileName || "remuneracion"}.pdf`);

      // Cerrar el indicador de carga y mostrar mensaje de éxito
      Swal.fire({
         title: "PDF Generado",
         text: "El archivo PDF ha sido generado correctamente",
         icon: "success",
         timer: 2000,
         showConfirmButton: false,
      });
   } catch (error) {
      console.error("Error al generar PDF:", error);

      // Mostrar mensaje de error
      Swal.fire({
         title: "Error",
         text: `Error al generar PDF: ${error.message}`,
         icon: "error",
         confirmButtonText: "Aceptar",
      });
   }
};

/**
 * Función para obtener el ID de la planilla a partir del objeto planilla
 * @param {Object} planilla - Objeto con datos de la planilla
 * @returns {string|number} ID de la planilla
 */
const obtenerPlanillaId = (planilla) => {
   // Intentar obtener el ID de varias propiedades posibles
   if (planilla.planilla_id) return planilla.planilla_id;
   if (planilla.id_planilla) return planilla.id_planilla;
   if (planilla.id) return planilla.id;
   
   // Extraer ID del primer empleado si está disponible
   const query = new URLSearchParams(window.location.search);
   const idEncriptado = query.get("id");
   if (idEncriptado) {
      const planillaId = desencriptarId(idEncriptado);
      if (planillaId) return planillaId;
   }
   
   // Usar el consecutivo como último recurso
   return planilla.consecutivo || "unknown-id";
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
const RemuneracionCard = ({ empleado, onApplied }) => {
   // Determinar si el empleado está aplicado basado en su estado o marca_aplicado_epd
   const estadoAplicado =
      empleado.estado_epd === "aplicado" || parseInt(empleado.marca_aplicado_epd) === 1;
   // Inicializar el estado con el valor de aplicado del empleado
   const [aplicado, setAplicado] = useState(estadoAplicado);
   // Crear una referencia al componente de la tarjeta para exportar a PDF
   const cardRef = React.useRef(null);
   // Acceder al dispatch para acciones Redux
   const dispatch = useDispatch();
   const aplicarEmpleado = async () => {
      setAplicado(true);

      // Mostrar alerta de proceso iniciado
      Swal.fire({
         title: "Procesando",
         text: "Aplicando usuario...",
         allowOutsideClick: false,
         didOpen: () => {
            Swal.showLoading();
         },
      });
      try {
         // Ejecutar el dispatch y esperar su finalización
         await dispatch(Planilla_Aplicado(empleado.id_empleado, empleado.planilla_id_epd));

         // Mostrar alerta de éxito
         Swal.fire({
            title: "Éxito",
            text: "Empleado aplicado correctamente",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
         });
         // Notify parent to mark empleado as applied
         if (typeof onApplied === 'function') {
            onApplied(empleado.id_empleado);
         }
      } catch (error) {
         console.error("Error al aplicar empleado:", error);

         // Mostrar alerta de error
         Swal.fire({
            title: "Error",
            text: "Error al aplicar el empleado",
            icon: "error",
            confirmButtonText: "Aceptar",
         });

         // Revertir el estado en caso de error
         setAplicado(false);
      }
   };

   const descargarPDF = () => {
      if (cardRef.current) {
         // Crear un clon del elemento para manipularlo sin afectar la UI
         const cardClone = cardRef.current.cloneNode(true);

         // Hide apply button container
         const botonesParaOcultar = cardClone.querySelectorAll(".boton-container");
         botonesParaOcultar.forEach((boton) => boton.style.display = "none");
         // Hide copy buttons
         const botonesCopiar = cardClone.querySelectorAll(".boton-copiar");
         botonesCopiar.forEach((boton) => boton.style.display = "none");
         // Hide Ver perfil and PDF action buttons
         const botonesVerPerfil = cardClone.querySelectorAll(".boton-ver-perfil");
         botonesVerPerfil.forEach((btn) => btn.style.display = "none");
         
         // Compact tables: show only first two tables (Info, Desgloce)
         const tablas = cardClone.querySelectorAll(".remuneracion-table");
         tablas.forEach((tabla, idx) => {
            if (idx < 2) {
               tabla.style.marginBottom = "5px";
            } else {
               tabla.style.display = "none";
            }
         });

         // Preparar el nombre del archivo
         const nombreEmpleado = `${empleado.nombre_empleado || ""} ${
            empleado.apellidos_empleado || ""
         }`.trim();
         const consecutivo = empleado.planilla_codigo || "PL";
         const nombreArchivo = nombreEmpleado
            ? `${consecutivo}_remuneracion_${nombreEmpleado.replace(/\s+/g, "_").toLowerCase()}`
            : `${consecutivo}_remuneracion_${empleado.cedula_empleado || "empleado"}`;

         // Generar el PDF usando el clon modificado
         exportToPDF(cardClone, nombreArchivo);
      }
   };
   return (
      <div
         ref={cardRef}
         className={`remuneracion-card ${aplicado ? "aplicado" : "no-aplicado"}`}
      >
         <div className="remuneracion-header">REMUNERACIÓN OPU SAL</div>
         <div style={{ display: "flex", justifyContent: "space-between", padding: "4px" }}>
            <button
               className="boton-ver-perfil"
               onClick={descargarPDF}
               style={{ width: "48%", fontSize: "0.75rem", margin: 0 }}
            >
               PDF
            </button>
         </div>
         <InfoPersonalTable empleado={empleado} />
         <DesgloceRemuneracionTable empleado={empleado} />
         <EstadoInscripcionTable empleado={empleado} />
         <div
            className="boton-container"
            style={{ padding: "6px 4px 4px" }}
         >
            <button
               className="boton-aplicar"
               onClick={aplicarEmpleado}
               disabled={aplicado}
            >
               {aplicado ? "Aplicado" : "Aplicar"}
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
   const nombreCompleto = `${empleado.nombre_empleado || ""} ${
      empleado.apellidos_empleado || ""
   }`.trim();

   // Encontrar todas las cuentas IBAN para este empleado
   const cuentasIban = [];
   if (empleado.numero_cuenta_iban) {
      cuentasIban.push(empleado.numero_cuenta_iban);
   }

   // Agregar cuentas adicionales si existen
   if (empleado.cuentas_adicionales && Array.isArray(empleado.cuentas_adicionales)) {
      empleado.cuentas_adicionales.forEach((cuenta) => {
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
               <td>Numero de asegurado:</td>
               <td><div className="cuenta-bancaria-container">
                     <span>{empleado.asegurado_empleado || "No disponible"}</span>
                     <CopyButton
                        textToCopy={empleado.asegurado_empleado}
                        message="La cédula ha sido copiada al portapapeles"
                        title="Copiar numero de asegurado"
                     />
                  </div></td>
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
   console.log(empleado),
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
            <td className="amount">{formatCurrency(empleado.remuneracion_bruta_epd)}</td>
         </tr>
         <tr>
            <td>FCL 1,5% ROB 3,25%::</td>
            <td className="amount">{formatCurrency(empleado.fcl_1_5_epd)}</td>
         </tr>
         
         <tr>
            <td>Rebajos de Cliente:</td>
            <td className="amount">{formatCurrency(empleado.rebajos_cliente_epd)}</td>
         </tr>
         <tr>
            <td>Reintegro de Cliente:</td>
            <td className="amount">{formatCurrency(empleado.reintegro_cliente_epd)}</td>
         </tr>
         <tr>
            <td>Depósito X Recurso:</td>
            <td className="amount">{formatCurrency(empleado.deposito_x_tecurso_epd)}</td>
         </tr>
         <tr>
            <td>Cuota CC.SS:</td>
            <td className="amount">{formatCurrency(empleado.cuota_ccss_epd)}</td>
         </tr>
         <tr>
            <td>Rebajos OPU:</td>
            <td className="amount">{formatCurrency(empleado.rebajos_opu_epd)}</td>
         </tr>
         <tr>
            <td>Reintegros OPU:</td>
            <td className="amount">{formatCurrency(empleado.reintegro_opu_epd)}</td>
         </tr>
         <tr>
            <td>Total de Deducciones:</td>
            <td className="amount">{formatCurrency(empleado.total_deducciones_epd)}</td>
         </tr>
         <tr>
            <td>Total de Reintegros:</td>
            <td className="amount">{formatCurrency(empleado.total_reintegros_epd)}</td>
         </tr>
         <tr>
            <td>
               <strong>Remuneración Neta:</strong>
            </td>
            <td className="amount">
               <strong>{formatCurrency(empleado.remuneracion_neta_epd)}</strong>
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
   const [ministerio, setMinisterio] = useState(
      parseInt(empleado.ministerio_hacienda_empleado) || 0,
   );
   const [rtins, setRtins] = useState(parseInt(empleado.rt_ins_empleado) || 0);
   const [ccss, setCcss] = useState(
      parseInt(empleado.caja_costarricense_seguro_social_empleado) || 0,
   );

   // Obtener dispatch de Redux
   const dispatch = useDispatch();

   // Manejar el cambio de estado para Ministerio de Hacienda
   const handleMinisterioChange = async (event) => {
      // Detener la propagación del evento para evitar que se abra el modal
      event.stopPropagation();
      
      const newValue = event.target.checked ? 1 : 0;
      setMinisterio(newValue);

      // Crear objeto con todos los valores actualizados
      const updatedValues = {
         empleado_id: empleado.id_empleado,
         planilla_id: empleado.planilla_id_epd,
         ministerioHacienda: newValue,
         rtins: rtins,
         ccss: ccss,
      };


      try {
         // Enviar los datos actualizados a través del thunk
         await dispatch(Planilla_Incritos_Thunks(updatedValues));
         // Alerta removida - cambio silencioso
      } catch (error) {
         console.error("Error al actualizar estado de inscripción:", error);
         // Alerta de error removida - cambio silencioso
      }
   };

   // Manejar el cambio de estado para RT-INS
   const handleRtinsChange = async (event) => {
      // Detener la propagación del evento para evitar que se abra el modal
      event.stopPropagation();
      
      const newValue = event.target.checked ? 1 : 0;
      setRtins(newValue);

      // Crear objeto con todos los valores actualizados
      const updatedValues = {
         empleado_id: empleado.id_empleado,
         planilla_id: empleado.planilla_id_epd,
         ministerioHacienda: ministerio,
         rtins: newValue,
         ccss: ccss,
      };

      try {
         // Enviar los datos actualizados a través del thunk
         await dispatch(Planilla_Incritos_Thunks(updatedValues));
         // Alerta removida - cambio silencioso
      } catch (error) {
         console.error("Error al actualizar estado de inscripción:", error);
         // Alerta de error removida - cambio silencioso
      }
   };

   // Manejar el cambio de estado para CCSS
   const handleCcssChange = async (event) => {
      // Detener la propagación del evento para evitar que se abra el modal
      event.stopPropagation();
      
      const newValue = event.target.checked ? 1 : 0;
      setCcss(newValue);

      // Crear objeto con todos los valores actualizados
      const updatedValues = {
         empleado_id: empleado.id_empleado,
         planilla_id: empleado.planilla_id_epd,
         ministerioHacienda: ministerio,
         rtins: rtins,
         ccss: newValue,
      };

      try {
         // Enviar los datos actualizados a través del thunk
         await dispatch(Planilla_Incritos_Thunks(updatedValues));
         // Alerta removida - cambio silencioso
      } catch (error) {
         console.error("Error al actualizar estado de inscripción:", error);
         // Alerta de error removida - cambio silencioso
      }
   };

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
               <td className={ministerio === 1 ? "inscrito" : "no-inscrito"} onClick={(e) => e.stopPropagation()}>
                  <FormControlLabel
                     control={
                        <Switch
                           checked={ministerio === 1}
                           onChange={handleMinisterioChange}
                           color="success"
                           size="small"
                           style={{ transform: "scale(0.8)" }}
                        />
                     }
                     label={ministerio === 1 ? "Inscrito" : "No inscrito"}
                     labelPlacement="start"
                     style={{ margin: 0, fontSize: "0.8rem" }}
                  />
               </td>
            </tr>
            <tr>
               <td>RT-INS:</td>
               <td className={rtins === 1 ? "inscrito" : "no-inscrito"} onClick={(e) => e.stopPropagation()}>
                  <FormControlLabel
                     control={
                        <Switch
                           checked={rtins === 1}
                           onChange={handleRtinsChange}
                           color="success"
                           size="small"
                           style={{ transform: "scale(0.8)" }}
                        />
                     }
                     label={rtins === 1 ? "Inscrito" : "No inscrito"}
                     labelPlacement="start"
                     style={{ margin: 0, fontSize: "0.8rem" }}
                  />
               </td>
            </tr>
            <tr>
               <td>CCSS:</td>
               <td className={ccss === 1 ? "inscrito" : "no-inscrito"} onClick={(e) => e.stopPropagation()}>
                  <FormControlLabel
                     control={
                        <Switch
                           checked={ccss === 1}
                           onChange={handleCcssChange}
                           color="success"
                           size="small"
                           style={{ transform: "scale(0.8)" }}
                        />
                     }
                     label={ccss === 1 ? "Inscrito" : "No inscrito"}
                     labelPlacement="start"
                     style={{ margin: 0, fontSize: "0.8rem" }}
                  />
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
            <option value="6">6</option>
            <option value="8">8</option>
            <option value="10">10</option>
         </select>
      </label>
   </div>
);

// Los datos estáticos ya no son necesarios porque se cargan directamente desde la API

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
         estado: "No disponible",
         descripcion: "No disponible",
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
      descripcion: primerEmpleado.planilla_descripcion || "No disponible",
   };
};

/**
 * Servicio para obtener datos de empleados vacíos para casos donde no hay conexión a API
 * @returns {Promise<Array>} Promesa que resuelve con un array vacío
 */
const obtenerEmpleados = async () => {
   console.warn("Usando datos de prueba vacíos porque no se pudo conectar con la API");
   // Retorna un array vacío ya que los datos de prueba han sido eliminados
   return new Promise((resolve) => {
      setTimeout(() => resolve([]), 300);
   });
};

/**
 * Componente para mostrar la información general de la planilla
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.planilla - Datos de la planilla
 * @param {Array} props.empleados - Array de empleados para calcular totales
 * @returns {JSX.Element} Información de la planilla
 */
// Original InfoPlanilla implementation has been replaced with the new implementation above
const InfoPlanilla = ({ planilla, empleados = [] }) => {
   const dispatch = useDispatch();
   
   /**
    * Calcula el total de remuneración neta de todos los empleados
    * @returns {number} Total de remuneración neta
    */
   const calcularTotalRemuneracionNeta = () => {
      return empleados.reduce((total, empleado) => {
         const remuneracionNeta = parseFloat(empleado.remuneracion_neta_epd) || 0;
         return total + remuneracionNeta;
      }, 0);
   };

   /**
    * Calcula el total de empleados (operarios)
    * @returns {number} Total de empleados
    */
   const calcularTotalOperarios = () => {
      return empleados.length;
   };

   /**
    * Calcula el valor por operario (2 * 5669.23)
    * @returns {number} Valor calculado
    */
   const calcularValorPorOperario = () => {
      const valorBase = 5669.23;
      const multiplicador = 2;
      return valorBase * multiplicador;
   };

   /**
    * Calcula el total de depósito por recurso de todos los empleados
    * @returns {number} Total de depósito por recurso
    */
   const calcularTotalDepositoRecurso = () => {
      return empleados.reduce((total, empleado) => {
         const depositoRecurso = parseFloat(empleado.deposito_x_tecurso_epd) || 0;
         return total + depositoRecurso;
      }, 0);
   };

   /**
    * Calcula el subtotal (Total de Tarifa + Monto de Remuneraciones)
    * @returns {number} Subtotal calculado
    */
   const calcularSubtotal = () => {
      const totalTarifa = calcularTotalOperarios() * 5669.23;
      const montoRemuneraciones = calcularTotalDepositoRecurso();
      return totalTarifa + montoRemuneraciones;
   };

   /**
    * Calcula el IVA (13% del Subtotal)
    * @returns {number} IVA calculado
    */
   const calcularIVA = () => {
      const subtotal = calcularSubtotal();
      return subtotal * 0.13;
   };

   /**
    * Calcula el Monto Total (Subtotal + IVA)
    * @returns {number} Monto Total calculado
    */
   const calcularMontoTotal = () => {
      const subtotal = calcularSubtotal();
      const iva = calcularIVA();
      return subtotal + iva;
   };
   
   /**
    * Maneja el cambio de estado de la planilla
    * @param {string} newState - El nuevo estado de la planilla
    */   const handleStateChange = async (newState) => {
      // Obtener el ID de la planilla usando la función auxiliar
      const planilla_id = obtenerPlanillaId(planilla);
      
        // Mostrar confirmación antes de cambiar el estado
      Swal.fire({
         title: '¿Cambiar estado de la planilla?',
         text: `¿Está seguro que desea cambiar el estado de la planilla de "${planilla.estado}" a "${newState}"?`,
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: '#3085d6',
         cancelButtonColor: '#d33',
         confirmButtonText: 'Sí, cambiar estado',
         cancelButtonText: 'Cancelar'
      }).then(async (result) => {
         if (result.isConfirmed) {// Registrar en consola que el cambio ha sido confirmado
            const planilla_id = obtenerPlanillaId(planilla);
            
            // Mostrar indicador de carga
            Swal.fire({
               title: 'Procesando',
               text: 'Cambiando estado de planilla...',
               allowOutsideClick: false,
               didOpen: () => {
                  Swal.showLoading();
               },
            });
            
            // Llamar al endpoint para cambiar el estado
            try {               // Ejecutar el dispatch y esperar su finalización
             
               await dispatch(Planilla_CmabioEstado_Thunks(planilla_id, newState));
               
               // Mostrar alerta de éxito
               Swal.fire({
                  title: 'Estado cambiado',
                  text: `El estado de la planilla ha sido actualizado a "${newState}"`,
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false,
               });
               
               // Recargar la página para reflejar el cambio
               setTimeout(() => {
                  window.location.reload();
               }, 2500);
            } catch (error) {
               console.error('Error al cambiar estado de planilla:', error);
               
               // Mostrar alerta de error
               Swal.fire({
                  title: 'Error',
                  text: `No se pudo cambiar el estado de la planilla: ${error.message || 'Error desconocido'}`,
                  icon: 'error',
                  confirmButtonText: 'Aceptar',
               });
            }} else {
            // Registrar en consola que el cambio ha sido cancelado
         }
      });
   };

   return (
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
               <span className={`info-value estado-${planilla.estado.toLowerCase().replace(/\s+/g, '-')}`}>
                  {planilla.estado}
               </span>
               <StateSelector currentState={planilla.estado} onStateChange={handleStateChange} />
            </div>
            <div className="info-planilla-item">
               <span className="info-label">Descripción:</span>
               <span className="info-value">{planilla.descripcion}</span>
            </div>
            <div className="info-planilla-item">
               <span className="info-label">Resumen:</span>
               <div className="resumen-table-container">
                  <table className="resumen-table">
                     <tbody>
                        <tr 
                           className="resumen-row"
                           title={`Suma de remuneración neta de ${calcularTotalOperarios()} empleados`}
                        >
                           <td className="resumen-label">Total Rem. Neta:</td>
                           <td className="resumen-value total-remuneracion">
                              {formatCurrency(calcularTotalRemuneracionNeta())}
                           </td>
                        </tr>
                        <tr 
                           className="resumen-row"
                           title={`Total de empleados en la planilla: ${calcularTotalOperarios()}`}
                        >
                           <td className="resumen-label">Total de Operarios:</td>
                           <td className="resumen-value total-operarios">
                              {calcularTotalOperarios()}
                           </td>
                        </tr>
                        <tr 
                           className="resumen-row"
                           title={`${calcularTotalOperarios()} operarios × ₡5,669.23 = ${formatCurrency(calcularTotalOperarios() * 5669.23)}`}
                        >
                           <td className="resumen-label">Total de Tarifa:</td>
                           <td className="resumen-value valor-por-operario">
                              {calcularTotalOperarios()} × {formatCurrency(5669.23)} = {formatCurrency(calcularTotalOperarios() * 5669.23)}
                           </td>
                        </tr>
                        <tr 
                           className="resumen-row"
                           title={`Suma de 'Depósito X Recurso' de ${calcularTotalOperarios()} empleados`}
                        >
                           <td className="resumen-label">Monto de Remuneraciones:</td>
                           <td className="resumen-value monto-remuneraciones">
                              {formatCurrency(calcularTotalDepositoRecurso())}
                           </td>
                        </tr>
                        <tr 
                           className="resumen-row"
                           title={`${formatCurrency(calcularTotalOperarios() * 5669.23)} (Total de Tarifa) + ${formatCurrency(calcularTotalDepositoRecurso())} (Monto de Remuneraciones) = ${formatCurrency(calcularSubtotal())}`}
                        >
                           <td className="resumen-label">Subtotal:</td>
                           <td className="resumen-value subtotal">
                              {formatCurrency(calcularSubtotal())}
                           </td>
                        </tr>
                        <tr 
                           className="resumen-row"
                           title={`${formatCurrency(calcularSubtotal())} (Subtotal) × 13% = ${formatCurrency(calcularIVA())}`}
                        >
                           <td className="resumen-label">IVA:</td>
                           <td className="resumen-value iva">
                              {formatCurrency(calcularIVA())}
                           </td>
                        </tr>
                        <tr 
                           className="resumen-row"
                           title={`${formatCurrency(calcularSubtotal())} (Subtotal) + ${formatCurrency(calcularIVA())} (IVA) = ${formatCurrency(calcularMontoTotal())}`}
                        >
                           <td className="resumen-label">Monto Total:</td>
                           <td className="resumen-value monto-total">
                              {formatCurrency(calcularMontoTotal())}
                           </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
   );
};

/**
 * Componente para seleccionar y cambiar el estado de la planilla
 * @param {Object} props - Propiedades del componente
 * @param {string} props.currentState - Estado actual de la planilla
 * @param {Function} props.onStateChange - Función a ejecutar cuando se cambia el estado
 * @returns {JSX.Element|null} Selector de estado o null si no se debe mostrar
 */
const StateSelector = ({ currentState, onStateChange }) => {
   // Determinar qué opciones mostrar según el estado actual
   const getStateOptions = () => {
      switch (currentState) {
         case 'En Proceso':
            // No se muestra el selector para planillas en proceso
            return null;
         case 'Activa':
            return ['Cerrada', 'Cancelada', 'Procesada'];
         case 'Cerrada':
            return ['Activa', 'Cancelada', 'Procesada'];
         case 'Cancelada':
            return ['Activa', 'Cerrada', 'Procesada'];
         case 'Procesada':
            return ['Activa'];
         default:
            return [];
      }
   };

   const stateOptions = getStateOptions();
   
   // No mostrar selector si no hay opciones o en ciertos estados
   if (!stateOptions || stateOptions.length === 0) {
      return null;
   }

   return (
      <FormControl size="small" style={{ minWidth: 120, marginLeft: 10 }}>
         <Select
            value=""
            displayEmpty
            onChange={(e) => onStateChange(e.target.value)}
            style={{ 
               height: 30, 
               fontSize: '0.85rem',
               backgroundColor: '#f8f9fa',
               borderColor: '#ced4da' 
            }}
         >
            <MenuItem disabled value="">
               <em>Cambiar a</em>
            </MenuItem>
            {stateOptions.map((state) => (
               <MenuItem key={state} value={state}>
                  {state}
               </MenuItem>
            ))}
         </Select>
      </FormControl>
   );
};

/**
 * Función utilitaria para copiar texto al portapapeles y mostrar notificación
 * @param {string} text - Texto a copiar
 * @param {string} message - Mensaje a mostrar en la notificación (opcional)
 */
const copiarAlPortapapeles = (text, message) => {
   if (!text) return;

   navigator.clipboard.writeText(text);

   // Mostrar notificación utilizando SweetAlert2 si está disponible
   if (typeof Swal !== "undefined") {
      Swal.fire({
         title: "Texto copiado",
         text: message || "El texto ha sido copiado al portapapeles",
         icon: "success",
         timer: 1500,
         showConfirmButton: false,
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
 * Componente para realizar búsquedas de empleados
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onSearch - Función que se ejecuta al buscar
 * @returns {JSX.Element} Formulario de búsqueda
 */
const SearchBar = ({ onSearch }) => {
   const [searchTerm, setSearchTerm] = useState("");
   const [searchType, setSearchType] = useState("nombre"); // 'nombre' o 'cedula'

   /**
    * Maneja el envío del formulario de búsqueda
    * @param {Event} e - Evento de formulario
    */
   const handleSubmit = (e) => {
      e.preventDefault();
      onSearch(searchTerm, searchType);
   };

   /**
    * Maneja el cambio en el campo de búsqueda
    * @param {Event} e - Evento de input
    */
   const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchTerm(value);

      // Búsqueda en tiempo real (opcional)
      if (value === "" || value.length >= 3) {
         onSearch(value, searchType);
      }
   };

   return (
      <div className="search-bar">
         <form onSubmit={handleSubmit}>
            <div className="search-container">
               <div className="search-type">
                  <label>
                     <input
                        type="radio"
                        name="searchType"
                        value="nombre"
                        checked={searchType === "nombre"}
                        onChange={() => setSearchType("nombre")}
                     />
                     Nombre
                  </label>
                  <label>
                     <input
                        type="radio"
                        name="searchType"
                        value="cedula"
                        checked={searchType === "cedula"}
                        onChange={() => setSearchType("cedula")}
                     />
                     Cédula
                  </label>
               </div>

               <div className="search-input-container">
                  <input
                     type="text"
                     placeholder={`Buscar por ${searchType === "nombre" ? "nombre" : "cédula"}...`}
                     value={searchTerm}
                     onChange={handleInputChange}
                     className="search-input"
                  />
                  <button
                     type="submit"
                     className="search-button"
                  >
                     <i className="fas fa-search"></i>
                  </button>
               </div>
            </div>
         </form>
      </div>
   );
};

/**
 * Mini card showing resumen + Estado Inscripción and apply button
 */
const MiniRemuneracionCard = ({ empleado, onClick, onApplied }) => {
   const dispatch = useDispatch();
   // Determine if already applied
   const initApplied = empleado.estado_epd === "aplicado" || parseInt(empleado.marca_aplicado_epd) === 1;
   const [aplicado, setAplicado] = useState(initApplied);
   const nombre = `${empleado.nombre_empleado || ""} ${empleado.apellidos_empleado || ""}`.trim();

   // Handle apply action
   const handleApplyClick = async (e) => {
      e.stopPropagation();
      setAplicado(true);
      // Show loading
      Swal.fire({
         title: "Procesando",
         text: "Aplicando usuario...",
         allowOutsideClick: false,
         didOpen: () => { Swal.showLoading(); },
      });
      try {
         await dispatch(Planilla_Aplicado(empleado.id_empleado, empleado.planilla_id_epd));
         Swal.fire({ title: "Éxito", text: "Empleado aplicado correctamente", icon: "success", timer: 2000, showConfirmButton: false });
         // notify parent
         if (typeof onApplied === 'function') onApplied(empleado.id_empleado);
      } catch (error) {
         console.error("Error al aplicar empleado:", error);
         Swal.fire({ title: "Error", text: "Error al aplicar el empleado", icon: "error", confirmButtonText: "Aceptar" });
         setAplicado(false);
      }
   };

   return (
      <div className={`remuneracion-card ${aplicado ? "aplicado" : "no-aplicado"}`} onClick={onClick} style={{ cursor: 'pointer' }}>
         <div className="remuneracion-header">REMUNERACIÓN OPU SAL</div>
         <table className="remuneracion-table">
            <tbody>
               <tr><td>Nombre:</td><td>{nombre}</td></tr>
               <tr><td>Cédula:</td><td>{empleado.cedula_empleado}</td></tr>
               <tr><td>Rem. Neta:</td><td className="amount">{formatCurrency(empleado.remuneracion_neta_epd)}</td></tr>
            </tbody>
         </table>
         {/* Estado de Inscripción */}
         <EstadoInscripcionTable empleado={empleado} />
         {/* Botón aplicar */}
         <div className="boton-container" onClick={(e) => e.stopPropagation()}>
            <button className="boton-aplicar" onClick={handleApplyClick} disabled={aplicado}>
               {aplicado ? "Aplicado" : "Aplicar"}
            </button>
         </div>
      </div>
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
      estado: "No disponible",
      descripcion: "No disponible",
   });

   // Estado para la funcionalidad de búsqueda
   const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
   const [busquedaActiva, setBusquedaActiva] = useState(false);

   const location = useLocation();
   const dispatch = useDispatch();

   // Referencia a la grid de tarjetas para exportar a PDF
   const gridRef = React.useRef(null);

   // Add modal state and handlers inside the VisualizarPlanilla component
   const [modalOpen, setModalOpen] = useState(false);
   const [selectedEmpleado, setSelectedEmpleado] = useState(null);
   const [habilitarEdicion, setHabilitarEdicion] = useState(false);

   const handleOpenModal = (empleado) => {
      setSelectedEmpleado(empleado);
      setModalOpen(true);
      setHabilitarEdicion(false); // Reset checkbox state when opening modal
   };
   
   /**
    * Función para cerrar todos los modales y dialogs abiertos
    */
   const closeAllModals = () => {
      // Cerrar cualquier modal de SweetAlert2 que esté abierto
      if (Swal.isVisible()) {
         Swal.close();
      }
      
      // Cerrar el modal principal
      setModalOpen(false);
      setSelectedEmpleado(null);
      setHabilitarEdicion(false);
   };

   const handleCloseModal = async () => {
      
      // Cerrar cualquier modal de SweetAlert2 que esté abierto
      if (Swal.isVisible()) {
         Swal.close();
      }
      
      // Cerrar el modal principal y limpiar estados
      setModalOpen(false);
      setSelectedEmpleado(null);
      setHabilitarEdicion(false);
      
      // Asegurar que no haya modales de SweetAlert2 abiertos al final
      setTimeout(() => {
         if (Swal.isVisible()) {
            Swal.close();
         }
      }, 100);
   };

   /**
    * Función para manejar la habilitación de edición del empleado
    */
   const handleHabilitarEdicion = async () => {

      if (!selectedEmpleado) {
         alert('No hay empleado seleccionado');
         return;
      }

      const confirmar = confirm(`¿Está seguro que desea habilitar a ${selectedEmpleado.nombre_empleado || 'este empleado'} para edición?`);
      
      if (confirmar) {
         try {
            // Preparar los datos para el dispatch
            const formData = {
               empleado: selectedEmpleado,
               habilitado: true
            };
            
            
            // Ejecutar el dispatch
            const resultado = await dispatch(Planilla_Habilitar(formData));
            

            // Mostrar mensaje de éxito o error según el resultado
            if (resultado.success) {
               alert('Empleado habilitado para edición correctamente');
               setHabilitarEdicion(true); // Marcar el checkbox como activado
            } else {
               alert(resultado.message || 'Error al habilitar el empleado');
               setHabilitarEdicion(false); // Desmarcar el checkbox en caso de error
            }
         } catch (error) {
            console.error('Error al ejecutar Planilla_Habilitar:', error);
            alert('Error al procesar la solicitud');
            setHabilitarEdicion(false); // Desmarcar el checkbox en caso de error
         }
      } else {
         console.log('Usuario canceló la confirmación');
         setHabilitarEdicion(false); // Desmarcar el checkbox si cancela
      }
   };

   /**
    * Carga los datos de empleados desde la API o datos de prueba
    */
   useEffect(() => {
      /**
       * Carga datos de empleados desde la API
       * @param {string|number} planillaId - ID de la planilla a consultar
       */
      const cargarDatosDesdeAPI = async (planillaId) => {
         const empleadosPlanillas = await dispatch(
            Planil_Empleado_Aplicadas_Empleado_Thunks({
               planilla_id: planillaId,
            }),
         );

         const empleadosDataArr = empleadosPlanillas.data.array || [];
         const empleadosArr = procesarDatosEmpleados(empleadosDataArr);

         setEmpleados(empleadosArr);
         setDatosPlanilla(obtenerDatosPlanilla(empleadosArr));
      };

      const cargarEmpleados = async () => {
         try {
            setCargando(true);
            const queryParams = new URLSearchParams(location.search);
            const idEncriptado = queryParams.get("id");

            if (idEncriptado) {
               const planillaId = desencriptarId(idEncriptado);
               if (planillaId) {
                  await cargarDatosDesdeAPI(planillaId);
               } else {
                  await cargarDatosDePrueba();
               }
            } else {
               await cargarDatosDePrueba();
            }
         } catch (error) {
            console.error("Error al cargar los empleados:", error);
            await cargarDatosDePrueba();
         } finally {
            setCargando(false);
         }
      };

      cargarEmpleados();
   }, [location, dispatch]);

   /**
    * Carga datos de prueba cuando no hay API disponible
    */
   const cargarDatosDePrueba = async () => {
      const datos = await obtenerEmpleados();
      setEmpleados(datos);
   };

   /**
    * Procesa los datos de empleados para agrupar cuentas IBAN
    * @param {Array} empleadosData - Datos crudos de empleados
    * @returns {Array} Datos procesados de empleados
    */
   const procesarDatosEmpleados = (empleadosData) => {
      const empleadosMap = new Map();

      empleadosData.forEach((empleado) => {
         const empleadoKey = `${empleado.id_empleado}-${empleado.planilla_id}-${empleado.id_empresa}`;

         if (empleadosMap.has(empleadoKey)) {
            const empleadoExistente = empleadosMap.get(empleadoKey);

            if (
               empleado.numero_cuenta_iban &&
               !empleadoExistente.cuentas_adicionales.includes(empleado.numero_cuenta_iban)
            ) {
               empleadoExistente.cuentas_adicionales.push(empleado.numero_cuenta_iban);
            }
         } else {
            const nuevoEmpleado = {
               ...empleado,
               cuentas_adicionales: empleado.numero_cuenta_iban
                  ? [empleado.numero_cuenta_iban]
                  : [],
            };
            empleadosMap.set(empleadoKey, nuevoEmpleado);
         }
      });

      // Obtener array de empleados
      const empleadosArray = Array.from(empleadosMap.values());

      // Ordenar empleados: primero los no aplicados (marca_aplicado_epd=0) y luego los aplicados (marca_aplicado_epd=1)
      // Dentro de cada grupo, ordenar alfabéticamente por nombre
      return empleadosArray.sort((a, b) => {
         const aplicadoA = parseInt(a.marca_aplicado_epd) === 1;
         const aplicadoB = parseInt(b.marca_aplicado_epd) === 1;

         // Si uno está aplicado y el otro no, el no aplicado va primero
         if (aplicadoA !== aplicadoB) {
            return aplicadoA ? 1 : -1;
         }

         // Si ambos tienen el mismo estado de aplicación, ordenar alfabéticamente
         const nombreA = `${a.nombre_empleado || ""} ${a.apellidos_empleado || ""}`
            .trim()
            .toLowerCase();
         const nombreB = `${b.nombre_empleado || ""} ${b.apellidos_empleado || ""}`
            .trim()
            .toLowerCase();
         return nombreA.localeCompare(nombreB);
      });
   };

   /**
    * Maneja el cambio en el número de tarjetas por fila
    * @param {number} valor - Nuevo número de tarjetas por fila
    */
   const handleTarjetasPorFilaChange = (valor) => {
      setTarjetasPorFila(valor);
      localStorage.setItem("tarjetasPorFila", valor);
   };

   /**
    * Maneja la búsqueda de empleados por nombre o cédula
    * @param {string} term - Término de búsqueda
    * @param {string} type - Tipo de búsqueda ('nombre' o 'cedula')
    */
   const handleSearch = (term, type) => {
      if (!term) {
         setBusquedaActiva(false);
         return;
      }

      const termLower = term.toLowerCase();

      const filtrados = empleados.filter((empleado) => {
         if (type === "cedula") {
            return (
               empleado.cedula_empleado &&
               empleado.cedula_empleado.toString().toLowerCase().includes(termLower)
            );
         } else {
            const nombreCompleto = `${empleado.nombre_empleado || ""} ${
               empleado.apellidos_empleado || ""
            }`
               .trim()
               .toLowerCase();
            return nombreCompleto.includes(termLower);
         }
      });

      setEmpleadosFiltrados(filtrados);
      setBusquedaActiva(true);
   };

   // Determinar qué lista de empleados mostrar
   const empleadosMostrados = busquedaActiva ? empleadosFiltrados : empleados;

   // Estilos dinámicos para la cuadrícula optimizada para muchas tarjetas
   const gridStyle = {
      "--tarjetas-por-fila": tarjetasPorFila,
      display: "grid",
      gridTemplateColumns: `repeat(${tarjetasPorFila}, 1fr)`,
      gap: "10px",
      marginTop: "15px",
   };

   /** Handle marking empleado as applied in list and selected */
   const handleEmpleadoApplied = (empleadoId) => {
     // Update and sort main empleados list
     setEmpleados((prev) => {
       const updated = prev.map((emp) =>
         emp.id_empleado === empleadoId ? { ...emp, marca_aplicado_epd: '1' } : emp
       );
       return [...updated].sort((a, b) => {
         const appliedA = parseInt(a.marca_aplicado_epd) === 1;
         const appliedB = parseInt(b.marca_aplicado_epd) === 1;
         if (appliedA !== appliedB) return appliedA ? 1 : -1;
         const nameA = `${a.nombre_empleado || ""} ${a.apellidos_empleado || ""}`.trim().toLowerCase();
         const nameB = `${b.nombre_empleado || ""} ${b.apellidos_empleado || ""}`.trim().toLowerCase();
         return nameA.localeCompare(nameB);
       });
     });
     // Update and sort filtered list if active
     if (busquedaActiva) {
       setEmpleadosFiltrados((prev) => {
         const updated = prev.map((emp) =>
           emp.id_empleado === empleadoId ? { ...emp, marca_aplicado_epd: '1' } : emp
         );
         return [...updated].sort((a, b) => {
           const appliedA = parseInt(a.marca_aplicado_epd) === 1;
           const appliedB = parseInt(b.marca_aplicado_epd) === 1;
           if (appliedA !== appliedB) return appliedA ? 1 : -1;
           const nameA = `${a.nombre_empleado || ""} ${a.apellidos_empleado || ""}`.trim().toLowerCase();
           const nameB = `${b.nombre_empleado || ""} ${b.apellidos_empleado || ""}`.trim().toLowerCase();
           return nameA.localeCompare(nameB);
         });
       });
     }
     // Update selectedEmpleado state if applicable
     if (selectedEmpleado && selectedEmpleado.id_empleado === empleadoId) {
       setSelectedEmpleado((emp) => ({ ...emp, marca_aplicado_epd: '1' }));
     }
   };

   return (
      <TarjetaRow
         texto="Visualizar Planilla"
         subtitulo="Visualiza la planilla de empleados con sus remuneraciones y estados de inscripción."
         icono="fa-solid fa-users"
      >
         <div className="remuneraciones-container">
            <InfoPlanilla planilla={datosPlanilla} empleados={empleados} />

            <div className="controles-filtros-container">
               <TarjetasSelector
                  value={tarjetasPorFila}
                  onChange={handleTarjetasPorFilaChange}
               />

               <SearchBar onSearch={handleSearch} />
            </div>

            {cargando ? (
               <div className="cargando-mensaje">Cargando información de empleados...</div>
            ) : empleadosMostrados.length === 0 && busquedaActiva ? (
               <div className="sin-resultados">
                  No se encontraron empleados que coincidan con la búsqueda.
               </div>
            ) : (
               <div
                  className="remuneraciones-grid"
                  style={gridStyle}
                  ref={gridRef}
               >
                  {empleadosMostrados.map((empleado, index) => (
                     <MiniRemuneracionCard
                        key={index}
                        empleado={empleado}
                        onClick={() => handleOpenModal(empleado)}
                        onApplied={handleEmpleadoApplied}
                     />
                  ))}
               </div>
            )}
         </div>

         {selectedEmpleado && (
            <Dialog open={modalOpen} onClose={closeAllModals} maxWidth="md" fullWidth>
               <DialogTitle>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span>Detalle Remuneración</span>
                     <button 
                        onClick={handleCloseModal}
                        style={{
                           background: 'none',
                           border: 'none',
                           fontSize: '20px',
                           cursor: 'pointer',
                           color: '#666',
                           padding: '0',
                           width: '30px',
                           height: '30px',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                        }}
                        title="Cerrar"
                     >
                        ×
                     </button>
                  </div>
               </DialogTitle>
               {selectedEmpleado.marca_aplicado_epd === 1 && (
                  <div style={{ margin: '8px 0', display: 'flex', justifyContent: 'flex-end' }}>
                     <label>
                        <input type="checkbox" value={selectedEmpleado.tipo_planilla} />
                        Habilitar empleado para modificación
                     </label>
                  </div>
               )}

               <DialogContent>
                  <RemuneracionCard empleado={selectedEmpleado} onApplied={handleEmpleadoApplied} />
                  
                  {/* Checkbox adicional para habilitar edición */}
                  <div style={{ marginTop: '15px', padding: '10px', borderTop: '1px solid #e0e0e0' }}>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input 
                           type="checkbox" 
                           checked={habilitarEdicion}
                           style={{ transform: 'scale(1.2)' }}
                           onChange={(e) => {
                              if (e.target.checked) {
                                 handleHabilitarEdicion();
                              } else {
                                 setHabilitarEdicion(false);
                              }
                           }}
                        />
                        Habilitar para editar
                     </label>
                  </div>
                  
                  {/* Botón de cerrar en el contenido */}
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                     <button 
                        onClick={handleCloseModal}
                        style={{
                           backgroundColor: '#007bff',
                           color: 'white',
                           border: 'none',
                           padding: '10px 20px',
                           borderRadius: '5px',
                           cursor: 'pointer',
                           fontSize: '14px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                     >
                        Cerrar
                     </button>
                  </div>
               </DialogContent>
            </Dialog>
         )}
      </TarjetaRow>
   );
};

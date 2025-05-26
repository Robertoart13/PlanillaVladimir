import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useMemo, useRef, useState, useEffect } from "react";
import { Switch } from "@mui/material";
import Swal from "sweetalert2";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";
import { Empleado_Editar_Thunks } from "../../../../store/Empleado/Empleado_Editar_Thunks";

/**
 * Componente principal para editar un empleado.
 * @returns {JSX.Element} Componente de edición de empleado.
 */
export const EditarEmpleado = () => {
   // Estados para manejar errores, mensajes y datos del formulario
   const [error, setError] = useState(false);
   const [mensajeError, setMensajeError] = useState("");
   const [formularioEnviado, setFormularioEnviado] = useState(false);
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const [datosFormulario, setDatosFormulario] = useState(inicializarDatosFormulario());
   const [cuentasBancarias, setCuentasBancarias] = useState([""]);
   const [departamentos, setDepartamentos] = useState([]);
   const [nacionalidades, setNacionalidades] = useState([]);
   const [empresas, setEmpresas] = useState([]);
   const [puestos, setPuestos] = useState([]);
   const [tiposContrato, setTiposContrato] = useState([]);
   const [supervisores, setSupervisores] = useState([]);
   const [opcionesCargadas, setOpcionesCargadas] = useState(false);
   const [cargandoDatos, setCargandoDatos] = useState(false);

   // Efecto para cargar las opciones de selección
   useEffect(() => {
      cargarOpcionesSeleccion();
   }, [dispatch]);

   // Efecto para cargar los datos del empleado seleccionado
   useEffect(() => {
      cargarDatosEmpleadoSeleccionado();
   }, [opcionesCargadas, navigate]);

   // Función para inicializar los datos del formulario
   function inicializarDatosFormulario() {
      return {
         id_empleado: "",
         nombre_empleado: "",
         apellidos_empleado: "",
         cedula_empleado: "",
         fecha_vencimiento_cedula_empleado: "",
         fecha_nacimiento_empleado: "",
         estado_civil_empleado: "",
         correo_empleado: "",
         telefono_empleado: "",
         direccion_empleado: "",
         fecha_ingreso_empleado: "",
         fecha_salida_empleado: "",
         jornada_laboral_empleado: "",
         horario_empleado: "",
         salario_empleado: "",
         id_nacionalidad: "",
         id_tipo_contrato: "",
         id_departamento: "",
         id_puesto: "",
         id_supervisor: "",
         id_empresa: "",
         cuentas_bancarias: [""],
         estado_empleado: "",
         fecha_creacion_empleado: "",
         fecha_modificacion_empleado: "",
         nombre_departamento: "",
         nombre_empresa: "",
         nombre_nacionalidad: "",
         nombre_puesto: "",
         nombre_supervisor: "",
         nombre_tipo_contrato: "",
         es_inactivo: 0,
         ministerio_hacienda: false,
         rt_ins: false,
         caja_costarricense_seguro_social: false,
      };
   }

   /**
    * Carga las opciones de selección desde el servidor.
    */
   async function cargarOpcionesSeleccion() {
      setCargandoDatos(true);
      mostrarCargando("Cargando opciones", "Por favor espere mientras se cargan las opciones...");
      const departamentosData = await dispatch(SelectOpcion_Thunks("departamentos/select"));
      const nacionalidadesData = await dispatch(SelectOpcion_Thunks("nacionalidades/select"));
      const empresasData = await dispatch(SelectOpcion_Thunks("empresas/select"));
      const puestosData = await dispatch(SelectOpcion_Thunks("puestos/select"));
      const tiposContratoData = await dispatch(SelectOpcion_Thunks("tipos_contrato/select"));
      const supervisoresData = await dispatch(SelectOpcion_Thunks("supervisores/select"));
      actualizarOpcionesSeleccion(departamentosData, nacionalidadesData, empresasData, puestosData, tiposContratoData, supervisoresData);
      setCargandoDatos(false);
      setOpcionesCargadas(true);
      Swal.close();
   }

   /**
    * Actualiza las opciones de selección en el estado.
    * @param {Object} departamentosData - Datos de departamentos.
    * @param {Object} nacionalidadesData - Datos de nacionalidades.
    * @param {Object} empresasData - Datos de empresas.
    * @param {Object} puestosData - Datos de puestos.
    * @param {Object} tiposContratoData - Datos de tipos de contrato.
    * @param {Object} supervisoresData - Datos de supervisores.
    */
   function actualizarOpcionesSeleccion(departamentosData, nacionalidadesData, empresasData, puestosData, tiposContratoData, supervisoresData) {
      if (departamentosData.success) setDepartamentos(departamentosData.data.array || []);
      if (nacionalidadesData.success) setNacionalidades(nacionalidadesData.data.array || []);
      if (empresasData.success) setEmpresas(empresasData.data.array || []);
      if (puestosData.success) setPuestos(puestosData.data.array || []);
      if (tiposContratoData.success) setTiposContrato(tiposContratoData.data.array || []);
      if (supervisoresData.success) setSupervisores(supervisoresData.data.array || []);
   }

   /**
    * Muestra un mensaje de carga utilizando SweetAlert.
    * @param {string} titulo - Título del mensaje.
    * @param {string} texto - Texto del mensaje.
    */
   function mostrarCargando(titulo, texto) {
      Swal.fire({
         title: titulo,
         text: texto,
         allowOutsideClick: false,
         didOpen: () => {
            Swal.showLoading();
         },
      });
   }

   /**
    * Carga los datos del empleado seleccionado desde el almacenamiento local.
    */
   function cargarDatosEmpleadoSeleccionado() {
      const datosAlmacenados = localStorage.getItem("selectedEmpleado");
      if (opcionesCargadas && datosAlmacenados) {
         setCargandoDatos(true);
         mostrarCargando("Cargando datos", "Por favor espere...");
         const datosExistentes = JSON.parse(datosAlmacenados);
         setDatosFormulario(formatearDatosEmpleado(datosExistentes));
         setCuentasBancarias(datosExistentes.cuentas_iban.split(",").map((cuenta) => cuenta.trim()));
         setCargandoDatos(false);
         Swal.close();
      } else if (!datosAlmacenados) {
         manejarErrorSinDatos();
      }
   }

   /**
    * Formatea los datos del empleado para el formulario.
    * @param {Object} datosExistentes - Datos existentes del empleado.
    * @returns {Object} Datos formateados para el formulario.
    */
   function formatearDatosEmpleado(datosExistentes) {
      return {
         id_empleado: datosExistentes.id_empleado,
         nombre_empleado: datosExistentes.nombre_empleado,
         apellidos_empleado: datosExistentes.apellidos_empleado,
         cedula_empleado: datosExistentes.cedula_empleado,
         fecha_vencimiento_cedula_empleado: formatearFecha(datosExistentes.fecha_vencimiento_cedula_empleado),
         fecha_nacimiento_empleado: formatearFecha(datosExistentes.fecha_nacimiento_empleado),
         estado_civil_empleado: datosExistentes.estado_civil_empleado,
         correo_empleado: datosExistentes.correo_empleado,
         telefono_empleado: datosExistentes.telefono_empleado,
         direccion_empleado: datosExistentes.direccion_empleado,
         fecha_ingreso_empleado: formatearFecha(datosExistentes.fecha_ingreso_empleado),
         fecha_salida_empleado: formatearFecha(datosExistentes.fecha_salida_empleado),
         jornada_laboral_empleado: datosExistentes.jornada_laboral_empleado,
         horario_empleado: datosExistentes.horario_empleado,
         salario_empleado: datosExistentes.salario_empleado,
         id_nacionalidad: datosExistentes.id_nacionalidad,
         id_tipo_contrato: datosExistentes.id_tipo_contrato,
         id_departamento: datosExistentes.id_departamento,
         id_puesto: datosExistentes.id_puesto,
         id_supervisor: datosExistentes.id_supervisor,
         id_empresa: datosExistentes.id_empresa,
         cuentas_bancarias: datosExistentes.cuentas_iban.split(",").map((cuenta) => cuenta.trim()),
         estado_empleado: datosExistentes.estado_empleado,
         fecha_creacion_empleado: formatearFecha(datosExistentes.fecha_creacion_empleado),
         fecha_modificacion_empleado: formatearFecha(datosExistentes.fecha_modificacion_empleado),
         nombre_departamento: datosExistentes.nombre_departamento,
         nombre_empresa: datosExistentes.nombre_empresa,
         nombre_nacionalidad: datosExistentes.nombre_nacionalidad,
         nombre_puesto: datosExistentes.nombre_puesto,
         nombre_supervisor: datosExistentes.nombre_supervisor,
         nombre_tipo_contrato: datosExistentes.nombre_tipo_contrato,
         es_inactivo: datosExistentes.estado_empleado,
         ministerio_hacienda: datosExistentes.ministerio_hacienda_empleado,
         rt_ins: datosExistentes.rt_ins_empleado,
         caja_costarricense_seguro_social: datosExistentes.caja_costarricense_seguro_social_empleado,
      };
   }

   /**
    * Formatea una fecha en formato YYYY-MM-DD.
    * @param {string} fechaString - Fecha en formato de cadena.
    * @returns {string} Fecha formateada o cadena vacía si es inválida.
    */
   function formatearFecha(fechaString) {
      if (!fechaString) return "";
      const fecha = new Date(fechaString);
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const día = String(fecha.getDate()).padStart(2, "0");
      return `${año}-${mes}-${día}`;
   }

   /**
    * Maneja el error cuando no hay datos de empleado seleccionados.
    */
   function manejarErrorSinDatos() {
      setError(true);
      setDatosFormulario(inicializarDatosFormulario());
      setMensajeError("No se ha seleccionado ninguna empresa.");
      setTimeout(() => {
         navigate("/empresas/lista");
      }, 3000);
   }

   /**
    * Maneja el cambio de los campos del formulario.
    * @param {Object} e - Evento de cambio del formulario.
    */
   function manejarCambioFormulario(e) {
      const { name, value } = e.target;
      setDatosFormulario({ ...datosFormulario, [name]: value });
   }

   /**
    * Maneja el envío del formulario de edición de empleado.
    * @param {Object} e - Evento de envío del formulario.
    */
   function manejarEnvioFormulario(e) {
      e.preventDefault();
      setFormularioEnviado(true);
      if (!validarCamposRequeridos()) return;
      if (!validarCorreoElectronico(datosFormulario.correo_empleado)) return;
      limpiarErrores();
      confirmarEdicionEmpleado();
   }

   /**
    * Valida que todos los campos requeridos estén llenos.
    * @returns {boolean} Verdadero si todos los campos están llenos, falso de lo contrario.
    */
   function validarCamposRequeridos() {
      const camposRequeridos = Object.keys(datosFormulario).filter(campo => campo !== 'fecha_salida_empleado');
      if (camposRequeridos.some(campo => datosFormulario[campo] === "" || datosFormulario[campo] === "default")) {
         setError(true);
         setMensajeError("Todos los campos deben estar llenos.");
         return false;
      }
      return true;
   }

   /**
    * Valida el formato del correo electrónico.
    * @param {string} correo - Correo electrónico a validar.
    * @returns {boolean} Verdadero si el correo es válido, falso de lo contrario.
    */
   function validarCorreoElectronico(correo) {
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(correo)) {
         setError(true);
         setMensajeError("Por favor, ingrese un correo electrónico válido.");
         return false;
      }
      return true;
   }

   /**
    * Limpia los mensajes de error.
    */
   function limpiarErrores() {
      setError(false);
      setMensajeError("");
   }

   /**
    * Confirma la edición del empleado mediante un diálogo de confirmación.
    */
   function confirmarEdicionEmpleado() {
      Swal.fire({
         title: "¿Está seguro?",
         text: "Confirma que desea Editar un nuevo empleado.",
         icon: "warning",
         showCancelButton: true,
         confirmButtonText: "Sí, Editar",
         cancelButtonText: "Cancelar",
      }).then(async (result) => {
         if (result.isConfirmed) {
            mostrarCargando("Creando empleado", "Por favor espere...");
            const respuesta = await dispatch(Empleado_Editar_Thunks({ ...datosFormulario, cuentas_bancarias: cuentasBancarias }));
            manejarRespuestaEdicion(respuesta);
         }
      });
   }

   /**
    * Maneja la respuesta de la edición del empleado.
    * @param {Object} respuesta - Respuesta del servidor.
    */
   function manejarRespuestaEdicion(respuesta) {
      if (respuesta.success) {
         Swal.fire("¡Editado!", "El empleado ha sido editado exitosamente.", "success").then(() => {
            localStorage.removeItem("selectedEmpleado");
            navigate("/empleados/lista");
            setDatosFormulario(inicializarDatosFormulario());
         });
      } else {
         setError(true);
         setMensajeError(respuesta.message);
         Swal.fire({
            title: "Error",
            text: respuesta.message || "Ocurrió un error inesperado.",
            icon: "error",
            confirmButtonText: "Aceptar"
         });
      }
   }

   /**
    * Obtiene el estilo de entrada para un campo específico.
    * @param {string} campo - Nombre del campo.
    * @returns {Object} Estilo de entrada.
    */
   function obtenerEstiloEntrada(campo) {
      if (formularioEnviado && datosFormulario[campo] === "") {
         return { border: "1px solid red" };
      }
      if (campo === "correo_empleado" && formularioEnviado) {
         const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!regexCorreo.test(datosFormulario.correo_empleado)) {
            return { border: "1px solid red" };
         }
      }
      return { border: "1px solid #ced4da" };
   }

   /**
    * Maneja la adición de una nueva cuenta bancaria.
    */
   function manejarAdicionCuenta() {
      setCuentasBancarias([...cuentasBancarias, ""]);
   }

   /**
    * Maneja la eliminación de una cuenta bancaria.
    * @param {number} indice - Índice de la cuenta a eliminar.
    */
   function manejarEliminacionCuenta(indice) {
      const nuevasCuentas = cuentasBancarias.filter((_, i) => i !== indice);
      setCuentasBancarias(nuevasCuentas);
   }

   /**
    * Maneja el cambio de valor de una cuenta bancaria.
    * @param {number} indice - Índice de la cuenta.
    * @param {string} valor - Nuevo valor de la cuenta.
    */
   function manejarCambioCuenta(indice, valor) {
      const nuevasCuentas = [...cuentasBancarias];
      nuevasCuentas[indice] = valor;
      setCuentasBancarias(nuevasCuentas);
   }

   // Renderizado del componente
   return (
      <TarjetaRow
         texto="Editar un nuevo empleado"
         subtitulo="Vista esta pagina para Editar un nuevo empleado"
      >
         {error && (
            <ErrorMessage
               error={error}
               message={mensajeError}
            />
         )}

         <div className="card-body">
            <div className="row">
               <div className="row">
                  <div className="col-md-12">
                     <div className="mb-3">
                        <Switch
                           checked={datosFormulario.es_inactivo === 1}
                           onChange={(e) => setDatosFormulario({ ...datosFormulario, es_inactivo: e.target.checked ? 1 : 0 })}
                        />
                        <label>Estado del empleado</label>
                     </div>
                  </div>
               </div>

               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="nombre_empleado"
                     >
                        Nombre del empleado
                     </label>
                     <input
                        type="text"
                        style={obtenerEstiloEntrada("nombre_empleado")}
                        className="form-control"
                        id="nombre_empleado"
                        name="nombre_empleado"
                        value={datosFormulario.nombre_empleado}
                        onChange={manejarCambioFormulario}
                        placeholder="Enter employee name"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="apellidos_empleado"
                     >
                        Apellidos del empleado
                     </label>
                     <input
                        type="text"
                        style={obtenerEstiloEntrada("apellidos_empleado")}
                        className="form-control"
                        id="apellidos_empleado"
                        name="apellidos_empleado"
                        value={datosFormulario.apellidos_empleado}
                        onChange={manejarCambioFormulario}
                        placeholder="Enter employee last name"
                     />
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="correo_empleado"
                     >
                        Correo del empleado
                     </label>
                     <input
                        type="email"
                        style={obtenerEstiloEntrada("correo_empleado")}
                        className="form-control"
                        id="correo_empleado"
                        name="correo_empleado"
                        value={datosFormulario.correo_empleado}
                        onChange={manejarCambioFormulario}
                        placeholder="Enter employee email"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="telefono_empleado"
                     >
                        Teléfono del empleado
                     </label>
                     <input
                        type="text"
                        style={obtenerEstiloEntrada("telefono_empleado")}
                        className="form-control"
                        id="telefono_empleado"
                        name="telefono_empleado"
                        value={datosFormulario.telefono_empleado}
                        onChange={manejarCambioFormulario}
                        placeholder="Enter employee phone"
                     />
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="direccion_empleado"
                     >
                        Dirección del empleado
                     </label>
                     <textarea
                        style={obtenerEstiloEntrada("direccion_empleado")}
                        className="form-control"
                        id="direccion_empleado"
                        name="direccion_empleado"
                        value={datosFormulario.direccion_empleado}
                        onChange={manejarCambioFormulario}
                        rows="3"
                        placeholder="Enter employee address"
                     ></textarea>
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="id_nacionalidad"
                     >
                        Nacionalidad
                     </label>
                     <select
                        style={obtenerEstiloEntrada("id_nacionalidad")}
                        className="form-control"
                        id="id_nacionalidad"
                        name="id_nacionalidad"
                        value={datosFormulario.id_nacionalidad}
                        onChange={manejarCambioFormulario}
                     >
                        <option value="">Seleccione una opción</option>
                        {cargandoDatos ? (
                           <option>Cargando...</option>
                        ) : Array.isArray(nacionalidades) ? (
                           nacionalidades.map((nacionalidad) => (
                              <option
                                 key={nacionalidad.id_nacionalidad}
                                 value={nacionalidad.id_nacionalidad}
                              >
                                 {nacionalidad.nombre_nacionalidad}
                              </option>
                           ))
                        ) : (
                           <option>Error loading options</option>
                        )}
                     </select>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="cedula_empleado"
                     >
                        Cédula del empleado
                     </label>
                     <input
                        type="text"
                        style={obtenerEstiloEntrada("cedula_empleado")}
                        className="form-control"
                        id="cedula_empleado"
                        name="cedula_empleado"
                        value={datosFormulario.cedula_empleado}
                        onChange={manejarCambioFormulario}
                        placeholder="Enter employee ID"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="fecha_vencimiento_cedula_empleado"
                     >
                        Fecha de vencimiento de cédula
                     </label>
                     <input
                        type="date"
                        style={obtenerEstiloEntrada("fecha_vencimiento_cedula_empleado")}
                        className="form-control"
                        id="fecha_vencimiento_cedula_empleado"
                        name="fecha_vencimiento_cedula_empleado"
                        value={datosFormulario.fecha_vencimiento_cedula_empleado}
                        onChange={manejarCambioFormulario}
                     />
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="fecha_nacimiento_empleado"
                     >
                        Fecha de nacimiento
                     </label>
                     <input
                        type="date"
                        style={obtenerEstiloEntrada("fecha_nacimiento_empleado")}
                        className="form-control"
                        id="fecha_nacimiento_empleado"
                        name="fecha_nacimiento_empleado"
                        value={datosFormulario.fecha_nacimiento_empleado}
                        onChange={manejarCambioFormulario}
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="estado_civil_empleado"
                     >
                        Estado civil
                     </label>
                     <select
                        style={obtenerEstiloEntrada("estado_civil_empleado")}
                        className="form-control"
                        id="estado_civil_empleado"
                        name="estado_civil_empleado"
                        value={datosFormulario.estado_civil_empleado}
                        onChange={manejarCambioFormulario}
                     >
                        <option value="soltero">Soltero</option>
                        <option value="casado">Casado</option>
                        <option value="divorciado">Divorciado</option>
                        <option value="viudo">Viudo</option>
                     </select>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="horario_empleado"
                     >
                        Horario
                     </label>
                     <input
                        type="text"
                        style={obtenerEstiloEntrada("horario_empleado")}
                        className="form-control"
                        id="horario_empleado"
                        name="horario_empleado"
                        value={datosFormulario.horario_empleado}
                        onChange={manejarCambioFormulario}
                        placeholder="Enter schedule"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="salario_empleado"
                     >
                        Salario
                     </label>
                     <input
                        type="number"
                        style={obtenerEstiloEntrada("salario_empleado")}
                        className="form-control"
                        id="salario_empleado"
                        name="salario_empleado"
                        value={datosFormulario.salario_empleado}
                        onChange={manejarCambioFormulario}
                        placeholder="Enter salary"
                     />
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="id_tipo_contrato"
                     >
                        Tipo de Contrato
                     </label>
                     <select
                        style={obtenerEstiloEntrada("id_tipo_contrato")}
                        className="form-control"
                        id="id_tipo_contrato"
                        name="id_tipo_contrato"
                        value={datosFormulario.id_tipo_contrato}
                        onChange={manejarCambioFormulario}
                     >
                        <option value="">Seleccione una opción</option>
                        {cargandoDatos ? (
                           <option>Cargando...</option>
                        ) : Array.isArray(tiposContrato) ? (
                           tiposContrato.map((tipo) => (
                              <option
                                 key={tipo.id_tipo_contrato}
                                 value={tipo.id_tipo_contrato}
                              >
                                 {tipo.nombre_tipo_contrato}
                              </option>
                           ))
                        ) : (
                           <option>Error loading options</option>
                        )}
                     </select>
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="id_departamento"
                     >
                        Departamento
                     </label>
                     <select
                        style={obtenerEstiloEntrada("id_departamento")}
                        className="form-control"
                        id="id_departamento"
                        name="id_departamento"
                        value={datosFormulario.id_departamento}
                        onChange={manejarCambioFormulario}
                     >
                        <option value="">Seleccione una opción</option>
                        {cargandoDatos ? (
                           <option>Cargando...</option>
                        ) : Array.isArray(departamentos) ? (
                           departamentos.map((departamento) => (
                              <option
                                 key={departamento.id_departamento}
                                 value={departamento.id_departamento}
                              >
                                 {departamento.nombre_departamento}
                              </option>
                           ))
                        ) : (
                           <option>Error loading options</option>
                        )}
                     </select>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="id_puesto"
                     >
                        Puesto
                     </label>
                     <select
                        style={obtenerEstiloEntrada("id_puesto")}
                        className="form-control"
                        id="id_puesto"
                        name="id_puesto"
                        value={datosFormulario.id_puesto}
                        onChange={manejarCambioFormulario}
                     >
                        <option value="">Seleccione una opción</option>
                        {cargandoDatos ? (
                           <option>Cargando...</option>
                        ) : Array.isArray(puestos) ? (
                           puestos.map((puesto) => (
                              <option
                                 key={puesto.id_puesto}
                                 value={puesto.id_puesto}
                              >
                                 {puesto.nombre_puesto}
                              </option>
                           ))
                        ) : (
                           <option>Error loading options</option>
                        )}
                     </select>
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="id_supervisor"
                     >
                        Supervisor
                     </label>
                     <select
                        style={obtenerEstiloEntrada("id_supervisor")}
                        className="form-control"
                        id="id_supervisor"
                        name="id_supervisor"
                        value={datosFormulario.id_supervisor}
                        onChange={manejarCambioFormulario}
                     >
                        <option value="">Seleccione una opción</option>
                        {cargandoDatos ? (
                           <option>Cargando...</option>
                        ) : Array.isArray(supervisores) ? (
                           supervisores.map((supervisor) => (
                              <option
                                 key={supervisor.id_usuario}
                                 value={supervisor.id_usuario}
                              >
                                 {supervisor.nombre_usuario}
                              </option>
                           ))
                        ) : (
                           <option>Error loading options</option>
                        )}
                     </select>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="id_empresa"
                     >
                        Empresa
                     </label>
                     <select
                        style={obtenerEstiloEntrada("id_empresa")}
                        className="form-control"
                        id="id_empresa"
                        name="id_empresa"
                        value={datosFormulario.id_empresa}
                        onChange={manejarCambioFormulario}
                     >
                        <option value="">Seleccione una opción</option>
                        {cargandoDatos ? (
                           <option>Cargando...</option>
                        ) : Array.isArray(empresas) ? (
                           empresas.map((empresa) => (
                              <option
                                 key={empresa.id_empresa}
                                 value={empresa.id_empresa}
                              >
                                 {empresa.nombre_comercial_empresa}
                              </option>
                           ))
                        ) : (
                           <option>Error loading options</option>
                        )}
                     </select>
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="fecha_ingreso_empleado"
                     >
                        Fecha de ingreso
                     </label>
                     <input
                        type="date"
                        style={obtenerEstiloEntrada("fecha_ingreso_empleado")}
                        className="form-control"
                        id="fecha_ingreso_empleado"
                        name="fecha_ingreso_empleado"
                        value={datosFormulario.fecha_ingreso_empleado}
                        onChange={manejarCambioFormulario}
                     />
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="fecha_salida_empleado"
                     >
                        Fecha de salida
                     </label>
                     <input
                        type="date"
                        style={obtenerEstiloEntrada("fecha_salida_empleado")}
                        className="form-control"
                        id="fecha_salida_empleado"
                        name="fecha_salida_empleado"
                        value={datosFormulario.fecha_salida_empleado}
                        onChange={manejarCambioFormulario}
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="jornada_laboral_empleado"
                     >
                        Jornada laboral
                     </label>
                     <input
                        type="text"
                        style={obtenerEstiloEntrada("jornada_laboral_empleado")}
                        className="form-control"
                        id="jornada_laboral_empleado"
                        name="jornada_laboral_empleado"
                        value={datosFormulario.jornada_laboral_empleado}
                        onChange={manejarCambioFormulario}
                        placeholder="Enter work schedule"
                     />
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label">Cuentas Bancarias</label>
                     {cuentasBancarias.map((cuenta, index) => (
                        <div
                           key={index}
                           className="d-flex align-items-center mb-2"
                        >
                           <input
                              type="text"
                              className="form-control"
                              value={cuenta}
                              onChange={(e) => manejarCambioCuenta(index, e.target.value)}
                              placeholder="Enter bank account"
                           />
                           <button
                              type="button"
                              className="btn btn-danger ms-2"
                              onClick={() => manejarEliminacionCuenta(index)}
                           >
                              -
                           </button>
                        </div>
                     ))}
                     <button
                        type="button"
                        className="btn btn-success"
                        onClick={manejarAdicionCuenta}
                     >
                        +
                     </button>
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <Switch
                        checked={datosFormulario.ministerio_hacienda}
                        onChange={(e) => setDatosFormulario({ ...datosFormulario, ministerio_hacienda: e.target.checked })}
                     />
                     <label>Ministerio de Hacienda</label>
                  </div>
                  <div className="mb-3">
                     <Switch
                        checked={datosFormulario.rt_ins}
                        onChange={(e) => setDatosFormulario({ ...datosFormulario, rt_ins: e.target.checked })}
                     />
                     <label>RT INS</label>
                  </div>
                  <div className="mb-3">
                     <Switch
                        checked={datosFormulario.caja_costarricense_seguro_social}
                        onChange={(e) => setDatosFormulario({ ...datosFormulario, caja_costarricense_seguro_social: e.target.checked })}
                     />
                     <label>Caja Costarricense de Seguro Social</label>
                  </div>
               </div>
            </div>

            <button
               onClick={manejarEnvioFormulario}
               className="btn btn-dark mb-4"
            >
               Editar Registro
            </button>
         </div>
      </TarjetaRow>
   );
};

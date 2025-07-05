import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useMemo, useRef, useState, useEffect } from "react";
import { Switch } from "@mui/material";
import Swal from "sweetalert2";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";
import { Empleado_Crear_Thunks } from "../../../../store/Empleado/Empleado_Crear_Thunks";
import { usePermiso } from "../../../../hooks/usePermisos";

// Función para inicializar el estado del formulario
const inicializarEstadoFormulario = () => ({
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
   ministerio_hacienda: false,
   rt_ins: false,
   caja_costarricense_seguro_social: false,
   asegurado_empleado: "0",
});

// Función para validar campos vacíos
const validarCamposVacios = (campos) => {
   const camposExcluidos = ["cuentas_bancarias", "id_empleado", "fecha_salida_empleado"];
   return Object.entries(campos).filter(
      ([key, value]) => !camposExcluidos.includes(key) && (value === "" || value === "default"),
   );
};

// Función para validar el formato del correo electrónico
const validarCorreoElectronico = (correo) => {
   const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return regexCorreo.test(correo);
};

// Función para manejar el cambio de estado del formulario
const manejarCambioFormulario = (e, setFormData, formData) => {
   const { name, value } = e.target;
   setFormData({ ...formData, [name]: value });
};

// Función para manejar el envío del formulario
const manejarEnvioFormulario = async (
   e,
   formData,
   setError,
   setMessage,
   dispatch,
   navigate,
   setFormData,
   cuentasBancarias,
   setSubmitted,
) => {
   e.preventDefault();
   setSubmitted(true);
   const camposVacios = validarCamposVacios(formData);
   if (camposVacios.length > 0) {
      setError(true);
      setMessage("Todos los campos deben estar llenos.");
      Swal.fire({
         title: "Error",
         text: "Todos los campos deben estar llenos. el campo de fecha de salida del empleado es opcional.",
         icon: "error",
         confirmButtonText: "Aceptar",
      });
      return;
   }
   if (!validarCorreoElectronico(formData.correo_empleado)) {
      setError(true);
      setMessage("Por favor, ingrese un correo electrónico válido.");
      return;
   }
   setError(false);
   setMessage("");
   Swal.fire({
      title: "¿Está seguro?",
      text: "Confirma que desea crear un nuevo empleado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, crear",
      cancelButtonText: "Cancelar",
   }).then(async (result) => {
      if (result.isConfirmed) {
         Swal.fire({
            title: "Creando empleado",
            text: "Por favor espere...",
            allowOutsideClick: false,
            didOpen: () => {
               Swal.showLoading();
            },
         });
         const respuesta = await dispatch(
            Empleado_Crear_Thunks({ ...formData, cuentas_bancarias: cuentasBancarias }),
         );
         if (respuesta.success) {
            Swal.fire("¡Creado!", "El empleado ha sido creado exitosamente.", "success").then(
               () => {
                  navigate("/empleados/lista");
                  setFormData(inicializarEstadoFormulario());
               },
            );
         } else {
            setError(true);
            setMessage(respuesta.message);
            Swal.fire({
               title: "Error",
               text: respuesta.message || "Ocurrió un error inesperado.",
               icon: "error",
               confirmButtonText: "Aceptar",
            });
         }
      }
   });
};

// Función para obtener el estilo de entrada
const obtenerEstiloEntrada = (campo, formData, submitted) => {
   if (submitted && formData[campo] === "" && campo !== "fecha_salida_empleado") {
      return { border: "1px solid red" };
   }
   if (campo === "correo_empleado" && submitted) {
      if (!validarCorreoElectronico(formData.correo_empleado)) {
         return { border: "1px solid red" };
      }
   }
   return { border: "1px solid #ced4da" };
};

// Función para manejar el cambio de cuentas bancarias
const manejarCambioCuenta = (index, value, cuentasBancarias, setCuentasBancarias) => {
   const nuevasCuentas = [...cuentasBancarias];
   nuevasCuentas[index] = value;
   setCuentasBancarias(nuevasCuentas);
};

// Función para agregar una nueva cuenta bancaria
const agregarCuentaBancaria = (cuentasBancarias, setCuentasBancarias) => {
   setCuentasBancarias([...cuentasBancarias, ""]);
};

// Función para eliminar una cuenta bancaria
const eliminarCuentaBancaria = (index, cuentasBancarias, setCuentasBancarias) => {
   const nuevasCuentas = cuentasBancarias.filter((_, i) => i !== index);
   setCuentasBancarias(nuevasCuentas);
};

export const CrearEmpleado = () => {
   const tienePermiso = usePermiso(3);
   if (!tienePermiso) {
      return (
         <TarjetaRow
            texto="Crear Empleado"
            subtitulo="No tienes permiso para ver esta sección."
         >
            <div
               className="alert alert-danger"
               role="alert"
            >
               No tiene permiso para crear empleados del sistema. Por favor, contacta al
               administrador del sistema para solicitar acceso.
            </div>
         </TarjetaRow>
      );
   }

   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");
   const [submitted, setSubmitted] = useState(false);
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const [formData, setFormData] = useState(inicializarEstadoFormulario());
   const [cuentasBancarias, setCuentasBancarias] = useState([""]);
   const [departamentos, setDepartamentos] = useState([]);
   const [nacionalidades, setNacionalidades] = useState([]);
   const [empresas, setEmpresas] = useState([]);
   const [puestos, setPuestos] = useState([]);
   const [tiposContrato, setTiposContrato] = useState([]);
   const [supervisores, setSupervisores] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchSelectOptions = async () => {
         setLoading(true);
         const departamentosData = await dispatch(SelectOpcion_Thunks("departamentos/select"));
         const nacionalidadesData = await dispatch(SelectOpcion_Thunks("nacionalidades/select"));
         const empresasData = await dispatch(SelectOpcion_Thunks("empresas/select"));
         const puestosData = await dispatch(SelectOpcion_Thunks("puestos/select"));
         const tiposContratoData = await dispatch(SelectOpcion_Thunks("tipos_contrato/select"));
         const supervisoresData = await dispatch(SelectOpcion_Thunks("supervisores/select"));
         if (departamentosData.success) setDepartamentos(departamentosData.data.array || []);
         if (nacionalidadesData.success) setNacionalidades(nacionalidadesData.data.array || []);
         if (empresasData.success) setEmpresas(empresasData.data.array.filter(empresa => empresa.id_empresa === 13)); 
         if (puestosData.success) setPuestos(puestosData.data.array || []);
         if (tiposContratoData.success) setTiposContrato(tiposContratoData.data.array || []);
         if (supervisoresData.success) setSupervisores(supervisoresData.data.array || []);

         setLoading(false);
      };

      fetchSelectOptions();
   }, [dispatch]);

   return (
      <TarjetaRow
         texto="Crear un nuevo empleado para la empresa Natural"
         subtitulo="Vista esta pagina para crear un nuevo empleado para la empresa Natural"
      >
         {error && (
            <ErrorMessage
               error={error}
               message={message}
            />
         )}

         <div className="card-body">
            <div className="row">
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
                        style={obtenerEstiloEntrada("nombre_empleado", formData, submitted)}
                        className="form-control"
                        id="nombre_empleado"
                        name="nombre_empleado"
                        value={formData.nombre_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada("apellidos_empleado", formData, submitted)}
                        className="form-control"
                        id="apellidos_empleado"
                        name="apellidos_empleado"
                        value={formData.apellidos_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada("correo_empleado", formData, submitted)}
                        className="form-control"
                        id="correo_empleado"
                        name="correo_empleado"
                        value={formData.correo_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada("telefono_empleado", formData, submitted)}
                        className="form-control"
                        id="telefono_empleado"
                        name="telefono_empleado"
                        value={formData.telefono_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada("direccion_empleado", formData, submitted)}
                        className="form-control"
                        id="direccion_empleado"
                        name="direccion_empleado"
                        value={formData.direccion_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada("id_nacionalidad", formData, submitted)}
                        className="form-control"
                        id="id_nacionalidad"
                        name="id_nacionalidad"
                        value={formData.id_nacionalidad}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
                     >
                        <option value="">Seleccione una opción</option>
                        {loading ? (
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
                        style={obtenerEstiloEntrada("cedula_empleado", formData, submitted)}
                        className="form-control"
                        id="cedula_empleado"
                        name="cedula_empleado"
                        value={formData.cedula_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada(
                           "fecha_vencimiento_cedula_empleado",
                           formData,
                           submitted,
                        )}
                        className="form-control"
                        id="fecha_vencimiento_cedula_empleado"
                        name="fecha_vencimiento_cedula_empleado"
                        value={formData.fecha_vencimiento_cedula_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada(
                           "fecha_nacimiento_empleado",
                           formData,
                           submitted,
                        )}
                        className="form-control"
                        id="fecha_nacimiento_empleado"
                        name="fecha_nacimiento_empleado"
                        value={formData.fecha_nacimiento_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada("estado_civil_empleado", formData, submitted)}
                        className="form-control"
                        id="estado_civil_empleado"
                        name="estado_civil_empleado"
                        value={formData.estado_civil_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada("horario_empleado", formData, submitted)}
                        className="form-control"
                        id="horario_empleado"
                        name="horario_empleado"
                        value={formData.horario_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada("salario_empleado", formData, submitted)}
                        className="form-control"
                        id="salario_empleado"
                        name="salario_empleado"
                        value={formData.salario_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada("id_tipo_contrato", formData, submitted)}
                        className="form-control"
                        id="id_tipo_contrato"
                        name="id_tipo_contrato"
                        value={formData.id_tipo_contrato}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
                     >
                        <option value="">Seleccione una opción</option>
                        {loading ? (
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
                        style={obtenerEstiloEntrada("id_departamento", formData, submitted)}
                        className="form-control"
                        id="id_departamento"
                        name="id_departamento"
                        value={formData.id_departamento}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
                     >
                        <option value="">Seleccione una opción</option>
                        {loading ? (
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
                        style={obtenerEstiloEntrada("id_puesto", formData, submitted)}
                        className="form-control"
                        id="id_puesto"
                        name="id_puesto"
                        value={formData.id_puesto}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
                     >
                        <option value="">Seleccione una opción</option>
                        {loading ? (
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
                        style={obtenerEstiloEntrada("id_supervisor", formData, submitted)}
                        className="form-control"
                        id="id_supervisor"
                        name="id_supervisor"
                        value={formData.id_supervisor}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
                     >
                        <option value="">Seleccione una opción</option>
                        {loading ? (
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
                        style={obtenerEstiloEntrada("id_empresa", formData, submitted)}
                        className="form-control"
                        id="id_empresa"
                        name="id_empresa"
                        value={formData.id_empresa}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
                     >
                        <option value="">Seleccione una opción</option>
                        {loading ? (
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
                        style={obtenerEstiloEntrada("fecha_ingreso_empleado", formData, submitted)}
                        className="form-control"
                        id="fecha_ingreso_empleado"
                        name="fecha_ingreso_empleado"
                        value={formData.fecha_ingreso_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada("fecha_salida_empleado", formData, submitted)}
                        className="form-control"
                        id="fecha_salida_empleado"
                        name="fecha_salida_empleado"
                        value={formData.fecha_salida_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
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
                        style={obtenerEstiloEntrada(
                           "jornada_laboral_empleado",
                           formData,
                           submitted,
                        )}
                        className="form-control"
                        id="jornada_laboral_empleado"
                        name="jornada_laboral_empleado"
                        value={formData.jornada_laboral_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
                        placeholder="Enter work schedule"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="asegurado_empleado"
                     >
                        Número asegurado empleado
                     </label>
                     <input
                        type="text"
                        style={obtenerEstiloEntrada("asegurado_empleado", formData, submitted)}
                        className="form-control"
                        id="asegurado_empleado"
                        name="asegurado_empleado"
                        value={formData.asegurado_empleado}
                        onChange={(e) => manejarCambioFormulario(e, setFormData, formData)}
                        placeholder="Ingrese el número de asegurado"
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
                              onChange={(e) =>
                                 manejarCambioCuenta(
                                    index,
                                    e.target.value,
                                    cuentasBancarias,
                                    setCuentasBancarias,
                                 )
                              }
                              placeholder="Enter bank account"
                           />
                           <button
                              type="button"
                              className="btn btn-danger ms-2"
                              onClick={() =>
                                 eliminarCuentaBancaria(
                                    index,
                                    cuentasBancarias,
                                    setCuentasBancarias,
                                 )
                              }
                           >
                              -
                           </button>
                        </div>
                     ))}
                     <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => agregarCuentaBancaria(cuentasBancarias, setCuentasBancarias)}
                     >
                        +
                     </button>
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <Switch
                        checked={formData.ministerio_hacienda}
                        onChange={(e) =>
                           setFormData({ ...formData, ministerio_hacienda: e.target.checked })
                        }
                     />
                     <label>Ministerio de Hacienda</label>
                  </div>
                  <div className="mb-3">
                     <Switch
                        checked={formData.rt_ins}
                        onChange={(e) => setFormData({ ...formData, rt_ins: e.target.checked })}
                     />
                     <label>RT INS</label>
                  </div>
                  <div className="mb-3">
                     <Switch
                        checked={formData.caja_costarricense_seguro_social}
                        onChange={(e) =>
                           setFormData({
                              ...formData,
                              caja_costarricense_seguro_social: e.target.checked,
                           })
                        }
                     />
                     <label>Caja Costarricense de Seguro Social</label>
                  </div>
               </div>
            </div>

            <button
               onClick={(e) =>
                  manejarEnvioFormulario(
                     e,
                     formData,
                     setError,
                     setMessage,
                     dispatch,
                     navigate,
                     setFormData,
                     cuentasBancarias,
                     setSubmitted,
                  )
               }
               className="btn btn-dark mb-4"
            >
               Crear Registro
            </button>
         </div>
      </TarjetaRow>
   );
};

/**
 * Inicializa el estado del formulario con valores predeterminados.
 * @returns {Object} Estado inicial del formulario.
 */

/**
 * Valida si hay campos vacíos en el formulario.
 * @param {Object} campos - Campos del formulario a validar.
 * @returns {Array} Lista de campos vacíos.
 */

/**
 * Valida el formato del correo electrónico.
 * @param {string} correo - Correo electrónico a validar.
 * @returns {boolean} True si el correo es válido, false de lo contrario.
 */

/**
 * Maneja el cambio de estado del formulario.
 * @param {Event} e - Evento de cambio.
 * @param {Function} setFormData - Función para actualizar el estado del formulario.
 * @param {Object} formData - Estado actual del formulario.
 */

/**
 * Maneja el envío del formulario.
 * @param {Event} e - Evento de envío.
 * @param {Object} formData - Datos del formulario.
 * @param {Function} setError - Función para establecer el estado de error.
 * @param {Function} setMessage - Función para establecer el mensaje de error.
 * @param {Function} dispatch - Función para despachar acciones de Redux.
 * @param {Function} navigate - Función para navegar a otra ruta.
 * @param {Function} setFormData - Función para actualizar el estado del formulario.
 * @param {Array} cuentasBancarias - Lista de cuentas bancarias.
 */

/**
 * Obtiene el estilo de entrada para un campo del formulario.
 * @param {string} campo - Nombre del campo.
 * @param {Object} formData - Datos del formulario.
 * @param {boolean} submitted - Indica si el formulario ha sido enviado.
 * @returns {Object} Estilo CSS para el campo.
 */

/**
 * Maneja el cambio de valor de una cuenta bancaria.
 * @param {number} index - Índice de la cuenta bancaria.
 * @param {string} value - Nuevo valor de la cuenta bancaria.
 * @param {Array} cuentasBancarias - Lista de cuentas bancarias.
 * @param {Function} setCuentasBancarias - Función para actualizar la lista de cuentas bancarias.
 */

/**
 * Agrega una nueva cuenta bancaria a la lista.
 * @param {Array} cuentasBancarias - Lista de cuentas bancarias.
 * @param {Function} setCuentasBancarias - Función para actualizar la lista de cuentas bancarias.
 */

/**
 * Elimina una cuenta bancaria de la lista.
 * @param {number} index - Índice de la cuenta bancaria a eliminar.
 * @param {Array} cuentasBancarias - Lista de cuentas bancarias.
 * @param {Function} setCuentasBancarias - Función para actualizar la lista de cuentas bancarias.
 */

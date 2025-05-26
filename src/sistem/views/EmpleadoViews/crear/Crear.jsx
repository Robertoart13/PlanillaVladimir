import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useMemo, useRef, useState, useEffect } from "react";
import { Switch } from "@mui/material";
import Swal from "sweetalert2";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";
import { Empleado_Crear_Thunks } from "../../../../store/Empleado/Empleado_Crear_Thunks";

export const CrearEmpleado = () => {
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");
   const [submitted, setSubmitted] = useState(false); // Nuevo estado
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const [formData, setFormData] = useState({
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
   });
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
         if (empresasData.success) setEmpresas(empresasData.data.array || []);
         if (puestosData.success) setPuestos(puestosData.data.array || []);
         if (tiposContratoData.success) setTiposContrato(tiposContratoData.data.array || []);
         if (supervisoresData.success) setSupervisores(supervisoresData.data.array || []);

         setLoading(false);
      };

      fetchSelectOptions();
   }, [dispatch]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      setSubmitted(true);

      // Exclude cuentas_bancarias, id_empleado, and fecha_salida_empleado from empty field validation
      const fieldsToValidate = { ...formData };
      delete fieldsToValidate.cuentas_bancarias;
      delete fieldsToValidate.id_empleado;
      delete fieldsToValidate.fecha_salida_empleado;
      const emptyFields = Object.entries(fieldsToValidate).filter(([key, value]) => value === "" || value === "default");
      if (emptyFields.length > 0) {
         setError(true);
         setMessage("Todos los campos deben estar llenos.");
         return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo_empleado)) {
         setError(true);
         setMessage("Por favor, ingrese un correo electrónico válido.");
         return;
      }
      // Limpiar mensajes de error si todo es válido
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
            const respuesta = await dispatch(Empleado_Crear_Thunks({ ...formData, cuentas_bancarias: cuentasBancarias }));
            if (respuesta.success) {
               Swal.fire("¡Creado!", "El empleado ha sido creado exitosamente.", "success").then(
                  () => {
                     navigate("/empleados/lista");

                     setFormData({
                        nombre_empleado: "",
                        apellidos_empleado: "",
                        cedula_empleado: "",
                        fecha_vencimiento_cedula_empleado: "",
                        fecha_nacimiento_empleado: "",
                        estado_civil_empleado: "soltero",
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
                     });
                  },
               );
            } else {
               setError(true);
               setMessage(respuesta.message);
               Swal.fire({
                  title: "Error",
                  text: respuesta.message || "Ocurrió un error inesperado.",
                  icon: "error",
                  confirmButtonText: "Aceptar"
                });
            }
         }
      });
   };

   const getInputStyle = (field) => {
      if (submitted && formData[field] === "" && field !== "fecha_salida_empleado") {
         return { border: "1px solid red" };
      }
      if (field === "correo_empleado" && submitted) {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(formData.correo_empleado)) {
            return { border: "1px solid red" };
         }
      }
      return { border: "1px solid #ced4da" };
   };

   const handleAddCuenta = () => {
      setCuentasBancarias([...cuentasBancarias, ""]);
   };

   const handleRemoveCuenta = (index) => {
      const newCuentas = cuentasBancarias.filter((_, i) => i !== index);
      setCuentasBancarias(newCuentas);
   };

   const handleCuentaChange = (index, value) => {
      const newCuentas = [...cuentasBancarias];
      newCuentas[index] = value;
      setCuentasBancarias(newCuentas);
   };

   return (
      <TarjetaRow
         texto="Crear un nuevo empleado"
         subtitulo="Vista esta pagina para crear un nuevo empleado"
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
                        style={getInputStyle("nombre_empleado")}
                        className="form-control"
                        id="nombre_empleado"
                        name="nombre_empleado"
                        value={formData.nombre_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("apellidos_empleado")}
                        className="form-control"
                        id="apellidos_empleado"
                        name="apellidos_empleado"
                        value={formData.apellidos_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("correo_empleado")}
                        className="form-control"
                        id="correo_empleado"
                        name="correo_empleado"
                        value={formData.correo_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("telefono_empleado")}
                        className="form-control"
                        id="telefono_empleado"
                        name="telefono_empleado"
                        value={formData.telefono_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("direccion_empleado")}
                        className="form-control"
                        id="direccion_empleado"
                        name="direccion_empleado"
                        value={formData.direccion_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("id_nacionalidad")}
                        className="form-control"
                        id="id_nacionalidad"
                        name="id_nacionalidad"
                        value={formData.id_nacionalidad}
                        onChange={handleChange}
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
                        style={getInputStyle("cedula_empleado")}
                        className="form-control"
                        id="cedula_empleado"
                        name="cedula_empleado"
                        value={formData.cedula_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("fecha_vencimiento_cedula_empleado")}
                        className="form-control"
                        id="fecha_vencimiento_cedula_empleado"
                        name="fecha_vencimiento_cedula_empleado"
                        value={formData.fecha_vencimiento_cedula_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("fecha_nacimiento_empleado")}
                        className="form-control"
                        id="fecha_nacimiento_empleado"
                        name="fecha_nacimiento_empleado"
                        value={formData.fecha_nacimiento_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("estado_civil_empleado")}
                        className="form-control"
                        id="estado_civil_empleado"
                        name="estado_civil_empleado"
                        value={formData.estado_civil_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("horario_empleado")}
                        className="form-control"
                        id="horario_empleado"
                        name="horario_empleado"
                        value={formData.horario_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("salario_empleado")}
                        className="form-control"
                        id="salario_empleado"
                        name="salario_empleado"
                        value={formData.salario_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("id_tipo_contrato")}
                        className="form-control"
                        id="id_tipo_contrato"
                        name="id_tipo_contrato"
                        value={formData.id_tipo_contrato}
                        onChange={handleChange}
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
                        style={getInputStyle("id_departamento")}
                        className="form-control"
                        id="id_departamento"
                        name="id_departamento"
                        value={formData.id_departamento}
                        onChange={handleChange}
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
                        style={getInputStyle("id_puesto")}
                        className="form-control"
                        id="id_puesto"
                        name="id_puesto"
                        value={formData.id_puesto}
                        onChange={handleChange}
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
                        style={getInputStyle("id_supervisor")}
                        className="form-control"
                        id="id_supervisor"
                        name="id_supervisor"
                        value={formData.id_supervisor}
                        onChange={handleChange}
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
                        style={getInputStyle("id_empresa")}
                        className="form-control"
                        id="id_empresa"
                        name="id_empresa"
                        value={formData.id_empresa}
                        onChange={handleChange}
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
                        style={getInputStyle("fecha_ingreso_empleado")}
                        className="form-control"
                        id="fecha_ingreso_empleado"
                        name="fecha_ingreso_empleado"
                        value={formData.fecha_ingreso_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("fecha_salida_empleado")}
                        className="form-control"
                        id="fecha_salida_empleado"
                        name="fecha_salida_empleado"
                        value={formData.fecha_salida_empleado}
                        onChange={handleChange}
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
                        style={getInputStyle("jornada_laboral_empleado")}
                        className="form-control"
                        id="jornada_laboral_empleado"
                        name="jornada_laboral_empleado"
                        value={formData.jornada_laboral_empleado}
                        onChange={handleChange}
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
                              onChange={(e) => handleCuentaChange(index, e.target.value)}
                              placeholder="Enter bank account"
                           />
                           <button
                              type="button"
                              className="btn btn-danger ms-2"
                              onClick={() => handleRemoveCuenta(index)}
                           >
                              -
                           </button>
                        </div>
                     ))}
                     <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleAddCuenta}
                     >
                        +
                     </button>
                  </div>
               </div>
               <div className="col-md-6">
                    <div className="mb-3">
                        
                        <Switch
                            checked={formData.ministerio_hacienda}
                            onChange={(e) => setFormData({ ...formData, ministerio_hacienda: e.target.checked })}
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
                            onChange={(e) => setFormData({ ...formData, caja_costarricense_seguro_social: e.target.checked })}
                        />
                         <label>Caja Costarricense de Seguro Social</label>
                    </div>
                </div>
            </div>

            <button
               onClick={handleSubmit}
               className="btn btn-dark mb-4"
            >
               Crear Registro
            </button>
         </div>
      </TarjetaRow>
   );
};

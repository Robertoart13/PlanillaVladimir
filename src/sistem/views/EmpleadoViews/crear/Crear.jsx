import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useState } from "react";
import { Switch } from "@mui/material";

export const CrearEmpleado = () => {
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");
   const [formData, setFormData] = useState({
      nombre_completo: "",
      correo: "",
      telefono: "",
      cedula: "",
      salario_base: "",
      tipo_contrato: "",
      departamento: "",
      puesto: "",
      supervisor: "",
      id_empresa: "1", // Campo oculto
      fecha_ingreso: "",
      fecha_salida: "",
      jornada_laboral: "",
      numero_asegurado: "",
      numero_ins: "",
      numero_hacienda: "",
      cuenta_bancaria_1: "",
      cuenta_bancaria_2: "",
      vacaciones_acumuladas: "",
      aguinaldo_acumulado: "",
      cesantia_acumulada: "",
      ministerio_hacienda: false,
      rt_ins: false,
      ccss: false,
      moneda_pago: "",
      tipo_planilla: "",
   });

   return (
      <TarjetaRow
         texto="Crear un nuevo empleado"
         subtitulo="Complete la información del empleado"
      >
         {error && (
            <ErrorMessage
               error={error}
               message={message}
            />
         )}

         <div className="card-body">
            {/* Información Personal */}
            <h5 className="mb-3">Información Personal</h5>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="nombre_completo">
                        Nombre completo *
                     </label>
                     <input
                        type="text"
                        className="form-control"
                        id="nombre_completo"
                        name="nombre_completo"
                        value={formData.nombre_completo}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="Ingrese el nombre completo"
                        required
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="correo">
                        Correo electrónico *
                     </label>
                     <input
                        type="email"
                        className="form-control"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="ejemplo@correo.com"
                        required
                     />
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="telefono">
                        Teléfono *
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="88888888"
                        required
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="cedula">
                        Cédula *
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="cedula"
                        name="cedula"
                        value={formData.cedula}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="123456789"
                        required
                     />
                  </div>
               </div>
            </div>

            {/* Información Laboral */}
            <h5 className="mb-3 mt-4">Información Laboral</h5>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="salario_base">
                        Salario base *
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="salario_base"
                        name="salario_base"
                        value={formData.salario_base}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="500000"
                        required
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="tipo_contrato">
                        Tipo de contrato *
                     </label>
                     <select
                        className="form-control"
                        id="tipo_contrato"
                        name="tipo_contrato"
                        value={formData.tipo_contrato}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        required
                     >
                        <option value="">Seleccione una opción</option>
                        <option value="indefinido">Indefinido</option>
                        <option value="plazo_fijo">Plazo fijo</option>
                        <option value="por_servicios_profesionales">Por servicios profesionales</option>
                     </select>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="departamento">
                        Departamento *
                     </label>
                     <select
                        className="form-control"
                        id="departamento"
                        name="departamento"
                        value={formData.departamento}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        required
                     >
                        <option value="">Seleccione una opción</option>
                        <option value="administracion">Administración</option>
                        <option value="contabilidad">Contabilidad</option>
                        <option value="operaciones">Operaciones</option>
                     </select>
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="puesto">
                        Puesto *
                     </label>
                     <select
                        className="form-control"
                        id="puesto"
                        name="puesto"
                        value={formData.puesto}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        required
                     >
                        <option value="">Seleccione una opción</option>
                        <option value="administrador">Administrador</option>
                        <option value="contador">Contador</option>
                        <option value="bodeguero">Bodeguero</option>
                     </select>
                  </div>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="supervisor">
                        Supervisor *
                     </label>
                     <select
                        className="form-control"
                        id="supervisor"
                        name="supervisor"
                        value={formData.supervisor}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        required
                     >
                        <option value="">Seleccione una opción</option>
                        <option value="empleado_1">Empleado 1</option>
                        <option value="empleado_2">Empleado 2</option>
                        <option value="empleado_3">Empleado 3</option>
                     </select>
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="jornada_laboral">
                        Jornada laboral *
                     </label>
                     <select
                        className="form-control"
                        id="jornada_laboral"
                        name="jornada_laboral"
                        value={formData.jornada_laboral}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        required
                     >
                        <option value="">Seleccione una opción</option>
                        <option value="tiempo_completo">Tiempo completo</option>
                        <option value="medio_tiempo">Medio tiempo</option>
                        <option value="por_horas">Por horas</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* Fechas */}
            <h5 className="mb-3 mt-4">Fechas</h5>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="fecha_ingreso">
                        Fecha de ingreso *
                     </label>
                     <input
                        type="date"
                        className="form-control"
                        id="fecha_ingreso"
                        name="fecha_ingreso"
                        value={formData.fecha_ingreso}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        required
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="fecha_salida">
                        Fecha de salida
                     </label>
                     <input
                        type="date"
                        className="form-control"
                        id="fecha_salida"
                        name="fecha_salida"
                        value={formData.fecha_salida}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                     />
                  </div>
               </div>
            </div>

            {/* Números de identificación */}
            <h5 className="mb-3 mt-4">Números de Identificación</h5>
            <div className="row">
               <div className="col-md-4">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="numero_asegurado">
                        Número de asegurado *
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="numero_asegurado"
                        name="numero_asegurado"
                        value={formData.numero_asegurado}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="123456789"
                        required
                     />
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="numero_ins">
                        Número de INS *
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="numero_ins"
                        name="numero_ins"
                        value={formData.numero_ins}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="123456789"
                        required
                     />
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="numero_hacienda">
                        Número de hacienda *
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="numero_hacienda"
                        name="numero_hacienda"
                        value={formData.numero_hacienda}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="123456789"
                        required
                     />
                  </div>
               </div>
            </div>

            {/* Cuentas bancarias */}
            <h5 className="mb-3 mt-4">Cuentas Bancarias</h5>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="cuenta_bancaria_1">
                        Cuenta bancaria 1
                     </label>
                     <input
                        type="text"
                        className="form-control"
                        id="cuenta_bancaria_1"
                        name="cuenta_bancaria_1"
                        value={formData.cuenta_bancaria_1}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="CR12345678901234567890"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="cuenta_bancaria_2">
                        Cuenta bancaria 2
                     </label>
                     <input
                        type="text"
                        className="form-control"
                        id="cuenta_bancaria_2"
                        name="cuenta_bancaria_2"
                        value={formData.cuenta_bancaria_2}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="CR12345678901234567890"
                     />
                  </div>
               </div>
            </div>

            {/* Acumulados */}
            <h5 className="mb-3 mt-4">Acumulados a la fecha de ingreso</h5>
            <div className="row">
               <div className="col-md-4">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="vacaciones_acumuladas">
                        Vacaciones acumuladas
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="vacaciones_acumuladas"
                        name="vacaciones_acumuladas"
                        value={formData.vacaciones_acumuladas}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="0"
                     />
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="aguinaldo_acumulado">
                        Aguinaldo acumulado
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="aguinaldo_acumulado"
                        name="aguinaldo_acumulado"
                        value={formData.aguinaldo_acumulado}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="0"
                     />
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="cesantia_acumulada">
                        Cesantía acumulada
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="cesantia_acumulada"
                        name="cesantia_acumulada"
                        value={formData.cesantia_acumulada}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        placeholder="0"
                     />
                  </div>
               </div>
            </div>

            {/* Configuración de pago */}
            <h5 className="mb-3 mt-4">Configuración de Pago</h5>
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="moneda_pago">
                        Moneda de pago *
                     </label>
                     <select
                        className="form-control"
                        id="moneda_pago"
                        name="moneda_pago"
                        value={formData.moneda_pago}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        required
                     >
                        <option value="">Seleccione una opción</option>
                        <option value="colones">Colones</option>
                        <option value="dolares">Dólares</option>
                        <option value="colones_y_dolares">Colones y dólares</option>
                     </select>
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label" htmlFor="tipo_planilla">
                        Tipo de planilla *
                     </label>
                     <select
                        className="form-control"
                        id="tipo_planilla"
                        name="tipo_planilla"
                        value={formData.tipo_planilla}
                        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                        required
                     >
                        <option value="">Seleccione una opción</option>
                        <option value="quincenal">Quincenal</option>
                        <option value="bisemanal">Bisemanal</option>
                        <option value="semanal">Semanal</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* Checks de instituciones */}
            <h5 className="mb-3 mt-4">Instituciones</h5>
            <div className="row">
               <div className="col-md-4">
                  <div className="mb-3">
                     <Switch
                        checked={formData.ministerio_hacienda}
                        onChange={(e) =>
                           setFormData({ ...formData, ministerio_hacienda: e.target.checked })
                        }
                     />
                     <label className="ms-2">Ministerio de Hacienda</label>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="mb-3">
                     <Switch
                        checked={formData.rt_ins}
                        onChange={(e) => setFormData({ ...formData, rt_ins: e.target.checked })}
                     />
                     <label className="ms-2">RT INS</label>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="mb-3">
                     <Switch
                        checked={formData.ccss}
                        onChange={(e) => setFormData({ ...formData, ccss: e.target.checked })}
                     />
                     <label className="ms-2">CCSS</label>
                  </div>
               </div>
            </div>

            <button
               onClick={() => {
                  console.log("Form submitted", formData);
               }}
               className="btn btn-dark mb-4"
            >
               Crear Empleado
            </button>
         </div>
      </TarjetaRow>
   );
};
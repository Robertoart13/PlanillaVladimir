import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Planilla_Editar_Thunks } from "../../../../store/Planilla/Planilla_Editar_Thunks";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";// Asegúrate de importar el thunk

// Opciones para los enums
const tiposPlanilla = ["Mensual", "Quincenal", "Semanal", "Otro"];
const estadosPlanilla = [
  "En Proceso",
  "Activa",
  "Cancelada",

];

// Abreviaturas para tipos de planilla
const abreviaturasTipo = {
  Mensual: "Mens",
  Quincenal: "Quin",
  Semanal: "Sema",
  Otro: "Otr"
};

// Función para extraer el identificador único del consecutivo
function extraerIdentificador(planilla_codigo) {
  // Ejemplo: PL-NAT-Mens-20250531-G6U6ID
  if (!planilla_codigo) return "";
  const partes = planilla_codigo.split("-");
  return partes[4] || "";
}

// Función para generar consecutivo tipo PL-BT4212
function generarConsecutivo(empresaNombre = "", planilla_tipo = "", fechaInicio = "", identificador = "") {
  // Abreviatura de empresa (primera palabra, 3 letras)
  let empresaAbrev = "";
  if (empresaNombre) {
    empresaAbrev = empresaNombre.split(" ")[0].toUpperCase().slice(0, 3);
  }

  // Abreviatura de tipo de planilla
  const tipoAbrev = abreviaturasTipo[planilla_tipo] || "";

  // Fecha en formato YYYYMMDD
  let fechaFormateada = "";
  if (fechaInicio) {
    fechaFormateada = fechaInicio.replace(/-/g, "");
  }

  // Identificador único (contador o aleatorio)
  const idFinal = identificador
    ? identificador
    : Math.random().toString(36).substr(2, 6).toUpperCase();

  // Construcción del consecutivo
  return `PL-${empresaAbrev}-${tipoAbrev}-${fechaFormateada}-${idFinal}`;
}

export const EditarPlanilla = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Cargar planilla seleccionada de localStorage
  const selectedPlanilla = JSON.parse(localStorage.getItem("selectedPlanilla") || "{}");
  const [identificador, setIdentificador] = useState(extraerIdentificador(selectedPlanilla.planilla_codigo));

  // Estados que no permiten edición
  const estadosNoEditables = ["Procesada", "Cancelada", "Cerrada"];
  const planillaNoEditable = estadosNoEditables.includes(selectedPlanilla.planilla_estado);

  const [formData, setFormData] = useState({
    planilla_id: selectedPlanilla.planilla_id || "",
    planilla_codigo: selectedPlanilla.planilla_codigo || "",
    planilla_codigo_viejo: selectedPlanilla.planilla_codigo || "",
    empresa_id: user?.id_empresa || "",
    planilla_tipo: selectedPlanilla.planilla_tipo || "",
    planilla_descripcion: selectedPlanilla.planilla_descripcion || "--",
    planilla_estado: selectedPlanilla.planilla_estado || "En Proceso",
    planilla_fecha_inicio: selectedPlanilla.planilla_fecha_inicio ? selectedPlanilla.planilla_fecha_inicio.slice(0, 10) : "",
    planilla_fecha_fin: selectedPlanilla.planilla_fecha_fin ? selectedPlanilla.planilla_fecha_fin.slice(0, 10) : "",
    planilla_creado_por: selectedPlanilla.planilla_creado_por || "",
  });

  const [fechaInvalida, setFechaInvalida] = useState(false);
  const [touched, setTouched] = useState({});
  const [errores, setErrores] = useState({});

  // Generar consecutivo cada vez que se monta el componente
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      planilla_codigo: generarConsecutivo(
        user?.nombre_empresa,
        prev.planilla_tipo,
        prev.planilla_fecha_inicio,
        identificador
      ),
      empresa_id: user?.id_empresa || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Actualizar consecutivo cuando cambian tipo o fecha de inicio
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      planilla_codigo: generarConsecutivo(
        user?.nombre_empresa,
        formData.planilla_tipo,
        formData.planilla_fecha_inicio,
        identificador
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.planilla_tipo, formData.planilla_fecha_inicio, user?.nombre_empresa]);

  // Validar fechas cada vez que cambian
  useEffect(() => {
    if (
      formData.planilla_fecha_inicio &&
      formData.planilla_fecha_fin &&
      formData.planilla_fecha_fin < formData.planilla_fecha_inicio
    ) {
      setFechaInvalida(true);
    } else {
      setFechaInvalida(false);
    }
  }, [formData.planilla_fecha_inicio, formData.planilla_fecha_fin]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    setErrores((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const validarCampos = () => {
    const nuevosErrores = {};
    if (!formData.planilla_tipo) nuevosErrores.planilla_tipo = true;
    if (!formData.planilla_estado) nuevosErrores.planilla_estado = true;
    if (!formData.planilla_fecha_inicio) nuevosErrores.planilla_fecha_inicio = true;
    if (!formData.planilla_fecha_fin) nuevosErrores.planilla_fecha_fin = true;
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar si la planilla se puede editar
    if (planillaNoEditable) {
      Swal.fire({
        title: "No se puede editar",
        text: `No se puede editar una planilla con estado "${selectedPlanilla.planilla_estado}".`,
        icon: "warning",
        confirmButtonText: "Entendido"
      });
      return;
    }

    setTouched({
      planilla_tipo: true,
      planilla_estado: true,
      planilla_fecha_inicio: true,
      planilla_fecha_fin: true,
    });
    if (!validarCampos() || fechaInvalida) return;

    const result = await Swal.fire({
      title: "¿Está seguro de editar la planilla?",
      text: "Esta acción editará la planilla con los datos ingresados.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, editar",
      cancelButtonText: "Cancelar",
    })  

    if (result.isConfirmed) {
      Swal.fire({
        title: "Editando planilla",
        text: "Por favor espere...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      // Aquí se envía TODO el formData
      const respuesta = await dispatch(Planilla_Editar_Thunks(formData));
      if (respuesta.success) {
        Swal.fire("¡Editado!", "La planilla ha sido editada exitosamente.", "success").then(() => {
          navigate("/planilla/lista");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: respuesta.message || "Ocurrió un error inesperado.",
          icon: "error",
          confirmButtonText: "Aceptar"
        });
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>Editar Planilla</h5>
        <p className="text-muted">
          Modifique los datos de la planilla seleccionada.
        </p>
      </div>
      <div className="card-header">
        <h5>Consecutivo: {formData.planilla_codigo}</h5>
        <p className="text-muted">
          Empresa: {user?.nombre_empresa || "No disponible"}
        </p>
        {planillaNoEditable && (
          <div className="alert alert-warning mt-2 mb-0">
            <strong>No editable:</strong> Esta planilla no se puede editar porque tiene el estado "{selectedPlanilla.planilla_estado}".
          </div>
        )}
      </div>
      <div className="card-body">

        <div className="row">
          {/* Consecutivo */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="planilla_codigo">
              Consecutivo
            </label>
            <input
              type="text"
              className="form-control"
              id="planilla_codigo"
              name="planilla_codigo"
              value={formData.planilla_codigo}
              readOnly
            />
          </div>

          {/* Tipo de Planilla */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="planilla_tipo">
              Tipo de Planilla
            </label>
            <select
              className={`form-select${errores.planilla_tipo && touched.planilla_tipo ? " is-invalid" : ""}`}
              id="planilla_tipo"
              name="planilla_tipo"
              value={formData.planilla_tipo}
              onChange={handleChange}
              disabled={planillaNoEditable}
              required
            >
              <option value="">Seleccione tipo</option>
              {tiposPlanilla.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="planilla_estado">
              Estado
            </label>
            <select
              className={`form-select${errores.planilla_estado && touched.planilla_estado ? " is-invalid" : ""}`}
              id="planilla_estado"
              name="planilla_estado"
              value={formData.planilla_estado}
              onChange={handleChange}
              disabled={planillaNoEditable}
              required
            >
              {estadosPlanilla.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Inicio */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="planilla_fecha_inicio">
              Fecha de Inicio
            </label>
            <input
              type="date"
              className={`form-control${errores.planilla_fecha_inicio && touched.planilla_fecha_inicio ? " is-invalid" : ""}`}
              id="planilla_fecha_inicio"
              name="planilla_fecha_inicio"
              value={formData.planilla_fecha_inicio}
              onChange={handleChange}
              disabled={planillaNoEditable}
              required
            />
          </div>

          {/* Fecha Fin */}
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="planilla_fecha_fin">
              Fecha de Fin
            </label>
            <input
              type="date"
              className={`form-control${errores.planilla_fecha_fin && touched.planilla_fecha_fin ? " is-invalid" : ""}`}
              id="planilla_fecha_fin"
              name="planilla_fecha_fin"
              value={formData.planilla_fecha_fin}
              onChange={handleChange}
              disabled={planillaNoEditable}
              required
            />
            {fechaInvalida && (
              <div
                style={{
                  color: "red",
                  fontSize: "0.9em",
                  marginTop: "0.25rem",
                }}
              >
                La fecha de fin no puede ser anterior a la fecha de inicio.
              </div>
            )}
          </div>

          {/* Descripción (ocupa todo el ancho) */}
          <div className="col-md-12 mb-3">
            <label className="form-label" htmlFor="planilla_descripcion">
              Descripción
            </label>
            <textarea
              className="form-control"
              id="planilla_descripcion"
              name="planilla_descripcion"
              value={formData.planilla_descripcion}
              onChange={handleChange}
              disabled={planillaNoEditable}
              rows={3}
              placeholder="Descripción opcional de la planilla"
            ></textarea>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={planillaNoEditable}
        >
          Editar Planilla  </button>
      </div>
    </div>
  );
};

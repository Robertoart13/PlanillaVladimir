import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Planilla_Crear_Thunks } from "../../../../store/Planilla/Planilla_Crear_Thunks";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";// Asegúrate de importar el thunk

// Opciones para los enums
const tiposPlanilla = ["Mensual", "Quincenal", "Semanal", "Otro"];
const estadosPlanilla = [
  "En Proceso",
  "Activa",
  "Cerrada",
  "Cancelada",
  "Procesada",
];

// Abreviaturas para tipos de planilla
const abreviaturasTipo = {
  Mensual: "Mens",
  Quincenal: "Quin",
  Semanal: "Sema",
  Otro: "Otr"
};

// Función para generar consecutivo tipo PL-BT4212
function generarConsecutivo(empresas = [], empresa_id = "", planilla_tipo = "", fechaInicio = "", contador = "") {
  // Abreviatura de empresa (primera palabra, 3 letras)
  let empresaAbrev = "";
  if (empresa_id) {
    const empresa = empresas.find(e => String(e.empresa_id) === String(empresa_id) || String(e.id_empresa) === String(empresa_id));
    if (empresa) {
      empresaAbrev = (empresa.nombre || empresa.nombre_comercial_empresa || "").split(" ")[0].toUpperCase().slice(0, 3);
    }
  }

  // Abreviatura de tipo de planilla
  const tipoAbrev = abreviaturasTipo[planilla_tipo] || "";

  // Fecha en formato YYYYMMDD
  let fechaFormateada = "";
  if (fechaInicio) {
    fechaFormateada = fechaInicio.replace(/-/g, "");
  }

  // Identificador único (contador o aleatorio)
  const identificador = contador
    ? contador.toString().padStart(4, "0")
    : Math.random().toString(36).substr(2, 6).toUpperCase();

  // Construcción del consecutivo
  // Puedes ajustar el orden o quitar "EMP" si no es necesario
  return `PL-${empresaAbrev}-${tipoAbrev}-${fechaFormateada}-${identificador}`;
}

export const CrearPlanilla = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Estado para empresas traídas del backend
  const [empresas, setEmpresas] = useState([]);
  const [formData, setFormData] = useState({
    planilla_codigo: "",
    empresa_id: "",
    planilla_tipo: "",
    planilla_descripcion: "--",
    planilla_estado: "En Proceso",
    planilla_fecha_inicio: "",
    planilla_fecha_fin: "",
    planilla_creado_por: "",
  });

  const [fechaInvalida, setFechaInvalida] = useState(false);
  const [touched, setTouched] = useState({});
  const [errores, setErrores] = useState({});

  // Generar consecutivo cada vez que se monta el componente
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      planilla_codigo: generarConsecutivo(prev.empresa_id, prev.planilla_tipo, prev.planilla_fecha_inicio),
    }));
  }, []);

  // Actualizar consecutivo cuando cambian empresa, tipo o fecha de inicio
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      planilla_codigo: generarConsecutivo(empresas, prev.empresa_id, prev.planilla_tipo, prev.planilla_fecha_inicio),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresas]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      planilla_codigo: generarConsecutivo(empresas, formData.empresa_id, formData.planilla_tipo, formData.planilla_fecha_inicio),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.empresa_id, formData.planilla_tipo, formData.planilla_fecha_inicio, empresas]);

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

  // Obtener empresas al montar el componente
  useEffect(() => {
    const fetchEmpresas = async () => {
      const empresasData = await dispatch(SelectOpcion_Thunks("empresas/select"))
      console.log(empresasData);
      // Asegúrate de que empresasData.payload sea el array de empresas
      if (empresasData && empresasData.data) {
          // Filtrar solo la empresa con id_empresa: 13
          const empresasFiltradas = (empresasData.data.array || []).filter(emp => emp.id_empresa === 13);
          setEmpresas(empresasFiltradas);
      }
    };
    fetchEmpresas();
  }, [dispatch]);

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
    if (!formData.empresa_id) nuevosErrores.empresa_id = true;
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
    setTouched({
      empresa_id: true,
      planilla_tipo: true,
      planilla_estado: true,
      planilla_fecha_inicio: true,
      planilla_fecha_fin: true,
    });
    if (!validarCampos() || fechaInvalida) return;

    const result = await Swal.fire({
      title: "¿Está seguro de crear la planilla?",
      text: "Esta acción creará una nueva planilla con los datos ingresados.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, crear",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      // Aquí puedes enviar formData a tu backend
      Swal.fire({
        title: "Creando planilla",
        text: "Por favor espere...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const respuesta = await dispatch(Planilla_Crear_Thunks(formData));
      console.log(respuesta);
      if (respuesta.success) {
        Swal.fire("¡Creado!", "La planilla ha sido creada exitosamente.", "success").then(() => {
          navigate("/planilla/lista");
          setFormData(initializeFormData());
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

  // Refrescar consecutivo manualmente (opcional)
  const handleRefreshConsecutivo = () => {
    setFormData((prev) => ({
      ...prev,
      planilla_codigo: generarConsecutivo(empresas, formData.empresa_id, formData.planilla_tipo, formData.planilla_fecha_inicio),
    }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>Crear Planilla</h5>
        <p className="text-muted">
          Complete el formulario para crear una nueva planilla.
        </p>
      </div>
      <div className="card-header">
        <h5>Consecutivo: {formData.planilla_codigo}</h5>
      </div>
      <div className="card-body">

          <div className="row">
            {/* Consecutivo y Empresa */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="planilla_codigo">
                Consecutivo
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="planilla_codigo"
                  name="planilla_codigo"
                  value={formData.planilla_codigo}
                  readOnly
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleRefreshConsecutivo}
                  title="Generar nuevo consecutivo"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="empresa_id">
                Empresa
              </label>
              <select
                className={`form-select${errores.empresa_id && touched.empresa_id ? " is-invalid" : ""}`}
                id="empresa_id"
                name="empresa_id"
                value={formData.empresa_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id_empresa} value={emp.id_empresa}>
                    {emp.nombre_comercial_empresa}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Planilla y Estado */}
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
                required
              >
                {estadosPlanilla.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Inicio y Fecha Fin */}
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
                required
              />
            </div>
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
                rows={3}
                placeholder="Descripción opcional de la planilla"
              ></textarea>
            </div>
          </div>
          <button

            className="btn btn-primary"
            onClick={handleSubmit}
          >
            Crear Planilla
          </button>

      </div>
    </div>
  );
};

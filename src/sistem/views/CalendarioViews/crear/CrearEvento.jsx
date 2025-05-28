import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Empleados_Lista_Thunks } from "../../../../store/Empleado/Empleados_Lista_Thunks";
import Swal from "sweetalert2";
import { Calendario_Crear_Thunks } from "../../../../store/Calendario/Calendario_Crear_Thunks";
import { useNavigate } from "react-router-dom";
/**
 * Configuración de eventos y horarios
 */
const CONFIG = {
   TIPOS_EVENTO: [
      { value: "Llamada", label: "Llamada", color: "#007bff" },
      { value: "Tarea", label: "Tarea", color: "#28a745" },
      { value: "Whatsapp", label: "Whatsapp", color: "#25D366" },
      { value: "Correo", label: "Correo", color: "#dc3545" },
      { value: "Reunión", label: "Reunión", color: "#ffc107" },
      { value: "Permiso", label: "Permiso", color: "#6f42c1" },
      { value: "Vacaciones", label: "Vacaciones", color: "#20c997" },
      { value: "Otro", label: "Otro", color: "#343a40" },
   ],
   HORARIO: {
      INICIO: 7,
      FIN: 18,
      INTERVALO: 30,
   },
};

/**
 * Utilidades para manejo de fechas y horas
 */
const dateUtils = {
   getFechaActual: () => new Date().toISOString().slice(0, 10),

   getHoraCercana: () => {
      const now = new Date();
      const hora = now.getHours();
      const minuto = now.getMinutes();
      const h =
         hora < CONFIG.HORARIO.INICIO
            ? CONFIG.HORARIO.INICIO
            : hora > CONFIG.HORARIO.FIN
            ? CONFIG.HORARIO.FIN
            : hora;
      const m = minuto < 30 ? "00" : "30";
      return `${h.toString().padStart(2, "0")}:${m}`;
   },

   generarOpcionesHora: () => {
      const opciones = [];
      for (let h = CONFIG.HORARIO.INICIO; h <= CONFIG.HORARIO.FIN; h++) {
         for (let m = 0; m < 60; m += CONFIG.HORARIO.INTERVALO) {
            const displayHour = h % 12 === 0 ? 12 : h % 12;
            const ampm = h < 12 ? "AM" : "PM";
            const minuto = m.toString().padStart(2, "0");
            const value = `${h.toString().padStart(2, "0")}:${minuto}`;
            const label = `${displayHour}:${minuto} ${ampm}`;
            opciones.push({ value, label });
         }
      }
      return opciones;
   },

   /**
    * Compara dos horas en formato HH:mm
    * @returns true si hora2 es mayor o igual a hora1
    */
   isHoraValida: (hora1, hora2, fecha1, fecha2) => {
      const datetime1 = new Date(`${fecha1}T${hora1}`);
      const datetime2 = new Date(`${fecha2}T${hora2}`);
      return datetime2 >= datetime1;
   },

   /**
    * Formatea fecha y hora al formato requerido yyyy-MM-dd HH:mm:ss
    */
   formatDateTime: (fecha, hora) => {
      return `${fecha} ${hora}:00`;
   },

   /**
    * Obtiene la hora siguiente a la hora proporcionada
    * @param {string} hora - Hora en formato HH:mm
    * @returns {string} - Hora siguiente en formato HH:mm
    */
   getHoraSiguiente: (hora) => {
      const [h, m] = hora.split(':').map(Number);
      let nuevaHora = h + 1;
      
      if (nuevaHora > CONFIG.HORARIO.FIN) {
         nuevaHora = CONFIG.HORARIO.FIN;
      }
      
      return `${nuevaHora.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
   },
};

/**
 * Obtiene la fecha desde los parámetros de la URL
 */
const getDateFromUrl = () => {
   const params = new URLSearchParams(window.location.search);
   const fechaParam = params.get("fecha");
   return fechaParam || dateUtils.getFechaActual();
};

/**
 * Estado inicial del formulario
 */
const initialFormState = {
   titulo_evento: "",
   descripcion_evento: "",
   tipo_evento: CONFIG.TIPOS_EVENTO[0].value,
   color_evento: CONFIG.TIPOS_EVENTO[0].color,
   fecha_inicio: getDateFromUrl(),
   hora_inicio: dateUtils.getHoraCercana(),
   fecha_fin: getDateFromUrl(),
   hora_fin: dateUtils.getHoraCercana(),
   all_day_evento: false,
   id_empleado_evento: "",
};

/**
 * Componente principal para crear eventos
 */
export const CrearEvento = () => {
   const dispatch = useDispatch();
   const location = useLocation();
   const navigate = useNavigate();
   
   const [form, setForm] = useState(initialFormState);
   const [empleados, setEmpleados] = useState([]);
   const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
   const [isLoading, setIsLoading] = useState(false);

   /**
    * Carga la lista de empleados desde la API
    */
   const cargarEmpleados = async () => {
      const result = await dispatch(Empleados_Lista_Thunks());
      if (result.data) {
         const empleadosFormateados = result.data.array.map((emp) => ({
            value: emp.id_empleado,
            label: `${emp.nombre_empleado} ${emp.apellidos_empleado}`,
            cedula: emp.cedula_empleado,
            correo: emp.correo_empleado,
            telefono: emp.telefono_empleado,
         }));
         setEmpleados(empleadosFormateados);
      }
   };

   useEffect(() => {
      cargarEmpleados();
   }, [dispatch]);

   useEffect(() => {
      const params = new URLSearchParams(location.search);
      const fechaParam = params.get("fecha");
      if (fechaParam) {
         setForm((prev) => ({
            ...prev,
            fecha_inicio: fechaParam,
            fecha_fin: fechaParam,
         }));
      }
   }, [location.search]);

   /**
    * Maneja los cambios en el formulario
    */
   const handleChange = (e) => {
      const { name, value } = e.target;

      if (name === "id_empleado_evento") {
         handleEmpleadoChange(value);
      } else if (name === "tipo_evento") {
         handleTipoEventoChange(value);
      } else if (name === "fecha_inicio") {
         handleFechaInicioChange(value);
      } else if (name === "hora_inicio") {
         handleHoraInicioChange(value);
      } else {
         setForm((prev) => ({ ...prev, [name]: value }));
      }
   };

   /**
    * Manejadores específicos para cada tipo de cambio
    */
   const handleEmpleadoChange = (value) => {
      setIsLoading(true);
      const empleadoEncontrado = empleados.find((emp) => emp.value.toString() === value);
      setTimeout(() => {
         setEmpleadoSeleccionado(empleadoEncontrado);
         setForm((prev) => ({ ...prev, id_empleado_evento: value }));
         setIsLoading(false);
      }, 500);
   };

   const handleTipoEventoChange = (value) => {
      const tipo = CONFIG.TIPOS_EVENTO.find((op) => op.value === value);
      setForm((prev) => ({
         ...prev,
         tipo_evento: value,
         color_evento: tipo?.color || "#343a40",
      }));
   };

   const handleFechaInicioChange = (value) => {
      setForm((prev) => ({
         ...prev,
         fecha_inicio: value,
         fecha_fin: value,
      }));
   };

   const handleHoraInicioChange = (value) => {
      setForm((prev) => ({
         ...prev,
         hora_inicio: value,
         hora_fin: dateUtils.getHoraSiguiente(value)
   }));
   };

   /**
    * Maneja el envío del formulario
    */
   const handleSubmit = (e) => {
      e.preventDefault();

      // Campos requeridos
      const camposRequeridos = [
         { campo: "titulo_evento", nombre: "Título del evento" },
         { campo: "tipo_evento", nombre: "Tipo de evento" },
         { campo: "fecha_inicio", nombre: "Fecha de inicio" },
         { campo: "hora_inicio", nombre: "Hora de inicio" },
         { campo: "fecha_fin", nombre: "Fecha de fin" },
         { campo: "hora_fin", nombre: "Hora de fin" },
      ];

      // Verificar campos vacíos
      const camposVacios = camposRequeridos.filter((campo) => !form[campo.campo]);

      // Si hay campos vacíos, marcarlos en rojo y mostrar alerta
      if (camposVacios.length > 0) {
         // Marcar campos en rojo
         camposVacios.forEach((campo) => {
            const elemento = document.getElementById(campo.campo);
            if (elemento) {
               elemento.classList.add("is-invalid");
            }
         });

         // Mostrar alerta de error
         Swal.fire({
            icon: "error",
            title: "Campos requeridos",
            html: `Por favor complete los siguientes campos:<br><br>${camposVacios
               .map((c) => c.nombre)
               .join("<br>")}`,
            confirmButtonText: "Entendido",
         });
         return;
      }

      // Validar que la hora de fin no sea menor a la hora de inicio
      if (
         !dateUtils.isHoraValida(form.hora_inicio, form.hora_fin, form.fecha_inicio, form.fecha_fin)
      ) {
         Swal.fire({
            icon: "error",
            title: "Error en las horas",
            text: "La hora de finalización no puede ser menor a la hora de inicio",
            confirmButtonText: "Entendido",
         });

         // Marcar campos de hora en rojo
         document.getElementById("hora_inicio").classList.add("is-invalid");
         document.getElementById("hora_fin").classList.add("is-invalid");
         return;
      }

      // Si pasa todas las validaciones, mostrar confirmación
      Swal.fire({
         icon: "question",
         title: "¿Está seguro de crear el evento?",
         html: `
        <div class="text-left">
          <p><strong>Título:</strong> ${form.titulo_evento}</p>
          <p><strong>Tipo:</strong> ${form.tipo_evento}</p>
          <p><strong>Inicio:</strong> ${form.fecha_inicio} ${
            dateUtils.generarOpcionesHora().find((h) => h.value === form.hora_inicio)?.label ||
            form.hora_inicio
         }</p>
          <p><strong>Fin:</strong> ${form.fecha_fin} ${
            dateUtils.generarOpcionesHora().find((h) => h.value === form.hora_fin)?.label ||
            form.hora_fin
         }</p>
        </div>
      `,
         showCancelButton: true,
         confirmButtonText: "Sí, crear evento",
         cancelButtonText: "Cancelar",
         confirmButtonColor: "#28a745",
         cancelButtonColor: "#dc3545",
      }).then(async (result) => {
         if (result.isConfirmed) {
            Swal.fire({
               title: "Creando evento",
               text: "Por favor espere...",
               allowOutsideClick: false,
               didOpen: () => {
                  Swal.showLoading();
               },
            });
            // Aquí iría la lógica para guardar el evento
            const eventoData = {
               ...form,
               fecha_inicio_evento: dateUtils.formatDateTime(form.fecha_inicio, form.hora_inicio),
               fecha_fin_evento: dateUtils.formatDateTime(form.fecha_fin, form.hora_fin),
            };

            const respuesta = await dispatch(Calendario_Crear_Thunks(eventoData));
            if (respuesta.success) {
               Swal.fire("¡Creado!", "El empleado ha sido creado exitosamente.", "success").then(
                  () => {
                     navigate("/calendario/ver");
                  },
               );
            } else {
               Swal.fire({
                  title: "Error",
                  text: respuesta.message || "Ocurrió un error inesperado.",
                  icon: "error",
                  confirmButtonText: "Aceptar",
               });
            }
         }
      });

      // Limpiar las clases de invalid
      camposRequeridos.forEach((campo) => {
         const elemento = document.getElementById(campo.campo);
         if (elemento) {
            elemento.classList.remove("is-invalid");
         }
      });
   };

   return (
      <div className="card">
         <div className="card-header">
            <h5>Crear Evento</h5>
            <p className="text-muted">
               Completa el formulario para crear un nuevo evento en el calendario.
            </p>
         </div>
         <form onSubmit={handleSubmit}>
            <div className="card-body">
               <div className="row">
                  {/* Par 1: Título y Tipo */}
                  <div className="mb-3 col-md-6">
                     <label
                        className="form-label"
                        htmlFor="titulo_evento"
                     >
                        Título del evento <span className="text-danger">*</span>
                     </label>
                     <input
                        type="text"
                        className="form-control"
                        id="titulo_evento"
                        name="titulo_evento"
                        value={form.titulo_evento}
                        onChange={handleChange}
                        placeholder="Ej: Reunión semanal"
                        required
                     />
                  </div>
                  <div className="mb-3 col-md-6">
                     <label
                        className="form-label"
                        htmlFor="tipo_evento"
                     >
                        Tipo de evento <span className="text-danger">*</span>
                     </label>
                     <select
                        className="form-select"
                        id="tipo_evento"
                        name="tipo_evento"
                        value={form.tipo_evento}
                        onChange={handleChange}
                        style={{ borderLeft: `8px solid ${form.color_evento}` }}
                        required
                     >
                        <option value="">Seleccione un Tipo</option>
                        {CONFIG.TIPOS_EVENTO.map((op) => (
                           <option
                              key={op.value}
                              value={op.value}
                           >
                              {op.label}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Par 2: Fecha y Hora inicio */}
                  <div className="mb-3 col-md-6">
                     <label
                        className="form-label"
                        htmlFor="fecha_inicio"
                     >
                        Fecha de inicio <span className="text-danger">*</span>
                     </label>
                     <input
                        type="date"
                        className="form-control"
                        id="fecha_inicio"
                        name="fecha_inicio"
                        value={form.fecha_inicio}
                        onChange={handleChange}
                        required
                     />
                  </div>
                  <div className="mb-3 col-md-6">
                     <label
                        className="form-label"
                        htmlFor="hora_inicio"
                     >
                        Hora de inicio <span className="text-danger">*</span>
                     </label>
                     <select
                        className="form-select"
                        id="hora_inicio"
                        name="hora_inicio"
                        value={form.hora_inicio}
                        onChange={handleChange}
                        required
                     >
                        {dateUtils.generarOpcionesHora().map((hora) => (
                           <option
                              key={hora.value}
                              value={hora.value}
                           >
                              {hora.label}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Par 3: Fecha y Hora fin */}
                  <div className="mb-3 col-md-6">
                     <label
                        className="form-label"
                        htmlFor="fecha_fin"
                     >
                        Fecha de fin <span className="text-danger">*</span>
                     </label>
                     <input
                        type="date"
                        className="form-control"
                        id="fecha_fin"
                        name="fecha_fin"
                        value={form.fecha_fin}
                        onChange={handleChange}
                        required
                     />
                  </div>
                  <div className="mb-3 col-md-6">
                     <label
                        className="form-label"
                        htmlFor="hora_fin"
                     >
                        Hora de fin <span className="text-danger">*</span>
                     </label>
                     <select
                        className="form-select"
                        id="hora_fin"
                        name="hora_fin"
                        value={form.hora_fin}
                        onChange={handleChange}
                        required
                     >
                        {dateUtils.generarOpcionesHora().map((hora) => (
                           <option
                              key={hora.value}
                              value={hora.value}
                           >
                              {hora.label}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Descripción (ancho completo) */}
                  <div className="mb-3 col-12">
                     <label
                        className="form-label"
                        htmlFor="descripcion_evento"
                     >
                        Descripción del evento
                     </label>
                     <textarea
                        className="form-control"
                        id="descripcion_evento"
                        name="descripcion_evento"
                        rows="3"
                        value={form.descripcion_evento}
                        onChange={handleChange}
                        placeholder="Agrega una descripción opcional"
                     ></textarea>
                  </div>

                  {/* Empleado (ancho completo) */}
                  <div className="mb-3 col-12">
                     <label
                        className="form-label"
                        htmlFor="id_empleado_evento"
                     >
                        Empleado asignado
                     </label>
                     <select
                        className="form-select"
                        id="id_empleado_evento"
                        name="id_empleado_evento"
                        value={form.id_empleado_evento}
                        onChange={handleChange}
                     >
                        <option value="">Seleccione un empleado</option>
                        {empleados.map((emp) => (
                           <option
                              key={emp.value}
                              value={emp.value}
                           >
                              {emp.label}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Mostrar detalles del empleado cuando está seleccionado */}
                  {empleadoSeleccionado && (
                     <div className="row mt-3">
                        <div className="col-md-6 mb-3">
                           <label className="form-label">Nombre completo</label>
                           <input
                              type="text"
                              className="form-control"
                              value={empleadoSeleccionado.label}
                              readOnly
                           />
                        </div>
                        <div className="col-md-6 mb-3">
                           <label className="form-label">Cédula</label>
                           <input
                              type="text"
                              className="form-control"
                              value={empleadoSeleccionado.cedula}
                              readOnly
                           />
                        </div>
                        <div className="col-md-6 mb-3">
                           <label className="form-label">Correo</label>
                           <input
                              type="text"
                              className="form-control"
                              value={empleadoSeleccionado.correo}
                              readOnly
                           />
                        </div>
                        <div className="col-md-6 mb-3">
                           <label className="form-label">Teléfono</label>
                           <input
                              type="text"
                              className="form-control"
                              value={empleadoSeleccionado.telefono}
                              readOnly
                           />
                        </div>
                     </div>
                  )}
               </div>
               <button
                  type="submit"
                  className="btn btn-dark"
               >
                  Guardar Evento
               </button>
            </div>
         </form>
      </div>
   );
};

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { Calendario_Lista_Thunks } from "../../../../store/Calendario/Calendario_Lista_Thunks";
import esLocale from "@fullcalendar/core/locales/es";
import { useNavigate } from "react-router-dom";

export const VerCalendario = () => {
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const [eventos, setEventos] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedTypes, setSelectedTypes] = useState([]);
   const [initialView, setInitialView] = useState("dayGridMonth");
   const [availableViews, setAvailableViews] = useState(["dayGridMonth", "listWeek"]);
   const [hoveredEventId, setHoveredEventId] = useState(null);
   const [currentView, setCurrentView] = useState(initialView);

   // Cargar eventos al montar
   useEffect(() => {
      const cargarEventos = async () => {
         setLoading(true);
         const result = await dispatch(Calendario_Lista_Thunks());

         console.log("Eventos cargados:", result.data);
         setEventos(result.data.array || []);
         setLoading(false);
      };
      cargarEventos();
   }, [dispatch]);

   // Extraer tipos únicos de los eventos
   const eventTypes = React.useMemo(() => {
      const tipos = [...new Set((eventos || []).map((ev) => ev.tipo_evento))].filter(Boolean);
      return tipos.sort().map((tipo) => ({
         label: tipo.charAt(0).toUpperCase() + tipo.slice(1),
         value: tipo,
      }));
   }, [eventos]);

   // Inicializar filtros con todos los tipos SOLO si selectedTypes está vacío
   useEffect(() => {
      if (eventTypes.length && selectedTypes.length === 0) {
         setSelectedTypes(eventTypes.map((t) => t.value));
      }
      // eslint-disable-next-line
   }, [eventTypes]);

   // Adaptar eventos para FullCalendar
   const adaptedEvents = (eventos || []).map((ev) => ({
      id: ev.id_evento,
      title: ev.titulo_evento,
      start: ev.fecha_inicio_evento,
      end: ev.fecha_fin_evento,
      backgroundColor: ev.color_evento,
      borderColor: ev.color_evento,
      textColor: "#fff",
      type: ev.tipo_evento,
      allDay: !!ev.all_day_evento,
      descripcion_evento: ev.descripcion_evento,
      nombre_empleado: ev.nombre_completo_empleado, // <-- agrega esto si no está
   }));

   // Filtrar por tipo
   const filteredEvents = React.useMemo(() => {
      return adaptedEvents.filter((ev) => selectedTypes.includes(ev.type));
   }, [adaptedEvents, selectedTypes]);

   const handleTypeChange = (type) => {
      setSelectedTypes((prev) => 
         prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
   };

   // Permite mover eventos
   const handleEventDrop = (info) => {
      // Aquí puedes despachar un thunk para actualizar el evento en el backend si lo deseas
      // Ejemplo: dispatch(Calendario_Actualizar_Thunks(info.event.id, info.event.start, info.event.end))
   };

   // Permite seleccionar una fecha
   const handleDateClick = (info) => {
      navigate(`/calendario/crear?fecha=${info.dateStr}`);
   };

   // Agregado: manejar clics en eventos
   const handleEventClick = (info) => {
      navigate(`/calendario/editar?data=${info.event.id}`);
   };

   useEffect(() => {
      const handleResize = () => {
         if (window.matchMedia("(max-width: 767px)").matches) {
            setInitialView("listWeek");
            setAvailableViews(["listWeek"]);
         } else {
            setInitialView("dayGridMonth");
            setAvailableViews(["dayGridMonth", "listWeek"]);
         }
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []); // <-- NO agregues selectedTypes aquí

   return (
      <TarjetaRow
         texto="Calendario"
         subtitulo="Visualización del calendario con eventos programados."
      >
         <div className="row">
            {/* Filtros a la izquierda */}
            <div className="col-md-3 mb-3">
               <div className="card price-card">
                  <div className="card-body price-head bg-light-secondary">
                     <h5 className="text-secondary">Eventos Calendario</h5>
                     <br />
                     <div className="price-icon bg-light-secondary">
                        <i className="ph-duotone ph-buildings text-secondary"></i>
                     </div>
                  </div>
                  <div className="card-body">
                     <h5>Filtrar por tipo</h5>
                     <br />
                     {eventTypes.length === 0 ? (
                        <div
                           className="alert alert-danger"
                           role="alert"
                        >
                           No hay eventos para mostrar y filtrar
                        </div>
                     ) : (
                        eventTypes.map((type) => (
                           <div
                              className="form-check"
                              key={type.value}
                           >
                              <input
                                 className="form-check-input"
                                 type="checkbox"
                                 checked={selectedTypes.includes(type.value)}
                                 onChange={() => handleTypeChange(type.value)}
                                 id={type.value}
                              />
                              <label
                                 className="form-check-label"
                                 htmlFor={type.value}
                              >
                                 {type.label}
                              </label>
                           </div>
                        ))
                     )}
                     <button
                        className="btn btn-dark mt-3 w-100"
                        onClick={() => navigate("/calendario/crear")} // <-- Cambia esto
                     >
                        Crear un nuevo evento
                     </button>
                  </div>
               </div>
            </div>
            {/* Calendario a la derecha */}
            <div className="col-md-9">
               {loading ? (
                  <div
                     className="d-flex justify-content-center align-items-center"
                     style={{ height: 400 }}
                  >
                     <div
                        className="spinner-border text-primary"
                        role="status"
                     >
                        <span className="visually-hidden">Cargando...</span>
                     </div>
                  </div>
               ) : (
                  <FullCalendar
                     key={selectedTypes.join(",")}
                     eventDisplay="block"
                     plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
                     initialView={initialView}
                     view={currentView} // <-- Mantiene la vista actual aunque cambie el filtro
                     headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: availableViews.join(","),
                     }}
                     views={{
                        dayGridMonth: { buttonText: "Mes" },
                        listWeek: { buttonText: "Agenda" },
                     }}
                     locale={esLocale}
                     events={filteredEvents}
                     height={currentView === "listWeek" ? 800 : "auto"}
                     editable={true}
                     eventDrop={handleEventDrop}
                     dateClick={handleDateClick}
                     eventClick={handleEventClick} // <-- Agregado aquí
                     eventTimeFormat={{
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                     }}
                     eventMouseEnter={(info) => setHoveredEventId(info.event.id)}
                     eventMouseLeave={() => setHoveredEventId(null)}
                     eventContent={(arg) => {
                        const isHovered = hoveredEventId === arg.event.id;
                        return (
                           <div
                              style={{
                                 backgroundColor: arg.event.backgroundColor,
                                 color: "#fff",
                                 borderRadius: 4,
                                 padding: "2px 4px",
                                 width: "100%",
                                 boxSizing: "border-box",
                                 fontSize: "0.95em",
                                 position: "relative",
                              }}
                           >
                              {/* Título con ellipsis */}
                              <div style={{
                                 overflow: "hidden",
                                 textOverflow: "ellipsis",
                                 whiteSpace: "nowrap",
                                 width: "100%"
                              }}>
                                 {arg.event.title}
                              </div>
                              {/* Tooltip mejorado */}
                              {isHovered && (
                                 <div
                                    style={{
                                       position: "absolute",
                                       left: 0,
                                       bottom: "100%", // Cambiado para que aparezca arriba
                                       background: "rgba(0,0,0,0.9)",
                                       color: "#fff",
                                       borderRadius: 4,
                                       padding: "4px 8px",
                                       fontSize: "0.85em",
                                       zIndex: 1000, // Aumentado el z-index
                                       minWidth: "200px",
                                       maxWidth: 300,
                                       whiteSpace: "normal",
                                       boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                                       marginBottom: "5px" // Espacio entre el tooltip y el evento
                                    }}
                                 >
                                    <div>Hora: {arg.timeText ? arg.timeText : ""}</div>
                                    <div>Nombre evento: {arg.event.title}</div>
                                    <div>
                                       Empleado: {arg.event.extendedProps.nombre_empleado || ""}
                                    </div>
                                    <div>
                                       Desc: {arg.event.extendedProps.descripcion_evento || ""}
                                    </div>
                                 </div>
                              )}
                           </div>
                        );
                     }}
                     viewDidMount={(info) => setCurrentView(info.view.type)}
                     datesSet={(info) => setCurrentView(info.view.type)}
                  />
               )}
            </div>
         </div>
      </TarjetaRow>
   );
};

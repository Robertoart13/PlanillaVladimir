import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TarjetaRow } from '../../../components/TarjetaRow/TarjetaRow';
import { Calendario_Lista_Planilla_Thunks } from '../../../../store/Calendario/Calendario_Lista_Planilla_Thunks';
import { useNavigate } from 'react-router-dom';

export const ClanedarioPlanilla = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState([]);

  useEffect(() => {
    const obtenerPlanillas = async () => {
      const result = await dispatch(Calendario_Lista_Planilla_Thunks());

      if (result.data) {
        const eventosArray = result.data.array.map(item => ({
          id: item.planilla_id,
          title: item.planilla_codigo,
          start: item.planilla_fecha_inicio,
          end: item.planilla_fecha_fin,
          extendedProps: {
            nombreCompleto: item.planilla_codigo,
            empresa: item.nombre_empresa,
            creadoPor: item.nombre_usuario,
            estado: item.planilla_estado
          }
        }));
        setEventos(eventosArray);

        // Obtener empresas únicas
        const empresasUnicas = [
          ...new Set(result.data.array.map(item => item.nombre_empresa))
        ];
        setEmpresas(empresasUnicas);
        setEmpresasSeleccionadas(empresasUnicas); // Por defecto, todas seleccionadas
      }
    };
    obtenerPlanillas();
  }, [dispatch]);

  // Manejar cambios en los checkboxes
  const handleEmpresaChange = (empresa) => {
    setEmpresasSeleccionadas(prev =>
      prev.includes(empresa)
        ? prev.filter(e => e !== empresa)
        : [...prev, empresa]
    );
  };

  // Filtrar eventos según empresas seleccionadas
  const eventosFiltrados = eventos.filter(evento =>
    empresasSeleccionadas.includes(evento.extendedProps.empresa)
  );

  return (

    <TarjetaRow
      texto="Calendario Planilla"
      subtitulo="Visualización del las planillas calendarizadas"
    >
      <div className="row">
        <div className="col-md-3 mb-3">
          <div className="card price-card">
            <div className="card-body price-head bg-light-secondary">
              <h5 className="text-secondary">Empresa y PLanillas</h5>
              <br />
              <div className="price-icon bg-light-secondary">
                <i className="ph-duotone ph-buildings text-secondary"></i>
              </div>
            </div>
            <div className="card-body">
              <h5>Filtrar por tipo</h5>
              <br />
              {empresas.map(empresa => (


                <div class="mb-3 form-check">
                  <input checked={empresasSeleccionadas.includes(empresa)}
                    onChange={() => handleEmpresaChange(empresa)} type="checkbox" class="form-check-input" id="exampleCheck1" />
                  <label for="exampleCheck1"> {empresa}</label>
                </div>
              ))}
              <button
                className="btn btn-dark mt-3 w-100"
                onClick={() => navigate("/planilla/crear")}
              >
                Crear una nueva planilla
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-9">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={eventosFiltrados}
            locale="es"
            height="900px"
            eventDidMount={info => {
              info.el.setAttribute(
                'title',
                (info.event.extendedProps.nombreCompleto || info.event.title) +
                '\nEmpresa: ' + (info.event.extendedProps.empresa || 'No especificada') +
                '\nCreado por: ' + (info.event.extendedProps.creadoPor || 'No especificado') +
                '\nEstado: ' + (info.event.extendedProps.estado || 'No especificado')
              );
            }}
            eventClick={info => {
              navigate(`/planilla/editar?data=${info.event.id}`);
            }}
          />
        </div>
      </div>
    </TarjetaRow>

  );
}

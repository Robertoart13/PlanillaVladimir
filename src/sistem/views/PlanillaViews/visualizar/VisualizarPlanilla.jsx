import React, { useState, useEffect } from 'react';
import './visualizarPlanilla.css';
import { TarjetaRow } from '../../../components/TarjetaRow/TarjetaRow';

// Configuración global para el número de tarjetas por fila por defecto
const TARJETAS_POR_FILA_DEFAULT = 5;

/**
 * Componente para mostrar una tarjeta individual de remuneración
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.empleado - Datos del empleado a mostrar
 * @returns {JSX.Element} Tarjeta de remuneración
 */
const RemuneracionCard = ({ empleado }) => {
  // Inicializar el estado con el valor de aplicado del empleado
  const [aplicado, setAplicado] = useState(empleado.aplicado);
  
  const aplicarEmpleado = () => {
    setAplicado(true);
  };
  
  const verPerfilEmpleado = () => {
    // Aquí iría la lógica para ver el perfil del empleado
    alert(`Ver perfil de ${empleado.nombre}`);
  };
  
  return (
    <div className={`remuneracion-card ${aplicado ? 'aplicado' : 'no-aplicado'}`}>
      <div className="remuneracion-header">REMUNERACIÓN OPU SAL</div>
      
      <div className="boton-container boton-perfil-container">
        <button 
          className="boton-ver-perfil" 
          onClick={verPerfilEmpleado}
        >
          Ver perfil de empleado
        </button>
      </div>
      
      <InfoPersonalTable empleado={empleado} />
      <DesgloceRemuneracionTable empleado={empleado} />
      <DeduccionesTable empleado={empleado} />
      <EstadoInscripcionTable empleado={empleado} />
      
      <div className="boton-container">
        <button 
          className="boton-aplicar" 
          onClick={aplicarEmpleado}
          disabled={aplicado}
        >
          {aplicado ? 'Empleado Aplicado' : 'Aplicar Empleado'}
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
const InfoPersonalTable = ({ empleado }) => (
  <table className="remuneracion-table">
    <tbody>
      <tr>
        <td>Remuneración #</td>
        <td>{empleado.id}</td>
      </tr>
      <tr>
        <td>Nombre:</td>
        <td>{empleado.nombre}</td>
      </tr>
      <tr>
        <td>Cedula:</td>
        <td>{empleado.cedula}</td>
      </tr>
      <tr>
        <td>Puesto:</td>
        <td>{empleado.puesto}</td>
      </tr>
      <tr>
        <td>Cuenta Bancaria:</td>
        <td>{empleado.cuentaBancaria}</td>
      </tr>
    </tbody>
  </table>
);

/**
 * Componente para mostrar el desglose de remuneración del empleado
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.empleado - Datos del empleado
 * @returns {JSX.Element} Tabla de desglose de remuneración
 */
const DesgloceRemuneracionTable = ({ empleado }) => (
  <table className="remuneracion-table">
    <tbody>
      <tr>
        <td colSpan="2" className="section-header">Desgloce de remuneración</td>
      </tr>
      <tr>
        <td>Remuneración Bruta:</td>
        <td className="amount">₡{empleado.remuneracionBruta}</td>
      </tr>
      <tr>
        <td>Bonificaciones</td>
        <td className="amount">₡{empleado.bonificaciones}</td>
      </tr>
      <tr>
        <td>Remuneración Neta:</td>
        <td className="amount">₡{empleado.remuneracionNeta}</td>
      </tr>
    </tbody>
  </table>
);

/**
 * Componente para mostrar las deducciones del empleado
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.empleado - Datos del empleado
 * @returns {JSX.Element} Tabla de deducciones
 */
const DeduccionesTable = ({ empleado }) => (
  <table className="remuneracion-table">
    <tbody>
      <tr>
        <td colSpan="2" className="section-header">Deducciones</td>
      </tr>
      <tr>
        <td>Cuota Seguro Independiente:</td>
        <td className="amount">₡{empleado.cuotaSeguro}</td>
      </tr>
      <tr>
        <td>Rebajos de cliente</td>
        <td className="amount">₡{empleado.rebajosCliente}</td>
      </tr>
      <tr>
        <td>Rebajos de OPU</td>
        <td className="amount">₡{empleado.rebajosOPU}</td>
      </tr>
      <tr>
        <td>Total Deducciones</td>
        <td className="amount">₡{empleado.totalDeducciones}</td>
      </tr>
      <tr>
        <td>Reintegros decliente</td>
        <td className="amount">₡{empleado.reintegrosCliente}</td>
      </tr>
      <tr>
        <td>Reintegros de OPU</td>
        <td className="amount">₡{empleado.reintegrosOPU}</td>
      </tr>
      <tr>
        <td><strong>Remuneración neta</strong></td>
        <td className="amount"><strong>₡{empleado.remuneracionNeta}</strong></td>
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
const EstadoInscripcionTable = ({ empleado }) => (
  <table className="remuneracion-table">
    <tbody>
      <tr>
        <td colSpan="2" className="section-header">Estado de Inscripción</td>
      </tr>
      <tr>
        <td>Ministerio de Hacienda:</td>
        <td className={empleado.ministerio_hacienda_empleado === 1 ? "inscrito" : "no-inscrito"}>
          {empleado.ministerio_hacienda_empleado === 1 ? "Inscrito" : "No inscrito"}
        </td>
      </tr>
      <tr>
        <td>RT-INS:</td>
        <td className={empleado.rt_ins_empleado === 1 ? "inscrito" : "no-inscrito"}>
          {empleado.rt_ins_empleado === 1 ? "Inscrito" : "No inscrito"}
        </td>
      </tr>
      <tr>
        <td>CCSS:</td>
        <td className={empleado.caja_costarricense_seguro_social_empleado === 1 ? "inscrito" : "no-inscrito"}>
          {empleado.caja_costarricense_seguro_social_empleado === 1 ? "Inscrito" : "No inscrito"}
        </td>
      </tr>
    </tbody>
  </table>
);

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
      </select>
    </label>
  </div>
);

/**
 * Datos estáticos de empleados (en un caso real, estos vendrían de una API)
 */
const DATOS_EMPLEADOS = [  {
    id: 1,
    nombre: "Ronaldo Martinez Alvarez",
    cedula: "204000197",
    puesto: "Operario agricula",
    cuentaBancaria: "200011390536662",
    remuneracionBruta: "77,974.96",
    bonificaciones: "-",
    remuneracionNeta: "77,974.96",
    cuotaSeguro: "-",
    rebajosCliente: "-",
    rebajosOPU: "-",
    totalDeducciones: "-",
    reintegrosCliente: "-",
    reintegrosOPU: "-",
    ministerio_hacienda_empleado: 1,
    rt_ins_empleado: 0,
    caja_costarricense_seguro_social_empleado: 1,
    aplicado: false
  },{
    id: 2,
    nombre: "Santos Morales Lira",
    cedula: "155823049002",
    puesto: "Operario agricula",
    cuentaBancaria: "200010680499667",
    remuneracionBruta: "84,000.00",
    bonificaciones: "-",
    remuneracionNeta: "84,000.00",
    cuotaSeguro: "-",
    rebajosCliente: "-",
    rebajosOPU: "-",
    totalDeducciones: "-",
    reintegrosCliente: "-",
    reintegrosOPU: "-",
    ministerio_hacienda_empleado: 0,
    rt_ins_empleado: 1,
    caja_costarricense_seguro_social_empleado: 1,
    aplicado: false
  },{
    id: 3,
    nombre: "Vicente Taleno Lopez",
    cedula: "155831352304",
    puesto: "Operario agricula",
    cuentaBancaria: "200-01-068-052343-6",
    remuneracionBruta: "81,244.46",
    bonificaciones: "-",
    remuneracionNeta: "81,244.46",
    cuotaSeguro: "-",
    rebajosCliente: "-",
    rebajosOPU: "-",
    totalDeducciones: "-",
    reintegrosCliente: "-",
    reintegrosOPU: "-",
    ministerio_hacienda_empleado: 1,
    rt_ins_empleado: 1,
    caja_costarricense_seguro_social_empleado: 0,
    aplicado: false
  },{
    id: 4,
    nombre: "Wilmer Sánchez Sánchez",
    cedula: "",
    puesto: "Operario agricula",
    cuentaBancaria: "",
    remuneracionBruta: "81,724.96",
    bonificaciones: "-",
    remuneracionNeta: "81,724.96",
    cuotaSeguro: "-",
    rebajosCliente: "-",
    rebajosOPU: "-",
    totalDeducciones: "-",
    reintegrosCliente: "-",
    reintegrosOPU: "-",
    ministerio_hacienda_empleado: 0,
    rt_ins_empleado: 0,
    caja_costarricense_seguro_social_empleado: 0,
    aplicado: false
  },{
    id: 5,
    nombre: "Yocsan Gutierez Santa Maria",
    cedula: "206700800",
    puesto: "Operario agricula",
    cuentaBancaria: "200010680541639",
    remuneracionBruta: "103,125.00",
    bonificaciones: "-",
    remuneracionNeta: "103,125.00",
    cuotaSeguro: "-",
    rebajosCliente: "-",
    rebajosOPU: "-",
    totalDeducciones: "-",
    reintegrosCliente: "-",
    reintegrosOPU: "-",
    ministerio_hacienda_empleado: 1,
    rt_ins_empleado: 1,
    caja_costarricense_seguro_social_empleado: 1,
    aplicado: true
  }
];

/**
 * Datos de la planilla actual (en un caso real, estos vendrían de una API)
 */
const DATOS_PLANILLA = {
  consecutivo: "PL-NAT-Sema-20250606-G6U6ID",
  nombreEmpresa: "Naturale",
  creadoPor: "Ahmed Navarro Soto",
  tipoPlanilla: "Semanal",
  fechaInicio: "2025-06-06",
  fechaFin: "2025-06-06",
  estado: "Planilla Activa para Procesar"
};

/**
 * Servicio para obtener datos de empleados
 * En un caso real, este servicio haría una llamada a la API
 * @returns {Promise<Array>} Promesa que resuelve con los datos de empleados
 */
const obtenerEmpleados = async () => {
  // Simula el tiempo de carga de una API
  return new Promise((resolve) => {
    setTimeout(() => resolve(DATOS_EMPLEADOS), 300);
  });
};

/**
 * Componente para mostrar la información general de la planilla
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.planilla - Datos de la planilla
 * @returns {JSX.Element} Información de la planilla
 */
const InfoPlanilla = ({ planilla }) => (
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
        <span className="info-value estado-activo">{planilla.estado}</span>
      </div>
    </div>
  </div>
);

/**
 * Componente principal para visualizar la planilla de empleados
 * @returns {JSX.Element} Grid de tarjetas de remuneración
 */
export const VisualizarPlanilla = () => {
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tarjetasPorFila, setTarjetasPorFila] = useState(TARJETAS_POR_FILA_DEFAULT);
  
  // Cargar datos de empleados al montar el componente
  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const datos = await obtenerEmpleados();
        setEmpleados(datos);
      } catch (error) {
        console.error("Error al cargar los empleados:", error);
      } finally {
        setCargando(false);
      }
    };
    
    cargarEmpleados();
  }, []);

  // Estilos dinámicos para la cuadrícula basados en la configuración actual
  const gridStyle = {
    '--tarjetas-por-fila': tarjetasPorFila
  };
  
  // Maneja el cambio en el número de tarjetas por fila
  const handleTarjetasPorFilaChange = (valor) => {
    setTarjetasPorFila(valor);
    // Podría guardarse en localStorage para persistencia entre sesiones
    localStorage.setItem('tarjetasPorFila', valor);
  };
  
  return (
     <TarjetaRow
        texto="Visualizar Planilla"
        subtitulo="Visualiza la planilla de empleados con sus remuneraciones y estados de inscripción."
        icono="fa-solid fa-users"
     >
        <div className="remuneraciones-container">
           <InfoPlanilla planilla={DATOS_PLANILLA} />

           <TarjetasSelector
              value={tarjetasPorFila}
              onChange={handleTarjetasPorFilaChange}
           />

           {cargando ? (
              <div className="cargando-mensaje">Cargando información de empleados...</div>
           ) : (
              <div
                 className="remuneraciones-grid"
                 style={gridStyle}
              >
                 {empleados.map((empleado, index) => (
                    <RemuneracionCard
                       key={index}
                       empleado={empleado}
                    />
                 ))}
              </div>
           )}
        </div>
     </TarjetaRow>
  );
};

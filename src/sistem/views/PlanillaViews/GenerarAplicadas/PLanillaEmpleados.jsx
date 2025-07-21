import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchData_api } from "../../../../store/fetchData_api/fetchData_api_Thunks";
import { formatCurrency, formatCurrencyByPlanilla } from "../../../../hooks/formatCurrency";
import "./GenerarAplicadas.css";

/**
 * Componente para mostrar la información detallada de una planilla y su empresa asociada
 * Muestra datos de la planilla y información de la empresa en un formato organizado
 */
export const PLanillaEmpleados = () => {
  // Hooks de React y Redux
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  // Estados del componente
  const [planillaData, setPlanillaData] = useState(null);
  const [planillaInfo, setPlanillaInfo] = useState(null);
  const [empresaInfo, setEmpresaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Obtener el ID de la planilla desde los parámetros de URL
  const planillaId = searchParams.get('planilla_id');

  /**
   * Formatea una fecha string a un formato legible en español
   * @param {string} dateString - La fecha en formato string
   * @returns {string} Fecha formateada o "N/A" si no es válida
   */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  /**
   * Formatea un porcentaje decimal a formato legible
   * @param {string} percentage - El porcentaje en formato decimal (ej: "0.08")
   * @returns {string} Porcentaje formateado (ej: "8.0%") o "N/A" si no es válido
   */
  const formatPercentage = (percentage) => {
    if (!percentage) return "N/A";
    
    const num = parseFloat(percentage);
    return `${(num * 100).toFixed(1)}%`;
  };

  /**
   * Extrae la información de empresa desde los datos de la planilla
   * @param {Object} planillaData - Datos de la planilla que contienen info de empresa
   * @returns {Object} Objeto con la información de empresa extraída
   */
  const extractEmpresaInfo = (planillaData) => {
    return {
      nombre_comercial_empresa: planillaData.nombre_comercial_empresa,
      cedula_juridica_empresa: planillaData.cedula_juridica_empresa,
      correo_contacto_empresa: planillaData.correo_contacto_empresa,
      correo_facturacion_empresa: planillaData.correo_facturacion_empresa,
      direccion_empresa: planillaData.direccion_empresa,
      empresa_id: planillaData.empresa_id,
      estado_empresa: planillaData.estado_empresa,
      id_empresa: planillaData.id_empresa,
      nombre_contacto_empresa: planillaData.nombre_contacto_empresa,
      nombre_razon_social_empresa: planillaData.nombre_razon_social_empresa,
      nombre_usuario: planillaData.nombre_usuario,
      porcentaje_empresa: planillaData.porcentaje_empresa
    };
  };

  /**
   * Procesa los datos de la respuesta de la API
   * @param {Object} response - Respuesta de la API
   */
  const processApiResponse = (response) => {
    if (response.data?.array && response.data.array.length > 0) {
      const firstEmployee = response.data.array[0];
      const planillaData = firstEmployee.planilla;
      
      // Establecer información de la planilla
      setPlanillaInfo(planillaData);
      
      // Extraer y establecer información de la empresa
      const empresaData = extractEmpresaInfo(planillaData);
      setEmpresaInfo(empresaData);
    }
  };

  /**
   * Obtiene los datos de la planilla desde la API
   * @param {string} planillaId - ID de la planilla a consultar
   */
  const fetchPlanillaData = async (planillaId) => {
    if (!planillaId) return;

    setLoading(true);
    setError(null);

    try {
      const params = { planilla_id: planillaId };
      const response = await dispatch(fetchData_api(params, "gestor/planilla/gestor/card"));

      console.log(response);
      
      if (response.success) {
        setPlanillaData(response.data);
        processApiResponse(response);
      } else {
        setError(response.message || "Error al cargar los datos de la planilla");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abre el modal con la información del empleado seleccionado
   * @param {Object} employee - Datos del empleado
   */
  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  /**
   * Cierra el modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  /**
   * Función para copiar texto al portapapeles
   */
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías mostrar una notificación de éxito
      console.log('Texto copiado:', text);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  /**
   * Calcula el factor de división según el tipo de planilla
   */
  const getFactorDivision = (tipoPlanilla) => {
    switch (tipoPlanilla?.toLowerCase()) {
      case 'mensual':
        return 1; // Salario completo
      case 'quincenal':
        return 2; // Dividido entre 2
      case 'semanal':
        return 4; // Dividido entre 4 (aproximadamente)
      case 'diario':
        return 30; // Dividido entre 30 días
      default:
        return 1; // Por defecto mensual
    }
  };

  // Efecto para cargar datos cuando cambia el ID de la planilla
  useEffect(() => {
    fetchPlanillaData(planillaId);
  }, [planillaId]);

  /**
   * Renderiza la información combinada de planilla y empresa
   */
  const renderCombinedInfo = () => {
    // Validar que existan los datos necesarios
    if (!planillaInfo || !empresaInfo) {
      return (
        <div className="planilla-info-container">
          <div className="planilla-info-header">
            <h2 className="planilla-info-title">Información de la Planilla</h2>
          </div>
          <div className="planilla-info-content">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>
                Cargando información de la planilla...
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="planilla-info-container">
        <div className="planilla-info-header">
          <h2 className="planilla-info-title">Información de la Planilla</h2>
        </div>
        <div className="planilla-info-content">
          <div className="planilla-info-grid">
            {/* CÓDIGO DE PLANILLA */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">CÓDIGO DE PLANILLA</p>
              <p className="planilla-info-value link bold">
                {planillaInfo.planilla_codigo || "N/A"}
              </p>
            </div>

            {/* TIPO */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">TIPO</p>
              <p className="planilla-info-value">
                {planillaInfo.planilla_tipo || "N/A"}
              </p>
            </div>

            {/* MONEDA */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">MONEDA</p>
              <p className="planilla-info-value">
                {planillaInfo.planilla_moneda || "N/A"}
              </p>
            </div>

            {/* ESTADO */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">ESTADO</p>
              <span className="planilla-info-chip primary">
                {planillaInfo.planilla_estado || "N/A"}
              </span>
            </div>

            {/* NOMBRE EMPRESA */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">NOMBRE EMPRESA</p>
              <p className="planilla-info-value link bold">
                {empresaInfo.nombre_comercial_empresa || "N/A"}
              </p>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">DESCRIPCIÓN</p>
              <p className="planilla-info-value secondary">
                {planillaInfo.planilla_descripcion || "--"}
              </p>
            </div>

            {/* FECHA INICIO */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">FECHA INICIO</p>
              <p className="planilla-info-value">
                {formatDate(planillaInfo.planilla_fecha_inicio)}
              </p>
            </div>

            {/* FECHA FIN */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">FECHA FIN</p>
              <p className="planilla-info-value">
                {formatDate(planillaInfo.planilla_fecha_fin)}
              </p>
            </div>

            {/* RAZÓN SOCIAL */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">RAZÓN SOCIAL</p>
              <p className="planilla-info-value">
                {empresaInfo.nombre_razon_social_empresa || "N/A"}
              </p>
            </div>

            {/* CÉDULA JURÍDICA */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">CÉDULA JURÍDICA</p>
              <p className="planilla-info-value">
                {empresaInfo.cedula_juridica_empresa || "N/A"}
              </p>
            </div>

            {/* NOMBRE CONTACTO */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">NOMBRE CONTACTO</p>
              <p className="planilla-info-value">
                {empresaInfo.nombre_contacto_empresa || "N/A"}
              </p>
            </div>

            {/* CORREO CONTACTO */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">CORREO CONTACTO</p>
              <p className="planilla-info-value">
                {empresaInfo.correo_contacto_empresa || "N/A"}
              </p>
            </div>

            {/* CORREO FACTURACIÓN */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">CORREO FACTURACIÓN</p>
              <p className="planilla-info-value">
                {empresaInfo.correo_facturacion_empresa || "N/A"}
              </p>
            </div>

            {/* DIRECCIÓN */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">DIRECCIÓN</p>
              <p className="planilla-info-value">
                {empresaInfo.direccion_empresa || "N/A"}
              </p>
            </div>

            {/* PORCENTAJE EMPRESA */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">PORCENTAJE EMPRESA</p>
              <p className="planilla-info-value success">
                {formatPercentage(empresaInfo.porcentaje_empresa)}
              </p>
            </div>

            {/* ESTADO EMPRESA */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">ESTADO EMPRESA</p>
              <span className={`planilla-info-chip ${empresaInfo.estado_empresa === 1 ? 'success' : 'error'}`}>
                {empresaInfo.estado_empresa === 1 ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            {/* USUARIO RESPONSABLE */}
            <div className="planilla-info-item">
              <p className="planilla-info-label">USUARIO RESPONSABLE</p>
              <p className="planilla-info-value link bold">
                {empresaInfo.nombre_usuario || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza la sección de empleados
   */
  const renderEmployeesSection = () => (
    <div className="employees-section">
      <div className="employees-header">
        <h3 className="employees-title">
          Empleados
          <span className="employees-count">
            {planillaData?.array?.length || 0}
          </span>
        </h3>
      </div>
      <div className="employees-content">
        {planillaData?.array && planillaData.array.length > 0 ? (
          <div className="employees-grid">
            {planillaData.array.map((employee, index) => (
              <div key={employee.id_empleado_gestor} className="employee-card">
                <div className="employee-card-header">
                  <h4 className="employee-card-title">
                    Empleado #{index + 1}
                  </h4>
                  <button 
                    className="btn-ver-detalle"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    Ver Detalle
                  </button>
                </div>
                
                <div className="employee-card-content">
                  <div className="employee-info-row">
                    <span className="employee-info-label">Nombre:</span>
                    <div className="employee-info-value-container">
                      <span className="employee-info-value">
                        {employee.nombre_completo_empleado_gestor || "N/A"}
                      </span>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(employee.nombre_completo_empleado_gestor || "")}
                        title="Copiar nombre"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="employee-info-row">
                    <span className="employee-info-label">Cédula:</span>
                    <div className="employee-info-value-container">
                      <span className="employee-info-value">
                        {employee.cedula_empleado_gestor || "N/A"}
                      </span>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(employee.cedula_empleado_gestor || "")}
                        title="Copiar cédula"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="employee-info-row">
                    <span className="employee-info-label">Correo:</span>
                    <div className="employee-info-value-container">
                      <span className="employee-info-value">
                        {employee.correo_empleado_gestor || "N/A"}
                      </span>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(employee.correo_empleado_gestor || "")}
                        title="Copiar correo"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="employee-info-row">
                    <span className="employee-info-label">Moneda:</span>
                    <div className="employee-info-value-container">
                      <span className="employee-info-value">
                        {employee.moneda_pago_empleado_gestor || "N/A"}
                      </span>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(employee.moneda_pago_empleado_gestor || "")}
                        title="Copiar moneda"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="employee-info-row">
                    <span className="employee-info-label">Asegurado:</span>
                    <div className="employee-info-value-container">
                      <span className="employee-info-value">
                        {employee.numero_asegurado_empleado_gestor || "N/A"}
                      </span>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(employee.numero_asegurado_empleado_gestor || "")}
                        title="Copiar número asegurado"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="employee-info-row">
                    <span className="employee-info-label">Hacienda:</span>
                    <div className="employee-info-value-container">
                      <span className="employee-info-value">
                        {employee.numero_hacienda_empleado_gestor || "N/A"}
                      </span>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(employee.numero_hacienda_empleado_gestor || "")}
                        title="Copiar número hacienda"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="employee-info-row">
                    <span className="employee-info-label">INS:</span>
                    <div className="employee-info-value-container">
                      <span className="employee-info-value">
                        {employee.numero_ins_empleado_gestor || "N/A"}
                      </span>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(employee.numero_ins_empleado_gestor || "")}
                        title="Copiar número INS"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="employee-info-row">
                    <span className="employee-info-label">Socio:</span>
                    <div className="employee-info-value-container">
                      <span className="employee-info-value">
                        {employee.numero_socio_empleado_gestor || "N/A"}
                      </span>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(employee.numero_socio_empleado_gestor || "")}
                        title="Copiar número socio"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="employee-info-row">
                    <span className="employee-info-label">Tipo:</span>
                    <div className="employee-info-value-container">
                      <span className="employee-info-value">
                        {employee.tipo_planilla_empleado_gestor || "N/A"}
                      </span>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(employee.tipo_planilla_empleado_gestor || "")}
                        title="Copiar tipo de planilla"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              No hay empleados en esta planilla
            </p>
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Renderiza el modal de detalles del empleado
   */
  const renderEmployeeModal = () => {
    if (!selectedEmployee) return null;

    const employee = selectedEmployee;
    const planilla = employee.planilla;
    
    // Obtener moneda de la planilla
    const moneda = planilla?.planilla_moneda || 'colones';
    const tipoPlanilla = employee.tipo_planilla_empleado_gestor || 'mensual';
    const factorDivision = getFactorDivision(tipoPlanilla);
    
    // Calcular compensación base según tipo de planilla
    const salarioBase = parseFloat(employee.salario_base_empleado_gestor) || 0;
    const compensacionBase = salarioBase / factorDivision;
    
    // Calcular cargas sociales según tipo de planilla
    const montoAsegurado = parseFloat(employee.montoAsegurado_gestor_empelado) || 0;
    const cargasSociales = montoAsegurado / factorDivision;
    
    // Calcular totales de aumentos
    const totalAumentos = employee.aumentos?.reduce((sum, aumento) => 
      sum + parseFloat(aumento.monto_aumento_gestor || 0), 0) || 0;
    
    // Calcular totales de horas extras
    const totalHorasExtras = employee.horas_extras?.reduce((sum, hora) => 
      sum + parseFloat(hora.monto_compensacion_calculado_gestor || 0), 0) || 0;
    
    // Calcular totales de compensación por métrica
    const totalMetrica = employee.compensacion_metrica?.reduce((sum, metrica) => 
      sum + parseFloat(metrica.monto_compensacion_metrica_gestor || 0), 0) || 0;
    
    // Calcular totales de rebajos
    const totalRebajos = employee.rebajos_compensacion?.reduce((sum, rebajo) => 
      sum + parseFloat(rebajo.monto_rebajo_calculado || 0), 0) || 0;
    
    // Calcular devengado (compensación base + aumentos + horas extras + métrica - rebajos)
    const totalDevengado = compensacionBase + totalAumentos + totalHorasExtras + totalMetrica - totalRebajos;
    
    // Calcular monto neto (devengado - cargas sociales)
    const montoNeto = totalDevengado - cargasSociales;

    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="modal-content employee-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Detalles del Empleado</h2>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
          </div>
          
          <div className="modal-body">
            {/* Información General */}
            <div className="employee-detail-section">
              <div className="employee-detail-header">
                <div className="employee-detail-left">
                  <div className="company-name">{planilla?.nombre_comercial_empresa}</div>
                  <div className="employee-basic-info">
                    <div>Código: {employee.numero_socio_empleado_gestor}</div>
                    <div>Cédula: {employee.cedula_empleado_gestor}</div>
                    <div>Compensación Normal: {formatCurrencyByPlanilla(moneda, compensacionBase)}</div>
                  </div>
                </div>
                <div className="employee-detail-right">
                  <div className="document-title">Previsualización de Pago de Compensación</div>
                  <div className="document-id">{planilla?.planilla_codigo}</div>
                  <div className="employee-specific-info">
                    <div>Nombre: {employee.nombre_completo_empleado_gestor}</div>
                    <div>Puesto: {employee.tipo_contrato_empleado_gestor}</div>
                    <div>Tipo de Compensación: {employee.tipo_planilla_empleado_gestor}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de Compensación */}
            <div className="employee-detail-section">
              <div className="compensation-summary">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>COMPENSACIÓN BASE</th>
                      <th>DEVENGADO</th>
                      <th>CARGAS SOCIALES</th>
                      <th>MONTO NETO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{formatCurrencyByPlanilla(moneda, compensacionBase)}</td>
                      <td>{formatCurrencyByPlanilla(moneda, totalDevengado)}</td>
                      <td>{formatCurrencyByPlanilla(moneda, cargasSociales)}</td>
                      <td>{formatCurrencyByPlanilla(moneda, montoNeto)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detalles de Acciones de Personal */}
            <div className="employee-detail-section">
              <div className="actions-section">
                <h3>Detalles de Acciones de personal:</h3>
                <div className="employee-name-repeat">{employee.nombre_completo_empleado_gestor}</div>
                
                <table className="actions-table">
                  <thead>
                    <tr>
                      <th>CATEGORIA</th>
                      <th>TIPO DE ACCIÓN</th>
                      <th>MONTO</th>
                      <th>TIPO (+/-)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Compensación Base */}
                    <tr>
                      <td>Compensación Base</td>
                      <td>Salario</td>
                      <td>{formatCurrencyByPlanilla(moneda, compensacionBase)}</td>
                      <td className="positive">+</td>
                    </tr>
                    
                    {/* Aumentos */}
                    {employee.aumentos?.map((aumento, index) => (
                      <tr key={`aumento-${index}`}>
                        <td>Compensación Anual</td>
                        <td>Aumento</td>
                        <td>{formatCurrencyByPlanilla(moneda, aumento.monto_aumento_gestor)}</td>
                        <td className="positive">+</td>
                      </tr>
                    ))}
                    
                    {/* Horas Extras */}
                    {employee.horas_extras?.map((hora, index) => (
                      <tr key={`hora-${index}`}>
                        <td>Compensación Extra</td>
                        <td>Ingreso</td>
                        <td>{formatCurrencyByPlanilla(moneda, hora.monto_compensacion_calculado_gestor)}</td>
                        <td className="positive">+</td>
                      </tr>
                    ))}
                    
                    {/* Compensación por Métrica */}
                    {employee.compensacion_metrica?.map((metrica, index) => (
                      <tr key={`metrica-${index}`}>
                        <td>Compensación por Métrica</td>
                        <td>Ingreso</td>
                        <td>{formatCurrencyByPlanilla(moneda, metrica.monto_compensacion_metrica_gestor)}</td>
                        <td className="positive">+</td>
                      </tr>
                    ))}
                    
                    {/* Rebajos */}
                    {employee.rebajos_compensacion?.map((rebajo, index) => (
                      <tr key={`rebajo-${index}`}>
                        <td>Rebajo a Compensación</td>
                        <td>Deducción</td>
                        <td>{formatCurrencyByPlanilla(moneda, rebajo.monto_rebajo_calculado)}</td>
                        <td className="negative">-</td>
                      </tr>
                    ))}
                    
                    {/* Cargas Sociales */}
                    {cargasSociales > 0 && (
                      <tr>
                        <td>S.T.I CCSS</td>
                        <td>Deducción</td>
                        <td>{formatCurrencyByPlanilla(moneda, cargasSociales)}</td>
                        <td className="negative">-</td>
                      </tr>
                    )}
                    
                    {/* Estado de Inscripciones */}
                    <tr>
                      <td>Ministerio de Hacienda</td>
                      <td>Estado</td>
                      <td>{employee.ministerio_hacienda_empleado_gestor === 1 ? 'Inscrito' : 'No Inscrito'}</td>
                      <td className={employee.ministerio_hacienda_empleado_gestor === 1 ? 'positive' : 'negative'}>
                        {employee.ministerio_hacienda_empleado_gestor === 1 ? '✓' : '✗'}
                      </td>
                    </tr>
                    
                    <tr>
                      <td>CCSS</td>
                      <td>Estado</td>
                      <td>{employee.ccss_empleado_gestor === 1 ? 'Inscrito' : 'No Inscrito'}</td>
                      <td className={employee.ccss_empleado_gestor === 1 ? 'positive' : 'negative'}>
                        {employee.ccss_empleado_gestor === 1 ? '✓' : '✗'}
                      </td>
                    </tr>
                    
                    <tr>
                      <td>INS</td>
                      <td>Estado</td>
                      <td>{employee.rt_ins_empleado_gestor === 1 ? 'Inscrito' : 'No Inscrito'}</td>
                      <td className={employee.rt_ins_empleado_gestor === 1 ? 'positive' : 'negative'}>
                        {employee.rt_ins_empleado_gestor === 1 ? '✓' : '✗'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="employee-detail-footer">
              <div className="footer-info">
                {employee.tipo_planilla_empleado_gestor} {planilla?.planilla_codigo}
              </div>
              <div className="disclaimer">
                Importante: Este documento es una previsualización de la planilla, no se puede utilizar como comprobante de pago.
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button className="btn-cerrar" onClick={handleCloseModal}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza el estado de carga
   */
  const renderLoadingState = () => (
    <div className="loading-container">
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #1976d2', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: '#666' }}>Cargando datos de la planilla...</p>
      </div>
    </div>
  );

  /**
   * Renderiza el estado de error
   */
  const renderErrorState = () => (
    <div className="error-alert">
      <strong>Error:</strong> {error}
    </div>
  );

  /**
   * Renderiza el estado cuando no hay planilla seleccionada
   */
  const renderNoPlanillaState = () => (
    <div className="info-alert">
      No se ha seleccionado una planilla. Por favor, seleccione una planilla para ver los detalles.
    </div>
  );

  return (
    <div className="main-container">
      <div className="content-container">
        {loading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : !planillaId ? (
          renderNoPlanillaState()
        ) : (
          <>
            {/* Información combinada de planilla y empresa */}
            {renderCombinedInfo()}
            
            {/* Sección de empleados */}
            {renderEmployeesSection()}
          </>
        )}
      </div>

      {/* Modal de detalles del empleado */}
      {renderEmployeeModal()}

      {/* Estilos CSS para la animación de carga */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

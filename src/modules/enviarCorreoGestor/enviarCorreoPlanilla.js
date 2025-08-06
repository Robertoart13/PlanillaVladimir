import cron from 'node-cron';
import { createTransport } from 'nodemailer';
import { realizarConsulta } from "../../mysql2-promise/mysql2-promise.js";

/**
 * Configuración del transportador de correo para Hostinger
 * @returns {Object} Configuración del transportador de nodemailer
 */
const createTransporter = () => {
    return createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true, // SSL
        auth: {
            user: 'info@gt3cr.com',
            pass: 'Locos2023@joal'
        }
    });
};

/**
 * Valida si un email tiene formato válido
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Formatea moneda según el tipo (colones o dólares) con separadores de miles
 * @param {number} amount - Cantidad a formatear
 * @param {string} currencyType - Tipo de moneda ('colones' o 'dolares')
 * @returns {string} Cantidad formateada con separadores de miles
 */
const formatCurrency = (amount, currencyType = 'colones') => {
    const numericAmount = parseFloat(amount) || 0;
    
    if (currencyType === 'dolares') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numericAmount);
    }
    
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numericAmount);
};

/**
 * =========================
 * PAYROLL CALCULATION UTILITIES (Adapted from GenerarAplicadas.jsx)
 * =========================
 */

/**
 * Calcula la compensación base según el tipo de planilla del empleado
 * @param {number} salarioBase - Compensación base del empleado
 * @param {string} tipoPlanilla - Tipo de planilla (mensual, quincenal, semanal)
 * @returns {number} Compensación base calculada
 */
const calcularCompensacionBase = (salarioBase, tipoPlanilla) => {
    if (!salarioBase || salarioBase <= 0) return 0;
    
    const salario = parseFloat(salarioBase);
    
    switch (tipoPlanilla?.toLowerCase()) {
        case 'mensual':
            // Para planilla mensual, se toma la compensación completa
            return salario;
            
        case 'quincenal':
            // Para planilla quincenal, se divide la compensación en 2
            return salario / 2;
            
        case 'semanal':
            // Para planilla semanal, se calcula según la ley costarricense
            // 52 semanas al año / 12 meses = 4.33 semanas por mes
            return salario * 4.33;
            
        default:
            // Si no se especifica tipo, se asume mensual
            return salario;
    }
};

/**
 * Formatea la compensación base según la moneda de pago
 * @param {number} compensacionBase - Compensación base calculada
 * @param {string} monedaPago - Moneda de pago del empleado
 * @param {number} salarioBase - Compensación base original (para casos de doble moneda)
 * @param {string} tipoPlanilla - Tipo de planilla del empleado
 * @returns {string} Compensación base formateada
 */
const formatearCompensacionBase = (compensacionBase, monedaPago, salarioBase, tipoPlanilla) => {
    if (!compensacionBase || compensacionBase <= 0) return "0";
    
    switch (monedaPago?.toLowerCase()) {
        case 'dolares':
            return formatCurrency(compensacionBase, 'dolares');
            
        case 'colones_y_dolares':
            // Para doble moneda, calculamos ambas compensaciones usando el tipo de planilla correcto
            const compensacionColones = calcularCompensacionBase(salarioBase, tipoPlanilla);
            const compensacionDolares = calcularCompensacionBase(salarioBase, tipoPlanilla);
            return `${formatCurrency(compensacionColones, 'colones')} / ${formatCurrency(compensacionDolares, 'dolares')}`;
            
        case 'colones':
        default:
            return formatCurrency(compensacionBase, 'colones');
    }
};

/**
 * Calcula el devengado total para un empleado
 * @param {Object} empleado - Datos del empleado
 * @param {number} compensacionBase - Compensación base calculada
 * @param {Array} aumentos - Array de aumentos del empleado
 * @param {Array} horasExtras - Array de horas extras del empleado
 * @param {Array} compensacionMetrica - Array de compensación por métrica del empleado
 * @param {Array} rebajos - Array de rebajos del empleado
 * @returns {Object} Información del devengado total
 */
const calcularDevengado = (empleado, compensacionBase, aumentos, horasExtras, compensacionMetrica, rebajos) => {
    let devengadoTotal = compensacionBase; // Empezar con compensación base
    
    // Sumar compensación anual
    if (aumentos && Array.isArray(aumentos)) {
        aumentos.forEach(aumento => {
            const montoAumento = parseFloat(aumento.monto_aumento_gestor) || 0;
            devengadoTotal += montoAumento;
        });
    }
    
    // Sumar compensación extra
    if (horasExtras && Array.isArray(horasExtras)) {
        horasExtras.forEach(horaExtra => {
            const montoHoraExtra = parseFloat(horaExtra.monto_compensacion_calculado_gestor) || 0;
            devengadoTotal += montoHoraExtra;
        });
    }
    
    // Sumar compensación por métrica
    if (compensacionMetrica && Array.isArray(compensacionMetrica)) {
        compensacionMetrica.forEach(compensacion => {
            const montoCompensacion = parseFloat(compensacion.monto_compensacion_metrica_gestor) || 0;
            devengadoTotal += montoCompensacion;
        });
    }
    
    // Restar rebajo a compensación
    if (rebajos && Array.isArray(rebajos)) {
        rebajos.forEach(rebajo => {
            const montoRebajo = parseFloat(rebajo.monto_rebajo_calculado) || 0;
            devengadoTotal -= montoRebajo;
        });
    }
    
    // Formatear según moneda
    let devengadoFormateado = "0";
    if (devengadoTotal > 0) {
        switch (empleado.moneda_pago_empleado_gestor?.toLowerCase()) {
            case 'dolares':
                devengadoFormateado = formatCurrency(devengadoTotal, 'dolares');
                break;
            case 'colones_y_dolares':
                devengadoFormateado = formatCurrency(devengadoTotal, 'colones');
                break;
            case 'colones':
            default:
                devengadoFormateado = formatCurrency(devengadoTotal, 'colones');
                break;
        }
    }
    
    return {
        monto: devengadoTotal,
        formateado: devengadoFormateado
    };
};

/**
 * Calcula el RTN neto total para un empleado (solo sobre compensación base)
 * @param {Object} empleado - Datos del empleado
 * @param {number} compensacionBase - Compensación base calculada
 * @returns {Object} Información del RTN neto total
 */
const calcularRTNNetoTotal = (empleado, compensacionBase) => {
    const rtInsEmpleado = parseInt(empleado.rt_ins_empleado_gestor) || 0;
    
    if (rtInsEmpleado !== 1) {
        return {
            monto: 0,
            formateado: "0",
            aplica: false
        };
    }
    
    if (!compensacionBase || compensacionBase <= 0) {
        return {
            monto: 0,
            formateado: "0",
            aplica: true
        };
    }
    
    // RTN es solo el 1% sobre la compensación base
    const rtnTotal = compensacionBase * 0.01;
    
    // Formatear según moneda
    let rtnFormateado = "0";
    if (rtnTotal > 0) {
        switch (empleado.moneda_pago_empleado_gestor?.toLowerCase()) {
            case 'dolares':
                rtnFormateado = formatCurrency(rtnTotal, 'dolares');
                break;
            case 'colones_y_dolares':
                rtnFormateado = formatCurrency(rtnTotal, 'colones'); // RTN se aplica en colones
                break;
            case 'colones':
            default:
                rtnFormateado = formatCurrency(rtnTotal, 'colones');
                break;
        }
    }
    
    return {
        monto: rtnTotal,
        formateado: rtnFormateado,
        aplica: true
    };
};

/**
 * Calcula las Cargas Sociales (S.T.I CCSS) para un empleado según el tipo de planilla
 * @param {Object} empleado - Datos del empleado
 * @returns {Object} Información de las Cargas Sociales
 */
const calcularCargasSociales = (empleado) => {
    const ccssEmpleado = parseInt(empleado.ccss_empleado_gestor) || 0;
    
    if (ccssEmpleado !== 1) {
        return {
            aplica: false,
            monto: 0,
            formateado: "0",
            descripcion: "No aplica"
        };
    }
    
    const montoAsegurado = parseFloat(empleado.montoAsegurado_gestor_empelado) || 0;
    
    if (montoAsegurado <= 0) {
        return {
            aplica: true,
            monto: 0,
            formateado: "0",
            descripcion: "Monto asegurado inválido"
        };
    }
    
    // Calcular S.T.I CCSS según el tipo de planilla del empleado
    const tipoPlanilla = empleado.tipo_planilla_empleado_gestor;
    let ccssCalculado = montoAsegurado;
    
    switch (tipoPlanilla?.toLowerCase()) {
        case 'mensual':
            // Para planilla mensual, se toma el monto completo
            ccssCalculado = montoAsegurado;
            break;
            
        case 'quincenal':
            // Para planilla quincenal, se divide el monto en 2
            ccssCalculado = montoAsegurado / 2;
            break;
            
        case 'semanal':
            // Para planilla semanal, se calcula según la ley costarricense
            // 52 semanas al año / 12 meses = 4.33 semanas por mes
            ccssCalculado = montoAsegurado * 4.33;
            break;
            
        default:
            // Si no se especifica tipo, se asume mensual
            ccssCalculado = montoAsegurado;
            break;
    }
    
    // Formatear según moneda
    let ccssFormateado = "0";
    if (ccssCalculado > 0) {
        switch (empleado.moneda_pago_empleado_gestor?.toLowerCase()) {
            case 'dolares':
                ccssFormateado = formatCurrency(ccssCalculado, 'dolares');
                break;
            case 'colones_y_dolares':
                ccssFormateado = formatCurrency(ccssCalculado, 'colones'); // S.T.I CCSS se aplica en colones
                break;
            case 'colones':
            default:
                ccssFormateado = formatCurrency(ccssCalculado, 'colones');
                break;
        }
    }
    
    return {
        aplica: true,
        monto: ccssCalculado,
        formateado: ccssFormateado,
        descripcion: `S.T.I CCSS sobre monto asegurado (${tipoPlanilla || 'mensual'})`
    };
};

/**
 * Calcula el total de una categoría específica
 * @param {Array} items - Array de items con montos
 * @param {string} amountField - Campo que contiene el monto
 * @returns {number} Total calculado
 */
const calculateTotal = (items, amountField) => {
    return items.reduce((sum, item) => {
        const amount = parseFloat(item[amountField] || 0);
        return sum + amount;
    }, 0);
};

/**
 * Genera el template HTML para el correo de planilla con cálculos mejorados
 * @param {Object} empleado - Datos del empleado
 * @param {Object} planilla - Datos de la planilla
 * @param {Array} aumentos - Array de aumentos del empleado
 * @param {Array} rebajos - Array de rebajos del empleado
 * @param {Array} horasExtras - Array de horas extras del empleado
 * @param {Array} compensacionMetrica - Array de compensación por métrica del empleado
 * @returns {string} HTML del correo
 */
const generatePlanillaEmailTemplate = (empleado, planilla, aumentos, rebajos, horasExtras, compensacionMetrica) => {
    const currencyType = empleado.moneda_pago_empleado_gestor || 'colones';
    const salarioBase = parseFloat(empleado.salario_base_empleado_gestor || 0);
    const tipoPlanilla = empleado.tipo_planilla_empleado_gestor || 'mensual';
    
    // Calcular compensación base usando la lógica de GenerarAplicadas.jsx
    const compensacionBaseCalculada = calcularCompensacionBase(salarioBase, tipoPlanilla);
    const compensacionBaseFormateada = formatearCompensacionBase(
        compensacionBaseCalculada,
        currencyType,
        salarioBase,
        tipoPlanilla
    );
    
    // Calcular devengado total usando la lógica de GenerarAplicadas.jsx
    const devengadoTotal = calcularDevengado(empleado, compensacionBaseCalculada, aumentos, horasExtras, compensacionMetrica, rebajos);
    
    // Calcular el salario normal según el tipo de planilla (ya con la fórmula aplicada)
    const salarioNormal = calcularCompensacionBase(salarioBase, tipoPlanilla);
    
    // Calcular RTN neto total
    const rtnNetoTotal = calcularRTNNetoTotal(empleado, compensacionBaseCalculada);
    
    // Calcular Cargas Sociales
    const cargasSociales = calcularCargasSociales(empleado);
    
    // Calcular totales usando la función helper
    const totalAumentos = calculateTotal(aumentos, 'monto_aumento_gestor');
    const totalRebajos = calculateTotal(rebajos, 'monto_rebajo_calculado');
    const totalHorasExtras = calculateTotal(horasExtras, 'monto_compensacion_calculado_gestor');
    const totalCompensacionMetrica = calculateTotal(compensacionMetrica, 'monto_compensacion_metrica_gestor');
    
    // El total neto debe ser el devengado total (que ya incluye la compensación base correcta)
    const totalNeto = devengadoTotal.monto;

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Planilla de Compensación - ${planilla.planilla_codigo}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f8f9fa;
                color: #333;
            }
            .container {
                max-width: 1000px;
                margin: 0 auto;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                position: relative;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
                font-size: 16px;
            }
            .employee-section {
                background-color: #f8f9fa;
                padding: 25px;
                border-bottom: 1px solid #e9ecef;
            }
            .employee-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-top: 20px;
            }
            .employee-info, .planilla-info {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                padding: 8px 0;
                border-bottom: 1px solid #f1f3f4;
            }
            .info-label {
                font-weight: 600;
                color: #495057;
                min-width: 140px;
            }
            .info-value {
                color: #212529;
                text-align: right;
                font-weight: 500;
            }
            .section-title {
                background: linear-gradient(135deg, #495057 0%, #6c757d 100%);
                color: white;
                padding: 18px;
                text-align: center;
                font-weight: 600;
                font-size: 18px;
                margin: 0;
            }
            .compensation-table {
                width: 100%;
                border-collapse: collapse;
                margin: 25px 0;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }
            .compensation-table th {
                background: linear-gradient(135deg, #495057 0%, #6c757d 100%);
                color: white;
                padding: 16px;
                text-align: left;
                font-weight: 600;
                font-size: 14px;
            }
            .compensation-table td {
                padding: 16px;
                border-bottom: 1px solid #e9ecef;
                font-size: 14px;
            }
            .compensation-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .compensation-table tr:hover {
                background-color: #e9ecef;
            }
            .positive-amount {
                color: #28a745;
                font-weight: 600;
            }
            .negative-amount {
                color: #dc3545;
                font-weight: 600;
            }
            .total-row {
                background: linear-gradient(135deg, #495057 0%, #6c757d 100%) !important;
                color: white;
                font-weight: 700;
                font-size: 16px;
            }
            .total-row:hover {
                background: linear-gradient(135deg, #495057 0%, #6c757d 100%) !important;
            }
            .footer {
                background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                color: white;
                padding: 20px;
                text-align: center;
                font-weight: 600;
                font-size: 14px;
            }
            .summary-box {
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #2196f3;
            }
            .summary-title {
                font-weight: 600;
                color: #1976d2;
                margin-bottom: 15px;
                font-size: 16px;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            .summary-item {
                background: white;
                padding: 12px;
                border-radius: 6px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            .summary-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
            }
            .summary-value {
                font-weight: 600;
                color: #333;
                font-size: 16px;
            }
            .salary-highlight {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .salary-highlight h3 {
                margin: 0 0 15px 0;
                font-size: 18px;
                font-weight: 600;
            }
            .salary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 15px;
            }
            .salary-item {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 6px;
                text-align: center;
            }
            .salary-label {
                font-size: 12px;
                opacity: 0.9;
                margin-bottom: 5px;
            }
            .salary-value {
                font-weight: 700;
                font-size: 18px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Planilla de Compensación</h1>
                <p>Detalles de su compensación ${tipoPlanilla}</p>
            </div>
            
            <!-- Resumen de Salarios (como en ModalDetalleEmpleado.jsx) -->
            <div class="salary-highlight">
                <h3>💰 Resumen de Compensación</h3>
                <div class="salary-grid">
                    <div class="salary-item">
                        <div class="salary-label">Compensación Normal</div>
                        <div class="salary-value">${formatCurrency(salarioNormal, currencyType)}</div>
                    </div>
                    <div class="salary-item">
                        <div class="salary-label">Compensación Base</div>
                        <div class="salary-value">${compensacionBaseFormateada}</div>
                    </div>
                    <div class="salary-item">
                        <div class="salary-label">Salario Devengado</div>
                        <div class="salary-value">${devengadoTotal.formateado}</div>
                    </div>
                    <div class="salary-item">
                        <div class="salary-label">Monto Neto</div>
                        <div class="salary-value">${devengadoTotal.formateado}</div>
                    </div>
                </div>
            </div>
            
            <div class="employee-section">
                <div class="employee-grid">
                    <div class="employee-info">
                        <h3 style="margin: 0 0 15px 0; color: #495057;">👤 Información del Empleado</h3>
                        <div class="info-row">
                            <span class="info-label">Código:</span>
                            <span class="info-value">${empleado.numero_socio_empleado_gestor}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Cédula:</span>
                            <span class="info-value">${empleado.cedula_empleado_gestor}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Nombre:</span>
                            <span class="info-value">${empleado.nombre_completo_empleado_gestor}</span>
                        </div>

                    </div>
                    
                    <div class="planilla-info">
                        <h3 style="margin: 0 0 15px 0; color: #495057;">📊 Información de Planilla</h3>
                        <div class="info-row">
                            <span class="info-label">Referencia:</span>
                            <span class="info-value">${planilla.planilla_codigo}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Tipo:</span>
                            <span class="info-value">${tipoPlanilla}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Moneda:</span>
                            <span class="info-value">${currencyType === 'colones' ? 'Colones (₡)' : 'Dólares ($)'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Cargas Sociales:</span>
                            <span class="info-value">${cargasSociales.formateado}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">RTN Neto:</span>
                            <span class="info-value">${rtnNetoTotal.formateado}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="summary-box">
                <div class="summary-title">📈 Desglose de Compensación</div>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Aumentos</div>
                        <div class="summary-value positive-amount">${formatCurrency(totalAumentos, currencyType)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Horas Extras</div>
                        <div class="summary-value positive-amount">${formatCurrency(totalHorasExtras, currencyType)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Compensación Métrica</div>
                        <div class="summary-value positive-amount">${formatCurrency(totalCompensacionMetrica, currencyType)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Deducciones</div>
                        <div class="summary-value negative-amount">${formatCurrency(totalRebajos, currencyType)}</div>
                    </div>
                </div>
            </div>
            
            <div class="section-title">
                📋 Detalle de Acciones de Personal
            </div>
            
            <div style="padding: 25px;">
                <table class="compensation-table">
                    <thead>
                        <tr>
                            <th>CATEGORÍA</th>
                            <th>TIPO DE ACCIÓN</th>
                            <th>MONTO</th>
                            <th>TIPO (+/-)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${aumentos.map(aumento => `
                            <tr>
                                <td>Compensación Anual</td>
                                <td>Aumento</td>
                                <td>${formatCurrency(parseFloat(aumento.monto_aumento_gestor || 0), currencyType)}</td>
                                <td class="positive-amount">+</td>
                            </tr>
                        `).join('')}
                        
                        ${horasExtras.map(extra => `
                            <tr>
                                <td>Compensación Extra</td>
                                <td>Ingreso</td>
                                <td>${formatCurrency(parseFloat(extra.monto_compensacion_calculado_gestor || 0), currencyType)}</td>
                                <td class="positive-amount">+</td>
                            </tr>
                        `).join('')}
                        
                        ${compensacionMetrica.map(metrica => `
                            <tr>
                                <td>Compensación por Métrica</td>
                                <td>Ingreso</td>
                                <td>${formatCurrency(parseFloat(metrica.monto_compensacion_metrica_gestor || 0), currencyType)}</td>
                                <td class="positive-amount">+</td>
                            </tr>
                        `).join('')}
                        
                        ${rebajos.map(rebajo => `
                            <tr>
                                <td>Rebajo a Compensación</td>
                                <td>Deducción</td>
                                <td>${formatCurrency(parseFloat(rebajo.monto_rebajo_calculado || 0), currencyType)}</td>
                                <td class="negative-amount">-</td>
                            </tr>
                        `).join('')}
                        
                        ${rtnNetoTotal.aplica && rtnNetoTotal.monto > 0 ? `
                            <tr>
                                <td>RTN</td>
                                <td>Deducción</td>
                                <td>${rtnNetoTotal.formateado}</td>
                                <td class="negative-amount">-</td>
                            </tr>
                        ` : ''}
                        
                        ${cargasSociales.aplica && cargasSociales.monto > 0 ? `
                            <tr>
                                <td>S.T.I CCSS</td>
                                <td>Deducción</td>
                                <td>${cargasSociales.formateado}</td>
                                <td class="negative-amount">-</td>
                            </tr>
                        ` : ''}
                        
                        <tr class="total-row">
                            <td colspan="2"><strong>Total Neto</strong></td>
                            <td><strong>${devengadoTotal.formateado}</strong></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="footer">
                🏢 ${empleado.nombre_comercial_empresa} - Sistema de Gestión de Compensaciones
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Envía un correo electrónico con la planilla de compensación
 * @param {Object} empleado - Datos del empleado
 * @param {Object} planilla - Datos de la planilla
 * @returns {Promise<Object>} Resultado del envío
 */
const sendPlanillaEmail = async (empleado, planilla) => {
    try {
        // Validar datos requeridos
        if (!empleado.correo_empleado_gestor) {
            throw new Error('Empleado no tiene correo configurado');
        }
        
        if (!isValidEmail(empleado.correo_empleado_gestor)) {
            throw new Error(`Email inválido: ${empleado.correo_empleado_gestor}`);
        }
        
        if (!planilla.planilla_codigo) {
            throw new Error('Planilla no tiene código válido');
        }
        
        console.log(`📧 Preparando planilla para: ${empleado.nombre_completo_empleado_gestor}`);
        console.log(`   - Correo: ${empleado.correo_empleado_gestor}`);
        console.log(`   - Planilla: ${planilla.planilla_codigo}`);
        
        const transporter = createTransporter();
        
        const mailOptions = {
            from: 'info@gt3cr.com',
            to: empleado.correo_empleado_gestor,
            subject: `Planilla de Compensación - ${planilla.planilla_codigo}`,
            html: generatePlanillaEmailTemplate(
                empleado, 
                planilla, 
                empleado.aumentos || [], 
                empleado.rebajos_compensacion || [], 
                empleado.horas_extras || [], 
                empleado.compensacion_metrica || []
            )
        };

        console.log(`📤 Enviando planilla...`);
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Planilla enviada exitosamente. Message ID: ${result.messageId}`);
        
        return {
            success: true,
            messageId: result.messageId,
            empleado: empleado.nombre_completo_empleado_gestor,
            correo: empleado.correo_empleado_gestor,
            planilla: planilla.planilla_codigo
        };
    } catch (error) {
        console.error(`❌ Error enviando planilla a ${empleado.nombre_completo_empleado_gestor}:`, error.message);
        return {
            success: false,
            error: error.message,
            empleado: empleado.nombre_completo_empleado_gestor,
            correo: empleado.correo_empleado_gestor,
            planilla: planilla.planilla_codigo
        };
    }
};

/**
 * Función de prueba para enviar una planilla de test
 * @param {string} emailDestino - Email de destino para la prueba
 * @returns {Promise<Object>} Resultado del envío de prueba
 */
const enviarPlanillaPrueba = async (emailDestino) => {
    try {
        // Datos de prueba para la planilla (usando el ejemplo exacto del usuario)
        const empleadoPrueba = {
            id_empleado_gestor: 100,
            numero_socio_empleado_gestor: 'GT100VE2WNM',
            nombre_completo_empleado_gestor: 'Roberto Segundo socio',
            correo_empleado_gestor: emailDestino,
            cedula_empleado_gestor: '1',
            salario_base_empleado_gestor: '320000',
            tipo_contrato_empleado_gestor: 'indefinido',
            tipo_planilla_empleado_gestor: 'quincenal',
            moneda_pago_empleado_gestor: 'colones',
            nombre_comercial_empresa: 'GT3',
            aumentos: [
                {
                    id_aumento_gestor: 13,
                    monto_aumento_gestor: '20000.00'
                }
            ],
            rebajos_compensacion: [
                {
                    id_rebajo_compensacion: 10,
                    monto_rebajo_calculado: '120000.00'
                }
            ],
            horas_extras: [
                {
                    id_compensacion_extra_gestor: 13,
                    monto_compensacion_calculado_gestor: '45000.00'
                }
            ],
            compensacion_metrica: [
                {
                    id_compensacion_metrica_gestor: 39,
                    monto_compensacion_metrica_gestor: '14000.00'
                }
            ]
        };

        const planillaPrueba = {
            planilla_codigo: 'PL₡-GT3-Quin-20250805-GHUH31'
        };

        console.log('🧪 Iniciando prueba de envío de planilla...');
        const resultado = await sendPlanillaEmail(empleadoPrueba, planillaPrueba);
        
        if (resultado.success) {
            console.log('✅ Prueba de planilla exitosa!');
            console.log(`   - Empleado: ${resultado.empleado}`);
            console.log(`   - Correo: ${resultado.correo}`);
            console.log(`   - Message ID: ${resultado.messageId}`);
        } else {
            console.error('❌ Prueba de planilla falló:', resultado.error);
        }
        
        return resultado;
    } catch (error) {
        console.error('❌ Error en prueba de planilla:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Queries para obtener datos de planilla
const QUERIES = {
    TRAER_TODOS_LOS_EMPLEADOS_DE_LA_EMPRESA: `
       SELECT 
          e.id_empleado_gestor,
          e.numero_socio_empleado_gestor,
          e.nombre_completo_empleado_gestor,
          e.correo_empleado_gestor,
          e.cedula_empleado_gestor,
          e.salario_base_empleado_gestor,
          e.tipo_contrato_empleado_gestor,
          e.supervisor_empleado_gestor,
          e.fecha_ingreso_empleado_gestor,
          e.fecha_salida_empleado_gestor,
          e.numero_asegurado_empleado_gestor,
          e.numero_ins_empleado_gestor,
          e.numero_hacienda_empleado_gestor,
          e.cuenta_bancaria_1_empleado_gestor,
          e.ministerio_hacienda_empleado_gestor,
          e.rt_ins_empleado_gestor,
          e.ccss_empleado_gestor,
          e.moneda_pago_empleado_gestor,
          e.estado_empleado_gestor,
          e.montoAsegurado_gestor_empelado,
          e.tipo_planilla_empleado_gestor,
          emp.nombre_comercial_empresa
       FROM gestor_empleado_tbl e
       JOIN empresas_tbl emp ON emp.id_empresa = e.id_empresa
       WHERE e.estado_empleado_gestor = 1
         AND (e.fecha_salida_empleado_gestor IS NULL OR e.fecha_salida_empleado_gestor = '')
         AND e.salario_base_empleado_gestor IS NOT NULL
         AND e.salario_base_empleado_gestor != ''
         AND e.id_empresa = ?
         AND e.moneda_pago_empleado_gestor = ?
         AND e.tipo_planilla_empleado_gestor = ?
       ORDER BY e.nombre_completo_empleado_gestor;
    `,
    
    AUMENTOS_TODOS: `
       SELECT * FROM gestor_aumento_tbl
       WHERE planilla_id_aumento_gestor = ? AND empresa_id_aumento_gestor = ? AND estado_planilla_aumento_gestor = "Procesada"
       ORDER BY empleado_id_aumento_gestor;
    `,
    
    REBAJOS_COMPENSACION_TODOS: `
       SELECT * FROM gestor_rebajo_compensacion_tbl
       WHERE planilla_id_rebajo = ? AND empresa_id_rebajo = ? AND estado_rebajo = "Procesada"
       ORDER BY empleado_id_rebajo;
    `,
    
    HORAS_EXTRAS_TODOS: `
       SELECT * FROM gestor_compensacion_extra_tbl
       WHERE planilla_id_compensacion_extra_gestor = ? AND empresa_id_compensacion_extra_gestor = ? AND estado_compensacion_extra_gestor = "Procesada"
       ORDER BY empleado_id_compensacion_extra_gestor;
    `,
    
    COMPENSACION_METRICA_TODOS: `
       SELECT * FROM gestor_compensacion_metrica_tbl
       WHERE planilla_id_compensacion_metrica_gestor = ? AND empresa_id_compensacion_metrica_gestor = ? AND estado_compensacion_metrica_gestor = "Procesada"
       ORDER BY empleado_id_compensacion_metrica_gestor;
    `,

    PLANILLAS_PROCESADAS: `
       SELECT * FROM planilla_tbl WHERE planilla_estado = "Procesada" AND empresa_id != 13 AND planilla_codigo='PL₡-GT3-Mens-20250805-AUU100'
    `,
};

/**
 * Ejecuta una consulta con timeout controlado
 */
const ejecutarConsultaConTimeout = async (query, params, database, timeout = 10000) => {
    try {
       const resultado = await Promise.race([
          realizarConsulta(query, params, database),
          new Promise((_, reject) => 
             setTimeout(() => reject(new Error(`Timeout en consulta después de ${timeout}ms`)), timeout)
          )
       ]);
       return resultado;
    } catch (error) {
       console.error(`Error en consulta con timeout: ${error.message}`);
       return { status: 500, error: error.message, datos: [] };
    }
};

/**
 * Procesa los datos adicionales (aumentos, rebajos, etc.) y los agrupa por empleado
 */
const procesarDatosAdicionales = (resultado, campoEmpleadoId) => {
    const mapa = new Map();
    if (resultado.status === 'fulfilled' && resultado.value?.datos) {
       resultado.value.datos.forEach(item => {
          try {
             const empleadoId = item[campoEmpleadoId];
             if (!mapa.has(empleadoId)) {
                mapa.set(empleadoId, []);
             }
             mapa.get(empleadoId).push(item);
          } catch (e) {
             console.warn(`Error procesando item para empleado ${item[campoEmpleadoId]}:`, e);
          }
       });
    }
    return mapa;
};

/**
 * Procesa una planilla completa
 */
const procesarPlanilla = async (planilla, database = 'pruebas') => {
  
    const datosPlanilla = {
       planilla_id: planilla.planilla_id,
       empresa_id: planilla.empresa_id,
       planilla_moneda: planilla.planilla_moneda,
       tipo_planilla: planilla.planilla_tipo
    };
    
    // 1. Obtener empleados
    const empleadosResultado = await ejecutarConsultaConTimeout(
       QUERIES.TRAER_TODOS_LOS_EMPLEADOS_DE_LA_EMPRESA, 
       [datosPlanilla.empresa_id, datosPlanilla.planilla_moneda, datosPlanilla.tipo_planilla], 
       database,
       15000
    );
    console.log('EMPLEADOS_RESULTADO:', empleadosResultado);
    
    if (empleadosResultado?.status === 500) {
       console.error('Error al obtener empleados para planilla:', planilla.planilla_codigo);
       return null;
    }

    const empleados = empleadosResultado.datos || [];
    console.log('EMPLEADOS:', empleados);
    
    // 2. Ejecutar consultas adicionales en paralelo
    const [aumentosResult, rebajosResult, horasExtrasResult, compensacionMetricaResult] = await Promise.allSettled([
       ejecutarConsultaConTimeout(QUERIES.AUMENTOS_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], database, 8000),
       ejecutarConsultaConTimeout(QUERIES.REBAJOS_COMPENSACION_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], database, 8000),
       ejecutarConsultaConTimeout(QUERIES.HORAS_EXTRAS_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], database, 8000),
       ejecutarConsultaConTimeout(QUERIES.COMPENSACION_METRICA_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], database, 8000)
    ]);
    console.log('AUMENTOS_RESULT:', aumentosResult.value.datos);
    console.log('REBAJOS_RESULT:', rebajosResult.value.datos);
    console.log('HORAS_EXTRAS_RESULT:', horasExtrasResult.value.datos);
    console.log('COMPENSACION_METRICA_RESULT:', compensacionMetricaResult.value.datos);

    
    // 4. Procesar y agrupar datos adicionales
    const aumentosMap = procesarDatosAdicionales(aumentosResult, 'empleado_id_aumento_gestor');
    const rebajosMap = procesarDatosAdicionales(rebajosResult, 'empleado_id_rebajo');
    const horasExtrasMap = procesarDatosAdicionales(horasExtrasResult, 'empleado_id_compensacion_extra_gestor');
    const compensacionMetricaMap = procesarDatosAdicionales(compensacionMetricaResult, 'empleado_id_compensacion_metrica_gestor');

    // 5. Combinar todos los datos
    const empleadosConDatosAdicionales = empleados.map(empleado => ({
       ...empleado,
       aumentos: aumentosMap.get(empleado.id_empleado_gestor) || [],
       rebajos_compensacion: rebajosMap.get(empleado.id_empleado_gestor) || [],
       horas_extras: horasExtrasMap.get(empleado.id_empleado_gestor) || [],
       compensacion_metrica: compensacionMetricaMap.get(empleado.id_empleado_gestor) || []
    }));
    
    // 6. Enviar correos a cada empleado
    console.log(`Enviando correos a ${empleadosConDatosAdicionales.length} empleados...`);
    
    const resultadosCorreos = [];
    for (const empleado of empleadosConDatosAdicionales) {
       if (empleado.correo_empleado_gestor) {
          console.log(`Enviando correo a: ${empleado.nombre_completo_empleado_gestor} (${empleado.correo_empleado_gestor})`);
          const resultadoCorreo = await sendPlanillaEmail(empleado, planilla);
          resultadosCorreos.push(resultadoCorreo);
          
          if (resultadoCorreo.success) {
             console.log(`✅ Correo enviado exitosamente a ${empleado.nombre_completo_empleado_gestor}`);
          } else {
             console.error(`❌ Error enviando correo a ${empleado.nombre_completo_empleado_gestor}: ${resultadoCorreo.error}`);
          }
       } else {
          console.warn(`⚠️ Empleado ${empleado.nombre_completo_empleado_gestor} no tiene correo configurado`);
       }
    }
    
    console.log(`Resumen de envío de correos: ${resultadosCorreos.filter(r => r.success).length}/${resultadosCorreos.length} exitosos`);
    
    return {
       empleados: empleadosConDatosAdicionales,
       resultadosCorreos: resultadosCorreos
    };
};

/**
 * Cronjob principal para planillas
 */
const iniciarCronJobPlanilla = () => {
    const tarea = cron.schedule('*/10 * * * * *', async () => {
        try {
            // Obtener planillas procesadas
            const planillasProcesadasResult = await ejecutarConsultaConTimeout(
                QUERIES.PLANILLAS_PROCESADAS, 
                [], 
                'pruebas',
                15000
            );
            
            if (planillasProcesadasResult?.status === 500) {
                console.error('Error al obtener planillas procesadas:', planillasProcesadasResult.error);
                return;
            }

            const planillasProcesadas = planillasProcesadasResult.datos || [];
            
            if (planillasProcesadas.length === 0) {
                console.log('No se encontraron planillas procesadas');
                return;
            }

            // Procesar cada planilla
            for (const planilla of planillasProcesadas) {
                console.log(`Procesando planilla: ${planilla.planilla_codigo}`);
                const resultado = await procesarPlanilla(planilla);
                
                if (resultado) {
                    console.log(`✅ Planilla procesada: ${planilla.planilla_codigo}`);
                    console.log(`📧 Correos enviados: ${resultado.resultadosCorreos.filter(r => r.success).length}/${resultado.resultadosCorreos.length}`);
                    
                    // Mostrar resumen de correos enviados
                    resultado.resultadosCorreos.forEach(resultadoCorreo => {
                        if (resultadoCorreo.success) {
                            console.log(`  ✅ ${resultadoCorreo.empleado} - ${resultadoCorreo.correo}`);
                        } else {
                            console.log(`  ❌ ${resultadoCorreo.empleado} - ${resultadoCorreo.error}`);
                        }
                    });
                } else {
                    console.error(`❌ Error procesando planilla: ${planilla.planilla_codigo}`);
                }

                console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=');
            }
            
        } catch (error) {
            console.error('Error en cron job planilla:', error);
        }
    });

    tarea.start();
};

export { sendPlanillaEmail, enviarPlanillaPrueba, iniciarCronJobPlanilla, procesarPlanilla, calcularCompensacionBase };

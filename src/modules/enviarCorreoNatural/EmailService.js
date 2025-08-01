import nodemailer from 'nodemailer';
import { realizarConsulta } from "../../mysql2-promise/mysql2-promise.js";

/**
 * Configuración del transportador de correo para Hostinger
 */
const createTransporter = () => {
    return nodemailer.createTransport({
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
 * Genera el template HTML para el correo de compensación
 * @param {Object} empleado - Datos del empleado
 * @param {Object} planilla - Datos de la planilla
 * @returns {string} HTML del correo
 */
const generateEmailTemplate = (empleado, planilla) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Remuneración OPU SAL</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #2c3e50;
                color: white;
                padding: 15px;
                text-align: center;
                font-size: 18px;
                font-weight: bold;
            }
            .content {
                padding: 0;
            }
            .info-section {
                background-color: white;
                padding: 20px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
            }
            .info-label {
                font-weight: bold;
                color: black;
            }
            .info-value {
                color: black;
            }
            .section-header {
                background-color: #2c3e50;
                color: white;
                padding: 10px;
                text-align: center;
                font-weight: bold;
                font-size: 16px;
                margin: 0;
            }
            .desglose-section {
                background-color: white;
                padding: 20px;
            }
            .desglose-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #ddd;
                font-size: 14px;
            }
            .desglose-label {
                color: black;
                font-weight: 500;
            }
            .desglose-value {
                color: black;
                font-weight: bold;
                text-align: right;
            }
            .total-row {
                border-bottom: 2px solid #2c3e50;
                font-weight: bold;
                font-size: 16px;
            }
            .footer {
                background-color: #6c757d;
                color: white;
                padding: 15px;
                text-align: center;
                font-weight: bold;
                font-size: 16px;
            }
            .copy-icon {
                float: right;
                cursor: pointer;
                font-size: 16px;
                color: black;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                REMUNERACIÓN OPU SAL
            </div>
            
            <div class="content">
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-label">Remuneración #</span>
                        <span class="info-value">${planilla.planilla_codigo} <span class="copy-icon">📋</span></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nombre:</span>
                        <span class="info-value">${empleado.nombre_empleado} ${empleado.apellidos_empleado} <span class="copy-icon">📋</span></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cedula:</span>
                        <span class="info-value">${empleado.cedula_empleado} <span class="copy-icon">📋</span></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Puesto:</span>
                        <span class="info-value">${empleado.puesto_empleado || 'Técnico Ambiental'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Numero de asegurado:</span>
                        <span class="info-value">${empleado.numero_asegurado || '111111111'} <span class="copy-icon">📋</span></span>
                    </div>
                </div>
                
                <div class="section-header">
                    Desgloce de remuneración
                </div>
                
                <div class="desglose-section">
                    <div class="desglose-row">
                        <span class="desglose-label">Remuneración Bruta:</span>
                        <span class="desglose-value">${formatCurrency(empleado.remuneracion_bruta_epd || 0)}</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-label">FCL 1,5% ROB 3,25%:</span>
                        <span class="desglose-value">${formatCurrency((empleado.fcl_1_5_epd || 0))}</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-label">Rebajos de Cliente:</span>
                        <span class="desglose-value">${formatCurrency(empleado.rebajos_cliente_epd || 0)}</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-label">Reintegro de Cliente:</span>
                        <span class="desglose-value">${formatCurrency(empleado.reintegro_cliente_epd || 0)}</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-label">Depósito X Recurso:</span>
                        <span class="desglose-value">${formatCurrency(empleado.deposito_x_tecurso_epd || 0)}</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-label">Cuota CC.SS:</span>
                        <span class="desglose-value">${formatCurrency(empleado.cuota_ccss_epd || 0)}</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-label">Rebajos OPU:</span>
                        <span class="desglose-value">${formatCurrency(empleado.rebajos_opu_epd || 0)}</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-label">Reintegros OPU:</span>
                        <span class="desglose-value">${formatCurrency(empleado.reintegro_opu_epd || 0)}</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-label">Total de Deducciones:</span>
                        <span class="desglose-value">${formatCurrency(empleado.total_deducciones_epd || 0)}</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-label">Total de Reintegros:</span>
                        <span class="desglose-value">${formatCurrency(empleado.total_reintegros_epd || 0)}</span>
                    </div>
                    <div class="desglose-row total-row">
                        <span class="desglose-label">Remuneración Neta:</span>
                        <span class="desglose-value">${formatCurrency(empleado.remuneracion_neta_epd || 0)}</span>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                Aplicado
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Actualiza el estado de correo enviado en la base de datos
 * @param {Object} database - Conexión a la base de datos
 * @param {number} empleadoId - ID del empleado
 * @param {number} planillaId - ID de la planilla
 * @returns {Promise<Object>} Resultado de la actualización
 */
const actualizarCorreoEnviado = async (database, empleadoId, planillaId) => {
    try {
        const query = `
            UPDATE empleado_planilla_detalle_tbl 
            SET correo_enviado = 1 
            WHERE id_empleado_epd = ? AND planilla_id_epd = ?
        `;
        
        const resultado = await realizarConsulta(query, [empleadoId, planillaId], database);
        return {
            success: true,
            resultado: resultado
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Envía un correo electrónico a un empleado y actualiza el estado en la base de datos
 * @param {Object} empleado - Datos del empleado
 * @param {Object} planilla - Datos de la planilla
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado del envío
 */
const sendEmployeeEmail = async (empleado, planilla, database) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: 'info@gt3cr.com',
            to: empleado.correo_empleado,
            subject: `Detalles de Compensación - ${planilla.planilla_codigo}`,
            html: generateEmailTemplate(empleado, planilla),
            attachments: []
        };

        const result = await transporter.sendMail(mailOptions);
        
        // Si el correo se envió exitosamente, actualizar la base de datos
        const actualizacionResult = await actualizarCorreoEnviado(
            database, 
            empleado.id_empleado, 
            planilla.planilla_id
        );
        
        return {
            success: true,
            messageId: result.messageId,
            empleado: `${empleado.nombre_empleado} ${empleado.apellidos_empleado}`,
            correo: empleado.correo_empleado,
            dbUpdate: actualizacionResult
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            empleado: `${empleado.nombre_empleado} ${empleado.apellidos_empleado}`,
            correo: empleado.correo_empleado
        };
    }
};

export { sendEmployeeEmail, actualizarCorreoEnviado };
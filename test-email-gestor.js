import { enviarCorreoPrueba } from './src/modules/enviarCorreoGestor/enviarCorreoGestor.js';

/**
 * Script de prueba para el sistema de envío de correos del gestor
 * 
 * Uso: node test-email-gestor.js [email-destino]
 * 
 * Ejemplo: node test-email-gestor.js tu-email@ejemplo.com
 */

const main = async () => {
    // Obtener email de destino desde argumentos de línea de comandos
    const emailDestino = process.argv[2];
    
    if (!emailDestino) {
        console.error('❌ Error: Debes proporcionar un email de destino');
        console.log('Uso: node test-email-gestor.js tu-email@ejemplo.com');
        process.exit(1);
    }
    
    console.log('🚀 Iniciando prueba del sistema de correos del gestor...');
    console.log(`📧 Email de destino: ${emailDestino}`);
    console.log('='.repeat(60));
    
    try {
        const resultado = await enviarCorreoPrueba(emailDestino);
        
        console.log('='.repeat(60));
        if (resultado.success) {
            console.log('🎉 ¡Prueba completada exitosamente!');
            console.log(`✅ Correo enviado a: ${resultado.correo}`);
            console.log(`📋 Message ID: ${resultado.messageId}`);
            console.log(`👤 Empleado: ${resultado.empleado}`);
            console.log(`📄 Planilla: ${resultado.planilla}`);
        } else {
            console.log('❌ La prueba falló');
            console.log(`🔍 Error: ${resultado.error}`);
        }
    } catch (error) {
        console.error('💥 Error inesperado:', error.message);
    }
    
    console.log('='.repeat(60));
    console.log('🏁 Fin de la prueba');
};

// Ejecutar la prueba
main().catch(console.error);

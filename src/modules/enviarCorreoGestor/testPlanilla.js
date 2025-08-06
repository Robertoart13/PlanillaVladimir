import { enviarPlanillaPrueba } from './enviarCorreoPlanilla.js';

/**
 * Función de prueba para verificar el envío de planillas
 */
const testPlanilla = async () => {
    try {
        console.log('🧪 Iniciando prueba de planilla...');
        
        // Email de prueba
        const emailPrueba = 'carlosroart13@gmail.com';
        
        const resultado = await enviarPlanillaPrueba(emailPrueba);
        
        if (resultado.success) {
            console.log('✅ Prueba exitosa!');
            console.log(`   - Message ID: ${resultado.messageId}`);
            console.log(`   - Empleado: ${resultado.empleado}`);
            console.log(`   - Correo: ${resultado.correo}`);
        } else {
            console.error('❌ Prueba falló:', resultado.error);
        }
        
        return resultado;
    } catch (error) {
        console.error('❌ Error en prueba:', error.message);
        return { success: false, error: error.message };
    }
};

// Ejecutar prueba si el archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testPlanilla();
}

export { testPlanilla };

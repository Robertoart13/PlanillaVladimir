import { ejecutarCronjobGestor, detenerCronjobGestor, verificarEstadoCronjob } from './src/modules/enviarCorreoGestor/enviarCorreoGestor.js';

/**
 * Script de prueba para el cronjob de gestor
 * @description Ejecuta el cronjob por 30 segundos y luego lo detiene
 */
const testCronjobGestor = async () => {
    console.log('🚀 Iniciando prueba del cronjob de gestor...\n');
    
    try {
        // Iniciar el cronjob
        console.log('1️⃣ Iniciando cronjob de gestor...');
        const resultado = ejecutarCronjobGestor();
        
        if (resultado.success) {
            console.log('✅ Cronjob iniciado exitosamente');
            console.log(`📝 Mensaje: ${resultado.message}\n`);
            
            // Verificar estado inicial
            console.log('2️⃣ Verificando estado inicial...');
            const estadoInicial = verificarEstadoCronjob(resultado.task);
            console.log(`📊 Estado inicial: ${estadoInicial.message}\n`);
            
            // El cronjob se ejecutará cada 5 segundos
            console.log('3️⃣ El cronjob se ejecutará cada 5 segundos...');
            console.log('⏰ Esperando 30 segundos para ver las ejecuciones...\n');
            
            // Detener después de 30 segundos
            setTimeout(() => {
                console.log('4️⃣ Deteniendo cronjob después de 30 segundos...');
                const resultadoDetener = detenerCronjobGestor(resultado.task);
                
                if (resultadoDetener.success) {
                    console.log('✅ Cronjob detenido exitosamente');
                    console.log(`📝 Mensaje: ${resultadoDetener.message}`);
                } else {
                    console.log('❌ Error al detener el cronjob');
                    console.log(`📝 Error: ${resultadoDetener.error}`);
                }
                
                console.log('\n🏁 Prueba completada');
                process.exit(0);
            }, 30000); // 30 segundos
            
        } else {
            console.log('❌ Error al iniciar el cronjob');
            console.log(`📝 Error: ${resultado.error}`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Error inesperado:', error.message);
        process.exit(1);
    }
};

// Ejecutar la prueba
testCronjobGestor(); 
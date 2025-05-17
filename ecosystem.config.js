module.exports = {
    apps: [
      {
        name: 'hrk',
        script: 'index.js',        // punto de entrada
        exec_mode: 'fork',         // o 'cluster' si lo necesitas
        instances: 1,
        watch: true,               // vigila los archivos
        ignore_watch: ['node_modules', 'logs'],
        autorestart: true,         // si el proceso muere se levanta solo
        max_restarts: 10,          // evita bucles infinitos
        env: {
          NODE_ENV: 'production'
        }
      }
    ]
  };
  
-- Script para crear la tabla de vacaciones sin el campo planilla_id
CREATE TABLE `gestor_vacaciones_tbl` (
  `id_vacacion_vacaciones_gestor` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ID único del registro de vacaciones',
  `empresa_id_vacaciones_gestor` INT(10) UNSIGNED NOT NULL COMMENT 'ID empresa (FK)',
  `empleado_id_vacaciones_gestor` INT(10) UNSIGNED NOT NULL COMMENT 'ID empleado (FK)',
  `fecha_inicio_vacaciones_gestor` DATE NOT NULL COMMENT 'Fecha de inicio de vacaciones',
  `dias_vacaciones_vacaciones_gestor` DECIMAL(5,2) NOT NULL COMMENT 'Cantidad de días de vacaciones',
  `motivo_vacaciones_gestor` TEXT DEFAULT NULL COMMENT 'Motivo u observaciones',
  `estado_vacaciones_gestor` ENUM('Pendiente', 'Aprobado', 'Aplicado', 'Cancelado') NOT NULL DEFAULT 'Pendiente' COMMENT 'Estado del registro',
  `activo_vacaciones_gestor` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico: 1=Activo, 0=Inactivo',
  `usuario_id_vacaciones_gestor` INT(11) NOT NULL COMMENT 'Usuario que registró',
  `fecha_creacion_vacaciones_gestor` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion_vacaciones_gestor` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_vacacion_vacaciones_gestor`),
  CONSTRAINT `fk_vacaciones_empresa` FOREIGN KEY (`empresa_id_vacaciones_gestor`) REFERENCES `empresas_tbl` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vacaciones_empleado` FOREIGN KEY (`empleado_id_vacaciones_gestor`) REFERENCES `gestor_empleado_tbl` (`id_empleado_gestor`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de períodos de vacaciones por empleado'; 
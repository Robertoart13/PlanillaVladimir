-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 195.35.61.14    Database: u732776653_sistema
-- ------------------------------------------------------
-- Server version	5.5.5-10.11.10-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cuentas_iban_tbl`
--

DROP TABLE IF EXISTS `cuentas_iban_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuentas_iban_tbl` (
  `id_cuenta_iban` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único de la cuenta IBAN',
  `id_empleado` int(10) unsigned NOT NULL COMMENT 'FK a empleados_tbl',
  `numero_cuenta_iban` varchar(50) NOT NULL COMMENT 'Número de cuenta IBAN',
  `fecha_creacion_cuenta_iban` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación del registro',
  `fecha_modificacion_cuenta_iban` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Fecha última modificación del registro',
  PRIMARY KEY (`id_cuenta_iban`),
  KEY `fk_cuenta_empleado` (`id_empleado`),
  CONSTRAINT `fk_cuenta_empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleados_tbl` (`id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_cuentaiban_empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleados_tbl` (`id_empleado`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cuentas IBAN asociadas a empleados, permitiendo múltiples cuentas por empleado';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuentas_iban_tbl`
--

LOCK TABLES `cuentas_iban_tbl` WRITE;
/*!40000 ALTER TABLE `cuentas_iban_tbl` DISABLE KEYS */;
INSERT INTO `cuentas_iban_tbl` VALUES (60,20,'200010680378720','2025-06-04 22:51:01','2025-06-04 22:51:01'),(64,25,'200010680457808','2025-06-04 23:44:27','2025-06-04 23:44:27'),(67,27,'200020760201120','2025-06-07 19:13:48','2025-06-07 19:13:48'),(68,28,'Banco Popular','2025-06-07 19:20:58','2025-06-07 19:20:58'),(69,29,'200010680419205','2025-06-07 19:38:04','2025-06-07 19:38:04'),(70,30,'200010680545600','2025-06-07 20:03:40','2025-06-07 20:03:40'),(71,31,'200010006110304','2025-06-07 20:16:04','2025-06-07 20:16:04'),(74,34,'200010680326223','2025-06-07 20:43:09','2025-06-07 20:43:09'),(77,36,'200010680522430','2025-06-07 21:09:17','2025-06-07 21:09:17'),(78,35,'200010680264627','2025-06-08 04:27:16','2025-06-08 04:27:16'),(80,38,'200010680236364','2025-06-08 05:05:11','2025-06-08 05:05:11'),(81,39,'200010680385661','2025-06-08 05:11:57','2025-06-08 05:11:57'),(82,40,'200010680316830','2025-06-08 05:17:11','2025-06-08 05:17:11'),(83,41,'200011390535305','2025-06-08 05:20:47','2025-06-08 05:20:47'),(84,42,'200010760250023','2025-06-08 05:29:52','2025-06-08 05:29:52'),(85,43,'200011390536662','2025-06-08 05:38:41','2025-06-08 05:38:41'),(86,44,'200010680499667','2025-06-08 05:42:58','2025-06-08 05:42:58'),(87,45,'200-01-068-052343-6','2025-06-08 12:15:16','2025-06-08 12:15:16'),(88,46,'200010680541639','2025-06-08 12:18:38','2025-06-08 12:18:38'),(94,26,'','2025-06-08 13:08:56','2025-06-08 13:08:56'),(96,22,'200-01-068-043347-0','2025-06-08 13:19:06','2025-06-08 13:19:06'),(98,23,'212121221212121212','2025-06-21 03:40:52','2025-06-21 03:40:52'),(99,19,'200010680501734','2025-06-21 08:01:12','2025-06-21 08:01:12'),(100,19,'001122','2025-06-21 08:01:13','2025-06-21 08:01:13'),(103,51,'CR06010200009115004860','2025-06-27 14:50:12','2025-06-27 14:50:12'),(104,51,'CR6901020000904574452','2025-06-27 14:50:12','2025-06-27 14:50:12'),(105,47,'200010680542040','2025-06-28 13:36:32','2025-06-28 13:36:32'),(106,48,'200011390528929','2025-06-28 13:36:50','2025-06-28 13:36:50'),(107,49,'200010680282382','2025-06-28 13:38:04','2025-06-28 13:38:04'),(109,24,'12345','2025-07-05 23:53:14','2025-07-05 23:53:14'),(110,24,'12345678','2025-07-05 23:53:14','2025-07-05 23:53:14'),(113,32,'200010680523649','2025-07-07 15:35:54','2025-07-07 15:35:54'),(114,21,'200010680265879','2025-07-07 15:37:05','2025-07-07 15:37:05'),(115,33,'200010680418527','2025-07-07 15:38:18','2025-07-07 15:38:18'),(116,37,'200010680544948','2025-07-07 15:39:20','2025-07-07 15:39:20'),(117,50,'200-01-068-048945-9','2025-07-07 15:41:32','2025-07-07 15:41:32'),(118,52,'200-01-068-048945-9','2025-07-07 16:41:11','2025-07-07 16:41:11');
/*!40000 ALTER TABLE `cuentas_iban_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamentos_tbl`
--

DROP TABLE IF EXISTS `departamentos_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamentos_tbl` (
  `id_departamento` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único del departamento',
  `nombre_departamento` varchar(100) NOT NULL COMMENT 'Nombre del departamento (ej. Finanzas, IT)',
  `estado_departamento` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_departamento`),
  UNIQUE KEY `nombre_departamento` (`nombre_departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de departamentos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos_tbl`
--

LOCK TABLES `departamentos_tbl` WRITE;
/*!40000 ALTER TABLE `departamentos_tbl` DISABLE KEYS */;
INSERT INTO `departamentos_tbl` VALUES (7,'Supervisión de Campo',1),(8,'Operaciones',1),(9,'Mantenimiento',1),(10,'Seguridad',1),(11,'Logística',1),(12,'Agronomía',1),(13,'Producción',1),(14,'Medio Ambiente',1),(15,'Calidad',1),(16,'Administración',1),(17,'Recursos Humanos',1),(18,'Transporte',1);
/*!40000 ALTER TABLE `departamentos_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleado_planilla_detalle_tbl`
--

DROP TABLE IF EXISTS `empleado_planilla_detalle_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleado_planilla_detalle_tbl` (
  `id_epd` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único del detalle de planilla por empleado',
  `id_empleado_epd` int(10) unsigned NOT NULL COMMENT 'FK al empleado al que pertenece este registro',
  `id_empresa_epd` int(10) unsigned NOT NULL COMMENT 'FK a la empresa donde labora el empleado',
  `planilla_id_epd` int(11) NOT NULL COMMENT 'FK a la planilla correspondiente a este cálculo',
  `id_usuario_creador_epd` int(11) NOT NULL COMMENT 'FK al usuario del sistema que creó este detalle de planilla',
  `semana_epd` varchar(20) NOT NULL COMMENT 'Semana correspondiente al cálculo (ejemplo: 2025-W22)',
  `remuneracion_bruta_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Remuneración bruta del empleado para la semana',
  `fcl_1_5_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Aporte al FCL (Fondo de Capitalización Laboral) 1.5%',
  `rob_3_25_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Aporte al Régimen Obligatorio de Pensiones 3.25%',
  `rebajos_cliente_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Rebajos aplicados por el cliente al empleado',
  `cuota_ccss_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Cuota correspondiente a la CCSS del empleado',
  `rebajos_opu_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Rebajos aplicados por OPU (otros descuentos autorizados)',
  `reintegro_cliente_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Reintegro al empleado por parte del cliente',
  `reintegro_opu_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Reintegro al empleado por parte de OPU (otros)',
  `deposito_x_tecurso_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Depósito adicional por parte del recurso',
  `total_deducciones_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Suma total de deducciones aplicadas al empleado',
  `total_reintegros_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Suma total de reintegros otorgados al empleado',
  `remuneracion_neta_epd` decimal(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Remuneración neta después de deducciones y reintegros',
  `estado_epd` enum('pendiente','verificado') NOT NULL DEFAULT 'pendiente' COMMENT 'Estado de verificación del registro',
  `marca_epd` int(1) DEFAULT 1,
  `fecha_creacion_epd` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación del detalle de planilla',
  `fecha_modificacion_epd` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Última fecha de modificación del detalle',
  `marca_aplicado_epd` int(1) DEFAULT 0,
  PRIMARY KEY (`id_epd`),
  KEY `fk_epd_empleado` (`id_empleado_epd`),
  KEY `fk_epd_empresa` (`id_empresa_epd`),
  KEY `fk_epd_planilla` (`planilla_id_epd`),
  KEY `fk_epd_usuario` (`id_usuario_creador_epd`),
  CONSTRAINT `fk_epd_empleado` FOREIGN KEY (`id_empleado_epd`) REFERENCES `empleados_tbl` (`id_empleado`),
  CONSTRAINT `fk_epd_empresa` FOREIGN KEY (`id_empresa_epd`) REFERENCES `empresas_tbl` (`id_empresa`),
  CONSTRAINT `fk_epd_planilla` FOREIGN KEY (`planilla_id_epd`) REFERENCES `planilla_tbl` (`planilla_id`),
  CONSTRAINT `fk_epd_usuario` FOREIGN KEY (`id_usuario_creador_epd`) REFERENCES `usuarios_tbl` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de detalle semanal de planilla por empleado';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleado_planilla_detalle_tbl`
--

LOCK TABLES `empleado_planilla_detalle_tbl` WRITE;
/*!40000 ALTER TABLE `empleado_planilla_detalle_tbl` DISABLE KEYS */;
INSERT INTO `empleado_planilla_detalle_tbl` VALUES (70,19,13,28,4,'22',1500.00,1500.00,0.00,1500.00,1500.00,1500.00,1500.00,1500.00,1500.00,1500.00,1500.00,1500.00,'pendiente',1,'2025-07-06 23:28:58','2025-07-06 23:28:58',0),(71,20,13,28,4,'27',1500.00,1500.00,0.00,1500.00,1500.00,1500.00,1500.00,1500.00,3000.00,4500.00,3000.00,1500.00,'pendiente',1,'2025-07-06 23:31:41','2025-07-06 23:42:46',1),(72,21,13,28,4,'27',1500.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,1500.00,0.00,0.00,1500.00,'pendiente',1,'2025-07-06 23:35:06','2025-07-06 23:42:44',1),(73,22,13,28,4,'27',0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,'pendiente',1,'2025-07-06 23:40:23','2025-07-06 23:42:40',1),(74,19,13,29,4,'27',150000.00,0.00,0.00,50000.00,0.00,0.00,0.00,0.00,100000.00,50000.00,0.00,100000.00,'pendiente',0,'2025-07-07 00:18:32','2025-07-07 15:19:50',0),(75,19,13,33,4,'28',102002.50,0.00,0.00,0.00,0.00,0.00,96365.00,0.00,198367.50,0.00,96365.00,198367.50,'pendiente',1,'2025-07-07 17:30:15','2025-07-07 17:30:15',0),(76,20,13,33,4,'28',162450.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,162450.00,0.00,0.00,162450.00,'pendiente',1,'2025-07-07 17:30:37','2025-07-07 17:56:42',1),(77,22,13,33,4,'28',121558.00,0.00,0.00,10000.00,0.00,0.00,0.00,0.00,111558.00,10000.00,0.00,111558.00,'pendiente',1,'2025-07-07 17:34:03','2025-07-07 17:54:09',1),(78,25,13,33,4,'28',277002.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,277002.00,0.00,0.00,277002.00,'pendiente',1,'2025-07-07 17:35:12','2025-07-07 17:54:06',1),(79,26,13,33,4,'28',150000.00,0.00,0.00,0.00,0.00,0.00,31980.00,0.00,181980.00,0.00,31980.00,181980.00,'pendiente',1,'2025-07-07 17:36:09','2025-07-07 17:36:09',0),(80,27,13,33,4,'28',92378.40,0.00,0.00,0.00,0.00,0.00,0.00,0.00,92378.40,0.00,0.00,92378.40,'pendiente',1,'2025-07-07 17:37:33','2025-07-07 17:53:59',1),(81,28,13,33,4,'28',129996.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,129996.00,0.00,0.00,129996.00,'pendiente',1,'2025-07-07 17:38:11','2025-07-07 17:56:39',1),(82,29,13,33,4,'28',121236.80,0.00,0.00,0.00,0.00,0.00,0.00,0.00,121236.80,0.00,0.00,121236.80,'pendiente',1,'2025-07-07 17:38:52','2025-07-07 17:54:03',1),(83,30,13,33,4,'28',79000.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,79000.00,0.00,0.00,79000.00,'pendiente',1,'2025-07-07 17:39:23','2025-07-07 17:54:01',1),(84,34,13,33,4,'28',121066.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,121066.00,0.00,0.00,121066.00,'pendiente',1,'2025-07-07 17:40:52','2025-07-07 17:40:52',0),(85,35,13,33,4,'28',44659.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,44659.00,0.00,0.00,44659.00,'pendiente',1,'2025-07-07 17:41:15','2025-07-07 17:54:15',1),(86,36,13,33,4,'28',73420.80,0.00,0.00,0.00,0.00,0.00,0.00,0.00,73420.80,0.00,0.00,73420.80,'pendiente',1,'2025-07-07 17:41:44','2025-07-07 17:56:48',1),(87,38,13,33,4,'28',150000.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,150000.00,0.00,0.00,150000.00,'pendiente',1,'2025-07-07 17:42:21','2025-07-07 17:42:21',0),(88,39,13,33,4,'28',88033.20,0.00,0.00,0.00,0.00,0.00,0.00,0.00,88033.20,0.00,0.00,88033.20,'pendiente',1,'2025-07-07 17:43:10','2025-07-07 17:54:18',1),(89,40,13,33,4,'28',152220.00,0.00,0.00,0.00,0.00,0.00,19438.00,0.00,171658.00,0.00,19438.00,171658.00,'pendiente',1,'2025-07-07 17:43:57','2025-07-07 17:56:53',1),(90,41,13,33,4,'28',150000.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,150000.00,0.00,0.00,150000.00,'pendiente',1,'2025-07-07 17:44:27','2025-07-07 17:54:25',1),(91,42,13,33,4,'28',80302.80,0.00,0.00,0.00,0.00,0.00,0.00,0.00,80302.80,0.00,0.00,80302.80,'pendiente',1,'2025-07-07 17:47:48','2025-07-07 17:54:28',1),(92,43,13,33,4,'28',94100.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,94100.00,0.00,0.00,94100.00,'pendiente',1,'2025-07-07 17:48:16','2025-07-07 17:56:55',1),(93,44,13,33,4,'28',147944.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,147944.00,0.00,0.00,147944.00,'pendiente',1,'2025-07-07 17:48:47','2025-07-07 17:54:31',1),(94,45,13,33,4,'28',82500.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,82500.00,0.00,0.00,82500.00,'pendiente',1,'2025-07-07 17:49:21','2025-07-07 17:49:21',0),(95,46,13,33,4,'28',153900.00,0.00,0.00,0.00,0.00,0.00,0.00,0.00,153900.00,0.00,0.00,153900.00,'pendiente',1,'2025-07-07 17:49:45','2025-07-07 17:54:49',1);
/*!40000 ALTER TABLE `empleado_planilla_detalle_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleados_tbl`
--

DROP TABLE IF EXISTS `empleados_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleados_tbl` (
  `id_empleado` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único del empleado',
  `nombre_empleado` varchar(100) DEFAULT NULL COMMENT 'Nombre(s) del empleado',
  `apellidos_empleado` varchar(100) DEFAULT NULL COMMENT 'Apellidos del empleado',
  `cedula_empleado` varchar(20) DEFAULT NULL COMMENT 'Número de cédula',
  `fecha_vencimiento_cedula_empleado` date DEFAULT NULL COMMENT 'Fecha de vencimiento de la cédula',
  `fecha_nacimiento_empleado` date DEFAULT NULL COMMENT 'Fecha de nacimiento',
  `estado_civil_empleado` varchar(20) DEFAULT NULL COMMENT 'Estado civil (soltero, casado, etc.)',
  `correo_empleado` varchar(150) DEFAULT NULL COMMENT 'Correo electrónico',
  `telefono_empleado` varchar(20) DEFAULT NULL COMMENT 'Teléfono de contacto',
  `direccion_empleado` varchar(255) DEFAULT NULL COMMENT 'Dirección física',
  `fecha_ingreso_empleado` date DEFAULT NULL COMMENT 'Fecha de ingreso a la empresa',
  `fecha_salida_empleado` varchar(11) DEFAULT NULL COMMENT 'Fecha de salida o baja del empleado',
  `jornada_laboral_empleado` varchar(50) DEFAULT NULL COMMENT 'Tipo de jornada laboral (completa, parcial, etc.)',
  `horario_empleado` varchar(100) DEFAULT NULL COMMENT 'Horario específico de trabajo',
  `salario_empleado` varchar(50) DEFAULT NULL COMMENT 'Salario (varchar para evitar decimales)',
  `id_nacionalidad` int(10) unsigned DEFAULT NULL COMMENT 'FK a nacionalidades_tbl',
  `id_tipo_contrato` int(10) unsigned DEFAULT NULL COMMENT 'FK a tipos_contrato_tbl',
  `id_departamento` int(10) unsigned DEFAULT NULL COMMENT 'FK a departamentos_tbl',
  `id_puesto` int(10) unsigned DEFAULT NULL COMMENT 'FK a puestos_tbl',
  `id_supervisor` int(11) DEFAULT NULL COMMENT 'FK a usuarios_tbl para el supervisor directo',
  `id_empresa` int(10) unsigned DEFAULT NULL COMMENT 'FK a empresas_tbl para saber en qué empresa trabaja',
  `estado_empleado` int(11) NOT NULL DEFAULT 1,
  `ministerio_hacienda_empleado` int(11) DEFAULT 0,
  `rt_ins_empleado` int(11) DEFAULT 0,
  `caja_costarricense_seguro_social_empleado` int(11) DEFAULT 0,
  `asegurado_empleado` varchar(45) DEFAULT '0',
  `fecha_creacion_empleado` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación del registro',
  `fecha_modificacion_empleado` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Fecha última modificación del registro',
  PRIMARY KEY (`id_empleado`),
  KEY `fk_empleado_nacionalidad` (`id_nacionalidad`),
  KEY `fk_empleado_tipo_contrato` (`id_tipo_contrato`),
  KEY `fk_empleado_departamento` (`id_departamento`),
  KEY `fk_empleado_puesto` (`id_puesto`),
  KEY `fk_empleado_supervisor` (`id_supervisor`),
  KEY `fk_empleado_empresa` (`id_empresa`),
  CONSTRAINT `fk_empleado_departamento` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos_tbl` (`id_departamento`),
  CONSTRAINT `fk_empleado_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas_tbl` (`id_empresa`),
  CONSTRAINT `fk_empleado_nacionalidad` FOREIGN KEY (`id_nacionalidad`) REFERENCES `nacionalidades_tbl` (`id_nacionalidad`),
  CONSTRAINT `fk_empleado_puesto` FOREIGN KEY (`id_puesto`) REFERENCES `puestos_tbl` (`id_puesto`),
  CONSTRAINT `fk_empleado_supervisor` FOREIGN KEY (`id_supervisor`) REFERENCES `usuarios_tbl` (`id_usuario`),
  CONSTRAINT `fk_empleado_tipo_contrato` FOREIGN KEY (`id_tipo_contrato`) REFERENCES `tipos_contrato_tbl` (`id_tipo_contrato`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla principal de empleados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleados_tbl`
--

LOCK TABLES `empleados_tbl` WRITE;
/*!40000 ALTER TABLE `empleados_tbl` DISABLE KEYS */;
INSERT INTO `empleados_tbl` VALUES (19,'Henrry','Corea Lopez','155831830401','2025-05-29','1984-04-17','soltero','henrrycorealopez@gmail.com','7079-0326','Dela iglesias católicas de Nazareth 200 mts norte','2025-05-21','2026-02-03','diurna ','Completo','1',16,1,13,8,4,13,1,1,0,0,'701840109413999001','2025-05-26 02:24:55','2025-07-04 03:35:50'),(20,'Isaac ','Quintanilla Barrantes','503850188','2027-04-27','1991-12-14','soltero','quintanillaisaac540@gmail.com','8669-3705','Los tijos ','2025-05-23','2026-02-18','diurna ','completo','1',17,1,13,8,4,13,1,1,1,1,'000503850188999001','2025-05-26 02:29:49','2025-06-30 02:55:46'),(21,'Jesus ','Guerra Pastrano','205660948','2027-07-08','1981-10-06','soltero','1233@gmail.com','7221-2515','Del puente de San Isidro a la tercera casa','2025-05-20','','diurna ','completo','1',17,1,13,8,4,13,0,1,1,1,'00020566094899900-1','2025-05-26 02:32:40','2025-07-07 15:37:05'),(22,'Jheudy Francisco',' Ruiz Miranda','504070419','2034-12-02','1995-10-20','soltero','djfranciss332014@gmail.com','6282-1280','Canalete de Upala ','2025-05-19','2028-10-01','diurna ','completo','1',17,1,13,8,4,13,1,1,1,1,'0005040704199991','2025-05-26 02:36:17','2025-06-08 13:19:06'),(23,'jose Ignacio','Mora','119070094','2034-02-01','2004-04-29','viudo','joseignacioora100@gmail.com','88771990','Liberia condega, casa continnuo soccer center, casa amarila porton café','2025-05-29','2025-05-29','122121','completo','500000',17,1,18,8,4,13,0,1,1,1,'0','2025-05-30 17:38:23','2025-06-21 19:15:11'),(24,'Roberto','Altamirano','111','2025-05-24','2025-05-30','casado','carlosroart13@gmail.com','87515938','Herdia','2025-05-30','2025-05-25','asasasasasas','9am - 5pm','15000',7,1,8,2,2,13,1,1,1,1,'1558888','2025-06-01 03:46:06','2025-07-05 23:59:38'),(25,'Jhonny ','Lopez Meza','205830163','2028-07-08','1983-03-25','soltero','jl4184608@gmail.com',' 7221-2515 ','Yolillal','2025-03-31','','diurna ','completo','1',17,1,8,1,4,13,1,1,1,1,'0000205830163999001','2025-06-04 23:28:17','2025-06-04 23:44:27'),(26,'Joel ','Bravo Martinez','801460250','2034-05-22','1996-11-18','soltero','Joelbravo1996mary@gmail.com','6370-0265','De la escuela  la verbena 100 metros norte','2025-05-03','','diurna ','completo','1',17,1,13,8,4,13,1,1,1,1,'000801460250999001','2025-06-04 23:54:25','2025-06-08 13:08:56'),(27,'Carlos José ',' Enrique López','107870247','2032-02-27','1970-11-25','soltero','carloslopezfajardo38@gmail.com','64131804','Upala','2025-05-01','','diurna ','completo','0',17,1,13,8,4,13,1,1,1,1,'0','2025-06-07 19:13:48','2025-06-07 19:13:48'),(28,'Christopher ','Rojas Rosales','113940299','2034-02-06','1998-06-19','soltero','rosaleschristopher329@gmail.com','8614-7971','Upala','2025-06-01','','diurna ','completo','0',17,1,13,8,4,13,1,0,1,0,'0','2025-06-07 19:20:58','2025-06-07 19:20:58'),(29,'Felipe ','Oporta Pena','204480328','2027-04-21','1967-08-23','soltero','ansalva87@gmail.com','8718-3027','Upala','2025-05-01','','diurna ','completo','0',17,1,13,8,4,13,1,1,1,1,'000204480328999001','2025-06-07 19:38:04','2025-06-07 19:38:04'),(30,'Geuvencio ','Castillo  Herrera','155831830401','2032-08-28','1971-12-12','soltero','geuvencio@gmail.com','6252-1332','Upala','2025-05-01','','diurna ','completo','0',16,1,13,8,4,13,1,1,1,1,'000204730670999001','2025-06-07 20:03:40','2025-06-07 20:03:40'),(31,'Ericka ','Cespedes Arguedas','114530870','2025-01-01','1970-01-01','soltero','Eckacespedes@gmail.com',' 6160-9044 ','GUATUSO Katira 500 mts norte de la plaza deportes','2025-05-01','','diurna ','completo','0',17,1,13,8,4,13,1,1,1,0,'0','2025-06-07 20:16:04','2025-06-07 20:16:04'),(32,'Guillermo',' Picado Martinez','155824939524','2029-09-19','1984-05-10','soltero','Picadoguillermo20@gmail.com','8357-0908','Upala De la iglesia católica 300 metros al norte','2025-04-28','','diurna ','completo','-1',16,1,13,8,4,13,0,1,1,1,'700018480857999001','2025-06-07 20:22:21','2025-07-07 15:35:54'),(33,'Jordan ','Oporta Varela','503940509','2024-06-26','1991-01-26','soltero','doporta71@gmail.com',' 8741-4206 ',' jasmines b 200 del puente los enfermos colonia Puntarenas','2025-04-28','','diurna ','completo','0',17,1,13,8,4,13,0,1,1,1,'000503940509999001','2025-06-07 20:32:01','2025-07-07 15:38:18'),(34,'Pastor ','Obando Mendoza ','155821279805','2029-05-10','1974-08-01','casado','pastorobando689@gmail.com','6274-0244','Upala ','2025-04-01','','diurna ','completo','0',16,1,13,8,4,13,1,1,1,1,'700017416772999001','2025-06-07 20:43:09','2025-06-07 20:43:09'),(35,'José Ariel',' Jiménez Zeledón ','155820446201','2025-09-01','1991-09-20','soltero','arieljimenezgon@gmail.com','8741-4206','Upala ','2025-03-31','','diurna ','completo','0',16,1,13,8,4,13,1,1,1,1,'700019125581999001','2025-06-07 20:52:02','2025-06-08 04:27:16'),(36,'Jose',' Barrios Rodriguez','208520334','2026-03-30','2004-02-29','soltero','1233@gmail.com','8714-8896','UPALA','2025-05-01','','diurna ','completo','0',17,1,13,8,4,13,1,1,1,1,'000208520334999001','2025-06-07 21:09:17','2025-06-07 21:09:17'),(37,'Mainor',' Arana Arcia','207450990','2027-03-21','1995-06-30','casado','minorjosearana26@gmail.com','7293-0841','UPALA','2025-03-29','','diurna ','completo','-1',17,1,13,8,4,13,0,1,1,1,'000207450990999001','2025-06-08 04:31:34','2025-07-07 15:39:20'),(38,'Marvin ','Betanco Flores','155818740719','2026-01-02','1990-04-06','casado','marvin.1.betanco.2.flores@gmail.com','6035-9427','Upala','2025-04-01','','diurna ','completo','0',16,1,13,8,4,13,1,1,0,0,'0','2025-06-08 05:05:11','2025-06-08 05:05:11'),(39,'Nixon ','Ayerdis Garcia','155826589513','2032-02-02','1989-06-24','casado','pomarepeña29@gmail.com',' 8736-0095 ','UPALA','2025-04-01','','diurna ','completo','0',16,1,13,8,4,13,1,1,1,1,'701810100045999001','2025-06-08 05:11:57','2025-06-08 05:11:57'),(40,'Noel ','Perez Pérez ','504050288','2028-12-04','1989-08-16','casado','nixonag1981@gmail.com','7038-1777','UPALA','2025-04-01','','diurna ','completo','0',17,1,13,8,4,13,1,1,1,1,'000504050288999001','2025-06-08 05:17:11','2025-06-08 05:17:11'),(41,'Norlan Martinez Lopez','Martinez Lopez','206070973','2030-06-24','1985-05-05','casado','Norlanlopez3883@mail.com','7029-9861','UPALA','2025-04-01','','diurna ','completo','-1',17,1,13,8,4,13,1,1,1,1,'000206070973999001','2025-06-08 05:20:47','2025-06-08 05:20:47'),(42,'Reynaldo ','Jimenez Pereira','304510394','2030-02-04','1991-01-14','soltero','1233@gmail.com','546','UPALA','2025-04-01','','Diurna','completo','0',17,1,13,8,4,13,1,1,1,1,'000304510394999001','2025-06-08 05:29:52','2025-06-08 05:29:52'),(43,'Ronaldo ','Martinez Alvarez ','204000197','2034-05-06','1964-10-26','casado','martinezalvarezr240@gmail.com','6347-9599','UPALA','2034-04-01','','Diurna','completo','0',17,1,13,8,4,13,1,1,1,1,'000204000197999001','2025-06-08 05:38:41','2025-06-08 05:38:41'),(44,'Santos ','Morales Lira','155823049002','2026-07-27','1979-02-20','casado','Santosmoraleb2023@gmail.com',' 6471-5401 ','UPALA','2025-04-01','','Diurna','completo','0',16,1,13,8,4,13,1,1,1,1,'701790100408999001','2025-06-08 05:42:58','2025-06-08 05:42:58'),(45,'Vicente ','Taleno Lopez','155831352304','2026-07-17','1983-05-10','casado','1233@gmail.com','6443-7914','UPALA','2025-04-01','','Diurna','Completo','0',16,1,13,8,4,13,1,1,1,1,'701830111498999001','2025-06-08 12:15:16','2025-06-08 12:15:16'),(46,'Yocsan ','Gutierez Santa Maria','206700800','2028-07-02','1990-03-26','soltero','www.yocsangutierrez2@gemail.com','8782-5257','UPALA','2025-04-01','','Diurna','Completo','-1',17,1,13,8,4,13,1,1,1,1,'000206700800999001','2025-06-08 12:18:38','2025-06-08 12:18:38'),(47,'Elian Marcio',' Lopez','305360698','2034-10-13','2001-01-08','soltero','marcioelian8@gmail.com','7158-0148','UPALA','2025-04-30','','Diurna','Completo','0',17,1,13,8,4,13,0,0,0,0,'012','2025-06-08 12:25:19','2025-06-28 13:36:32'),(48,'Enrique Antonio ','Pichardo Marcio','703550733','2034-02-05','2002-01-08','soltero','1233@gmail.com','7158-0148','UPALA','2025-04-30','','Diurna','Completo','0',17,1,13,8,4,13,0,1,1,0,'012','2025-06-08 12:32:43','2025-06-28 13:36:50'),(49,'Lorenso Jose',' Flores Castillo','702510808','2034-02-21','1997-06-03','soltero','lorenzojoseflorescastillo149@gmail.com','6487-0673','UPALA','2025-03-31','','Diurna','Completo','0',17,1,13,8,4,13,0,1,1,0,'0221','2025-06-08 12:37:57','2025-06-28 13:38:04'),(50,'Walter ','Pineda Arias','208040094','2036-02-03','2000-04-24','soltero','pinedaariasdavidwalter@gmail.com','7287-7472','UPALA','2025-03-31','','Diurna','Completo','0',17,1,13,8,4,13,0,1,1,0,'023','2025-06-08 12:41:34','2025-07-07 15:41:32'),(51,'Pamela','Alfaro','15653446','2034-05-01','1984-12-31','casado','dnsk@skdbk.com','545454','santa ana ','2025-06-26','','Completa','Discrecional','1000000',17,1,16,14,4,15,1,0,0,0,'112200140','2025-06-27 14:03:40','2025-06-27 14:50:12'),(52,'Randal ','López Mesa','114250359','2030-04-02','1974-08-09','soltero','lopezrandall580@gmail.com','61404355','sjdvhss','2025-03-31','','Diurna','Completo','0',17,1,13,8,4,13,1,1,1,1,'0','2025-07-07 16:41:11','2025-07-07 16:41:11');
/*!40000 ALTER TABLE `empleados_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresas_tbl`
--

DROP TABLE IF EXISTS `empresas_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresas_tbl` (
  `id_empresa` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único de la empresa',
  `nombre_comercial_empresa` varchar(150) NOT NULL COMMENT 'Nombre comercial de la empresa',
  `nombre_razon_social_empresa` varchar(150) NOT NULL COMMENT 'Nombre legal o razón social de la empresa',
  `cedula_juridica_empresa` varchar(30) DEFAULT NULL COMMENT 'Cédula jurídica o identificador fiscal',
  `nombre_contacto_empresa` varchar(150) DEFAULT NULL COMMENT 'Nombre de la persona de contacto',
  `correo_contacto_empresa` varchar(150) DEFAULT NULL COMMENT 'Correo de contacto de la empresa',
  `correo_facturacion_empresa` varchar(150) DEFAULT NULL COMMENT 'Correo destinado a facturación',
  `direccion_empresa` varchar(255) DEFAULT NULL COMMENT 'Dirección física o postal de la empresa',
  `estado_empresa` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Estado de la empresa (1 = activo, 0 = inactivo)',
  `fecha_creacion_empresa` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación del registro',
  `fecha_modificacion_empresa` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Fecha de última modificación',
  PRIMARY KEY (`id_empresa`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla que almacena la información de las empresas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresas_tbl`
--

LOCK TABLES `empresas_tbl` WRITE;
/*!40000 ALTER TABLE `empresas_tbl` DISABLE KEYS */;
INSERT INTO `empresas_tbl` VALUES (13,'Naturale','Naturale World Wide S.A','3101784886','Yendri','ybjb@naturale.com','fe@naturalefarms.com','Frente a escuela de yolillal YUpala',1,'2025-05-26 02:20:27','2025-05-26 02:20:27'),(15,'La Tienda Creativa','La Tienda','15','Catalina','jvsskjd@dks.com','uasdsa@skdbsk.com','Escazu',1,'2025-06-27 13:56:30','2025-06-27 13:56:30'),(16,'TWO SHOWS','TWO SHOWS',' 15354645','Catalina','kjsdbsdk@kaska.com','kdbskdskd@kask.com','Escazu',1,'2025-06-27 13:57:57','2025-06-27 13:57:57'),(17,'Roberto Empresa','Roberto Empresa Razón Social','123456','Empresa roberto','carlosroart13@gmail.com','carlosroart13@gmail.com','heredia',1,'2025-07-06 01:55:39','2025-07-06 01:55:39');
/*!40000 ALTER TABLE `empresas_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos_tbl`
--

DROP TABLE IF EXISTS `eventos_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos_tbl` (
  `id_evento` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID único del evento (PK)',
  `titulo_evento` varchar(255) NOT NULL COMMENT 'Título o nombre del evento',
  `descripcion_evento` text DEFAULT NULL COMMENT 'Descripción opcional del evento',
  `tipo_evento` varchar(50) NOT NULL COMMENT 'Categoría del evento (ej: reunión, permiso, vacaciones, etc.)',
  `color_evento` varchar(7) DEFAULT NULL COMMENT 'Color en formato HEX para visualización (ej: #FF5733)',
  `fecha_inicio_evento` datetime NOT NULL COMMENT 'Fecha y hora de inicio del evento',
  `fecha_fin_evento` datetime NOT NULL COMMENT 'Fecha y hora de finalización del evento',
  `all_day_evento` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = Evento de todo el día, 0 = Tiene hora específica',
  `estado_evento` varchar(20) NOT NULL DEFAULT 'pendiente' COMMENT 'Estado del evento: pendiente, confirmado, cancelado, etc.',
  `id_usuario_evento` int(11) NOT NULL COMMENT 'Usuario que creó o registró el evento',
  `id_empleado_evento` int(10) unsigned DEFAULT NULL COMMENT 'Empleado al que va dirigido el evento (puede ser NULL si no aplica)',
  `creado_en_evento` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación del registro',
  `actualizado_en_evento` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Fecha de la última modificación',
  PRIMARY KEY (`id_evento`),
  KEY `id_usuario_evento` (`id_usuario_evento`),
  KEY `id_empleado_evento` (`id_empleado_evento`),
  CONSTRAINT `eventos_tbl_ibfk_1` FOREIGN KEY (`id_usuario_evento`) REFERENCES `usuarios_tbl` (`id_usuario`),
  CONSTRAINT `eventos_tbl_ibfk_2` FOREIGN KEY (`id_empleado_evento`) REFERENCES `empleados_tbl` (`id_empleado`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla que almacena eventos del sistema, visibles en el calendario';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos_tbl`
--

LOCK TABLES `eventos_tbl` WRITE;
/*!40000 ALTER TABLE `eventos_tbl` DISABLE KEYS */;
/*!40000 ALTER TABLE `eventos_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gestor_aumento_tbl`
--

DROP TABLE IF EXISTS `gestor_aumento_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gestor_aumento_tbl` (
  `id_aumento_gestor` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único del aumento registrado',
  `empresa_id_aumento_gestor` int(10) unsigned NOT NULL COMMENT 'ID de la empresa asociada al aumento (FK con empresas_tbl)',
  `planilla_id_aumento_gestor` int(11) NOT NULL COMMENT 'ID de la planilla asociada al aumento (FK con planilla_tbl)',
  `empleado_id_aumento_gestor` int(10) unsigned NOT NULL COMMENT 'ID del empleado que recibe el aumento (FK con gestor_empleado_tbl)',
  `remuneracion_actual_aumento_gestor` decimal(15,2) NOT NULL COMMENT 'Remuneración actual del empleado antes del aumento',
  `tipo_ajuste_aumento_gestor` enum('Fijo','Porcentual') NOT NULL DEFAULT 'Fijo' COMMENT 'Tipo de ajuste: monto fijo o porcentaje',
  `monto_aumento_gestor` decimal(15,2) NOT NULL COMMENT 'Monto aplicado del aumento (valor absoluto o porcentaje según tipo_ajuste)',
  `remuneracion_nueva_aumento_gestor` decimal(15,2) NOT NULL COMMENT 'Nueva remuneración después del aumento',
  `fecha_efectiva_aumento_gestor` date NOT NULL COMMENT 'Fecha desde la cual aplica el aumento',
  `estado_planilla_aumento_gestor` enum('Pendiente','Aprobado','Aplicado','Cancelado') NOT NULL DEFAULT 'Pendiente' COMMENT 'Estado del aumento',
  `usuario_id_aumento_gestor` int(11) NOT NULL COMMENT 'ID del usuario que registró el aumento (FK opcional con usuarios_tbl)',
  `fecha_creacion_aumento_gestor` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación del registro',
  `fecha_modificacion_aumento_gestor` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Fecha de última modificación del registro',
  PRIMARY KEY (`id_aumento_gestor`),
  KEY `idx_empresa_id_aumento_gestor` (`empresa_id_aumento_gestor`),
  KEY `idx_planilla_id_aumento_gestor` (`planilla_id_aumento_gestor`),
  KEY `idx_empleado_id_aumento_gestor` (`empleado_id_aumento_gestor`),
  CONSTRAINT `fk_aumento_empleado` FOREIGN KEY (`empleado_id_aumento_gestor`) REFERENCES `gestor_empleado_tbl` (`id_empleado_gestor`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_aumento_empresa` FOREIGN KEY (`empresa_id_aumento_gestor`) REFERENCES `empresas_tbl` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_aumento_planilla` FOREIGN KEY (`planilla_id_aumento_gestor`) REFERENCES `planilla_tbl` (`planilla_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla que almacena aumentos salariales aplicados a empleados gestionados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gestor_aumento_tbl`
--

LOCK TABLES `gestor_aumento_tbl` WRITE;
/*!40000 ALTER TABLE `gestor_aumento_tbl` DISABLE KEYS */;
INSERT INTO `gestor_aumento_tbl` VALUES (1,17,36,40,1361008.00,'Fijo',80000.00,1441008.00,'2025-07-10','Pendiente',2,'2025-07-08 17:27:45','2025-07-08 17:27:45'),(2,17,36,36,200000.00,'Porcentual',0.99,201980.00,'2025-07-31','Pendiente',2,'2025-07-08 17:39:41','2025-07-08 17:41:35'),(3,13,29,38,500000.00,'Fijo',50000.00,550000.00,'2025-07-08','Pendiente',4,'2025-07-08 18:36:58','2025-07-08 18:36:58');
/*!40000 ALTER TABLE `gestor_aumento_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gestor_compensacion_extra_tbl`
--

DROP TABLE IF EXISTS `gestor_compensacion_extra_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gestor_compensacion_extra_tbl` (
  `id_compensacion_extra_gestor` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único de la compensación extra registrada',
  `empresa_id_compensacion_extra_gestor` int(10) unsigned NOT NULL COMMENT 'ID de la empresa asociada (FK con empresas_tbl)',
  `planilla_id_compensacion_extra_gestor` int(11) NOT NULL COMMENT 'ID de la planilla relacionada (FK con planilla_tbl)',
  `empleado_id_compensacion_extra_gestor` int(10) unsigned NOT NULL COMMENT 'ID del empleado que recibe la compensación (FK con gestor_empleado_tbl)',
  `remuneracion_actual_gestor` decimal(15,2) NOT NULL COMMENT 'Salario base actual del empleado en ₡',
  `tipo_jornada_gestor` enum('Mensual','Quincenal','Semanal') DEFAULT NULL COMMENT 'Tipo de jornada del empleado',
  `tipo_compensacion_extra_gestor` enum('Diurna (50%)','Nocturna (25%)','Feriado (100%)','Extraordinaria Nocturna (75%)','Extraordinaria Feriado (100%)') NOT NULL COMMENT 'Tipo de compensación extra aplicable según legislación laboral costarricense',
  `cantidad_horas_gestor` decimal(5,2) NOT NULL COMMENT 'Cantidad de horas trabajadas en esta compensación',
  `fecha_compensacion_gestor` date NOT NULL COMMENT 'Fecha efectiva del trabajo que genera la compensación',
  `monto_compensacion_calculado_gestor` decimal(15,2) NOT NULL COMMENT 'Monto resultante según fórmula y tipo de compensación',
  `motivo_compensacion_gestor` text DEFAULT NULL COMMENT 'Motivo opcional de la compensación extra',
  `aplica_en_compensacion_anual_gestor` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = Aplica en compensación anual, 0 = No aplica',
  `estado_compensacion_extra_gestor` enum('Pendiente','Aplicada','Procesada','Cancelada') NOT NULL DEFAULT 'Pendiente' COMMENT 'Estado de la compensación',
  `usuario_id_compensacion_extra_gestor` int(11) NOT NULL COMMENT 'Usuario que registró la compensación (FK opcional con usuarios_tbl)',
  `fecha_creacion_compensacion_extra_gestor` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación del registro',
  `fecha_modificacion_compensacion_extra_gestor` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Última modificación del registro',
  PRIMARY KEY (`id_compensacion_extra_gestor`),
  KEY `idx_empresa_id` (`empresa_id_compensacion_extra_gestor`),
  KEY `idx_planilla_id` (`planilla_id_compensacion_extra_gestor`),
  KEY `idx_empleado_id` (`empleado_id_compensacion_extra_gestor`),
  CONSTRAINT `fk_compensacion_empleado` FOREIGN KEY (`empleado_id_compensacion_extra_gestor`) REFERENCES `gestor_empleado_tbl` (`id_empleado_gestor`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_compensacion_empresa` FOREIGN KEY (`empresa_id_compensacion_extra_gestor`) REFERENCES `empresas_tbl` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_compensacion_planilla` FOREIGN KEY (`planilla_id_compensacion_extra_gestor`) REFERENCES `planilla_tbl` (`planilla_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla que registra compensaciones extra (horas extra) aplicadas a empleados gestionados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gestor_compensacion_extra_tbl`
--

LOCK TABLES `gestor_compensacion_extra_tbl` WRITE;
/*!40000 ALTER TABLE `gestor_compensacion_extra_tbl` DISABLE KEYS */;
INSERT INTO `gestor_compensacion_extra_tbl` VALUES (1,17,36,40,1361008.00,'Quincenal','Nocturna (25%)',12.00,'2025-07-26',170126.00,'-- no es obligatorio',0,'Pendiente',2,'2025-07-08 18:00:10','2025-07-08 18:02:56'),(2,17,36,40,1361008.00,'Quincenal','Diurna (50%)',12.00,'2025-07-08',204151.20,'-- no es obligatorio',1,'Pendiente',2,'2025-07-08 18:07:06','2025-07-08 18:07:06');
/*!40000 ALTER TABLE `gestor_compensacion_extra_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gestor_compensacion_metrica_tbl`
--

DROP TABLE IF EXISTS `gestor_compensacion_metrica_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gestor_compensacion_metrica_tbl` (
  `id_compensacion_metrica_gestor` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único de la compensación por métrica',
  `empresa_id_compensacion_metrica_gestor` int(10) unsigned NOT NULL COMMENT 'ID empresa (FK con empresas_tbl)',
  `planilla_id_compensacion_metrica_gestor` int(11) NOT NULL COMMENT 'ID planilla (FK con planilla_tbl)',
  `empleado_id_compensacion_metrica_gestor` int(10) unsigned NOT NULL COMMENT 'ID empleado (FK con gestor_empleado_tbl)',
  `tipo_compensacion_metrica_gestor` enum('productividad','cumplimiento_metas','puntualidad','asistencia_perfecta','antiguedad','evaluacion_desempeno','cero_accidentes','ventas','capacitacion','permanencia','innovacion') NOT NULL COMMENT 'Tipo de compensación por métrica',
  `monto_compensacion_metrica_gestor` decimal(15,2) NOT NULL COMMENT 'Monto total de la compensación',
  `motivo_compensacion_gestor` text DEFAULT NULL COMMENT 'Motivo o detalle de la compensación (opcional)',
  `fecha_compensacion_metrica_gestor` date NOT NULL COMMENT 'Fecha en que se registra o aplica la compensación',
  `aplica_en_compensacion_anual_gestor` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1=Aplica para cálculo aguinaldo, 0=No',
  `estado_compensacion_metrica_gestor` enum('Pendiente','Aprobada','Aplicada','Cancelada') NOT NULL DEFAULT 'Pendiente' COMMENT 'Estado del registro',
  `usuario_id_compensacion_metrica_gestor` int(11) NOT NULL COMMENT 'Usuario que registró la compensación',
  `fecha_creacion_compensacion_metrica_gestor` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha creación',
  `fecha_modificacion_compensacion_metrica_gestor` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Fecha última modificación',
  PRIMARY KEY (`id_compensacion_metrica_gestor`),
  KEY `idx_empresa` (`empresa_id_compensacion_metrica_gestor`),
  KEY `idx_planilla` (`planilla_id_compensacion_metrica_gestor`),
  KEY `idx_empleado` (`empleado_id_compensacion_metrica_gestor`),
  CONSTRAINT `fk_compensacion_metrica_empleado` FOREIGN KEY (`empleado_id_compensacion_metrica_gestor`) REFERENCES `gestor_empleado_tbl` (`id_empleado_gestor`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_compensacion_metrica_empresa` FOREIGN KEY (`empresa_id_compensacion_metrica_gestor`) REFERENCES `empresas_tbl` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_compensacion_metrica_planilla` FOREIGN KEY (`planilla_id_compensacion_metrica_gestor`) REFERENCES `planilla_tbl` (`planilla_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Compensación por métrica adaptada a ley Costa Rica';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gestor_compensacion_metrica_tbl`
--

LOCK TABLES `gestor_compensacion_metrica_tbl` WRITE;
/*!40000 ALTER TABLE `gestor_compensacion_metrica_tbl` DISABLE KEYS */;
INSERT INTO `gestor_compensacion_metrica_tbl` VALUES (1,17,36,40,'asistencia_perfecta',1500.00,'-- no es obligatorio','2025-07-08',1,'Pendiente',2,'2025-07-08 18:33:25','2025-07-08 18:33:25'),(2,13,29,38,'cumplimiento_metas',100000.00,'-- no es obligatorio','2025-07-08',0,'Pendiente',4,'2025-07-08 18:41:05','2025-07-08 18:41:05');
/*!40000 ALTER TABLE `gestor_compensacion_metrica_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gestor_empleado_tbl`
--

DROP TABLE IF EXISTS `gestor_empleado_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gestor_empleado_tbl` (
  `id_empleado_gestor` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único del empleado',
  `numero_socio_empleado_gestor` varchar(50) DEFAULT NULL COMMENT 'Número único de socio del empleado',
  `nombre_completo_empleado_gestor` varchar(150) NOT NULL COMMENT 'Nombre completo del empleado',
  `correo_empleado_gestor` varchar(150) DEFAULT NULL COMMENT 'Correo electrónico del empleado',
  `telefono_empleado_gestor` varchar(25) DEFAULT NULL COMMENT 'Número de teléfono del empleado',
  `cedula_empleado_gestor` varchar(25) DEFAULT NULL COMMENT 'Cédula de identidad del empleado',
  `salario_base_empleado_gestor` varchar(50) DEFAULT NULL COMMENT 'Salario base del empleado',
  `tipo_contrato_empleado_gestor` varchar(100) DEFAULT NULL COMMENT 'Tipo de contrato del empleado',
  `departamento_empleado_gestor` varchar(100) DEFAULT NULL COMMENT 'Departamento donde labora el empleado',
  `puesto_empleado_gestor` varchar(100) DEFAULT NULL COMMENT 'Puesto o cargo que ocupa el empleado',
  `supervisor_empleado_gestor` varchar(150) DEFAULT NULL COMMENT 'Nombre del supervisor directo',
  `id_empresa` int(10) unsigned DEFAULT NULL COMMENT 'ID de la empresa relacionada (foreign key)',
  `fecha_ingreso_empleado_gestor` varchar(30) DEFAULT NULL COMMENT 'Fecha de ingreso del empleado a la empresa',
  `fecha_salida_empleado_gestor` varchar(30) DEFAULT NULL COMMENT 'Fecha de salida del empleado (si aplica)',
  `jornada_laboral_empleado_gestor` varchar(100) DEFAULT NULL COMMENT 'Tipo de jornada laboral (Ej: Tiempo completo)',
  `numero_asegurado_empleado_gestor` varchar(50) NOT NULL COMMENT 'Número de asegurado del empleado',
  `numero_ins_empleado_gestor` varchar(50) NOT NULL COMMENT 'Número del INS del empleado',
  `numero_hacienda_empleado_gestor` varchar(50) NOT NULL COMMENT 'Número en el Ministerio de Hacienda',
  `cuenta_bancaria_1_empleado_gestor` varchar(100) DEFAULT NULL COMMENT 'Primera cuenta bancaria del empleado',
  `cuenta_bancaria_2_empleado_gestor` varchar(100) DEFAULT NULL COMMENT 'Segunda cuenta bancaria del empleado (opcional)',
  `vacaciones_acumuladas_empleado_gestor` varchar(50) DEFAULT NULL COMMENT 'Cantidad de vacaciones acumuladas',
  `aguinaldo_acumulado_empleado_gestor` varchar(50) DEFAULT NULL COMMENT 'Monto de aguinaldo acumulado',
  `cesantia_acumulada_empleado_gestor` varchar(50) DEFAULT NULL COMMENT 'Monto de cesantía acumulada',
  `ministerio_hacienda_empleado_gestor` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Registrado en Ministerio de Hacienda (1 = Sí, 0 = No)',
  `rt_ins_empleado_gestor` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Registrado en RT INS (1 = Sí, 0 = No)',
  `ccss_empleado_gestor` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Registrado en CCSS (1 = Sí, 0 = No)',
  `moneda_pago_empleado_gestor` varchar(20) DEFAULT 'COLONES' COMMENT 'Moneda de pago (COLONES o DÓLARES)',
  `tipo_planilla_empleado_gestor` varchar(50) DEFAULT NULL COMMENT 'Tipo de planilla (ej: Ordinaria, Extraordinaria)',
  `estado_empleado_gestor` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Estado del empleado (1 = Activo, 0 = Inactivo)',
  `montoAsegurado_gestor_empelado` varchar(45) DEFAULT '0',
  `fecha_creacion_empleado_gestor` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación del registro',
  `fecha_modificacion_empleado_gestor` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Fecha de última modificación',
  PRIMARY KEY (`id_empleado_gestor`),
  UNIQUE KEY `numero_asegurado_empleado_gestor` (`numero_asegurado_empleado_gestor`),
  UNIQUE KEY `numero_ins_empleado_gestor` (`numero_ins_empleado_gestor`),
  UNIQUE KEY `numero_hacienda_empleado_gestor` (`numero_hacienda_empleado_gestor`),
  UNIQUE KEY `unique_correo_empleado_gestor` (`correo_empleado_gestor`),
  UNIQUE KEY `unique_cedula_empleado_gestor` (`cedula_empleado_gestor`),
  KEY `idx_id_empresa` (`id_empresa`),
  CONSTRAINT `fk_empresa_empleado` FOREIGN KEY (`id_empresa`) REFERENCES `empresas_tbl` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla que almacena la información de los empleados gestionados';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gestor_empleado_tbl`
--

LOCK TABLES `gestor_empleado_tbl` WRITE;
/*!40000 ALTER TABLE `gestor_empleado_tbl` DISABLE KEYS */;
INSERT INTO `gestor_empleado_tbl` VALUES (33,'GT33RDT6QL','Katrina Bou Mansour Blonval','kmboumansour@gmail.com','88325933','186202559322','200000','indefinido','servicio_cliente','director','15',17,'2025-07-09',NULL,'tiempo_completo','186202559322','186202559322','186202559322','186202559322','186202559322','0186202559322','0186202559322','0186202559322',0,1,0,'dolares','quincenal',1,'0','2025-07-06 18:28:46','2025-07-06 18:28:46'),(36,'GT366BRQ89','Katrina Prueba ','kmboumansour2@gmail.com','88325933','1862025593220000','200000','indefinido','operaciones','contador','15',17,'2025-07-11',NULL,'medio_tiempo','000000000000012224','000000000000012224','000000000000012224','186202559322','186202559322','0186202559322','0186202559322','0186202559322',1,0,0,'colones','quincenal',1,'0','2025-07-06 18:30:00','2025-07-06 18:31:01'),(37,'GT37G1HZEL','roberto prueba','andres.felipe.campos.rojas@yahoo.com','88325933','11112','11112','plazo_fijo','it','asistente','15',17,'2025-07-02',NULL,'freelance','11112','11112','11112','11112','11112','011112','011112','011112',1,0,0,'colones','bisemanal',1,'0','2025-07-06 20:01:29','2025-07-06 20:01:29'),(38,'GT38I1UW1Y','Pablo','kapra1978@gmail.com','72093397','123456890','500000','por_servicios_profesionales','administracion','gerente','16',13,'2025-06-04',NULL,'tiempo_completo','123456890','43425435345','2213543654734','CR2000034234324500542',NULL,'4','203000','875000',1,1,0,'colones','quincenal',1,'0','2025-07-07 00:08:31','2025-07-07 00:08:31'),(39,'GT39J03NRK','cralos','vladimirmorac@gmail.com','72927723','109600143','1000000','indefinido','produccion','coordinador','4',13,'2025-07-01',NULL,'tiempo_completo','123','1234','12356','',NULL,'0','0','0',1,1,1,'colones','semanal',1,'0','2025-07-07 22:53:50','2025-07-08 10:50:36'),(40,'GT40EQNJMV','RONALD BOLANOS','rzunigaa419@ulacit.ed.cr','87515938','C87145144','1361008','indefinido','administracion','administrador','2',17,'2025-07-10',NULL,'tiempo_completo','1313','1313','11111111111','CR28979820885475210000','CR22174578350005617000','1','1','1',0,0,1,'colones','quincenal',1,'19552025','2025-07-08 16:23:02','2025-07-08 16:33:18'),(46,'GT46BJDS9Y','Narel Cedeño Fernández ','vla@acuamic.com','72927723','1096','1000000','indefinido','administracion','gerente','4',13,'2025-07-01',NULL,'tiempo_completo','12351','123451','12356515','CR12656566635',NULL,'5','50000','200000',0,0,0,'colones_y_dolares','quincenal',1,'0','2025-07-08 19:00:43','2025-07-08 19:00:43');
/*!40000 ALTER TABLE `gestor_empleado_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gestor_rebajo_compensacion_tbl`
--

DROP TABLE IF EXISTS `gestor_rebajo_compensacion_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gestor_rebajo_compensacion_tbl` (
  `id_rebajo_compensacion` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único del rebajo a compensación',
  `empresa_id_rebajo` int(10) unsigned NOT NULL COMMENT 'ID empresa (FK con empresas_tbl)',
  `planilla_id_rebajo` int(11) NOT NULL COMMENT 'ID planilla (FK con planilla_tbl)',
  `empleado_id_rebajo` int(10) unsigned NOT NULL COMMENT 'ID empleado (FK con gestor_empleado_tbl)',
  `tipo_rebajo` enum('horas_no_laboradas','ausencias_injustificadas','retardos','permisos_no_remunerados','incapacidades_no_autorizadas','suspension_disciplinaria','licencias_sin_goce','dias_no_trabajados_parcial','faltas_reiteradas','descuentos_judiciales','anticipos_prestamos','devolucion_equipo_materiales','errores_perdidas') NOT NULL COMMENT 'Tipo de rebajo a compensación',
  `tipo_jornada_laboral` enum('mensual','quincenal','semanal') NOT NULL COMMENT 'Jornada laboral para calcular',
  `horas_rebajadas` decimal(10,2) DEFAULT NULL COMMENT 'Horas descontadas (si aplica)',
  `dias_rebajados` decimal(10,2) DEFAULT NULL COMMENT 'Días descontados (si aplica)',
  `monto_fijo_rebajo` decimal(15,2) DEFAULT NULL COMMENT 'Monto fijo a descontar (si aplica)',
  `salario_actual` decimal(15,2) NOT NULL COMMENT 'Salario actual para cálculo',
  `monto_rebajo_calculado` decimal(15,2) NOT NULL COMMENT 'Monto total calculado del rebajo',
  `motivo_rebajo` text DEFAULT NULL COMMENT 'Motivo o detalle del rebajo',
  `fecha_rebajo` date NOT NULL COMMENT 'Fecha en que se aplica el rebajo',
  `aplica_compensacion_anual` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1=Aplica a cálculo anual, 0=No aplica',
  `estado_rebajo` enum('Pendiente','Aprobado','Aplicado','Cancelado') NOT NULL DEFAULT 'Pendiente' COMMENT 'Estado del registro',
  `usuario_id_rebajo` int(11) NOT NULL COMMENT 'Usuario que registró el rebajo',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha creación',
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Fecha última modificación',
  PRIMARY KEY (`id_rebajo_compensacion`),
  KEY `idx_empresa` (`empresa_id_rebajo`),
  KEY `idx_planilla` (`planilla_id_rebajo`),
  KEY `idx_empleado` (`empleado_id_rebajo`),
  CONSTRAINT `fk_rebajo_empleado` FOREIGN KEY (`empleado_id_rebajo`) REFERENCES `gestor_empleado_tbl` (`id_empleado_gestor`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rebajo_empresa` FOREIGN KEY (`empresa_id_rebajo`) REFERENCES `empresas_tbl` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rebajo_planilla` FOREIGN KEY (`planilla_id_rebajo`) REFERENCES `planilla_tbl` (`planilla_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rebajos a compensación con cálculos automáticos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gestor_rebajo_compensacion_tbl`
--

LOCK TABLES `gestor_rebajo_compensacion_tbl` WRITE;
/*!40000 ALTER TABLE `gestor_rebajo_compensacion_tbl` DISABLE KEYS */;
/*!40000 ALTER TABLE `gestor_rebajo_compensacion_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nacionalidades_tbl`
--

DROP TABLE IF EXISTS `nacionalidades_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nacionalidades_tbl` (
  `id_nacionalidad` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único de nacionalidad',
  `nombre_nacionalidad` varchar(100) NOT NULL COMMENT 'Nombre del país o nacionalidad',
  `estado_nacionalidad` int(11) DEFAULT 1,
  PRIMARY KEY (`id_nacionalidad`),
  UNIQUE KEY `nombre_nacionalidad` (`nombre_nacionalidad`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de nacionalidades';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nacionalidades_tbl`
--

LOCK TABLES `nacionalidades_tbl` WRITE;
/*!40000 ALTER TABLE `nacionalidades_tbl` DISABLE KEYS */;
INSERT INTO `nacionalidades_tbl` VALUES (7,'Argentina',1),(8,'México',1),(9,'España',1),(10,'Colombia',1),(11,'Chile',1),(12,'Perú',1),(13,'Guatemala',1),(14,'Honduras',1),(15,'El Salvador',1),(16,'Nicaragua',1),(17,'Costa Rica',1),(18,'Panamá',1),(19,'Belice',1);
/*!40000 ALTER TABLE `nacionalidades_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id_perm` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_perm` varchar(100) NOT NULL,
  `descripcion_perm` text DEFAULT NULL,
  `fecha_creacion_perm` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion_perm` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_perm`),
  UNIQUE KEY `nombre_perm` (`nombre_perm`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
INSERT INTO `permisos` VALUES (1,'Ver empleados','Poder ver empleados','2025-06-01 09:07:52','2025-06-01 09:07:52'),(2,'Editar empleados','Poder Editar Empleados','2025-06-01 09:18:04','2025-06-01 09:18:04'),(3,'Crear empelados','Poder Crear empleados','2025-06-01 09:18:04','2025-06-01 09:18:04'),(4,'Ver Empresas','Poder ver empresas','2025-06-01 09:35:45','2025-06-01 09:35:45'),(5,'Editar Empresas','Poder Editar Empresas','2025-06-01 09:35:45','2025-06-01 09:35:45'),(6,'Crear Empresas','Poder Crear Empresas','2025-06-01 09:35:45','2025-06-01 09:35:45'),(7,'Ver Clientes','Poder ver clientes','2025-06-01 09:40:19','2025-06-01 09:40:19'),(8,'Editar Clientes','Poder editar Clientes','2025-06-01 09:40:19','2025-06-01 09:40:19'),(9,'Crear Clientes','Poder Crear Clientes','2025-06-01 09:40:19','2025-06-01 09:40:19'),(10,'Ver listado Planilla','Poder ver la lista de planilla','2025-06-29 00:54:18','2025-06-29 00:54:18'),(11,'Editar  Planilla','Poder Editar planilla','2025-06-29 00:58:04','2025-06-29 00:58:04'),(12,'Crear Planilla','Poder crear Una planilla','2025-06-29 00:59:24','2025-06-29 00:59:24'),(13,'Generar Planilla','Poder generar Planmnilla ','2025-06-29 01:06:14','2025-06-29 01:06:51'),(14,'Ver planilla aplicadas','ver planillas aplicadas','2025-06-29 01:14:17','2025-06-29 01:14:17'),(15,'Visualizar planilla','poder visulizar la planilla','2025-06-29 01:57:46','2025-06-29 01:57:46');
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planilla_tbl`
--

DROP TABLE IF EXISTS `planilla_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planilla_tbl` (
  `planilla_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la planilla',
  `planilla_codigo` varchar(50) NOT NULL COMMENT 'Código único que identifica la planilla (ej: PLN2025-MAY01)',
  `empresa_id` int(11) NOT NULL COMMENT 'ID de la empresa a la que aplica esta planilla (relación con la tabla de empresas)',
  `planilla_tipo` enum('Mensual','Quincenal','Semanal','Otro') NOT NULL COMMENT 'Periodicidad de la planilla de pagos',
  `planilla_descripcion` text DEFAULT NULL COMMENT 'Descripción opcional que brinda contexto adicional sobre la planilla',
  `planilla_estado` enum('En Proceso','Activa','Cerrada','Cancelada','Procesada') DEFAULT 'En Proceso' COMMENT 'Estado actual de la planilla: En Proceso, Activa, Cerrada, Cancelada o Procesada',
  `planilla_fecha_inicio` date NOT NULL COMMENT 'Fecha de inicio del periodo cubierto por la planilla',
  `planilla_fecha_fin` date NOT NULL COMMENT 'Fecha de fin del periodo cubierto por la planilla',
  `planilla_fecha_creacion` datetime DEFAULT current_timestamp() COMMENT 'Fecha y hora en que se creó la planilla',
  `planilla_creado_por` int(11) DEFAULT NULL COMMENT 'ID del usuario que creó la planilla',
  PRIMARY KEY (`planilla_id`),
  UNIQUE KEY `planilla_codigo` (`planilla_codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabla que define las cabeceras de planillas salariales asociadas a una empresa y un periodo';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planilla_tbl`
--

LOCK TABLES `planilla_tbl` WRITE;
/*!40000 ALTER TABLE `planilla_tbl` DISABLE KEYS */;
INSERT INTO `planilla_tbl` VALUES (24,'PL-ROB-Mens-20250701-8NSKZR',17,'Mensual','--','Cancelada','2025-07-01','2025-07-30','2025-07-06 20:39:05',2),(25,'PL-ROB-Quin-20250706-F9B5W2',17,'Quincenal','--','Cancelada','2025-07-06','2025-07-23','2025-07-06 20:39:34',2),(26,'PL-ROB-Quin-20250707-C0FZN6',17,'Quincenal','--ADAS','Cancelada','2025-07-07','2025-07-10','2025-07-06 20:50:52',2),(27,'PL-ROB-Mens-20250719-MF9BJL',17,'Mensual','--nn','Activa','2025-07-19','2025-08-01','2025-07-06 21:36:47',4),(28,'PL-NAT-Sema-20250706-AJ9JZQ',13,'Semanal','ejemplo rapido','Procesada','2025-07-06','2025-07-11','2025-07-06 23:27:03',4),(29,'PL-NAT-Sema-20250628-THYCBA',13,'Semanal','Prueba Pablo','En Proceso','2025-06-28','2025-07-03','2025-07-07 00:03:28',16),(30,'PL-NAT-Quin-20250715-3IDS0E',13,'Quincenal','Prueba pago planilla','En Proceso','2025-07-15','2025-07-31','2025-07-07 00:15:05',16),(31,'PL-NAT-Sema-20250701-NUXFLP',13,'Semanal','--vladiir2','En Proceso','2025-07-01','2025-07-05','2025-07-07 00:23:21',4),(32,'PL-LA-Quin-20250615-WQ18VC',15,'Quincenal','--Vladimir 3','En Proceso','2025-06-15','2025-06-30','2025-07-07 00:43:33',4),(33,'PL-NAT-Sema-20250630-CFKYAO',13,'Semanal','--Jose ','Procesada','2025-06-30','2025-07-05','2025-07-07 17:01:45',4),(34,'PL-NAT-Sema-20250609-ZVQHST',13,'Semanal','--','En Proceso','2025-06-09','2025-07-12','2025-07-07 22:27:36',4),(35,'PL-NAT-Sema-20250701-ZASIOH',13,'Semanal','--','En Proceso','2025-07-01','2025-07-05','2025-07-07 22:54:37',4),(36,'PL-ROB-Mens-20250709-SA406A',17,'Mensual','-- 195','En Proceso','2025-07-09','2025-07-11','2025-07-08 16:37:31',2),(37,'PL-NAT-Quin-20250615-QMVPOS',13,'Quincenal','--VLADIMIR 5','En Proceso','2025-06-15','2025-06-30','2025-07-08 18:25:55',4),(38,'PL-NAT-Quin-20250515-TJYOJS',13,'Quincenal','--DE MAYO','En Proceso','2025-05-15','2025-05-30','2025-07-08 19:02:50',4);
/*!40000 ALTER TABLE `planilla_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puestos_tbl`
--

DROP TABLE IF EXISTS `puestos_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puestos_tbl` (
  `id_puesto` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único del puesto',
  `nombre_puesto` varchar(100) NOT NULL COMMENT 'Nombre del puesto o cargo',
  `estado_puesto` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_puesto`),
  UNIQUE KEY `nombre_puesto` (`nombre_puesto`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de puestos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puestos_tbl`
--

LOCK TABLES `puestos_tbl` WRITE;
/*!40000 ALTER TABLE `puestos_tbl` DISABLE KEYS */;
INSERT INTO `puestos_tbl` VALUES (1,'Supervisor de Campo',1),(2,'Operario de Maquinaria',1),(3,'Técnico de Mantenimiento',1),(4,'Encargado de Seguridad',1),(5,'Chofer de Transporte',1),(6,'Auxiliar de Logística',1),(7,'Agrónomo',1),(8,'Peón de Campo',1),(9,'Jefe de Producción',1),(10,'Técnico Ambiental',1),(11,'Coordinador de Calidad',1),(12,'Auxiliar Administrativo',1),(13,'Recepcionista',1),(14,'Gerente de Operaciones',1),(15,'Asistente de Recursos Humanos',1);
/*!40000 ALTER TABLE `puestos_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_contrato_tbl`
--

DROP TABLE IF EXISTS `tipos_contrato_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_contrato_tbl` (
  `id_tipo_contrato` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID único del tipo de contrato',
  `nombre_tipo_contrato` varchar(50) NOT NULL COMMENT 'Nombre del tipo de contrato (indefinido, temporal, etc.)',
  `estado_tipo_contrato` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_tipo_contrato`),
  UNIQUE KEY `nombre_tipo_contrato` (`nombre_tipo_contrato`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catálogo de tipos de contrato laboral';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_contrato_tbl`
--

LOCK TABLES `tipos_contrato_tbl` WRITE;
/*!40000 ALTER TABLE `tipos_contrato_tbl` DISABLE KEYS */;
INSERT INTO `tipos_contrato_tbl` VALUES (1,'Indefinido',1),(2,'Temporal',1),(3,'Por obra',1),(4,'Prácticas',1),(5,'Freelance',1);
/*!40000 ALTER TABLE `tipos_contrato_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_permisos_tbl`
--

DROP TABLE IF EXISTS `usuarios_permisos_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_permisos_tbl` (
  `id_usuario_usuario_perm` int(11) NOT NULL COMMENT 'FK al usuario',
  `id_perm_usuario_perm` int(11) NOT NULL COMMENT 'FK al permiso asignado al usuario',
  PRIMARY KEY (`id_usuario_usuario_perm`,`id_perm_usuario_perm`) COMMENT 'Clave primaria compuesta: cada permiso sólo puede asignarse una vez por usuario',
  KEY `fk_usuario_perm_permiso` (`id_perm_usuario_perm`),
  CONSTRAINT `fk_usuario_perm_permiso` FOREIGN KEY (`id_perm_usuario_perm`) REFERENCES `permisos` (`id_perm`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_usuario_perm_usuario` FOREIGN KEY (`id_usuario_usuario_perm`) REFERENCES `usuarios_tbl` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla relacional que vincula usuarios con permisos específicos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_permisos_tbl`
--

LOCK TABLES `usuarios_permisos_tbl` WRITE;
/*!40000 ALTER TABLE `usuarios_permisos_tbl` DISABLE KEYS */;
INSERT INTO `usuarios_permisos_tbl` VALUES (1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,11),(1,12),(1,13),(1,14),(1,15),(2,1),(2,2),(2,3),(2,4),(2,5),(2,6),(2,7),(2,8),(2,9),(2,10),(2,11),(2,12),(2,13),(2,14),(2,15),(4,1),(4,2),(4,3),(4,4),(4,5),(4,6),(4,7),(4,8),(4,9),(4,10),(4,11),(4,12),(4,13),(4,14),(4,15);
/*!40000 ALTER TABLE `usuarios_permisos_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_tbl`
--

DROP TABLE IF EXISTS `usuarios_tbl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_tbl` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT COMMENT 'PK único del usuario',
  `nombre_usuario` varchar(100) NOT NULL COMMENT 'Nombre completo o alias a mostrar',
  `email_usuario` varchar(255) NOT NULL COMMENT 'Correo electrónico (único)',
  `password_hash_usuario` char(60) NOT NULL COMMENT 'Hash de la contraseña (bcrypt, Argon2, etc.)',
  `rol_usuario` varchar(20) NOT NULL DEFAULT 'usuario' COMMENT 'Rol/permiso: admin, usuario, supervisor,…',
  `estado_usuario` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1=activo, 0=bloqueado/inactivo',
  `intentos_login_usuario` int(11) NOT NULL DEFAULT 0 COMMENT 'Intentos fallidos de login',
  `login_usuario` int(11) DEFAULT NULL,
  `id_empresa_usuario` int(11) DEFAULT NULL,
  `creado_en_usuario` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha de creación',
  `actualizado_en_usuario` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Fecha última modif.',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email_usuario` (`email_usuario`),
  KEY `idx_usuarios_email` (`email_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_tbl`
--

LOCK TABLES `usuarios_tbl` WRITE;
/*!40000 ALTER TABLE `usuarios_tbl` DISABLE KEYS */;
INSERT INTO `usuarios_tbl` VALUES (1,'Ahmed Navarro Soto','ahmed.n_29@hotmail.com','$2b$10$qvXm7NKst02gknYF/Kbqnu.k3QjplWGu02rwF1yS5GNphDDQdh9PG','admin',1,0,1,13,'2025-05-18 18:51:28','2025-06-28 08:29:32'),(2,'Roberto Zuniga Altamirano','carlosroart13@gmail.com','$2b$10$qvXm7NKst02gknYF/Kbqnu.k3QjplWGu02rwF1yS5GNphDDQdh9PG','admin',1,0,1,17,'2025-05-18 18:51:28','2025-07-06 02:34:01'),(4,'Vladimir Mora','vla@gt3cr.com','$2b$10$t/v1M6KkkX9EuUo3likfyO.C72nIEQeeZZXXQB5Y.kaau55IC3Xvq','admin',1,0,1,13,'2025-05-18 18:51:28','2025-06-28 08:29:32'),(14,'José Ignacio','jmc@gmail.com','$2b$10$lzL5YmBl8O5J.WBxjpUqp.XbKPQVkjtzcztkoaBYHkk.f6Tp0vLca','usuario',1,0,0,13,'2025-05-28 14:03:06','2025-07-06 22:28:42'),(15,'Katrina Bou Mansour','kmboumansour@gmail.com','$2b$10$qvXm7NKst02gknYF/Kbqnu.k3QjplWGu02rwF1yS5GNphDDQdh9PG','usuario',1,0,1,17,'2025-05-18 18:51:28','2025-07-06 02:34:01'),(16,'Pablo K','Kapra1978@gmail.com','$2b$10$2DTWyAjnTRacqOzE/H97UOsjSEvqT92cfSHeuiH/vyRD5F9CQl0KK','admin',1,0,1,13,'2025-07-06 23:58:51','2025-07-06 23:59:32');
/*!40000 ALTER TABLE `usuarios_tbl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'u732776653_sistema'
--

--
-- Dumping routines for database 'u732776653_sistema'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-08 13:27:03

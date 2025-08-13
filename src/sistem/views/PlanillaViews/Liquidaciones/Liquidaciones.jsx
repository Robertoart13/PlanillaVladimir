import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
   cargarEmpresas,
   cargarEmpleados,
   cargarDatosLiquidacion,
   manejarCambioEmpresa,
   manejarCambioEmpleado,
   renderFormularioLiquidacion
} from "./LiquidacionUtil.jsx";   

/**
 * Componente principal para gestionar liquidaciones de empleados
 * Permite seleccionar empresa y empleado, y muestra los datos de liquidación
 */
export const Liquidaciones = () => {
   const dispatch = useDispatch();
   
   // Estados del componente
   const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
   const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
   const [empresas, setEmpresas] = useState([]);
   const [empleados, setEmpleados] = useState([]);
   const [datosEmpleado, setDatosEmpleado] = useState(null);
   const [loading, setLoading] = useState(true);
   const [loadingEmpleados, setLoadingEmpleados] = useState(false);

   // Cargar empresas al montar el componente
   useEffect(() => {
      const inicializarEmpresas = async () => {
         setLoading(true);
         const empresasData = await cargarEmpresas(dispatch);
         setEmpresas(empresasData);
         setLoading(false);
      };

      inicializarEmpresas();
   }, [dispatch]);

   // Cargar empleados cuando cambie la empresa seleccionada
   useEffect(() => {
      const cargarEmpleadosEmpresa = async () => {
         if (empresaSeleccionada) {
            setLoadingEmpleados(true);
            const empleadosData = await cargarEmpleados(dispatch, empresaSeleccionada);
            setEmpleados(empleadosData);
            setLoadingEmpleados(false);
         } else {
            setEmpleados([]);
         }
      };

      cargarEmpleadosEmpresa();
   }, [empresaSeleccionada, dispatch]);

   // Cargar datos de liquidación cuando cambie el empleado seleccionado
   useEffect(() => {
      const cargarLiquidacionEmpleado = async () => {
         if (empleadoSeleccionado) {
            const liquidacionData = await cargarDatosLiquidacion(dispatch, empleadoSeleccionado);
            setDatosEmpleado(liquidacionData);
         } else {
            setDatosEmpleado(null);
         }
      };

      cargarLiquidacionEmpleado();
   }, [empleadoSeleccionado, dispatch]);

   // Handlers para cambios en los selects
   const handleEmpresaChange = (event) => {
      manejarCambioEmpresa(event, setEmpresaSeleccionada, setEmpleadoSeleccionado, setDatosEmpleado);
   };

   const handleEmpleadoChange = (event) => {
      manejarCambioEmpleado(event, setEmpleadoSeleccionado);
   };

   return (
      <div className="card">
         <div className="card-header">
            <h5>Liquidaciones</h5>
            <p className="text-muted">
               Aquí podrás gestionar las liquidaciones de los empleados.
            </p>
         </div>
         
         <div className="card-body">
            {/* Selectores de Empresa y Empleado */}
            <div className="row">
               <div className="col-md-6">
                  <FormControl fullWidth style={{ marginBottom: "1rem" }}>
                     <InputLabel id="empresa-select-label">Empresa</InputLabel>
                     <Select
                        labelId="empresa-select-label"
                        id="empresa-select"
                        value={empresaSeleccionada}
                        label="Empresa"
                        onChange={handleEmpresaChange}
                     >
                        <MenuItem value="">
                           <em>Seleccione una empresa</em>
                        </MenuItem>
                        {loading ? (
                           <MenuItem disabled>Cargando...</MenuItem>
                        ) : empresas.length > 0 ? (
                           empresas.map((empresa) => (
                              <MenuItem key={empresa.id_empresa} value={empresa.id_empresa}>
                                 {empresa.nombre_comercial_empresa}
                              </MenuItem>
                           ))
                        ) : (
                           <MenuItem disabled>No hay empresas disponibles</MenuItem>
                        )}
                     </Select>
                  </FormControl>
               </div>
               
               <div className="col-md-6">
                  <FormControl fullWidth style={{ marginBottom: "1rem" }}>
                     <InputLabel id="empleado-select-label">Empleado</InputLabel>
                     <Select
                        labelId="empleado-select-label"
                        id="empleado-select"
                        value={empleadoSeleccionado}
                        label="Empleado"
                        onChange={handleEmpleadoChange}
                        disabled={!empresaSeleccionada}
                     >
                        <MenuItem value="">
                           <em>Seleccione un empleado</em>
                        </MenuItem>
                        {loadingEmpleados ? (
                           <MenuItem disabled>Cargando empleados...</MenuItem>
                        ) : empleados.length > 0 ? (
                           empleados.map((empleado) => (
                              <MenuItem key={empleado.id_empleado_gestor} value={empleado.id_empleado_gestor}>
                                 {empleado.nombre_completo_empleado_gestor}
                              </MenuItem>
                           ))
                        ) : (
                           <MenuItem disabled>No hay empleados disponibles</MenuItem>
                        )}
                     </Select>
                  </FormControl>
               </div>
            </div>
            
            {/* Formulario de Liquidación Laboral */}
            {renderFormularioLiquidacion(datosEmpleado)}
         </div>
      </div>
   );
};

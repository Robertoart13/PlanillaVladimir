import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useEffect, useMemo, useRef, useState } from "react";
import { TextField, Select, MenuItem, Button, Grid } from "@mui/material";
import Swal from "sweetalert2";
import { Empresa_Editar_Thunks } from "../../../../store/Empresa/Empresa_Editar_Thunks";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
export const EditarEmpleado = () => { 
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");
   const [submitted, setSubmitted] = useState(false); // Nuevo estado
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const [formData, setFormData] = useState({
      nombre_empresa: "",
      rnc_empresa: "",
      direccion_empresa: "",
      telefono_empresa: "",
      correo_empresa: "",
      estado_empresa: 1,
   });

   const storedData = localStorage.getItem("selectedEmpresa");

   useEffect(() => {
      if (storedData) {
         const existingData = JSON.parse(storedData);
         setFormData(existingData);
      } else {
         setError(true);
         setFormData({
            nombre_clase: "",
            descripcion_clase: "",
            codigo_clase: "",
            id_externos_clase: "",
            es_inactivo: 1,
         });

         setMessage("No se ha seleccionado ninguna empresa.");

         setTimeout(() => {
            navigate("/empresas/lista");
         }, 3000);
      }
   }, [storedData, navigate]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      setSubmitted(true);
      if (Object.values(formData).some((field) => field === "")) {
         setError(true);
         setMessage("Todos los campos deben estar llenos.");
         return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo_empresa)) {
         setError(true);
         setMessage("Por favor, ingrese un correo electrónico válido.");
         return;
      }
      // Limpiar mensajes de error si todo es válido
      setError(false);
      setMessage("");
      Swal.fire({
         title: "¿Está seguro?",
         text: "Confirma que desea editar la empresa.", 
         icon: "warning",
         showCancelButton: true,
         confirmButtonText: "Sí, editar",
         cancelButtonText: "Cancelar",
      }).then(async (result) => {
         if (result.isConfirmed) {
            Swal.fire({
               title: "Creando empresa",
               text: "Por favor espere...",
               allowOutsideClick: false,
               didOpen: () => {
                  Swal.showLoading();
               },
            });
            const respuesta = await dispatch(Empresa_Editar_Thunks(formData));
            if (respuesta.success) {
               Swal.fire("¡Editado!", "La empresa ha sido editada exitosamente.", "success").then(
                  () => {
                     navigate("/empresas/lista");

                     setFormData({
                        nombre_clase: "",
                        descripcion_clase: "",
                        codigo_clase: "",
                        id_externos_clase: "",
                        es_inactivo: 1,
                     });
                  },
               );
            } else {
               Swal.close();
               setMessage(respuesta.message);
            }
         }
      });
   };

   const getInputStyle = (field) => {
      if (submitted && formData[field] === "") {
         return { border: "1px solid red" };
      }
      if (field === "correo_empresa" && submitted) {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(formData.correo_empresa)) {
            return { border: "1px solid red" };
         }
      }
      return { border: "1px solid #ced4da" };
   };

   return (
      <TarjetaRow
         texto="Editar una empresa"
         subtitulo="Vista esta pagina para editar una empresa"
      >
         {error && (
            <ErrorMessage
               error={error}
               message={message}
            />
         )}

         <div className="card-body">
            <div className="row">
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="nombre_empresa"
                     >
                        Nombre de la empresa
                     </label>
                     <input
                        type="text"
                        style={getInputStyle("nombre_empresa")}
                        className="form-control"
                        id="nombre_empresa"
                        name="nombre_empresa"
                        value={formData.nombre_empresa}
                        onChange={handleChange}
                        placeholder="Enter company name"
                     />
                  </div>
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="rnc_empresa"
                     >
                        RNC de la empresa
                     </label>
                     <input
                        type="text"
                        style={getInputStyle("rnc_empresa")}
                        className="form-control"
                        id="rnc_empresa"
                        name="rnc_empresa"
                        value={formData.rnc_empresa}
                        onChange={handleChange}
                        placeholder="Enter RNC"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label className="form-label">Teléfono de la empresa</label>
                     <input
                        type="text"
                        style={getInputStyle("telefono_empresa")}
                        className="form-control"
                        name="telefono_empresa"
                        value={formData.telefono_empresa}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                     />
                  </div>
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="correo_empresa"
                     >
                        Correo de la empresa
                     </label>
                     <input
                        type="text"
                        style={getInputStyle("correo_empresa")}
                        className="form-control"
                        id="correo_empresa"
                        name="correo_empresa"
                        value={formData.correo_empresa}
                        onChange={handleChange}
                        placeholder="Enter email"
                     />
                  </div>
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="direccion_empresa"
                     >
                        Dirección de la empresa
                     </label>
                     <textarea
                        style={getInputStyle("direccion_empresa")}
                        className="form-control"
                        id="direccion_empresa"
                        name="direccion_empresa"
                        value={formData.direccion_empresa}
                        onChange={handleChange}
                        rows="3"
                     ></textarea>
                  </div>
               </div>
            </div>
            <button
               onClick={handleSubmit}
               className="btn btn-dark mb-4"
            >
               Editar Registro
            </button>
         </div>
      </TarjetaRow>
   );
};

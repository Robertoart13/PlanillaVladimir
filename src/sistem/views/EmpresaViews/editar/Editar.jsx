import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useMemo, useRef, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Empresa_Editar_Thunks } from "../../../../store/Empresa/Empresa_Editar_Thunks";       
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Switch from '@mui/material/Switch';

export const EditarEmpresa = () => {
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");
   const [submitted, setSubmitted] = useState(false);
   const dispatch = useDispatch();
   const navigate = useNavigate();
   const [formData, setFormData] = useState({
      id_empresa: "",
      nombre_comercial: "",
      nombre_razon_social: "",
      cedula_juridica: "",
      nombre_contacto: "",
      correo_contacto: "",
      correo_facturacion: "",
      direccion: "",
      estado: 0,
   });

   const storedData = localStorage.getItem("selectedEmpresa");

   useEffect(() => {
      if (storedData) {
         const existingData = JSON.parse(storedData);
         console.log(existingData);
         setFormData({
            id_empresa: existingData.id_empresa,
            nombre_comercial: existingData.nombre_comercial_empresa,
            nombre_razon_social: existingData.nombre_razon_social_empresa,
            cedula_juridica: existingData.cedula_juridica_empresa,
            nombre_contacto: existingData.nombre_contacto_empresa,
            correo_contacto: existingData.correo_contacto_empresa,
            correo_facturacion: existingData.correo_facturacion_empresa,
            direccion: existingData.direccion_empresa,
            estado: existingData.estado_empresa,
         });
      } else {
         setError(true);
         setFormData({
            id_empresa: "",
            nombre_comercial: "",
            nombre_razon_social: "",
            cedula_juridica: "",
            nombre_contacto: "",
            correo_contacto: "",
            correo_facturacion: "",
            direccion: "",
            estado: 0,
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
      if (
         !emailRegex.test(formData.correo_contacto) ||
         !emailRegex.test(formData.correo_facturacion)
      ) {
         setError(true);
         setMessage("Por favor, ingrese correos electrónicos válidos.");
         return;
      }
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
               title: "Editando empresa",
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
                        id_empresa: "",
                        nombre_comercial: "",
                        nombre_razon_social: "",
                        cedula_juridica: "",
                        nombre_contacto: "",
                        correo_contacto: "",
                        correo_facturacion: "",
                        direccion: "",
                        estado: 0,
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
      if ((field === "correo_contacto" || field === "correo_facturacion") && submitted) {
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(formData[field])) {
            return { border: "1px solid red" };
         }
      }
      return { border: "1px solid #ced4da" };
   };

   const handleSwitchChange = () => {
      setFormData({ ...formData, estado: formData.estado === 1 ? 0 : 1 });
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
            <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="estado"
                     >
                        {formData.estado === 1 ? "Empresa Activa" : "Empresa Inactiva"}
                     </label>
                     <Switch
                        checked={formData.estado === 1}
                        onChange={handleSwitchChange}
                        name="estado"
                        inputProps={{ 'aria-label': 'controlled' }}
                     />
                  </div>
               <div className="col-md-6">
                  
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="nombre_comercial"
                     >
                        Nombre Comercial
                     </label>
                     <input
                        type="text"
                        style={getInputStyle("nombre_comercial")}
                        className="form-control"
                        id="nombre_comercial"
                        name="nombre_comercial"
                        value={formData.nombre_comercial}
                        onChange={handleChange}
                        placeholder="Enter commercial name"
                     />
                  </div>
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="nombre_razon_social"
                     >
                        Nombre de Razón Social
                     </label>
                     <input
                        type="text"
                        style={getInputStyle("nombre_razon_social")}
                        className="form-control"
                        id="nombre_razon_social"
                        name="nombre_razon_social"
                        value={formData.nombre_razon_social}
                        onChange={handleChange}
                        placeholder="Enter social reason name"
                     />
                  </div>
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="cedula_juridica"
                     >
                        Cédula Jurídica
                     </label>
                     <input
                        type="text"
                        style={getInputStyle("cedula_juridica")}
                        className="form-control"
                        id="cedula_juridica"
                        name="cedula_juridica"
                        value={formData.cedula_juridica}
                        onChange={handleChange}
                        placeholder="Enter legal ID"
                     />
                  </div>
               </div>
               <div className="col-md-6">
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="nombre_contacto"
                     >
                        Nombre de Contacto
                     </label>
                     <input
                        type="text"
                        style={getInputStyle("nombre_contacto")}
                        className="form-control"
                        id="nombre_contacto"
                        name="nombre_contacto"
                        value={formData.nombre_contacto}
                        onChange={handleChange}
                        placeholder="Enter contact name"
                     />
                  </div>
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="correo_contacto"
                     >
                        Correo de Contacto
                     </label>
                     <input
                        type="text"
                        style={getInputStyle("correo_contacto")}
                        className="form-control"
                        id="correo_contacto"
                        name="correo_contacto"
                        value={formData.correo_contacto}
                        onChange={handleChange}
                        placeholder="Enter contact email"
                     />
                  </div>
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="correo_facturacion"
                     >
                        Correo de Facturación
                     </label>
                     <input
                        type="text"
                        style={getInputStyle("correo_facturacion")}
                        className="form-control"
                        id="correo_facturacion"
                        name="correo_facturacion"
                        value={formData.correo_facturacion}
                        onChange={handleChange}
                        placeholder="Enter billing email"
                     />
                  </div>
                  <div className="mb-3">
                     <label
                        className="form-label"
                        htmlFor="direccion"
                     >
                        Dirección
                     </label>
                     <textarea
                        style={getInputStyle("direccion")}
                        className="form-control"
                        id="direccion"
                        name="direccion"
                        value={formData.direccion}
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
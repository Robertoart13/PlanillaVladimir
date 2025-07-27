import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Empresa_Editar_Thunks } from "../../../../store/Empresa/Empresa_Editar_Thunks";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Switch from '@mui/material/Switch';
import { usePermiso } from "../../../../hooks/usePermisos";

/**
 * Componente principal para editar una empresa existente.
 * @returns {JSX.Element} El componente de edición de empresa.
 */
export const EditarEmpresa = () => {

    
    // Estado para manejar errores y mensajes
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initializeFormData());

    const storedData = localStorage.getItem("selectedEmpresa");

    useEffect(() => {
        if (storedData) {
            const existingData = JSON.parse(storedData);
            populateFormData(existingData);
        } else {
            handleNoSelectedEmpresa();
        }
    }, [storedData, navigate]);

    /**
     * Inicializa los datos del formulario.
     * @returns {Object} Objeto con los campos del formulario inicializados.
     */
    function initializeFormData() {
        return {
            id_empresa: "",
            nombre_comercial: "",
            nombre_razon_social: "",
            cedula_juridica: "",
            nombre_contacto: "",
            correo_contacto: "",
            correo_facturacion: "",
            direccion: "",
            estado: 0,
            porcentaje: 0,
        };
    }

    /**
     * Llena los datos del formulario con la información existente.
     * @param {Object} existingData - Datos existentes de la empresa.
     */
    function populateFormData(existingData) {
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
            porcentaje: existingData.porcentaje_empresa || 0,
        });
    }

    /**
     * Maneja el caso en que no se ha seleccionado ninguna empresa.
     */
    function handleNoSelectedEmpresa() {
        setError(true);
        setFormData(initializeFormData());
        setMessage("No se ha seleccionado ninguna empresa.");
        setTimeout(() => {
            navigate("/empresas/lista");
        }, 3000);
    }

    /**
     * Maneja el cambio de los campos del formulario.
     * @param {Object} e - Evento de cambio del input.
     */
    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    /**
     * Valida los campos del formulario.
     * @returns {boolean} Verdadero si el formulario es válido, falso de lo contrario.
     */
    function validateForm() {
        if (Object.values(formData).some((field) => field === "")) {
            setError(true);
            setMessage("Todos los campos deben estar llenos.");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.correo_contacto) || !emailRegex.test(formData.correo_facturacion)) {
            setError(true);
            setMessage("Por favor, ingrese correos electrónicos válidos.");
            return false;
        }
        setError(false);
        setMessage("");
        return true;
    }

    /**
     * Maneja el envío del formulario.
     * @param {Object} e - Evento de envío del formulario.
     */
    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
        if (!validateForm()) return;

        const userConfirmed = await showConfirmationDialog();
        if (userConfirmed) {
            await editEmpresa();
        }
    }

    /**
     * Muestra un diálogo de confirmación al usuario.
     * @returns {Promise<boolean>} Promesa que resuelve a verdadero si el usuario confirma, falso de lo contrario.
     */
    function showConfirmationDialog() {
        return Swal.fire({
            title: "¿Está seguro?",
            text: "Confirma que desea editar la empresa.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, editar",
            cancelButtonText: "Cancelar",
        }).then((result) => result.isConfirmed);
    }

    /**
     * Edita una empresa utilizando los datos del formulario.
     */
    async function editEmpresa() {
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
            Swal.fire("¡Editado!", "La empresa ha sido editada exitosamente.", "success").then(() => {
                navigate("/empresas/lista");
                setFormData(initializeFormData());
            });
        } else {
            Swal.close();
            setMessage(respuesta.message);
        }
    }

    /**
     * Obtiene el estilo de los inputs basado en la validación.
     * @param {string} field - Nombre del campo a validar.
     * @returns {Object} Estilo CSS para el input.
     */
    function getInputStyle(field) {
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
    }

    /**
     * Maneja el cambio del estado de la empresa.
     */
    function handleSwitchChange() {
        setFormData({ ...formData, estado: formData.estado === 1 ? 0 : 1 });
    }

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
                        <label className="form-label" htmlFor="estado">
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
                        {renderInputField("nombre_comercial", "Nombre Comercial", "Enter commercial name")}
                        {renderInputField("nombre_razon_social", "Nombre de Razón Social", "Enter social reason name")}
                        {renderInputField("cedula_juridica", "Cédula Jurídica", "Enter legal ID")}
                    </div>
                    <div className="col-md-6">
                        {renderInputField("nombre_contacto", "Nombre de Contacto", "Enter contact name")}
                        {renderInputField("correo_contacto", "Correo de Contacto", "Enter contact email")}
                        {renderInputField("correo_facturacion", "Correo de Facturación", "Enter billing email")}
                        {renderInputField("porcentaje", "Porcentaje a Cobrar", "Enter percentage", "number")}
                        {renderTextAreaField("direccion", "Dirección", "Enter address")}
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

    /**
     * Renderiza un campo de entrada de texto.
     * @param {string} field - Nombre del campo.
     * @param {string} label - Etiqueta del campo.
     * @param {string} placeholder - Texto de marcador de posición.
     * @param {string} type - Tipo de input (opcional, por defecto "text").
     * @returns {JSX.Element} El campo de entrada de texto.
     */
    function renderInputField(field, label, placeholder, type = "text") {
        return (
            <div className="mb-3">
                <label className="form-label" htmlFor={field}>{label}</label>
                <input
                    type={type}
                    style={getInputStyle(field)}
                    className="form-control"
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={placeholder}
                />
            </div>
        );
    }

    /**
     * Renderiza un campo de área de texto.
     * @param {string} field - Nombre del campo.
     * @param {string} label - Etiqueta del campo.
     * @param {string} placeholder - Texto de marcador de posición.
     * @returns {JSX.Element} El campo de área de texto.
     */
    function renderTextAreaField(field, label, placeholder) {
        return (
            <div className="mb-3">
                <label className="form-label" htmlFor={field}>{label}</label>
                <textarea
                    style={getInputStyle(field)}
                    className="form-control"
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    rows="3"
                ></textarea>
            </div>
        );
    }
};
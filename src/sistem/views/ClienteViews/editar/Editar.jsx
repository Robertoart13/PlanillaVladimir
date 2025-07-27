import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useDispatch } from "react-redux";
import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";
import { useNavigate } from "react-router-dom";
import { Switch } from "@mui/material";
import { Cliente_Editar_Thunks } from "../../../../store/Clientes/Clientes_Editar_Thunks";

/**
 * Inicializa el estado del formulario con valores vacíos o por defecto.
 */
function inicializarDatosFormulario() {
    return {
        id_usuario: "",
        nombre_usuario: "",
        email_usuario: "",
        password_hash_usuario: "",
        password_hash_usuario_vieja: "",
        id_empresa_usuario: "",
        rol_usuario: "",
        estado_usuario: "",
        clave_llena: false,
    };
}

/**
 * Hook personalizado para manejar el formulario de edición de cliente.
 */
function useEditarClienteForm() {
    const [formData, setFormData] = useState(inicializarDatosFormulario());
    const [formErrors, setFormErrors] = useState({});
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Cargar empresas al montar el componente
    useEffect(() => {
        const fetchEmpresas = async () => {
            setLoading(true);
            const empresasData = await dispatch(SelectOpcion_Thunks("empresas/select"));
            if (empresasData.success) {
                setEmpresas(empresasData.data.array);
            } else {
                Swal.fire("Error", empresasData.message, "error");
            }
            setLoading(false);
        };
        fetchEmpresas();
    }, [dispatch]);

    // Cargar datos del cliente seleccionado desde localStorage
    useEffect(() => {
        const storedData = localStorage.getItem("selectedCliente");
        if (storedData) {
            const existingData = JSON.parse(storedData);
            setFormData({
                id_usuario: existingData.id_usuario,
                nombre_usuario: existingData.nombre_usuario,
                email_usuario: existingData.email_usuario,
                password_hash_usuario: "",
                password_hash_usuario_vieja: existingData.password_hash_usuario,
                id_empresa_usuario: existingData.id_empresa_usuario,
                rol_usuario: existingData.rol_usuario,
                estado_usuario: existingData.estado_usuario,
                clave_llena: false,
            });
        }
    }, [navigate]);

    /**
     * Valida el formato del email.
     */
    const validateEmail = (email) => {
        const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return re.test(String(email).toLowerCase());
    };

    /**
     * Genera una contraseña aleatoria y la coloca en el formulario.
     */
    const generatePassword = useCallback(() => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        let result = "";
        for (let i = 0; i < 7; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setFormData((prevData) => ({
            ...prevData,
            password_hash_usuario: result,
            clave_llena: true,
        }));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            password_hash_usuario: false,
        }));
    }, []);

    /**
     * Maneja los cambios en los inputs del formulario.
     */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
            ...(name === "password_hash_usuario" && { clave_llena: !!value }),
        }));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: !value,
        }));
    }, []);

    /**
     * Maneja el cambio del switch de estado del usuario.
     */
    const handleSwitchChange = useCallback((event) => {
        setFormData((prevData) => ({
            ...prevData,
            estado_usuario: event.target.checked ? 1 : 0,
        }));
    }, []);

    /**
     * Devuelve el estilo del input según si tiene error o no.
     */
    const getInputStyle = (field) => ({
        border: formErrors[field] ? "1px solid red" : "1px solid #ced4da",
    });

    /**
     * Valida el formulario antes de enviar.
     */
    const validateForm = () => {
        const errors = {};
        for (let key in formData) {
            if (
                key !== "password_hash_usuario" &&
                key !== "clave_llena" &&
                (formData[key] === "" || formData[key] === null || formData[key] === undefined)
            ) {
                errors[key] = true;
            }
        }
        if (!validateEmail(formData.email_usuario)) {
            errors["email_usuario"] = true;
            Swal.fire("Error", "El correo electrónico no tiene un formato válido", "error");
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    return {
        formData,
        setFormData,
        formErrors,
        empresas,
        loading,
        handleChange,
        handleSwitchChange,
        getInputStyle,
        generatePassword,
        validateForm,
        dispatch,
        navigate,
    };
}

/**
 * Componente principal para editar un cliente.
 */
export const EditarCliente = () => {
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    const {
        formData,
        formErrors,
        empresas,
        loading,
        handleChange,
        handleSwitchChange,
        getInputStyle,
        generatePassword,
        validateForm,
        dispatch,
        navigate,
    } = useEditarClienteForm();

    /**
     * Maneja el envío del formulario.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            Swal.fire("Error", "Por favor completa todos los campos obligatorios", "error");
            return;
        }
        Swal.fire({
            title: "¿Está seguro?",
            text: "¿Está seguro de que desea editar este cliente?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, editar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Editando cliente",
                    text: "Por favor espere...",
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });
                const respuesta = await dispatch(Cliente_Editar_Thunks(formData));
                if (respuesta.success) {
                    Swal.fire(
                        "¡Editado!",
                        "El cliente ha sido editado exitosamente.",
                        "success",
                    ).then(() => {
                        navigate("/clientes/lista");
                    });
                } else {
                    Swal.fire("Error", respuesta.message, "error");
                }
            }
        });
    };

    return (
        <TarjetaRow
            texto="Editar cliente"
            subtitulo="Vista para editar un cliente existente"
        >
            {error && <ErrorMessage error={error} message={message} />}

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="mb-3">
                        <label className="form-label" htmlFor="estado_usuario">
                            Estado Usuario
                        </label>
                        <Switch
                            checked={formData.estado_usuario === 1}
                            onChange={handleSwitchChange}
                            name="estado_usuario"
                            inputProps={{ "aria-label": "controlled" }}
                        />
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label" htmlFor="nombre_usuario">
                                Nombre Usuario
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="nombre_usuario"
                                name="nombre_usuario"
                                placeholder="Nombre completo o alias"
                                value={formData.nombre_usuario}
                                onChange={handleChange}
                                style={getInputStyle("nombre_usuario")}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="email_usuario">
                                Email Usuario
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                id="email_usuario"
                                name="email_usuario"
                                placeholder="Correo electrónico"
                                value={formData.email_usuario}
                                onChange={handleChange}
                                style={getInputStyle("email_usuario")}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="password_hash_usuario">
                                Clave de Usuario
                            </label>
                            <br />
                            <small style={{ color: "red" }}>
                                Este campo solo se llena si se desea cambiar la clave.
                            </small>
                            <input
                                type="text"
                                className="form-control"
                                id="password_hash_usuario"
                                name="password_hash_usuario"
                                placeholder="Contraseña"
                                value={formData.password_hash_usuario}
                                onChange={handleChange}
                                style={getInputStyle("password_hash_usuario")}
                            />
                            <button
                                type="button"
                                className="btn btn-secondary mt-2"
                                onClick={generatePassword}
                            >
                                Generar Contraseña
                            </button>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label" htmlFor="id_empresa_usuario">
                                Empresa Usuario
                            </label>
                            {loading ? (
                                <p>Cargando empresas...</p>
                            ) : (
                                <select
                                    className="form-control"
                                    id="id_empresa_usuario"
                                    name="id_empresa_usuario"
                                    value={formData.id_empresa_usuario}
                                    onChange={handleChange}
                                    style={getInputStyle("id_empresa_usuario")}
                                >
                                    <option value="">Escoger una empresa</option>
                                    {empresas.map((empresa) => (
                                        <option
                                            key={empresa.id_empresa}
                                            value={empresa.id_empresa}
                                        >
                                            {empresa.nombre_comercial_empresa}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="rol_usuario">
                                Rol Usuario &nbsp;
                                <span
                                    className="help-icon"
                                    title={`Usuario: Acceso limitado a funciones básicas y solo podrá ver los empleados asignados. \n Supervisor: Acceso a funciones avanzadas y gestión de usuarios.`}
                                >
                                    &#9432;
                                </span>
                            </label>
                            <select
                                className="form-control"
                                id="rol_usuario"
                                name="rol_usuario"
                                value={formData.rol_usuario}
                                onChange={handleChange}
                                style={getInputStyle("rol_usuario")}
                            >
                                <option value="">Escoger un rol</option>
                                <option value="usuario">Usuario</option>
                                <option value="supervisor">Supervisor</option>
                            </select>
                        </div>
                    </div>
                </div>
                <br />
                <button type="submit" className="btn btn-dark mb-4">
                    Editar Registro
                </button>
            </form>
        </TarjetaRow>
    );
};

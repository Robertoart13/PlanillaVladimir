import React, { useEffect, useState, useCallback } from "react";
import Swal from 'sweetalert2';
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useDispatch } from 'react-redux';
import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";
import { useNavigate } from "react-router-dom";
import { Cliente_Crear_Thunks } from "../../../../store/Clientes/Clientes_Crear_Thunks";

/**
 * Inicializa el estado del formulario de cliente.
 */
const getInitialFormState = () => ({
    nombre_usuario: "",
    email_usuario: "",
    password_hash_usuario: "",
    id_empresa_usuario: "",
    rol_usuario: ""
});

/**
 * Valida el formato de un correo electrónico.
 * @param {string} email 
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(String(email).toLowerCase());
};

/**
 * Genera una contraseña aleatoria segura.
 * @returns {string}
 */
const generateRandomPassword = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let result = "";
    for (let i = 0; i < 7; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

/**
 * Componente principal para crear un nuevo cliente.
 */
export const CrearCliente = () => {
    // Estados principales
    const [formData, setFormData] = useState(getInitialFormState());
    const [formErrors, setFormErrors] = useState({});
    const [empresas, setEmpresas] = useState([]);
    const [loadingEmpresas, setLoadingEmpresas] = useState(true);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /**
     * Obtiene la lista de empresas desde la API.
     */
    const fetchEmpresas = useCallback(async () => {
        setLoadingEmpresas(true);
        const empresasData = await dispatch(SelectOpcion_Thunks("empresas/select"));
        if (empresasData.success) {
            setEmpresas(empresasData.data.array);
        } else {
            Swal.fire('Error', empresasData.message, 'error');
        }
        setLoadingEmpresas(false);
    }, [dispatch]);

    useEffect(() => {
        fetchEmpresas();
    }, [fetchEmpresas]);

    /**
     * Maneja el cambio de cualquier input del formulario.
     * @param {object} e 
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validación básica en tiempo real
        setFormErrors(prev => ({
            ...prev,
            [name]: !value
        }));

        // Si es el campo de contraseña, limpiar error específico
        if (name === 'password_hash_usuario') {
            setFormErrors(prev => ({ ...prev, password_hash_usuario: false }));
        }
    };

    /**
     * Genera y asigna una contraseña aleatoria al formulario.
     */
    const handleGeneratePassword = () => {
        const newPassword = generateRandomPassword();
        setFormData(prev => ({ ...prev, password_hash_usuario: newPassword }));
        setFormErrors(prev => ({ ...prev, password_hash_usuario: false }));
    };

    /**
     * Devuelve el estilo del input según si hay error.
     * @param {string} field 
     */
    const getInputStyle = (field) => ({
        border: formErrors[field] ? "1px solid red" : "1px solid #ced4da"
    });

    /**
     * Valida el formulario y retorna un objeto con los errores.
     * @returns {object}
     */
    const validateForm = () => {
        const errors = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (!value) errors[key] = true;
        });
        if (formData.email_usuario && !isValidEmail(formData.email_usuario)) {
            errors.email_usuario = true;
        }
        return errors;
    };

    /**
     * Maneja el envío del formulario.
     * @param {object} e 
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            if (errors.email_usuario) {
                Swal.fire('Error', 'El correo electrónico no tiene un formato válido', 'error');
            } else {
                Swal.fire('Error', 'Por favor completa todos los campos obligatorios', 'error');
            }
            return;
        }

        const confirm = await Swal.fire({
            title: '¿Está seguro?',
            text: "¿Está seguro de que desea crear este cliente?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, crear'
        });

        if (!confirm.isConfirmed) return;

        Swal.fire({
            title: "Creando cliente",
            text: "Por favor espere...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        const respuesta = await dispatch(Cliente_Crear_Thunks(formData));
        if (respuesta.success) {
            Swal.fire("¡Creado!", "El cliente ha sido creado exitosamente.", "success")
                .then(() => navigate("/clientes/lista"));
        } else {
            Swal.fire('Error', respuesta.message, 'error');
        }
    };

    return (
        <TarjetaRow texto="Crear un nuevo cliente" subtitulo="Vista esta pagina para crear un nuevo cliente">
            {error && <ErrorMessage error={error} message={message} />}

            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="row">
                    {/* Columna izquierda: datos básicos */}
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label" htmlFor="nombre_usuario">Nombre Usuario</label>
                            <input
                                type="text"
                                className="form-control"
                                id="nombre_usuario"
                                name="nombre_usuario"
                                placeholder="Nombre completo o alias"
                                value={formData.nombre_usuario}
                                onChange={handleInputChange}
                                style={getInputStyle("nombre_usuario")}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="email_usuario">Email Usuario</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email_usuario"
                                name="email_usuario"
                                placeholder="Correo electrónico"
                                value={formData.email_usuario}
                                onChange={handleInputChange}
                                style={getInputStyle("email_usuario")}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="password_hash_usuario">Clave de Usuario</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="password_hash_usuario"
                                    name="password_hash_usuario"
                                    placeholder="Contraseña"
                                    value={formData.password_hash_usuario}
                                    onChange={handleInputChange}
                                    style={getInputStyle("password_hash_usuario")}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleGeneratePassword}
                                    tabIndex={-1}
                                >
                                    Generar
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Columna derecha: empresa y rol */}
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label" htmlFor="id_empresa_usuario">Empresa Usuario</label>
                            {loadingEmpresas ? (
                                <p>Cargando empresas...</p>
                            ) : (
                                <select
                                    className="form-control"
                                    id="id_empresa_usuario"
                                    name="id_empresa_usuario"
                                    value={formData.id_empresa_usuario}
                                    onChange={handleInputChange}
                                    style={getInputStyle("id_empresa_usuario")}
                                >
                                    <option value="">Escoger una empresa</option>
                                    {empresas.map(empresa => (
                                        <option key={empresa.id_empresa} value={empresa.id_empresa}>
                                            {empresa.nombre_comercial_empresa}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="rol_usuario">
                                Rol Usuario&nbsp;
                                <span
                                    className="help-icon"
                                    title={`Usuario: Acceso limitado a funciones básicas y solo podrá ver los empleados asignados.\nSupervisor: Acceso a funciones avanzadas y gestión de usuarios.`}
                                    style={{ cursor: "help" }}
                                >
                                    &#9432;
                                </span>
                            </label>
                            <select
                                className="form-control"
                                id="rol_usuario"
                                name="rol_usuario"
                                value={formData.rol_usuario}
                                onChange={handleInputChange}
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
                <button type="submit" className="btn btn-dark mb-4">Crear Registro</button>
            </form>
        </TarjetaRow>
    );
};

import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";

import { useDispatch } from 'react-redux';
import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";

function inicializarDatosFormulario() {
    return {
        nombre_usuario: "",
        email_usuario: "",
        password_hash_usuario: "",
        id_empresa_usuario: "",
        rol_usuario: ""
    };
}

export const CrearCliente = () => {
    const [error, setError] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [formErrors, setFormErrors] = React.useState({});
    const [formData, setFormData] = React.useState(inicializarDatosFormulario());
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchEmpresas = async () => {
            setLoading(true);
            const empresasData = await dispatch(SelectOpcion_Thunks("empresas/select"));
            console.log(empresasData);
            if (empresasData.success) {
                setEmpresas(empresasData.data.array);
            } else {
                Swal.fire('Error', empresasData.message, 'error');
            }
            setLoading(false);
        };
        fetchEmpresas();
    }, [dispatch]);

    const generatePassword = () => {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        let result = "";
        for (let i = 0; i < 7; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setPassword(result);
        setFormData(prevData => ({ ...prevData, password_hash_usuario: result }));
        setFormErrors(prevErrors => ({ ...prevErrors, password_hash_usuario: false }));
    };

    const validateEmail = (email) => {
        const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return re.test(String(email).toLowerCase());
    };

    const getInputStyle = (field) => {
        if (formErrors[field]) {
            return { border: "1px solid red" };
        }
        return { border: "1px solid #ced4da" };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        setFormErrors(prevErrors => ({ ...prevErrors, [name]: !value }));
        if (name === 'password_hash_usuario') {
            setFormErrors(prevErrors => ({ ...prevErrors, password_hash_usuario: false }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = {};

        // Check for empty fields
        for (let key in formData) {
            if (!formData[key]) {
                errors[key] = true;
            }
        }

        // Validate email format
        if (!validateEmail(formData.email_usuario)) {
            errors['email_usuario'] = true;
            Swal.fire('Error', 'El correo electrónico no tiene un formato válido', 'error');
        }

        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            Swal.fire({
                title: '¿Está seguro?',
                text: "¿Está seguro de que desea crear este cliente?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, crear'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire('Éxito', 'El registro ha sido creado exitosamente', 'success');
                }
            });
        } else {
            Swal.fire('Error', 'Por favor completa todos los campos obligatorios', 'error');
        }
    };

    return (
        <>
            <TarjetaRow texto="Crear un nuevo cliente" subtitulo="Vista esta pagina para crear un nuevo cliente">
                {error && <ErrorMessage error={error} message={message} />}

                <form onSubmit={handleSubmit}>
                    <div className="row">
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
                                    onChange={handleChange}
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
                                    onChange={handleChange}
                                    style={getInputStyle("email_usuario")}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="password_hash_usuario">Clave de Usuario</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="password_hash_usuario"
                                    name="password_hash_usuario"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={getInputStyle("password_hash_usuario")}
                                />
                                <button type="button" className="btn btn-secondary mt-2" onClick={generatePassword}>Generar Contraseña</button>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label" htmlFor="id_empresa_usuario">Empresa Usuario</label>
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
                                        {empresas.map(empresa => (
                                            <option key={empresa.id_empresa} value={empresa.id_empresa}>
                                                {empresa.nombre_comercial_empresa}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="rol_usuario">Rol Usuario &nbsp; 
                                    <span className="help-icon" title={`Usuario: Acceso limitado a funciones básicas y solo podra ver los empleados asignados. \n Supervisor: Acceso a funciones avanzadas y gestión de usuarios.`}>
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
                    <br/>
                    <button type="submit" className="btn btn-dark mb-4">Crear Registro</button>
                </form>
            </TarjetaRow>
        </>
    );
};

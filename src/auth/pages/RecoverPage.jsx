import { Link } from "react-router-dom";
import { AuthLayout } from "../layout/AuthLayout";

export const RecoverPage = () => {
   return (
      <AuthLayout>
         <div className="text-center">
         <img
               src="/img/1.png"
               alt="Logo"
               className="img-fluid mb-4"
               width={250}
            />
            <div class="saprator my-1">
                <span>Recuperar contraseña</span>
              </div>
         </div>
         <div className="mb-3">
            <input
               type="email"
               className="form-control"
               id="floatingInput"
               placeholder="Correo electrónico"
            />
         </div>
         <div className="d-flex mt-1 justify-content-between align-items-center">
            <Link
               to="/auth/login"
               className="text-decoration-none"
            >
               <h6 className="f-w-400 mb-0">¿Ya tienes una cuenta?</h6>
            </Link>
         </div>
         <div className="d-grid mt-4">
            <button
               type="button"
               className="btn btn-dark"
            >
               Recuperar contraseña
            </button>
         </div>
      </AuthLayout>
   );
};

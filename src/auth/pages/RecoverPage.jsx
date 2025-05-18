import { Link } from "react-router-dom";

export const RecoverPage = () => {
   return (
      <div className="auth-main v1">
         <div className="auth-wrapper">
            <div className="auth-form">
               <div className="card my-5">
                  <div className="card-body">
                     <div className="text-center">
                        <img src="/img/logo.svg" alt="images" className="img-fluid mb-4" width={200} />
                        <h4 className="f-w-800 mb-1">Recuperar contraseña</h4>
                        <br />
                     </div>
                     <div className="mb-3">
                        <input type="email" className="form-control" id="floatingInput" placeholder="Correo electrónico" />
                     </div>
                     <div className="d-flex mt-1 justify-content-between align-items-center">
                        <Link to="/auth/login" className="text-decoration-none"><h6 className="f-w-400 mb-0">¿Ya tienes una cuenta?</h6></Link>
                     </div>
                     <div className="d-grid mt-4">
                        <button type="button" className="btn btn-dark">Recuperar contraseña</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

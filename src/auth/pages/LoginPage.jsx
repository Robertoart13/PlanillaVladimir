export const LoginPage = () => {
   return (
      <>

         <div className="auth-main v1">
            <div className="auth-wrapper">
               <div className="auth-form">
                  <div className="card my-5">
                     <div className="card-body">
                        <div className="text-center">
                           <img src="/img/logo.svg" alt="images" className="img-fluid mb-4" width={200} />
                           <h4 className="f-w-800 mb-1">Iniciar sesión con tu correo electrónico</h4>
                           <br />
                        </div>
                        <div className="mb-3">
                           <input type="email" className="form-control" id="floatingInput" placeholder="Email Address" />
                        </div>
                        <div className="mb-3">
                           <input type="password" className="form-control" id="floatingInput1" placeholder="Password" />
                        </div>
                        <div className="d-flex mt-1 justify-content-between align-items-center">
                           <div className="form-check">
                              <input className="form-check-input input-dark" type="checkbox" id="customCheckc1" />
                              <label className="form-check-label text-muted" htmlFor="customCheckc1">Recordarme</label>
                           </div>
                           <a href="../pages/forgot-password-v1.html"><h6 className="f-w-400 mb-0">¿Olvidaste tu contraseña?</h6></a>
                        </div>
                        <div className="d-grid mt-4">
                           <button type="button" className="btn btn-dark">Iniciar sesión</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};

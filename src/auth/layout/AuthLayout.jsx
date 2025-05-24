
export const AuthLayout = ({ children }) => {
    return (
        <div className="auth-main v1">
            <div className="auth-wrapper">
                <div className="auth-form">
                    <div className="card my-6">
                        <div className="card-body">
                            {/* {sasas} */}
                           {children}
                           <div className="saprator my-3">
                                <span>© {new Date().getFullYear()} GT3 Gestión Tributaria y tercerización</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
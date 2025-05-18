import "./Entrance.css";

export const LayoutEntrance = ({ children }) => {
    return (
        <div className="auth-main v1">
            <div className="auth-wrapper">
                <div className="lettering">
                    
                        
                            {/* {sasas} */}
                           {children}
                        
                    
                </div>
            </div>
        </div>
    );
};
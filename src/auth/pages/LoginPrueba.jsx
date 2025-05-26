import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import "./styles.css";
import SignInForm from "./SignIn";
import SignUpForm from "./SignUp";

export const LoginPrueba = () => {
   const [isVisible, setIsVisible] = useState(false);

   useEffect(() => {
      // Automatically show the box after 1 second
      const timer = setTimeout(() => {
         setIsVisible(true);
      }, 1000);

      // Cleanup the timer on unmount
      return () => clearTimeout(timer);
   }, []);

   const [type, setType] = useState("signIn");
   const handleOnClick = (text) => {
      if (text !== type) {
         setType(text);
         return;
      }
   };
   const containerClass = "container " + (type === "signUp" ? "right-panel-active" : "");

   return (
      <div style={container}>
         <AnimatePresence initial={false}>
            {isVisible ? (
               <>
                  <div className="App">
                     <h2>Sign in/up Form</h2>
                     <div
                        className={containerClass}
                        id="container"
                     >
                        <SignUpForm />
                        <SignInForm />
                        <div className="overlay-container">
                           <div className="overlay">
                              <div className="overlay-panel overlay-left">
                                 <h1>Welcome Back!</h1>
                                 <p>
                                    To keep connected with us please login with your personal info
                                 </p>
                                 <button
                                    className="ghost"
                                    id="signIn"
                                    onClick={() => handleOnClick("signIn")}
                                 >
                                    Sign In
                                 </button>
                              </div>
                              <div className="overlay-panel overlay-right">
                                 <h1>Hello, Friend!</h1>
                                 <p>Enter your personal details and start journey with us</p>
                                 <button
                                    className="ghost "
                                    id="signUp"
                                    onClick={() => handleOnClick("signUp")}
                                 >
                                    Sign Up
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </>
            ) : null}
         </AnimatePresence>
         <motion.button
            style={button}
            onClick={() => setIsVisible(!isVisible)}
            whileTap={{ y: 1 }}
         >
            {isVisible ? "Hide" : "Show"}
         </motion.button>
      </div>
   );
};

//styles

const container = {
   display: "flex",
   flexDirection: "column",
   width: "100%",
   height: "auto",
   position: "center",
};

const box = {
   width: 100,
   height: 100,
   backgroundColor: "#0cdcf7",
   borderRadius: "10px",
};

const button = {
   backgroundColor: "#0cdcf7",
   borderRadius: "10px",
   padding: "10px 20px",
   color: "#0f1115",
   position: "absolute",
   bottom: 0,
   left: 0,
   right: 0,
};

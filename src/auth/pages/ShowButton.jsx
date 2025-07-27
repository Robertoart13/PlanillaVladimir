import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export default function ExitAnimation() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Automatically show the box after 1 second
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 1000);

        // Cleanup the timer on unmount
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={container}>
            <AnimatePresence initial={false}>
                {isVisible ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        style={box}
                        key="box"
                    />
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
}

/**
 * ==============   Styles   ================
 */

const container = {
    display: "flex",
    flexDirection: "column",
    width: 100,
    height: 160,
    position: "relative",
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
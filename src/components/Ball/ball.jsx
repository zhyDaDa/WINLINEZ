import React, { useState, useEffect, useCallback } from "react";
import * as motion from "motion/react-client";
import "./index.less";

const selfSize = 8,
    gridSize = 9,
    gridBorder = 0;

const ballStyle = {
    cursor: "pointer",
    width: `${selfSize}vmin`,
    height: `${selfSize}vmin`,
    position: "absolute",
    zIndex: 10,
};

const Ball = React.memo(
    ({ color, x, y, onclk, disp, trans }) => {
        let x_ =
                -selfSize / 2 +
                gridSize / 2 +
                gridBorder +
                y * (gridSize + 2 * gridBorder),
            y_ =
                -selfSize / 2 +
                gridSize / 2 +
                gridBorder +
                x * (gridSize + 2 * gridBorder);
        return (
            <motion.div
                initial={{ opacity: 0.6, scale: 0 }}
                animate={{ opacity: 1, scale: 0.9 }}
                exit={{ opacity: 0, scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={disp ? null : onclk}
                className="ball"
                // width="100%"
                // height="100%"
                style={
                    disp
                        ? {
                              width: "100%",
                              height: "100%",
                          }
                        : {
                              ...ballStyle,
                              // top: `calc(-50% - 4.5vmin + ${y * 10.2}vmin)`,
                              // left: `calc(-50% - 4.5vmin + ${x * 10.2}vmin)`,
                              top: `${y_}vmin`,
                              left: `${x_}vmin`,
                              transition: trans ? "top 0.3s, left 0.3s" : null,
                          }
                }
            >
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <circle cx="50%" cy="50%" r="45%" fill={color} />
                    <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="black"
                        fillOpacity="0.1"
                    />
                    <circle cx="48%" cy="48%" r="42%" fill={color} />
                    <circle
                        cx="40%"
                        cy="40%"
                        r="22%"
                        fill="white"
                        fillOpacity="0.08"
                    />
                </svg>
            </motion.div>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.x === nextProps.x &&
            prevProps.y === nextProps.y &&
            prevProps.color === nextProps.color
        );
    }
);

export default Ball;

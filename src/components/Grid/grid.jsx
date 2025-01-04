import React, { useState, useEffect, useCallback } from "react";
import * as motion from "motion/react-client";
import Ball from "../../components/Ball/ball";
import coolsole from "../../utils/coolsole";
import "./index.less";

const Grid = ({ i, j, v, maskShow, onClkShadow, disp, children }) => {
    return (
        <div className="grid">
            {disp ? (
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        // transform: "scale(0.8)",
                    }}
                >
                    {children}
                </div>
            ) : null}
            <>
                <svg width="100%" height="100%"></svg>

                <motion.div
                    className="grid-mask"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 0.5 }}
                    onClick={disp ? null : () => onClkShadow(i, j)}
                    style={{
                        // display: maskShow ? "block" : "none",
                        display: maskShow
                            ? "block"
                            : v != -1
                            ? "block"
                            : "none",
                        cursor: disp ? "default" : "pointer",
                    }}
                >
                    {/* {coolsole.info("GridRef", `(${i}, ${j}) ${!disp && selectFlag && selectPos[0] == i && selectPos[1] == j}`)} */}
                </motion.div>
            </>
        </div>
    );
};

export default Grid;

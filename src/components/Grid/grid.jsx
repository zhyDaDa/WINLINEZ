import React, { useState, useEffect, useCallback } from "react";
import * as motion from "motion/react-client";
import Ball from "../../components/Ball/ball";
import coolsole from "../../utils/coolsole";
import "./index.less";

const Grid = ({ i, j, v, maskShow, onClkShadow }) => {
    return (
        <div className="grid">
            <svg width="100%" height="100%"></svg>

            <motion.div
                className="grid-mask"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.5 }}
                onClick={() => onClkShadow(i, j)}
                style={{
                    display: maskShow ? "block" : "none",
                }}
            >
                {/* {coolsole.info("GridRef", `(${i}, ${j}) ${!disp && selectFlag && selectPos[0] == i && selectPos[1] == j}`)} */}
            </motion.div>
        </div>
    );
};

export default Grid;

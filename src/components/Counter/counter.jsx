/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./index.less";
import coolsole from "../../utils/coolsole";

function Counter({ count, setCount }) {
    return (
        <div className="counter">
            <h3>Counter: <span>{count}</span></h3>
            <div>
                <button onClick={() => setCount(count + 1)}>+</button>
                <button onClick={() => setCount(count - 1)}>-</button>
            </div>
            <button onClick={() => coolsole.info("Counter:",count)}>Log</button>
        </div>
    );
}

export default Counter;

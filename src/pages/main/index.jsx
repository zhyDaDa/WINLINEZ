import React, { useState, useEffect, useCallback } from "react";
import * as motion from "motion/react-client";
import Button from "../../components/Button/button";
import Counter from "../../components/Counter/counter";
import Grid from "../../components/Grid/grid";
import Ball from "../../components/Ball/ball";
import coolsole from "../../utils/coolsole";
import "./index.less";

class OBJ {
    constructor() {
        this.i = -1;
        this.j = -1;
        this.v = -1;
        this.maskShow = false;
    }
}

class B {
    constructor(x, y, v) {
        this.x = x || 0;
        this.y = y || 0;
        this.v = v || 0;
    }
}

const color = [
    "#7C0902",
    "#FF4F00",
    "#FFBF00",
    "#8DB600",
    "#007FFF",
    "#8A2BE2",
];
const getRanX = () => Math.floor(Math.random() * color.length);
const gameSize = { w: 9, h: 9 };
const getNewMap = () => {
    let map = [];
    for (let i = 0; i < gameSize.h; i++) {
        map[i] = [];
        for (let j = 0; j < gameSize.w; j++) {
            map[i][j] = new OBJ();
            map[i][j].i = i;
            map[i][j].j = j;
        }
    }
    return map;
};

const getVaccantPos = (map) => {
    let pos = [];
    for (let i = 0; i < gameSize.h; i++) {
        for (let j = 0; j < gameSize.w; j++) {
            if (map[i][j].v == -1) {
                pos.push([i, j]);
            }
        }
    }
    return pos;
};


const HomePage = () => {
    const [gameMap, setGameMap] = useState(getNewMap());
    const [balls, setBalls] = useState([]);
    const [hint, setHint] = useState([0, 0, 0]);
    const [selectFlag, setSelectFlag] = useState(false);
    const [selectIndex, setSelectIndex] = useState(-1);

    const selectBall = (i) => {
        coolsole.info("select", `(${i})`);
        setSelectFlag(true);
        setSelectIndex(i);
        setGameMap((prev) => {
            let map = prev;
            getVaccantPos(map).forEach((pos) => {
                map[pos[0]][pos[1]].maskShow = true;
            });
            return map;
        });
    };

    const moveBall = (index, target) => {
        let from = [balls[index].x, balls[index].y];
        setGameMap((prev) => {
            let map = prev;
            map[target[0]][target[1]].v = map[from[0]][from[1]].v;
            map[from[0]][from[1]].v = -1;
            return map;
        });
        setBalls((prev) => {
            let balls = prev;
            balls[index].x = target[0];
            balls[index].y = target[1];
            return balls;
        }); 
    };

    const clearSelect = () => {
        setSelectFlag(false);
        setSelectIndex(-1);
        setGameMap((prev) => {
            let map = prev;
            for(let i = 0; i < gameSize.h; i++) {
                for(let j = 0; j < gameSize.w; j++) {
                    map[i][j].maskShow = false;
                }
            }
            return map;
        });
    };
    const selectShadow = (i, j) => {
        coolsole.info("shadow", `(${i}, ${j})`);
        moveBall(selectIndex, [i, j]);
        clearSelect();
    };

    useEffect(() => {
        // 初始化, 随机5个位置生成随机颜色, 生成第一轮hint
        let init_num = 5;
        let map = getNewMap();
        let balls = [];
        let posCount = gameSize.w * gameSize.h;
        let pos = [];
        for (let i = 0; i < init_num; i++) {
            let ran = Math.floor(Math.random() * posCount);
            if (pos.includes(ran)) {
                i--;
                continue;
            }
            pos.push(ran);
        }
        for (let i = 0; i < init_num; i++) {
            let x = Math.floor(pos[i] / gameSize.w);
            let y = pos[i] % gameSize.w;
            map[x][y].v = getRanX();
            let ball = new B(x, y, map[x][y].v);
            balls.push(ball);
        }
        setGameMap(map);
        setBalls(balls);

        let hint = [];
        for (let i = 0; i < 3; i++) {
            hint.push(getRanX());
        }
        setHint(hint);
    }, []);

    return (
        <div id="layout">
            <div id="layout_l" className="layout">
                <h3>WINLINEZ</h3>
                {/* <Counter count={counter} setCount={setCounter} /> */}
                <button onClick={() => setGameMap(aaa)}>Set Game Map</button>
            </div>
            <div id="layout_r" className="layout">
                <section id="hint_panel">
                    <span>Next</span>
                    {hint.map((v, i) => (
                        <div key={i} className="cell">
                            <Grid v={v} disp={true} />
                        </div>
                    ))}
                    <span>Colors</span>
                </section>

                <hr />

                <section id="game_panel">
                    <div id="gameMap">
                        {gameMap.map((row, i) => (
                            <div key={i} className="row">
                                {row.map((obj, j) => (
                                    <div key={j} className="cell">
                                        <Grid
                                            i={i}
                                            j={j}
                                            v={obj.v}
                                            onclk={selectBall}
                                            selectFlag={selectFlag}
                                            selectPos={selectIndex}
                                            maskShow={obj.maskShow}
                                            onClkShadow={selectShadow}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                        {balls.map((ball, i) => (
                            <Ball key={i} color={color[ball.v]} x={ball.x} y={ball.y} onclk={()=>selectBall(i)} />
                        )
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;

import React, { useState, useEffect, useCallback } from "react";
import * as motion from "motion/react-client";
import Button from "../../components/Button/button";
import Counter from "../../components/Counter/counter";
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

const getAccessiblePos = (map, i, j) => {
    // 用BFS遍历所有可达的位置, 以及路径
    let pos = [];
    let queue = [{ x: i, y: j, route: [] }];
    let visited = new Set();
    let dir = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
    ];
    while (queue.length > 0) {
        let { x, y, route } = queue.shift();
        visited.add(`${x},${y}`);
        dir.forEach((d) => {
            let nx = x + d[0];
            let ny = y + d[1];
            if (
                nx >= 0 &&
                nx < gameSize.h &&
                ny >= 0 &&
                ny < gameSize.w &&
                map[nx][ny].v == -1 &&
                !visited.has(`${nx},${ny}`)
            ) {
                pos.push({ x: nx, y: ny, route: [...route, [nx, ny]] });
                queue.push({ x: nx, y: ny, route: [...route, [nx, ny]] });
            }
        });
    }
    return pos;
}

const Grid = ({
    i,
    j,
    v,
    onclk,
    selectFlag,
    selectPos,
    disp,
    maskShow,
    onshadow,
}) => {
    return (
        <motion.div
            className="grid"
            initial={{ opacity: 0.6, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.4,
                repeat:
                    !disp &&
                    selectFlag &&
                    selectPos[0] == i &&
                    selectPos[1] == j
                        ? Infinity
                        : 0,
                repeatType: "reverse",
                scale: {
                    type: "spring",
                    visualDuration: 0.4,
                    bounce: 0.5,
                },
            }}
        >
            {v == -1 ? (
                <svg width="100%" height="100%"></svg>
            ) : (
                <svg
                    onClick={() => onclk(i, j)}
                    className="ball"
                    width="100%"
                    height="100%"
                >
                    <circle cx="50%" cy="50%" r="45%" fill={color[v]} />
                    <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        fill="black"
                        fillOpacity="0.1"
                    />
                    <circle cx="48%" cy="48%" r="42%" fill={color[v]} />
                    <circle
                        cx="40%"
                        cy="40%"
                        r="22%"
                        fill="white"
                        fillOpacity="0.08"
                    />
                </svg>
            )}

            <div
                className="grid-mask"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0.0 }}
                transition={{
                    duration: 0.4,
                    repeat: maskShow ? Infinity : 0,
                    repeatType: "reverse",
                }}
                style={{
                    display: maskShow ? "block" : "none",
                }}
                onClick={() => onshadow(i, j)}
            >
                {/* {coolsole.info("GridRef", `(${i}, ${j}) ${!disp && selectFlag && selectPos[0] == i && selectPos[1] == j}`)} */}
            </div>
        </motion.div>
    );
};

const HomePage = () => {
    const [gameMap, setGameMap] = useState(getNewMap());
    const [hint, setHint] = useState([0, 0, 0]);
    const [selectFlag, setSelectFlag] = useState(false);
    const [selectPos, setSelectPos] = useState([-1, -1]);

    const moveBall = (from, to) => {
        let map = gameMap;
        map[to[0]][to[1]].v = map[from[0]][from[1]].v;
        map[from[0]][from[1]].v = -1;
        setGameMap(map);
    };

    const checkLine = () => {
        // 查看是否存在5个连续的球(包括斜向), 检查出全部的连续球, 并消除
        const minLenToEliminate = 5;
        let t = gameMap;
        let line = [];
        let lineSet = new Set();
        
        t.forEach((row, i) => {
            row.forEach((obj, j) => {
                if (obj.v == -1) {
                    return;
                }
                let v = obj.v;
                let count = 1;
                let dir = [
                    [0, 1],
                    [1, 0],
                    [1, 1],
                    [1, -1],
                ];
                dir.forEach((d) => {
                    line = [[i, j]];
                    let x = i + d[0];
                    let y = j + d[1];
                    while (
                        x >= 0 &&
                        x < gameSize.h &&
                        y >= 0 &&
                        y < gameSize.w &&
                        t[x][y].v == v
                    ) {
                        count++;
                        line.push([x, y]);
                        x += d[0];
                        y += d[1];
                    }
                    x = i - d[0];
                    y = j - d[1];
                    while (
                        x >= 0 &&
                        x < gameSize.h &&
                        y >= 0 &&
                        y < gameSize.w &&
                        t[x][y].v == v
                    ) {
                        count++;
                        line.push([x, y]);
                        x -= d[0];
                        y -= d[1];
                    }
                });
                if (count >= minLenToEliminate) {
                    line.sort((a, b) => {
                        if (a[0] == b[0]) {
                            return a[1] - b[1];
                        }
                        return a[0] - b[0];
                    });
                    lineSet.add(JSON.stringify(line)); // 用set去重(必须格式化为字符串)
                }

            });

        });

        // TODO: 消除连续的球
        lineSet.forEach((line) => {
            line = JSON.parse(line);
            line.forEach((pos) => {
                t[pos[0]][pos[1]].v = -1;
            });
        });

        setGameMap(t);
    }

    const generateNewBall = () => {
        // 根据hint生成新的球
        let t = gameMap;
        let pos = getVaccantPos(t);
        for (let i = 0; i < hint.length; i++) {
            let ran = Math.floor(Math.random() * pos.length);
            t[pos[ran][0]][pos[ran][1]].v = hint[i];
            pos.splice(ran, 1);
        }
        setGameMap(t);
    };

    const refreshHint = () => {
        let hint = [];
        for (let i = 0; i < 3; i++) {
            hint.push(getRanX());
        }
        setHint(hint);
    };

    const clearSelect = () => {
        setSelectFlag(false);
        setSelectPos([-1, -1]);
        let t = gameMap;
        t.forEach((row) => {
            row.forEach((obj) => {
                obj.maskShow = false;
            });
        });
        setGameMap(t);
    };

    const selectBall = (i, j) => {
        // 选择球, 触发可以到达的位置判断, 以及选择的环节
        coolsole.info("select", `(${i}, ${j})`);
        if (selectFlag && selectPos[0] == i && selectPos[1] == j) {
            clearSelect();
            return;
        }else if (selectFlag) {
            clearSelect();
        }
        setSelectFlag(true);
        setSelectPos([i, j]);
        let t = gameMap;
        getAccessiblePos(t, i, j).forEach((pos) => {
            let {x,y,route} = pos;
            t[x][y].maskShow = true;
        });
        setGameMap(t);
    };

    const selectShadow = (i, j) => {
        coolsole.info("shadow", `(${i}, ${j})`);
        if (!selectFlag) {
            return;
        }
        // 如果在选择的情况下点了阴影, 说明开启一轮移动和判定
        move(selectPos, [i, j]);
    };

    const move = (from, to) => {
        moveBall(from, to);
        checkLine();
        clearSelect();
        generateNewBall();
        refreshHint();
    };

    useEffect(() => {
        // 初始化, 随机5个位置生成随机颜色, 生成第一轮hint
        let init_num = 5;
        let map = gameMap;
        map = getNewMap();
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
        }
        setGameMap(map);

        refreshHint();
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
                                            selectPos={selectPos}
                                            maskShow={obj.maskShow}
                                            onshadow={selectShadow}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;

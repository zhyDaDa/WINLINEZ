import React, { useState, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
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
        this.trans = false;
    }
}

const saveRec = (key, value) => {
    // save to local file
    localStorage.setItem(key, JSON.stringify(value));
};
const loadRec = (key) => {
    // load from local file
    localStorage.getItem(key);
    return JSON.parse(localStorage.getItem(key));
};

const color = [
    "#7C0902",
    "#FF4F00",
    "#FFBF00",
    "#000000",
    "#007FFF",
    "#8A2BE2",
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getRanX = () => Math.floor((Math.random() * color.length) / 3);
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
    let queue = [{ x: i, y: j, route: [[i, j]] }];
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
};

const HomePage = () => {
    const [gameMap, setGameMap] = useState(getNewMap());
    const [balls, setBalls] = useState([]);
    const [hint, setHint] = useState([0, 0, 0]);
    const [selectFlag, setSelectFlag] = useState(false);
    const [selectIndex, setSelectIndex] = useState(-1);
    const [bestScore, setBestScore] = useState(0);
    const [currentScore, setCurrentScore] = useState(0);

    const selectBall = async (i) => {
        coolsole.info("select", `(${i})`);
        clearSelect();
        setSelectFlag(true);
        setSelectIndex(i);
        setGameMap((prev) => {
            let map = prev;
            let availablePos = getAccessiblePos(map, balls[i].x, balls[i].y);
            availablePos.forEach((pos) => {
                map[pos.x][pos.y].maskShow = true;
            });
            return map;
        });
    };

    const moveBall = async (index, to) => {
        let from = [balls[index].x, balls[index].y];
        let route = getAccessiblePos(gameMap, from[0], from[1]).find(
            (pos) => pos.x == to[0] && pos.y == to[1]
        ).route;

        setBalls((prev) => {
            let balls = [...prev];
            balls[index].trans = true;
            return balls;
        });

        for (let i = 1; i < route.length; i++) {
            flushSync(() => {
                setBalls((prev) => {
                    let balls = [...prev];
                    balls[index].x = route[i][0];
                    balls[index].y = route[i][1];
                    return balls;
                });
            });
            await sleep(100);
        }

        setGameMap((prev) => {
            let map = prev;
            map[to[0]][to[1]].v = map[from[0]][from[1]].v;
            map[from[0]][from[1]].v = -1;
            return map;
        });
        setBalls((prev) => {
            let balls = prev;
            balls[index].x = to[0];
            balls[index].y = to[1];
            balls[index].trans = false;
            return balls;
        });
    };

    const checkLine = async (passive) => {
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
                let dir = [
                    [0, 1],
                    [1, 0],
                    [1, 1],
                    [1, -1],
                ];
                dir.forEach((d) => {
                    let count = 1;
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
        });

        // TODO: 消除连续的球
        if (lineSet.size > 0) {
            let score = 0;
            lineSet.forEach((line) => {
                line = JSON.parse(line);
                line.forEach((pos) => {
                    score += 2;
                    t[pos[0]][pos[1]].v = -1;
                    let ball = balls.find(
                        (b) => b.x == pos[0] && b.y == pos[1]
                    );
                    let index = balls.indexOf(ball);
                    balls.splice(index, 1);
                    // t[pos[0]][pos[1]].maskShow = true;
                });
            });
            if (lineSet.size > 1) {
                score = 60;
            }
            if (!passive) {
                setCurrentScore(currentScore + score);
            }
            await sleep(300);
        }
        flushSync(() => {
            setGameMap(t);
            setBalls(balls);
        });
    };

    const checkEnd = (forceFlag) => {
        // 检查是否游戏结束
        let t = gameMap;
        let pos = getVaccantPos(t);
        if (forceFlag || pos.length == 0) {
            let name = prompt("Game Over! Enter your name: ");
            let rec = {
                name: name,
                score: currentScore,
                time: new Date().toLocaleString(),
            };
            let bestScore = loadRec("bestScore") || 0;
            if (currentScore > bestScore) {
                saveRec("bestScore", currentScore);
            }
            let records = loadRec("records") || [];
            records.push(rec);
            saveRec("records", records);
            alert("Record saved!");
            window.location.reload();
        }
    };

    const generateNewBall = () => {
        // 根据hint生成新的球
        let t = gameMap;
        let b = balls;
        let pos = getVaccantPos(t);
        if (pos.length < hint.length) {
            checkEnd(true);
        }
        for (let i = 0; i < hint.length; i++) {
            let ran = Math.floor(Math.random() * pos.length);
            t[pos[ran][0]][pos[ran][1]].v = hint[i];
            b.push(new B(pos[ran][0], pos[ran][1], hint[i]));
            pos.splice(ran, 1);
        }
        setGameMap(t);
        setBalls(b);
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
        setSelectIndex(-1);
        setGameMap((prev) => {
            let map = prev;
            for (let i = 0; i < gameSize.h; i++) {
                for (let j = 0; j < gameSize.w; j++) {
                    map[i][j].maskShow = false;
                }
            }
            return map;
        });
    };
    const selectShadow = (i, j) => {
        coolsole.info("shadow", `(${i}, ${j})`);
        if (!selectFlag) {
            return;
        }
        move(selectIndex, [i, j]);
        clearSelect();
    };

    const move = async (index, to) => {
        await moveBall(index, to);
        clearSelect();
        await sleep(30);
        await checkLine();
        flushSync();
        generateNewBall();
        refreshHint();
        checkLine(true);
        await sleep(3);
        checkEnd();
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
                            <Grid v={v} disp={true}>
                                <Ball color={color[v]} x={0} y={0} disp />
                            </Grid>
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
                            <Ball
                                key={i}
                                color={color[ball.v]}
                                x={ball.x}
                                y={ball.y}
                                trans={ball.trans}
                                onclk={() => selectBall(i)}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;

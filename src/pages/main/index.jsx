import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import Button from "../../components/Button/button";
import Counter from "../../components/Counter/counter";
import CountUp from "react-countup";
import { Col, Row, Statistic, Card, List } from "antd";
import coolsole from "../../utils/coolsole";
import "./index.less";

const saveRec = (key, value) => {
    // save to local file
    localStorage.setItem(key, JSON.stringify(value));
};
const loadRec = (key) => {
    // load from local file
    localStorage.getItem(key);
    return JSON.parse(localStorage.getItem(key));
};
const formatter = (value) => <CountUp end={value} separator="," />;
class OBJ {
    constructor() {
        this.i = -1;
        this.j = -1;
        this.v = -1;
        this.maskShow = false;
    }
}
const ballSize = 9;
const color = [
    "#7C0902",
    "#FF4F00",
    "#FFBF00",
    "#000000",
    "#007FFF",
    "#8A2BE2",
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getRanX = () => Math.floor((Math.random() * color.length) / 1);
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

const Grid = React.forwardRef(
    (
        { i, j, v, onclk, selectFlag, selectPos, disp, maskShow, onshadow },
        ref
    ) => {
        return (
            <div className="grid">
                <AnimatePresence initial={true}>
                    {v == -1 ? null : (
                        <motion.div
                            className="ball"
                            initial={{ opacity: 0.6, scale: 0 }}
                            animate={{ opacity: 1, scale: 0.9 }}
                            exit={{ opacity: 0, scale: 0 }}
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
                            ref={ref}
                        >
                            <svg
                                onClick={() => onclk(i, j)}
                                width="100%"
                                height="100%"
                            >
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    fill={color[v]}
                                />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    fill="black"
                                    fillOpacity="0.1"
                                />
                                <circle
                                    cx="48%"
                                    cy="48%"
                                    r="42%"
                                    fill={color[v]}
                                />
                                <circle
                                    cx="40%"
                                    cy="40%"
                                    r="22%"
                                    fill="white"
                                    fillOpacity="0.08"
                                />
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div
                    className="grid-mask"
                    // initial={{ opacity: 0.0 }}
                    // animate={{ opacity: 0.0 }}
                    // transition={{
                    //     duration: 0.4,
                    //     repeat: maskShow ? Infinity : 0,
                    //     repeatType: "reverse",
                    // }}
                    style={{
                        display: maskShow ? "block" : "none",
                    }}
                    onClick={() => onshadow(i, j)}
                >
                    {/* {coolsole.info("GridRef", `(${i}, ${j}) ${!disp && selectFlag && selectPos[0] == i && selectPos[1] == j}`)} */}
                </div>
            </div>
        );
    }
);

const HomePage = () => {
    const [gameMap, setGameMap] = useState(getNewMap());
    const [hint, setHint] = useState([0, 0, 0]);
    const [selectFlag, setSelectFlag] = useState(false);
    const [selectPos, setSelectPos] = useState([-1, -1]);
    const [bestScore, setBestScore] = useState(0);
    const [currentScore, setCurrentScore] = useState(0);
    const ballsRef = useRef(null);

    const getBalls = () => {
        if (!ballsRef.current) {
            ballsRef.current = new Map();
        }
        return ballsRef.current;
    };

    const moveBall = async (from, to) => {
        let route = getAccessiblePos(gameMap, from[0], from[1]).find(
            (pos) => pos.x == to[0] && pos.y == to[1]
        ).route;
        let t = gameMap;
        let e_ball = getBalls().get(`${from[0]},${from[1]}`);
        let cur_x = 0,
            cur_y = 0;
        e_ball.style.transition = "all 0.3s";
        e_ball.style.left = `0vmin`;
        e_ball.style.top = `0vmin`;
        await sleep(1);
        e_ball.style.left = `0vmin`;
        e_ball.style.top = `0vmin`;
        console.log(e_ball);
        for (let i = 1; i < route.length; i++) {
            let [x, y] = route[i];
            let [px, py] = route[i - 1];
            let [dx, dy] = [x - px, y - py];
            e_ball.style.left = `${cur_y + dy * ballSize}vmin`;
            e_ball.style.top = `${cur_x + dx * ballSize}vmin`;
            cur_x += dx * ballSize;
            cur_y += dy * ballSize;
            await sleep(80);
        }
        t[to[0]][to[1]].v = t[from[0]][from[1]].v;
        t[from[0]][from[1]].v = -1;
        e_ball.style.left = "";
        e_ball.style.top = "";
        e_ball.transition = "";
        setGameMap(t);
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

        setGameMap(t);
    };

    const generateNewBall = () => {
        // 根据hint生成新的球
        let t = gameMap;
        let pos = getVaccantPos(t);
        if (pos.length < hint.length) {
            checkEnd(true);
        }
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

    const selectBall = (i, j) => {
        // 选择球, 触发可以到达的位置判断, 以及选择的环节
        coolsole.info("select", `(${i}, ${j})`);
        if (selectFlag && selectPos[0] == i && selectPos[1] == j) {
            clearSelect();
            return;
        } else if (selectFlag) {
            clearSelect();
        }
        setSelectFlag(true);
        setSelectPos([i, j]);
        let t = gameMap;
        getAccessiblePos(t, i, j).forEach((pos) => {
            let { x, y, route } = pos;
            t[x][y].maskShow = true;
        });
        setGameMap(t);
    };

    const selectShadow = async (i, j) => {
        coolsole.info("shadow", `(${i}, ${j})`);
        if (!selectFlag) {
            return;
        }
        // 如果在选择的情况下点了阴影, 说明开启一轮移动和判定
        move(selectPos, [i, j]);
    };

    const move = async (from, to) => {
        await moveBall(from, to);
        clearSelect();
        await sleep(30);
        await checkLine();
        generateNewBall();
        refreshHint();
        checkLine(true);
        await sleep(3);
        checkEnd();
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

        // 加载最高分
        let bestScore = loadRec("bestScore") || 0;
        setBestScore(bestScore);
        setCurrentScore(0);
    }, []);

    return (
        <div id="layout">
            <div id="layout_l" className="layout">
                <h4>WINLINEZ</h4>
                <List
                    id="recordList"
                    size="small"
                    dataSource={loadRec("records") || [{ name: "No Record", score: 0, time: "No Time" }]}
                    renderItem={(item) => (
                        <List.Item>
                            <Card className="listItem" title={`${item.name} - ${item.time}`}>Score: {item.score}</Card>
                        </List.Item>
                    )}
                />
            </div>
            <div id="layout_r" className="layout">
                <section id="hint_panel">
                    <section className="left">
                        Best Score:{" "}
                        <Statistic
                            className="score"
                            id="bestScore"
                            value={bestScore}
                            formatter={formatter}
                        />
                    </section>
                    <section className="middle">
                        <span>Next</span>
                        {hint.map((v, i) => (
                            <div key={i} className="cell">
                                <Grid v={v} disp={true} />
                            </div>
                        ))}
                        <span>Colors</span>
                    </section>
                    <section className="right">
                        Current Score:{" "}
                        <Statistic
                            className="score"
                            id="currentScore"
                            value={currentScore}
                            formatter={formatter}
                        />
                    </section>
                </section>

                <hr />

                <section id="game_panel">
                    <div id="gameMap">
                        {gameMap.map((row, i) => (
                            <div key={i} className="row">
                                {row.map((obj, j) => (
                                    <div key={j} className="cell">
                                        <Grid
                                            ref={(node) => {
                                                const balls = getBalls();
                                                if (node) {
                                                    balls.set(
                                                        `${i},${j}`,
                                                        node
                                                    );
                                                } else {
                                                    balls.delete(`${i},${j}`);
                                                }
                                            }}
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

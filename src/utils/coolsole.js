const coolsole = {};

const basic = "font-size: 16px; background: #aaaaaa33; color: #333; border-radius: 3px; padding: 2px;";
const clear = "";
const badge_info = [
    "font-size: 16px; background: #606060; color: #fff; border-radius: 3px 0 0 3px; padding: 2px 2px 2px 8px; font-weight: bold; margin-right: 2px;",
    "font-size: 16px; background: #1475B2; color: #fff; border-radius: 0 3px 3px 0; padding: 2px 8px 2px 2px;",
    clear
];

coolsole.log = (message) => {
    console.log(`%c${message}%c`, basic, clear);
};

coolsole.info = (message1, message2) => {
    let m1 = message2 === undefined || message2 === null ? " Info " : message1;
    let m2 = message2 === undefined || message2 === null ? message1 : message2;

    if (m2 === undefined) {
        m2 = "undefined";
    }else if (m2 === null) {
        m2 = "null";
    }

    let blank = " ".repeat(Math.max(8 - m2.toString().length,0));
    console.log(`%c${m1}%c${blank}${m2}%c`, ...badge_info);
};

export default coolsole;

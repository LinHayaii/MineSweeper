// class Unit {//一个格子
//     constructor(num, status) {
//         this.num = num;
//         this.status = status;
//     }
// }
//
// let chessBoard//棋盘
// let boomNum;//雷的数量
// let col;//列数
// let row;//行数
// let level= 1;//难度
// const size = 50;//格子大小
//
// // function initial() {//初始化棋盘
// //     createChessBoard();
// //     initialChessBoard();
// //     randomBoom();
// // }
// function dependLevel() {//根据难度确定棋盘大小
//     switch(level){
//         case 1://基础
//             boomNum = 10;
//             col = 9;
//             row = 9;
//             break;
//         case 2://中级
//             boomNum = 40;
//             col = 16;
//             row = 16;
//             break;
//         case 3://专家
//             boomNum = 99;
//             col = 30;
//             row = 16;
//             break;
//     }
// }
// function createChessBoard() {//生成棋盘
//     dependLevel();
//     //创建二维棋盘
//     chessBoard = new Array(row + 2);
//     for (let i = 0; i < row + 2; i++) {
//         chessBoard[i] = new Array(col+2);
//     }
// }
// function initialChessBoard() {//初始化棋盘状态
//     for (let i = 0; i < row + 2; i++) {
//         for (let j = 0; j < col + 2; j++) {
//             chessBoard[i][j] = new Unit(0, 0);
//         }
//     }
// }
// function randomBoom() {//在棋盘上随机生成雷
//     let i = 0;
//     while (i < boomNum) {
//         let x = Math.floor(Math.random() * row);
//         let y = Math.floor(Math.random() * col);
//         if (chessBoard[x][y].num !== 9) {
//             chessBoard[x][y].num = 9;
//             setChessBoard(x, y);
//             i++;
//         }
//     }
// }
// function setChessBoard(x, y) {//设置周围格子的数字
//     const offsets = [-1, 0, 1]; // 偏移量数组
//
//     for (const xOffset of offsets) {
//         for (const yOffset of offsets) {
//             const newX = x + xOffset;
//             const newY = y + yOffset;
//             if (chessBoard[newX] && chessBoard[newX][newY]) {
//                 chessBoard[newX][newY].num = chessBoard[newX][newY].num === 9 ? 9 : chessBoard[newX][newY].num + 1;
//             }
//         }
//     }
// }
//

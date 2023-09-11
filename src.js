class Unit {//一个格子
    constructor(num, status) {
        this.num = num;
        this.status = status;
    }
}
// minesweeper.js
let numRows = 10;
let numCols = 10;
const cellSize = 30;
const shadowSize = cellSize / 10; // 阴影大小
let boomNum = 10;//雷的数量
const t = shadowSize / 2; // 阴影大小的一半
let board; //棋盘
let clicked;//点击棋盘:0表示未点击，1表示已点击，2表示已插旗
let level = 1;//难度
let gameStatus = 0;//游戏状态：0表示未开始，1表示进行中，2表示结束
let restBoom = boomNum;//剩余未插旗雷的数量
let time = 0;//游戏时间
let restCell = numRows * numCols;//剩余未点击的格子数量

function initial() {//初始化棋盘

    //阻止右键菜单栏，影响游戏体验
    const canvas = document.getElementById("minesweeperCanvas");
    canvas.addEventListener("contextmenu", function(event) {
        // 阻止默认的上下文菜单事件
        event.preventDefault();
    });
    createChessBoard();
    draw3DBoard();
    initialChessBoard();
    randomBoom();
    let link = document.getElementById("mine");
    link.innerHTML = String(boomNum).padStart(3, "0");
}
function dependLevel() {//根据难度确定棋盘大小
    switch (level) {
        case 1://基础
            boomNum = 10;
            numRows = 9;
            numCols = 9;
            break;
        case 2://中级
            boomNum = 40;
            numRows = 16;
            numCols = 16;
            break;
        case 3://专家
            boomNum = 99;
            numCols = 30;
            numRows = 16;
            break;
    }
    restBoom = boomNum;
    restCell = numRows * numCols;
}
function draw3DBoard() {// 绘制带有阴影的立体效果格子
    const canvas = document.getElementById("minesweeperCanvas");
    const ctx = canvas.getContext("2d");

    // 定义棋盘的大小和格子大小
    canvas.width = (numCols+2) * cellSize + 10;
    canvas.height = (numRows+2) * cellSize + 10;

    for (let row = 1; row <= numRows; row++) {
        for (let col = 1; col <= numCols; col++) {
            const x = col * cellSize;
            const y = row * cellSize;

            // 绘制底色
            ctx.fillStyle = "#c0c0c0";
            ctx.fillRect(x, y, cellSize, cellSize);

            // 绘制左边和上边的阴影
            ctx.fillStyle = "rgba(255, 255, 255,0.8)";
            ctx.fillRect(x, y, shadowSize, cellSize); // 左边的阴影
            ctx.fillRect(x, y, cellSize, shadowSize); // 上边的阴影

            // 绘制格子的右边和下边
            ctx.fillStyle = "rgba(128, 128, 128,0.7)";
            ctx.fillRect(x + cellSize - shadowSize, y, shadowSize, cellSize); // 右边的阴影
            ctx.fillRect(x, y + cellSize - shadowSize, cellSize, shadowSize); // 下边的阴影
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            //右上角阴影混合
            ctx.beginPath();
            ctx.moveTo(x + cellSize - shadowSize, y);                     // 移动到左上角
            ctx.lineTo(x + cellSize - shadowSize, y + shadowSize);        // 到达交界处的左下角
            ctx.lineTo(x + cellSize , y);        // 到达交界处的右上角
            ctx.closePath();                      // 闭合路径
            ctx.fill();
            //左下角阴影混合
            ctx.beginPath();
            ctx.moveTo(x, y + cellSize - shadowSize);                     // 移动到左上角
            ctx.lineTo(x + shadowSize, y + cellSize - shadowSize);        // 到达交界处的右上角
            ctx.lineTo(x, y + cellSize);        // 到达交界处的左下角
            ctx.closePath();                      // 闭合路径
            ctx.fill();
        }
    }
}
function handleMouseDown(event) {//处理鼠标点击事件
    const canvas = document.getElementById("minesweeperCanvas");
    const ctx = canvas.getContext("2d");

    // 获取鼠标点击位置的坐标
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    //判断点击的是哪个格子
    const clickedCol = Math.floor(mouseX / cellSize);
    const clickedRow = Math.floor(mouseY / cellSize);

    // 检查点击是否在有效的格子范围内
    if (
        clickedRow >= 1 &&
        clickedRow <= numRows &&
        clickedCol >= 1 &&
        clickedCol <= numCols &&
        gameStatus !== 2
    ) {
        if(gameStatus === 0) {//游戏未开始
            gameStatus = 1;
            time = 0;
        }
        const x = clickedCol * cellSize;
        const y = clickedRow * cellSize;
        //检测是否已点击过（已点击：不作为；未点击：检测是否是雷（不是雷，显示；是雷：失败））
        //注意判断鼠标左右键，如果是右键，画旗并剩余未点击雷是否为0，是则成功，否则继续。
        if(event.button === 0){//左键
            if(isClick(clickedRow,clickedCol) === 0) {//未点击
                clicked[clickedRow][clickedCol] = 1;
                // 清除格子的内容（重新绘制底色）
                ctx.fillStyle = "rgb(190, 190, 190)";
                ctx.fillRect(x, y, cellSize, cellSize);
                //绘制一圈黑框
                ctx.fillStyle = "rgb(128, 128, 128,0.7)";
                ctx.fillRect(x, y, cellSize, t); // 上边的阴影
                ctx.fillRect(x, y, t, cellSize); // 左边的阴影
                ctx.fillRect(x + cellSize - t, y, t, cellSize); // 右边的阴影
                ctx.fillRect(x, y + cellSize - t, cellSize, t); // 下边的阴影
                // 获取要显示的数字
                const numberToDisplay = board[clickedRow][clickedCol].num; // 假设 i 包含要显示的数字

                if(numberToDisplay === 9) {//是雷
                    //失败
                    gameStatus = 2;
                    //绘制所有雷
                    for(let i = 1;i <= numRows;i++){
                        for(let j = 1;j <= numCols;j++){
                            if(board[i][j].num === 9 && clicked[i][j] === 0){
                                drawBoom(i,j,1);
                            }
                        }
                    }
                    //绘制点击的雷
                    drawBoom(clickedRow,clickedCol,2);
                    becomeF();
                } else {
                    if(numberToDisplay !== 0) {//数字
                        // 在格子上绘制数字
                        ctx.fillStyle = getColorByValue(numberToDisplay);
                        // 计算字号的一半
                        const halfFontSize = cellSize / 1.2;
                        // 设置字体样式
                        ctx.font = `bold ${halfFontSize}px Consolas`; // 使用模板字符串设置字体样式
                        ctx.fillText(numberToDisplay.toString(), x + cellSize / 2 - cellSize/4, y + cellSize / 2 + cellSize/4);
                        restCell--;
                        console.log(restCell);
                        if(isWin()) {
                            gameStatus = 2;
                            becomeW();
                            alert("你赢了！");
                        }

                    } else {//空白
                        //递归显示周围的格子
                        restCell--;
                        console.log(restCell);
                        showAround(clickedRow, clickedCol);
                    }
                }
            }
        } else {//右键
            if(isClick(clickedRow,clickedCol) === 0 && restBoom > 0) {//未点击
                clicked[clickedRow][clickedCol] = 2;
                //画旗
                drawFlag(x,y);
                downMine();
                //TODO:判断游戏是否结束
                if(isWin()) {
                    gameStatus = 2;
                    becomeW();
                    alert("你赢了！");
                }
            } else {//已点击
                if(isClick(clickedRow,clickedCol) === 2) {//已标旗
                    upMine();
                    console.log(restCell);
                    clicked[clickedRow][clickedCol] = 0;
                    //清除旗
                    ctx.fillStyle = "#c0c0c0";
                    ctx.fillRect(x, y, cellSize, cellSize);

                    // 绘制左边和上边的阴影
                    ctx.fillStyle = "rgba(255, 255, 255,0.8)";
                    ctx.fillRect(x, y, shadowSize, cellSize); // 左边的阴影
                    ctx.fillRect(x, y, cellSize, shadowSize); // 上边的阴影

                    // 绘制格子的右边和下边
                    ctx.fillStyle = "rgba(128, 128, 128,0.7)";
                    ctx.fillRect(x + cellSize - shadowSize, y, shadowSize, cellSize); // 右边的阴影
                    ctx.fillRect(x, y + cellSize - shadowSize, cellSize, shadowSize); // 下边的阴影
                    ctx.fillStyle = "rgba(255, 255, 255, 1)";
                    //右上角阴影混合
                    ctx.beginPath();
                    ctx.moveTo(x + cellSize - shadowSize, y);                     // 移动到左上角
                    ctx.lineTo(x + cellSize - shadowSize, y + shadowSize);        // 到达交界处的左下角
                    ctx.lineTo(x + cellSize, y);        // 到达交界处的右上角
                    ctx.closePath();                      // 闭合路径
                    ctx.fill();
                    //左下角阴影混合
                    ctx.beginPath();
                    ctx.moveTo(x, y + cellSize - shadowSize);                     // 移动到左上角
                    ctx.lineTo(x + shadowSize, y + cellSize - shadowSize);        // 到达交界处的右上角
                    ctx.lineTo(x, y + cellSize);        // 到达交界处的左下角
                    ctx.closePath();                      // 闭合路径
                    ctx.fill();
                }
            }
        }
    }
}
function getColorByValue(value) {//根据值选择对应颜色
    switch (value) {
        case 1:
            return "blue";
        case 2:
            return "green";
        case 3:
            return "red";
        case 4:
            return "purple";
        case 5:
            return "maroon";
        case 6:
            return "turquoise";
        case 7:
            return "black";
        case 8:
            return "gray";
    }
}
function createChessBoard() {//生成棋盘
    dependLevel();
    //创建二维棋盘
    board = new Array(numRows + 2);
    clicked = new Array(numRows + 2);
    for (let i = 0; i < numRows + 2; i++) {
        board[i] = new Array(numCols+2);
        clicked[i] = new Array(numCols+2);
    }
}
function initialChessBoard() {//初始化棋盘状态
    for (let i = 0; i < numRows + 2; i++) {
        for (let j = 0; j < numCols + 2; j++) {
            if(i === 0 || i === numRows + 1 || j === 0 || j === numCols + 1) {
                board[i][j] = new Unit(9, 0);
                clicked[i][j] = 1;
                continue;
            }
            board[i][j] = new Unit(0, 0);
            clicked[i][j] = 0;
        }
    }
}
function randomBoom() {//在棋盘上随机生成雷
    let i = 0;
    while (i < boomNum) {
        let x = Math.floor(Math.random() * numRows);
        let y = Math.floor(Math.random() * numCols);
        if (board[x][y].num !== 9) {
            board[x][y].num = 9;
            setChessBoard(x, y);
            i++;
        }
    }
    let boardStr;
    for (let i = 1; i <= numRows; i++) {
        let boardStr = "[";
        for (let j = 1; j <= numCols; j++) {
          boardStr += board[i][j].num + " ";
        }
        boardStr += "]";
        console.log(boardStr);
    }
}
function setChessBoard(x, y) {//设置周围格子的数字
    const offsets = [-1, 0, 1]; // 偏移量数组

    for (const xOffset of offsets) {
        for (const yOffset of offsets) {
            const newX = x + xOffset;
            const newY = y + yOffset;
            if (board[newX] && board[newX][newY]) {
                board[newX][newY].num = board[newX][newY].num === 9 ? 9 : board[newX][newY].num + 1;
            }
        }
    }
}
function isClick(x, y) {//判断是否已点击
    return clicked[x][y];
}
function drawFlag(x, y) {//绘制旗帜
    const canvas = document.getElementById("minesweeperCanvas");
    const ctx = canvas.getContext("2d");
    const flagImage = new Image();
    flagImage.src = "flag.png";
    flagImage.onload = function () {
        ctx.drawImage(flagImage, x+shadowSize, y+shadowSize, cellSize-shadowSize*2, cellSize-shadowSize*2);
    }
}
function showAround(row, col) {//显示周围格子
    const offsets = [-1, 0, 1]; // 偏移量数组
    const canvas = document.getElementById("minesweeperCanvas");
    const ctx = canvas.getContext("2d");

    for (const xOffset of offsets) {
        for (const yOffset of offsets) {
            const newX = row + xOffset;
            const newY = col + yOffset;
            const xx = newY * cellSize;
            const yy = newX * cellSize;
            if (board[newX] && board[newX][newY].num !== 9) {
                if (isClick(newX, newY) === 0) {//如果未点击,且无旗
                    clicked[newX][newY] = 1;
                    restCell--;
                    console.log(restCell);
                    //清楚格子内容
                    ctx.fillStyle = "rgb(190, 190, 190)";
                    ctx.fillRect(xx, yy, cellSize, cellSize);
                    //绘制一圈黑框
                    ctx.fillStyle = "rgb(128, 128, 128, 0.7)";
                    ctx.fillRect(xx, yy, cellSize, t); // 上边的阴影
                    ctx.fillRect(xx, yy, t, cellSize); // 左边的阴影
                    ctx.fillRect(xx + cellSize - t, yy, t, cellSize); // 右边的阴影
                    ctx.fillRect(xx, yy + cellSize - t, cellSize, t); // 下边的阴影
                    if(board[newX][newY].num !== 0) {//如果周围格子不为0，则显示数字
                        // 在格子上绘制数字
                        ctx.fillStyle = getColorByValue(board[newX][newY].num);
                        // 计算字号的一半
                        const halfFontSize = cellSize / 1.2;
                        // 设置字体样式
                        ctx.font = `bold ${halfFontSize}px Consolas`; // 使用模板字符串设置字体样式
                        ctx.fillText(board[newX][newY].num.toString(), xx + cellSize / 2 - cellSize/4, yy + cellSize / 2 + cellSize/4);
                    } else {
                        showAround(newX, newY);
                    }
                }
            }
        }
    }
}
function chooseLevel(x) {
    level = x;

    const canvas = document.getElementById("minesweeperCanvas");
    const ctx = canvas.getContext("2d");
    // 清除 Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initial();
    gameStatus = 0;
}
function drawBoom(row, col, x) {//绘制爆炸
    const canvas = document.getElementById("minesweeperCanvas");
    const ctx = canvas.getContext("2d");
    const boomImage = new Image();
    boomImage.src = `boom${x}.png`;
    boomImage.onload = function () {
        ctx.drawImage(boomImage, col*cellSize, row*cellSize, cellSize, cellSize);
    }
}
function isWin() {//判断是否胜利
    return restCell === boomNum;
}
function becomeY() {
    let link = document.getElementById("face");
    link.textContent = "σ( ᑒ )";
    chooseLevel(level);
    time = 0;
    let cd = document.getElementById("time");
    cd.innerHTML = "000";
}
function becomeW() {
    let link = document.getElementById("face");
    link.textContent = "ᕕ( ᐛ )ᕗ";
}
function becomeF() {
    let link = document.getElementById("face");
    link.textContent = "σ`∀´)";
}
function updateTime() {
    setInterval(function() {
        if(gameStatus === 1) {
            let link = document.getElementById("time");
            time++;
            link.textContent = String(time).padStart(3, "0");
        }
    }, 1000);

}
function upMine(){
    restBoom++;
    let link = document.getElementById("mine");
    link.textContent = String(restBoom).padStart(3, "0");
}
function downMine() {
    restBoom--;
    let link = document.getElementById("mine");
    link.textContent = String(restBoom).padStart(3, "0");
}
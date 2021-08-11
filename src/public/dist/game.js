"use strict";
const socket = io();
const roomId = window.location.pathname.replace("/", "");
function makeId() {
    let Id = "";
    let letters = "ABCDEFGHIJKLGEGEEy4heakie5tSTUVWXYZabcdefgafgqagehijklmnopqrstuvwxyz0123456789ag3e7ywegsq36yegw3qtf";
    for (let i = 0; i < 30; i++) {
        Id += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return Id;
}
let squares = getSquares();
let winningSquares = [];
const topRow = document.querySelector("#top");
const middleRow = document.querySelector("#middle");
const bottomRow = document.querySelector("#bottom");
const turnHTML = document.querySelector("#turn");
const winningHTML = document.querySelector("#winnerMsg > h1");
const resetBtn = document.querySelector("#winnerMsg > button");
const me = {
    id: makeId(),
    shape: null,
    turn: null,
};
const otherPlayer = {
    id: null,
    shape: null,
    turn: null,
};
socket.emit("userJoined", roomId, me.id, (shape) => (me.shape = shape));
socket.on("playerJoined", (newUser, oldUser) => {
    console.log("Player Joined. 1");
    if (newUser.id !== me.id) {
        console.log("Player Joined. 2");
        otherPlayer.id = newUser.id;
        otherPlayer.shape = newUser.shape;
        otherPlayer.turn = newUser.turn;
    }
    else if (newUser.id === me.id && oldUser) {
        otherPlayer.id = oldUser.id;
        otherPlayer.shape = oldUser.shape;
        otherPlayer.turn = oldUser.turn;
    }
    else {
        turnHTML.innerText = "Waiting for Player...";
    }
    if (otherPlayer.id) {
        if (me.shape === "0") {
            me.turn = true;
            otherPlayer.turn = false;
        }
        else if (me.shape === "X") {
            me.turn = false;
            otherPlayer.turn = true;
        }
        start();
        console.log("Starting.", me, otherPlayer);
    }
});
socket.on("chosedSquare", (userId, position) => {
    console.log("Postion Picked: " + position);
    if (userId === me.id) {
        squares[position] = { position, player: me.shape };
    }
    else if (userId === otherPlayer.id) {
        squares[position] = { position, player: otherPlayer.shape };
    }
    changeTurn();
});
updateSquares();
function start() {
    resetBtn.onclick = () => {
        socket.emit("reset", roomId);
    };
    updateSquares();
}
socket.on("resetGame", reset);
function reset(turn) {
    console.log("New turn is now: " + turn);
    squares = getSquares();
    winningSquares = [];
    resetBtn.style["display"] = "none";
    if (turn === me.shape) {
        me.turn = true;
        otherPlayer.turn = false;
    }
    else {
        me.turn = false;
        otherPlayer.turn = true;
    }
    winningHTML.innerText = "";
    updateSquares();
}
function checkWinner() {
    let won = false;
    let winner = null;
    const possiblities = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let possible of possiblities) {
        let matched = [];
        for (let position of possible) {
            matched.push(squares[position].player);
        }
        if (["X", "0"].includes(matched[0]) &&
            matched.every((ele) => ele === matched[0])) {
            winner = matched[0];
            won = true;
            winningSquares = possible;
            break;
        }
    }
    if (won) {
        if (winner === me.shape) {
            winningHTML.innerText = "You won!";
            winningHTML.style["color"] = "GREEN";
            resetBtn.style["display"] = "block";
        }
        else {
            winningHTML.innerText = "You lost!";
            winningHTML.style["color"] = "RED";
            resetBtn.style["display"] = "block";
        }
    }
    else if (squares.every((ele) => ele.player)) {
        winningHTML.innerText = "Draw!";
        winningHTML.style["color"] = "RED";
        resetBtn.style["display"] = "block";
        won = true;
    }
    updateSquares();
    return won;
}
function changeTurn() {
    if (checkWinner())
        return;
    otherPlayer.turn = !otherPlayer.turn;
    me.turn = !me.turn;
    console.log("My Turn: " + me.turn, "\nOther turn: " + otherPlayer.turn);
    updateSquares();
}
function updateSquares() {
    Array.from(topRow?.children).forEach((ele) => ele.remove());
    Array.from(middleRow?.children).forEach((ele) => ele.remove());
    Array.from(bottomRow?.children).forEach((ele) => ele.remove());
    if (me.turn !== null && otherPlayer.turn !== null) {
        if (me.turn) {
            turnHTML.innerText = "Your turn!";
            turnHTML.style["color"] = "GREEN";
        }
        else {
            turnHTML.innerText = `${otherPlayer.shape}'s turn!`;
            turnHTML.style["color"] = "RED";
        }
    }
    console.log(squares);
    squares.slice(0, 3).forEach((square) => {
        const squareHTML = document.createElement("div");
        squareHTML.onclick = clicked(square.position);
        squareHTML.classList.add(`square${square.position}`);
        squareHTML.style["cursor"] = (() => {
            if (me.turn) {
                return "pointer";
            }
            else
                return "not-allowed";
        })();
        squareHTML.style["background"] = (() => {
            if (winningSquares.includes(square.position)) {
                return "lightcoral";
            }
            else
                return "#92d192";
        })();
        if (square.player)
            squareHTML.innerText = square.player;
        topRow?.appendChild(squareHTML);
    });
    squares.slice(3, 6).forEach((square) => {
        const squareHTML = document.createElement("div");
        squareHTML.onclick = clicked(square.position);
        squareHTML.classList.add(`square${square.position}`);
        squareHTML.style["cursor"] = (() => {
            if (me.turn) {
                return "pointer";
            }
            else
                return "not-allowed";
        })();
        squareHTML.style["background"] = (() => {
            if (winningSquares.includes(square.position)) {
                return "lightcoral";
            }
            else
                return "#92d192";
        })();
        if (square.player)
            squareHTML.innerText = square.player;
        middleRow?.appendChild(squareHTML);
    });
    squares.slice(6, 9).forEach((square) => {
        const squareHTML = document.createElement("div");
        squareHTML.onclick = clicked(square.position);
        squareHTML.classList.add(`square${square.position}`);
        squareHTML.style["cursor"] = (() => {
            if (me.turn) {
                return "pointer";
            }
            else
                return "not-allowed";
        })();
        squareHTML.style["background"] = (() => {
            if (winningSquares.includes(square.position)) {
                return "lightcoral";
            }
            else
                return "#92d192";
        })();
        if (square.player)
            squareHTML.innerText = square.player;
        bottomRow?.appendChild(squareHTML);
    });
}
function clicked(postion) {
    return (e) => {
        e.preventDefault();
        if (me.turn &&
            squares[postion].player !== "X" &&
            squares[postion].player !== "0") {
            socket.emit("chosenSquare", roomId, me.id, postion);
        }
    };
}
function getSquares(squares) {
    return [
        {
            position: squares?.[0]?.position ?? 0,
            player: squares?.[0]?.player ?? null,
        },
        {
            position: squares?.[1]?.position ?? 1,
            player: squares?.[1]?.player ?? null,
        },
        {
            position: squares?.[2]?.position ?? 2,
            player: squares?.[2]?.player ?? null,
        },
        {
            position: squares?.[3]?.position ?? 3,
            player: squares?.[3]?.player ?? null,
        },
        {
            position: squares?.[4]?.position ?? 4,
            player: squares?.[4]?.player ?? null,
        },
        {
            position: squares?.[5]?.position ?? 5,
            player: squares?.[5]?.player ?? null,
        },
        {
            position: squares?.[6]?.position ?? 6,
            player: squares?.[6]?.player ?? null,
        },
        {
            position: squares?.[7]?.position ?? 7,
            player: squares?.[7]?.player ?? null,
        },
        {
            position: squares?.[8]?.position ?? 8,
            player: squares?.[8]?.player ?? null,
        },
    ];
}

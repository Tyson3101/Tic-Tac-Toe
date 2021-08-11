"use strict";
document.querySelector("#joinId")?.addEventListener("submit", joinGame);
async function joinGame(e) {
    e.preventDefault();
    let Id = document.querySelector("#joinId")?.value;
    try {
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ redirect: true }),
        };
        console.log(Id);
        let fetched = await fetch(`/${Id}`, options);
        let { roomId } = await fetched.json();
        console.log(roomId);
        window.location.href = `/${roomId}`;
    }
    catch (err) {
        window.alert("No code found.");
    }
}
document.querySelector("#createRoom")?.addEventListener("click", createGame);
async function createGame(e) {
    e.preventDefault();
    try {
        const options = {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ createRoom: true }),
        };
        let { roomId } = await fetch(`/placeholder`, options).then((res) => res.json());
        console.log(roomId);
        window.location.href = `/${roomId}`;
    }
    catch (err) {
        console.log(err);
    }
}

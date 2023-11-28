// script.js

const socket = io.connect('http://127.0.0.1:3000/');
let activeRoom = null;

socket.on("connesso", function (data) {
    document.getElementById("inizio").innerHTML = "Sei connesso al server " + data;
});

socket.on("messaggio", function (data) {
    document.getElementById("chatArea").innerText += data + "\n";
});

socket.on("stato", function (data) { // Aggiorna lo stato in tempo reale
    const connectedClients = document.getElementById("connectedClients");
    connectedClients.innerHTML = "";

    data.forEach(client => {
        const option = document.createElement("option");
        option.text = client.nickname;
        option.value = client.id;
        connectedClients.add(option);
    });
});

socket.on("newRoom", function (roomData) {
    console.log("Aggiunta di una room");
    // Creo il bottone collegato alla room
    const newBt = document.createElement("button");
    newBt.innerHTML = roomData.name;
    newBt.setAttribute("onclick", "openRoom('" + roomData.id + "')");
    document.getElementById("roomList").appendChild(newBt);
});

socket.on("getRoomData", function (roomData) {
    console.log("Ricevuti i dati della chatroom " + roomData.id);
    activeRoom = roomData;
    document.getElementById("chatArea").innerText = roomData.timeline;
    document.getElementById("roomName").innerText = roomData.name;
    document.getElementById("roomClients").innerText = "Admin: " + roomData.admin.name;
    roomData.users.forEach(user => {
        document.getElementById("roomClients").innerText += "\n - " + user.name;
    });
    document.getElementById("sidebarRight").classList.remove("hidden");
});

function login() {
    let nameUser = document.getElementById("Nickname").value;
    document.getElementById("main-chat").classList.remove("hidden");
    document.getElementById("sidebarLeft").classList.remove("hidden");
    document.getElementById("login-div").classList.add("hidden");
    document.getElementById("showName").innerHTML = "Hey " + nameUser + "!";
    socket.emit('join', nameUser);
    console.log(socket);
}

function createRoom() {
    const data = "La Chatroom di " + document.getElementById("Nickname").value;
    socket.emit('createRoom', data);
}

function openRoom(roomId){
    socket.emit('getRoomData', roomId);
}

function sendMessage() {
    const message = document.getElementById("message").value;
    const nickname = document.getElementById("Nickname").value;
    const selectedClient = document.getElementById("connectedClients").value;

    // Errori vari in caso di mancata selezione di qualcosa
    
    if (selectedClient === '') {
        alert("Seleziona un cliente per avviare la chat.");
        return;
    }

    if (message.trim() === '') {
        alert("Inserisci un messaggio.");
        return;
    }

    const data = {
        sender: nickname,
        recipient: selectedClient,
        message: message
    };

    socket.emit("privateMessage", data);
    document.getElementById("chatArea").innerText += "\n" + nickname + ": " + message;
    document.getElementById("message").value = "";
}

function endChat() {
    socket.disconnect();
    document.getElementById("main-chat").classList.add("hidden");
    document.getElementById("sidebarLeft").classList.add("hidden");
    document.getElementById("login-div").classList.remove("hidden");
    document.getElementById("connectedClients").innerHTML = "";
    document.getElementById("message").value = "";
    document.getElementById("chatArea").innerText = "";
    document.getElementById("Nickname").value = "";
}

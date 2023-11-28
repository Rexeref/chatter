// script.js

const socket = io.connect('http://127.0.0.1:3000/');

socket.on("connesso", function (data) {
    document.getElementById("inizio").innerHTML = "Chat Server in ascolto su IP: " + data;
});

socket.on("messaggio", function (data) {
    document.getElementById("chatArea").innerText += data + "\n";
});

socket.on("stato", function (data) {
    const connectedClients = document.getElementById("connectedClients");
    connectedClients.innerHTML = "";

    data.forEach(client => {
        const option = document.createElement("option");
        option.text = client.nickname;
        option.value = client.id;
        connectedClients.add(option);
    });
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
    const chatRoomName = "La Chatroom di " + document.getElementById("Nickname").value;
    socket.emit('createRoom', chatRoomName);
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
    document.getElementById("chatArea").innerText += nickname + ": " + message + "\n";
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

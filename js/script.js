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
    document.getElementById("Nickname").hidden = true;
    document.getElementById("login").hidden = true;
    document.getElementById("logout").hidden = false;
    document.getElementById("message").hidden = false;
    document.getElementById("sendMessage").hidden = false;
    document.getElementById("showName").innerHTML = "Hey " + document.getElementById("Nickname").value + "!";
    document.getElementById("showName").hidden = false;
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
    document.getElementById("Nickname").hidden = false;
    document.getElementById("login").hidden = false;
    document.getElementById("logout").hidden = true;
    document.getElementById("message").hidden = true;
    document.getElementById("sendMessage").hidden = true;
    document.getElementById("showName").hidden = true;
    document.getElementById("connectedClients").innerHTML = "";
    document.getElementById("message").value = "";
    document.getElementById("chatArea").innerText = "";
    document.getElementById("Nickname").value = "";
}

// script.js

const socket = io.connect('http://127.0.0.1:3000/');
let activeRoom = null;

// paragrafo informativo
socket.on("connesso", function (data) {
    document.getElementById("inizio").innerHTML = "Sei connesso al server " + data;
});

/* Metodologia per ricevere messaggi deprecata, usare "getRoomData"
socket.on("messaggio", function (data) {
    document.getElementById("chatArea").innerText += data + "\n";
});
*/

// Aggiorna la lista utenti online in tempo reale
socket.on("lista", function (data) {
    const connectedClients = document.getElementById("connectedClients");
    connectedClients.innerHTML = "";

    data.forEach(client => {
        const option = document.createElement("option");
        option.text = client.nickname;
        option.value = client.id;
        connectedClients.add(option);
    });
});

// Crea un bottone collegato alla room una volta che il server ha inserito i dati nell'array delle room
socket.on("newRoom", function (roomData) {
    //console.log("Aggiunta di una room");
    const newBt = document.createElement("button");
    newBt.innerHTML = roomData.name;
    newBt.setAttribute("onclick", "openRoom('" + roomData.id + "')");
    document.getElementById("roomList").appendChild(newBt);
});

// Riceve e formatta i dati di una data room sulla pagina solo se è la room selezionata dall'utente
socket.on("getRoomData", function (roomData) {
    if(activeRoom === roomData.id){
        console.log("Ricevuti i dati della chatroom " + roomData.id);
        document.getElementById("chatArea").innerText = roomData.timeline;
        document.getElementById("roomName").innerText = roomData.name;
        document.getElementById("roomClients").innerText = "Admin: " + roomData.admin.name;
        roomData.users.forEach(user => {
            document.getElementById("roomClients").innerText += "\n - " + user.name;
        });
        document.getElementById("sidebarRight").classList.remove("hidden");
    }
});

// chiede al server di linkare il proprio id al nome inserito
function login() {
    let nameUser = document.getElementById("Nickname").value;

    if (nameUser === ''){
        alert("Il nome è vuoto!");
        return;
    }
    
    document.getElementById("main-chat").classList.remove("hidden");
    document.getElementById("sidebarLeft").classList.remove("hidden");
    document.getElementById("login-div").classList.add("hidden");
    document.getElementById("showName").innerHTML = "Hey " + nameUser + "!";
    socket.emit('join', nameUser);
    console.log(socket);
}

// Chiede al server di creare una nuova room
function createRoom() {
    const data = "La Chatroom di " + document.getElementById("Nickname").value;
    socket.emit('createRoom', data);
}

// Chiede al server i dati di una data room dato l'id
function openRoom(roomId){
    activeRoom = roomId;
    socket.emit('getRoomData', roomId);
}

// manda un messaggio al server che viene gestito lì
function sendMessage() {
    const message = document.getElementById("message").value;
    const nickname = document.getElementById("Nickname").value;
    const selectedClient = document.getElementById("connectedClients").value;

    // Errori vari in caso di mancata selezione di qualcosa
    
    if (activeRoom == null) {
        alert("Entra in una room!");
        return;
    }

    if (message.trim() === '') {
        alert("Inserisci un messaggio!");
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

// Chiude la connessione e normalizza l'aspetto
function endChat() {
    socket.disconnect();
    document.getElementById("main-chat").classList.add("hidden");
    document.getElementById("sidebarLeft").classList.add("hidden");
    document.getElementById("sidebarRight").classList.add("hidden");
    document.getElementById("login-div").classList.remove("hidden");
    document.getElementById("connectedClients").innerHTML = "";
    document.getElementById("message").value = "";
    document.getElementById("chatArea").innerText = "";
    document.getElementById("Nickname").value = "";
}

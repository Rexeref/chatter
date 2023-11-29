const { v4: uuidv4 } = require('uuid'); // Utilizzato per generare codici univoci nelle room
const http = require('http');
const fs = require('fs');
const port = 3000;
const ip = "127.0.0.1";
const path = require("path");
let numClienti = 0;
const users = [];
const rooms = [];

//
// http request handler

// TEST BRANCH

function requestHandler(req, res) {
    let filePath = '.' + req.url;

    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = path.extname(filePath);
    //console.log(extname);
    let contentType

    switch (extname) {
        case '.html':
            contentType = 'text/html';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
    }    

    fs.readFile(filePath, function (error, content) {
    
        if (error) {
            res.writeHead(404);
        }

        else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.write(content, 'utf-8');
        }
        res.end();

    });

}

const server = http.createServer(requestHandler);

server.listen(port, ip, function () {
    console.log("Server started on       " + ip + ":" + port);
});

//
// socket handler

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.sockets.on('connection', 
    function (socket) {
        // linka l'id del socket al nickname dato
        socket.on('join', function (nickname) { // socket.on( metodo, function (datiRecuperati) {codice in caso;});
            socket.nickname = nickname;
            users.push({ id: socket.id, nickname: nickname });
            console.log(socket.id + '    ha scelto come nickname   ' + nickname);
            numClienti++;
            socket.emit('connesso', ip + ":" + port); // Invio dati al socket singolo
            io.emit('lista', users); // Invio 
        });

        // crea una room e la rimanda al richiedente (che sarà l'admin di quella room)
        socket.on('createRoom', function (data) {
            let randID = uuidv4();
            const roomData = {
                name: randID.substring(5, 10), // qui ci va data, momentaneamente faccio così in modo da avere nomi diversi
                id: randID, // qui avviene la generazione del codice univoco
                users: [users.find(user => user.id == socket.id)],
                timeline: "Benvenuto nella tua nuova Room!"
            }
            rooms.push(roomData);
            console.log(socket.id + '    ha creato room            ' + roomData.id);
            io.to(socket.id).emit("newRoom", roomData);
            //console.log(">>> Nome Stanza [" + rooms[0].name + "], ID Stanza [" + rooms[0].id + "], ID Utente Admin [" + rooms[0].admin.id + "], ID Primo Utente Room [" + rooms[0].users[0].id + "], Testo Timeline [" + rooms[0].timeline + "] <<<")
        });

        // invia i dati della room a chi li richiede dato l'id
        socket.on('getRoomData', function (roomId){
            const myRoom = rooms.find(room => room.id === roomId);
            console.log(socket.id + "    chiesto dati room         " + myRoom.id);
            io.to(socket.id).emit("getRoomData", myRoom);
        });

        // Creare le funzioni per aggiungere utenti, cambiare room in cui scrivere, ecc...
        // Eliminare il vecchio sistema dove tutto viene buttato nella stessa textArea e
        // salvare i dati delle chat (stringhe) nell'apposita variabile della room "timeline"
        // per vedere com'é strutturata la room vai a riga 89

        //WIP: C'è scritto quel che deve fare nel commento dentro
        socket.on('privateMessage', function (data) {
            // Fare in modo che da qui il server inserisca nella chatroom corretta
            // il messaggio e poi invii i dati a tutti i client che fanno parte di
            // quella chatroom (lista users dentro chatroom)
            const recipientSocket = users.find(user => user.id === data.recipient);
            if (recipientSocket) {
                io.to(recipientSocket.id).emit('messaggio', data.sender + ": " + data.message);
            }
        });

        // elimina l'utente che ha richiesto la disconnessione dalla lista degli utenti
        socket.on('disconnect', function () {
            numClienti--;
            console.log(socket.id + "    si è disconnesso");
            users.splice(users.findIndex(user => user.id === socket.id), 1);
            io.emit('lista', users);
        });

    });

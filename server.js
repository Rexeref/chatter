const http = require('http');
const fs = require('fs');
const port = 3000;
const ip = "127.0.0.1";
const path = require("path");
let numClienti = 0;
const users = [];
let createdRoomsNumber = 0;
const rooms = [];

//
// http request handler

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
    console.log("Server started on " + ip + ":" + port);
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

        socket.on('join', function (nickname) { // socket.on( metodo, function (datiRecuperati) {codice in caso;});
            socket.nickname = nickname;
            users.push({ id: socket.id, nickname: nickname });
            console.log('Cliente connesso:', socket.id, 'con nickname:', nickname);
            numClienti++;
            socket.emit('connesso', ip + " porta: " + port); // Invio dati al socket singolo
            io.emit('stato', users); // Invio 
        });

        socket.on('createRoom', function (roomName) {
            createdRoomsNumber++;
            rooms.push({ name: roomName, id: createdRoomsNumber, admin: socket.id, users: [socket.id], timeline: "Ecco a te la tua nuova Room!\n"});
            console.log('è stata creata la room ' + createdRoomsNumber +' da ' + socket.id);
        });

        // Creare le funzioni per aggiungere utenti, cambiare room in cui scrivere, ecc...
        // Eliminare il vecchio sistema dove tutto viene buttato nella stessa textArea e
        // salvare i dati delle chat (stringhe) nell'apposita variabile della room "timeline"
        // per vedere com'é strutturata la room vai a riga 89

        socket.on('privateMessage', function (data) {
            const recipientSocket = users.find(user => user.id === data.recipient);
            if (recipientSocket) {
                io.to(recipientSocket.id).emit('messaggio', data.sender + ": " + data.message);
            }
        });

        socket.on('disconnect', function () {
            numClienti--;
            console.log('Cliente disconnesso:', socket.id);
            users.splice(users.findIndex(user => user.id === socket.id), 1);
            io.emit('stato', users);
        });

    });

const http = require('http');
const fs = require('fs');
const port = 3000;
const ip = "127.0.0.1";
let numClienti = 0;
const users = [];

function requestHandler(request, response) {
    fs.readFile('index.html', function (error, data) {
        if (error) {
            response.writeHead(404);
        } else {
            response.writeHead(200, { "content-Type": "text/html" });
            response.write(data, "utf8");
        }
        response.end();
    });
}

const server = http.createServer(requestHandler);

server.listen(port, ip, function () {
    console.log("Server started on " + ip + ":" + port);
});

const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.sockets.on('connection', function (socket) {
    socket.on('join', function (nickname) {
        socket.nickname = nickname;
        users.push({ id: socket.id, nickname: nickname });
        console.log('Cliente connesso:', socket.id, 'con nickname:', nickname);
        numClienti++;
        socket.emit('connesso', ip + " porta: " + port);
        io.emit('stato', users);
    });

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

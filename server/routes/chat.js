const uuidv4 = require('uuid').v4;
var express = require('express');
var router = express.Router();

const messages = new Set();
const users = new Map();

const defaultUser = {
    id: 'anon',
    name: 'Anonymous',
};

const messageExpirationTimeMS = 5 * 60 * 1000;

class Connection {
    constructor(io, socket) {
        this.socket = socket;
        this.io = io;

        socket.on('getMessages', () => this.getMessages());
        socket.on('message', (value) => this.handleMessage(value));
        socket.on('disconnect', () => this.disconnect());
        socket.on('connect_error', (err) => {
            console.log(`connect_error due to ${err.message}`);
        });
    }

    sendMessage(message) {
        this.io.sockets.emit('message', message);
    }

    getMessages() {
        messages.forEach((message) => this.sendMessage(message));
    }

    handleMessage(value) {
        const message = {
            id: uuidv4(),
            user: users.get(this.socket) || defaultUser,
            value,
            time: Date.now(),
        };

        messages.add(message);
        this.sendMessage(message);

        setTimeout(() => {
            messages.delete(message);
            this.io.sockets.emit('deleteMessage', message.id);
        }, messageExpirationTimeMS);
    }

    disconnect() {
        users.delete(this.socket);
    }
}

function returnRouter(io) {
    router.get('/', function (req, res, next) {
        io.on('connection', (socket) => {
            console.log(`New connection: ${socket.id}`);
            new Connection(io, socket);
        });
    });

    router.post('/message', function (req, res) {
        console.log('Post request hit.');
        // res.contentType('text/xml');
        console.log(appjs);
        // io.sockets.emit('display text', req);
        // res.send('<Response><Sms>'+req.body+'</Sms></Response>');
    });

    return router;
}

module.exports = returnRouter;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const avalonNameSpace_js_1 = require("./namespaces/avalonNameSpace.js");
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
// import indexRouter from './routes/index';
// import usersRouter from './routes/users';
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);
});
// TODO move this to avalon namespace file
(0, avalonNameSpace_js_1.initNameSpace)(io);
//Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    //set static folder
    app.use(express_1.default.static('client/build'));
    app.get('*', (req, res) => res.sendFile(path_1.default.resolve(__dirname, 'client', 'build', 'index.html')));
}
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
// module.exports = app;

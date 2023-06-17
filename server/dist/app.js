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
const mainNameSpace_1 = require("./namespaces/mainNameSpace/mainNameSpace");
const avalonNameSpace_js_1 = require("./namespaces/avalonNameSpace/avalonNameSpace.js");
const lokiDB_1 = require("./config/lokiDB");
(0, db_1.connectDB)();
(0, lokiDB_1.initLoki)();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: false,
    },
});
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
(0, mainNameSpace_1.initMainNameSpace)(io);
(0, avalonNameSpace_js_1.initAvalonNameSpace)(io);
const PORT = process.env.PORT || 3500;
process.on('SIGTERM', (signal) => {
    console.log(`Process ${process.pid} received a SIGTERM signal`);
    process.exit(0);
});
process.on('SIGINT', (signal) => {
    console.log(`Process ${process.pid} has been interrupted`);
    process.exit(0);
});
process.on('uncaughtException', (err) => {
    console.log(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled rejection at ', promise, `reason: ${reason}`);
    process.exit(1);
});
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

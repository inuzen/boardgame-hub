import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import 'dotenv/config';

import { Server } from 'socket.io';
import { createServer } from 'http';

import { initMainNameSpace } from './namespaces/mainNameSpace/mainNameSpace';
import { initAvalonNameSpace } from './namespaces/avalonNameSpace/avalonNameSpace.js';
import { initLoki } from './config/lokiDB';

initLoki();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: false,
    },
});

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

initMainNameSpace(io);
initAvalonNameSpace(io);

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

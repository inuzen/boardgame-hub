import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { connectDB } from './config/db';
import { Server } from 'socket.io';
import { createServer } from 'http';

import { initMainNameSpace } from './namespaces/mainNameSpace/mainNameSpace';
import { initAvalonNameSpace } from './namespaces/avalonNameSpace/avalonNameSpace.js';

connectDB();

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

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

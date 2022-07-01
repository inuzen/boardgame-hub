import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { connectDB } from './config/db';
import { Server } from 'socket.io';
import { createServer } from 'http';

import { initNameSpace } from './namespaces/avalonNameSpace.js';

connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// import indexRouter from './routes/index';
// import usersRouter from './routes/users';

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);
});

// TODO move this to avalon namespace file
initNameSpace(io);

//Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    //set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')));
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
// module.exports = app;

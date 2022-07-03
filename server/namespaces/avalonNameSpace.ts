import { getQuestsForPlayerCount } from './engine';
import { Namespace, Server, Socket } from 'socket.io';
import {
    createPlayer,
    createRoom,
    findAndDeletePlayer,
    getPlayerList,
    assignRoles,
    countPlayers,
    getRoomWithPlayers,
    updateRoom,
    initQuests,
    getQuests,
} from './dbActions';

class Connection {
    socket: Socket;
    ns: Namespace;
    roomCode: string;

    constructor(ns: Namespace, socket: Socket) {
        this.socket = socket;
        this.ns = ns;
        this.roomCode = '';

        socket.on('disconnect', () => this.disconnect());
        socket.on('disconnecting', () => this.disconnecting());
        // socket.on('get roles', async () => await this.assignRoles());
        // socket.on('get quests', async () => await this.getQuests());
        socket.on('start game', async () => await this.startGame());

        socket.on('room', async ({ roomCode, nickname }) => {
            const [_, created] = await createRoom(roomCode, socket.id);
            socket.join(roomCode);
            this.roomCode = roomCode;
            await createPlayer({ roomCode, socketId: socket.id, name: nickname, isHost: created });
            const players = await getPlayerList(roomCode);
            ns.to(roomCode).emit('players', players);
            if (players.length > 1) {
                this.initAndSendQuests(players.length);
            }
        });
    }

    async disconnecting() {
        const { id } = this.socket;
        await findAndDeletePlayer(id);
    }

    async initAndSendQuests(playerCount: number) {
        await initQuests(this.roomCode, playerCount);
        const quests = await getQuests(this.roomCode);
        this.ns.to(this.roomCode).emit(
            'quests',
            quests.sort((a, b) => a.questNumber - b.questNumber),
        );
    }

    // TODO make it so you cant see the roles of others through network requests
    async startGame() {
        // TODO Support extra roles
        await assignRoles(this.roomCode);
        // this.getQuests();
        const roomInfo = await getRoomWithPlayers(this.roomCode);
        this.ns.to(this.roomCode).emit('update room', { roomInfo });
    }

    // async assignRoles() {
    // await assignRoles(this.roomCode);
    // const updatedPlayers = await getPlayerList(this.roomCode);
    // updatedPlayers.forEach((player: any) => {
    //     // TODO include initial role message
    //     this.ns.to(player.socketId).emit('role', player.role);
    // });
    // this.ns.to(this.roomCode).emit('quests', getQuestsForPlayerCount(updatedPlayers.length));
    // }

    disconnect() {}
}

const initNameSpace = (io: Server) => {
    const avalonNameSpace = io.of('/avalon');
    avalonNameSpace.on('connection', (socket) => {
        new Connection(avalonNameSpace, socket);
    });
};
export { initNameSpace };

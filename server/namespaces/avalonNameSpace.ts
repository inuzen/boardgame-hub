import { getQuestsForPlayerCount } from './engine';
import { Namespace, Server, Socket } from 'socket.io';
import { createPlayer, createRoom, findAndDeletePlayer, getPlayerList, assignRoles } from './dbActions';

class Connection {
    socket: Socket;
    ns: Namespace;

    constructor(ns: Namespace, socket: Socket) {
        this.socket = socket;
        this.ns = ns;

        socket.on('disconnect', () => this.disconnect());
        socket.on('disconnecting', () => this.disconnecting());
        socket.on('get roles', async (roomCode) => await this.assignRoles(roomCode));

        socket.on('room', async ({ roomCode, nickname }) => {
            socket.join(roomCode);
            await createRoom(roomCode);
            await createPlayer({ roomCode, socketId: socket.id, name: nickname });
            const players = await getPlayerList(roomCode);
            ns.to(roomCode).emit('players', players);
        });
    }

    async disconnecting() {
        const { id } = this.socket;
        await findAndDeletePlayer(id);
    }

    async assignRoles(roomCode: string) {
        await assignRoles(roomCode);
        const updatedPlayers = await getPlayerList(roomCode);
        updatedPlayers.forEach((player: any) => {
            // TODO include initial role message
            this.ns.to(player.socketId).emit('role', player.role);
            this.ns.to(roomCode).emit('quests', getQuestsForPlayerCount(updatedPlayers.length));
        });
    }

    disconnect() {}
}

const initNameSpace = (io: Server) => {
    const avalonNameSpace = io.of('/avalon');
    avalonNameSpace.on('connection', (socket) => {
        new Connection(avalonNameSpace, socket);
    });
};
export { initNameSpace };

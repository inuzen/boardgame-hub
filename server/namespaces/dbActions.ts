import { AvalonRoom, AvalonPlayer } from '../config/db';
import { createRoleDistributionArray } from './engine';

export interface IAvalonPlayer {
    roomCode: string;
    name: string;
    socketId: string;
    role?: string;
}

export const getPlayerList = async (roomCode: string) => {
    const players = await AvalonPlayer.findAll({
        where: {
            roomCode,
        },
    });
    return players;
};

export const removeRoomAndPlayers = async (roomCode: string) => {
    const room = await AvalonRoom.findOne({
        where: {
            roomCode,
        },
    });
    if (room) {
        await Promise.all([
            AvalonRoom.destroy({
                where: {
                    roomCode,
                },
            }),
            AvalonPlayer.destroy({
                where: {
                    roomCode,
                },
            }),
        ]);
    }
};

export const createRoom = async (roomCode: string) => {
    await AvalonRoom.findOrCreate({
        where: {
            roomCode,
        },
    });
};

export const createPlayer = async ({ roomCode, name, socketId }: IAvalonPlayer) => {
    await AvalonPlayer.create({
        roomCode,
        name,
        socketId,
    });
};

export const updatePlayer = async ({ socketId, updatedProperties }: any) => {
    console.log(updatedProperties, 'updatePlayer');

    await AvalonPlayer.update(updatedProperties, {
        where: {
            socketId: socketId,
        },
    });
};

// TODO make appropriate changes if at some point the same socket will be used for multiple rooms
export const findAndDeletePlayer = async (socketId: string) => {
    try {
        const player = await AvalonPlayer.findOne({
            where: {
                socketId,
            },
        });
        if (player) {
            await AvalonPlayer.destroy({
                where: {
                    socketId,
                },
            });
            const players = await AvalonPlayer.findAll({
                where: {
                    // @ts-ignore
                    roomCode: player.roomCode,
                },
            });
            // @ts-ignore
            this.ns.to(player.roomCode).emit('players', players);
        }
    } catch (e) {
        console.log(e);
    }
};

export const assignRoles = async (roomCode: string) => {
    console.log(roomCode, 'assigning roles');

    const players: any[] = await getPlayerList(roomCode);
    const playerCount = players.length;
    const rolesForPlayers = createRoleDistributionArray(playerCount);
    console.log(players);

    const updateArray = players.map((player, i) => {
        return updatePlayer({
            socketId: player.socketId,
            updatedProperties: { role: rolesForPlayers[i].roleName },
        });
    });
    await Promise.all(updateArray);
};

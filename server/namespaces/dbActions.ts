import { AvalonRoom, AvalonPlayer } from '../config/db';
import { createRoleDistributionArray } from './engine';
import { ROLE_LIST } from './types';

export interface IAvalonPlayer {
    roomCode: string;
    name: string;
    socketId: string;
    role?: string;
    isCurrentLeader?: boolean;
    isHost?: boolean;
    currentVote?: boolean;
    isNominated?: boolean;
}

export interface IAvalonRoom {
    hostSocketId: number;
    partySize: number;
    evilScore: number;
    goodScore: number;
    currentQuest: number;
    currentLeader: string | null;
    nominatedPlayers: string[];
    extraRoles: ROLE_LIST[];
    missedTeamVotes: number;
    questHistory: boolean[];
    leaderCanSelectQuest: boolean;
    gameInProgress: boolean;
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

export const updateRoom = async (roomCode: string, newData: any) => {
    await AvalonRoom.update(newData, {
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
    const players: any[] = await getPlayerList(roomCode);
    const playerCount = players.length;
    const rolesForPlayers = createRoleDistributionArray(playerCount);

    const updateArray = players.map((player, i) => {
        return updatePlayer({
            socketId: player.socketId,
            updatedProperties: { role: rolesForPlayers[i].roleName },
        });
    });
    await Promise.all(updateArray);
};

import { AvalonRoom, AvalonPlayer, AvalonQuest } from '../config/db';
import { createRoleDistributionArray, DISTRIBUTION } from './engine';
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
export const countPlayers = async (roomCode: string) => {
    const playerCount = await AvalonPlayer.count({
        where: {
            roomCode,
        },
    });
    return playerCount;
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

export const getRoomWithPlayers = async (roomCode: string) => {
    const room = await AvalonRoom.findOne({
        where: {
            roomCode,
        },
        include: AvalonPlayer,
    });

    return room;
};

export const createRoom = async (roomCode: string, socketId: string) => {
    return await AvalonRoom.findOrCreate({
        where: {
            roomCode,
        },
        defaults: {
            roomCode,
            hostSocketId: socketId,
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

type Quest = {
    roomCode: string;
    questNumber: number;
    questPartySize: number;
    questResult: 'success' | 'fail' | '';
    active: boolean;
};

// get all quests for a room
export const getQuests = async (roomCode: string) => {
    const quests = await AvalonQuest.findAll({
        where: {
            roomCode,
        },
    });
    return quests;
};

export const initQuests = async (roomCode: string, numberOfPlayers: number) => {
    const { questPartySize } = DISTRIBUTION[numberOfPlayers];
    const quests = await AvalonQuest.findAll({
        where: {
            roomCode,
        },
    });
    if (quests.length) {
        await AvalonQuest.destroy({
            where: {
                roomCode,
            },
        });
    }
    await AvalonQuest.bulkCreate(
        questPartySize.map((partySize: number, i): Quest => {
            return { roomCode, questNumber: i + 1, questPartySize: partySize, questResult: '', active: i === 0 };
        }),
    );
};

export const updateQuest = async ({ roomCode, questNumber, questResult, active }: Quest) => {
    const currentActiveQuest = await AvalonQuest.findOne({
        where: {
            roomCode,
            active: true,
        },
    });

    if (currentActiveQuest && currentActiveQuest.questNumber !== questNumber && active) {
        currentActiveQuest.active = false;
        await currentActiveQuest.save();
    }

    await AvalonQuest.update(
        { active, questResult: questResult || '' },
        {
            where: {
                roomCode,
                questNumber,
            },
        },
    );
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

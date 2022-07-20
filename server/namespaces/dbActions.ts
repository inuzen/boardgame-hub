import { Op } from 'sequelize';
import { AvalonRoom, AvalonPlayer, AvalonQuest } from '../config/db';
import { AvalonPlayerModel, AvalonPlayerType } from '../models/AvalonPlayer';
import { AvalonRoomType } from '../models/AvalonRoom';
import { createMessageByRole, createRoleDistributionArray, DISTRIBUTION } from './engine';

export const getPlayerList = async (roomCode: string) => {
    const players = await AvalonPlayer.findAll({
        where: {
            roomCode,
        },
        order: [['order', 'ASC']],
    });
    return players;
};

export const findPlayer = async (roomCode: string, where: Record<string, any>) => {
    const player = await AvalonPlayer.findOne({
        where: {
            roomCode,
            ...where,
        },
    });
    return player;
};

export const createPlayer = async (player: AvalonPlayerType) => {
    const newPlayer = await AvalonPlayer.create(player);
    return newPlayer;
};

export const updatePlayer = async ({
    socketId,
    updatedProperties,
}: {
    socketId: string;
    updatedProperties: Partial<AvalonPlayerType>;
}) => {
    await AvalonPlayer.update(updatedProperties, {
        where: {
            socketId: socketId,
        },
    });
};
export const updateAllPlayers = async (roomCode: string, updatedProperties: Partial<AvalonPlayerType>) => {
    await AvalonPlayer.update(updatedProperties, {
        where: {
            roomCode,
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
        }
    } catch (e) {
        console.log(e);
    }
};

export const deleteRoomIfNoPlayers = async (roomCode: string) => {
    try {
        const room = await getRoomWithPlayers(roomCode);
        if (room && room.AvalonPlayers?.length === 0) {
            await AvalonRoom.destroy({
                where: {
                    roomCode,
                },
            });
        }
    } catch (error) {}
};

// export const getPlayerRole = async (roomCode: string, socketId: string) => {
//     const player = await AvalonPlayer.findOne({
//         where: {
//             roomCode,
//             socketId,
//         },
//     });
//     return player?.role;
// };

export const getPlayerBySocketId = async (roomCode: string, socketId: string) => {
    const player = await AvalonPlayer.findOne({
        where: {
            roomCode,
            socketId,
        },
    });
    return player;
};
export const countPlayers = async (roomCode: string, condition?: Record<string, any>) => {
    const playerCount = await AvalonPlayer.count({
        where: {
            roomCode,
            ...condition,
        },
    });
    return playerCount;
};

export const nominatePlayer = async (roomCode: string, playerId: string) => {
    const players = await getPlayerList(roomCode);
    const { selectedPlayer, nominatedCount } = players.reduce(
        (acc: { selectedPlayer: AvalonPlayerModel | null; nominatedCount: number }, currPlayer) => {
            if (currPlayer.socketId === playerId) {
                acc.selectedPlayer = currPlayer;
            }
            if (currPlayer.nominated) {
                acc.nominatedCount++;
            }
            return acc;
        },
        {
            selectedPlayer: null,
            nominatedCount: 0,
        },
    );
    if (selectedPlayer) {
        const quest = await getActiveQuest(roomCode);
        if (selectedPlayer.nominated) {
            selectedPlayer.nominated = false;
        }

        if (!selectedPlayer.nominated && quest?.questPartySize! > nominatedCount) {
            selectedPlayer.nominated = true;
        }
        await selectedPlayer.save();
    }
};

// ROOM
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
        include: [
            {
                model: AvalonPlayer,
                order: [['order', 'ASC']],
                attributes: { exclude: ['roleName', 'roleKey', 'side', 'secretInformation'] },
            },
            { model: AvalonQuest, order: [['questNumber', 'ASC']] },
        ],
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

export const getRoom = async (roomCode: string, attr?: string[]) => {
    const room = await AvalonRoom.findOne({
        where: {
            roomCode,
        },
        attributes: attr,
    });
    return room;
};

export const updateRoom = async (roomCode: string, newData: Partial<AvalonRoomType>) => {
    await AvalonRoom.update(newData, {
        where: {
            roomCode,
        },
    });
};

// QUEST
type Quest = {
    roomCode: string;
    questNumber: number;
    questPartySize: number;
    questResult: 'success' | 'fail' | null;
    active: boolean;
};

// get all quests for a room
export const getQuests = async (roomCode: string) => {
    const quests = await AvalonQuest.findAll({
        where: {
            roomCode,
        },
        order: [['questNumber', 'ASC']],
    });
    return quests;
};

export const getActiveQuest = async (roomCode: string) => {
    const quests = await AvalonQuest.findOne({
        where: {
            roomCode,
            active: true,
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
            return { roomCode, questNumber: i + 1, questPartySize: partySize, questResult: null, active: i === 0 };
        }),
    );
};

export const changeActiveQuest = async (roomCode: string, questNumber: number) => {
    if (questNumber > 5) {
        return;
    }

    const currentActiveQuest = await AvalonQuest.findOne({
        where: {
            roomCode,
            active: true,
        },
    });

    if (currentActiveQuest && currentActiveQuest.questNumber !== questNumber) {
        currentActiveQuest.active = false;
        await currentActiveQuest.save();
    }

    await AvalonQuest.update(
        { active: true },
        {
            where: {
                roomCode,
                questNumber,
            },
        },
    );
};

export const updateQuestResult = async (
    roomCode: string,
    questNumber: number,
    questResult: 'success' | 'fail' | null,
) => {
    await AvalonQuest.update(
        { questResult },
        {
            where: {
                roomCode,
                questNumber,
            },
        },
    );
};

// export const updateQuest = async ({ roomCode, questNumber, questResult, active }: Quest) => {
//     const currentActiveQuest = await AvalonQuest.findOne({
//         where: {
//             roomCode,
//             active: true,
//         },
//     });

//     if (currentActiveQuest && currentActiveQuest.questNumber !== questNumber && active) {
//         currentActiveQuest.active = false;
//         await currentActiveQuest.save();
//     }

//     await AvalonQuest.update(
//         { active, questResult: questResult || '' },
//         {
//             where: {
//                 roomCode,
//                 questNumber,
//             },
//         },
//     );
// };

// UTILS
// also assigns the first leader

export const assignRoles = async (roomCode: string) => {
    const players: AvalonPlayerModel[] = await getPlayerList(roomCode);
    const room = await getRoom(roomCode, ['extraRoles']);
    const playerCount = players.length;
    const firstLeaderOrderNumber = Math.floor(Math.random() * playerCount);
    const rolesForPlayers = createRoleDistributionArray(playerCount, room?.extraRoles);

    players.forEach((player, i) => {
        player.roleName = rolesForPlayers[i].roleName;
        player.roleKey = rolesForPlayers[i].key;
        player.side = rolesForPlayers[i].side;
        player.isCurrentLeader = i === firstLeaderOrderNumber;
        player.order = i;
    });

    const addSecretInformation = players.map((player, i, arr) => {
        player.secretInformation = createMessageByRole(player, arr);
        return player.save();
    });

    await Promise.all(addSecretInformation);
};

export const switchToNextLeader = async (roomCode: string) => {
    const players = await getPlayerList(roomCode);
    // await updateAllPlayers(roomCode, { nominated: false });
    const currentLeader = players.find((player) => player.isCurrentLeader);
    if (currentLeader) {
        const newLeaderOrder = currentLeader.order + 1;
        console.log('newLeaderOrder', newLeaderOrder);

        const newLeader = players.find((player) => {
            if (newLeaderOrder >= players.length) {
                return player.order === 0;
            }
            return player.order === newLeaderOrder;
        });
        currentLeader.isCurrentLeader = false;
        await currentLeader.save();
        if (newLeader) {
            newLeader.isCurrentLeader = true;
            await newLeader.save();
            return newLeader.socketId;
        }
    }
    return '';
};

export const handleGlobalVote = async (roomCode: string) => {
    const players = await getPlayerList(roomCode);
    const playerCount = players.length;
    const votedPlayers = players.filter((player) => !!player.globalVote);

    if (votedPlayers.length === playerCount) {
        const roomState = await getRoom(roomCode);
        if (roomState) {
            roomState.globalVoteInProgress = false;
            roomState.revealVotes = true;

            const votedInFavor = players.filter((player) => player.globalVote === 'yes');
            if (votedInFavor.length > votedPlayers.length / 2) {
                roomState.questVoteInProgress = true;
                roomState.missedTeamVotes = 1;
                roomState.gameMessage = 'The vote passed!\n Selected players must now decide on the quest result';
            } else {
                const newLeaderId = await switchToNextLeader(roomCode);
                roomState.questVoteInProgress = false;
                roomState.nominationInProgress = true;
                roomState.missedTeamVotes = roomState?.missedTeamVotes! + 1;
                roomState.currentLeaderId = newLeaderId;
                roomState.gameMessage = 'The vote has failed!\n Now new leader must nominate a new party';
                await updateAllPlayers(roomCode, { nominated: false });
            }
            if (roomState.missedTeamVotes === 5) {
                roomState.gameInProgress = false;
                roomState.gameMessage = 'The EVIL has won!\n The party was not formed 5 times in a row.';
                roomState.revealRoles = true;
            }
            await roomState.save();
        }
    }
};

export const clearVotes = async (roomCode: string) => {
    await updateAllPlayers(roomCode, { globalVote: null, questVote: null });
};

export const startNewVoteCycle = async (roomCode: string) => {
    await updateAllPlayers(roomCode, { globalVote: null, questVote: null, nominated: false });
};

export const handleQuestVote = async (roomCode: string) => {
    const players = await getPlayerList(roomCode);
    const nominatedPlayers = players.filter((player) => player.nominated);
    const nominatedPlayersCount = nominatedPlayers.length;
    const votedPlayers = players.filter((player) => !!player.questVote);
    const roomState = await getRoom(roomCode);
    const nextQuestNumber = roomState?.currentQuest! + 1;
    if (roomState && votedPlayers.length === nominatedPlayersCount) {
        const votedInFavor = players.filter((player) => player.questVote === 'yes');
        const newLeaderId = await switchToNextLeader(roomCode);

        roomState.questVoteInProgress = false;
        roomState.nominationInProgress = true;
        roomState.revealVotes = false;
        roomState.currentLeaderId = newLeaderId;
        roomState.currentQuestResults = votedPlayers.map((player) => !!player.questVote);

        if (votedInFavor.length > votedPlayers.length / 2) {
            await updateQuestResult(roomCode, roomState?.currentQuest!, 'success');
        } else {
            await updateQuestResult(roomCode, roomState?.currentQuest!, 'fail');
        }
        roomState.gameMessage = `${votedInFavor.length} player(s) voted in favor of the quest.\n Now new leader must nominate a new party`;
        roomState.currentQuest = nextQuestNumber;
        await startNewVoteCycle(roomCode);

        const gameEnd = await checkForEndGame(roomCode);
        // Need this check in case the quest is selected manually
        if (gameEnd.gameEnded) {
            if (gameEnd.goodWon) {
                roomState.gameMessage =
                    'Good has won. But evil still has a chance. Assassin must kill Merlin to snatch a victory.';
                roomState.assassinationInProgress = true;
                roomState.questVoteInProgress = false;
                roomState.nominationInProgress = false;
            } else {
                roomState.revealRoles = true;
                roomState.gameInProgress = false;
                roomState.gameMessage = 'Evil has won!';
            }
            // return gameEnd;
        } else {
            await changeActiveQuest(roomCode, nextQuestNumber);
        }
        await roomState.save();
    }
};

export const checkForEndGame = async (roomCode: string) => {
    const quests = await AvalonQuest.findAll({
        where: {
            roomCode,
            questResult: {
                [Op.not]: null,
            },
        },
    });

    const wonQuests = quests.filter((quest) => quest.questResult === 'success');
    const failedQuests = quests.filter((quest) => quest.questResult === 'fail');

    return {
        gameEnded: wonQuests.length === 3 || failedQuests.length === 3,
        goodWon: wonQuests.length === 3,
    };
};

export const restoreDefaults = async (roomCode: string) => {};

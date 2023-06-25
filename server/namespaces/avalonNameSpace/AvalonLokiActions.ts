import { db, Avalon } from '../../config/lokiDB';
import { shuffle } from '../../utils/utils';
import { DISTRIBUTION, createMessageByRole, createRoleDistributionArray } from './engine';
import { AVATARS, AvalonPlayer } from './types';
import { v4 as uuidv4 } from 'uuid';

const initialQuests = [1, 2, 3, 4, 5].map((questNumber) => {
    return { questNumber, questPartySize: null, questResult: null, active: false };
});
export const addRoom = (roomCode: string) => {
    Avalon.insert({
        roomCode,
        players: [],
        takenImages: Object.keys(AVATARS).reduce((acc: Record<string, any>, avatar) => {
            acc[avatar] = { key: avatar, taken: false };
            return acc;
        }, {}),
        currentQuest: null,
        hostSocketId: '',
        currentLeaderId: null,
        extraRoles: [],
        missedTeamVotes: null,
        currentQuestResults: null,
        leaderCanSelectQuest: false,
        gameInProgress: false,
        nominationInProgress: false,
        globalVoteInProgress: false,
        questVoteInProgress: false,
        assassinationInProgress: false,
        gameMessage: '',
        revealVotes: false,
        revealRoles: false,
        quests: initialQuests,
    });
};

export const getRoomByCode = (roomCode: string) => Avalon.findOne({ roomCode })!;

export type AvalonLokiRoom = ReturnType<typeof getRoomByCode>;

export const addPlayerToRoom = (room: AvalonLokiRoom, { nickname, roomCode, isHost = false, socketId }) => {
    const playerCount = room.players.length;
    console.log('WE HERE');

    const avatars = Object.values(room.takenImages);
    const availableAvatars = avatars.filter((avatar) => !avatar.taken);
    const suggestedAvatar = !!availableAvatars.length
        ? shuffle(availableAvatars)[0]
        : avatars[Math.floor(Math.random() * avatars.length)];

    room.takenImages[suggestedAvatar.key].taken = true;
    const playerUUID = uuidv4();

    room.players.push({
        playerUUID,
        roomCode,
        socketId,
        name: nickname,
        isHost,
        order: playerCount + 1,
        connected: true,
        imageName: suggestedAvatar.key,
    } as AvalonPlayer);
    return playerUUID;
};

export const updatePlayerLoki = ({
    room,
    socketId,
    updatedProperties,
}: {
    room: AvalonLokiRoom;
    socketId: string;
    updatedProperties: Partial<AvalonPlayer>;
}) => {
    if (!room) return;
    room.players.forEach((p) => {
        if (socketId === p.socketId) {
            Object.entries(updatedProperties).forEach(([key, val]) => {
                // @ts-ignore
                p[key] = val;
            });
        }
    });
    Avalon.update(room);
};

export const updateAllPlayersLoki = (lokiRoom: AvalonLokiRoom, updatedProperties: Partial<AvalonPlayer>) => {
    if (!lokiRoom) return;

    lokiRoom.players.forEach((player) => {
        Object.entries(updatedProperties).forEach(([key, val]) => {
            // @ts-ignore
            player[key] = val;
        });
    });
    Avalon.update(lokiRoom);
};

export const assignRolesLoki = (lokiRoom: AvalonLokiRoom) => {
    if (!lokiRoom) return;

    const players = lokiRoom.players;

    const playerCount = players.length;
    const firstLeaderOrderNumber = Math.floor(Math.random() * playerCount);
    const rolesForPlayers = createRoleDistributionArray(playerCount, lokiRoom.extraRoles);

    players.forEach((player, i) => {
        player.roleName = rolesForPlayers[i].roleName;
        player.roleKey = rolesForPlayers[i].key;
        player.side = rolesForPlayers[i].side;
        player.isCurrentLeader = i === firstLeaderOrderNumber;
        player.order = i;
        player.roleDescription = rolesForPlayers[i].ability;
    });

    players.forEach((player, i, arr) => {
        player.secretInformation = createMessageByRole(player, arr);
    });

    Avalon.update(lokiRoom);
};

export const startNewVoteCycleLoki = (room: AvalonLokiRoom) => {
    updateAllPlayersLoki(room, { globalVote: null, questVote: null, nominated: false });
};

export const initQuestsLoki = (room: AvalonLokiRoom) => {
    if (!room) return;

    const { questPartySize } = DISTRIBUTION[room.players.length];
    room.quests = initialQuests;
    room.quests.forEach((quest, i) => {
        quest.questPartySize = questPartySize[i];
        if (quest.questNumber === 1) quest.active = true;
    });
    Avalon.update(room);
};

export const nominatePlayerLoki = (room: AvalonLokiRoom, playerId: string) => {
    if (!room) return;

    const { players } = room;

    const selectedPlayer = players.find((p) => p.socketId === playerId);
    const nominatedCount = players.filter((p) => p.nominated).length;

    if (selectedPlayer) {
        if (selectedPlayer.nominated) {
            selectedPlayer.nominated = false;
        }

        const activeQuest = room.quests.find((q) => q.active);
        if (!selectedPlayer.nominated && activeQuest?.questPartySize! > nominatedCount) {
            selectedPlayer.nominated = true;
        }
    }
    Avalon.update(room);
};

export const handleGlobalVoteLoki = (room: AvalonLokiRoom) => {
    if (!room) return;

    const { players } = room;

    const playerCount = players.length;
    const votedPlayers = players.filter((player) => !!player.globalVote);

    if (votedPlayers.length === playerCount) {
        room.globalVoteInProgress = false;
        room.revealVotes = true;

        const votedInFavor = players.filter((player) => player.globalVote === 'yes');
        if (votedInFavor.length > votedPlayers.length / 2) {
            room.questVoteInProgress = true;
            room.missedTeamVotes = 1;
            room.gameMessage = 'The vote passed!\n Selected players must now decide on the quest result';
        } else {
            const newLeaderId = switchToNextLeaderLoki(room);
            room.questVoteInProgress = false;
            room.nominationInProgress = true;
            room.missedTeamVotes = room?.missedTeamVotes! + 1;
            room.currentLeaderId = newLeaderId;
            room.gameMessage = 'The vote has failed!\n Now new leader must nominate a new party';
            updateAllPlayersLoki(room, { nominated: false });
        }
        if (room.missedTeamVotes === 5) {
            room.gameInProgress = false;
            room.gameMessage = 'The EVIL has won!\n The party was not formed 5 times in a row.';
            room.revealRoles = true;
        }
    }
    Avalon.update(room);
};

export const handleQuestVoteLoki = (room: AvalonLokiRoom) => {
    if (!room) return;

    const { players } = room;

    const nominatedPlayers = players.filter((player) => player.nominated);
    const nominatedPlayersCount = nominatedPlayers.length;
    const votedPlayers = players.filter((player) => !!player.questVote);

    const nextQuestNumber = room?.currentQuest! + 1;
    if (votedPlayers.length === nominatedPlayersCount) {
        const votedAgainst = players.filter((player) => player.questVote === 'no');
        const newLeaderId = switchToNextLeaderLoki(room);

        room.questVoteInProgress = false;
        room.nominationInProgress = true;
        room.revealVotes = false;
        room.currentLeaderId = newLeaderId;
        room.currentQuestResults = votedPlayers.map((player) => !!player.questVote);
        const requiredVotesToFail = room.currentQuest === 4 && players.length > 6 ? 2 : 1;
        if (votedAgainst.length >= requiredVotesToFail) {
            updateQuestResultLoki(room, room?.currentQuest!, 'fail');
        } else {
            updateQuestResultLoki(room, room?.currentQuest!, 'success');
        }
        room.gameMessage = `${
            votedPlayers.length - votedAgainst.length
        } player(s) voted in favor of the quest.\nNow new leader must nominate a new party.\n${
            nextQuestNumber === 4 && players.length > 6 ? 'Note: This quest requires 2 votes to fail.' : ''
        }`;
        room.currentQuest = nextQuestNumber;
        startNewVoteCycleLoki(room);

        const gameEnd = checkForEndGameLoki(room);
        // Need this check in case the quest is selected manually

        if (gameEnd.gameEnded) {
            console.log('GAME END');

            if (gameEnd.goodWon) {
                room.gameMessage =
                    'Good has won. But evil still has a chance. Assassin must kill Merlin to snatch a victory.';
                room.assassinationInProgress = true;
                room.questVoteInProgress = false;
                room.nominationInProgress = false;
                room.currentLeaderId = null;
            } else {
                room.revealRoles = true;
                room.gameInProgress = false;
                room.gameMessage = 'Evil has won!';
            }
        } else {
            changeActiveQuestLoki(room, nextQuestNumber);
        }
    }
    // TODO: Maybe make check for room and force update into a HOC
    Avalon.update(room);
};

export const switchToNextLeaderLoki = (room: AvalonLokiRoom) => {
    if (!room) return '';
    const { players } = room;
    const currentLeader = players.find((player) => player.isCurrentLeader);
    if (currentLeader) {
        const newLeaderOrder = currentLeader.order + 1;

        const newLeader = players.find((player) => {
            if (newLeaderOrder >= players.length) {
                return player.order === 0;
            }
            return player.order === newLeaderOrder;
        });
        currentLeader.isCurrentLeader = false;
        if (newLeader) {
            newLeader.isCurrentLeader = true;
            return newLeader.socketId;
        }
    }
    Avalon.update(room);
    return '';
};

export const updateQuestResultLoki = (
    room: AvalonLokiRoom,
    questNumber: number,
    questResult: 'success' | 'fail' | null,
) => {
    if (!room) return;
    const quest = room.quests.find((q) => q.questNumber === questNumber);
    if (quest) {
        quest.questResult = questResult;
    }
    Avalon.update(room);
};

export const checkForEndGameLoki = (room: AvalonLokiRoom) => {
    const wonQuests = room?.quests.filter((quest) => quest.questResult === 'success');
    const failedQuests = room?.quests.filter((quest) => quest.questResult === 'fail');

    return {
        gameEnded: wonQuests?.length === 3 || failedQuests?.length === 3,
        goodWon: wonQuests?.length === 3,
    };
};

export const changeActiveQuestLoki = (room: AvalonLokiRoom, nextActiveQuestNumber: number) => {
    if (!room) return;

    if (nextActiveQuestNumber > 5) {
        return;
    }

    const currentActiveQuest = room.quests.find((q) => q.active);
    const nextActiveQuest = room.quests.find((q) => q.questNumber === nextActiveQuestNumber);

    if (currentActiveQuest && currentActiveQuest.questNumber !== nextActiveQuestNumber) {
        currentActiveQuest.active = false;
    }

    if (nextActiveQuest) {
        nextActiveQuest.active = true;
    }

    Avalon.update(room);
};

export const getActiveQuestLoki = (room: AvalonLokiRoom) => {
    if (!room) return null;
    return room.quests.find((q) => q.active);
};

export const countPlayersLoki = (room: AvalonLokiRoom, condition?: Record<string, any>) => {};

export const clearVotesLoki = (room: AvalonLokiRoom) => {
    if (!room) return;
    room.players.forEach((p) => {
        p.globalVote = null;
        p.questVote = null;
    });
    Avalon.update(room);
};

import { db, Avalon } from '../../config/lokiDB';
import { shuffle } from '../../utils/utils';
import { DISTRIBUTION, createMessageByRole, createRoleDistributionArray } from './engine';
import { AVATARS, AvalonPlayer, ROLE_LIST } from './types';
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

export const addPlayerToRoomLoki = (
    room: AvalonLokiRoom,
    {
        nickname,
        roomCode,
        isHost = false,
        socketId,
    }: { nickname: string; roomCode: string; isHost: boolean; socketId: string },
) => {
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

export const updatePlayerLoki = (
    room: AvalonLokiRoom,
    {
        socketId,
        updatedProperties,
    }: {
        socketId: string;
        updatedProperties: Partial<AvalonPlayer>;
    },
) => {
    room.players.forEach((p) => {
        if (socketId === p.socketId) {
            Object.entries(updatedProperties).forEach(([key, val]) => {
                // @ts-ignore
                p[key] = val;
            });
        }
    });
};

export const updateAllPlayersLoki = (room: AvalonLokiRoom, updatedProperties: Partial<AvalonPlayer>) => {
    room.players.forEach((player) => {
        Object.entries(updatedProperties).forEach(([key, val]) => {
            // @ts-ignore
            player[key] = val;
        });
    });
};

export const assignRolesLoki = (room: AvalonLokiRoom) => {
    const { players } = room;

    const playerCount = players.length;
    const firstLeaderOrderNumber = Math.floor(Math.random() * playerCount);
    console.log(firstLeaderOrderNumber, 'first');

    const rolesForPlayers = createRoleDistributionArray(playerCount, room.extraRoles);

    players.forEach((player, i, arr) => {
        player.roleName = rolesForPlayers[i].roleName;
        player.roleKey = rolesForPlayers[i].key;
        player.side = rolesForPlayers[i].side;
        if (i === firstLeaderOrderNumber) {
            console.log('set LEADER');

            player.isCurrentLeader = true;
            room.currentLeaderId = player.socketId;
        } else {
            player.isCurrentLeader = false;
        }
        player.order = i;
        player.roleDescription = rolesForPlayers[i].ability;
        player.secretInformation = createMessageByRole(player, arr);
    });
};

export const startNewVoteCycleLoki = (room: AvalonLokiRoom) => {
    updateAllPlayersLoki(room, { globalVote: null, questVote: null, nominated: false });
};

export const nominatePlayerLoki = (room: AvalonLokiRoom, playerId: string) => {
    const { players } = room;

    const selectedPlayer = players.find((p) => p.socketId === playerId);
    const nominatedCount = players.filter((p) => p.nominated).length;

    if (selectedPlayer) {
        if (selectedPlayer.nominated) {
            selectedPlayer.nominated = false;
        } else {
            const activeQuest = room.quests.find((q) => q.active);
            if (activeQuest?.questPartySize! > nominatedCount) {
                selectedPlayer.nominated = true;
            }
        }
    }
};

export const handleGlobalVoteLoki = (room: AvalonLokiRoom) => {
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
            switchToNextLeaderLoki(room);
            // room.questVoteInProgress = false;
            room.nominationInProgress = true;
            room.missedTeamVotes = room?.missedTeamVotes! + 1;

            room.gameMessage = 'The vote has failed!\n Now new leader must nominate a new party';
            updateAllPlayersLoki(room, { nominated: false });
        }
        if (room.missedTeamVotes === 5) {
            room.gameInProgress = false;
            room.gameMessage = 'The EVIL has won!\n The party was not formed 5 times in a row.';
            room.revealRoles = true;
        }
    }
};

export const handleQuestVoteLoki = (room: AvalonLokiRoom) => {
    const { players } = room;

    const nominatedPlayers = players.filter((player) => player.nominated);
    const nominatedPlayersCount = nominatedPlayers.length;
    const votedPlayers = players.filter((player) => !!player.questVote);

    const nextQuestNumber = room?.currentQuest! + 1;
    if (votedPlayers.length === nominatedPlayersCount) {
        const votedAgainst = players.filter((player) => player.questVote === 'no');
        switchToNextLeaderLoki(room);

        room.questVoteInProgress = false;
        room.nominationInProgress = true;
        room.revealVotes = false;

        // room.currentQuestResults = votedPlayers.map((player) => !!player.questVote);
        const requiredVotesToFail = room.currentQuest === 4 && players.length > 6 ? 2 : 1;

        const activeQuest = getActiveQuestLoki(room);
        if (activeQuest) {
            activeQuest.questResult = votedAgainst.length >= requiredVotesToFail ? 'fail' : 'success';
        }

        room.gameMessage = `${
            votedPlayers.length - votedAgainst.length
        } player(s) voted in favor of the quest.\nNow new leader must nominate a new party.\n${
            nextQuestNumber === 4 && players.length > 6 ? 'Note: This quest requires 2 votes to fail.' : ''
        }`;
        // room.currentQuest = nextQuestNumber;
        startNewVoteCycleLoki(room);

        const endGame = room.quests.reduce(
            (acc, q) => {
                if (q.questResult) {
                    acc[q.questResult] += 1;
                }
                return acc;
            },
            {
                success: 0,
                fail: 0,
            },
        );

        if (endGame.success === 3) {
            room.gameMessage =
                'Good has won. But evil still has a chance. Assassin must kill Merlin to snatch a victory.';
            room.assassinationInProgress = true;
            room.questVoteInProgress = false;
            room.nominationInProgress = false;
            room.currentLeaderId = null;
        } else if (endGame.fail === 3) {
            room.revealRoles = true;
            room.gameInProgress = false;
            room.gameMessage = 'Evil has won!';
        } else {
            changeActiveQuestLoki(room, nextQuestNumber);
        }
    }
};

export const switchToNextLeaderLoki = (room: AvalonLokiRoom) => {
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
            room.currentLeaderId = newLeader.socketId;
        }
    }
};

export const changeActiveQuestLoki = (room: AvalonLokiRoom, nextActiveQuestNumber: number) => {
    if (nextActiveQuestNumber > 5 || nextActiveQuestNumber < 1) {
        return;
    }

    const currentActiveQuest = getActiveQuestLoki(room);
    const nextActiveQuest = room.quests.find((q) => q.questNumber === nextActiveQuestNumber);

    if (currentActiveQuest && currentActiveQuest.questNumber !== nextActiveQuestNumber) {
        currentActiveQuest.active = false;
    }

    if (nextActiveQuest) {
        room.currentQuest = nextActiveQuest.questNumber;
        nextActiveQuest.active = true;
    }
};

export const getActiveQuestLoki = (room: AvalonLokiRoom) => {
    return room.quests.find((q) => q.active);
};

export const countPlayersLoki = (room: AvalonLokiRoom, condition?: Record<string, any>) => {};

export const clearVotesLoki = (room: AvalonLokiRoom) => {
    room.players.forEach((p) => {
        p.globalVote = null;
        p.questVote = null;
    });
};

export const assassinateLoki = (room: AvalonLokiRoom, targetId: string, socketId: string) => {
    const { players } = room;
    const assassin = players.find((p) => p.roleKey === ROLE_LIST.ASSASSIN);
    const target = players.find((p) => p.socketId === targetId);

    if (assassin?.socketId === socketId) {
        const merlinKilled = target?.roleKey === ROLE_LIST.MERLIN;
        room.gameMessage = merlinKilled
            ? 'Merlin was killed! Evil are now victorious'
            : 'Assassin has missed! The victory stays on the Good side';
        room.revealRoles = true;
        room.gameInProgress = false;
        room.revealVotes = false;
        return true;
    }
    return false;
};

export const toggleExtraRoleLoki = (room: AvalonLokiRoom, roleKey: ROLE_LIST) => {
    room.extraRoles = room.extraRoles.includes(roleKey)
        ? room.extraRoles.filter((role) => role !== roleKey)
        : [...room.extraRoles, roleKey];
};

export const confirmPartyLoki = (room: AvalonLokiRoom) => {
    const activeQuest = getActiveQuestLoki(room);
    const nominatedPlayerCount = room.players.filter((p) => p.nominated).length;

    if (nominatedPlayerCount === activeQuest?.questPartySize!) {
        room.nominationInProgress = false;
        room.globalVoteInProgress = true;
        room.revealVotes = false;
        room.gameMessage = 'Everyone should vote for the selected party';

        clearVotesLoki(room);
        return true;
    } else {
        return false;
    }
};

export const resetQuests = (room: AvalonLokiRoom) => {
    const { questPartySize } = DISTRIBUTION[room.players.length];
    room.quests = initialQuests;
    room.quests.forEach((quest, i) => {
        quest.questPartySize = questPartySize[i];
        if (quest.questNumber === 1) quest.active = true;
    });
    room.quests.sort((a: { questNumber: number }, b: { questNumber: number }) => a.questNumber - b.questNumber);
};

export const startGameLoki = (room: AvalonLokiRoom) => {
    startNewVoteCycleLoki(room);
    assignRolesLoki(room);

    room.gameInProgress = true;
    room.nominationInProgress = true;
    room.globalVoteInProgress = false;
    room.questVoteInProgress = false;
    room.assassinationInProgress = false;
    room.revealVotes = false;
    room.revealRoles = false;
    room.missedTeamVotes = 1;
    room.currentQuest = 1;
    // room.currentLeaderId = room.players.find((player: any) => player.isCurrentLeader)?.socketId || '';
    room.gameMessage = `Leader must nominate players for the quest.`;

    resetQuests(room);
};

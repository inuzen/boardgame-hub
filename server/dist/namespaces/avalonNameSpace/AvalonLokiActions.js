"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearVotesLoki = exports.countPlayersLoki = exports.getActiveQuestLoki = exports.changeActiveQuestLoki = exports.checkForEndGameLoki = exports.updateQuestResultLoki = exports.switchToNextLeaderLoki = exports.handleQuestVoteLoki = exports.handleGlobalVoteLoki = exports.nominatePlayerLoki = exports.initQuestsLoki = exports.startNewVoteCycleLoki = exports.assignRolesLoki = exports.updateAllPlayersLoki = exports.updatePlayerLoki = exports.getRoomByCode = exports.addRoom = void 0;
const lokiDB_1 = require("../../config/lokiDB");
const engine_1 = require("./engine");
const types_1 = require("./types");
const addRoom = (roomCode) => {
    return lokiDB_1.Avalon.insert({
        roomCode,
        players: [],
        takenImages: Object.keys(types_1.AVATARS).reduce((acc, avatar) => {
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
        quests: [1, 2, 3, 4, 5].map((questNumber) => {
            return { questNumber, questPartySize: null, questResult: null, active: false };
        }),
    });
};
exports.addRoom = addRoom;
const getRoomByCode = (roomCode) => lokiDB_1.Avalon.findOne({ roomCode });
exports.getRoomByCode = getRoomByCode;
const updatePlayerLoki = ({ room, socketId, updatedProperties, }) => {
    if (!room)
        return;
    room.players.forEach((p) => {
        if (socketId === p.socketId) {
            Object.entries(updatedProperties).forEach(([key, val]) => {
                // @ts-ignore
                p[key] = val;
            });
        }
    });
    lokiDB_1.Avalon.update(room);
};
exports.updatePlayerLoki = updatePlayerLoki;
const updateAllPlayersLoki = (lokiRoom, updatedProperties) => {
    if (!lokiRoom)
        return;
    lokiRoom.players.forEach((player) => {
        Object.entries(updatedProperties).forEach(([key, val]) => {
            // @ts-ignore
            player[key] = val;
        });
    });
    lokiDB_1.Avalon.update(lokiRoom);
};
exports.updateAllPlayersLoki = updateAllPlayersLoki;
const assignRolesLoki = (lokiRoom) => {
    if (!lokiRoom)
        return;
    const players = lokiRoom.players;
    const playerCount = players.length;
    const firstLeaderOrderNumber = Math.floor(Math.random() * playerCount);
    const rolesForPlayers = (0, engine_1.createRoleDistributionArray)(playerCount, lokiRoom.extraRoles);
    players.forEach((player, i) => {
        player.roleName = rolesForPlayers[i].roleName;
        player.roleKey = rolesForPlayers[i].key;
        player.side = rolesForPlayers[i].side;
        player.isCurrentLeader = i === firstLeaderOrderNumber;
        player.order = i;
        player.roleDescription = rolesForPlayers[i].ability;
    });
    players.forEach((player, i, arr) => {
        player.secretInformation = (0, engine_1.createMessageByRole)(player, arr);
    });
    lokiDB_1.Avalon.update(lokiRoom);
};
exports.assignRolesLoki = assignRolesLoki;
const startNewVoteCycleLoki = (room) => {
    (0, exports.updateAllPlayersLoki)(room, { globalVote: null, questVote: null, nominated: false });
};
exports.startNewVoteCycleLoki = startNewVoteCycleLoki;
const initQuestsLoki = (room) => {
    if (!room)
        return;
    const { questPartySize } = engine_1.DISTRIBUTION[room.players.length];
    room.quests.forEach((quest, i) => {
        quest.questPartySize = questPartySize[i];
        if (quest.questNumber === 1)
            quest.active = true;
    });
    lokiDB_1.Avalon.update(room);
};
exports.initQuestsLoki = initQuestsLoki;
const nominatePlayerLoki = (room, playerId) => {
    if (!room)
        return;
    const players = room.players;
    const { selectedPlayer, nominatedCount } = players.reduce((acc, currPlayer) => {
        if (currPlayer.socketId === playerId) {
            acc.selectedPlayer = currPlayer;
        }
        if (currPlayer.nominated) {
            acc.nominatedCount++;
        }
        return acc;
    }, {
        selectedPlayer: null,
        nominatedCount: 0,
    });
    if (selectedPlayer) {
        const activeQuest = room.quests.find((q) => q.active);
        if (selectedPlayer.nominated) {
            selectedPlayer.nominated = false;
        }
        if (!selectedPlayer.nominated && activeQuest?.questPartySize > nominatedCount) {
            selectedPlayer.nominated = true;
        }
    }
    lokiDB_1.Avalon.update(room);
};
exports.nominatePlayerLoki = nominatePlayerLoki;
const handleGlobalVoteLoki = (room) => {
    if (!room)
        return;
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
        }
        else {
            const newLeaderId = (0, exports.switchToNextLeaderLoki)(room);
            room.questVoteInProgress = false;
            room.nominationInProgress = true;
            room.missedTeamVotes = room?.missedTeamVotes + 1;
            room.currentLeaderId = newLeaderId;
            room.gameMessage = 'The vote has failed!\n Now new leader must nominate a new party';
            (0, exports.updateAllPlayersLoki)(room, { nominated: false });
        }
        if (room.missedTeamVotes === 5) {
            room.gameInProgress = false;
            room.gameMessage = 'The EVIL has won!\n The party was not formed 5 times in a row.';
            room.revealRoles = true;
        }
    }
    lokiDB_1.Avalon.update(room);
};
exports.handleGlobalVoteLoki = handleGlobalVoteLoki;
const handleQuestVoteLoki = (room) => {
    if (!room)
        return;
    const { players } = room;
    const nominatedPlayers = players.filter((player) => player.nominated);
    const nominatedPlayersCount = nominatedPlayers.length;
    const votedPlayers = players.filter((player) => !!player.questVote);
    const nextQuestNumber = room?.currentQuest + 1;
    if (votedPlayers.length === nominatedPlayersCount) {
        const votedAgainst = players.filter((player) => player.questVote === 'no');
        const newLeaderId = (0, exports.switchToNextLeaderLoki)(room);
        room.questVoteInProgress = false;
        room.nominationInProgress = true;
        room.revealVotes = false;
        room.currentLeaderId = newLeaderId;
        room.currentQuestResults = votedPlayers.map((player) => !!player.questVote);
        const requiredVotesToFail = room.currentQuest === 4 && players.length > 6 ? 2 : 1;
        if (votedAgainst.length >= requiredVotesToFail) {
            (0, exports.updateQuestResultLoki)(room, room?.currentQuest, 'fail');
        }
        else {
            (0, exports.updateQuestResultLoki)(room, room?.currentQuest, 'success');
        }
        room.gameMessage = `${votedPlayers.length - votedAgainst.length} player(s) voted in favor of the quest.\nNow new leader must nominate a new party.\n${nextQuestNumber === 4 && players.length > 6 ? 'Note: This quest requires 2 votes to fail.' : ''}`;
        room.currentQuest = nextQuestNumber;
        (0, exports.startNewVoteCycleLoki)(room);
        const gameEnd = (0, exports.checkForEndGameLoki)(room);
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
            }
            else {
                room.revealRoles = true;
                room.gameInProgress = false;
                room.gameMessage = 'Evil has won!';
            }
        }
        else {
            (0, exports.changeActiveQuestLoki)(room, nextQuestNumber);
        }
    }
    // TODO: Maybe make check for room and force update into a HOC
    lokiDB_1.Avalon.update(room);
};
exports.handleQuestVoteLoki = handleQuestVoteLoki;
const switchToNextLeaderLoki = (room) => {
    if (!room)
        return '';
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
    lokiDB_1.Avalon.update(room);
    return '';
};
exports.switchToNextLeaderLoki = switchToNextLeaderLoki;
const updateQuestResultLoki = (room, questNumber, questResult) => {
    if (!room)
        return;
    const quest = room.quests.find((q) => q.questNumber === questNumber);
    if (quest) {
        quest.questResult = questResult;
    }
    lokiDB_1.Avalon.update(room);
};
exports.updateQuestResultLoki = updateQuestResultLoki;
const checkForEndGameLoki = (room) => {
    const wonQuests = room?.quests.filter((quest) => quest.questResult === 'success');
    const failedQuests = room?.quests.filter((quest) => quest.questResult === 'fail');
    return {
        gameEnded: wonQuests?.length === 3 || failedQuests?.length === 3,
        goodWon: wonQuests?.length === 3,
    };
};
exports.checkForEndGameLoki = checkForEndGameLoki;
const changeActiveQuestLoki = (room, nextActiveQuestNumber) => {
    if (!room)
        return;
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
    lokiDB_1.Avalon.update(room);
};
exports.changeActiveQuestLoki = changeActiveQuestLoki;
const getActiveQuestLoki = (room) => {
    if (!room)
        return null;
    return room.quests.find((q) => q.active);
};
exports.getActiveQuestLoki = getActiveQuestLoki;
const countPlayersLoki = (room, condition) => { };
exports.countPlayersLoki = countPlayersLoki;
const clearVotesLoki = (room) => {
    if (!room)
        return;
    room.players.forEach((p) => {
        p.globalVote = null;
        p.questVote = null;
    });
    lokiDB_1.Avalon.update(room);
};
exports.clearVotesLoki = clearVotesLoki;

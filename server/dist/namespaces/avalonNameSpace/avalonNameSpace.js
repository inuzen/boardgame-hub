"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAvalonNameSpace = void 0;
const types_1 = require("./types");
const AvalonDbActions_1 = require("./AvalonDbActions");
const utils_1 = require("../../utils/utils");
const AvalonLokiActions_1 = require("./AvalonLokiActions");
const uuid_1 = require("uuid");
const lokiDB_1 = require("../../config/lokiDB");
class AvalonConnection {
    socket;
    ns;
    roomCode;
    constructor(ns, socket) {
        this.socket = socket;
        this.ns = ns;
        this.roomCode = '';
        socket.on('disconnect', () => this.disconnect());
        socket.on('disconnecting', () => this.disconnecting());
        socket.on('start game', async () => this.startGameLoki());
        socket.on('nominate player', async (playerId) => await this.nominatePlayer(playerId));
        socket.on('global vote', async (vote) => await this.vote(vote, true));
        socket.on('quest vote', async (vote) => await this.vote(vote));
        socket.on('confirm party', async () => await this.confirmParty());
        socket.on('start new vote', async () => await this.startNewVote());
        socket.on('assassinate', async (targetId) => await this.assassinate(targetId));
        socket.on('toggle extra role', async (roleKey) => await this.toggleExtraRole(roleKey));
        // socket.on(
        //     'get existing player',
        //     async (params: { playerUUID: string; roomCode: string; nickname: string }) =>
        //         await this.getExistingPlayer(params),
        // );
        socket.on('change player name', async (newName) => await this.changePlayerName(newName));
        socket.on('init room', async (params) => this.initRoom(params));
        socket.on('join room', async ({ roomCode, nickname }) => this.addPlayerLoki({ roomCode, nickname }));
    }
    initRoom(params) {
        try {
            const { roomCode, nickname } = params;
            console.log(roomCode, nickname);
            // const [_, created] = await createRoom(roomCode, this.socket.id);
            (0, AvalonLokiActions_1.addRoom)(roomCode);
            console.log('added room');
            this.socket.join(roomCode);
            this.roomCode = roomCode;
            // await this.addPlayerToRoom({ nickname, isHost: created, roomCode });
            this.addPlayerLoki({ nickname, roomCode, isHost: true });
        }
        catch (error) {
            console.log(error);
        }
    }
    addPlayerLoki({ nickname, roomCode, isHost = false }) {
        this.roomCode = roomCode;
        this.socket.join(roomCode);
        const room = (0, AvalonLokiActions_1.getRoomByCode)(roomCode);
        console.log('ROOM', room);
        if (room) {
            //@ts-ignore
            const playerCount = room.players.length;
            const avatars = Object.values(room.takenImages);
            const availableAvatars = avatars.filter((avatar) => !avatar.taken);
            const suggestedAvatar = !!availableAvatars.length
                ? (0, utils_1.shuffle)(availableAvatars)[0]
                : avatars[Math.floor(Math.random() * avatars.length)];
            room.takenImages[suggestedAvatar.key].taken = true;
            const playerUUID = (0, uuid_1.v4)();
            room.players.push({
                playerUUID,
                roomCode,
                socketId: this.socket.id,
                name: nickname,
                isHost,
                order: playerCount + 1,
                connected: true,
                imageName: suggestedAvatar.key,
            });
            lokiDB_1.Avalon.update(room);
            this.ns.to(this.socket.id).emit('register', playerUUID);
            //@ts-ignore
            this.ns.to(roomCode).emit('players', room.players);
        }
    }
    async addPlayerToRoom({ nickname, roomCode, isHost = false, }) {
        this.roomCode = roomCode;
        this.socket.join(roomCode);
        const playerCount = await (0, AvalonDbActions_1.countPlayers)(roomCode);
        const room = await (0, AvalonDbActions_1.getRoom)(roomCode);
        if (room) {
            const avatars = Object.values(room.takenImages);
            const availableAvatars = avatars.filter((avatar) => !avatar.taken);
            const suggestedAvatar = !!availableAvatars.length
                ? (0, utils_1.shuffle)(availableAvatars)[0]
                : avatars[Math.floor(Math.random() * avatars.length)];
            room.takenImages[suggestedAvatar.key].taken = true;
            room.changed('takenImages', true);
            await room.save();
            const newPlayer = await (0, AvalonDbActions_1.createPlayer)({
                roomCode,
                socketId: this.socket.id,
                name: nickname,
                isHost,
                roleName: '',
                roleKey: null,
                order: playerCount + 1,
                questVote: null,
                globalVote: null,
                connected: true,
                imageName: suggestedAvatar.key,
            });
            this.ns.to(this.socket.id).emit('register', newPlayer.playerUUID);
            const players = await (0, AvalonDbActions_1.getPlayerList)(roomCode);
            this.ns.to(roomCode).emit('players', players);
        }
    }
    async getExistingPlayer(params) {
        const { playerUUID, roomCode, nickname } = params;
        const room = await (0, AvalonDbActions_1.getRoom)(roomCode);
        if (!!room) {
            const playerExist = await (0, AvalonDbActions_1.findPlayer)(roomCode, { playerUUID });
            if (playerExist) {
                this.roomCode = roomCode;
                this.socket.join(roomCode);
                playerExist.connected = true;
                playerExist.socketId = this.socket.id;
                if (playerExist.isCurrentLeader) {
                    room.currentLeaderId = this.socket.id;
                    await room.save();
                }
                await playerExist.save();
                const roomInfo = await (0, AvalonDbActions_1.getRoomWithPlayers)(roomCode);
                this.ns.to(roomCode).emit('update room', roomInfo);
                this.ns.to(this.socket.id).emit('assigned role', {
                    roleName: playerExist.roleName,
                    roleKey: playerExist.roleKey,
                    side: playerExist.side,
                    secretInfo: playerExist.secretInformation,
                    description: playerExist.roleDescription,
                });
            }
            else {
                await this.addPlayerToRoom({ nickname, roomCode });
            }
        }
        else {
            await this.initRoom({ roomCode, nickname });
        }
    }
    async disconnect() {
        await (0, AvalonDbActions_1.deleteRoomIfNoPlayers)(this.roomCode);
    }
    async disconnecting() {
        const { id } = this.socket;
        await (0, AvalonDbActions_1.updatePlayer)({ socketId: id, updatedProperties: { connected: false } });
        const roomInfo = await (0, AvalonDbActions_1.getRoomWithPlayers)(this.roomCode);
        this.ns.to(this.roomCode).emit('update room', roomInfo);
    }
    async initAndSendQuests(playerCount) {
        await (0, AvalonDbActions_1.initQuests)(this.roomCode, playerCount);
        const quests = await (0, AvalonDbActions_1.getQuests)(this.roomCode);
        this.ns.to(this.roomCode).emit('quests', quests.sort((a, b) => a.questNumber - b.questNumber));
    }
    initAndSendQuestsLoki() {
        if (this.room) {
            (0, AvalonLokiActions_1.initQuestsLoki)(this.room);
            this.ns.to(this.roomCode).emit('quests', this.room.quests.sort((a, b) => a.questNumber - b.questNumber));
        }
    }
    async startGame() {
        await (0, AvalonDbActions_1.startNewVoteCycle)(this.roomCode);
        await (0, AvalonDbActions_1.assignRoles)(this.roomCode);
        const players = await (0, AvalonDbActions_1.getPlayerList)(this.roomCode);
        const roomInfo = await (0, AvalonDbActions_1.getRoomWithPlayers)(this.roomCode);
        if (roomInfo) {
            roomInfo.gameInProgress = true;
            roomInfo.nominationInProgress = true;
            roomInfo.globalVoteInProgress = false;
            roomInfo.questVoteInProgress = false;
            roomInfo.assassinationInProgress = false;
            roomInfo.revealVotes = false;
            roomInfo.revealRoles = false;
            roomInfo.missedTeamVotes = 1;
            roomInfo.currentQuest = 1;
            roomInfo.currentLeaderId = players.find((player) => player.isCurrentLeader)?.socketId || '';
            roomInfo.gameMessage = `Leader must nominate players for the quest.`;
            await roomInfo.save();
            // TODO check that at least 5 players joined
            this.ns.to(this.roomCode).emit('update room', roomInfo);
            players.forEach((player) => {
                this.ns.to(player.socketId).emit('assigned role', {
                    roleName: player.roleName,
                    roleKey: player.roleKey,
                    side: player.side,
                    secretInfo: player.secretInformation,
                    description: player.roleDescription,
                });
            });
            this.initAndSendQuests(players.length);
            this.ns.to(this.roomCode).emit('player killed', null);
        }
    }
    startGameLoki() {
        console.log('START GAME');
        // TODO change to getter?
        const room = this.room;
        (0, AvalonLokiActions_1.startNewVoteCycleLoki)(room);
        console.log('Assign roles');
        (0, AvalonLokiActions_1.assignRolesLoki)(room);
        // TODO: exclude secret info from room for this
        if (room) {
            const players = room.players;
            room.gameInProgress = true;
            room.nominationInProgress = true;
            room.globalVoteInProgress = false;
            room.questVoteInProgress = false;
            room.assassinationInProgress = false;
            room.revealVotes = false;
            room.revealRoles = false;
            room.missedTeamVotes = 1;
            room.currentQuest = 1;
            room.currentLeaderId = players.find((player) => player.isCurrentLeader)?.socketId || '';
            room.gameMessage = `Leader must nominate players for the quest.`;
            lokiDB_1.Avalon.update(room);
            // TODO check that at least 5 players joined
            this.ns.to(this.roomCode).emit('update room', room);
            players.forEach((player) => {
                this.ns.to(player.socketId).emit('assigned role', {
                    roleName: player.roleName,
                    roleKey: player.roleKey,
                    side: player.side,
                    secretInfo: player.secretInformation,
                    description: player.roleDescription,
                });
            });
            this.initAndSendQuestsLoki();
            this.ns.to(this.roomCode).emit('player killed', null);
        }
    }
    async nominatePlayer(playerId) {
        await (0, AvalonDbActions_1.nominatePlayer)(this.roomCode, playerId);
        const playerList = await (0, AvalonDbActions_1.getPlayerList)(this.roomCode);
        this.ns.to(this.roomCode).emit('players', playerList);
    }
    // TODO Optimize this and maybe split global and quest votes
    async vote(vote, isGlobal = false) {
        const voterId = this.socket.id;
        this.ns.to(this.roomCode).emit('player voted', voterId);
        if (isGlobal) {
            await (0, AvalonDbActions_1.updatePlayer)({ socketId: voterId, updatedProperties: { globalVote: vote } });
            await (0, AvalonDbActions_1.handleGlobalVote)(this.roomCode);
        }
        else {
            await (0, AvalonDbActions_1.updatePlayer)({ socketId: voterId, updatedProperties: { questVote: vote } });
            await (0, AvalonDbActions_1.handleQuestVote)(this.roomCode);
        }
        const roomInfo = await (0, AvalonDbActions_1.getRoomWithPlayers)(this.roomCode);
        if (roomInfo?.gameInProgress === false) {
            this.ns.to(this.roomCode).emit('update room', await (0, AvalonDbActions_1.getCompleteRoom)(this.roomCode));
        }
        else {
            this.ns.to(this.roomCode).emit('update room', roomInfo);
        }
    }
    async confirmParty() {
        const activeQuest = await (0, AvalonDbActions_1.getActiveQuest)(this.roomCode);
        const nominatedPlayerCount = await (0, AvalonDbActions_1.countPlayers)(this.roomCode, { nominated: true });
        if (nominatedPlayerCount === activeQuest?.questPartySize) {
            const roomInfo = await (0, AvalonDbActions_1.getRoomWithPlayers)(this.roomCode);
            if (roomInfo) {
                roomInfo.nominationInProgress = false;
                roomInfo.globalVoteInProgress = true;
                roomInfo.revealVotes = false;
                roomInfo.gameMessage = 'Everyone should vote for the selected party';
                await roomInfo.save();
            }
            await (0, AvalonDbActions_1.clearVotes)(this.roomCode);
            this.ns.to(this.roomCode).emit('update room', roomInfo);
        }
        else {
            this.ns.to(this.roomCode).emit('not enough players');
        }
    }
    async assassinate(targetId) {
        const assassin = await (0, AvalonDbActions_1.findPlayer)(this.roomCode, { roleKey: types_1.ROLE_LIST.ASSASSIN });
        const target = await (0, AvalonDbActions_1.findPlayer)(this.roomCode, { socketId: targetId });
        const room = await (0, AvalonDbActions_1.getCompleteRoom)(this.roomCode);
        if (room) {
            if (assassin?.socketId === this.socket.id) {
                this.ns.to(this.roomCode).emit('player killed', targetId);
                const merlinKilled = target?.roleKey === types_1.ROLE_LIST.MERLIN;
                room.gameMessage = merlinKilled
                    ? 'Merlin was killed! Evil are now victorious'
                    : 'Assassin has missed! The victory stays on the Good side';
                room.revealRoles = true;
            }
            room.gameInProgress = false;
            room.revealVotes = false;
            await room.save();
            this.ns.to(this.roomCode).emit('update room', room);
        }
    }
    async toggleExtraRole(roleKey) {
        const room = await (0, AvalonDbActions_1.getRoom)(this.roomCode);
        if (room && room.extraRoles) {
            room.extraRoles = room.extraRoles.includes(roleKey)
                ? room.extraRoles.filter((role) => role !== roleKey)
                : [...room.extraRoles, roleKey];
            await room.save();
            this.ns.to(this.roomCode).emit('update room', room);
        }
    }
    async startNewVote() {
        await (0, AvalonDbActions_1.startNewVoteCycle)(this.roomCode);
    }
    async changePlayerName(newName) {
        const player = await (0, AvalonDbActions_1.findPlayer)(this.roomCode, { socketId: this.socket.id });
        if (player) {
            player.name = newName;
            await player.save();
            this.ns.to(this.roomCode).emit('update room', await (0, AvalonDbActions_1.getRoomWithPlayers)(this.roomCode));
        }
    }
    get room() {
        return (this.roomCode ? (0, AvalonLokiActions_1.getRoomByCode)(this.roomCode) || {} : {});
    }
}
const initAvalonNameSpace = (io) => {
    const avalonNameSpace = io.of('/avalon');
    avalonNameSpace.on('connection', (socket) => {
        new AvalonConnection(avalonNameSpace, socket);
    });
};
exports.initAvalonNameSpace = initAvalonNameSpace;

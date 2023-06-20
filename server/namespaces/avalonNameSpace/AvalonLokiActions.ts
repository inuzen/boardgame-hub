import { db, Avalon } from '../../config/lokiDB';
import { AvalonPlayerModel, AvalonPlayerType } from '../../models/Avalon/AvalonPlayer';
import { createMessageByRole, createRoleDistributionArray } from './engine';
import { AVATARS } from './types';

export const addRoom = (roomCode: string) => {
    return Avalon.insert({
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
    });
};

export const getRoomByCode = (roomCode: string) => Avalon.findOne({ roomCode });

export const updateAllPlayersLoki = (lokiRoom: any, updatedProperties: Partial<AvalonPlayerType>) => {
    lokiRoom.players.forEach((player: AvalonPlayerType) => {
        player = { ...player, ...updatedProperties };
    });
    Avalon.update(lokiRoom);
};

export const assignRolesLoki = (lokiRoom: any) => {
    const players: AvalonPlayerModel[] = lokiRoom.players;

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

export const startNewVoteCycleLoki = (room: any) => {
    updateAllPlayersLoki(room, { globalVote: null, questVote: null, nominated: false });
};

export interface AvalonPlayerServer {
    playerUUID: string;
    socketId: string;
    roomCode: string;
    name: string;
    roleKey: ROLE_LIST;
    roleName: string;
    roleDescription: string;
    side: string;
    isHost: boolean;
    isCurrentLeader: boolean;
    order: number;
    nominated: boolean;
    globalVote: 'yes' | 'no' | null;
    secretInformation: string;
    imageName: string;
}

export interface AvalonQuestServer {
    questNumber: number;
    questResult: string;
    active: boolean;
    questPartySize: number;
}

export interface AvalonRoomServer {
    roomCode: string;
    players: AvalonPlayerServer[];
    quests: AvalonQuestServer[];
    currentQuest: number;
    missedTeamVotes: number;
    currentLeaderId: string;
    nominationInProgress: boolean;
    globalVoteInProgress: boolean;
    questVoteInProgress: boolean;
    gameInProgress: boolean;
    revealVotes: boolean;
    currentQuestResults: string[];
    gameMessage: string;
    assassinationInProgress: boolean;
    revealRoles: boolean;
    extraRoles: ROLE_LIST[];
    takenImages: Record<string, { key: string; taken: boolean }>;
    hostSocketId: string;
    leaderCanSelectQuest: boolean;
}

export enum ROLE_LIST {
    MINION = 'MINION',
    SERVANT = 'SERVANT',
    ASSASSIN = 'ASSASSIN',
    MERLIN = 'MERLIN',
    PERCIVAL = 'PERCIVAL',
    MORDRED = 'MORDRED',
    OBERON = 'OBERON',
    MORGANA = 'MORGANA',
}

export const DEFAULT_ROLES = [ROLE_LIST.MERLIN, ROLE_LIST.ASSASSIN, ROLE_LIST.MINION, ROLE_LIST.SERVANT];

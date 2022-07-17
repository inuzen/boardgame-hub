export interface AvalonPlayerServer {
    socketId: string;
    roomCode: string;
    name: string;
    roleKey: ROLE_LIST;
    roleName: string;
    side: string;
    isHost: boolean;
    isCurrentLeader: boolean;
    order: number;
    nominated: boolean;
    globalVote: 'yes' | 'no' | null;
    secretInformation: string;
}

export interface AvalonQuestServer {
    roomCode: string;
    questNumber: number;
    questResult: string;
    active: boolean;
    questPartySize: number;
}

export interface AvalonRoomServer {
    roomCode: string;
    AvalonGameId: string | null;
    AvalonPlayers: AvalonPlayerServer[];
    AvalonQuests: AvalonQuestServer[];
    currentQuest: number;
    votingArray: string[] | null;
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

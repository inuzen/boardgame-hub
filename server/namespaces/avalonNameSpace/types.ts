export enum SIDES {
    GOOD = 'GOOD',
    EVIL = 'EVIL',
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

export interface Role {
    key: ROLE_LIST;
    roleName: string;
    ability: string;
    side: SIDES;
}

export const ROLES: Record<ROLE_LIST, Role> = {
    [ROLE_LIST.MINION]: {
        roleName: 'Minion of Evil',
        side: SIDES.EVIL,
        ability: 'No special abilities',
        key: ROLE_LIST.MINION,
    },
    [ROLE_LIST.SERVANT]: {
        roleName: 'Loyal Servant of Arthur',
        side: SIDES.GOOD,
        ability: 'No special abilities',
        key: ROLE_LIST.SERVANT,
    },
    [ROLE_LIST.ASSASSIN]: {
        roleName: 'Assassin',
        side: SIDES.EVIL,
        ability: 'Evil wins if you kill Merlin at the end of the game',
        key: ROLE_LIST.ASSASSIN,
    },
    [ROLE_LIST.MERLIN]: {
        roleName: 'Merlin',
        side: SIDES.GOOD,
        ability: 'You know the evil players, but you must remain hidden',
        key: ROLE_LIST.MERLIN,
    },
    [ROLE_LIST.PERCIVAL]: {
        roleName: 'Percival',
        side: SIDES.GOOD,
        ability: 'You know identity of Merlin',
        key: ROLE_LIST.PERCIVAL,
    },
    [ROLE_LIST.MORDRED]: {
        roleName: 'Mordred',
        side: SIDES.EVIL,
        ability: `Merlin doesn't know about you`,
        key: ROLE_LIST.MORDRED,
    },
    [ROLE_LIST.OBERON]: {
        roleName: 'Oberon',
        side: SIDES.EVIL,
        ability: 'Your side is unknown to both teams',
        key: ROLE_LIST.OBERON,
    },
    [ROLE_LIST.MORGANA]: {
        roleName: 'Morgana',
        side: SIDES.EVIL,
        ability: 'You appear as Merlin to Percival',
        key: ROLE_LIST.MORGANA,
    },
};

export enum AVATARS {
    BARBARIAN = 'barbarian',
    BOW = 'bow',
    CROSSBOW = 'crossbow',
    DRAGON = 'dragon',
    DRUID = 'druid',
    KNIGHT = 'knight',
    MAGICIAN = 'magician',
    MARTIAL = 'martial',
    PRIEST = 'priest',
    SWORDSMAN = 'swordsman',
}

export type AvalonPlayer = {
    connected: boolean;
    globalVote: 'yes' | 'no' | null;
    imageName: string;
    isCurrentLeader: boolean;
    isHost: boolean;
    name: string;
    nominated: boolean;
    order: number;
    playerUUID: string;
    questVote: 'yes' | 'no' | null;
    roleDescription: string;
    roleKey: ROLE_LIST;
    roleName: string;
    roomCode: string;
    secretInformation: string;
    side: string;
    socketId: string;
};

export type AvalonQuest = {
    questNumber: number;
    questResult: 'success' | 'fail' | null;
    active: boolean;
    questPartySize: number | null;
};

export type AvalonRoom = {
    assassinationInProgress: boolean;
    currentLeaderId: string | null;
    currentQuest: number | null;
    currentQuestResults: boolean[] | null;
    extraRoles: ROLE_LIST[];
    gameInProgress: boolean;
    gameMessage: string;
    globalVoteInProgress: boolean;
    hostSocketId: string;
    leaderCanSelectQuest: boolean;
    missedTeamVotes: number | null;
    nominationInProgress: boolean;
    players: AvalonPlayer[];
    quests: AvalonQuest[];
    questVoteInProgress: boolean;
    revealRoles: boolean;
    revealVotes: boolean;
    roomCode: string;
    takenImages: Record<string, { key: string; taken: boolean }>;
    viewers: any[];
};

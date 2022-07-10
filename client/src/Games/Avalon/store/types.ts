export interface AvalonPlayerServer {
    socketId: string;
    roomCode: string;
    name: string;
    role: ROLE_LIST;
    side: string;
    isHost: boolean;
    isCurrentLeader: boolean;
    order: number;
    nominated: boolean;
    globalVote: 'yes' | 'no' | null;
    secretInformation: string;
}

export interface AvalonRoomServer {
    roomCode: string;
    AvalonGameId: string | null;
    AvalonPlayers: AvalonPlayerServer[];
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

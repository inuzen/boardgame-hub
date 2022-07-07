export interface AvalonPlayerServer {
    socketId: string;
    roomCode: string;
    name: string;
    role: string;
    side: string;
    isHost: boolean;
    isCurrentLeader: boolean;
    order: number;
    nominated: boolean;
    globalVote: 'yes' | 'no' | null;
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
}

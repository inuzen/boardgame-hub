export interface AvalonPlayerServer {
    socketId: string;
    roomCode: string;
    name: string;
    role: string;
    isHost: boolean;
    isCurrentLeader: boolean;
    order: number;
    nominated: boolean;
}

export interface AvalonRoomServer {
    roomCode: string;
    AvalonGameId: string | null;
    AvalonPlayers: AvalonPlayerServer[];
    currentRound: number;
    votingArray: string[] | null;
    missedTeamVotes: number;
    currentLeaderId: string;
    nominationInProgress: boolean;
    votingInProgress: boolean;
}

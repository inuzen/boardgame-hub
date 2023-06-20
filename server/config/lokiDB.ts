import loki from 'lokijs';

const db = new loki('BoardgameHub');

const Avalon = db.addCollection('rooms', {
    indices: [
        'roomCode',
        'players',
        'takenImages',
        'currentQuest',
        'hostSocketId',
        'currentLeaderId',
        'extraRoles',
        'missedTeamVotes',
        'currentQuestResults',
        'leaderCanSelectQuest',
        'gameInProgress',
        'nominationInProgress',
        'globalVoteInProgress',
        'questVoteInProgress',
        'assassinationInProgress',
        'gameMessage',
        'revealVotes',
        'revealRoles',
    ],
    unique: ['roomCode'],
    autoupdate: true,
    disableMeta: true,
    clone: true,
    // schema: {
    //     type: 'object',
    //     properties: {
    //         roomCode: { type: 'string', primary: true },
    //         players: {
    //             type: 'array',
    //             items: {
    //                 type: 'object',
    //                 properties: {
    //                     playerUUID: { type: 'string' },
    //                     order: { type: 'number' },
    //                     roomCode: { type: 'string' },
    //                     name: { type: 'string' },
    //                     socketId: { type: 'string' },
    //                     roleName: { type: 'string' },
    //                     roleDescription: { type: 'string' },
    //                     roleKey: { type: 'string' },
    //                     isCurrentLeader: { type: 'boolean' },
    //                     isHost: { type: 'boolean' },
    //                     globalVote: { type: 'string' },
    //                     questVote: { type: 'string' },
    //                     nominated: { type: 'boolean' },
    //                     side: { type: 'string' },
    //                     secretInformation: { type: 'string' },
    //                     connected: { type: 'boolean' },
    //                     imageName: { type: 'string' },
    //                 },
    //             },
    //         },
    //         currentQuest: { type: 'number' },
    //         hostSocketId: { type: 'string' },
    //         currentLeaderId: { type: 'string' },
    //         extraRoles: { type: 'array', items: { type: 'string' } },
    //         missedTeamVotes: { type: 'number' },
    //         currentQuestResults: { type: 'array', items: { type: 'boolean' } },
    //         leaderCanSelectQuest: { type: 'boolean' },
    //         gameInProgress: { type: 'boolean' },
    //         nominationInProgress: { type: 'boolean' },
    //         globalVoteInProgress: { type: 'boolean' },
    //         questVoteInProgress: { type: 'boolean' },
    //         assassinationInProgress: { type: 'boolean' },
    //         gameMessage: { type: 'string' },
    //         revealVotes: { type: 'boolean' },
    //         revealRoles: { type: 'boolean' },
    //         takenImages: { type: 'object' },
    //     },
    // },
});

const initLoki = () => {
    console.log('loki init');
};

export { db, Avalon, initLoki };

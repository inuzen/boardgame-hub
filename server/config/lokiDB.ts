import loki from 'lokijs';
import { AvalonRoom } from '../namespaces/avalonNameSpace/types';

const db = new loki('BoardgameHub');

const Avalon = db.addCollection<AvalonRoom>('rooms', {
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
        'quests',
    ],
    unique: ['roomCode'],
    autoupdate: true,
    disableMeta: true,
    clone: true,
});
Avalon.setChangesApi(true);

const initLoki = () => {
    console.log('loki init');
};

export { db, Avalon, initLoki };

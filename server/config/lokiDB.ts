import loki from 'lokijs';
import { AvalonRoom } from '../namespaces/avalonNameSpace/types';
import { AvalonLokiRoom } from '../namespaces/avalonNameSpace/AvalonLokiActions';
import { compareObjectsAndLog } from '../utils/utils';

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

// const useLokiHOC = (room) => {
//     let prevLog = {};
//     return (fun: (room: AvalonLokiRoom, ...restArgs: any[]) => any, ...restArgs: any[]) => {
//         if (room) {
//             const retVal = fun(room, ...restArgs);
//             Avalon.update(room);
//             const changesArr = JSON.parse(db.serializeChanges(['rooms'])) || [];
//             const last = changesArr[changesArr.length - 1];
//             compareObjectsAndLog(prevLog, last);
//             prevLog = last;
//             return retVal;
//         }
//     };
// };

const initLoki = () => {
    console.log('loki init');
};

export { db, Avalon, initLoki };

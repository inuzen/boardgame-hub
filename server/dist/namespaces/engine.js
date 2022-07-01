"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentQuestPartySize = exports.createRoleDistributionArray = exports.getQuestsForPlayerCount = exports.DISTRIBUTION = void 0;
const utils_1 = require("../utils/utils");
const types_1 = require("./types");
// in a format of "player_count": {questPartySize: [2, 3, ...], good: 1, evil: 1}
exports.DISTRIBUTION = {
    2: {
        questPartySize: [1, 1, 1, 2, 1],
        good: 1,
        evil: 1,
    },
    3: {
        questPartySize: [1, 2, 1, 2, 1],
        good: 2,
        evil: 1,
    },
    4: {
        questPartySize: [1, 2, 3, 2, 2],
        good: 3,
        evil: 1,
    },
    5: {
        questPartySize: [2, 3, 2, 3, 3],
        good: 3,
        evil: 2,
    },
    6: {
        questPartySize: [2, 3, 4, 3, 4],
        good: 4,
        evil: 2,
    },
    7: {
        questPartySize: [2, 3, 3, 4, 4],
        good: 4,
        evil: 3,
    },
    8: {
        questPartySize: [3, 4, 4, 5, 5],
        good: 5,
        evil: 3,
    },
    9: {
        questPartySize: [3, 4, 4, 5, 5],
        good: 6,
        evil: 3,
    },
    10: {
        questPartySize: [3, 4, 4, 5, 5],
        good: 6,
        evil: 4,
    },
};
const getQuestsForPlayerCount = (playerCount) => exports.DISTRIBUTION[playerCount].questPartySize.map((questPartySize, i) => {
    return {
        partySize: questPartySize,
        result: i > 0 && Math.random() < 0.5 ? 'success' : 'fail',
    };
});
exports.getQuestsForPlayerCount = getQuestsForPlayerCount;
const createRoleDistributionArray = (playerCount, extraRolesList = []) => {
    const defaultRoles = [types_1.ROLES.MERLIN, types_1.ROLES.ASSASSIN];
    const extraRoles = extraRolesList.map((el) => types_1.ROLES[el]);
    const roles = defaultRoles.concat(extraRoles);
    const { good, evil } = exports.DISTRIBUTION[playerCount];
    const extraGoodRoles = roles.filter((role) => role.side === types_1.SIDES.GOOD);
    const extraEvilRoles = roles.filter((role) => role.side === types_1.SIDES.EVIL);
    const goodRoles = Array(good).fill(types_1.ROLES.SERVANT);
    const evilRoles = Array(evil).fill(types_1.ROLES.MINION);
    goodRoles.splice(0, extraGoodRoles.length, ...extraGoodRoles);
    evilRoles.splice(0, extraEvilRoles.length, ...extraEvilRoles);
    return (0, utils_1.shuffle)(goodRoles.concat(evilRoles));
};
exports.createRoleDistributionArray = createRoleDistributionArray;
// export const createMessageByRole = (role: ROLE_LIST, assignedRoles: GeneratedRoles): string => {
//     switch (role) {
//         case ROLE_LIST.MERLIN:
//             return `Evil players are: ${assignedRoles.evil
//                 .reduce((acc: string[], evilPlayer) => {
//                     if (evilPlayer.role?.key !== ROLE_LIST.MORDRED) {
//                         acc.push(getPlayerRef(evilPlayer));
//                     }
//                     return acc;
//                 }, [])
//                 .join(', ')}`;
//         case ROLE_LIST.PERCIVAL:
//             const merlin = assignedRoles.good.find((pl) => pl.role.key === ROLE_LIST.MERLIN)!;
//             const morgana = assignedRoles.evil.find((pl) => pl.role.key === ROLE_LIST.MORGANA)!;
//             const concealed = shuffle([merlin, morgana]);
//             return morgana
//                 ? `Merlin is either ${concealed.map(getPlayerRef).join(' or ')}`
//                 : `Merlin is ${getPlayerRef(merlin)}`;
//         default:
//             return '';
//     }
// };
const getCurrentQuestPartySize = () => { };
exports.getCurrentQuestPartySize = getCurrentQuestPartySize;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentQuestPartySize = exports.createRoleDistributionArray = exports.QUESTS = void 0;
const utils_1 = require("../utils/utils");
const types_1 = require("./types");
// TODO maybe join role and quest constants
// in a format of "player_count": [good, evil]
const ROLE_DISTRIBUTION = {
    2: [1, 1],
    3: [1, 2],
    5: [3, 2],
    6: [4, 2],
    7: [4, 3],
    8: [5, 3],
    9: [6, 3],
    10: [6, 4],
};
// playerCount: [1st quest party size, 2nd quest party size, ...]
exports.QUESTS = {
    5: [2, 3, 2, 3, 3],
    6: [2, 3, 4, 3, 4],
    7: [2, 3, 3, 4, 4],
    8: [3, 4, 4, 5, 5],
    9: [3, 4, 4, 5, 5],
    10: [3, 4, 4, 5, 5],
};
const createRoleDistributionArray = (num, extraRolesList = []) => {
    const defaultRoles = [types_1.ROLES.MERLIN, types_1.ROLES.ASSASSIN];
    const extraRoles = extraRolesList.map((el) => types_1.ROLES[el]);
    const roles = defaultRoles.concat(extraRoles);
    const [good, evil] = ROLE_DISTRIBUTION[num];
    const extraGoodRoles = roles.filter((role) => role.side === types_1.SIDES.GOOD);
    const extraEvilRoles = roles.filter((role) => role.side === types_1.SIDES.EVIL);
    const goodRoles = Array(good).fill(types_1.ROLES.SERVANT);
    const evilRoles = Array(evil).fill(types_1.ROLES.MINION);
    goodRoles.splice(0, extraGoodRoles.length, ...extraGoodRoles);
    evilRoles.splice(0, extraEvilRoles.length, ...extraEvilRoles);
    return (0, utils_1.shuffle)(goodRoles.concat(evilRoles));
};
exports.createRoleDistributionArray = createRoleDistributionArray;
// export const generateRoles = (playerArray: Player[], extraRolesList: ROLE_LIST[]) => {
//     const playerCount = playerArray.length;
//     const shuffledPlayers = shuffle(playerArray);
//     const roles = createRoleDistributionArray(playerCount, extraRolesList);
//     if (shuffledPlayers.length !== roles.length) {
//         console.error('more players then roles');
//         throw new Error();
//     }
//     // Maybe there is a better way but oh well
//     const playersWithRoles = shuffledPlayers.map((player, i) => ({ ...player, role: roles[i] }));
//     // the second shuffle is to prevent sending to players list of roles in the same order. e.g. For good side Merlin player will always be the first in the list
//     const shuffledPlayersWithRoles = shuffle(playersWithRoles).map((el, i) => ({ ...el, id: i + 1 }));
//     return {
//         allPlayers: shuffledPlayersWithRoles,
//         good: shuffledPlayersWithRoles.filter((el) => el.role.side === SIDES.GOOD),
//         evil: shuffledPlayersWithRoles.filter((el) => el.role.side === SIDES.EVIL),
//     };
// };
// type GeneratedRoles = ReturnType<typeof generateRoles>;
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

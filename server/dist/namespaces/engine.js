"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageByRole = exports.createRoleDistributionArray = exports.getQuestsForPlayerCount = exports.DISTRIBUTION = void 0;
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
        result: i > 1 && Math.random() < 0.5 ? 'success' : 'fail',
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
const createMessageByRole = (player, allPlayers) => {
    console.log('createMessageByRole', player.side);
    console.log(player.role, 'player.role');
    // TODO do something with uppercase
    switch (player.role?.toUpperCase()) {
        case types_1.ROLE_LIST.MERLIN:
            console.log('MERLIN');
            return `Evil players are: ${allPlayers
                .reduce((acc, player) => {
                if (player.side === types_1.SIDES.EVIL && player.role !== types_1.ROLE_LIST.MORDRED) {
                    acc.push(player.name);
                }
                return acc;
            }, [])
                .join(', ')}`;
        case types_1.ROLE_LIST.PERCIVAL:
            const merlin = allPlayers.find((pl) => pl.role === types_1.ROLE_LIST.MERLIN);
            const morgana = allPlayers.find((pl) => pl.role === types_1.ROLE_LIST.MORGANA);
            const concealed = (0, utils_1.shuffle)([merlin, morgana]);
            return morgana
                ? `Merlin is either ${concealed.map((pl) => pl.name).join(' or ')}`
                : `Merlin is ${merlin.name}`;
        default:
            return '';
    }
};
exports.createMessageByRole = createMessageByRole;

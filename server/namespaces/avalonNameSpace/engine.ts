import { shuffle } from '../../utils/utils';
import { ROLES, Role, SIDES, ROLE_LIST, AvalonPlayer } from './types';
interface QuestDistribution {
    questPartySize: number[];
    good: number;
    evil: number;
}
// in a format of "player_count": {questPartySize: [2, 3, ...], good: 1, evil: 1}
export const DISTRIBUTION: Record<number, QuestDistribution> = {
    2: {
        questPartySize: [2, 1, 1, 2, 1],
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

export const createRoleDistributionArray = (playerCount: number, extraRolesList: ROLE_LIST[] = []) => {
    const defaultRoles = [ROLES.MERLIN, ROLES.ASSASSIN];
    const extraRoles = extraRolesList.map((el) => ROLES[el]);
    const roles = defaultRoles.concat(extraRoles);

    const { good, evil } = DISTRIBUTION[playerCount];

    const extraGoodRoles = roles.filter((role) => role.side === SIDES.GOOD);
    const extraEvilRoles = roles.filter((role) => role.side === SIDES.EVIL);

    const goodRoles: Role[] = Array(good).fill(ROLES.SERVANT);
    const evilRoles: Role[] = Array(evil).fill(ROLES.MINION);

    goodRoles.splice(0, extraGoodRoles.length, ...extraGoodRoles);
    evilRoles.splice(0, extraEvilRoles.length, ...extraEvilRoles);

    return shuffle(goodRoles.concat(evilRoles));
};

export const createMessageByRole = (player: AvalonPlayer, allPlayers: AvalonPlayer[]): string => {
    console.log(allPlayers);

    if (player.side === SIDES.EVIL && player.roleKey !== ROLE_LIST.OBERON) {
        const otherEvilPlayers = allPlayers.filter(
            (p) => p.side === SIDES.EVIL && p.roleKey !== ROLE_LIST.OBERON && p.socketId !== player.socketId,
        );
        return otherEvilPlayers.length
            ? `Other evil players are: ${otherEvilPlayers.map((p) => p.name).join(', ')}`
            : '';
    }

    switch (player.roleKey) {
        case ROLE_LIST.MERLIN:
            return `Evil players are: ${allPlayers
                .reduce((acc: string[], player) => {
                    if (player.side === SIDES.EVIL && player.roleKey !== ROLE_LIST.MORDRED) {
                        acc.push(player.name);
                    }
                    return acc;
                }, [])
                .join(', ')}`;
        case ROLE_LIST.PERCIVAL:
            const merlin = allPlayers.find((pl) => pl.roleKey === ROLE_LIST.MERLIN)!;
            const morgana = allPlayers.find((pl) => pl.roleKey === ROLE_LIST.MORGANA)!;
            const concealed = shuffle([merlin, morgana]);

            return morgana
                ? `Merlin is either ${concealed.map((pl) => pl.name).join(' or ')}`
                : `Merlin is ${merlin.name}`;

        default:
            return '';
    }
};

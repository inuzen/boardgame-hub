export enum SIDES {
    GOOD = 'GOOD',
    EVIL = 'EVIL',
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

export const DEFAULT_ROLES = [ROLE_LIST.MERLIN, ROLE_LIST.ASSASSIN, ROLE_LIST.MINION, ROLE_LIST.SERVANT];

export interface Role {
    key: ROLE_LIST;
    roleName: string;
    ability: string;
    side: SIDES;
}

export const ROLES: Record<ROLE_LIST, Role> = {
    [ROLE_LIST.MINION]: {
        roleName: 'Minion of Evil',
        side: SIDES.EVIL,
        ability: 'No special abilities',
        key: ROLE_LIST.MINION,
    },
    [ROLE_LIST.SERVANT]: {
        roleName: 'Loyal Servant of Arthur',
        side: SIDES.GOOD,
        ability: 'No special abilities',
        key: ROLE_LIST.SERVANT,
    },
    [ROLE_LIST.ASSASSIN]: {
        roleName: 'Assassin',
        side: SIDES.EVIL,
        ability:
            'If Evil side looses then Assassin gets to kill one of the players. If he kills Merlin the Evil side wins',
        key: ROLE_LIST.ASSASSIN,
    },
    [ROLE_LIST.MERLIN]: {
        roleName: 'Merlin',
        side: SIDES.GOOD,
        ability:
            'You know the names of Evil players. Be careful on how you share this knowledge! If the forces of Good win but you are later killed by an Assassin then the Evil will triumph',
        key: ROLE_LIST.MERLIN,
    },
    [ROLE_LIST.PERCIVAL]: {
        roleName: 'Percival',
        side: SIDES.GOOD,
        ability: 'Knows who is Merlin',
        key: ROLE_LIST.PERCIVAL,
    },
    [ROLE_LIST.MORDRED]: {
        roleName: 'Mordred',
        side: SIDES.EVIL,
        ability: 'Does not reveal himself to Merlin',
        key: ROLE_LIST.MORDRED,
    },
    [ROLE_LIST.OBERON]: {
        roleName: 'Oberon',
        side: SIDES.EVIL,
        ability: 'Does not reveal himself to either side',
        key: ROLE_LIST.OBERON,
    },
    [ROLE_LIST.MORGANA]: {
        roleName: 'Morgana',
        side: SIDES.EVIL,
        ability: 'Appears as Merlin to Percival',
        key: ROLE_LIST.MORGANA,
    },
};

export enum AVATARS {
    BARBARIAN = 'barbarian',
    BOW = 'bow',
    CROSSBOW = 'crossbow',
    DRAGON = 'dragon',
    DRUID = 'druid',
    KNIGHT = 'knight',
    MAGICIAN = 'magician',
    MARTIAL = 'martial',
    PRIEST = 'priest',
    SWORDSMAN = 'swordsman',
}

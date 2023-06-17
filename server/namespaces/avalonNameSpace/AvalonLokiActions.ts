import { db, Avalon } from '../../config/lokiDB';
import { AVATARS } from './types';

export const addRoom = (roomCode: string) => {
    return Avalon.insert({
        roomCode,
        players: [],
        takenImages: Object.keys(AVATARS).reduce((acc: Record<string, any>, avatar) => {
            acc[avatar] = { key: avatar, taken: false };
            return acc;
        }, {}),
    });
};

export const getRoomByCode = (roomCode: string) => Avalon.findOne({ roomCode });

// export const addPlayer = (newRoom: any, nickname: string, roomCode: string) => {
//     const result = Avalon.findOne({ roomCode });
//     result.players = ['blah'];
//     console.log(result);

//     // newRoom.players = [nickname];
//     // console.log(newRoom);
// };

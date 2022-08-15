import { CommonUser } from '../../config/db';

export const createUser = async () => {
    return await CommonUser.create();
};

export const getUserByUUID = async (uuid: string) => {
    return await CommonUser.findOne({
        where: {
            uuid,
        },
    });
};

// export const updateUser = async (user) => {};

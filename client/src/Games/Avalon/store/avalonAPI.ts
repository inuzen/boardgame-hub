export const vote = (vote: boolean) => {
    return {
        type: 'VOTE',
        payload: vote,
    };
};

const initSocketActions = (socket: any) => {};

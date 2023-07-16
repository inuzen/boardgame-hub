import React from 'react';
import { Button } from '../../../../Components/Button/Button';
import { RoleCheckbox } from '../../Components/RoleCheckbox';
import { ROLE_LIST, DEFAULT_ROLES } from '../../store/types';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { startGame, getAllPlayers, isHost } from '../../store/avalonSlice';
import './adminActions.scss';

function AdminActions() {
    const dispatch = useAppDispatch();

    const players = useAppSelector(getAllPlayers);
    const host = useAppSelector(isHost);
    const gameStarted = useAppSelector((state) => state.avalon.gameInProgress);

    const onStartGame = () => {
        dispatch(startGame());
    };

    if (!(host && !gameStarted)) return null;

    return (
        <div className="adminActions">
            <Button
                text="Start game"
                onClick={onStartGame}
                disabled={players?.length < (process.env.NODE_ENV === 'production' ? 5 : 2)}
            />
            <div className="addRolesWrapper">
                {Object.values(ROLE_LIST)
                    .filter((role) => !DEFAULT_ROLES.includes(role))
                    .map((roleName) => (
                        <RoleCheckbox roleKey={roleName} />
                    ))}
            </div>
        </div>
    );
}

export default AdminActions;

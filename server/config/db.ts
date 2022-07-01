import { Sequelize } from 'sequelize';
import config from 'config';

import AvalonPlayerModel from '../models/AvalonPlayer';
import AvalonGameModel from '../models/AvalonGame';
import RoomModel from '../models/AvalonRoom';

const db: string = config.get('postgresURI');
const sequelize = new Sequelize(db);
const queryInterface = sequelize.getQueryInterface();

const Avalon = AvalonGameModel(sequelize, Sequelize);
const AvalonRoom = RoomModel(sequelize, Sequelize);
const AvalonPlayer = AvalonPlayerModel(sequelize, Sequelize);

Avalon.hasMany(AvalonRoom);
AvalonRoom.belongsTo(Avalon);

AvalonRoom.hasMany(AvalonPlayer);
AvalonPlayer.belongsTo(AvalonRoom, { foreignKey: 'roomCode' });

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Postgres Connected');

        await sequelize.sync({ force: true });
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }
};

export { connectDB, sequelize, Sequelize, queryInterface, AvalonRoom, Avalon, AvalonPlayer };

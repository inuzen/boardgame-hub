import { Sequelize } from 'sequelize';
import config from 'config';

// Common Models
import CommonRoomModel from '../models/CommonModels/CommonRoom';
import CommonUserModel from '../models/CommonModels/CommonUser';

// Avalon Imports
import AvalonPlayerModel from '../models/Avalon/AvalonPlayer';
import AvalonQuestModel from '../models/Avalon/AvalonQuest';
import AvalonRoomModel from '../models/Avalon/AvalonRoom';

const db: string = process.env.DATABASE_URL || config.get('postgresURI');
const sequelize = new Sequelize(db, {
    dialectOptions:
        process.env.NODE_ENV === 'production'
            ? {
                  ssl: {
                      rejectUnauthorized: false,
                  },
              }
            : {},
});
const queryInterface = sequelize.getQueryInterface();

const CommonRoom = CommonRoomModel(sequelize, Sequelize);
const CommonUser = CommonUserModel(sequelize, Sequelize);

const AvalonRoom = AvalonRoomModel(sequelize, Sequelize);
const AvalonPlayer = AvalonPlayerModel(sequelize, Sequelize);
const AvalonQuest = AvalonQuestModel(sequelize, Sequelize);

AvalonRoom.hasMany(AvalonPlayer, { foreignKey: 'roomCode' });
AvalonPlayer.belongsTo(AvalonRoom, { foreignKey: 'roomCode' });

AvalonRoom.hasMany(AvalonQuest, { foreignKey: 'roomCode' });
AvalonQuest.belongsTo(AvalonRoom, { foreignKey: 'roomCode' });

// Add every game room to Common Room
CommonRoom.hasMany(AvalonRoom, { foreignKey: 'roomCode' });
AvalonRoom.belongsTo(CommonRoom, { foreignKey: 'roomCode' });

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

export {
    connectDB,
    sequelize,
    Sequelize,
    queryInterface,
    CommonRoom,
    CommonUser,
    AvalonRoom,
    AvalonPlayer,
    AvalonQuest,
};

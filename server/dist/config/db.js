"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvalonQuest = exports.AvalonPlayer = exports.Avalon = exports.AvalonRoom = exports.queryInterface = exports.Sequelize = exports.sequelize = exports.connectDB = void 0;
const sequelize_1 = require("sequelize");
Object.defineProperty(exports, "Sequelize", { enumerable: true, get: function () { return sequelize_1.Sequelize; } });
const config_1 = __importDefault(require("config"));
const AvalonPlayer_1 = __importDefault(require("../models/AvalonPlayer"));
const AvalonQuest_1 = __importDefault(require("../models/AvalonQuest"));
const AvalonGame_1 = __importDefault(require("../models/AvalonGame"));
const AvalonRoom_1 = __importDefault(require("../models/AvalonRoom"));
const db = process.env.DATABASE_URL || config_1.default.get('postgresURI');
const sequelize = new sequelize_1.Sequelize(db, {
    dialectOptions: {
    // ssl: {
    //     rejectUnauthorized: false,
    // },
    },
});
exports.sequelize = sequelize;
const queryInterface = sequelize.getQueryInterface();
exports.queryInterface = queryInterface;
const Avalon = (0, AvalonGame_1.default)(sequelize, sequelize_1.Sequelize);
exports.Avalon = Avalon;
const AvalonRoom = (0, AvalonRoom_1.default)(sequelize, sequelize_1.Sequelize);
exports.AvalonRoom = AvalonRoom;
const AvalonPlayer = (0, AvalonPlayer_1.default)(sequelize, sequelize_1.Sequelize);
exports.AvalonPlayer = AvalonPlayer;
const AvalonQuest = (0, AvalonQuest_1.default)(sequelize, sequelize_1.Sequelize);
exports.AvalonQuest = AvalonQuest;
Avalon.hasMany(AvalonRoom);
AvalonRoom.belongsTo(Avalon);
AvalonRoom.hasMany(AvalonPlayer, { foreignKey: 'roomCode' });
AvalonPlayer.belongsTo(AvalonRoom, { foreignKey: 'roomCode' });
AvalonRoom.hasMany(AvalonQuest, { foreignKey: 'roomCode' });
AvalonQuest.belongsTo(AvalonRoom, { foreignKey: 'roomCode' });
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Postgres Connected');
        await sequelize.sync({ force: true });
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
exports.connectDB = connectDB;

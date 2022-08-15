"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvalonQuest = exports.AvalonPlayer = exports.AvalonRoom = exports.CommonUser = exports.CommonRoom = exports.queryInterface = exports.Sequelize = exports.sequelize = exports.connectDB = void 0;
const sequelize_1 = require("sequelize");
Object.defineProperty(exports, "Sequelize", { enumerable: true, get: function () { return sequelize_1.Sequelize; } });
const config_1 = __importDefault(require("config"));
// Common Models
const CommonRoom_1 = __importDefault(require("../models/CommonModels/CommonRoom"));
const CommonUser_1 = __importDefault(require("../models/CommonModels/CommonUser"));
// Avalon Imports
const AvalonPlayer_1 = __importDefault(require("../models/Avalon/AvalonPlayer"));
const AvalonQuest_1 = __importDefault(require("../models/Avalon/AvalonQuest"));
const AvalonRoom_1 = __importDefault(require("../models/Avalon/AvalonRoom"));
const db = process.env.DATABASE_URL || config_1.default.get('postgresURI');
const sequelize = new sequelize_1.Sequelize(db, {
    dialectOptions: process.env.NODE_ENV === 'production'
        ? {
            ssl: {
                rejectUnauthorized: false,
            },
        }
        : {},
});
exports.sequelize = sequelize;
const queryInterface = sequelize.getQueryInterface();
exports.queryInterface = queryInterface;
const CommonRoom = (0, CommonRoom_1.default)(sequelize, sequelize_1.Sequelize);
exports.CommonRoom = CommonRoom;
const CommonUser = (0, CommonUser_1.default)(sequelize, sequelize_1.Sequelize);
exports.CommonUser = CommonUser;
const AvalonRoom = (0, AvalonRoom_1.default)(sequelize, sequelize_1.Sequelize);
exports.AvalonRoom = AvalonRoom;
const AvalonPlayer = (0, AvalonPlayer_1.default)(sequelize, sequelize_1.Sequelize);
exports.AvalonPlayer = AvalonPlayer;
const AvalonQuest = (0, AvalonQuest_1.default)(sequelize, sequelize_1.Sequelize);
exports.AvalonQuest = AvalonQuest;
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
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};
exports.connectDB = connectDB;

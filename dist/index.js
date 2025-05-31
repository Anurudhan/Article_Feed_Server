"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_variables_1 = require("./config/env_variables");
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = require("./boot/db");
const routers_1 = __importDefault(require("./routers"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const PORT = env_variables_1.envVaribales.PORT;
console.log(env_variables_1.envVaribales.FRONTEND_URL);
app.use((0, cors_1.default)({
    origin: env_variables_1.envVaribales.FRONTEND_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("./assets"));
app.use((0, morgan_1.default)('dev'));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);
app.use('/', routers_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
    });
});
app.use((err, req, res, next) => {
    console.error('💥 Error:', err.message + " 💥💥💥💥💥💥💥💥💥💥💥💥💥");
    res.status(500).json({
        error: err.message || 'Internal Server Error',
    });
});
(0, db_1.connectDB)();
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT} 🚀🚀🚀🚀🚀`);
});

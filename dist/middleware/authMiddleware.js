"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_1 = require("../utility/token");
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const authenticateUser = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    if (accessToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(accessToken, ACCESS_SECRET);
            if (!decoded.userId) {
                throw new Error('Invalid token payload');
            }
            req.user = decoded;
            console.log('Decoded Access Token:', decoded);
            return next();
        }
        catch (err) {
            console.error('Access Token verification error:', err);
        }
    }
    else {
        console.log('No access token found in cookies');
    }
    if (!refreshToken) {
        console.log('No refresh token found in cookies');
        res.status(401).json({ error: 'Access and refresh tokens missing' });
        return;
    }
    try {
        const decodedRefresh = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
        if (!decodedRefresh.userId) {
            throw new Error('Invalid refresh token payload');
        }
        const payload = { userId: decodedRefresh.userId };
        const newAccessToken = (0, token_1.createAccessToken)(payload);
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });
        req.user = decodedRefresh;
        console.log('New Access Token generated:', newAccessToken);
        next();
    }
    catch (err) {
        console.error('Refresh Token verification error:', err);
        res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
};
exports.authenticateUser = authenticateUser;

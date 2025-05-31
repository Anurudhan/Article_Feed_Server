"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = __importDefault(require("../models/userModel"));
const token_1 = require("../utility/token");
class AuthController {
    // Signup method
    signup(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { password, confirmPassword, email, firstName, lastName, phone, dob, articlePreferences } = req.body;
                if (!password || !confirmPassword) {
                    res.status(400).json({ error: 'Password and confirmation are required' });
                    return;
                }
                if (password !== confirmPassword) {
                    res.status(400).json({ error: 'Password and confirmation do not match' });
                    return;
                }
                const existingUser = yield userModel_1.default.findOne({ email });
                if (existingUser) {
                    res.status(409).json({ error: 'User with this email already exists' });
                    return;
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const newUser = new userModel_1.default({
                    firstName,
                    lastName,
                    phone,
                    email,
                    dob,
                    password: hashedPassword,
                    articlePreferences,
                    isEmailVerified: false,
                    otp: [],
                });
                yield newUser.save();
                res.status(201).json({ message: 'User created successfully' });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Login method
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { emailOrPhone, password } = req.body;
                const user = yield userModel_1.default.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
                if (!user) {
                    res.status(401).json({ message: 'Invalid credentials', sucess: false });
                    return;
                }
                const isMatch = yield bcrypt_1.default.compare(password, user.password);
                if (!isMatch) {
                    res.status(401).json({ message: 'Invalid credentials', sucess: false });
                    return;
                }
                const payload = { userId: user._id };
                const accessToken = (0, token_1.createAccessToken)(payload);
                const refreshToken = (0, token_1.createRefreshToken)(payload);
                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: true, // only in production with https
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000 // 15 minutes
                });
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                });
                res.status(200).json({ message: 'Logged in successfully', success: true, user });
            }
            catch (error) {
                res.status(500).json({ message: 'Internal server error', sucess: false });
            }
        });
    }
    // Get user info
    getUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                console.log(req.user);
                if (!userId) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                const user = yield userModel_1.default.findById(userId).select('-password -otp');
                if (!user) {
                    res.status(404).json({ error: 'User not found' });
                    return;
                }
                res.status(200).json({ user });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // Logout (stateless JWT)
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.status(200).json({ message: 'Logged out successfully' });
        });
    }
}
exports.authController = new AuthController();

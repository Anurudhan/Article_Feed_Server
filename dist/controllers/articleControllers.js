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
exports.getPreferenceArticles = exports.getUserArticles = exports.unblock = exports.block = exports.removeDislike = exports.dislike = exports.removeLike = exports.like = exports.softDelete = exports.edit = exports.create = void 0;
const articleModal_1 = require("../models/articleModal");
const userModel_1 = __importDefault(require("../models/userModel"));
// 1. Create an article
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const article = new articleModal_1.ArticleModel(req.body);
        yield article.save();
        res.status(201).json(article);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create article', error });
    }
});
exports.create = create;
// 2. Edit an article
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield articleModal_1.ArticleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated)
            res.status(404).json({ message: 'Article not found' });
        res.json({ updated });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update article', error });
    }
});
exports.edit = edit;
// 3. Soft delete an article
const softDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield articleModal_1.ArticleModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!deleted)
            res.status(404).json({ message: 'Article not found' });
        res.json({ message: 'Article soft deleted', article: deleted });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to soft delete article', error });
    }
});
exports.softDelete = softDelete;
// 4. Like the article
const like = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield articleModal_1.ArticleModel.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 }, isLiked: true }, { new: true });
        if (!updated)
            res.status(404).json({ message: 'Article not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to like article', error });
    }
});
exports.like = like;
// 5. Remove like
const removeLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield articleModal_1.ArticleModel.findByIdAndUpdate(req.params.id, { $inc: { likes: -1 }, isLiked: false }, { new: true });
        if (!updated)
            res.status(404).json({ message: 'Article not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to remove like', error });
    }
});
exports.removeLike = removeLike;
// 6. Dislike
const dislike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield articleModal_1.ArticleModel.findByIdAndUpdate(req.params.id, { isDisliked: true }, { new: true });
        if (!updated)
            res.status(404).json({ message: 'Article not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to dislike article', error });
    }
});
exports.dislike = dislike;
// 7. Remove dislike
const removeDislike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield articleModal_1.ArticleModel.findByIdAndUpdate(req.params.id, { isDisliked: false }, { new: true });
        if (!updated)
            res.status(404).json({ message: 'Article not found' });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to remove dislike', error });
    }
});
exports.removeDislike = removeDislike;
// 8. Block article
const block = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield articleModal_1.ArticleModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!updated)
            res.status(404).json({ message: 'Article not found' });
        res.json({ message: 'Article blocked', article: updated });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to block article', error });
    }
});
exports.block = block;
// 9. Unblock article
const unblock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield articleModal_1.ArticleModel.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
        if (!updated)
            res.status(404).json({ message: 'Article not found' });
        res.json({ message: 'Article unblocked', article: updated });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to unblock article', error });
    }
});
exports.unblock = unblock;
const getUserArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const articles = yield articleModal_1.ArticleModel.find({
            'author.id': (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId, // Assuming author.id stores the user's _id
        }).sort({ publishedAt: -1 }); // Sort by most recent
        res.json(articles);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve user articles', error });
    }
});
exports.getUserArticles = getUserArticles;
const getPreferenceArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Fetch user preferences from User model
        const user = yield userModel_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId).select('preferredCategories preferredTags');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }
        // Validate preferences
        const preferredCategories = (user === null || user === void 0 ? void 0 : user.articlePreferences) || [];
        if (preferredCategories.length === 0) {
            res.status(400).json({ message: 'No preferences found for the user' });
        }
        // Find articles matching user's preferred categories or tags, or liked articles
        const articles = yield articleModal_1.ArticleModel.find({
            $or: [
                { category: { $in: preferredCategories } },
                { isLiked: true, 'author.id': { $ne: (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId } }, // Include liked articles not authored by the user
            ],
            isDeleted: false,
        })
            .sort({ likes: -1, publishedAt: -1 }) // Prioritize popular and recent articles
            .limit(20); // Limit to 20 articles for performance
        res.json(articles);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve preference articles', error });
    }
});
exports.getPreferenceArticles = getPreferenceArticles;

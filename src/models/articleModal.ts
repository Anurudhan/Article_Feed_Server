import mongoose, { Schema, Document } from 'mongoose';
import { IArticle } from '../type/artiicle';

const ArticleSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    name: { type: String, required: true },
    avatar: { type: String, required: true },
  },
  publishedAt: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  likes: { type: Number, default: 0 },
  readTime: { type: Number, required: true },
  views: { type: Number, default: 0 },
  isLiked: { type: Boolean, default: false },
  isDisliked: { type: Boolean, default: false },
  tags: [{ type: String }],
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export const ArticleModel = mongoose.model<IArticle>('Article', ArticleSchema);
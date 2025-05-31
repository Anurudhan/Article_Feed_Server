import mongoose, { Schema, Document } from 'mongoose';

interface Author {
  name: string;
  avatar: string;
}

export interface IArticle extends Document {
  title: string;
  content: string;
  author: Author;
  publishedAt: string;
  category: string;
  image: string;
  likes: number;
  readTime: number;
  views: number;
  isLiked: boolean;
  isDisliked: boolean;
  tags?: string[];
  isDeleted?: boolean;
}
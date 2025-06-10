import mongoose, { Schema, Document } from 'mongoose';

export interface Author {
  name: string;
  avatar: string;
}
export interface createArticleEntity{
  title: string;
  content: string;
  authorId: string;
  publishedAt: string;
  category: string;
  image: string;
  tags: string[];
  readTime: number;
}
export interface Article {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  author?: Author;
  publishedAt: string;
  category: string;
  image: string;
  likes: string[];  
  dislikes: string[];
  blockedBy: string[];  
  readTime: number;
  views: number;
  tags: string[];
  isDeleted?: boolean;
}
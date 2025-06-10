import { Request, Response} from 'express';
import { ArticleModel } from '../models/articleModal';
import { CustomRequest } from '../utility/CustomRequest';
import UserModel from '../models/userModel';
import mongoose from 'mongoose';

// Define the shape of the article data for req.body
interface ArticleData {
  title: string;
  content: string;
  // Add other fields as needed
}


export const create = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: 'Unauthorized: user not logged in' });
    }

    const { title, content, publishedAt, category, image, tags, readTime } = req.body;

    // Optional: Add validation here

    const article = new ArticleModel({
      title,
      content,
      publishedAt,
      category,
      image,
      tags,
      readTime,
      authorId: req.user?.userId
    });

    await article.save();

    res.status(201).json({data:article,message:"Successfully created an Article !..",success:true});
  } catch (error) {
    res.status(500).json({ message: 'Failed to create article', error });
  }
};

// 2. Edit an article
export const edit = async (req: Request, res: Response) => {
  try {
    const updated = await ArticleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) res.status(404).json({ message: 'Article not found' });
    res.json({updated});
  } catch (error) {
    res.status(500).json({ message: 'Failed to update article', error });
  }
};

// 3. Soft delete an article
export const softDelete = async (req: Request, res: Response) => {
  try {
    const deleted = await ArticleModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!deleted) res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article soft deleted', article: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to soft delete article', error });
  }
};

export const like = async (req: CustomRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req?.user?.userId);
    const article = await ArticleModel.findById(req.params.id);

    if (!article) {
      res.status(404).json({ message: 'Article not found' });
    }

    const hasLiked = article?.likes.includes(req?.user?.userId as string);

    const updated = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      hasLiked
        ? { $pull: { likes: userId } }  // Remove like
        : { $addToSet: { likes: userId } },  // Add like (prevents duplicates)
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to like article', error });
  }
};

export const dislike= async (req: CustomRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req?.user?.userId);
    const article = await ArticleModel.findById(req.params.id);

    if (!article) {
      res.status(404).json({ message: 'Article not found' });
    }

    const hasDisLiked = article?.dislikes.includes(req?.user?.userId as string);

    const updated = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      hasDisLiked
        ? { $pull: { dislikes: userId } }  
        : { $addToSet: { dislikes: userId } }, 
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to dislike article', error });
  }
};

export const block = async (req: CustomRequest, res: Response) => {
  try {
   const userId = new mongoose.Types.ObjectId(req?.user?.userId);
    const article = await ArticleModel.findById(req.params.id);

    if (!article) {
      res.status(404).json({ message: 'Article not found' });
    }

    const hasBlockedBy = article?.blockedBy.includes(req?.user?.userId as string);

    const updated = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      hasBlockedBy
        ? { $pull: { blockedBy: userId } }  
        : { $addToSet: { blockedBy: userId } }, 
      { new: true }
    );

    res.json({ message: 'Article blocked', article: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to block article', error });
  }
};

export const getMyArticles = async (req: CustomRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req?.user?.userId); 
    const {
      page = 1,
      limit = 10,
      search,
      category,
      sortBy = 'newest'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { authorId: userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Sort options
    let sortOption: any = {};
    switch (sortBy) {
      case 'newest':
        sortOption = { publishedAt: -1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { publishedAt: -1 };
    }

    // Execute aggregation pipeline
    const [articlesResult, totalCount] = await Promise.all([
      ArticleModel.aggregate([
        { $match: query },
        { $sort: sortOption },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: 'users', 
            localField: 'authorId',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        {
          $project: {

            title: 1,
            content: 1,
            category: 1,
            authorId:1,
            image:1,
            tags: 1,
            publishedAt: 1,
            views: 1,
            readTime:1,
            likes:1,
            dislikes:1,
            isDeleted:1,
            blockedBy:1,
            author: {
              name: '$author.firstName',
            }
          }
        }
      ]).exec(),
      ArticleModel.countDocuments(query)
    ]);
    console.log(articlesResult,totalCount,"This is the Article Result and the tottal count=============>")
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const response = {
      articles: articlesResult,
      totalCount,
      totalPages,
      currentPage: pageNum,
      hasNextPage,
      hasPrevPage
    };

    res.json({
      success: true,
      data: response,
      message: 'Articles fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching my articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles'
    });
  }
};

export const getPreferenceArticles = async (req: CustomRequest, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req?.user?.userId);
    const user = await UserModel.findById(userId).select('articlePreferences');

    if (!user) {
      console.log("Here the error occuring 2222222222222222222222222---------------->")
       res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      page = 1,
      limit = 10,
      search,
      category,
      sortBy = 'newest'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    console.log(user)
    const preferredCategories = user?.articlePreferences || [];
    if (preferredCategories.length === 0) {
       res.status(400).json({ success: false, message: 'No preferences found for the user' });
    }

    // Build query
    const query: any = {
      isDeleted: false,
      $or: [
        { category: { $in: preferredCategories } }
      ]
    };

    if (search) {
      query.$or.push(
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      );
    }

    if (category) {
      query.category = category;
    }

    // Sorting
    let sortOption: any = {};
    switch (sortBy) {
      case 'newest':
        sortOption = { publishedAt: -1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { publishedAt: -1 };
    }

    // Aggregation pipeline
    const [articlesResult, totalCount] = await Promise.all([
      ArticleModel.aggregate([
        { $match: query },
        { $sort: sortOption },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        {
          $project: {
            title: 1,
            content: 1,
            category: 1,
            tags: 1,
            authorId: 1,
            image: 1,
            views: 1,
            likes: 1,
            dislikes: 1,
            publishedAt: 1,
            readTime: 1,
            isDeleted: 1,
            blockedBy: 1,
            author: {
              name: '$author.firstName'
            }
          }
        }
      ]).exec(),
      ArticleModel.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const response = {
      articles: articlesResult,
      totalCount,
      totalPages,
      currentPage: pageNum,
      hasNextPage,
      hasPrevPage
    };

    res.json({
      success: true,
      data: response,
      message: 'Articles based on preferences fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching preference articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve preference articles',
      error
    });
  }
};

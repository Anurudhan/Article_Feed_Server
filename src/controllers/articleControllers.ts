import { Request, Response} from 'express';
import { ArticleModel } from '../models/articleModal';
import { CustomRequest } from '../utility/CustomRequest';
import UserModel from '../models/userModel';

// Define the shape of the article data for req.body
interface ArticleData {
  title: string;
  content: string;
  // Add other fields as needed
}

// 1. Create an article
export const create = async (req: Request, res: Response) => {
  try {
    const article = new ArticleModel(req.body);
    await article.save();
    res.status(201).json(article);
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

// 4. Like the article
export const like = async (req: Request, res: Response) => {
  try {
    const updated = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 }, isLiked: true },
      { new: true }
    );
    if (!updated) res.status(404).json({ message: 'Article not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to like article', error });
  }
};

// 5. Remove like
export const removeLike = async (req: Request, res: Response) => {
  try {
    const updated = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: -1 }, isLiked: false },
      { new: true }
    );
    if (!updated) res.status(404).json({ message: 'Article not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove like', error });
  }
};

// 6. Dislike
export const dislike= async (req: Request, res: Response) => {
  try {
    const updated = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      { isDisliked: true },
      { new: true }
    );
    if (!updated) res.status(404).json({ message: 'Article not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to dislike article', error });
  }
};

// 7. Remove dislike
export const removeDislike = async (req: Request, res: Response) => {
  try {
    const updated = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      { isDisliked: false },
      { new: true }
    );
    if (!updated) res.status(404).json({ message: 'Article not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove dislike', error });
  }
};

// 8. Block article
export const block = async (req: Request, res: Response) => {
  try {
    const updated = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!updated) res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article blocked', article: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to block article', error });
  }
};

// 9. Unblock article
export const unblock = async (req: Request, res: Response) => {
  try {
    const updated = await ArticleModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );
    if (!updated) res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article unblocked', article: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unblock article', error });
  }
};

export const getUserArticles = async (req:CustomRequest , res: Response) => {
  try {
   
    const articles = await ArticleModel.find({
      'author.id': req?.user?.userId, // Assuming author.id stores the user's _id
    }).sort({ publishedAt: -1 }); // Sort by most recent
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user articles', error });
  }
};

export const getPreferenceArticles = async (req: CustomRequest, res: Response) => {
  try {

    // Fetch user preferences from User model
    const user = await UserModel.findById(req.user?.userId).select('preferredCategories preferredTags');
    if (!user) {
       res.status(404).json({ message: 'User not found' });
    }

    // Validate preferences
    const preferredCategories = user?.articlePreferences || [];
    if (preferredCategories.length === 0 ) {
       res.status(400).json({ message: 'No preferences found for the user' });
    }

    // Find articles matching user's preferred categories or tags, or liked articles
    const articles = await ArticleModel.find({
      $or: [
        { category: { $in: preferredCategories } },
        { isLiked: true, 'author.id': { $ne: req.user?.userId } }, // Include liked articles not authored by the user
      ],
      isDeleted: false,
    })
      .sort({ likes: -1, publishedAt: -1 }) // Prioritize popular and recent articles
      .limit(20); // Limit to 20 articles for performance

    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve preference articles', error });
  }
};
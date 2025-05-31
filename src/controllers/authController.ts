import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../models/userModel';
import { createAccessToken, createRefreshToken } from '../utility/token';
import { CustomRequest } from '../utility/CustomRequest';

class AuthController {
  // Signup method
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        res.status(409).json({ error: 'User with this email already exists' });
        return;
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
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
      
      await newUser.save();
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Login method
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { emailOrPhone, password } = req.body;
      
      const user = await UserModel.findOne({$or:[{email:emailOrPhone},{phone:emailOrPhone}] });
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials',sucess:false});
        return;
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' ,sucess:false});
        return;
      }
      
      const payload = { userId: user._id };
      const accessToken = createAccessToken(payload);
      const refreshToken = createRefreshToken(payload);
      
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
      
      res.status(200).json({ message: 'Logged in successfully',success:true,user });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error',sucess:false});
    }
  }

  // Get user info
  async getUser(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.userId;
    console.log(req.user);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await UserModel.findById(userId).select('-password -otp');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

  // Logout (stateless JWT)
  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  }
}

export const authController = new AuthController();
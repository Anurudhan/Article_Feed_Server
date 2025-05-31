import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomRequest } from '../utility/CustomRequest';
import { createAccessToken } from '../utility/token';

// Define the expected payload type
interface TokenPayload {
  userId: string;
}

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const authenticateUser = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  console.log('Access Token:', accessToken);
  console.log('Refresh Token:', refreshToken);

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, ACCESS_SECRET) as TokenPayload;
      if (!decoded.userId) {
        throw new Error('Invalid token payload');
      }
      req.user = decoded;
      console.log('Decoded Access Token:', decoded);
      return next(); 
    } catch (err) {
      console.error('Access Token verification error:', err);
    }
  } else {
    console.log('No access token found in cookies');
  }

  if (!refreshToken) {
    console.log('No refresh token found in cookies');
    res.status(401).json({ error: 'Access and refresh tokens missing' });
    return;
  }

  try {
    const decodedRefresh = jwt.verify(refreshToken, REFRESH_SECRET) as TokenPayload;
    if (!decodedRefresh.userId) {
      throw new Error('Invalid refresh token payload');
    }
    const payload = { userId: decodedRefresh.userId };
    const newAccessToken = createAccessToken(payload);

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
  } catch (err) {
    console.error('Refresh Token verification error:', err);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (user: AuthUser): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): AuthUser | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Inject user into request object
  (req as any).user = decoded;
  next();
};

export const extractUserId = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  return decoded ? decoded.id : undefined;
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  return requireRole('admin')(req, res, next);
};

export const requireCatalogEditor = async (req: Request, res: Response, next: NextFunction) => {
  return requireRole('admin', 'editor')(req, res, next);
};

const requireRole = (...allowedRoles: string[]) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as any).user as AuthUser | undefined;
  if (!user) {
    return res.status(401).json({ error: 'No authenticated user' });
  }

  try {
    const dbUser = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true, is_active: true },
    });

    if (!dbUser || !dbUser.is_active) {
      return res.status(401).json({ error: 'User is not active' });
    }

    if (!allowedRoles.includes(dbUser.role)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

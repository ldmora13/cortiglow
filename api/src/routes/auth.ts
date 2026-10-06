import { Router } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { generateToken, requireAuth } from '../utils/auth';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.profile.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      session: {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          user_metadata: {
            full_name: user.full_name
          }
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/session', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Fetch fresh user data just in case
    const dbUser = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      session: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          user_metadata: {
            full_name: dbUser.full_name
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

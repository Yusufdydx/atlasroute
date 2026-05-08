import express, { Request, Response } from 'express';
import { AuthService, authMiddleware } from './auth';

export function createWebRoutes() {
  const router = express.Router();

  // =====================
  // API ROUTES
  // =====================
  router.post('/register', async (req: Request, res: Response) => {
    const { email, name, username, password, country } = req.body;
    if (!email || !name || !username || !password) {
      return res.json({ success: false, error: 'All fields are required' });
    }
    const result = await AuthService.registerUser(email, name, password, username, country);
    
    if (result.success && result.user) {
      const login = await AuthService.loginUser(email, password);
      if (login.success && login.session) {
        res.setHeader('Set-Cookie', [
          'session=' + login.session + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + (7*24*60*60)
        ]);
        
        res.json({ 
          success: true, 
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            username: result.user.username,
            country: result.user.country
          },
          redirect: '/dashboard' 
        });
        return;
      }
    }
    
    res.json({ ...result, redirect: '/dashboard' });
  });

  router.post('/login', async (req: Request, res: Response) => {
    const { email, username, password, redirect } = req.body;
    const loginField = email || username;
    if (!loginField || !password) {
      return res.json({ success: false, error: 'Email/Username and password required' });
    }
    const result = await AuthService.loginUser(loginField, password);
    
    if (result.success && result.session) {
      res.setHeader('Set-Cookie', [
        'session=' + result.session + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + (7*24*60*60)
      ]);
      
      if (result.user) {
        res.json({ 
          success: true, 
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            username: result.user.username,
            country: result.user.country
          },
          redirect: redirect || '/dashboard' 
        });
        return;
      }
    }
    
    res.json({ ...result, redirect: redirect || '/dashboard' });
  });

  router.post('/keys', authMiddleware, async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = (req as any).user.sub;
    if (!name) {
      return res.json({ success: false, error: 'Key name required' });
    }
    const apiKey = AuthService.createApiKey(userId, name);
    res.json({ success: true, apiKey });
  });

  router.put('/keys/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.sub;
    const keyId = req.params.id;
    const { name } = req.body;
    const success = AuthService.updateApiKeyName(keyId, userId, name);
    res.json({ success });
  });

  router.delete('/keys/:id', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.sub;
    const keyId = req.params.id;
    const success = AuthService.deleteApiKey(keyId, userId);
    res.json({ success });
  });

  router.get('/keys', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.sub;
    const keys = AuthService.getUserApiKeys(userId);
    res.json({ keys });
  });

  router.post('/password', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.sub;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.json({ success: false, error: 'All fields required' });
    }
    
    const result = await AuthService.changePassword(userId, oldPassword, newPassword);
    res.json(result);
  });

  router.get('/me', authMiddleware, async (req: Request, res: Response) => {
    const userId = (req as any).user.sub;
    const user = AuthService.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        country: user.country,
        createdAt: user.createdAt
      }
    });
  });

  router.post('/logout', async (req: Request, res: Response) => {
    res.setHeader('Set-Cookie', [
      'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    ]);
    res.json({ success: true });
  });

  return router;
}
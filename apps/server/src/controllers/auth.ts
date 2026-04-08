import type { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth';
import { registerUser, loginUser } from '../services/auth';

export async function register(req: Request, res: Response): Promise<void> {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', issues: result.error.issues });
    return;
  }

  try {
    const { user, token } = await registerUser(result.data);
    res.status(201).json({ user, token });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === 'EMAIL_TAKEN') {
        res.status(409).json({ error: 'Email is already in use' });
        return;
      }
      if (err.message === 'USERNAME_TAKEN') {
        res.status(409).json({ error: 'Username is already taken' });
        return;
      }
    }
    console.error('[register]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', issues: result.error.issues });
    return;
  }

  try {
    const { user, token } = await loginUser(result.data);
    res.json({ user, token });
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    console.error('[login]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function me(req: Request, res: Response): void {
  res.json({ user: req.user });
}

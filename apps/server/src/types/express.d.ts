import type { JwtPayload } from '../services/auth';

// Extend Express's Request type so req.user is available after authenticate middleware
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

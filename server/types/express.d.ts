import { User } from '@shared/schema';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: Partial<User>;
    }
  }
}
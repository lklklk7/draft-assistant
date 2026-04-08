import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import type { RegisterInput, LoginInput } from '../schemas/auth';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
}

export async function registerUser(input: RegisterInput) {
  // Check for existing email or username in one query
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
  });

  if (existing) {
    throw new Error(existing.email === input.email ? 'EMAIL_TAKEN' : 'USERNAME_TAKEN');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: { email: input.email, username: input.username, passwordHash },
    select: { id: true, email: true, username: true, createdAt: true },
  });

  const token = signToken({ userId: user.id, email: user.email });
  return { user, token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Use the same error for both "user not found" and "wrong password"
  // so attackers cannot tell which accounts exist
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = signToken({ userId: user.id, email: user.email });
  return {
    user: { id: user.id, email: user.email, username: user.username, createdAt: user.createdAt },
    token,
  };
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

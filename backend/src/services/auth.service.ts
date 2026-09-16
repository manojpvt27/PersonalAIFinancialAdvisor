import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';

interface SignupInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async signup(input: SignupInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        currency: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens(user);

    // Log the signup
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'signup',
        entityType: 'user',
        entityId: user.id,
      },
    });

    return { user, ...tokens };
  }

  /**
   * Login with email and password
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.passwordHash) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Log the login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'login',
        entityType: 'user',
        entityId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        currency: user.currency,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  /**
   * Google OAuth login/signup
   */
  async googleAuth(googleData: { email: string; name: string; googleId: string; avatarUrl?: string }) {
    let user = await prisma.user.findUnique({
      where: { googleId: googleData.googleId },
    });

    if (!user) {
      // Check if email exists (link accounts)
      user = await prisma.user.findUnique({
        where: { email: googleData.email },
      });

      if (user) {
        // Link Google account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleData.googleId,
            avatarUrl: googleData.avatarUrl || user.avatarUrl,
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: googleData.email,
            name: googleData.name,
            googleId: googleData.googleId,
            avatarUrl: googleData.avatarUrl,
          },
        });
      }
    }

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        currency: user.currency,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        currency: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: { name?: string; currency?: string; avatarUrl?: string; preferences?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        currency: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If this email exists, a reset link has been sent' };
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${token}`);

    return { message: 'If this email exists, a reset link has been sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return { message: 'Password reset successful' };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        id: string;
        email: string;
        name: string;
        role: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      return this.generateTokens({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(user: { id: string; email: string; name: string; role: string }) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn as any }
    );

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();

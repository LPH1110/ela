import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import prisma from './prisma';
import { env } from './env';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(new Error('No email found from Google profile'), undefined);
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // If the user doesn't exist, create them
          user = await prisma.user.create({
            data: {
              email,
              fullName: profile.displayName || 'Unknown User',
              avatarUrl: profile.photos?.[0].value,
              googleId: profile.id,
              isVerified: true,
            },
          });
        } else if (!user.googleId) {
          // If the user exists but hasn't linked Google, link it now
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.id, isVerified: true },
          });
        }

        return done(null, user as Express.User);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;

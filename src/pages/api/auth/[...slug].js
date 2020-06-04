import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

const options = {
  site: process.env.SITE,
  providers: [
    /*
    Providers.Email({
      // Configure with an SMTP connection string or an object for nodemailer https://nodemailer.com/
      server: process.env.EMAIL_SERVER,
      // Email services often only allow sending email from a valid/verified address
      from: process.env.EMAIL_FROM,
    }),
    */
    // When configuring oAuth providers you will need to make sure you get permission to request
    // the users email address to be able to verify their identity
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Providers.Facebook({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    Providers.Twitter({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
    }),
    /*
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
    Providers.Twitch({
      clientId: process.env.TWITCH_ID,
      clientSecret: process.env.TWITCH_SECRET
    }),
    */
  ],
  pages: {
    signin: '/auth/signin',
  },
  // Database configuration can be a JavaScript object or database connection
  // string. By default, NextAuth loads TypeORM which is compatible with MySQL,
  // Postgres, MongoDB and other popular SQL and noSQL databases.
  // You can also specify a custom adapter if TypeORM doesn't meet your needs.
  //
  // This example configuration is for an SQLite in-memory database. For options
  // see https://github.com/typeorm/typeorm/blob/master/docs/using-ormconfig.md
  database: {
    type: 'mongodb',
    url: process.env.MONGODB_URI || 'mongodb://localhost/explorer',
    // The `synchronize: true` option automatically creates tables/collections.
    // You should use this in development or on first run only as it may result
    // in data loss if used in production.
    synchronize: process.env.NODE_ENV !== 'production',
  },
  // sessionMaxAge: 30*24*60*60*1000, // Expire sessions after 30 days of being idle
  // sessionUpdateAge: 24*60*60*1000, // Update session expiry only if session was updated more recently than the last 24 hours
  // verificationMaxAge: 24*60*60*1000, // Expire erification links (for email sign in) after 24 hours
  debug: false, // Set to true to enable debug messages to be displayed
};

export default async (req, res) => NextAuth(req, res, options);

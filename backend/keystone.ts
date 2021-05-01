import 'dotenv/config';
import { createAuth } from '@keystone-next/auth';
import { config, createSchema } from '@keystone-next/keystone/schema';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { insertSeedData } from './seed-data';

const databaseURL =
  process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

// logging in to the keystone backend, how do we authenticate the users on the front end
const sessionConfig = {
  // how long does the (cookie) user stay logged in
  maxAge: 60 * 60 * 24 * 360,
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  // which schema is going to be responsible for being the USER
  listKey: 'User',
  // which field IN the user is going to identify the user
  identityField: 'email',
  // the field that it will ask for when they type it in
  secretField: 'password',
  // if you set up auth and there's no users, how do you auth
  // keystone has initFirstItem
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO: Add in initial roles here
    // when we do add roles we should give this person every single role because they will be the admin
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseURL,
      async onConnect(keystone) {
        console.log('Connected to the database!');
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
    },
    lists: createSchema({
      // Scheme items go in here
      User,
      Product,
      ProductImage,
    }),
    ui: {
      // show the UI only for people who pass this test
      isAccessAllowed: ({ session }) =>
        // console.log(session);
        !!session?.data,
    },
    // TODO: Add session values here
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQL Query
      User: 'id name email',
    }),
  })
);

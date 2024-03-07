import { User } from '../payload-types';
import { Access, CollectionConfig } from 'payload/types';

const isAdminOrHasAccessToImages =
  (): Access =>
  async ({ req }) => {
    const user = req.user as User | undefined;

    if (!user) return false;
    if (user.role === 'admin') return true;

    return {
      user: {
        equals: req.user.id,
      },
    };
  };

export const Media: CollectionConfig = {
  slug: 'media',
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Associating the created image with the user which will be used for filtering the available images.
        return { ...data, user: req.user.id };
      },
    ],
  },
  access: {
    read: async ({ req }) => {
      const referer = req.headers.referer;

      // If there is no logged in user or not currently on the backend, all images can be read
      if (!req.user || !referer?.includes('sell')) {
        return true;
      }

      return await isAdminOrHasAccessToImages()({ req });
    },
    // Shorthand for 'operation: ({ req }) => isAdminOrHasAccessToImages()({ req })':
    delete: isAdminOrHasAccessToImages(),
    update: isAdminOrHasAccessToImages(),
  },
  admin: {
    hidden: ({ user }) => user.role !== 'admin',
  },
  upload: {
    staticURL: '/media',
    staticDir: 'media', // Media directory for storing the images. Can also be exported to services such as AWS etc.
    // Optimization variations.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 124, position: 'centre' },
      { name: 'tablet', width: 1024, height: undefined, position: 'centre' },
    ],
    mimeTypes: ['image/*'],
  },
  // Associating the created image with the user
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true, // set in beforeChange hook
      hasMany: false,
      admin: {
        condition: () => false,
      },
    },
  ],
};

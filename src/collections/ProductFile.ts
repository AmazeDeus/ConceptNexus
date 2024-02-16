/* Author's note: Tips in notes.md */

import { User } from '../payload-types';
import { BeforeChangeHook } from 'payload/dist/collections/config/types';
import { Access, CollectionConfig } from 'payload/types';

const addUser: BeforeChangeHook = async ({ req, data }) => {
  const user = req.user as User | null;
  return { ...data, user: user?.id };
};

const yourOwnAndPurchased: Access = async ({ req }) => {
  const user = req.user as User | null;

  if (user?.role === 'admin') return true;
  if (!user) return false;

  // Get all ids of products the user owns
  const { docs: products } = await req.payload.find({
    collection: 'products',
    depth: 0, // get only the id
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  // Filter the ids and make sure it is an array of the ids for each product file.
  const ownProductFileIds = products.map((prod) => prod.product_files).flat();

  // Get all ids of product files the user has purchased
  const { docs: orders } = await req.payload.find({
    collection: 'orders',
    depth: 2, // get the Order, User, and their products
    where: {
      user: {
        equals: user.id,
      },
    },
  });

  const purchasedProductFileIds = orders
    .map((order) => {
      // Get the Product File(s) from the order
      return order.products.map((prod) => {
        // Check the available types
        if (typeof prod === 'string') // prod = type string (id)
          return req.payload.logger.error(
            'Search depth not sifficient to find purchased file IDs'
          );

        return typeof prod.product_files === 'string' // prod = type Product
          ? prod.product_files
          : prod.product_files.id;
      });
    })
    .filter(Boolean)
    .flat();

  return {
    id: {
      in: [...ownProductFileIds, ...purchasedProductFileIds],
    },
  };
};

export const ProductFiles: CollectionConfig = {
  slug: 'product_files',
  admin: {
    hidden: ({ user }) => user.role !== 'admin',
  },
  hooks: {
    beforeChange: [addUser],
  },
  access: {
    read: yourOwnAndPurchased,
    update: ({req}) => req.user.role === 'admin',
    delete: ({req}) => req.user.role === 'admin',
    // create will use the default which will allow users to upload a product file
  },
  upload: {
    staticURL: '/product_files',
    staticDir: 'product_files',
    mimeTypes: ['image/*', 'font/*', 'application/postscript'],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        condition: () => false,
      },
      hasMany: false,
      required: true,
    },
  ],
};

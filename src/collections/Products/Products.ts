import { BeforeChangeHook } from 'payload/dist/collections/config/types';
import { PRODUCT_CATEGORIES } from '../../config';
import { CollectionConfig } from 'payload/types';
import { Product } from '../../payload-types';
import { stripe } from '../../lib/stripe';

const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
  const user = req.user;

  // Extend the data used to create the product
  return { ...data, user: user.id };
};

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  access: {},
  hooks: {
    // Generate neccessary data when creating new products
    beforeChange: [
      addUser,
      async (args) => {
        // Multiple operations when handling products with Stripe
        if (args.operation === 'create') {
          const data = args.data as Product;

          // Create product in Stripe
          const createdProduct = await stripe.products.create({
            name: data.name,
            default_price_data: {
              currency: 'USD',
              unit_amount: Math.round(data.price * 100), // Price in cents
            },
          });

          // Overwrite data with neccessary properties
          const updated: Product = {
            ...data,
            stripeId: createdProduct.id,
            priceId: createdProduct.default_price as string,
          };

          return updated;
        } else if (args.operation === 'update') {
          const data = args.data as Product;

          // Update product in Stripe
          const updatedProduct = await stripe.products.update(data.stripeId!, {
            name: data.name,
            default_price: data.priceId!,
          });

          // Overwrite data with neccessary properties
          const updated: Product = {
            ...data,
            stripeId: updatedProduct.id,
            priceId: updatedProduct.default_price as string,
          };

          return updated;
        }
      },
    ],
  },
  fields: [
    {
      // Each product associates with a user
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false, // product can only have one user
      admin: {
        condition: () => false,
      },
    },
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      label: 'Products details',
      type: 'textarea',
    },
    {
      name: 'price',
      label: 'Price in USD',
      min: 0,
      max: 1000,
      type: 'number',
      required: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: PRODUCT_CATEGORIES.map(({ label, value }) => ({ label, value })),
      required: true,
    },
    {
      // The actual products the user buys
      name: 'product_files',
      label: 'Product File(s)',
      type: 'relationship',
      relationTo: 'product_files', // collection for product files
      required: true,
      hasMany: false, // Each product has one product file. Multiple product files, eg. icons set formats, would require this to be 'true'.
    },
    {
      // Approved products by admins
      name: 'approvedForSale',
      label: 'Product Status',
      type: 'select',
      defaultValue: 'pending',
      // Check if the user is allowed to approve a product
      access: {
        create: ({ req }) => req.user.role === 'admin',
        read: ({ req }) => req.user.role === 'admin',
        update: ({ req }) => req.user.role === 'admin',
      },
      options: [
        {
          label: 'Pending verification',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Denied',
          value: 'denied',
        },
      ],
    },
    {
      // Each product has a Stripe product associated with it
      name: 'priceId',
      // Nothing should be able to change this.
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      // Each product has a Stripe product associated with it
      name: 'stripeId',
      // Nothing should be able to change this.
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Product images',
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media', // collection for product images
          required: true,
        },
      ],
    },
  ],
};

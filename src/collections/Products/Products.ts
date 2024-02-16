import { PRODUCT_CATEGORIES } from '../../config';
import { CollectionConfig } from 'payload/types';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  access: {}, // Who can access which parts of which products
  fields: [
    {
      // Each prdocust associates with a user
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false, // product can only have one user
      admin: {
        condition: () => false, // hide field from admin dashboard
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

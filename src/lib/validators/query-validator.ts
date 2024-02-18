import { z } from "zod";

// Filter products by fields you want to allow
export const QueryValidator = z.object({
    category: z.string().optional(),
    sort: z.enum(["asc", "desc"]).optional(),
    limit: z.number().optional(), // 1-100
})

// Get and export the typescript type
export type TQueryValidator = z.infer<typeof QueryValidator>
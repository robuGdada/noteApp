import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const subscribeRouter = createTRPCRouter({
  sub: publicProcedure
    .input(z.object({ text: z.string().min(5,{message:"must 5 or more"}) }))
    .query(({ input }) => {
      return {
       pleaseSub:`please do say hello to :${input?.text}`
      };
    }),
});

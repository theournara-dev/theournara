import { z } from 'zod';

export const submitQuizSchema = z.object({
  responses: z.array(
    z.object({
      questionId: z.string().uuid(),
      optionId: z.string().uuid(),
    })
  ),
});

'use server';
/**
 * @fileOverview An AI assistant that generates insights into why two people are a good match.
 *
 * - generateMatchInsight - A function that explains the compatibility between two users.
 * - MatchInsightInput - The input type for the match insight function.
 * - MatchInsightOutput - The return type for the match insight function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MatchInsightInputSchema = z.object({
  userBio: z.string().describe("The current user's biography."),
  matchBio: z.string().describe("The matched user's biography."),
});
export type MatchInsightInput = z.infer<typeof MatchInsightInputSchema>;

const MatchInsightOutputSchema = z.object({
  insight: z.string().describe('A friendly 1-2 sentence explanation of compatibility.'),
});
export type MatchInsightOutput = z.infer<typeof MatchInsightOutputSchema>;

export async function generateMatchInsight(input: MatchInsightInput): Promise<MatchInsightOutput> {
  return matchInsightFlow(input);
}

const matchInsightPrompt = ai.definePrompt({
  name: 'matchInsightPrompt',
  input: { schema: MatchInsightInputSchema },
  output: { schema: MatchInsightOutputSchema },
  prompt: `You are a relationship expert for 'Apna Partner', a dating app in Jharkhand.
  
  Analyze the two biographies below and provide a friendly, encouraging insight (1-2 sentences) about why these two people are a great match. Highlight shared interests, similar vibes, or complementary goals. Use a warm tone.
  
  User 1 Bio: {{{userBio}}}
  User 2 Bio: {{{matchBio}}}
  
  Focus on common ground like their love for Jharkhand culture, specific districts, or hobbies mentioned.`,
});

const matchInsightFlow = ai.defineFlow(
  {
    name: 'matchInsightFlow',
    inputSchema: MatchInsightInputSchema,
    outputSchema: MatchInsightOutputSchema,
  },
  async (input) => {
    const { output } = await matchInsightPrompt(input);
    if (!output) throw new Error("Failed to generate match insight");
    return output;
  }
);

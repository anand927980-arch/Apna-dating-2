'use server';
/**
 * @fileOverview An AI assistant to suggest engaging and personalized conversation starters.
 *
 * - generateConversationStarters - A function that handles the generation of conversation starters.
 * - AiConversationStarterInput - The input type for the generateConversationStarters function.
 * - AiConversationStarterOutput - The return type for the generateConversationStarters function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const ProfileSchema = z.object({
  name: z.string().describe("The user's name."),
  age: z.number().optional().describe("The user's age."),
  gender: z.string().optional().describe("The user's gender."),
  district: z.string().optional().describe("The user's district in Jharkhand."),
  bio: z.string().describe("The user's self-written biography or 'about me' section."),
});

const AiConversationStarterInputSchema = z.object({
  userProfile: ProfileSchema.describe("The current user's profile information."),
  matchProfile: ProfileSchema.describe("The matched user's profile information, based on which conversation starters will be generated."),
});
export type AiConversationStarterInput = z.infer<typeof AiConversationStarterInputSchema>;

// Output Schema
const AiConversationStarterOutputSchema = z.object({
  starters: z.array(z.string()).describe('An array of suggested conversation starters.'),
});
export type AiConversationStarterOutput = z.infer<typeof AiConversationStarterOutputSchema>;

// Wrapper function to call the flow
export async function generateConversationStarters(input: AiConversationStarterInput): Promise<AiConversationStarterOutput> {
  return aiConversationStarterFlow(input);
}

// Define the prompt
const conversationStarterPrompt = ai.definePrompt({
  name: 'conversationStarterPrompt',
  input: { schema: AiConversationStarterInputSchema },
  output: { schema: AiConversationStarterOutputSchema },
  prompt: `You are an AI assistant designed to help users initiate conversations on a dating app. Your goal is to suggest engaging and personalized conversation starters based on the matched user's profile.

Here is the current user's profile:
Name: {{{userProfile.name}}}
Bio: {{{userProfile.bio}}}
District: {{{userProfile.district}}}

Here is the matched user's profile:
Name: {{{matchProfile.name}}}
Age: {{{matchProfile.age}}}
Gender: {{{matchProfile.gender}}}
District: {{{matchProfile.district}}}
Bio: {{{matchProfile.bio}}}

Generate 3-5 unique, friendly, and personalized conversation starters for the current user to send to {{{matchProfile.name}}}. Focus on aspects of their bio or district that could lead to interesting discussions. Avoid generic greetings.

Example Output format:
{
  "starters": [
    "Hey [Match's Name], I noticed you mentioned [something from bio]. That's really interesting! Tell me more about it.",
    "Hi [Match's Name]! Since we both live in [District], do you have any favorite spots around here?",
    "Your bio about [another thing from bio] really caught my eye. What got you into that?"
  ]
}

Now generate the conversation starters based on the provided profiles.`,
});

// Define the flow
const aiConversationStarterFlow = ai.defineFlow(
  {
    name: 'aiConversationStarterFlow',
    inputSchema: AiConversationStarterInputSchema,
    outputSchema: AiConversationStarterOutputSchema,
  },
  async (input) => {
    const { output } = await conversationStarterPrompt(input);
    if (!output) {
      throw new Error('Failed to generate conversation starters.');
    }
    return output;
  }
);

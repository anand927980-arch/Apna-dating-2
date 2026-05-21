'use server';
/**
 * @fileOverview An AI assistant for generating creative and personalized dating profile bios.
 *
 * - generateBioSuggestions - A function that handles the bio generation process.
 * - AiBioAssistantInput - The input type for the generateBioSuggestions function.
 * - AiBioAssistantOutput - The return type for the generateBioSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiBioAssistantInputSchema = z.object({
  age: z.number().optional().describe('The user\'s age.'),
  gender: z.string().optional().describe('The user\'s gender (e.g., "Male", "Female", "Non-binary").'),
  district: z.string().optional().describe('The user\'s district in Jharkhand (e.g., "Chatra", "Ranchi").'),
  interests: z.array(z.string()).optional().describe('A list of the user\'s interests (e.g., ["reading", "hiking"]).'),
  desiredTone: z.string().optional().describe('The desired tone for the bio (e.g., "witty", "serious", "adventurous", "romantic").'),
  bioLength: z.enum(['short', 'medium', 'long']).optional().describe('The desired length of the bio suggestions.'),
  numSuggestions: z.number().min(1).max(5).default(3).optional().describe('The number of bio suggestions to generate (max 5).'),
});
export type AiBioAssistantInput = z.infer<typeof AiBioAssistantInputSchema>;

const AiBioAssistantOutputSchema = z.object({
  bioSuggestions: z.array(z.string()).describe('An array of personalized bio suggestions.'),
});
export type AiBioAssistantOutput = z.infer<typeof AiBioAssistantOutputSchema>;

export async function generateBioSuggestions(input: AiBioAssistantInput): Promise<AiBioAssistantOutput> {
  return aiBioAssistantFlow(input);
}

const aiBioAssistantPrompt = ai.definePrompt({
  name: 'aiBioAssistantPrompt',
  input: { schema: AiBioAssistantInputSchema },
  output: { schema: AiBioAssistantOutputSchema },
  prompt: `You are an AI assistant for the 'Apna Partner' dating app, specializing in crafting engaging and personalized bios for users. Your goal is to help users attract suitable matches by highlighting their personality and interests, with a focus on the Jharkhand region, especially districts like Chatra.

Generate {{{numSuggestions}}} unique and creative bio options based on the following user details:

{{#if age}}Age: {{{age}}}
{{/if}}{{#if gender}}Gender: {{{gender}}}
{{/if}}{{#if district}}District: {{{district}}}
{{/if}}{{#if interests}}Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}{{#if desiredTone}}Desired Tone: {{{desiredTone}}}
{{/if}}{{#if bioLength}}Bio Length: {{{bioLength}}}
{{/if}}

Please ensure the bios are:
- Engaging and inviting.
- Reflect the desired tone.
- Incorporate interests subtly or directly.
- Are appropriate for a dating app.
- Are relevant to the Jharkhand context if a district is provided.
- Are approximately {{{bioLength}}} length.

Return the suggestions as a JSON array of strings, as described in the output schema.`,
});

const aiBioAssistantFlow = ai.defineFlow(
  {
    name: 'aiBioAssistantFlow',
    inputSchema: AiBioAssistantInputSchema,
    outputSchema: AiBioAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await aiBioAssistantPrompt(input);
    return output!;
  },
);

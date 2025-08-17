// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant search terms based on the latest ingested data and past search history.
 *
 * - suggestSearchTerms - A function that suggests search terms.
 * - SuggestSearchTermsInput - The input type for the suggestSearchTerms function.
 * - SuggestSearchTermsOutput - The output type for the suggestSearchTerms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSearchTermsInputSchema = z.object({
  latestDataSummary: z
    .string()
    .describe("A summary of the latest data ingested into the system."),
  searchHistory: z
    .string()
    .describe("The user's past search history, as a string."),
});
export type SuggestSearchTermsInput = z.infer<typeof SuggestSearchTermsInputSchema>;

const SuggestSearchTermsOutputSchema = z.object({
  suggestedTerms: z
    .string()
    .describe("A comma-separated list of suggested search terms."),
});
export type SuggestSearchTermsOutput = z.infer<typeof SuggestSearchTermsOutputSchema>;

export async function suggestSearchTerms(
  input: SuggestSearchTermsInput
): Promise<SuggestSearchTermsOutput> {
  return suggestSearchTermsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSearchTermsPrompt',
  input: {schema: SuggestSearchTermsInputSchema},
  output: {schema: SuggestSearchTermsOutputSchema},
  prompt: `你是一个AI助手，根据最新录入的数据和用户过去和搜索历史，为用户推荐搜索词。

最新数据摘要: {{{latestDataSummary}}}
搜索历史: {{{searchHistory}}}

推荐用户可能感兴趣的搜索词。返回以逗号分隔的术语列表。
`, safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_ONLY_HIGH',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
  ],
});

const suggestSearchTermsFlow = ai.defineFlow(
  {
    name: 'suggestSearchTermsFlow',
    inputSchema: SuggestSearchTermsInputSchema,
    outputSchema: SuggestSearchTermsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

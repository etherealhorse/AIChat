import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z  } from 'zod';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools:{
      weather: tool({
        description: 'Get the current weather for a given location.',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for.'),
        }),
        execute: async ({ location }) => {
         const temperature = Math.round(Math.random()*(90-32) + 32);
         return {
          location,
          temperature,
         };
        },
      }),
      convertFahrenheitToCelsius: tool({
        description: 'Convert a temperature from Fahrenheit to Celsius.',
        parameters: z.object({
          temperature: z
            .number()
            .describe('The temperature in fahrenheit to convert'),
        }),
        execute: async ({ temperature }) => {
          const celsius = Math.round((temperature - 32) * (5 / 9));
          return {
            celsius,
          };
        },
      })
    }
  });

  return result.toDataStreamResponse();
}
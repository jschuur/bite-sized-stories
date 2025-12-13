import { updateStory } from '@/db/queries';
import { generateStoryStreaming } from '@/lib/ai';

import { storyRequestSchema } from '@/types';

export async function POST(req: Request) {
  const storyId: string | null = null;

  try {
    const body = await req.json();
    const storyRequest = storyRequestSchema.safeParse(body);

    if (!storyRequest.success)
      return new Response(
        JSON.stringify({
          error: 'Invalid request parameters',
          details: storyRequest.error.issues,
        }),
        { status: 400 }
      );

    const result = await generateStoryStreaming(storyRequest.data);

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error generating story:', error);

    // Update story status to 'error' if we have a storyId
    if (storyId)
      await updateStory({
        id: storyId,
        errorMessage: error instanceof Error ? error.message : 'Failed to generate story',
        status: 'error',
      });

    return new Response(JSON.stringify({ error: 'Failed to generate story' }), { status: 500 });
  }
}

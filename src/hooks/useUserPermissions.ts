import { authClient } from '@/lib/authClient';
import { canCreateAudio, canCreateStory, isAdmin } from '@/lib/permissions';

export default function useUserPermissions() {
  const { data: session, isPending } = authClient.useSession();

  return {
    isPending,
    isAdmin: isAdmin(session?.user),
    canCreateStory: canCreateStory(session?.user),
    canCreateAudio: canCreateAudio(session?.user),
  };
}

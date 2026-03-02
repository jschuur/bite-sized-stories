type UserPermissionFields = {
  isAdmin?: boolean | null;
  canCreateStory?: boolean | null;
  canCreateAudio?: boolean | null;
};

export function canCreateStory(user: UserPermissionFields | undefined | null): boolean {
  return !!user?.isAdmin || !!user?.canCreateStory;
}

export function canCreateAudio(user: UserPermissionFields | undefined | null): boolean {
  return !!user?.isAdmin || !!user?.canCreateAudio;
}

export function isAdmin(user: UserPermissionFields | undefined | null): boolean {
  return !!user?.isAdmin;
}

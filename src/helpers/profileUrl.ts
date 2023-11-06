import { type Profile } from "@prisma/client";

export const profileUrl = (profile: Profile | undefined | null): string => {
  if (!profile) return '';
  if (!profile.name) {
    return `/profile/${profile.userId}`;
  }

  // the profile slug is the profile name with spaces replaced by underscores
  const slug = profile.name.replace(/ /g, '_');
  
  return `/profile/${slug}`
}
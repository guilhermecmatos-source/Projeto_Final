import { User } from "@/types";

const PROFILES_KEY = "fleet_user_profiles";
const ACTIVE_PROFILE_KEY = "fleet_active_profile_id";

export interface StoredProfile extends User {
  profileId: string;
}

export function getProfiles(): StoredProfile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: StoredProfile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfile(profile: StoredProfile): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profile.profileId);
  localStorage.setItem("user", JSON.stringify(profile));
}

export function addProfile(user: User): StoredProfile {
  const profiles = getProfiles();
  const profile: StoredProfile = {
    ...user,
    profileId: `profile-${Date.now()}`,
  };
  const exists = profiles.some((p) => p.email === user.email);
  if (!exists) {
    profiles.push(profile);
    saveProfiles(profiles);
  }
  setActiveProfile(profile);
  return profile;
}

export function switchProfile(profileId: string): StoredProfile | null {
  const profile = getProfiles().find((p) => p.profileId === profileId);
  if (profile) setActiveProfile(profile);
  return profile ?? null;
}

export function ensureCurrentProfileInList(user: User): void {
  const profiles = getProfiles();
  if (!profiles.some((p) => p.email === user.email)) {
    addProfile(user);
  }
}

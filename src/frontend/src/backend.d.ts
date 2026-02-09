import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type Gender = {
    __kind__: "other";
    other: string;
} | {
    __kind__: "female";
    female: null;
} | {
    __kind__: "male";
    male: null;
};
export interface Message {
    content: string;
    recipient: Principal;
    sender: Principal;
    matchId: MatchId;
    timestamp: Time;
}
export interface Profile {
    age: bigint;
    bio: string;
    photoUrls: Array<string>;
    principal: Principal;
    displayName: string;
    lastMessagePreview?: string;
    interests: Array<string>;
    createdAt: Time;
    isActive: boolean;
    updatedAt: Time;
    interestedIn: Gender;
    gender: Gender;
    timestamp: Time;
    location: string;
    unreadMessagesCount: bigint;
}
export interface Report {
    reportedUser: Principal;
    note: string;
    timestamp: Time;
    reporter: Principal;
    reason: string;
}
export type MatchId = bigint;
export interface UserProfile {
    age: bigint;
    bio: string;
    photoUrls: Array<string>;
    displayName: string;
    interests: Array<string>;
    createdAt: Time;
    isActive: boolean;
    hasAgreedToTerms: boolean;
    updatedAt: Time;
    interestedIn: Gender;
    gender: Gender;
    location: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockUser(blocked: Principal): Promise<void>;
    getBlockedUsers(): Promise<Array<Principal>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(otherUser: Principal): Promise<Array<Message>>;
    getMatches(): Promise<{
        sent: Array<Profile>;
        matches: Array<Profile>;
        received: Array<Profile>;
    }>;
    getRecommendedProfiles(ageMin: bigint | null, ageMax: bigint | null, genderFilter: Gender | null, interestedInFilter: Gender | null, interestTags: Array<string> | null): Promise<Array<Profile>>;
    getReports(): Promise<Array<Report>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeProfile(target: Principal): Promise<void>;
    markConversationAsRead(otherUser: Principal): Promise<void>;
    passProfile(target: Principal): Promise<void>;
    reportUser(reportedUser: Principal, reason: string, note: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(recipient: Principal, content: string): Promise<void>;
    updateProfile(displayName: string, age: bigint, gender: Gender, interestedIn: Gender, location: string, bio: string, interests: Array<string>, photoUrls: Array<string>, confirmTerms: boolean): Promise<void>;
}

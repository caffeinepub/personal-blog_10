import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PostPayload {
    title: string;
    body: string;
    published: boolean;
    tags: Array<string>;
}
export interface PostNonActor {
    title: string;
    body: string;
    published: boolean;
    createdAt: timestamp;
    tags: Array<string>;
    updatedAt: timestamp;
}
export interface UserProfile {
    name: string;
}
export type timestamp = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(payload: PostPayload): Promise<bigint>;
    deletePost(id: bigint): Promise<void>;
    getAllPosts(): Promise<Array<[bigint, PostNonActor]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDraftPosts(): Promise<Array<[bigint, PostNonActor]>>;
    getPost(id: bigint): Promise<PostNonActor>;
    getPublishedPosts(): Promise<Array<[bigint, PostNonActor]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeSamplePosts(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePost(id: bigint, payload: PostPayload): Promise<void>;
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostNonActor, PostPayload } from "../backend.d";
import { useActor } from "./useActor";

export type PostEntry = [bigint, PostNonActor];

// ── Queries ──────────────────────────────────────────────────────────────────

export function usePublishedPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<PostEntry[]>({
    queryKey: ["publishedPosts"],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await actor.getPublishedPosts();
      return [...posts].sort((a, b) => Number(b[1].createdAt - a[1].createdAt));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<PostEntry[]>({
    queryKey: ["allPosts"],
    queryFn: async () => {
      if (!actor) return [];
      const posts = await actor.getAllPosts();
      return [...posts].sort((a, b) => Number(b[1].createdAt - a[1].createdAt));
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePost(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PostNonActor | null>({
    queryKey: ["post", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPost(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PostPayload) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createPost(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: { id: bigint; payload: PostPayload }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updatePost(id, payload);
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id.toString()] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deletePost(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
    },
  });
}

export function useInitializeSamplePosts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not authenticated");
      return actor.initializeSamplePosts();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPosts"] });
      queryClient.invalidateQueries({ queryKey: ["publishedPosts"] });
    },
  });
}

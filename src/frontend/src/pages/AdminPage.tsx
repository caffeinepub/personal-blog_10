import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  FileText,
  Globe,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PostNonActor } from "../backend.d";
import {
  useAllPosts,
  useDeletePost,
  useInitializeSamplePosts,
  useIsAdmin,
} from "../hooks/useQueries";
import { formatPostDate } from "../utils/date";
import { markdownExcerpt } from "../utils/markdown";

export function AdminPage() {
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsAdmin();
  const { data: posts, isLoading: isLoadingPosts } = useAllPosts();
  const deleteMutation = useDeletePost();
  const initSampleMutation = useInitializeSamplePosts();

  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);

  if (isCheckingAdmin) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-3xl text-foreground mb-2">
          Access Denied
        </h1>
        <p className="font-reading text-muted-foreground mb-6">
          You need to be signed in as the admin to access this page.
        </p>
        <Link to="/" className="text-sm font-sans text-accent hover:underline">
          ← Back to blog
        </Link>
      </main>
    );
  }

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleInitSamples = async () => {
    try {
      await initSampleMutation.mutateAsync();
      toast.success("Sample posts loaded");
    } catch {
      toast.error("Failed to initialize sample posts");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <p className="text-sm font-sans uppercase tracking-widest text-accent mb-1">
            Admin
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Manage Posts
          </h1>
        </div>
        <div className="flex gap-2">
          {(!posts || posts.length === 0) && !isLoadingPosts && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInitSamples}
              disabled={initSampleMutation.isPending}
              className="font-sans text-sm"
            >
              {initSampleMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <FileText className="h-3.5 w-3.5 mr-1.5" />
              )}
              Load samples
            </Button>
          )}
          <Link to="/admin/post/new">
            <Button size="sm" className="font-sans text-sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New post
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Posts list */}
      {isLoadingPosts ? (
        <div className="space-y-4">
          {["sk-a", "sk-b", "sk-c", "sk-d"].map((sk) => (
            <div key={sk} className="border border-border rounded p-4">
              <Skeleton className="h-5 w-1/2 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : !posts || posts.length === 0 ? (
        <AdminEmptyState
          onLoadSamples={handleInitSamples}
          isLoading={initSampleMutation.isPending}
        />
      ) : (
        <div className="space-y-3">
          {posts.map(([id, post], i) => (
            <AdminPostRow
              key={id.toString()}
              id={id}
              post={post}
              index={i}
              onDelete={() => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">
              Delete this post?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-reading text-base">
              This action cannot be undone. The post will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="font-sans text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              Delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

interface AdminPostRowProps {
  id: bigint;
  post: PostNonActor;
  index: number;
  onDelete: () => void;
}

function AdminPostRow({ id, post, index, onDelete }: AdminPostRowProps) {
  const excerpt = markdownExcerpt(post.body, 80);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="group flex items-start justify-between gap-4 border border-border rounded bg-card p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display text-base font-semibold text-foreground truncate">
            {post.title}
          </h3>
          {post.published ? (
            <Badge
              variant="secondary"
              className="font-sans text-xs shrink-0 text-green-700 bg-green-50 border-green-200"
            >
              <Globe className="h-2.5 w-2.5 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="font-sans text-xs shrink-0 text-muted-foreground bg-secondary/50"
            >
              Draft
            </Badge>
          )}
        </div>
        <p className="text-sm font-reading text-muted-foreground truncate">
          {excerpt}
        </p>
        <time className="text-xs font-sans text-muted-foreground/60 mt-1 block">
          {formatPostDate(post.createdAt)}
          {post.tags.length > 0 && (
            <span className="ml-2 text-muted-foreground/40">
              {post.tags.join(", ")}
            </span>
          )}
        </time>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Link to="/admin/post/$id/edit" params={{ id: id.toString() }}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function AdminEmptyState({
  onLoadSamples,
  isLoading,
}: { onLoadSamples: () => void; isLoading: boolean }) {
  return (
    <div className="text-center py-16 border border-dashed border-border rounded">
      <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-4" />
      <h2 className="font-display text-xl text-foreground mb-2">
        No posts yet
      </h2>
      <p className="font-reading text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
        Start by creating your first post, or load some sample content to get
        started.
      </p>
      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadSamples}
          disabled={isLoading}
          className="font-sans text-sm"
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
          Load samples
        </Button>
        <Link to="/admin/post/new">
          <Button size="sm" className="font-sans text-sm">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Write first post
          </Button>
        </Link>
      </div>
    </div>
  );
}

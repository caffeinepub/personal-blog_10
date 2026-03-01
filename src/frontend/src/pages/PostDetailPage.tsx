import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { usePost } from "../hooks/useQueries";
import { formatPostDate } from "../utils/date";
import { renderMarkdown } from "../utils/markdown";

export function PostDetailPage() {
  const { id } = useParams({ from: "/post/$id" });
  const postId = BigInt(id);

  const { data: post, isLoading, isError } = usePost(postId);

  if (isLoading) {
    return <PostSkeleton />;
  }

  if (isError || !post) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="font-display text-3xl text-foreground mb-3">
          Post not found
        </h1>
        <p className="font-reading text-muted-foreground mb-8">
          This post may have been removed or doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-sans text-accent hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all posts
        </Link>
      </main>
    );
  }

  const htmlContent = renderMarkdown(post.body);

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors mb-10 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All posts
        </Link>
      </motion.div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="font-sans text-xs px-2 py-0.5 rounded-full bg-secondary/70 text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-3">
          <time className="text-sm font-sans text-muted-foreground">
            {formatPostDate(post.createdAt)}
          </time>
          {post.updatedAt > post.createdAt && (
            <>
              <span className="text-border">·</span>
              <span className="text-xs font-sans text-muted-foreground/70">
                Updated {formatPostDate(post.updatedAt)}
              </span>
            </>
          )}
        </div>

        <div className="mt-8 h-px bg-border" />
      </motion.header>

      {/* Post body */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div
          className="prose-blog"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled markdown renderer
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </motion.div>

      {/* Footer nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-16 pt-8 border-t border-border"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to all posts
        </Link>
      </motion.div>
    </main>
  );
}

function PostSkeleton() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Skeleton className="h-4 w-20 mb-10" />
      <Skeleton className="h-3 w-16 mb-4" />
      <Skeleton className="h-9 w-full mb-2" />
      <Skeleton className="h-9 w-3/4 mb-4" />
      <Skeleton className="h-3 w-28 mb-10" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </main>
  );
}

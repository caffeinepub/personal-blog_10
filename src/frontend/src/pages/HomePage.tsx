import { Skeleton } from "@/components/ui/skeleton";
import { PenLine } from "lucide-react";
import { motion } from "motion/react";
import { PostCard } from "../components/PostCard";
import { usePublishedPosts } from "../hooks/useQueries";

export function HomePage() {
  const { data: posts, isLoading } = usePublishedPosts();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 sm:mb-16"
      >
        {/* Decorative large initial */}
        <div
          className="relative mb-2 select-none pointer-events-none"
          aria-hidden
        >
          <span className="font-display text-[7rem] sm:text-[9rem] font-black leading-none text-accent/[0.07] absolute -top-6 -left-3">
            N
          </span>
        </div>

        <p className="text-sm font-sans uppercase tracking-widest text-accent mb-4">
          Notebook
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-foreground leading-tight">
          Thoughts, snippets,
          <br className="hidden sm:block" /> and ideas.
        </h1>
        <p className="mt-4 font-reading text-lg text-muted-foreground max-w-lg">
          A personal space for writing — articles, fragments, and whatever is on
          my mind.
        </p>
        <div className="mt-6 h-px bg-border" />
      </motion.div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-8">
          {["sk-a", "sk-b", "sk-c"].map((sk) => (
            <div key={sk} className="py-8 border-b border-border">
              <Skeleton className="h-3 w-20 mb-3 rounded-full" />
              <Skeleton className="h-7 w-3/4 mb-2" />
              <Skeleton className="h-3 w-28 mb-3" />
              <Skeleton className="h-4 w-full mb-1.5" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : !posts || posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {posts.map(([id, post], i) => (
            <PostCard key={id.toString()} id={id} post={post} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="py-20 text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-5">
        <PenLine className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="font-display text-2xl text-foreground mb-2">
        Nothing here yet
      </h2>
      <p className="font-reading text-base text-muted-foreground max-w-xs mx-auto">
        The first post is waiting to be written. Check back soon.
      </p>
    </motion.div>
  );
}

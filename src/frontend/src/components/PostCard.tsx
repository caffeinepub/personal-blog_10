import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { PostNonActor } from "../backend.d";
import { formatPostDate } from "../utils/date";
import { markdownExcerpt } from "../utils/markdown";

interface PostCardProps {
  id: bigint;
  post: PostNonActor;
  index?: number;
}

export function PostCard({ id, post, index = 0 }: PostCardProps) {
  const excerpt = markdownExcerpt(post.body, 155);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        to="/post/$id"
        params={{ id: id.toString() }}
        className="group block"
      >
        <div className="py-8 border-b border-border last:border-0">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="font-sans text-xs px-2 py-0.5 rounded-full bg-secondary/70 text-muted-foreground hover:bg-accent/20 hover:text-accent transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="font-display text-2xl font-semibold text-foreground group-hover:text-accent transition-colors leading-tight mb-2">
            {post.title}
          </h2>

          {/* Date */}
          <time className="block text-sm text-muted-foreground font-sans mb-3">
            {formatPostDate(post.createdAt)}
          </time>

          {/* Excerpt */}
          {excerpt && (
            <p className="font-reading text-base leading-relaxed text-muted-foreground/90 line-clamp-3">
              {excerpt}
            </p>
          )}

          {/* Read more */}
          <span className="inline-block mt-3 text-sm font-sans text-accent opacity-0 group-hover:opacity-100 transition-opacity">
            Read more →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

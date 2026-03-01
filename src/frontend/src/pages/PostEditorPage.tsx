import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCreatePost,
  useIsAdmin,
  usePost,
  useUpdatePost,
} from "../hooks/useQueries";
import { renderMarkdown } from "../utils/markdown";

interface EditorProps {
  mode: "new" | "edit";
}

export function PostEditorPage({ mode }: EditorProps) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const postId = mode === "edit" && params.id ? BigInt(params.id) : null;

  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: existingPost, isLoading: loadingPost } = usePost(postId);

  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Populate form for edit mode
  useEffect(() => {
    if (mode === "edit" && existingPost && !initialized) {
      setTitle(existingPost.title);
      setBody(existingPost.body);
      setTags(existingPost.tags);
      setPublished(existingPost.published);
      setInitialized(true);
    }
    if (mode === "new" && !initialized) {
      setInitialized(true);
    }
  }, [mode, existingPost, initialized]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagsInput.trim().toLowerCase().replace(/^#/, "");
      if (tag && !tags.includes(tag)) {
        setTags((prev) => [...prev, tag]);
      }
      setTagsInput("");
    }
    if (e.key === "Backspace" && tagsInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload = {
      title: title.trim(),
      body: body.trim(),
      published,
      tags,
    };

    try {
      if (mode === "new") {
        await createMutation.mutateAsync(payload);
        toast.success("Post created");
      } else if (postId !== null) {
        await updateMutation.mutateAsync({ id: postId, payload });
        toast.success("Post updated");
      }
      navigate({ to: "/admin" });
    } catch {
      toast.error("Failed to save post");
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (checkingAdmin) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display text-3xl text-foreground mb-2">
          Access Denied
        </h1>
        <p className="font-reading text-muted-foreground mb-6">
          You need admin access to write posts.
        </p>
        <Link to="/" className="text-sm font-sans text-accent hover:underline">
          ← Back to blog
        </Link>
      </main>
    );
  }

  if (mode === "edit" && loadingPost) {
    return <EditorSkeleton />;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to admin
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Page title */}
        <div className="mb-8">
          <p className="text-sm font-sans uppercase tracking-widest text-accent mb-1">
            {mode === "new" ? "New post" : "Edit post"}
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {mode === "new" ? "Write something" : title || "Untitled"}
          </h1>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="font-sans text-sm text-foreground/80"
            >
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is this about?"
              className="font-display text-xl h-12 bg-card border-border focus-visible:ring-accent/50"
              autoFocus
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label
              htmlFor="tags"
              className="font-sans text-sm text-foreground/80"
            >
              Tags{" "}
              <span className="text-muted-foreground font-normal">
                — press Enter or comma to add
              </span>
            </Label>
            <div className="flex flex-wrap gap-1.5 p-2 border border-border rounded bg-card min-h-10 focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent/60 transition-colors">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 font-sans text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-foreground transition-colors"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              <input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "writing, ideas, tech…" : ""}
                className="flex-1 min-w-20 text-sm font-sans bg-transparent outline-none placeholder:text-muted-foreground/40 py-0.5 px-1"
              />
            </div>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="body"
                className="font-sans text-sm text-foreground/80"
              >
                Content{" "}
                <span className="text-muted-foreground font-normal">
                  — markdown supported
                </span>
              </Label>
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
              >
                {preview ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </>
                )}
              </button>
            </div>

            {preview ? (
              <div className="min-h-72 border border-border rounded bg-card p-5">
                {body ? (
                  <div
                    className="prose-blog"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled markdown renderer
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
                  />
                ) : (
                  <p className="font-reading text-muted-foreground/50 italic">
                    Nothing to preview yet…
                  </p>
                )}
              </div>
            ) : (
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  "Start writing…\n\nMarkdown is supported:\n# Heading\n**bold**, _italic_, `code`\n\n> blockquote"
                }
                className="font-reading text-base min-h-72 bg-card border-border focus-visible:ring-accent/50 leading-relaxed resize-y"
              />
            )}
          </div>

          {/* Published toggle */}
          <div className="flex items-center justify-between py-3 px-4 rounded border border-border bg-card">
            <div>
              <p className="font-sans text-sm font-medium text-foreground">
                Publish
              </p>
              <p className="font-sans text-xs text-muted-foreground mt-0.5">
                {published
                  ? "Visible to everyone"
                  : "Only visible to you as draft"}
              </p>
            </div>
            <Switch
              checked={published}
              onCheckedChange={setPublished}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="font-sans text-sm"
            >
              {isSaving && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              )}
              {isSaving ? "Saving…" : published ? "Publish post" : "Save draft"}
            </Button>
            <Link to="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="font-sans text-sm text-muted-foreground"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

function EditorSkeleton() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Skeleton className="h-4 w-24 mb-8" />
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </main>
  );
}

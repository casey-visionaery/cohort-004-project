import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

type Comment = {
  id: number;
  body: string;
  createdAt: string;
  userId: number;
  userName: string;
  userAvatarUrl: string | null;
};

export function LessonComments({
  comments,
  currentUserId,
  canDeleteAny,
}: {
  comments: Comment[];
  currentUserId: number;
  canDeleteAny: boolean;
}) {
  const addFetcher = useFetcher({ key: "add-lesson-comment" });
  const deleteFetcher = useFetcher({ key: "delete-lesson-comment" });
  const [body, setBody] = useState("");

  const isPosting = addFetcher.state !== "idle";

  useEffect(() => {
    if (addFetcher.state === "idle" && addFetcher.data?.success) {
      setBody("");
    }
  }, [addFetcher.state, addFetcher.data]);

  return (
    <div className="mt-8 border-t pt-8">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
        <MessageSquare className="size-5" />
        Comments{comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      <div className="mb-8 space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((comment) => {
            const canDelete =
              canDeleteAny || comment.userId === currentUserId;
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {comment.userAvatarUrl ? (
                    <img
                      src={comment.userAvatarUrl}
                      alt={comment.userName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium">
                      {comment.userName[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">
                    {comment.body}
                  </p>
                </div>
                {canDelete && (
                  <deleteFetcher.Form method="post" className="shrink-0">
                    <input
                      type="hidden"
                      name="intent"
                      value="delete-comment"
                    />
                    <input
                      type="hidden"
                      name="commentId"
                      value={comment.id}
                    />
                    <button
                      type="submit"
                      className="p-1 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </deleteFetcher.Form>
                )}
              </div>
            );
          })
        )}
      </div>

      <addFetcher.Form method="post" className="space-y-3">
        <input type="hidden" name="intent" value="add-comment" />
        <Textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ask a question or share a thought..."
          rows={3}
          maxLength={2000}
        />
        <Button type="submit" disabled={!body.trim() || isPosting}>
          {isPosting ? "Posting..." : "Post Comment"}
        </Button>
      </addFetcher.Form>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

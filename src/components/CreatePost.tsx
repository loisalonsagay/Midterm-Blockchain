import { useState } from "react";
import { Contract } from "ethers";
import "../styles/CreatePost.css";

interface CreatePostProps {
  contract: Contract | null;
  onPostCreated: () => void;
}

export function CreatePost({ contract, onPostCreated }: CreatePostProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !imageUrl.trim() || !caption.trim()) return;

    try {
      setError("");
      setIsLoading(true);
      const tx = await contract.createPost(imageUrl, caption);
      await tx.wait();
      setImageUrl("");
      setCaption("");
      onPostCreated();
    } catch (err: unknown) {
      console.error("Failed to create post:", err);
      if (typeof err === "object" && err !== null && "message" in err) {
        setError(
          (err as { message?: string }).message || "Failed to create post",
        );
      } else {
        setError("Failed to create post");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-post">
      <h2>📸 Create a Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Image URL (e.g., https://picsum.photos/600/400)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          disabled={isLoading}
          required
        />
        <textarea
          placeholder="Write your caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={isLoading}
          required
        />
        {error && <div className="error-text">{error}</div>}
        <button
          type="submit"
          disabled={isLoading || !imageUrl.trim() || !caption.trim()}
        >
          {isLoading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}

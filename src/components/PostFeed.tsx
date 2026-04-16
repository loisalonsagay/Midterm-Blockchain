import { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import { Post } from '../types';
import '../styles/PostFeed.css';

interface PostFeedProps {
  contract: Contract | null;
  account: string;
  refreshTrigger: number;
}

export function PostFeed({ contract, account, refreshTrigger }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEarnings, setUserEarnings] = useState('0');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const loadPosts = useCallback(async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      const allPosts = await contract.getAllPosts();
      setPosts(allPosts);

      // Load earnings if connected
      if (account) {
        const earnings = await contract.totalEarnedByUser(account);
        setUserEarnings((Number(earnings) / 1e18).toFixed(6));

        // Load liked posts
        const liked = new Set<number>();
        for (let i = 0; i < allPosts.length; i++) {
          const hasLiked = await contract.checkLiked(i, account);
          if (hasLiked) liked.add(i);
        }
        setLikedPosts(liked);
      }
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [contract, account]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts, refreshTrigger]);

  const handleLike = async (postId: number) => {
    if (!contract) return;

    try {
      setError('');
      const tx = await contract.likePost(postId, {
        value: '100000000000000', // 0.0001 ETH in wei
      });
      await tx.wait();
      await loadPosts();
    } catch (err: any) {
      console.error('Failed to like post:', err);
      if (err.reason) {
        setError(`Error: ${err.reason}`);
      } else {
        setError(err.message || 'Failed to like post');
      }
    }
  };

  if (isLoading) return <div className="loading">Loading posts...</div>;

  return (
    <div className="post-feed-container">
      {account && (
        <div className="earnings-banner">
          <span className="earnings-label">💰 You've Earned:</span>
          <span className="earnings-amount">{userEarnings} ETH</span>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="post-feed">
        {posts.length === 0 ? (
          <p className="no-posts">No posts yet. Be the first to create one!</p>
        ) : (
          posts.map((post, idx) => (
            <div key={idx} className="post-card">
              <div className="post-header">
                <p className="author">
                  {post.creator === account ? (
                    <>
                      <span className="you-badge">YOU</span>{' '}
                      {post.creator.slice(0, 6)}...{post.creator.slice(-4)}
                    </>
                  ) : (
                    <>
                      {post.creator.slice(0, 6)}...{post.creator.slice(-4)}
                    </>
                  )}
                </p>
                <span className="timestamp">
                  {new Date(Number(post.timestamp) * 1000).toLocaleDateString()}
                </span>
              </div>

              <img src={post.imageUrl} alt="Post" className="post-image" />

              <p className="caption">{post.caption}</p>

              <div className="post-footer">
                <div className="post-stats">
                  <span className="likes">❤️ {Number(post.likes)} likes</span>
                  <span className="earnings">💰 {(Number(post.totalEarned) / 1e18).toFixed(6)} ETH</span>
                </div>

                {account && post.creator !== account ? (
                  <button
                    className={`like-button ${likedPosts.has(idx) ? 'liked' : ''}`}
                    onClick={() => handleLike(idx)}
                    disabled={likedPosts.has(idx)}
                  >
                    {likedPosts.has(idx) ? '❤️ Liked' : '🤍 Like (0.0001 ETH)'}
                  </button>
                ) : account && post.creator === account ? (
                  <button className="like-button your-post" disabled>
                    ✌️ Your Post
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
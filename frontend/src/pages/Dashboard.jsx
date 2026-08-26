import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import PostCard from '../components/PostCard.jsx';
import PostModal from '../components/PostModal.jsx';
import { Plus, ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const fetchPosts = async (pageNumber) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.posts.list(pageNumber, 6);
      // Backend returns: { posts: [...], pagination: { page, limit, total, totalPages } }
      setPosts(response.posts || []);
      setPage(response.pagination?.page || 1);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleCreateClick = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await api.posts.delete(postId);
      // Re-fetch posts. If the current page is empty now (and not page 1), go back a page
      const newPage = (posts.length === 1 && page > 1) ? page - 1 : page;
      setPage(newPage);
      fetchPosts(newPage);
    } catch (err) {
      alert(err.message || 'Failed to delete post');
    }
  };

  const handleSavePost = async (data) => {
    if (editingPost) {
      const id = editingPost.id || editingPost._id;
      await api.posts.update(id, data.title, data.content);
    } else {
      await api.posts.create(data.title, data.content);
    }
    fetchPosts(page);
  };

  return (
    <main className="container" style={{ paddingBottom: '40px' }}>
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1>My Posts</h1>
          <p className="dashboard-subtitle">Create, read, update, and delete your thoughts</p>
        </div>
        <button onClick={handleCreateClick} className="btn btn-primary">
          <Plus size={18} />
          <span>New Post</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '30px' }}>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="empty-state-icon" />
          <h2 className="empty-state-title">No posts found</h2>
          <p className="empty-state-subtitle">Get started by creating your very first post!</p>
          <button onClick={handleCreateClick} className="btn btn-primary">
            <Plus size={18} />
            <span>Create First Post</span>
          </button>
        </div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard
                key={post.id || post._id}
                post={post}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={editingPost}
        onSave={handleSavePost}
      />
    </main>
  );
}

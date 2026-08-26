import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';

export default function PostModal({ isOpen, onClose, post, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset fields or load existing post data on open/change
  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
    } else {
      setTitle('');
      setContent('');
    }
    setError('');
  }, [post, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Both title and content are required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({ title, content });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content">
        <div className="modal-header">
          <h2>{post ? 'Edit Post' : 'Create New Post'}</h2>
          <button onClick={onClose} className="modal-close" title="Close modal">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              className="form-input"
              style={{ minHeight: '150px', resize: 'vertical' }}
              placeholder="Write something amazing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Send size={16} />
              <span>{loading ? 'Saving...' : 'Save Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

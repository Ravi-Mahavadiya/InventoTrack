import React from 'react';
import { Pencil, Trash2, Calendar } from 'lucide-react';

export default function PostCard({ post, onEdit, onDelete }) {
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <article className="glass-card post-card">
      <div>
        <h3 className="post-title">{post.title}</h3>
        <p className="post-content">{post.content}</p>
      </div>
      
      <div className="post-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} />
          <span>{formatDate(post.createdAt || post.created_at)}</span>
        </div>
        <div className="post-actions">
          <button 
            onClick={() => onEdit(post)} 
            className="icon-btn icon-btn-edit" 
            title="Edit Post"
          >
            <Pencil size={16} />
          </button>
          <button 
            onClick={() => onDelete(post.id || post._id)} 
            className="icon-btn icon-btn-delete" 
            title="Delete Post"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

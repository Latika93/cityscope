import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState(post.replies || []);
  const [reactions, setReactions] = useState({
    likes: post.likes?.length || 0,
    dislikes: post.dislikes?.length || 0,
    userReaction: post.likes?.includes(user?.id) ? 'like' : 
                  post.dislikes?.includes(user?.id) ? 'dislike' : null
  });
  const [loading, setLoading] = useState(false);

  const postTypeConfig = {
    recommendation: { icon: '🌟', color: 'bg-yellow-100 text-yellow-800', label: 'Recommendation' },
    help: { icon: '🤝', color: 'bg-red-100 text-red-800', label: 'Help Request' },
    update: { icon: '📢', color: 'bg-blue-100 text-blue-800', label: 'Update' },
    event: { icon: '🎉', color: 'bg-green-100 text-green-800', label: 'Event' }
  };

  const config = postTypeConfig[post.postType] || postTypeConfig.update;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReaction = async (type) => {
    try {
      setLoading(true);
      let response;
      
      if (reactions.userReaction === type) {
        // Remove reaction
        response = await postsAPI.removeReaction(post._id);
      } else {
        // Add reaction
        response = await postsAPI.addReaction(post._id, { type });
      }
      
      setReactions({
        likes: response.data.likes,
        dislikes: response.data.dislikes,
        userReaction: response.data.userReaction
      });
    } catch (error) {
      console.error('Error updating reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setLoading(true);
      const response = await postsAPI.addReply(post._id, { content: replyContent });
      setReplies([...replies, response.data.reply]);
      setReplyContent('');
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(post._id);
        onPostDeleted(post._id);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const loadReplies = async () => {
    if (!showReplies && replies.length === 0) {
      try {
        const response = await postsAPI.getReplies(post._id);
        setReplies(response.data);
      } catch (error) {
        console.error('Error loading replies:', error);
      }
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className="post-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {post.author?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <Link 
              to={`/profile/${post.author?.username}`}
              className="font-semibold text-gray-900 hover:text-primary-600"
            >
              {post.author?.username}
            </Link>
            <p className="text-sm text-gray-500">
              {post.author?.location} • {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon} {config.label}
          </span>
          {user?.id === post.author?._id && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 p-1"
              title="Delete post"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <div className="mt-3">
            <img
              src={post.imageUrl}
              alt="Post attachment"
              className="max-w-full h-auto rounded-lg border"
            />
          </div>
        )}
      </div>

      {/* Location */}
      <div className="mb-4">
        <span className="inline-flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {post.location}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <button
            onClick={() => handleReaction('like')}
            disabled={loading}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
              reactions.userReaction === 'like'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{reactions.likes}</span>
          </button>

          {/* Dislike Button */}
          <button
            onClick={() => handleReaction('dislike')}
            disabled={loading}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
              reactions.userReaction === 'dislike'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            <span>{reactions.dislikes}</span>
          </button>

          {/* Reply Button */}
          <button
            onClick={loadReplies}
            className="flex items-center space-x-1 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{replies.length}</span>
          </button>
        </div>

        <Link
          to={`/post/${post._id}`}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          View Details
        </Link>
      </div>

      {/* Replies Section */}
      {showReplies && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Reply Form */}
          <form onSubmit={handleReply} className="mb-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {replyContent.length}/280 characters
                  </span>
                  <button
                    type="submit"
                    disabled={loading || !replyContent.trim() || replyContent.length > 280}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Replies List */}
          <div className="space-y-3">
            {replies.map((reply, index) => (
              <div key={index} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {reply.author?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {reply.author?.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard; 
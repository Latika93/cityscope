import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    location: ''
  });

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUserProfile(username);
      setProfile(response.data.user);
      setPosts(response.data.posts);
      setEditData({
        bio: response.data.user.bio || '',
        location: response.data.user.location || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      bio: profile.bio || '',
      location: profile.location || ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await usersAPI.updateUserProfile(username, editData);
      setProfile(response.data.user);
      updateUser(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchProfile}
          className="btn-primary mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-3xl">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                <p className="text-gray-600">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="input-field inline-block w-48"
                    />
                  ) : (
                    profile.location
                  )}
                </p>
              </div>
              
              {isOwnProfile && (
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="btn-primary"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="btn-secondary"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
              {isEditing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="input-field resize-none h-20"
                  maxLength={160}
                />
              ) : (
                <p className="text-gray-900">
                  {profile.bio || 'No bio yet.'}
                </p>
              )}
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">
                  {editData.bio.length}/160 characters
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>
                <strong className="text-gray-900">{posts.length}</strong> posts
              </span>
              <span>
                Joined {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {isOwnProfile ? 'Your Posts' : `${profile.username}'s Posts`}
        </h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
            </p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile; 
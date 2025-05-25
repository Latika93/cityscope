import React, { useState } from 'react';
import { postsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    content: '',
    postType: 'update',
    location: user?.location || '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const postTypes = [
    { value: 'recommendation', label: '🌟 Recommendation', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'help', label: '🤝 Help Request', color: 'bg-red-100 text-red-800' },
    { value: 'update', label: '📢 Update', color: 'bg-blue-100 text-blue-800' },
    { value: 'event', label: '🎉 Event', color: 'bg-green-100 text-green-800' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.content.trim()) {
      setError('Please enter some content');
      setLoading(false);
      return;
    }

    if (formData.content.length > 280) {
      setError('Content must be 280 characters or less');
      setLoading(false);
      return;
    }

    try {
      const response = await postsAPI.createPost(formData);
      onPostCreated(response.data.post);
      
      // Reset form
      setFormData({
        content: '',
        postType: 'update',
        location: user?.location || '',
        image: null
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const characterCount = formData.content.length;
  const isOverLimit = characterCount > 280;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Share with your neighborhood
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Post Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are you sharing?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {postTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleChange({ target: { name: 'postType', value: type.value } })}
                className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  formData.postType === type.value
                    ? `${type.color} border-current`
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="What's happening in your neighborhood?"
            className={`input-field resize-none h-24 ${isOverLimit ? 'border-red-500' : ''}`}
            rows={3}
          />
          <div className="flex justify-between items-center mt-1">
            <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
              {characterCount}/280 characters
            </span>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Where is this about?"
            className="input-field"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add Image (optional)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="btn-secondary cursor-pointer inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Choose Image
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={removeImage}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            )}
          </div>
          
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs h-32 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || isOverLimit || !formData.content.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Posting...
              </>
            ) : (
              'Share Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost; 
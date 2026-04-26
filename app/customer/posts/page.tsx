'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input, Textarea, Select, Alert, LoadingSpinner } from '../../components/ui';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { CustomerPost } from '../../lib/api';
import { useToggleCustomerPostLike, useAddCustomerPostComment, useDeleteCustomerPostComment } from '../../hooks/useApi';

export default function CustomerPostsPage() {
  const [posts, setPosts] = useState<CustomerPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<CustomerPost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [commentContent, setCommentContent] = useState<{ [key: number]: string }>({});

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Question' as const,
  });

  const toggleLikeMutation = useToggleCustomerPostLike();
  const addCommentMutation = useAddCustomerPostComment();
  const deleteCommentMutation = useDeleteCustomerPostComment();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCustomerPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts. Please check your connection and try again.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setSubmitting(true);
      const newPost = await api.createCustomerPost(formData);
      setPosts([newPost, ...posts]);
      setShowCreateForm(false);
      setFormData({ title: '', content: '', category: 'Question' });
      toast.success('Post created successfully!');
    } catch (err: any) {
      console.error('Failed to create post:', err);
      toast.error(err?.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPost = (post: CustomerPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      category: post.category,
    });
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setSubmitting(true);
      const updatedPost = await api.updateCustomerPost(editingPost.id.toString(), formData);
      setPosts(posts.map(post => post.id === editingPost.id ? updatedPost : post));
      setEditingPost(null);
      setFormData({ title: '', content: '', category: 'Question' });
      toast.success('Post updated successfully!');
    } catch (err: any) {
      console.error('Failed to update post:', err);
      toast.error(err?.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteCustomerPost(postId.toString());
      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete post. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'Question' });
    setEditingPost(null);
    setShowCreateForm(false);
  };

  const handleToggleLike = async (postId: number) => {
    try {
      await toggleLikeMutation.mutateAsync(postId.toString());
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleAddComment = async (postId: number) => {
    const content = commentContent[postId]?.trim();
    if (!content) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await addCommentMutation.mutateAsync({
        postId: postId.toString(),
        content,
      });
      setCommentContent(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteCommentMutation.mutateAsync(commentId.toString());
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const toggleComments = (postId: number) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
          <p className="text-gray-600 mt-2">Manage your questions, discussions, reviews, and suggestions</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          + Create Post
        </Button>
      </div>

      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      {(showCreateForm || editingPost) && (
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>
            <Button
              onClick={resetForm}
              variant="outline"
              size="sm"
            >
              ✕
            </Button>
          </div>

          <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="Enter a descriptive title for your post"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                options={[
                  { value: 'Question', label: 'Question - Ask for help or information' },
                  { value: 'Discussion', label: 'Discussion - Share ideas and opinions' },
                  { value: 'Review', label: 'Review - Share your experience' },
                  { value: 'Suggestion', label: 'Suggestion - Propose improvements' },
                ]}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                required
                placeholder="Write your post content here..."
                rows={6}
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.content.length}/1000 characters
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? <LoadingSpinner size="sm" /> : (editingPost ? 'Update Post' : 'Create Post')}
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-6">
        {posts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-4">Start by creating your first post</p>
            <Button onClick={() => setShowCreateForm(true)} className="bg-green-600 hover:bg-green-700">
              Create Your First Post
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        post.category === 'Question' ? 'bg-blue-100 text-blue-800' :
                        post.category === 'Discussion' ? 'bg-green-100 text-green-800' :
                        post.category === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {post.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        post.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        👍 {post.likeCount || 0} Likes
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {post.commentCount || 0} Comments
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleToggleLike(post.id)}
                        variant="outline"
                        size="sm"
                        disabled={toggleLikeMutation.isPending}
                        className="hover:bg-red-50 hover:border-red-200"
                      >
                        👍 Like
                      </Button>
                      <Button
                        onClick={() => toggleComments(post.id)}
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50 hover:border-blue-200"
                      >
                        💬 Comment
                      </Button>
                      <Button
                        onClick={() => handleEditPost(post)}
                        variant="outline"
                        size="sm"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        onClick={() => handleDeletePost(post.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {/* Existing Comments */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <h5 className="text-sm font-medium text-gray-700">Comments:</h5>
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {comment.user?.name || 'Anonymous'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  disabled={deleteCommentMutation.isPending}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                >
                                  🗑️
                                </Button>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Form */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentContent[post.id] || ''}
                          onChange={(e) => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={addCommentMutation.isPending || !commentContent[post.id]?.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                        >
                          {addCommentMutation.isPending ? <LoadingSpinner size="sm" /> : 'Post'}
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
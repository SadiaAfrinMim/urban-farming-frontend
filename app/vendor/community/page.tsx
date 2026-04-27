'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Input, Textarea, Select, Alert, LoadingSpinner } from '../../components/ui';
import ProfileImage from '../../components/ProfileImage';
import api, { CommunityPost } from '../../lib/api';
import { useCommunityPosts, useCreateCommunityPost } from '../../hooks/useApi';
import { useToggleLike, useAddComment, useDeleteComment } from '../../hooks/useApi';
import toast from 'react-hot-toast';

interface VendorCommunityPost extends CommunityPost {
  authorRole?: 'Vendor' | 'Customer' | 'Admin';
}

export default function VendorCommunityPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'tip' | 'question' | 'experience' | 'announcement'>('tip');
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [commentContent, setCommentContent] = useState<{ [key: number]: string }>({});

  const { data: posts, isLoading, error, refetch } = useCommunityPosts();
  const createPostMutation = useCreateCommunityPost();
  const toggleLikeMutation = useToggleLike();
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      toast.error('Please enter some content for your post');
      return;
    }

    try {
      const content = `[${postType.toUpperCase()}] ${postContent}`;
      await createPostMutation.mutateAsync({
        postContent: content
      });

      setPostContent('');
      setShowCreateForm(false);
      refetch();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const getPostTypeInfo = (content: string) => {
    if (content.startsWith('[TIP]')) {
      return { type: 'tip', label: '💡 Farming Tip', color: 'bg-green-100 text-green-800' };
    }
    if (content.startsWith('[QUESTION]')) {
      return { type: 'question', label: '❓ Question', color: 'bg-blue-100 text-blue-800' };
    }
    if (content.startsWith('[EXPERIENCE]')) {
      return { type: 'experience', label: '🌱 Experience', color: 'bg-purple-100 text-purple-800' };
    }
    if (content.startsWith('[ANNOUNCEMENT]')) {
      return { type: 'announcement', label: '📢 Announcement', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { type: 'general', label: '💬 General', color: 'bg-gray-100 text-gray-800' };
  };

  const getCleanContent = (content: string) => {
    return content.replace(/^\[(TIP|QUESTION|EXPERIENCE|ANNOUNCEMENT)\]\s*/, '');
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
      toast.error('কমেন্ট লিখুন');
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
    if (!confirm('এই কমেন্ট মুছে ফেলবেন?')) {
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

  // Real-time polling for updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Poll every 10 seconds for real-time updates

    return () => clearInterval(interval);
  }, [refetch]);



  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">🌱 Vendor Community</h1>
          <p className="text-gray-600 mt-2">Connect with other vendors, share experiences, and grow together</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          + Share Knowledge
        </Button>
      </div>

      {error && (
        <Alert type="error" className="mb-6">
          Failed to load community posts. Please try again.
        </Alert>
      )}

      {showCreateForm && (
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Share Your Knowledge</h2>
            <Button
              onClick={() => setShowCreateForm(false)}
              variant="outline"
              size="sm"
            >
              ✕
            </Button>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Type *
              </label>
              <Select
                value={postType}
                onChange={(e) => setPostType(e.target.value as any)}
                options={[
                  { value: 'tip', label: '💡 Farming Tip - Share helpful advice' },
                  { value: 'question', label: '❓ Question - Ask for help from the community' },
                  { value: 'experience', label: '🌱 Experience - Share your farming journey' },
                  { value: 'announcement', label: '📢 Announcement - Important updates or news' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                required
                placeholder={
                  postType === 'tip' ? 'Share a helpful farming tip...' :
                  postType === 'question' ? 'Ask your question here...' :
                  postType === 'experience' ? 'Tell us about your farming experience...' :
                  'Share your announcement...'
                }
                rows={6}
                maxLength={1000}
              />
              <p className="text-sm text-gray-500 mt-1">
                {postContent.length}/1000 characters
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createPostMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createPostMutation.isPending ? <LoadingSpinner size="sm" /> : '📤 Share Post'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="p-6">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-2xl font-bold text-blue-600">{posts?.length || 0}</div>
            <div className="text-gray-600">Total Posts</div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-6">
            <div className="text-2xl mb-2">💡</div>
            <div className="text-2xl font-bold text-green-600">
              {posts?.filter(p => p.postContent?.startsWith('[TIP]')).length || 0}
            </div>
            <div className="text-gray-600">Tips Shared</div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-6">
            <div className="text-2xl mb-2">❓</div>
            <div className="text-2xl font-bold text-yellow-600">
              {posts?.filter(p => p.postContent?.startsWith('[QUESTION]')).length || 0}
            </div>
            <div className="text-gray-600">Questions Asked</div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-6">
            <div className="text-2xl mb-2">🌱</div>
            <div className="text-2xl font-bold text-purple-600">
              {posts?.filter(p => p.postContent?.startsWith('[EXPERIENCE]')).length || 0}
            </div>
            <div className="text-gray-600">Experiences Shared</div>
          </div>
        </Card>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts && posts.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your farming wisdom!</p>
            <Button onClick={() => setShowCreateForm(true)} className="bg-green-600 hover:bg-green-700">
              Create First Post
            </Button>
          </Card>
        ) : (
          posts?.map((post) => {
            const postInfo = getPostTypeInfo(post.postContent || '');
            const cleanContent = getCleanContent(post.postContent || '');

            return (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                       <ProfileImage user={post.user || {}} size="md" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{post.user?.name || 'Anonymous'}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{(() => {
                            try {
                              const date = new Date(post.postDate || post.createdAt);
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                            } catch (error) {
                              return 'Invalid Date';
                            }
                          })()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${postInfo.color}`}>
                            {postInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {cleanContent}
                    </p>
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleLike(post.id)}
                        disabled={toggleLikeMutation.isPending}
                        className="hover:bg-red-50 hover:border-red-200"
                      >
                        👍 Like
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleComments(post.id)}
                        className="hover:bg-blue-50 hover:border-blue-200"
                      >
                        💬 Comment
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
                                    {(() => {
                                      try {
                                        const date = new Date(comment.createdAt);
                                        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                                      } catch (error) {
                                        return 'Invalid Date';
                                      }
                                    })()}
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
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              📝 Share Tip
            </Button>

            <Button
              onClick={() => {
                setPostType('question');
                setShowCreateForm(true);
              }}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              ❓ Ask Question
            </Button>

            <Button
              onClick={() => {
                setPostType('experience');
                setShowCreateForm(true);
              }}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              🌱 Share Experience
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
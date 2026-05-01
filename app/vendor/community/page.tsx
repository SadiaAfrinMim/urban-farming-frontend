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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section with Enhanced Design */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 dark:from-emerald-600 dark:via-teal-700 dark:to-cyan-800 rounded-3xl opacity-10 blur-3xl"></div>
          <div className="relative bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/20 dark:border-gray-700/20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-2xl">
                    🌱
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Vendor Community
                  </h1>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
                  Connect with fellow vendors, exchange groundbreaking farming insights, and cultivate success together in our vibrant community ecosystem.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">💡 Knowledge Sharing</span>
                  <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">🤝 Collaboration</span>
                  <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-medium">📈 Growth</span>
                </div>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🚀 Share Your Wisdom
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert type="error" className="mb-6">
            Failed to load community posts. Please try again.
          </Alert>
        )}

        {showCreateForm && (
          <div className="mb-8">
            <div className="bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/30 dark:border-gray-700/30">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    📝
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Share Your Expertise
                  </h2>
                </div>
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  size="sm"
                  className="rounded-full w-10 h-10 p-0 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-colors"
                >
                  ✕
                </Button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-8">
                <div>
                  <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Post Category
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'tip', label: '💡 Farming Tip', desc: 'Share helpful advice', color: 'from-green-500 to-emerald-600' },
                      { value: 'question', label: '❓ Question', desc: 'Ask for help from the community', color: 'from-blue-500 to-cyan-600' },
                      { value: 'experience', label: '🌱 Experience', desc: 'Share your farming journey', color: 'from-purple-500 to-pink-600' },
                      { value: 'announcement', label: '📢 Announcement', desc: 'Important updates or news', color: 'from-orange-500 to-red-600' },
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setPostType(option.value as any)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          postType === option.value
                            ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg`
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className={`text-sm ${postType === option.value ? 'text-white/90' : 'text-gray-600'}`}>
                          {option.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    Your Message
                  </label>
                  <div className="relative">
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
                      rows={8}
                      maxLength={1000}
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50 focus:border-emerald-400 dark:focus:border-emerald-500 resize-none text-base leading-relaxed bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <div className="absolute bottom-4 right-4 text-sm text-gray-400 dark:text-gray-500 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-lg">
                      {postContent.length}/1000
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={createPostMutation.isPending}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {createPostMutation.isPending ? <LoadingSpinner size="sm" /> : '🚀 Share Post'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="px-8 py-3 rounded-2xl border-2 border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                👥
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                {posts?.length || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Total Posts</div>
            </div>
          </div>

          <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                💡
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {posts?.filter(p => p.postContent?.startsWith('[TIP]')).length || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Tips Shared</div>
            </div>
          </div>

          <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                ❓
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                {posts?.filter(p => p.postContent?.startsWith('[QUESTION]')).length || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Questions Asked</div>
            </div>
          </div>

          <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                🌱
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {posts?.filter(p => p.postContent?.startsWith('[EXPERIENCE]')).length || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">Experiences Shared</div>
            </div>
          </div>
        </div>

        {/* Enhanced Posts List */}
        <div className="space-y-8">
          {posts && posts.length === 0 ? (
            <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-16 shadow-xl border border-gray-200/20 dark:border-gray-700/20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-6xl mx-auto mb-6 animate-bounce">
                🌱
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                No posts yet
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Be the first to share your farming wisdom and help build our vibrant community!
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🚀 Create First Post
              </Button>
            </div>
          ) : (
            posts?.map((post) => {
              const postInfo = getPostTypeInfo(post.postContent || '');
              const cleanContent = getCleanContent(post.postContent || '');

              return (
                <div key={post.id} className="bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-4">
                       <div className="relative">
                         <ProfileImage user={post.user || {}} size="lg" />
                         <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center text-xs">
                           👨‍🌾
                         </div>
                       </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{post.user?.name || 'Anonymous'}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            📅 {(() => {
                              try {
                                const date = new Date(post.postDate || post.createdAt);
                                return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                              } catch (error) {
                                return 'Invalid Date';
                              }
                            })()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${postInfo.color} shadow-sm`}>
                            {postInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-lg">
                      {cleanContent}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-6 text-base text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="text-red-500">❤️</span> {post.likeCount || 0} Likes
                      </span>
                      <span className="flex items-center gap-2 font-medium">
                        <span className="text-blue-500">💬</span> {post.commentCount || 0} Comments
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleLike(post.id)}
                        disabled={toggleLikeMutation.isPending}
                        className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl px-4 py-2 font-medium transition-all duration-200"
                      >
                        👍 Like
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleComments(post.id)}
                        className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-xl px-4 py-2 font-medium transition-all duration-200"
                      >
                        💬 Comment
                      </Button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {/* Existing Comments */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comments:</h5>
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {comment.user?.name || 'Anonymous'}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
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
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
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
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/20 dark:border-gray-700/20">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
              >
                📝 Share Tip
              </Button>

              <Button
                onClick={() => {
                  setPostType('question');
                  setShowCreateForm(true);
                }}
                variant="outline"
                className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                ❓ Ask Question
              </Button>

              <Button
                onClick={() => {
                  setPostType('experience');
                  setShowCreateForm(true);
                }}
                variant="outline"
                className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                🌱 Share Experience
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
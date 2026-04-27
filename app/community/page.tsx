'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import api, { CommunityPost } from '../lib/api';
import { Card, Button, LoadingSpinner, Alert } from '../components/ui';
import ProfileImage from '../components/ProfileImage';
import { useToggleLike, useAddComment, useDeleteComment } from '../hooks/useApi';
import toast from 'react-hot-toast';

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [commentContent, setCommentContent] = useState<{ [key: number]: string }>({});
  const [socket, setSocket] = useState<Socket | null>(null);

  const toggleLikeMutation = useToggleLike();
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();

  useEffect(() => {
    fetchPosts();

    // Connect to socket for real-time updates
    const socketConnection = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
    setSocket(socketConnection);

    // Listen for real-time updates
    socketConnection.on('new_post', (newPost: CommunityPost) => {
      setPosts(prev => [newPost, ...prev]);
    });

    socketConnection.on('post_updated', (updatedPost: CommunityPost) => {
      setPosts(prev => prev.map(post =>
        post.id === updatedPost.id ? updatedPost : post
      ));
    });

    socketConnection.on('post_deleted', (postId: number) => {
      setPosts(prev => prev.filter(post => post.id !== postId));
    });

    // Cleanup on unmount
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await api.getCommunityPosts();
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'পোস্ট লিস্ট পেতে সমস্যা হয়েছে');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setPosting(true);
      setError(null);
      await api.createCommunityPost({
        postContent: newPost
      });

      setNewPost('');
      // fetchPosts(); // No need to fetch if socket updates
      toast.success('পোস্ট সফলভাবে তৈরি হয়েছে!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'পোস্ট করা যাচ্ছে না');
    } finally {
      setPosting(false);
    }
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
      // fetchPosts(); // Socket will update
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
      // fetchPosts(); // Socket will update
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
          <h1 className="text-3xl font-bold text-gray-900">🌱 কমিউনিটি ফোরাম</h1>
          <p className="text-gray-600 mt-2">উদ্যানবিদদের সাথে যুক্ত হোন এবং জ্ঞান ভাগ করুন</p>
        </div>
        <Link href="/">
          <Button variant="outline">
            ← হোম পেজে ফিরে যান
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
          <div className="p-6">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              ✍️ নতুন পোস্ট করুন
            </h3>
            <form onSubmit={createPost} className="space-y-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="আপনার উদ্যানের অভিজ্ঞতা, টিপস বা প্রশ্ন লিখুন..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={1000}
              />
              <p className="text-sm text-gray-500">{newPost.length}/1000 অক্ষর</p>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={posting || !newPost.trim()}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 px-6 py-2"
                >
                  {posting ? <LoadingSpinner size="sm" /> : '📝 পোস্ট করুন'}
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="p-6">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-2xl font-bold text-blue-600">{posts?.length || 0}</div>
              <div className="text-gray-600">মোট পোস্ট</div>
            </div>
          </Card>

          <Card className="text-center">
            <div className="p-6">
              <div className="text-2xl mb-2">👍</div>
              <div className="text-2xl font-bold text-green-600">
                {posts?.reduce((total, post) => total + (post.likeCount || 0), 0) || 0}
              </div>
              <div className="text-gray-600">মোট লাইক</div>
            </div>
          </Card>

          <Card className="text-center">
            <div className="p-6">
              <div className="text-2xl mb-2">💬</div>
              <div className="text-2xl font-bold text-yellow-600">
                {posts?.reduce((total, post) => total + (post.commentCount || 0), 0) || 0}
              </div>
              <div className="text-gray-600">মোট কমেন্ট</div>
            </div>
          </Card>

          <Card className="text-center">
            <div className="p-6">
              <div className="text-2xl mb-2">🌱</div>
              <div className="text-2xl font-bold text-purple-600">
                {posts?.filter(p => p.postContent?.includes('[TIP]')).length || 0}
              </div>
              <div className="text-gray-600">উদ্যান টিপস</div>
            </div>
          </Card>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">কোনো পোস্ট পাওয়া যায়নি</h3>
            <p className="text-gray-600 mb-6">প্রথম পোস্ট করে কমিউনিটি শুরু করুন!</p>
            <Button onClick={() => document.querySelector('textarea')?.focus()} className="bg-green-600 hover:bg-green-700">
              ✍️ প্রথম পোস্ট করুন
            </Button>
          </Card>
        ) : (
          posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                       <ProfileImage user={post.user || {}} size="md" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{post.user?.name || 'ব্যবহারকারী'}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{(() => {
                            try {
                              const date = new Date(post.postDate || post.createdAt);
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                            } catch (error) {
                              return 'Invalid Date';
                            }
                          })()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {post.postContent}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        👍 {post.likeCount || 0} লাইক
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {post.commentCount || 0} কমেন্ট
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
                         👍 লাইক
                       </Button>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => toggleComments(post.id)}
                         className="hover:bg-blue-50 hover:border-blue-200"
                       >
                         💬 কমেন্ট
                       </Button>
                     </div>
                   </div>

                   {/* Comments Section */}
                   {showComments[post.id] && (
                     <div className="mt-4 pt-4 border-t border-gray-100">
                       {/* Existing Comments */}
                       {post.comments && post.comments.length > 0 && (
                         <div className="space-y-3 mb-4">
                           <h5 className="text-sm font-medium text-gray-700">কমেন্টস:</h5>
                           {post.comments.map((comment) => (
                             <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                               <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-2">
                                   <span className="text-sm font-medium text-gray-900">
                                     {comment.user?.name || 'ব্যবহারকারী'}
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
                           placeholder="কমেন্ট লিখুন..."
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
                           {addCommentMutation.isPending ? <LoadingSpinner size="sm" /> : 'পোস্ট'}
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

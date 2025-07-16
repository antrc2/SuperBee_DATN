import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../utils/http';
import { Clock, Calendar } from 'lucide-react'; // Import icons
import { marked } from 'marked'; // Import marked library

// Placeholder for default avatar if comment.user.avatar_url is null
const defaultAvatar = 'https://via.placeholder.com/40'; // You can replace this with your actual default avatar path

// Helper function to build a nested comment structure
const buildNestedComments = (comments, parentId = null) => {
  if (!Array.isArray(comments)) {
    console.warn('Comments không phải là mảng:', comments);
    return [];
  }
  return comments
    .filter(comment => comment.parent_id === parentId)
    .map(comment => ({
      ...comment,
      replies: buildNestedComments(comments, comment.id),
    }));
};

// Comment component to render individual comments and their replies
const Comment = ({ comment, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  return (
    <div className={`comment-item ${comment.parent_id ? 'ml-5 border-l pl-3' : ''} mb-4`}>
      <div className="flex items-center gap-3 mb-2">
        {/* Avatar of the comment author */}
        <img
          src={comment.user?.avatar_url || defaultAvatar} // Use avatar_url from API or default
          alt={comment.user?.username || 'Anonymous'}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-bold text-gray-800">{comment.user?.username || 'Anonymous'}</div>
          <div className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div className="text-gray-700 mb-2">{comment.content}</div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-blue-600 hover:text-blue-800"
        >
          {showReplyForm ? 'Hủy' : 'Phản hồi'}
        </button>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-4 flex flex-col gap-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Viết phản hồi..."
            rows="3"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <button
            type="submit"
            className="self-end px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Gửi phản hồi
          </button>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies mt-3">
          {comment.replies.map((reply) => (
            <Comment key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function NewDetail() {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorNews, setErrorNews] = useState(null);
  const [errorComments, setErrorComments] = useState(null);
  const [renderedNewsContent, setRenderedNewsContent] = useState(''); // State để lưu nội dung HTML đã chuyển đổi

  // Effect để lấy chi tiết bài viết và tin tức liên quan
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoadingNews(true);
        setErrorNews(null); // Xóa lỗi trước đó
        const newsResponse = await api.get(`/post/${slug}`);
        const newsData = newsResponse.data?.data;

        if (!newsData) {
          throw new Error('Dữ liệu bài viết không tồn tại');
        }

        setNews(newsData);
        // Chuyển đổi nội dung Markdown sang HTML
        if (newsData.content) {
          setRenderedNewsContent(marked.parse(newsData.content));
        } else {
          setRenderedNewsContent('');
        }

        // Lấy tin tức liên quan nếu có category_id
        if (newsData.category_id) {
          const relatedNewsResponse = await api.get(`/post/bycategory/${newsData.category_id}`);
          const relatedNewsData = relatedNewsResponse.data?.data;

          if (Array.isArray(relatedNewsData)) {
            const filteredRelatedNews = relatedNewsData.filter(
              (item) => item.id !== newsData.id
            );
            setRelatedNews(filteredRelatedNews);
          } else {
            console.warn('Dữ liệu relatedNews không phải là mảng:', relatedNewsData);
            setRelatedNews([]);
          }
        } else {
          setRelatedNews([]);
        }
      } catch (err) {
        console.error('Error fetching news details:', err);
        setErrorNews(`Không thể tải chi tiết bài viết: ${err.message}`);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNewsDetail();
  }, [slug]);

  // Callback function để lấy bình luận cho một bài viết cụ thể
  const fetchComments = useCallback(async (postId) => {
    if (!postId) return;
    try {
      setLoadingComments(true);
      setErrorComments(null); // Xóa lỗi trước đó
      const commentsResponse = await api.get(`/comment/post/${postId}`);
      const commentsData = commentsResponse.data?.data;

      if (Array.isArray(commentsData)) {
        setComments(buildNestedComments(commentsData));
      } else {
        console.warn('Dữ liệu comments không phải là mảng:', commentsData);
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setErrorComments(`Không thể tải bình luận: ${err.message}`);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  // Effect để lấy bình luận khi news.id có sẵn
  useEffect(() => {
    if (news?.id) {
      fetchComments(news.id);
    }
  }, [news?.id, fetchComments]);


  const handleAddComment = async (parentId = null, content) => {
    if (!news?.id) {
      alert('Không thể thêm bình luận vì ID bài viết không có sẵn.');
      return;
    }
    try {
      await api.post(`/comment`, {
        post_id: news.id,
        content: content,
        parent_id: parentId,
      });

      // Sau khi thêm bình luận, gọi lại fetchComments để cập nhật danh sách
      fetchComments(news.id);
      setNewCommentContent(''); // Xóa nội dung bình luận sau khi gửi
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Không thể thêm bình luận. Vui lòng thử lại.');
    }
  };

  const handleRootCommentSubmit = (e) => {
    e.preventDefault();
    if (newCommentContent.trim()) {
      handleAddComment(null, newCommentContent);
    }
  };

  if (loadingNews) {
    return <p className="text-center text-gray-600 py-8">Đang tải bài viết...</p>;
  }

  if (errorNews) {
    return <p className="text-center text-red-600 py-8">{errorNews}</p>;
  }

  if (!news) {
    return <p className="text-center text-gray-600 py-8">Không tìm thấy bài viết.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{news.title}</h1>
          <p className="text-sm text-gray-500 mb-6">
            By {news.author?.username || 'Unknown Author'} on{' '}
            {new Date(news.created_at).toLocaleDateString('vi-VN')}
          </p>
          {news.image_thumbnail_url && (
            <img
              src={news.image_thumbnail_url}
              alt={news.title}
              className="w-full h-auto rounded-lg mb-6 object-cover"
            />
          )}
          {/* Sử dụng renderedNewsContent đã được chuyển đổi từ Markdown sang HTML */}
          <div
            className="prose prose-lg text-gray-700 max-w-none" // max-w-none để không giới hạn chiều rộng prose
            dangerouslySetInnerHTML={{ __html: renderedNewsContent }}
          ></div>

          {/* Comment Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bình luận</h2>
            <form onSubmit={handleRootCommentSubmit} className="flex flex-col gap-4 mb-8">
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                rows="5"
                required
                className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <button
                type="submit"
                className="self-end px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Gửi bình luận
              </button>
            </form>

            <div className="comment-list">
              {loadingComments ? (
                <p className="text-center text-gray-600">Đang tải bình luận...</p>
              ) : errorComments ? (
                <p className="text-center text-red-600">{errorComments}</p>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <Comment key={comment.id} comment={comment} onReply={handleAddComment} />
                ))
              ) : (
                <p className="text-gray-600">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
              )}
            </div>
          </div>
        </div>

        {/* Related News Sidebar */}
        {relatedNews.length > 0 && (
          <aside className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Tin tức liên quan
              </h3>
              <div className="space-y-4">
                {relatedNews.map((article) => (
                  <Link
                    key={article.id}
                    to={`/news/${article.slug}`}
                    className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors items-start"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={article.image_thumbnail_url || "/placeholder.svg"}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{article.title}</h4>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(article.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
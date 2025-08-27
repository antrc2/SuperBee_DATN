import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../utils/http";
import { Clock, Calendar, MessageSquare, Send } from "lucide-react";
import { marked } from "marked";
import LoadingDomain from "../../../components/Loading/LoadingDomain";

const defaultAvatar = "https://via.placeholder.com/40";

const buildNestedComments = (comments, parentId = null) => {
  if (!Array.isArray(comments)) return [];
  return comments
    .filter((comment) => comment.parent_id === parentId)
    .map((comment) => ({
      ...comment,
      replies: buildNestedComments(comments, comment.id),
    }));
};

// Comment component
const Comment = ({ comment, onReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    }
  };

  return (
    <div
      className={`comment-item flex gap-4 ${
        comment.parent_id ? "ml-6 md:ml-10" : ""
      }`}
    >
      <img
        src={comment.user?.avatar_url || defaultAvatar}
        alt={comment.user?.username || "Anonymous"}
        className="w-10 h-10 rounded-full object-cover mt-1 flex-shrink-0"
      />
      <div className="flex-1">
        <div className="bg-input rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-primary">
              {comment.user?.username || "Anonymous"}
            </span>
            <span className="text-xs text-secondary">
              {new Date(comment.created_at).toLocaleString("vi-VN")}
            </span>
          </div>
          <p className="text-secondary text-[15px]">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-secondary mt-2">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="font-semibold text-accent hover:brightness-125 transition"
          >
            {showReplyForm ? "Hủy" : "Phản hồi"}
          </button>
        </div>

        {showReplyForm && (
          <form
            onSubmit={handleReplySubmit}
            className="mt-3 flex flex-col gap-3"
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Viết phản hồi của bạn..."
              rows="2"
              required
              className="w-full p-2 text-sm bg-background text-input border-themed rounded-md focus:border-hover focus:ring-1 focus:ring-accent/50 outline-none transition"
            ></textarea>
            <button
              type="submit"
              className="action-button action-button-primary !w-auto self-end !py-1.5 !px-4 !text-sm"
            >
              Gửi
            </button>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function NewDetail() {
  // === LOGIC KHÔNG THAY ĐỔI ===
  const { category, slug } = useParams();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorNews, setErrorNews] = useState(null);
  const [errorComments, setErrorComments] = useState(null);
  const [renderedNewsContent, setRenderedNewsContent] = useState("");

  const transformVideoTags = (htmlContent) => {
    if (!htmlContent) return "";
    const videoRegex =
      /<img\s[^>]*src="([^"]+\.(?:mp4|webm|ogg))"[^>]*alt="([^"]*)"[^>]*>/gi;
    return htmlContent.replace(
      videoRegex,
      `<video controls preload="metadata" class="w-full rounded-lg my-4" alt="$2"><source src="$1" type="video/mp4">Your browser does not support the video tag.</video>`
    );
  };

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoadingNews(true);
        setErrorNews(null);
        const newsResponse = await api.get(`/post/${slug}`);
        const newsData = newsResponse.data?.data;
        if (!newsData) throw new Error("Dữ liệu bài viết không tồn tại");
        setNews(newsData);
        if (newsData.content) {
          const markdownToHtml = marked.parse(newsData.content);
          const finalContent = transformVideoTags(markdownToHtml);
          setRenderedNewsContent(finalContent);
        } else {
          setRenderedNewsContent("");
        }
        if (newsData.category_id) {
          const relatedNewsResponse = await api.get(
            `/post/bycategory/${newsData.category_id}`
          );
          const relatedNewsData = relatedNewsResponse.data?.data;
          if (Array.isArray(relatedNewsData)) {
            setRelatedNews(
              relatedNewsData.filter((item) => item.id !== newsData.id)
            );
          } else {
            setRelatedNews([]);
          }
        } else {
          setRelatedNews([]);
        }
      } catch (err) {
        setErrorNews(`Không thể tải chi tiết bài viết: ${err.message}`);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNewsDetail();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const fetchComments = useCallback(async (postId) => {
    if (!postId) return;
    try {
      setLoadingComments(true);
      setErrorComments(null);
      const commentsResponse = await api.get(`/comment/post/${postId}`);
      const commentsData = commentsResponse.data?.data;
      if (Array.isArray(commentsData)) {
        setComments(buildNestedComments(commentsData));
      } else {
        setComments([]);
      }
    } catch (err) {
      setErrorComments(`Không thể tải bình luận: ${err.message}`);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    if (news?.id) fetchComments(news.id);
  }, [news?.id, fetchComments]);

  const handleAddComment = async (parentId = null, content) => {
    if (!news?.id) return;
    try {
      await api.post(`/comment`, {
        post_id: news.id,
        content: content,
        parent_id: parentId,
      });
      fetchComments(news.id);
      setNewCommentContent("");
    } catch (err) {
      alert("Không thể thêm bình luận. Vui lòng thử lại.");
    }
  };

  const handleRootCommentSubmit = (e) => {
    e.preventDefault();
    if (newCommentContent.trim()) handleAddComment(null, newCommentContent);
  };
  // === KẾT THÚC LOGIC ===

  if (loadingNews)
    return (
      <p className="text-center text-secondary py-8">
        <LoadingDomain />
      </p>
    );
  if (errorNews)
    return <p className="alert alert-danger mx-auto max-w-7xl">{errorNews}</p>;
  if (!news)
    return (
      <p className="text-center text-secondary py-8">
        Không tìm thấy bài viết.
      </p>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Nội dung bài viết */}
        <div className="flex-1 bg-input p-6 sm:p-8 rounded-xl shadow-themed min-w-0">
          <h1 className=" text-3xl md:text-4xl font-black text-primary mb-2">
            {news.title}
          </h1>
          <div className="flex items-center gap-4 mb-6 text-sm text-secondary">
            <span>By {news.author?.username || "Unknown Author"}</span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              {new Date(news.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>

          {news.image_thumbnail_url && (
            <img
              src={news.image_thumbnail_url}
              alt={news.title}
              className="w-full h-auto max-h-[500px] object-cover rounded-lg mb-6"
            />
          )}

          <div
            className="prose prose-lg max-w-none text-primary prose-headings:font-heading prose-headings:text-primary prose-a:text-accent hover:prose-a:text-highlight prose-strong:text-primary"
            dangerouslySetInnerHTML={{ __html: renderedNewsContent }}
          ></div>

          {/* Khu vực bình luận */}
          <div className="mt-10 pt-8 border-t border-themed">
            <h2 className="font-heading text-2xl font-bold text-primary mb-6 flex items-center gap-3">
              <MessageSquare className="text-accent" /> Bình luận (
              {comments.flat().length})
            </h2>
            <form
              onSubmit={handleRootCommentSubmit}
              className="flex flex-col gap-4 mb-8"
            >
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                rows="4"
                required
                className="w-full p-3 bg-background text-input border-themed rounded-lg focus:border-hover focus:ring-2 focus:ring-accent/50 outline-none transition placeholder-theme"
              ></textarea>
              <button
                type="submit"
                className="action-button action-button-primary !w-auto self-end"
              >
                <Send className="h-4 w-4 mr-2" />
                Gửi bình luận
              </button>
            </form>

            <div className="comment-list space-y-6">
              {loadingComments && (
                <p className="text-center text-secondary">
                  Đang tải bình luận...
                </p>
              )}
              {errorComments && (
                <p className="alert alert-danger">{errorComments}</p>
              )}
              {!loadingComments &&
                !errorComments &&
                (comments.length > 0 ? (
                  comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      onReply={handleAddComment}
                    />
                  ))
                ) : (
                  <p className="text-secondary text-center py-4">
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* Tin tức liên quan */}
        {relatedNews.length > 0 && (
          <aside className="lg:w-80 lg:flex-shrink-0">
            <div className="bg-input rounded-xl p-6 sticky top-8 shadow-themed">
              <h3 className="font-heading text-lg font-bold text-primary mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-accent" />
                Tin tức liên quan
              </h3>
              <div className="space-y-4">
                {relatedNews.map((article) => (
                  <Link
                    key={article.id}
                    to={`/tin-tuc/${category}/${article.slug}`}
                    className="flex space-x-4 group p-2 rounded-lg transition-colors hover:bg-tertiary"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={article.image_thumbnail_url || "/placeholder.svg"}
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-primary line-clamp-2 mb-1 transition-colors group-hover:text-accent">
                        {article.title}
                      </h4>
                      <div className="flex items-center text-xs text-secondary">
                        <Calendar className="h-3 w-3 mr-1.5" />
                        {new Date(article.created_at).toLocaleDateString(
                          "vi-VN"
                        )}
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

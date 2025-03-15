import React, { useState, useEffect } from 'react';
import { Clock, MessageSquare, Reply, User, ChevronDown, ChevronUp, Save, X, Upload, AlertCircle, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import '../css/NewsAddScreen.css';

const NewsDisplay = () => {
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // News article form state
  const [newsArticle, setNewsArticle] = useState({
    title: '',
    type: 'Event',
    read_time: '5 min',
    image: '',
    writer: '',
    content: '',
    status: 1,
    comments: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const articleTypes = ['Event', 'News', 'Update', 'Promotion'];
  const readTimeOptions = ['3 min', '5 min', '8 min', '10 min', '15 min'];

  // Add CSS styles for the toggle buttons and new action buttons
  const styles = `
    .add-news-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .add-news-button:hover {
      background-color: #1e40af;
    }
    
    .view-articles-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      background-color: #4b5563;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .view-articles-button:hover {
      background-color: #374151;
    }
    
    .news-display-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .article-actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }

    .edit-button, .delete-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .edit-button {
      background-color: #0ea5e9;
      color: white;
      border: none;
    }

    .edit-button:hover {
      background-color: #0284c7;
    }

    .delete-button {
      background-color: #ef4444;
      color: white;
      border: none;
    }

    .delete-button:hover {
      background-color: #dc2626;
    }

    .delete-confirm-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .delete-confirm-dialog {
      background-color: white;
      border-radius: 8px;
      padding: 24px;
      width: 400px;
      max-width: 90%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .delete-confirm-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #111827;
    }

    .delete-confirm-message {
      margin-bottom: 24px;
      color: #4b5563;
    }

    .delete-confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .cancel-delete-button {
      padding: 8px 16px;
      background-color: #f3f4f6;
      color: #4b5563;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
    }

    .confirm-delete-button {
      padding: 8px 16px;
      background-color: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
    }

    .confirm-delete-button:hover {
      background-color: #dc2626;
    }
  `;

  useEffect(() => {
    // Fetch all news articles when component mounts
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/news/');
      if (!response.ok) {
        throw new Error('Failed to fetch news articles');
      }
      const data = await response.json();
      
      // Fetch comments for each article
      const articlesWithComments = await Promise.all(
        data.news.map(async (article) => {
          const commentsResponse = await fetch(`http://127.0.0.1:8000/api/news/${article._id}/comments`);
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            return { ...article, comments: commentsData.comments || [] };
          }
          return article;
        })
      );
      
      setNewsArticles(articlesWithComments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = (articleId) => {
    setExpandedComments(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 1:
        return <span className="status-badge published">Published</span>;
      case 0:
        return <span className="status-badge draft">Draft</span>;
      case 2:
        return <span className="status-badge archived">Archived</span>;
      default:
        return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewsArticle({
      ...newsArticle,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validate required fields
    if (!newsArticle.title || !newsArticle.content || !newsArticle.writer) {
      setErrorMessage('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      let response;
      
      if (isEditing) {
        // Update existing article
        response = await fetch(`http://127.0.0.1:8000/api/news/${newsArticle._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newsArticle),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update news article');
        }
        
        setSuccessMessage('News article updated successfully!');
      } else {
        // Create new article
        response = await fetch('http://127.0.0.1:8000/api/news/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newsArticle),
        });
        
        if (!response.ok) {
          throw new Error('Failed to publish news article');
        }
        
        setSuccessMessage('News article published successfully!');
      }
      
      // Reset form after successful submission
      setNewsArticle({
        title: '',
        type: 'Event',
        read_time: '5 min',
        image: '',
        writer: '',
        content: '',
        status: 1,
        comments: []
      });
      
      // Reset editing state
      setIsEditing(false);
      
      // Refresh news articles
      fetchNews();
      
      // Optionally hide the form after successful submission
      setShowAddForm(false);
    } catch (error) {
      setErrorMessage(`Error ${isEditing ? 'updating' : 'publishing'} news article. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAddForm = () => {
    // Reset form when toggling
    if (!showAddForm) {
      setNewsArticle({
        title: '',
        type: 'Event',
        read_time: '5 min',
        image: '',
        writer: '',
        content: '',
        status: 1,
        comments: []
      });
      setIsEditing(false);
    }
    
    setShowAddForm(!showAddForm);
    setSuccessMessage('');
    setErrorMessage('');
  };
  
  const handleEditArticle = (article) => {
    // Set form data with article to edit
    setNewsArticle({
      ...article,
      // Ensure status is a number
      status: typeof article.status === 'number' ? article.status : 1
    });
    setIsEditing(true);
    setShowAddForm(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    // Scroll to top of page
    window.scrollTo(0, 0);
  };
  
  const confirmDeleteArticle = (articleId) => {
    setConfirmDelete(articleId);
  };
  
  const cancelDelete = () => {
    setConfirmDelete(null);
  };
  
  const handleDeleteArticle = async (articleId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/news/${articleId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete news article');
      }
      
      // Remove deleted article from state
      setNewsArticles(prevArticles => 
        prevArticles.filter(article => article._id !== articleId)
      );
      
      // Clear delete confirmation
      setConfirmDelete(null);
      
      // Show temporary success message
      setSuccessMessage('News article deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      setErrorMessage('Error deleting news article. Please try again.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  if (loading && !showAddForm) return <div className="loading-container">Loading news articles...</div>;
  if (error && !showAddForm) return <div className="error-container">Error: {error}</div>;

  return (
    <>
      {/* Inject the CSS styles */}
      <style>{styles}</style>
    
      <div className="news-display-container">
        <div className="news-display-header">
          <div>
            <h1>{isEditing ? 'Edit News Article' : 'News Articles'}</h1>
            <p>{isEditing ? 'Update an existing article' : 'Latest updates and information'}</p>
          </div>
          {showAddForm ? (
            <button 
              onClick={toggleAddForm} 
              className="view-articles-button"
            >
              <Eye size={18} />
              View Articles
            </button>
          ) : (
            <button 
              onClick={toggleAddForm} 
              className="add-news-button"
            >
              <Plus size={18} />
              Add New Article
            </button>
          )}
        </div>

        {/* Global success/error messages for delete operations */}
        {!showAddForm && successMessage && (
          <div className="success-message" style={{ marginBottom: '20px' }}>
            <div className="message-icon">
              <Save size={20} />
            </div>
            {successMessage}
          </div>
        )}

        {!showAddForm && errorMessage && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            <div className="message-icon">
              <AlertCircle size={20} />
            </div>
            {errorMessage}
          </div>
        )}

        {showAddForm ? (
          <div className="news-add-container">
            <div className="news-add-wrapper">
              <div className="news-add-card">
                {/* Header */}
                <div className="news-header">
                  <div>
                    <h1 className="news-title">{isEditing ? 'Edit News Article' : 'Add News Article'}</h1>
                    <p className="news-subtitle">{isEditing ? 'Update and republish this article' : 'Create and publish a new article'}</p>
                  </div>
                </div>

                {/* Success and Error Messages */}
                {successMessage && (
                  <div className="success-message">
                    <div className="message-icon">
                      <Save size={20} />
                    </div>
                    {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="error-message">
                    <div className="message-icon">
                      <AlertCircle size={20} />
                    </div>
                    {errorMessage}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    {/* Title */}
                    <div className="form-field title-field">
                      <label className="form-label">
                        Title <span className="required-mark">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        className="form-input"
                        placeholder="Enter article title"
                        value={newsArticle.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Type */}
                    <div className="form-field">
                      <label className="form-label">
                        Type
                      </label>
                      <select
                        name="type"
                        className="form-select"
                        value={newsArticle.type}
                        onChange={handleInputChange}
                      >
                        {articleTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Read Time */}
                    <div className="form-field">
                      <label className="form-label">
                        Read Time
                      </label>
                      <div className="select-wrapper">
                        <select
                          name="read_time"
                          className="form-select"
                          value={newsArticle.read_time}
                          onChange={handleInputChange}
                        >
                          {readTimeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Writer */}
                    <div className="form-field">
                      <label className="form-label">
                        Writer <span className="required-mark">*</span>
                      </label>
                      <input
                        type="text"
                        name="writer"
                        className="form-input"
                        placeholder="Enter writer name"
                        value={newsArticle.writer}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Status */}
                    <div className="form-field">
                      <label className="form-label">
                        Status
                      </label>
                      <select
                        name="status"
                        className="form-select"
                        value={newsArticle.status}
                        onChange={(e) => setNewsArticle({...newsArticle, status: parseInt(e.target.value)})}
                      >
                        <option value={1}>Published</option>
                        <option value={0}>Draft</option>
                        <option value={2}>Archived</option>
                      </select>
                    </div>

                    {/* Image URL */}
                    <div className="form-field image-url-field">
                      <label className="form-label">
                        Image URL
                      </label>
                      <div className="image-url-wrapper">
                        <input
                          type="text"
                          name="image"
                          className="image-input"
                          placeholder="Enter image URL or upload an image"
                          value={newsArticle.image}
                          onChange={handleInputChange}
                        />
                        <button
                          type="button"
                          className="upload-button"
                        >
                          <Upload size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {newsArticle.image && (
                      <div className="form-field image-preview-field">
                        <label className="form-label">
                          Image Preview
                        </label>
                        <div className="image-preview-wrapper">
                          <div className="image-preview">
                            <img 
                              src={newsArticle.image} 
                              alt="Preview" 
                              className="preview-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/api/placeholder/400/225";
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="form-field content-field">
                      <label className="form-label">
                        Content <span className="required-mark">*</span>
                      </label>
                      <textarea
                        name="content"
                        className="form-textarea"
                        placeholder="Write your article content here..."
                        value={newsArticle.content}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={toggleAddForm}
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`publish-button ${isSubmitting ? 'disabled' : ''}`}
                      disabled={isSubmitting}
                    >
                      <Save size={18} />
                      {isSubmitting 
                        ? (isEditing ? 'Updating...' : 'Publishing...') 
                        : (isEditing ? 'Update Article' : 'Publish Article')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <>
            {newsArticles.length === 0 ? (
              <div className="no-articles">No news articles found.</div>
            ) : (
              <div className="news-articles-list">
                {newsArticles.map((article) => (
                  <div key={article._id} className="news-article-card">
                    <div className="article-header">
                      <div className="article-meta">
                        <span className="article-type">{article.type}</span>
                        <span className="article-read-time">
                          <Clock size={14} />
                          {article.read_time}
                        </span>
                        {getStatusBadge(article.status)}
                        
                        {/* Add Edit/Delete buttons */}
                        <div className="article-actions">
                          <button 
                            className="edit-button"
                            onClick={() => handleEditArticle(article)}
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => confirmDeleteArticle(article._id)}
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                      <h2 className="article-title">{article.title}</h2>
                      <div className="article-author">
                        <span>By {article.writer}</span>
                        {article.created_at && (
                          <span className="article-date">
                            {new Date(article.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {article.image && (
                      <div className="article-image-container">
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/api/placeholder/800/400";
                          }}
                        />
                      </div>
                    )}

                    <div className="article-content">
                      {article.content}
                    </div>

                    <div className="article-footer">
                      <button 
                        className="comments-toggle-button"
                        onClick={() => toggleComments(article._id)}
                      >
                        <MessageSquare size={18} />
                        {article.comments?.length || 0} Comments
                        {expandedComments[article._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>

                    {expandedComments[article._id] && article.comments && (
                      <div className="comments-section">
                        <h3>Comments</h3>
                        
                        {article.comments.length === 0 ? (
                          <div className="no-comments">No comments yet.</div>
                        ) : (
                          <div className="comments-list">
                            {article.comments.map((comment, index) => (
                              <div key={index} className="comment-card">
                                <div className="comment-header">
                                  <div className="comment-user">
                                    <User size={16} />
                                    <span>{comment.user}</span>
                                  </div>
                                </div>
                                <div className="comment-content">
                                  {comment.comment}
                                </div>
                                
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="replies-section">
                                    <h4>Replies</h4>
                                    <div className="replies-list">
                                      {comment.replies.map((reply, replyIndex) => (
                                        <div key={replyIndex} className="reply-card">
                                          <div className="reply-header">
                                            <div className="reply-user">
                                              <User size={14} />
                                              <span>{reply.user}</span>
                                            </div>
                                          </div>
                                          <div className="reply-content">
                                            {reply.comment}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-dialog">
            <div className="delete-confirm-title">Delete Article</div>
            <div className="delete-confirm-message">
              Are you sure you want to delete this article? This action cannot be undone.
            </div>
            <div className="delete-confirm-actions">
              <button 
                className="cancel-delete-button"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={() => handleDeleteArticle(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewsDisplay;
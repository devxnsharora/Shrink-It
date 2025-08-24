// client/src/components/NewLinkModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

function NewLinkModal({ onClose, onLinkCreated }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(true);

  const { token } = useSelector((state) => state.auth);
  const analysisTimeoutRef = useRef(null);

  // Function to check if a string is a valid URL
  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Effect to trigger AI analysis when the user stops typing the URL
  useEffect(() => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    if (validateUrl(originalUrl)) {
      setIsValidUrl(true);
      analysisTimeoutRef.current = setTimeout(() => {
        handleAnalyzeUrl();
      }, 1000); // Wait for 1 second of inactivity
    } else if (originalUrl.trim() !== '') {
      setIsValidUrl(false);
    }

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [originalUrl]);

  // Function to call the backend's analysis endpoint
  const handleAnalyzeUrl = async () => {
    if (!originalUrl) return;
    setIsAnalyzing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post('/api/links/analyze', { url: originalUrl }, config);
      setTitle(response.data.title);
    } catch (err) {
      // Fail silently if analysis doesn't work; user can still type a title
      console.error('URL analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to handle the final form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateUrl(originalUrl)) {
      setIsValidUrl(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const linkData = { originalUrl, title, customSlug };
      const response = await axios.post('/api/links', linkData, config);
      onLinkCreated(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create a New Link</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="originalUrl">Destination URL</label>
            <input
              id="originalUrl"
              type="url"
              placeholder="https://your-long-link.com"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className={!isValidUrl ? 'input-error' : ''}
              autoFocus
              required
            />
            {!isValidUrl && (
              <p className="error-message">Please enter a valid URL (must include http/https).</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title">
              Title {isAnalyzing && <span className="analyzing-indicator">(Analyzing...)</span>}
            </label>
            <input
              id="title"
              type="text"
              placeholder="AI will suggest a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="customSlug">Custom Slug (Optional)</label>
            <div className="custom-slug-input">
              <span className="slug-prefix">chmln.lk/</span>
              <input
                id="customSlug"
                type="text"
                placeholder="my-portfolio"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.replace(/\s/g, '-'))}
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={loading || !isValidUrl}
            >
              {loading ? 'Creating...' : 'Create Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewLinkModal;

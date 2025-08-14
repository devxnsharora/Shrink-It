// client/src/components/NewLinkModal.jsx (Debugging Version)
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

function NewLinkModal({ onClose, onLinkCreated }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const analysisTimeoutRef = useRef(null);

  // --- This is the effect that triggers the analysis ---
  useEffect(() => {
    console.log("1. useEffect for URL analysis triggered. Current URL:", originalUrl);

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
    
    // Check if the input is a plausible URL
    if (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) {
      console.log("2. URL is valid. Scheduling analysis...");
      
      analysisTimeoutRef.current = setTimeout(() => {
        // This function will be called after 1 second of inactivity
        handleAnalyzeUrl();
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [originalUrl]); // This effect ONLY runs when `originalUrl` changes

  const handleAnalyzeUrl = async () => {
    if (!originalUrl) return;
    
    console.log("3. handleAnalyzeUrl called. Setting isAnalyzing to true.");
    setIsAnalyzing(true);
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log("4. Sending POST request to /api/links/analyze with URL:", originalUrl);
      
      const response = await axios.post('/api/links/analyze', { url: originalUrl }, config);
      
      console.log("5. API call successful. Response data:", response.data);
      setTitle(response.data.title);
    } catch (err) {
      console.error("6. ERROR during URL analysis API call:", err);
    } finally {
      console.log("7. Analysis finished. Setting isAnalyzing to false.");
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... your existing handleSubmit logic for creating the link ...
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create a New Link</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* ... */}
          <div className="form-group">
            <label htmlFor="originalUrl">Destination URL</label>
            <input id="originalUrl" type="url"
              placeholder="https://..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              autoFocus required
            />
          </div>
          <div className="form-group">
            <label htmlFor="title">Title {isAnalyzing && <span className="analyzing-indicator">(Analyzing...)</span>}</label>
            <input id="title" type="text"
              placeholder="AI will suggest a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {/* ... your error and actions divs ... */}
        </form>
      </div>
    </div>
  );
}

// Omitted handleSubmit for brevity. Use your existing working code.
export default NewLinkModal;
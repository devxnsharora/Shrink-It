// client/src/components/EditLinkModal.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// It receives the link object to be edited
function EditLinkModal({ linkToEdit, onClose, onLinkUpdated }) {
  const [originalUrl, setOriginalUrl] = useState(linkToEdit.originalUrl);
  const [title, setTitle] = useState(linkToEdit.title);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const updatedData = { originalUrl, title };
      // Use a PUT request to the specific link's endpoint
      const response = await axios.put(`/api/links/${linkToEdit._id}`, updatedData, config);
      
      onLinkUpdated(response.data); // Pass updated link back to dashboard
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Link</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="originalUrl">Destination URL</label>
            <input id="originalUrl" type="url" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} required />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditLinkModal;
// client/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom'; // <-- Make sure Link is imported

// Import All Necessary Components
import NewLinkModal from '../components/NewLinkModal.jsx';
import EditLinkModal from '../components/EditLinkModal.jsx';
import QRCodeModal from '../components/QRCodeModal.jsx';

// Import CSS Module
import styles from './DashboardPage.module.css';

function DashboardPage() {
  // --- STATE MANAGEMENT ---
  const { token } = useSelector((state) => state.auth);
  
  // State for data
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for modals
  const [isNewLinkModalOpen, setIsNewLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  // State for UI feedback
  const [qrCodeData, setQrCodeData] = useState({ url: null, shortUrl: '' });
  const [copySuccess, setCopySuccess] = useState('');

  // --- DATA FETCHING (No change here) ---
  useEffect(() => {
    if (!token) return;
    const fetchLinks = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('/api/links', config);
        setLinks(response.data);
      } catch (err) {
        setError('Failed to fetch your links. Please refresh the page.');
        console.error("Fetch links error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, [token]);

  // --- ACTION HANDLERS (No change here) ---
  const handleLinkCreated = (newLink) => {
    setLinks(currentLinks => [newLink, ...currentLinks]);
  };
  
  const handleLinkUpdated = (updatedLink) => {
    setLinks(currentLinks => 
      currentLinks.map(link => 
        link._id === updatedLink._id ? updatedLink : link
      )
    );
  };

  const handleDelete = async (linkId) => {
    if (window.confirm('Are you sure you want to permanently delete this link?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/api/links/${linkId}`, config);
        setLinks(currentLinks => currentLinks.filter(link => link._id !== linkId));
      } catch (err) {
        alert('Failed to delete the link.');
      }
    }
  };
  
  const handleCopy = (url, linkId) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(linkId);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const handleShowQRCode = async (link) => {
    setIsQrModalOpen(true);
    setQrCodeData({ url: null, shortUrl: link.shortUrl });
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`/api/links/${link._id}/qr`, config);
      setQrCodeData({ url: response.data.qrCodeUrl, shortUrl: link.shortUrl });
    } catch (err) {
      setIsQrModalOpen(false);
      alert("Could not generate QR code.");
    }
  };

  return (
    <>
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <h1>Your Dashboard</h1>
          <button onClick={() => setIsNewLinkModalOpen(true)} className={styles.newLinkButton}>
            + New Link
          </button>
        </div>

        {loading && <p className={styles.loadingText}>Loading your links...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!loading && !error && (
          <div className={styles.linkList}>
            {links.length > 0 ? (
              links.map(link => (
                <div key={link._id} className={styles.linkCard}>
                  {/* ===== THIS IS THE MODIFIED SECTION ===== */}
                  <Link to={`/dashboard/links/${link._id}`} className={styles.linkInfoLink}>
                    <div className={styles.linkInfo}>
                      <h3 className={styles.linkTitle}>{link.title || link.shortUrl.replace(/^https?:\/\//, '')}</h3>
                      <p className={styles.shortUrl}>
                          {link.shortUrl.replace(/^https?:\/\//, '')}
                      </p>
                      <p className={styles.originalUrl}>{link.originalUrl}</p>
                    </div>
                  </Link>
                  {/* ========================================= */}
                  <div className={styles.linkActions}>
                    <button onClick={() => handleCopy(link.shortUrl, link._id)} className={styles.actionButton} title="Copy Short Link">
                      {copySuccess === link._id ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={() => handleShowQRCode(link)} className={styles.actionButton} title="Show QR Code">
                      QR
                    </button>
                    <button onClick={() => setEditingLink(link)} className={styles.actionButton} title="Edit Link">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(link._id)} className={`${styles.actionButton} ${styles.deleteButton}`} title="Delete Link">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <h3>No links yet!</h3>
                <p>Click the "+ New Link" button to create your first short URL.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL RENDERING LOGIC (No change here) --- */}
      {isNewLinkModalOpen && ( <NewLinkModal onClose={() => setIsNewLinkModalOpen(false)} onLinkCreated={handleLinkCreated} /> )}
      {editingLink && ( <EditLinkModal linkToEdit={editingLink} onClose={() => setEditingLink(null)} onLinkUpdated={handleLinkUpdated} /> )}
      {isQrModalOpen && ( <QRCodeModal qrCodeUrl={qrCodeData.url} shortUrl={qrCodeData.shortUrl} onClose={() => setIsQrModalOpen(false)} /> )}
    </>
  );
}

export default DashboardPage;
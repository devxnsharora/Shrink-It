// client/src/components/QRCodeModal.jsx
import React from 'react';

function QRCodeModal({ qrCodeUrl, shortUrl, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        <h2>QR Code</h2>
        <p>Scan this code to open your short link: <strong>{shortUrl}</strong></p>
        <div className="qr-code-container">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt={`QR Code for ${shortUrl}`} />
          ) : (
            <p>Loading QR Code...</p>
          )}
        </div>
        {/* The 'download' attribute prompts the browser to save the file */}
        <a href={qrCodeUrl} download={`qr-code-${shortUrl.split('/').pop()}.png`} className="button-primary">
          Download QR Code
        </a>
      </div>
    </div>
  );
}

export default QRCodeModal;
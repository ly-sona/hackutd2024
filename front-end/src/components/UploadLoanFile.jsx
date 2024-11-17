// src/components/UploadLoanFile.js

import React, { useState } from 'react';
import axios from 'axios';

const UploadLoanFile = ({ loanId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `http://localhost:8000/loan_applications/${loanId}/upload_file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setMessage('File uploaded successfully!');
      onUploadSuccess(response.data); // Notify parent component
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-loan-file">
      <h3>Upload Document for Application ID: {loanId}</h3>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadLoanFile;
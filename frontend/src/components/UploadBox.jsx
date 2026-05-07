import { useState, useRef } from 'react';
import { api } from '../services/api';

export default function UploadBox({ addMessage, setActiveView, showToast }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('📁 UploadBox State:', { isDragging, uploading, uploadProgress, uploadedFiles: uploadedFiles.length });
  }, [isDragging, uploading, uploadProgress, uploadedFiles]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      showToast('Please select PDF files only', 'error');
      return;
    }

    for (const file of pdfFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await api.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        timestamp: new Date().toISOString()
      }]);

      showToast(`Successfully uploaded and indexed: ${file.name}`, 'success');

      // Auto-switch to chat after successful upload
      setTimeout(() => {
        setActiveView('chat');
      }, 1500);

    } catch (error) {
      showToast(`Upload failed: ${error.message}`, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Upload Area */}
      <div
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary bg-opacity-10 scale-105' 
            : 'border-dark-border bg-dark-surface hover:border-primary'
          }
          ${uploading ? 'pointer-events-none opacity-75' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Glassmorphism effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-xs"></div>
        
        <div className="relative p-12 text-center">
          <div className="mb-6">
            <div className={`
              w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300
              ${isDragging ? 'bg-primary scale-110' : 'bg-dark-border'}
            `}>
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-dark-text">
              {uploading ? 'Uploading...' : 'Drop PDF files here'}
            </h3>
            <p className="text-dark-textSecondary">
              {uploading 
                ? 'Processing your document...' 
                : 'or click to browse from your computer'
              }
            </p>
          </div>

          {uploading && (
            <div className="mt-6">
              <div className="w-full bg-dark-border rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-dark-textSecondary mt-2">
                {uploadProgress}% Complete
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Uploaded Documents</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div 
                key={index}
                className="bg-dark-surface border border-dark-border rounded-xl p-4 animate-slide-up"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-dark-text font-medium">{file.name}</p>
                      <p className="text-sm text-dark-textSecondary">
                        {formatFileSize(file.size)} • {new Date(file.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-green-500">Indexed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-dark-surface border border-dark-border rounded-xl p-6">
        <h4 className="text-dark-text font-semibold mb-3">How it works</h4>
        <div className="space-y-2 text-sm text-dark-textSecondary">
          <p>1. Upload PDF documents to index them in the knowledge base</p>
          <p>2. Switch to AI Chat to ask questions about your documents</p>
          <p>3. The AI will retrieve relevant information and provide answers</p>
        </div>
      </div>
    </div>
  );
}

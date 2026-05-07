import React, { useState, useRef, useCallback, useEffect } from 'react';
import { api, ErrorTypes, APIError } from '../services/api';
import { useToast } from '../hooks/useToast';
import { ErrorHandler } from '../components/ErrorHandler';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap,
  Sparkles,
  FolderOpen,
  X
} from 'lucide-react';

export default function UploadPage({ onUploadSuccess, showToast }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Load uploaded files from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('uploadedFiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setUploadedFiles(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load uploaded files:', err);
    }
  }, []);

  // Save uploaded files to localStorage
  const saveUploadedFiles = (files) => {
    try {
      localStorage.setItem('uploadedFiles', JSON.stringify(files));
    } catch (err) {
      console.error('Failed to save uploaded files:', err);
    }
  };

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
      setError(new APIError(ErrorTypes.VALIDATION, 'Please select PDF files only'));
      return;
    }

    // Check file sizes (max 10MB per file)
    const oversizedFiles = pdfFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(new APIError(ErrorTypes.VALIDATION, 'Some files are too large (max 10MB per file)'));
      return;
    }

    for (const file of pdfFiles) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const result = await api.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const fileInfo = {
        name: file.name,
        size: file.size,
        timestamp: new Date().toISOString(),
        uploadResult: result
      };

      setUploadedFiles(prev => {
        const updated = [fileInfo, ...prev];
        saveUploadedFiles(updated);
        return updated;
      });

      if (showToast) {
        showToast(`Successfully uploaded: ${file.name}`, 'success');
      }

      // Auto-switch to chat after successful upload
      if (onUploadSuccess) {
        setTimeout(() => {
          onUploadSuccess();
        }, 1500);
      }

    } catch (err) {
      console.error('Upload failed:', err);
      setError(err);
      if (showToast) {
        showToast(`Upload failed: ${err.message}`, 'error');
      }
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

  const clearError = () => {
    setError(null);
  };

  const retryUpload = () => {
    clearError();
    // Focus back on file input
    fileInputRef.current?.click();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center neon-glow animate-float">
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gradient-primary mb-4">
          Upload Documents
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Build your knowledge base with intelligent PDF indexing and semantic search
        </p>
      </div>
      
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-3xl p-24 transition-all duration-300 cursor-pointer ${
          isDragging 
            ? 'glass-card border-2 border-blue-500/50 bg-blue-500/10 scale-105' 
            : uploading 
              ? 'glass-card border-2 border-gray-600 opacity-60 cursor-not-allowed'
              : 'glass-card border-2 border-dashed border-gray-600 hover:border-blue-500/50 hover:bg-blue-500/5'
        }`}
      >
        {/* Background gradient effect */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          isDragging 
            ? 'bg-gradient-primary opacity-20' 
            : 'bg-premium-dark opacity-40'
        }`}></div>
        
        {/* Enhanced animated particles */}
        {!uploading && !isDragging && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-12 left-16 w-4 h-4 bg-blue-400 rounded-full animate-float opacity-60"></div>
            <div className="absolute top-24 right-24 w-6 h-6 bg-purple-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-12 left-20 w-4 h-4 bg-cyan-400 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-24 right-16 w-8 h-8 bg-purple-500 rounded-full animate-float opacity-30" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-pink-400 rounded-full animate-float opacity-40" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-orange-400 rounded-full animate-float opacity-35" style={{ animationDelay: '2.5s' }}></div>
          </div>
        )}
        
        <div className="relative z-10">
          <div className={`text-9xl mb-8 ${uploading ? 'animate-spin' : isDragging ? 'animate-bounce' : 'animate-float'}`}>
            {uploading ? '⚡' : isDragging ? '📥' : '📄'}
          </div>
          <h3 className={`text-4xl font-bold mb-6 ${
            isDragging ? 'text-blue-400' : uploading ? 'text-gray-400' : 'text-gray-200'
          }`}>
            {uploading ? 'Processing your documents...' : isDragging ? 'Drop files here!' : 'Drop PDF files here'}
          </h3>
          <p className="text-gray-300 text-lg mb-8">
            {uploading 
              ? 'Your documents are being processed with intelligent indexing...' 
              : isDragging
                ? 'Release to upload your files'
                : 'or click to browse from your computer'
            }
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
          
          {uploading && (
            <div className="mt-12">
              <div className="w-full h-6 glass-card rounded-full overflow-hidden mb-8">
                <div 
                  className="h-full bg-gradient-primary transition-all duration-500 ease-out rounded-full animate-pulse neon-glow"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300 font-medium">Processing...</span>
                </div>
                <div className="text-gray-500 text-sm">
                  {Math.round(uploadProgress)}% Complete
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorHandler
          error={error}
          onRetry={retryUpload}
          onDismiss={clearError}
        />
      )}

    {/* Uploaded Files List */}
    {uploadedFiles.length > 0 && (
      <div className="mt-20 animate-slide-in-up">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-200">
            Uploaded Documents
          </h3>
          <div className="glass-card px-4 py-2 rounded-xl">
            <span className="text-sm text-gray-400 font-medium">
              {uploadedFiles.length} files • {uploadedFiles.reduce((total, file) => total + file.size, 0).toLocaleString()} total
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploadedFiles.map((file, index) => (
            <div 
              key={index} 
              className="glass-card rounded-2xl p-6 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-primary/20 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-gray-200 truncate">{file.name}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Instructions */}
    <div className="mt-20 glass-card rounded-3xl p-10 animate-slide-in-up">
      <h4 className="text-2xl font-bold text-gradient-primary mb-8">
        How It Works
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-primary/20 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <h5 className="text-lg font-semibold text-gray-200">Upload Documents</h5>
          </div>
          <p className="text-gray-400 text-sm">
            Upload PDF documents to build your knowledge base with intelligent indexing and semantic search
          </p>
        </div>
        
        <div className="glass-card p-6 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-accent/20 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
            <h5 className="text-lg font-semibold text-gray-200">Ask Questions</h5>
          </div>
          <p className="text-gray-400 text-sm">
            Get detailed answers with context-aware responses and real-time analysis of your documents
          </p>
        </div>
        
        <div className="glass-card p-6 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-primary/20 rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
            <h5 className="text-lg font-semibold text-gray-200">Memory Context</h5>
          </div>
          <p className="text-gray-400 text-sm">
            I remember our conversations for seamless follow-up and continuity across sessions
          </p>
        </div>
        
        <div className="glass-card p-6 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-accent/20 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <h5 className="text-lg font-semibold text-gray-200">Real-time Updates</h5>
          </div>
          <p className="text-gray-400 text-sm">
            Live task execution with streaming responses and progress tracking for immediate feedback
          </p>
        </div>
      </div>
      
      <div className="mt-12 p-8 glass-card rounded-2xl text-center">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center neon-glow animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-lg text-gray-200 font-medium">
              Ready to transform your documents into an intelligent knowledge base
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Upload your first PDF to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}

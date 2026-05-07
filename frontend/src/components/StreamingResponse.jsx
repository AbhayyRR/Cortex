import React, { useState, useEffect } from 'react';

export default function StreamingResponse({ text, isTyping }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text || isTyping) {
      // Simulate streaming effect while typing
      const words = text.split(' ');
      let currentIndex = 0;
      
      setDisplayedText('');
      setIsComplete(false);

      const interval = setInterval(() => {
        if (currentIndex < words.length) {
          setDisplayedText(prev => {
            const newText = prev ? prev + ' ' + words[currentIndex] : words[currentIndex];
            return newText;
          });
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
        }
      }, 50); // 50ms per word for smooth streaming

      return () => clearInterval(interval);
    } else {
      // When not typing, show full text immediately
      setDisplayedText(text);
      setIsComplete(true);
    }
  }, [text, isTyping]);

  // Format the displayed text
  const formatText = (content) => {
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return <h3 key={i} className="text-base font-semibold mt-3 mb-2 text-gray-100">{line.slice(2)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h4 key={i} className="text-sm font-semibold mt-2 mb-1 text-gray-100">{line.slice(3)}</h4>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 mb-1 text-gray-300 list-disc">{line.slice(2)}</li>;
        }
        if (line.startsWith('```')) {
          return (
            <pre key={i} className="bg-gray-900 border border-gray-700 rounded p-2 my-2 text-xs overflow-x-auto">
              <code className="text-gray-100">{line.slice(3)}</code>
            </pre>
          );
        }
        if (line.trim() === '') {
          return <br key={i} />;
        }
        return <p key={i} className="mb-2 text-gray-100 leading-relaxed">{line}</p>;
      });
  };

  return (
    <div className="relative">
      {/* Main content */}
      <div className="text-sm">
        {formatText(displayedText)}
      </div>
      
      {/* Typing cursor */}
      {isTyping && !isComplete && (
        <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse"></span>
      )}
      
      {/* Streaming indicator */}
      {isTyping && (
        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>AI is responding...</span>
        </div>
      )}
    </div>
  );
}

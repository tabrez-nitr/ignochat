'use client'
import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-white dark:bg-zinc-950">
      <div className="flex items-end gap-2">
        {/* Attachment Button (Optional) */}
        <button 
          className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          type="button"
        >
          <Paperclip size={20} />
        </button>

        {/* The Input Field */}
        <div className="relative flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex w-full rounded-md border border-zinc-200 bg-transparent px-3 py-3 text-sm shadow-sm transition-colors 
            placeholder:text-zinc-500 
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 
            disabled:cursor-not-allowed disabled:opacity-50 
            dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300
            resize-none min-h-11 overflow-hidden"
            // Simple auto-resize logic could go here
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors 
          h-11 w-11 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 
          dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90
          disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send size={18} />
        </button>
      </div>
      
      <div className="text-xs text-zinc-500 mt-2 text-center">
        Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-zinc-100 px-1.5 font-mono text-[10px] font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">Enter</kbd> to send
      </div>
    </div>
  );
};

export default ChatInput;
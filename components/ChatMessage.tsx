import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, Sparkles, Image as ImageIcon, Volume2 } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onGenerateImage: (text: string) => void;
  onReadAloud: (text: string) => void;
  isGeneratingImage: boolean;
  isReadingAudio: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onGenerateImage, 
  onReadAloud,
  isGeneratingImage,
  isReadingAudio
}) => {
  const isUser = message.role === 'user';
  
  // A simple heuristic to check if the message likely contains a recipe
  const hasRecipe = !isUser && (
    message.text.toLowerCase().includes('ingredients') && 
    message.text.toLowerCase().includes('instructions')
  );

  // Extract a likely title for image generation prompt
  const getPrompt = (text: string) => {
    const lines = text.split('\n');
    const firstLine = lines.find(l => l.trim().length > 0 && !l.startsWith('#')) || "Delicious food";
    return firstLine.replace(/[\*\#]/g, '').trim();
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm ${
          isUser ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Sparkles size={16} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-2xl px-5 py-4 shadow-sm text-sm md:text-base leading-relaxed overflow-hidden ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-sm' 
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
          }`}>
            {message.image && (
              <div className="mb-4 rounded-lg overflow-hidden max-w-xs border border-white/20">
                <img 
                  src={message.image.startsWith('data:') ? message.image : `data:image/jpeg;base64,${message.image}`} 
                  alt="Content" 
                  className="w-full h-auto object-cover" 
                />
              </div>
            )}
            
            {message.isLoading ? (
               <div className="flex space-x-1 h-6 items-center">
                 <div className="w-2 h-2 bg-current rounded-full typing-dot"></div>
                 <div className="w-2 h-2 bg-current rounded-full typing-dot"></div>
                 <div className="w-2 h-2 bg-current rounded-full typing-dot"></div>
               </div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action Buttons for AI responses */}
          {!isUser && !message.isLoading && hasRecipe && (
            <div className="flex gap-2 ml-1">
              <button 
                onClick={() => onGenerateImage(getPrompt(message.text))}
                disabled={isGeneratingImage}
                className="flex items-center gap-1.5 text-xs font-medium bg-white text-amber-600 px-3 py-1.5 rounded-full border border-amber-200 hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                <ImageIcon size={14} />
                {isGeneratingImage ? 'Drawing...' : 'Visualize Dish'}
              </button>
              
              <button 
                onClick={() => onReadAloud(message.text)}
                disabled={isReadingAudio}
                className="flex items-center gap-1.5 text-xs font-medium bg-white text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-200 hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                <Volume2 size={14} />
                {isReadingAudio ? 'Reading...' : 'Read Recipe'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

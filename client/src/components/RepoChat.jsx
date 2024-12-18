import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader, X, User, Bot, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TypewriterEffect = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 1);

      return () => clearTimeout(timeout);
    } else {
      onComplete?.();
    }
  }, [currentIndex, text]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {displayText}
    </ReactMarkdown>
  );
};

const MessageBubble = ({ message, isTyping, onTypingComplete, onSpeak, isSpeaking }) => {
  const isUser = message.role === 'user';

  const handleSpeakClick = () => {
    if (message.role === 'assistant') {
      onSpeak(message.content);
    }
  };

  return (
    <div className={`flex w-full gap-2 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex flex-shrink-0 ${isUser ? 'mt-auto' : 'mt-1'}`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg">
            {isUser ? (
              <User className="w-5 h-5 text-blue-400" />
            ) : (
              <Bot className="w-5 h-5 text-emerald-400" />
            )}
          </div>
        </div>
        
        <div className={`
          flex-1 px-4 py-3 rounded-2xl shadow-md relative group
          ${isUser ? 
            'bg-gradient-to-br from-blue-600 to-blue-700 text-white mr-1' : 
            'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100 ml-1'
          }
          transition-all duration-200 ease-in-out
          hover:shadow-lg
          ${message.role === 'assistant' ? 'prose prose-invert max-w-none' : ''}
        `}>
          {message.role === 'assistant' && !isUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeakClick}
              className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4 text-blue-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-blue-400" />
              )}
            </Button>
          )}
          
          {message.role === 'assistant' && isTyping ? (
            <TypewriterEffect 
              text={message.content}
              onComplete={() => onTypingComplete?.()}
            />
          ) : message.role === 'assistant' ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <div>{message.content}</div>
          )}

          {message.related_contexts && message.related_contexts.length > 0 && (
            <div className="mt-2 text-xs text-gray-300">
              <strong>Related Files:</strong>
              {message.related_contexts.map((context, idx) => (
                <div key={idx} className="truncate">{context}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RepoChatInterface = ({ owner, repo, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const speechSynthesis = window.speechSynthesis;
  const speechUtterance = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Clean up speech synthesis when component unmounts
    return () => {
      if (speechUtterance.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (text) => {
    // If already speaking, stop
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
  
    // Get available voices
    const voices = speechSynthesis.getVoices();
    
    // Prefer more natural-sounding voices
    const preferredVoices = voices.filter(voice => 
      voice.lang.includes('en') && 
      (voice.name.includes('Natural') || 
       voice.name.includes('Google') || 
       voice.name.includes('Microsoft'))
    );
  
    // Create a new utterance
    speechUtterance.current = new SpeechSynthesisUtterance(text);
    
    // Select a natural-sounding voice if available
    if (preferredVoices.length > 0) {
      speechUtterance.current.voice = preferredVoices[0];
    }
  
    // Adjust speech parameters for more natural sound
    speechUtterance.current.rate = 0.9; // Slightly slower than default
    speechUtterance.current.pitch = 1.0; // Neutral pitch
  
    // Handle speech end
    speechUtterance.current.onend = () => {
      setIsSpeaking(false);
    };
  
    // Handle speech error
    speechUtterance.current.onerror = () => {
      setIsSpeaking(false);
    };
  
    // Start speaking
    setIsSpeaking(true);
    speechSynthesis.speak(speechUtterance.current);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Stop any ongoing speech when sending a new message
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const newMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/repo-chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          owner: owner,
          repo: repo,
          context: messages
        })
      });

      const data = await response.json();
      setIsLoading(false);
      setIsTyping(true);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        isTyping: true,
        related_contexts: data.related_contexts || []
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  return (
    <>
      {!isChatOpen ? (
        <Button 
          onClick={() => setIsChatOpen(true)}
          className="fixed right-6 bottom-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl"
        >
          <MessageCircle className="mr-2" /> Chat about Repo
        </Button>
      ) : (
        <div className="fixed inset-y-[10%] right-[10%] w-[80%] z-50 bg-gray-900/95 flex flex-col rounded-xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
          <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white text-lg">
                Chat: <span className="text-blue-400">{repo}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsChatOpen(false)}
                className="text-gray-300 hover:text-white hover:bg-gray-700/50"
              >
                Minimize
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto">
            <div className="space-y-1">
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  isTyping={message.isTyping}
                  onTypingComplete={() => {
                    setMessages(prev => 
                      prev.map((msg, i) => 
                        i === index ? { ...msg, isTyping: false } : msg
                      )
                    );
                    setIsTyping(false);
                  }}
                  onSpeak={handleSpeak}
                  isSpeaking={isSpeaking}
                />
              ))}
              {isLoading && (
                <div className="flex w-full gap-2 mb-4">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="flex flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                        <Bot className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 shadow-md">
                      <div className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-300">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900 rounded-b-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2 max-w-4xl mx-auto"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this repository..."
                className="flex-1 bg-gray-800/50 border-gray-700/50 focus:border-blue-500/50 focus:ring-blue-500/20 text-white placeholder-gray-400"
                disabled={isLoading || isTyping}
              />
              <Button 
                type="submit" 
                disabled={isLoading || isTyping || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RepoChatInterface;
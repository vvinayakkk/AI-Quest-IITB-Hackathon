import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Book, Github, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/providers/UserProvider';
import ReactMarkdown from 'react-markdown';

// Simulated bot responses
const simulatedResponses = [
  "I can help you with that! Could you provide more details?",
  "Here's what I found that might help...",
  "Based on your question, I would suggest...",
  "Let me break this down for you...",
  "That's an interesting question! Here's my take..."
];

const ChatOption = ({ icon: Icon, title, active, onClick }) => (
  <Card
    onClick={onClick}
    className={`p-4 flex flex-col items-center gap-2 cursor-pointer transition-all
                hover:border-purple-500 hover:bg-purple-900/20
                ${active ? 'border-purple-500 bg-purple-900/30' : 'border-purple-500/20 bg-gray-800/50'}`}
  >
    <Icon className={`h-8 w-8 ${active ? 'text-purple-400' : 'text-purple-500/70'}`} />
    <span className="text-sm font-medium text-gray-200">{title}</span>
  </Card>
);

const Message = ({ message, isBot, user }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex gap-4 ${isBot ? 'justify-start' : 'justify-end'} w-full`}
  >
    {isBot && (
      <Avatar className="h-10 w-10 border-2 border-purple-500/20">
        <AvatarImage src="/android-chrome-512x512.png" alt="AI Genie" />
        <AvatarFallback className="bg-purple-500/10">
          <Bot className="h-6 w-6 text-purple-500" />
        </AvatarFallback>
      </Avatar>
    )}

    <div className={`flex flex-col gap-2 ${isBot ? 'items-start' : 'items-end'} max-w-[80%]`}>
      <div
        className={`px-4 py-2 rounded-lg shadow-md ${
          isBot 
            ? 'bg-gray-800 text-white border border-purple-500/20' 
            : 'bg-purple-600 text-white'
        }`}
      >
        {isBot ? (
          <ReactMarkdown 
            className="text-sm prose prose-invert prose-p:leading-normal prose-p:margin-0
                       prose-headings:margin-top-2 prose-headings:margin-bottom-2
                       prose-ul:margin-top-2 prose-ul:margin-bottom-2
                       prose-li:margin-top-0 prose-li:margin-bottom-0"
          >
            {message}
          </ReactMarkdown>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        )}
      </div>
      <span className="text-xs text-gray-400 px-1">
        {new Date().toLocaleTimeString()}
      </span>
    </div>

    {!isBot && (
      <Avatar className="h-10 w-10 border-2 border-purple-500/20">
        {user?.avatar ? (
          <AvatarImage src={user.avatar} alt={`${user.firstName}'s Avatar`} />
        ) : (
          <User className="h-6 w-6 text-purple-500" />
        )}
        <AvatarFallback className="bg-purple-500/10">
          {`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
        </AvatarFallback>
      </Avatar>
    )}
  </motion.div>
);

const AskGenie = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Genie, your AI assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState('general'); // ['general', 'wiki', 'github', 'pdf']
  const [pdfFile, setPdfFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [documentId, setDocumentId] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text, isBot = false) => {
    setMessages((prev) => [...prev, { text, isBot }]);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('document', file);

      try {
        const response = await fetch('http://127.0.0.1:8000/api/upload-document/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        setDocumentId(data.document_id);
        setPdfFile(file);
        addMessage(`Successfully uploaded PDF: ${file.name}`, true);
        addMessage("You can now ask questions about the PDF content!", true);
      } catch (error) {
        addMessage("Failed to upload PDF. Please try again.", true);
        console.error('Upload error:', error);
      } finally {
        setUploadLoading(false);
      }
    } else {
      addMessage("Please upload a valid PDF file.", true);
    }
  };

  const handleModeChange = (mode) => {
    setChatMode(mode);
    if (mode === 'pdf' && !pdfFile) {
      addMessage("Please upload a PDF file to begin.", true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    addMessage(trimmedInput);
    setInput('');
    setIsLoading(true);

    try {
      if (chatMode === 'pdf' && documentId) {
        const response = await fetch('http://localhost:8000/api/query-document/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_id: documentId,
            question: trimmedInput,
          }),
        });

        if (!response.ok) {
          throw new Error('Query failed');
        }

        const data = await response.json();
        addMessage(data.answer, true);
      } else {
        // Existing simulation for other chat modes
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
        addMessage(response, true);
      }
    } catch (error) {
      addMessage("Sorry, I couldn't process your question. Please try again.", true);
      console.error('Query error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col flex-1 ml-[330px]">
      <div className="h-full flex flex-col max-w-4xl mx-auto w-full p-4 gap-6">
        {/* Chat Options */}
        <div className="grid grid-cols-4 gap-4">
          <ChatOption 
            icon={Bot} 
            title="General Chat" 
            active={chatMode === 'general'}
            onClick={() => setChatMode('general')}
          />
          <ChatOption 
            icon={Book} 
            title="Chat with Wiki" 
            active={chatMode === 'wiki'}
            onClick={() => setChatMode('wiki')}
          />
          <ChatOption 
            icon={Github} 
            title="Chat with GitHub" 
            active={chatMode === 'github'}
            onClick={() => setChatMode('github')}
          />
          <ChatOption 
            icon={FileText} 
            title="Chat with PDF" 
            active={chatMode === 'pdf'}
            onClick={() => handleModeChange('pdf')}
          />
        </div>

        {/* PDF Upload Button */}
        {chatMode === 'pdf' && !pdfFile && (
          <Card className="p-4 flex flex-col items-center gap-4 border-dashed border-2 border-purple-500/40 bg-transparent">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
              disabled={uploadLoading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={uploadLoading}
            >
              {uploadLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload PDF
                </>
              )}
            </Button>
            <p className="text-sm text-gray-400">
              {uploadLoading 
                ? "Processing your PDF..." 
                : "Upload a PDF file to start the conversation"}
            </p>
          </Card>
        )}

        {/* Messages Container */}
        <div className={`flex-1 overflow-hidden bg-gray-900/30 rounded-lg border border-purple-500/20 
                        ${chatMode === 'pdf' && !pdfFile ? 'opacity-50' : ''}`}>
          <div className="h-full overflow-y-auto space-y-4 p-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => (
                <Message 
                  key={index} 
                  message={msg.text}
                  isBot={msg.isBot} 
                  user={user} 
                />
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <Avatar className="h-10 w-10 border-2 border-purple-500/20">
                    <AvatarImage src="/android-chrome-512x512.png" alt="AI Genie" />
                    <AvatarFallback className="bg-purple-500/10">
                      <Bot className="h-6 w-6 text-purple-500" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="p-3 w-fit bg-gray-800 border-purple-500/20">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <Card className="bg-gray-800/50 border-purple-500/20 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                chatMode === 'pdf'
                  ? pdfFile
                    ? 'Ask a question about the uploaded PDF...'
                    : 'Please upload a PDF first...'
                  : `Ask anything about ${chatMode}...`
              }
              disabled={chatMode === 'pdf' && !pdfFile}
              className="min-h-[50px] max-h-[150px] resize-none bg-gray-900/50 
                         border-purple-500/20 text-gray-200 text-sm
                         placeholder:text-gray-500 focus:border-purple-500 
                         focus:ring-1 focus:ring-purple-500 rounded-lg px-3 py-2"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || (chatMode === 'pdf' && !pdfFile)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4
                           shadow-md hover:shadow-lg transition-all"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AskGenie;

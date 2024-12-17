import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SingleFileChatInterface from '@/components/AIChatGithub';

const GithubPage = () => {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState({});
  const [showChat, setShowChat] = useState(false);

  const isTextFile = (filename) => {
    const textExtensions = [
      'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'json', 
      'xml', 'yaml', 'yml', 'ini', 'conf', 'sh', 'bash', 'py', 'rb', 'php',
      'java', 'c', 'cpp', 'h', 'hpp', 'rs', 'go', 'swift', 'kt', 'r', 'sql'
    ];
    const extension = filename.split('.').pop().toLowerCase();
    return textExtensions.includes(extension);
  };

  const fetchRepoData = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFiles([]);
    setSelectedFile(null);
    setFileContent({});

    try {
      const filesResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!filesResponse.ok) throw new Error('Failed to fetch repository files');
      
      const filesData = await filesResponse.json();
      const repoFiles = filesData.tree
        .filter(file => file.type === 'blob' && isTextFile(file.path))
        .map(file => file.path);
      setFiles(repoFiles);

      // Automatically fetch README if it exists
      const readme = repoFiles.find(file => file.toLowerCase().includes('readme.md'));
      if (readme) {
        handleFileSelect(readme);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFileContent = async (path) => {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
      );
      if (!response.ok) throw new Error('Failed to fetch file content');
      const content = await response.text();
      return content;
    } catch (err) {
      throw new Error('Failed to load file content');
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    
    if (!fileContent[file]) {
      try {
        const content = await fetchFileContent(file);
        setFileContent(prevContent => ({ ...prevContent, [file]: content }));
      } catch (err) {
        setError('Failed to load file content');
      }
    }

    // Open chat when file is selected
    setShowChat(true);
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx': return '📄 JavaScript';
      case 'css': return '🎨 CSS';
      case 'html': return '🌐 HTML';
      case 'md': return '📝 Markdown';
      case 'json': return '⚙️ JSON';
      default: return '📄 File';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 text-gray-200">
      <div className="flex items-center gap-4 mb-8">
        <form onSubmit={fetchRepoData} className="flex-1 flex gap-4">
          <Input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Owner"
            className="bg-background/50 border-primary/20 text-black"
          />
          <Input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="Repository"
            className="bg-background/50 border-primary/20 text-black"
          />
          <Button 
            type="submit"
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 text-background"
          >
            {isLoading ? 'Loading...' : 'Fetch Repository'}
          </Button>
        </form>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-lg bg-accent/10 text-accent border border-accent/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Files List */}
        <motion.div 
          layout
          className="col-span-3 bg-gray-800/50 rounded-xl border border-gray-700 p-4"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Repository Files</h2>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file}
                onClick={() => handleFileSelect(file)}
                className={`p-3 rounded-lg cursor-pointer transition-colors 
                  ${selectedFile === file 
                    ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
                    : 'bg-gray-700/30 hover:bg-gray-700/50 text-white/70'}`}
              >
                <span className="mr-2">{getFileIcon(file)}</span>
                {file}
              </div>
            ))}
          </div>
        </motion.div>

        {/* File Contents */}
        <motion.div 
          layout
          className="col-span-9 bg-gray-800/50 rounded-xl border border-gray-700 p-4"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">
            {selectedFile ? `File: ${selectedFile}` : 'Repository Content'}
          </h2>
          <div className="bg-gray-900/50 p-4 overflow-x-auto h-[calc(100vh-280px)] overflow-y-auto">
            {selectedFile ? (
              <SyntaxHighlighter
                language={selectedFile.split('.').pop()}
                style={vscDarkPlus}
                className="text-sm"
              >
                {fileContent[selectedFile] || 'Loading...'}
              </SyntaxHighlighter>
            ) : (
              <p className="text-gray-500 text-center">
                Loading README or select a file to view its contents
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Chat Interface */}
      {showChat && selectedFile && (
        <SingleFileChatInterface
          owner={owner}
          repo={repo}
          selectedFile={selectedFile}
          fileContent={fileContent[selectedFile] || ''}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default GithubPage;
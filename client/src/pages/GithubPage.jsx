import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, XIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const GithubPage = () => {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [files, setFiles] = useState([]);
  const [readmeContent, setReadmeContent] = useState('');
  const [commits, setCommits] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState({});
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState(new Set());

  // Add this helper function
  const isTextFile = (filename) => {
    const textExtensions = [
      'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'json', 
      'xml', 'yaml', 'yml', 'ini', 'conf', 'sh', 'bash', 'py', 'rb', 'php',
      'java', 'c', 'cpp', 'h', 'hpp', 'rs', 'go', 'swift', 'kt', 'r', 'sql'
    ];
    const extension = filename.split('.').pop().toLowerCase();
    return textExtensions.includes(extension);
  };

  // Function to fetch repository data
  const fetchRepoData = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFiles([]);
    setReadmeContent('');
    setCommits([]);

    try {
      // Fetch files
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

      // Fetch README
      try {
        const readmeResponse = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`
        );
        
        if (readmeResponse.ok) {
          const readmeText = await readmeResponse.text();
          setReadmeContent(readmeText);
        }
      } catch (readmeError) {
        console.log('README not found or unable to fetch');
      }

      // Fetch commits
      const commitsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!commitsResponse.ok) throw new Error('Failed to fetch commits');
      
      const commitsData = await commitsResponse.json();
      setCommits(commitsData.slice(0, 5));  // Limit to 5 commits

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFileExpand = async (file) => {
    const newExpanded = new Set(expandedFiles);
    if (!newExpanded.has(file)) {
      try {
        const content = await fetchFileContent(file);
        setFileContent(prevContent => ({ ...prevContent, [file]: content }));
        newExpanded.add(file);
      } catch (err) {
        setError('Failed to load file content');
      }
    } else {
      newExpanded.delete(file);
    }
    setExpandedFiles(newExpanded);
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
    <div className="max-w-6xl mx-auto p-6 text-gray-200">
      <form onSubmit={fetchRepoData} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </form>

      {error && (
        <div className="p-4 mb-6 rounded-lg bg-accent/10 text-accent border border-accent/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Files List */}
        <motion.div 
          layout
          className="bg-gray-800/50 rounded-xl border border-gray-700 p-4"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Repository Files</h2>
          <div className="space-y-2">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={file}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg overflow-hidden"
                >
                  <div 
                    onClick={() => toggleFileExpand(file)}
                    className="p-3 bg-gray-700/30 hover:bg-gray-700/50 cursor-pointer
                             transition-colors flex items-center gap-3 group"
                  >
                    {expandedFiles.has(file) ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                    <span className="text-white/70">{getFileIcon(file)}</span>
                    <span className="text-white group-hover:text-blue-400">{file}</span>
                  </div>
                  <AnimatePresence>
                    {expandedFiles.has(file) && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gray-900/50 p-4 overflow-x-auto">
                          <SyntaxHighlighter
                            language={file.split('.').pop()}
                            style={vscDarkPlus}
                            className="text-sm"
                          >
                            {fileContent[file] || ''}
                          </SyntaxHighlighter>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* README Section */}
        <motion.div 
          layout
          className="bg-gray-800/50 rounded-xl border border-gray-700 p-4"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">README</h2>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{readmeContent || 'No README found'}</ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GithubPage;
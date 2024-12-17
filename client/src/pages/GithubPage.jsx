import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileIcon, FolderIcon, GitBranchIcon, BookOpenIcon, XIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
  const [fileContent, setFileContent] = useState('');
  const [showFileViewer, setShowFileViewer] = useState(false);

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
          .filter(file => file.type === 'blob')
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
  

  const fetchFileContent = async (path) => {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
      );
      if (!response.ok) throw new Error('Failed to fetch file content');
      const content = await response.text();
      setFileContent(content);
      setShowFileViewer(true);
    } catch (err) {
      setError('Failed to load file content');
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
    <div className="max-w-6xl mx-auto p-6">
      <form onSubmit={fetchRepoData} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Owner"
            className="bg-background/50 border-primary/20 text-text"
          />
          <Input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="Repository"
            className="bg-background/50 border-primary/20 text-text"
          />
          <Button 
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-background"
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
          className="bg-background/50 rounded-xl border border-primary/20 p-4"
        >
          <h2 className="text-xl font-semibold text-text mb-4">Repository Files</h2>
          <div className="space-y-2">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={file}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => fetchFileContent(file)}
                  className="p-3 rounded-lg hover:bg-primary/10 cursor-pointer
                           transition-colors flex items-center gap-3 group"
                >
                  <span className="text-text/70">{getFileIcon(file)}</span>
                  <span className="text-text group-hover:text-primary">{file}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* README Section */}
        <motion.div 
          layout
          className="bg-background/50 rounded-xl border border-primary/20 p-4"
        >
          <h2 className="text-xl font-semibold text-text mb-4">README</h2>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{readmeContent || 'No README found'}</ReactMarkdown>
          </div>
        </motion.div>
      </div>

      {/* File Viewer Modal */}
      <Dialog
        open={showFileViewer}
        onClose={() => setShowFileViewer(false)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-background border border-primary/20 rounded-xl 
                   w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-primary/20">
            <h3 className="text-lg font-semibold text-text">
              {selectedFile}
            </h3>
            <Button
              onClick={() => setShowFileViewer(false)}
              variant="ghost"
              className="p-2 hover:bg-accent/10"
            >
              <XIcon className="w-5 h-5" />
            </Button>
          </div>
          <pre className="p-4 overflow-auto">
            <code className="text-text whitespace-pre-wrap">
              {fileContent}
            </code>
          </pre>
        </motion.div>
      </Dialog>
    </div>
  );
};

export default GithubPage;
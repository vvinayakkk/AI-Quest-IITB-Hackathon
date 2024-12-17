import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, FileText, Folder , MessageSquare,  Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import EnhancedSingleFileChatInterface from '@/components/AIChatGithub';
import RepoChatInterface from '@/components/RepoChat';

const createFileTree = (files) => {
  const tree = {};

  files.forEach(filePath => {
    const parts = filePath.split('/');
    let current = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        if (!current.__files) current.__files = [];
        current.__files.push(part);
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });

  return tree;
};

const TreeNode = ({ name, node, depth = 0, onFileSelect, path = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = Object.keys(node).length > 0 || (node.__files && node.__files.length > 0);

  const toggleExpand = () => {
    if (hasChildren) setIsExpanded(!isExpanded);
  };

  const currentPath = path ? `${path}/${name}` : name;

  return (
    <div className="pl-4">
      <div 
        className={`flex items-center cursor-pointer hover:bg-gray-700/30 rounded-lg p-2 
          ${isExpanded ? 'bg-gray-700/30' : ''}`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={toggleExpand}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        ) : <div className="w-4"></div>}
        
        {node.__files ? <FileText size={16} className="mr-2" /> : <Folder size={16} className="mr-2" />}
        
        <span>{name}</span>
      </div>

      {isExpanded && (
        <div>
          {Object.entries(node)
            .filter(([key]) => key !== '__files')
            .map(([folderName, folderNode]) => (
              <TreeNode 
                key={folderName} 
                name={folderName} 
                node={folderNode} 
                depth={depth + 1}
                onFileSelect={onFileSelect}
                path={currentPath}
              />
            ))}
          
          {node.__files && node.__files.map(filename => (
            <div 
              key={filename}
              className="flex items-center cursor-pointer hover:bg-gray-700/30 rounded-lg p-2"
              style={{ paddingLeft: `${(depth + 1) * 16}px` }}
              onClick={() => onFileSelect(`${currentPath}/${filename}`)}
            >
              <FileText size={16} className="mr-2" />
              <span>{filename}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GithubPage = () => {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [files, setFiles] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState({});
  const [chatContext, setChatContext] = useState(null);
  
  // New states for repo-wide chat
  const [isIndexingRepo, setIsIndexingRepo] = useState(false);
  const [isRepoChatEnabled, setIsRepoChatEnabled] = useState(false);
  const [showRepoChat, setShowRepoChat] = useState(false);

  const isTextFile = (filename) => {
    const textExtensions = [
      'txt', 'md', 'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'json', 
      'xml', 'yaml', 'yml', 'ini', 'conf', 'sh', 'bash', 'py', 'rb', 'php',
      'java', 'c', 'cpp', 'h', 'hpp', 'rs', 'go', 'swift', 'kt', 'r', 'sql'
    ];
    const extension = filename.split('.').pop().toLowerCase();
    return textExtensions.includes(extension);
  };

  const indexEntireRepo = async () => {
    if (!owner || !repo) {
      setError('Please enter owner and repository name');
      return;
    }
  
    setIsIndexingRepo(true);
    setError(null);
  
    try {
      console.log('Indexing repo:', { owner, repo, branch });
  
      const response = await fetch('http://127.0.0.1:8000/api/index-repo/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          branch
        })
      });
  
      const data = await response.json();
      console.log('Indexing response:', data);
  
      // Explicitly check for success conditions
      if (data.status === 'success') {
        console.log('Setting repo chat states');
        setIsRepoChatEnabled(true);
        setShowRepoChat(true);
      } else {
        console.error('Indexing failed:', data);
        setError(data.message || 'Failed to index repository');
      }
    } catch (err) {
      console.error('Indexing error:', err);
      setError(err.message || 'Failed to index repository');
    } finally {
      setIsIndexingRepo(false);
    }
  };

  const fetchRepoData = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFiles([]);
    setSelectedFile(null);
    setFileContent({});
    setIsRepoChatEnabled(false);
    setShowRepoChat(false);

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch repository files');
      
      const data = await response.json();
      const allFiles = data.tree
        .filter(file => file.type === 'blob' && isTextFile(file.path))
        .map(file => file.path);
      
      setFiles(allFiles);
      
      // Create file tree after setting files
      setFileTree(createFileTree(allFiles));

      // Find and load README if it exists
      const readme = allFiles.find(file => file.toLowerCase().includes('readme.md'));
      if (readme) {
        handleFileSelect(readme);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileSelect = async (filePath) => {
    try {
      setSelectedFile(filePath);
      setError(null);
      
      // If content is already loaded, don't fetch again
      if (fileContent[filePath]) return;

      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`
      );
      
      if (!response.ok) throw new Error(`Failed to fetch file content: ${response.status}`);
      
      const content = await response.text();
      setFileContent(prev => ({ ...prev, [filePath]: content }));
      
      setChatContext({
        owner,
        repo,
        selectedFile: filePath,
        fileContent: content
      });
    } catch (err) {
      setError(err.message);
      console.error('Error loading file:', err);
    }
  };

  const handleCloseChat = () => {
    setChatContext(null);
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
        
        {files.length > 0 && (
          <Button 
            type="button"
            onClick={indexEntireRepo}
            disabled={isIndexingRepo}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center"
          >
            {isIndexingRepo ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Indexing...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat with Repo
              </>
            )}
          </Button>
        )}
      </form>
    </div>

    {error && (
      <div className="p-4 mb-6 rounded-lg bg-accent/10 text-accent border border-accent/20">
        {error}
      </div>
    )}

      <div className="grid grid-cols-12 gap-6">
        <motion.div 
          layout
          className="col-span-3 bg-gray-800/50 rounded-xl border border-gray-700 p-4"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Repository Files</h2>
          <div className="space-y-2">
            {Object.entries(fileTree).map(([rootName, rootNode]) => (
              <TreeNode 
                key={rootName}
                name={rootName} 
                node={rootNode} 
                onFileSelect={handleFileSelect}
              />
            ))}
          </div>
        </motion.div>

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
                Select a file to view its contents
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {showRepoChat && (
        <RepoChatInterface 
          owner={owner} 
          repo={repo} 
          onClose={() => setShowRepoChat(false)} 
        />
      )}

      {chatContext && (
        <EnhancedSingleFileChatInterface
          owner={chatContext.owner}
          repo={chatContext.repo}
          selectedFile={chatContext.selectedFile}
          fileContent={chatContext.fileContent}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default GithubPage;
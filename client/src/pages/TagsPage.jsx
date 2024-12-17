import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

const tags = [
  {
    name: "javascript",
    count: 2345,
    description: "For questions regarding programming in ECMAScript (JavaScript/JS) and its variants/dialects.",
    color: "text-yellow-500"
  },
  {
    name: "python",
    count: 2100,
    description: "Python is a multi-paradigm, dynamically typed, multipurpose programming language.",
    color: "text-blue-500"
  },
  {
    name: "react",
    count: 1890,
    description: "React is a JavaScript library for building user interfaces.",
    color: "text-cyan-500"
  },
  {
    name: "node.js",
    count: 1654,
    description: "Node.js is an event-based, non-blocking, asynchronous I/O runtime.",
    color: "text-green-500"
  },
  {
    name: "typescript",
    count: 1432,
    description: "TypeScript is a strongly typed programming language that builds on JavaScript.",
    color: "text-blue-400"
  },
  {
    name: "docker",
    count: 1234,
    description: "Docker is a platform for developing, shipping, and running applications in containers.",
    color: "text-sky-500"
  },
  {
    name: "aws",
    count: 987,
    description: "Amazon Web Services (AWS) is a comprehensive cloud computing platform.",
    color: "text-orange-500"
  },
  {
    name: "git",
    count: 876,
    description: "Git is a distributed version control system for tracking changes in source code.",
    color: "text-red-500"
  }
];

const TagsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex ml-[330px] flex-col gap-6 p-6 bg-background min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text">Tags</h1>
        <p className="text-text/80">Browse questions by tags</p>
      </div>

      {/* Search Tags */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/50 h-5 w-5" />
        <Input
          type="text"
          placeholder="Filter by tag name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-foreground border-accent text-text w-full focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTags.map(tag => (
          <Card 
            key={tag.name} 
            className="bg-foreground border-dashed border border-accent text-text hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium bg-background/10 ${tag.color}`}>
                #{tag.name}
              </div>
              <CardTitle className="text-text text-sm">
                {tag.count} questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text/80 text-sm">{tag.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TagsPage;
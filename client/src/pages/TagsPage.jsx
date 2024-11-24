import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

const TagsPage = () => {
  const [tags] = useState([
    {
      name: "javascript",
      count: 2345,
      description: "For questions regarding programming in ECMAScript (JavaScript/JS) and its variants/dialects."
    },
    {
      name: "python",
      count: 2100,
      description: "Python is a multi-paradigm, dynamically typed, multipurpose programming language."
    },
    {
      name: "react",
      count: 1890,
      description: "React is a JavaScript library for building user interfaces."
    },
    {
      name: "node.js",
      count: 1654,
      description: "Node.js is an event-based, non-blocking, asynchronous I/O runtime built on Chrome's V8 JavaScript engine."
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Tags</h1>
        <p className="text-gray-400">
          A tag is a keyword or label that categorizes your question with other, similar questions.
          Using the right tags makes it easier for others to find and answer your question.
        </p>
      </div>

      {/* Search Tags */}
      <div className="mb-8 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Filter by tag name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white w-full focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTags.map(tag => (
          <Card key={tag.name} className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {tag.name}
                  </span>
                  <span className="ml-2 text-sm text-gray-400">
                    × {tag.count}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-400 line-clamp-2">
                {tag.description}
              </p>
              <div className="mt-4">
                <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200">
                  Browse questions →
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TagsPage;
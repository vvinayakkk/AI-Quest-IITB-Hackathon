import React from 'react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCircle, Search, Tag, Bell, Menu } from 'lucide-react';

// Mock data structure
const initialQuestions = [
  {
    id: 1,
    title: "How to implement WebSocket in React?",
    body: "I'm trying to implement real-time features in my React application...",
    author: "john_doe",
    tags: ["react", "websocket", "javascript"],
    votes: 42,
    answers: 5,
    views: 1337,
    timestamp: "2024-03-15T10:30:00Z"
  },
  {
    id: 2,
    title: "Best practices for React Context API",
    body: "What are the current best practices for using Context API...",
    author: "jane_smith",
    tags: ["react", "context-api", "state-management"],
    votes: 28,
    answers: 3,
    views: 892,
    timestamp: "2024-03-14T15:45:00Z"
  }
];

const QAPlatform = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentUser] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600">DevQA</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
              <div className="max-w-lg w-full lg:max-w-xs">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search questions..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* User Navigation */}
            <div className="flex items-center">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              {currentUser ? (
                <div className="ml-3 relative">
                  <button className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <UserCircle className="h-8 w-8 text-gray-400" />
                  </button>
                </div>
              ) : (
                <div className="ml-3 flex items-center">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden md:block w-64 pr-8">
            <nav className="space-y-1">
              <a href="#" className="bg-gray-100 text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                Home
              </a>
              <a href="#" className="text-gray-600 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                Questions
              </a>
              <a href="#" className="text-gray-600 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                Tags
              </a>
              <a href="#" className="text-gray-600 hover:bg-gray-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md">
                Users
              </a>
            </nav>
          </div>

          {/* Question List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Top Questions</h1>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Ask Question
              </button>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex">
                    {/* Stats */}
                    <div className="flex flex-col items-center mr-6 space-y-2">
                      <div className="text-center">
                        <div className="text-xl font-medium text-gray-900">{question.votes}</div>
                        <div className="text-sm text-gray-500">votes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-medium text-gray-900">{question.answers}</div>
                        <div className="text-sm text-gray-500">answers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-medium text-gray-900">{question.views}</div>
                        <div className="text-sm text-gray-500">views</div>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1">
                      <h2 className="text-xl font-medium text-blue-600 hover:text-blue-700">
                        <a href={`/questions/${question.id}`}>{question.title}</a>
                      </h2>
                      <p className="mt-2 text-gray-600 line-clamp-2">{question.body}</p>

                      {/* Tags */}
                      <div className="mt-4 flex items-center space-x-2">
                        {question.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Meta Information */}
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <span>Asked by {question.author}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(question.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAPlatform;
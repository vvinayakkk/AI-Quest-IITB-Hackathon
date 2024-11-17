import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, MessageCircle, Check, Flag, Edit, Trash, Share } from 'lucide-react';

// QuestionDetail.js - Individual question page
const QuestionDetail = () => {
  const [question] = useState({
    id: 1,
    title: "How to implement WebSocket in React?",
    body: "I'm trying to implement real-time features in my React application using WebSocket. I've tried using the 'ws' library but I'm having trouble with connection handling and real-time updates. Any help would be appreciated!",
    author: "john_doe",
    tags: ["react", "websocket", "javascript"],
    votes: 42,
    views: 1337,
    timestamp: "2024-03-15T10:30:00Z",
    answers: [
      {
        id: 1,
        body: "Here's how you can implement WebSocket in React...",
        author: "expert_dev",
        votes: 15,
        isAccepted: true,
        timestamp: "2024-03-15T11:30:00Z",
        comments: [
          {
            id: 1,
            body: "This worked perfectly for me!",
            author: "user123",
            timestamp: "2024-03-15T12:30:00Z"
          }
        ]
      }
    ],
    comments: [
      {
        id: 1,
        body: "Could you provide more details about your setup?",
        author: "helper_dev",
        timestamp: "2024-03-15T10:45:00Z"
      }
    ]
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Question Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span>Asked {new Date(question.timestamp).toLocaleString()}</span>
          <span className="mx-2">•</span>
          <span>Viewed {question.views} times</span>
        </div>
      </div>

      {/* Question Content */}
      <div className="grid grid-cols-12 gap-4">
        {/* Voting */}
        <div className="col-span-1 flex flex-col items-center space-y-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <ThumbsUp className="h-6 w-6 text-gray-400" />
          </button>
          <span className="text-xl font-medium">{question.votes}</span>
          <button className="p-2 hover:bg-gray-100 rounded">
            <ThumbsDown className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Main Content */}
        <div className="col-span-11">
          <div className="prose max-w-none">
            <p>{question.body}</p>
          </div>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {question.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>

          {/* Author Info */}
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-200 rounded-full p-2">
                <span className="text-sm font-medium">{question.author}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-500">
                <Share className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-500">
                <Flag className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="mt-6 border-t">
            {question.comments.map(comment => (
              <div key={comment.id} className="py-4 border-b">
                <p className="text-sm text-gray-700">{comment.body}</p>
                <div className="mt-1 text-xs text-gray-500">
                  – {comment.author} {new Date(comment.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">{question.answers.length} Answers</h2>
        {question.answers.map(answer => (
          <div key={answer.id} className="mt-6 grid grid-cols-12 gap-4">
            <div className="col-span-1 flex flex-col items-center space-y-2">
              <button className="p-2 hover:bg-gray-100 rounded">
                <ThumbsUp className="h-6 w-6 text-gray-400" />
              </button>
              <span className="text-xl font-medium">{answer.votes}</span>
              <button className="p-2 hover:bg-gray-100 rounded">
                <ThumbsDown className="h-6 w-6 text-gray-400" />
              </button>
              {answer.isAccepted && (
                <Check className="h-6 w-6 text-green-500" />
              )}
            </div>
            <div className="col-span-11">
              <div className="prose max-w-none">
                <p>{answer.body}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-200 rounded-full p-2">
                    <span className="text-sm font-medium">{answer.author}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  answered {new Date(answer.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// AskQuestion.js - Form for asking new questions
const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle question submission
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ask a Question</h1>
      <Card>
        <CardHeader>
          <CardTitle>Writing a good question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="What's your programming question? Be specific."
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Body
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Include all the information someone would need to answer your question"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tags
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Add up to 5 tags to describe what your question is about"
                />
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Post Your Question
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// UserProfile.js - User profile page
const UserProfile = () => {
  const [user] = useState({
    username: "john_doe",
    joinDate: "2023-01-15",
    reputation: 1234,
    badges: {
      gold: 2,
      silver: 15,
      bronze: 32
    },
    stats: {
      answers: 45,
      questions: 23,
      reached: "~12k",
    },
    topTags: [
      { name: "react", score: 15 },
      { name: "javascript", score: 12 },
      { name: "node.js", score: 8 }
    ],
    recentActivity: [
      {
        type: "answer",
        title: "How to implement WebSocket in React?",
        timestamp: "2024-03-15T10:30:00Z",
        score: 42
      }
    ]
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-start space-x-6 mb-8">
        <div className="flex-shrink-0">
          <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-500">{user.username[0].toUpperCase()}</span>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-gray-500">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">●</span>
              <span>{user.badges.gold}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">●</span>
              <span>{user.badges.silver}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-600">●</span>
              <span>{user.badges.bronze}</span>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{user.reputation}</div>
          <div className="text-sm text-gray-500">reputation</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.stats.questions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.stats.answers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>People Reached</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.stats.reached}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tags */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.topTags.map(tag => (
              <div key={tag.name} className="flex items-center justify-between">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {tag.name}
                </span>
                <span className="text-gray-500">Score: {tag.score}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{activity.type}</div>
                  <div className="text-blue-600 hover:text-blue-700">
                    <a href="#">{activity.title}</a>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// TagsPage.js - Browse and search tags
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
        <h1 className="text-3xl font-bold mb-4">Tags</h1>
        <p className="text-gray-600">
          A tag is a keyword or label that categorizes your question with other, similar questions.
          Using the right tags makes it easier for others to find and answer your question.
        </p>
      </div>

      {/* Search Tags */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Filter by tag name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTags.map(tag => (
          <Card key={tag.name}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {tag.name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    × {tag.count}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                {tag.description}
              </p>
              <div className="mt-4">
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Browse questions
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Export all components
const QAPlatformPages = {
  QuestionDetail,
  AskQuestion,
  UserProfile,
  TagsPage
};

export default QAPlatformPages;

export {
  QuestionDetail,
  AskQuestion,
  UserProfile,
  TagsPage
};

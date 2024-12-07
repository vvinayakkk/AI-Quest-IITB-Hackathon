import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Award, BookMarked, CheckCircle2, MessageSquare, Star, Trophy, Users2, Plus, X 
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const activityData = [
    { name: "Jan 2024", questions: 40, answers: 24 },
    { name: "Feb 2024", questions: 35, answers: 38 },
    { name: "Mar 2024", questions: 27, answers: 34 },
    { name: "Apr 2024", questions: 18, answers: 29 },
    { name: "May 2024", questions: 23, answers: 41 },
    { name: "Jun 2024", questions: 35, answers: 28 },
    { name: "Jul 2024", questions: 30, answers: 35 },
    { name: "Aug 2024", questions: 25, answers: 32 },
    { name: "Sep 2024", questions: 32, answers: 38 },
    { name: "Oct 2024", questions: 28, answers: 30 },
    { name: "Nov 2024", questions: 22, answers: 25 },
]

const reputationData = [
  { name: "Mon", value: 220 },
  { name: "Tue", value: 300 },
  { name: "Wed", value: 250 },
  { name: "Thu", value: 400 },
  { name: "Fri", value: 350 },
  { name: "Sat", value: 450 },
  { name: "Sun", value: 400 },
]

const badgesData = {
  gold: [
    {
      name: "Problem Solver",
      description: "Solved 500 questions",
      progress: 85,
      icon: Trophy,
      earned: true
    },
    {
      name: "Top Contributor",
      description: "1000+ helpful answers",
      progress: 100,
      icon: Award,
      earned: true
    },
    {
      name: "Expert",
      description: "Maintained 90% acceptance rate",
      progress: 65,
      icon: Star,
      earned: false
    }
  ],
  silver: [
    {
      name: "Quick Learner",
      description: "Solved 100 questions",
      progress: 100,
      icon: BookMarked,
      earned: true
    },
    {
      name: "Helper",
      description: "100+ accepted answers",
      progress: 100,
      icon: MessageSquare,
      earned: true
    }
  ]
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3000/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/posts', newPost, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Reset form and close modal
      setNewPost({ title: '', content: '', tags: '' });
      setIsPostModalOpen(false);
      
      // Optional: Refresh posts or show success message
    } catch (error) {
      console.error('Error creating post', error);
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center items-center min-h-screen bg-gray-900"
      >
        <motion.div 
          animate={{ 
            rotate: 360,
            transition: { 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            } 
          }}
          className="w-16 h-16 border-4 border-transparent border-b-purple-500 rounded-full"
        />
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen bg-gray-900 text-white"
      >
        <p>Please sign in to view your profile.</p>
      </motion.div>
    );
  }

  return (        
    <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col gap-6 p-6 bg-gray-900 min-h-screen"
  >
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="avatar">
            <span className="initials">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
          </div>
          <div className="user-info">
            <h3>{user.firstName} {user.lastName}</h3>
            <p>{user.role || "Member"}</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <a href="#" className="active">
                <i className="icon-home"></i>
                <span>Topics</span>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="icon-file"></i>
                <span>My Posts</span>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="icon-category"></i>
                <span>Categories</span>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="icon-tag"></i>
                <span>Tags</span>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="icon-bookmark"></i>
                <span>Bookmarks</span>
              </a>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="genie-bot">
            <i className="icon-robot"></i>
            <span>Genie Bot AI Assistant</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Card */}
          <Card className="w-full bg-gray-800 border-purple-500/20 shadow-lg md:w-[300px]">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <Avatar className="h-32 w-32">
                    <AvatarFallback className="bg-purple-500 text-white">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                {/* User Info */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">
                      {user.firstName} {user.lastName}
                    </h2>
                    {user.verified && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {user.role || "Member"}
                  </Badge>
                  <p className="text-sm text-gray-400">
                    {user.department || "No department set"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users2 className="h-4 w-4" />
                    <span>
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-2"
                >
                  <Button 
                    variant="outline" 
                    className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
                  >
                    Edit Profile
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1"
          >
            {/* Reputation Card */}
            <Card className="bg-gray-800 border-purple-500/20 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Reputation
                </CardTitle>
                <Trophy className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{user.reputation || '15,234'}</div>
                <p className="text-xs text-gray-400">+180 this week</p>
              </CardContent>
            </Card>

            {/* Answers Card */}
            <Card className="bg-gray-800 border-purple-500/20 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Answers
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{user.answers || '1,429'}</div>
                <p className="text-xs text-gray-400">92% acceptance rate</p>
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card className="bg-gray-800 border-purple-500/20 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Badges
                </CardTitle>
                <Award className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{user.badgesCount?.total || '47'}</div>
                <div className="flex gap-1 text-xs text-gray-400">
                  <span className="text-yellow-500">{user.badgesCount?.gold || '12'} Gold</span>
                  <span>•</span>
                  <span className="text-gray-400">{user.badgesCount?.silver || '20'} Silver</span>
                  <span>•</span>
                  <span className="text-amber-600">{user.badgesCount?.bronze || '15'} Bronze</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Analytics */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="bg-gray-800 border-purple-500/20 p-1">
              <TabsTrigger 
                value="activity" 
                className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="reputation" 
                className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Reputation
              </TabsTrigger>
              <TabsTrigger 
                value="badges" 
                className="text-white data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                Badges
              </TabsTrigger>
            </TabsList>
            
            {/* Activity Tab Content */}
            <TabsContent value="activity" className="mt-6">
              <Card className="bg-gray-800 border-purple-500/20 shadow-lg">
                <CardHeader>
                <CardTitle className="text-white">Questions & Answers Activity</CardTitle>
                <CardDescription className="text-gray-400">
                  Your activity over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-700" />
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgb(31, 41, 55)',
                        color: 'white',
                        border: '1px solid rgb(107, 114, 128)'
                      }} 
                    />
                    <Bar dataKey="questions" fill="rgb(124, 58, 237)" />
                    <Bar dataKey="answers" fill="rgb(249, 115, 22)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
  
          {/* Reputation Tab Content */}
          <TabsContent value="reputation" className="mt-6">
            <Card className="bg-gray-800 border-purple-500/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Reputation Growth</CardTitle>
                <CardDescription className="text-gray-400">
                  Your reputation changes over the last week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={reputationData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-700" />
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgb(31, 41, 55)',
                        color: 'white',
                        border: '1px solid rgb(107, 114, 128)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="rgb(124, 58, 237)" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
  
          {/* Badges Tab Content */}
          <TabsContent value="badges" className="mt-6">
            <div className="grid gap-6">
              {/* Gold Badges Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                  <h3 className="text-xl font-bold text-white">Gold Badges</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badgesData.gold.map((badge, i) => (
                    <Card key={i} className="bg-gray-800/50 border-purple-500/20">
                      <CardContent className="pt-4">
                        <div className="flex gap-3 items-start">
                          <div className={`p-2 rounded-full ${badge.earned ? 'bg-yellow-500/20' : 'bg-gray-700/20'}`}>
                            <badge.icon className={`h-5 w-5 ${badge.earned ? 'text-yellow-500' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm text-white">{badge.name}</h4>
                              {badge.earned && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                            </div>
                            <p className="text-xs text-gray-400">{badge.description}</p>
                            <div className="space-y-1">
                              <div className="h-1.5 rounded-full bg-gray-700">
                                <div 
                                  className={`h-full rounded-full ${badge.earned ? 'bg-yellow-500' : 'bg-gray-500'}`}
                                  style={{ width: `${badge.progress}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-gray-400">{badge.progress}% completed</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
  
              {/* Silver Badges Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-6 w-6 fill-gray-400 text-gray-400" />
                  <h3 className="text-xl font-bold text-white">Silver Badges</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badgesData.silver.map((badge, i) => (
                    <Card key={i} className="bg-gray-800/50 border-purple-500/20">
                      <CardContent className="pt-4">
                        <div className="flex gap-3 items-start">
                          <div className={`p-2 rounded-full ${badge.earned ? 'bg-gray-400/20' : 'bg-gray-700/20'}`}>
                            <badge.icon className={`h-5 w-5 ${badge.earned ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm text-white">{badge.name}</h4>
                              {badge.earned && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                            </div>
                            <p className="text-xs text-gray-400">{badge.description}</p>
                            <div className="space-y-1">
                              <div className="h-1.5 rounded-full bg-gray-700">
                                <div 
                                  className={`h-full rounded-full ${badge.earned ? 'bg-gray-400' : 'bg-gray-500'}`}
                                  style={{ width: `${badge.progress}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-gray-400">{badge.progress}% completed</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
  
      {/* Add Post Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsPostModalOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-500 text-white p-4 rounded-full shadow-lg hover:bg-purple-600 z-50"
      >
        <Plus className="h-6 w-6" />
      </motion.button>
  
      <AnimatePresence>
        {isPostModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Create a New Post</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsPostModalOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </Button>
              </div>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <Input 
                  placeholder="Post Title" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  required 
                />
                <Textarea 
                  placeholder="What's on your mind?" 
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  required 
                  rows={4}
                />
                <Input 
                  placeholder="Tags (comma-separated)" 
                  value={newPost.tags}
                  onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                />
                <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600">
                  Publish Post
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
};
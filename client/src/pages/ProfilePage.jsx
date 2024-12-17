import { useState, useEffect } from 'react';
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

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useUser } from '@/providers/UserProvider';


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

// Update badges data to match schema
const sampleBadgesData = {
  gold: [
    {
      name: "Problem Solver",
      description: "Solved 500 questions",
      progress: 85,
      earned: true
    },
    {
      name: "Top Contributor",
      description: "1000+ helpful answers",
      progress: 100,
      earned: true
    },
    {
      name: "Expert",
      description: "Maintained 90% acceptance rate",
      progress: 65,
      earned: false
    }
  ],
  silver: [
    {
      name: "Quick Learner",
      description: "Solved 100 questions",
      progress: 100,
      earned: true
    },
    {
      name: "Helper",
      description: "100+ accepted answers",
      progress: 100,
      earned: true
    }
  ]
};

// Sample user data matching schema
const sampleUser = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  role: "Member",
  department: "Engineering",
  verified: true,
  reputation: 15234,
  answers: 1429,
  badgesCount: {
    total: 47,
    gold: 12,
    silver: 20,
    bronze: 15
  },
  badges: sampleBadgesData,
  avatar: null,
  createdAt: new Date("2023-01-01")
};

const ProfilePage = () => {
  const { user: authUser } = useUser();

  if (!authUser) {
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

  // Update user stats section
  const UserStats = ({ user }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
      <Card className="bg-gray-800 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white">Reputation</CardTitle>
          <Trophy className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{user.reputation}</div>
          <p className="text-xs text-gray-400">+180 this week</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white">Answers</CardTitle>
          <MessageSquare className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{user.answers}</div>
          <p className="text-xs text-gray-400">92% acceptance rate</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white">Badges</CardTitle>
          <Award className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{user.badgesCount.total}</div>
          <div className="flex gap-1 text-xs">
            <span className="text-yellow-500">{user.badgesCount.gold} Gold</span>
            <span>•</span>
            <span className="text-gray-400">{user.badgesCount.silver} Silver</span>
            <span>•</span>
            <span className="text-amber-600">{user.badgesCount.bronze} Bronze</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Update badges section
  const BadgesSection = ({ badges, type, icon: Icon, color }) => (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-6 w-6 fill-${color} text-${color}`} />
        <h3 className="text-xl font-bold text-white">{type} Badges</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge, i) => (
          <Card key={i} className="bg-gray-800/50 border-purple-500/20">
            <CardContent className="pt-4">
              {/* ...existing badge content... */}
              <div className="flex gap-3 items-start">
                <div className={`p-2 rounded-full ${badge.earned ? `bg-${color}/20` : 'bg-gray-700/20'}`}>
                  <Icon className={`h-5 w-5 ${badge.earned ? `text-${color}` : 'text-gray-400'}`} />
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
                        className={`h-full rounded-full ${badge.earned ? `bg-${color}` : 'bg-gray-500'}`}
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
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6 p-6 bg-gray-900 min-h-screen"
    >
      {/* Main Content */}
      <div className="flex flex-col ml-[330px]">
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
                      {authUser.firstName?.charAt(0)}{authUser.lastName?.charAt(0)}
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
                      {authUser.firstName} {authUser.lastName}
                    </h2>
                    {authUser.verified && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {authUser.role || "Member"}
                  </Badge>
                  <p className="text-sm text-gray-400">
                    {authUser.department || "No department set"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users2 className="h-4 w-4" />
                    <span>
                      Member since {new Date(authUser.createdAt).toLocaleDateString()}
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
                  >
                    Edit Profile
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <UserStats user={authUser} />
        </div>

        {/* Detailed Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="bg-gray-800 border-purple-500/20 p-1 mt-4">
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
                <BadgesSection
                  badges={authUser.badges.gold}
                  type="Gold"
                  icon={Star}
                  color="yellow-500"
                />
                <BadgesSection
                  badges={authUser.badges.silver}
                  type="Silver"
                  icon={Star}
                  color="gray-400"
                />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
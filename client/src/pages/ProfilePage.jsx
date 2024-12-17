import { motion } from 'framer-motion';
import { Award, CheckCircle2, MessageSquare, Star, Trophy, Users2 } from 'lucide-react';
import { useUser } from '@/providers/UserProvider';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

const UserStats = ({ user }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/20 shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-purple-400">
            Reputation
          </CardTitle>
          <Trophy className="h-8 w-8 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{user.reputation}</div>
          <p className="text-sm text-purple-300">+180 this week</p>
        </CardContent>
      </Card>
    </motion.div>

    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/20 shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-purple-400">
            Answers
          </CardTitle>
          <MessageSquare className="h-8 w-8 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{user.answers}</div>
          <p className="text-sm text-purple-300">92% acceptance rate</p>
        </CardContent>
      </Card>
    </motion.div>

    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/20 shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-purple-400">
            Badges
          </CardTitle>
          <Award className="h-8 w-8 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-2">{user.badgesCount.gold + user.badgesCount.silver + user.badgesCount.bronze}</div>
          <div className="flex gap-2 text-md">
            <span className="text-yellow-500 font-medium">{user.badgesCount.gold} Gold</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400 font-medium">{user.badgesCount.silver} Silver</span>
            <span className="text-gray-400">•</span>
            <span className="text-amber-600 font-medium">{user.badgesCount.bronze} Bronze</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

const BadgesSection = ({ badges, type, icon: Icon, color }) => {
  const gradientClass = type === 'Gold'
    ? 'from-yellow-400 via-yellow-300 to-yellow-500'
    : 'from-gray-300 via-gray-100 to-gray-400';

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Icon className={`h-7 w-7 ${type === 'Gold' ? 'text-yellow-400' : 'text-gray-300'}`} />
        <h3 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradientClass}`}>
          {type} Badges
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {badges.map((badge, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Card className={`bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 
                          ${type === 'Gold'
                ? 'border-yellow-500/20 hover:border-yellow-500/40'
                : 'border-gray-400/20 hover:border-gray-400/40'} 
                          hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300`}>
              <CardContent className="pt-5">
                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-xl ${badge.earned
                    ? type === 'Gold'
                      ? 'bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 border border-yellow-500/20'
                      : 'bg-gradient-to-br from-gray-300/20 to-gray-400/20 border border-gray-400/20'
                    : 'bg-gray-700/20'} 
                    transition-colors duration-300`}>
                    <Icon className={`h-6 w-6 ${badge.earned
                      ? type === 'Gold'
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                      : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold text-base ${badge.earned
                        ? type === 'Gold'
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                        : 'text-gray-400'}`}>
                        {badge.name}
                      </h4>
                      {badge.earned && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <CheckCircle2 className={`h-4 w-4 ${type === 'Gold' ? 'text-yellow-400' : 'text-gray-300'
                            }`} />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{badge.description}</p>
                    <div className="space-y-2">
                      <div className="h-2 rounded-full bg-gray-700/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${badge.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${badge.earned
                            ? type === 'Gold'
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                              : 'bg-gradient-to-r from-gray-300 to-gray-400'
                            : 'bg-gray-600'}`}
                        />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{badge.progress}% completed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user: authUser } = useUser();
  const totalBadges = authUser.badgesCount.gold + authUser.badgesCount.silver + authUser.badgesCount.bronze;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-10 p-8 bg-gradient-to-br from-gray-900 to-gray-950 min-h-screen"
    >
      {/* Main Content */}
      <div className="flex flex-col ml-[330px] max-w-[1200px]">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Card */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Card className="w-full bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/20 
                           shadow-2xl hover:shadow-purple-500/10 md:w-[340px] text-center transition-all duration-300">
              <CardContent className="pt-10">
                <div className="flex flex-col items-center gap-4">
                  {/* Avatar */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <Avatar className="h-32 w-32">
                      {authUser.avatar ? (
                        <img
                          src={authUser.avatar}
                          alt={`${authUser.firstName} ${authUser.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-purple-500 text-white text-2xl">
                          {authUser.firstName?.charAt(0)}{authUser.lastName?.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </motion.div>

                  {/* User Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-2 w-full text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-2xl font-bold text-white text-center">
                        {authUser.firstName} {authUser.lastName}
                      </h2>
                      {authUser.verified && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>

                    <Badge className="bg-purple-500/20 text-purple-400">
                      {authUser.role || "Member"}
                    </Badge>
                    <p className="text-sm text-gray-400 text-center">
                      {authUser.department || "No department set"}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
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
                    className="flex gap-3 mt-6"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 border-2 border-purple-500 text-purple-400 hover:bg-purple-500 
                               hover:text-white transition-all duration-300 text-base font-medium py-5"
                    >
                      Edit Profile
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Overview */}
          <UserStats user={authUser} />
        </div>

        {/* Detailed Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="bg-gray-800 border-purple-500/20 p-1.5">
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
            <TabsContent value="activity" className="mt-8">
              <Card className="bg-gray-800 border-purple-500/20 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-white">Questions & Answers Activity</CardTitle>
                  <CardDescription className="text-gray-400 text-base">
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
            <TabsContent value="reputation" className="mt-8">
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
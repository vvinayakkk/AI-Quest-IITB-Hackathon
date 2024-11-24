import { useUser } from "@clerk/clerk-react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Award, BookMarked, CheckCircle2, MessageSquare, Star, Trophy, Users2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
};

export default function ProfilePage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex ml-[330px] justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex ml-[330px] justify-center items-center min-h-screen">
        <p className="text-text">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (        
    <div className="flex ml-[330px] flex-col gap-6 p-6 bg-background text-text min-h-screen">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full bg-foreground  border-dashed border border-accent shadow-lg md:w-[300px]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.imageUrl} alt={user.fullName} />
                <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-text">{user.fullName}</h2>
                  {user.emailAddresses[0].verified && (
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  )}
                </div>
                <Badge className="bg-secondary text-text">{user.publicMetadata?.role || "Member"}</Badge>
                <p className="text-sm text-text">{user.publicMetadata?.department || "No department set"}</p>
                <div className="flex items-center gap-2 text-sm text-text">
                  <Users2 className="h-4 w-4" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-background">
                  Follow
                </Button>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-background">
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <Card className="bg-foreground  border-dashed border border-accent shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text">
                Reputation
              </CardTitle>
              <Trophy className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text">15,234</div>
              <p className="text-xs text-text">+180 this week</p>
            </CardContent>
          </Card>
          <Card className="bg-foreground  border-dashed border border-accent shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text">
                Answers
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text">1,429</div>
              <p className="text-xs text-text">92% acceptance rate</p>
            </CardContent>
          </Card>
          <Card className="bg-foreground  border-dashed border border-accent shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text">
                Badges
              </CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text">47</div>
              <div className="flex gap-1 text-xs text-text">
                <span className="text-yellow-500">12 Gold</span>
                <span>•</span>
                <span className="text-gray-400">20 Silver</span>
                <span>•</span>
                <span className="text-amber-600">15 Bronze</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="bg-foreground  border-dashed border border-accent p-1">
          <TabsTrigger value="activity" className="text-text data-[state=active]:bg-secondary data-[state=active]:text-text">
            Activity
          </TabsTrigger>
          <TabsTrigger value="reputation" className="text-text data-[state=active]:bg-secondary data-[state=active]:text-text">
            Reputation
          </TabsTrigger>
          <TabsTrigger value="badges" className="text-text data-[state=active]:bg-secondary data-[state=active]:text-text">
            Badges
          </TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-6">
          <div className="grid gap-6">
            <Card className="bg-foreground  border-dashed border border-accent shadow-lg">
              <CardHeader>
                <CardTitle className="text-text">Questions & Answers Activity</CardTitle>
                <CardDescription className="text-text">
                  Your activity over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ChartContainer
                  config={{
                    questions: {
                      label: "Questions Asked",
                      color: "rgb(99, 102, 241)", // Indigo color
                    },
                    answers: {
                      label: "Answers Given",
                      color: "rgb(249, 115, 22)", // Orange color
                    },
                  }}
                  className="h-[350px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" stroke="hsl(var(--foreground))" className="text-text" />
                      <YAxis stroke="hsl(var(--foreground))" className="text-text" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--text))'
                        }}
                        className="text-text"
                      />
                      <Bar 
                        dataKey="questions" 
                        fill="rgb(99, 102, 241)"
                        radius={[4, 4, 0, 0]}
                        className="opacity-90 hover:opacity-100 transition-opacity"
                      />
                      <Bar 
                        dataKey="answers" 
                        fill="rgb(249, 115, 22)"
                        radius={[4, 4, 0, 0]}
                        className="opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reputation" className="mt-6">
          <Card className="bg-foreground  border-dashed border border-accent shadow-lg">
            <CardHeader>
              <CardTitle className="text-text">Reputation Growth</CardTitle>
              <CardDescription className="text-text">
                Your reputation changes over the last week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Reputation",
                    color: "rgb(99, 102, 241)",
                  },
                }}
                className="h-[350px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reputationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(99, 102, 241)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="rgb(99, 102, 241)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="value"
                      strokeWidth={3}
                      stroke="rgb(99, 102, 241)"
                      dot={{ fill: "rgb(99, 102, 241)", strokeWidth: 2 }}
                      activeDot={{
                        r: 8,
                        style: { fill: "rgb(99, 102, 241)", opacity: 0.8 },
                      }}
                      fill="url(#colorValue)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="badges" className="mt-6">
          <div className="grid gap-6">
            {/* Gold Badges */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                <h3 className="text-xl font-bold text-text">Gold Badges</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badgesData.gold.map((badge, i) => (
                  <Card key={i} className="bg-foreground/50 border-dashed border border-accent">
                    <CardContent className="pt-4">
                      <div className="flex gap-3 items-start">
                        <div className={`p-2 rounded-full ${badge.earned ? 'bg-yellow-500/20' : 'bg-background/20'}`}>
                          <badge.icon className={`h-5 w-5 ${badge.earned ? 'text-yellow-500' : 'text-text'}`} />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-text">{badge.name}</h4>
                            {badge.earned && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                          </div>
                          <p className="text-xs text-text">{badge.description}</p>
                          <div className="space-y-1">
                            <div className="h-1.5 rounded-full bg-background/20">
                              <div 
                                className={`h-full rounded-full ${badge.earned ? 'bg-yellow-500' : 'bg-text'}`}
                                style={{ width: `${badge.progress}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-text">{badge.progress}% completed</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Silver Badges */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-6 w-6 fill-gray-400 text-gray-400" />
                <h3 className="text-xl font-bold text-text">Silver Badges</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badgesData.silver.map((badge, i) => (
                  <Card key={i} className="bg-foreground/50 border-dashed border border-accent">
                    <CardContent className="pt-4">
                      <div className="flex gap-3 items-start">
                        <div className={`p-2 rounded-full ${badge.earned ? 'bg-gray-400/20' : 'bg-background/20'}`}>
                          <badge.icon className={`h-5 w-5 ${badge.earned ? 'text-gray-400' : 'text-text'}`} />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-text">{badge.name}</h4>
                            {badge.earned && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                          </div>
                          <p className="text-xs text-text">{badge.description}</p>
                          <div className="space-y-1">
                            <div className="h-1.5 rounded-full bg-background/20">
                              <div 
                                className={`h-full rounded-full ${badge.earned ? 'bg-gray-400' : 'bg-text'}`}
                                style={{ width: `${badge.progress}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-text">{badge.progress}% completed</p>
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
    </div>
  )
}


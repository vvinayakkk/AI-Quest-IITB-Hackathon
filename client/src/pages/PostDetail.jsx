import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowDown, ArrowUp, MessageSquare, Heart, Share2, Sparkles } from 'lucide-react'
import { useState } from "react"

export default function PostDetail() {
  const [replyText, setReplyText] = useState("")

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 min-h-scree text-gray-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Main Post */}
        <Card className="bg-gray-900 border-purple-500/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" className="text-purple-400">
                <ArrowUp className="h-5 w-5" />
              </Button>
              <span className="text-text font-bold">300</span>
              <Button variant="ghost" size="icon" className="text-purple-400">
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>CK</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-text text-xl font-bold">Is Bitcoin still a good investment in 2024?</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Posted by CryptoKing</span>
                    <span>•</span>
                    <span>7 hours ago</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-x-2">
                <span className="inline-block bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-sm">#Bitcoin</span>
                <span className="inline-block bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-sm">#Investment</span>
                <span className="inline-block bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-sm">#Crypto</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Replies Section */}
        <div className="space-y-4">
          {/* AI Reply */}
          <Card className="bg-blue-900/20 border-blue-500/20">
          <div className="flex flex-col">
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="icon" className="text-purple-400">
                <ArrowUp className="h-5 w-5" />
              </Button>
              <span className="text-text font-bold">300</span>
              <Button variant="ghost" size="icon" className="text-purple-400">
                <ArrowDown className="h-5 w-5" />
              </Button>
            </div>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-10 w-10 border-2 border-blue-500">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="text-text font-semibold">AI Assistant</span>
                <Sparkles className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Based on historical data and current market trends, Bitcoin has shown significant resilience. However, like any
                investment, it comes with risks. Consider diversifying your portfolio and only invest what you can afford to lose.
              </p>
            </CardContent>
            <CardFooter className="flex gap-4 text-gray-400">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                <span>24</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </CardFooter>
            </div>
          </Card>

          {/* User Reply */}
          <Card className="bg-gray-900 border-purple-500/20">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="font-semibold">JohnDoe</span>
                <span className="text-sm text-gray-400">2 hours ago</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                I've been investing in Bitcoin since 2017 and I believe the upcoming halving event could be significant for its
                price action.
              </p>
            </CardContent>
            <CardFooter className="flex gap-4 text-gray-400">
              <Button variant="ghost" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                <span>12</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </CardFooter>
          </Card>

          {/* Reply Input */}
          <Card className="bg-gray-900 border-purple-500/20">
            <CardContent className="p-4">
              <Textarea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[100px] bg-gray-800 border-gray-700 text-gray-100"
              />
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Post Reply</Button>
            </CardContent>
          </Card>
        </div>

        {/* Related Questions */}
        <Card className="bg-gray-900 border-purple-500/20">
          <CardHeader>
            <h3 className="text-text text-xl font-bold">Related Questions</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h4 className="text-text font-medium">What are the risks of cryptocurrency investment?</h4>
                <p className="text-sm text-gray-400">3 replies • 1d ago</p>
              </div>
              <Button variant="outline" className="text-text border-purple-500/20 hover:bg-purple-500/10">
                View
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h4 className="text-text font-medium">How to secure your Bitcoin wallet?</h4>
                <p className="text-sm text-gray-400">5 replies • 2d ago</p>
              </div>
              <Button variant="outline" className="text-text border-purple-500/20 hover:bg-purple-500/10">
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
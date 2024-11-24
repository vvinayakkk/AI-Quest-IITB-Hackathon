import { motion } from "framer-motion"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatTimeAgo, formatUTCTimestamp, getRelativeISOString, createTimestamp } from "@/utils/dateUtils"

const questions = [
  {
    title: "What are the risks of cryptocurrency investment?",
    replies: 3,
    timestamp: createTimestamp('2024-03-15', '08:00')
  },
  {
    title: "How to secure your Bitcoin wallet?",
    replies: 5,
    timestamp: createTimestamp('2024-03-14', '13:30')
  }
]

export default function RelatedQuestions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gray-900/95 border-purple-500/20 backdrop-blur">
        <CardHeader>
          <h3 className="text-text text-xl font-bold">Related Questions</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex-1">
                <h4 className="text-text font-medium">{question.title}</h4>
                <p className="text-sm text-gray-400">
                  {question.replies} replies • 
                  <span title={formatUTCTimestamp(question.timestamp)}>
                    {formatTimeAgo(question.timestamp)}
                  </span>
                </p>
              </div>
              <Button variant="outline" className="text-text border-purple-500/20 hover:bg-purple-500/10">
                View
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
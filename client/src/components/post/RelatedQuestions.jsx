import { motion } from "framer-motion"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatTimeAgo, formatUTCTimestamp } from "@/utils/dateUtils"
import { Link } from "react-router-dom"

export default function RelatedQuestions({ relatedQuestions }) {
  if (!relatedQuestions || relatedQuestions.length === 0) {
    return null; // Return if no related questions
  }

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
          {relatedQuestions.map((question) => (
            <div key={question.id} className="flex justify-between items-center">
              <div className="flex-1">
                <h4 className="text-text font-medium">{question.title}</h4>
                <p className="text-sm text-gray-400">
                  {question.replies} replies • 
                  <span title={formatUTCTimestamp(question.timestamp)}>
                    {formatTimeAgo(question.timestamp)}
                  </span>
                </p>
              </div>
              <Link to={`/post/${question.id}`}>
                <Button variant="outline" className="text-text border-purple-500/20 hover:bg-purple-500/10">
                  View
                </Button>
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
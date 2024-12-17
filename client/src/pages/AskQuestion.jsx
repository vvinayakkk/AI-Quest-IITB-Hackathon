import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card';

  const AskQuestion = ({isOpen, setIsOpen}) => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle question submission
    console.log({ title, body, tags })
    setIsOpen(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-purple-500/20 animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center border-b border-gray-800 pb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Ask a Question</h2>
              <p className="text-gray-400 text-sm">Get help from the community by providing clear details</p>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full h-10 w-10 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Card className="bg-gray-800/50 border-gray-700 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Title
                    <Input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                      placeholder="What's your programming question? Be specific."
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Body
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={10}
                      className="mt-2 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                      placeholder="Include all the information someone would need to answer your question"
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Tags
                    <Input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="mt-2 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
                      placeholder="Add up to 5 tags separated by commas (e.g., javascript, react, node.js)"
                    />
                  </label>
                </div>
                <div className="pt-4 border-t border-gray-800">
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 shadow-lg shadow-purple-600/20 transition-all duration-200 hover:shadow-purple-600/40"
                  >
                    Post Your Question
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AskQuestion;
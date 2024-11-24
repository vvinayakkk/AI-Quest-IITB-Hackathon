import { motion } from "framer-motion"
import { Send, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { EmojiPickerButton } from "./reply-input/EmojiPickerButton"
import { ActionButtons } from "./reply-input/ActionButtons"
import { useReplyForm } from "@/hooks/useReplyForm"

export default function ReplyInput({ onSubmit }) {
  const {
    replyText,
    setReplyText,
    isLoading,
    handleSubmit,
    addEmoji,
    addMention,
    addHashtag,
    handleFileUpload
  } = useReplyForm(onSubmit)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="bg-background/95 border-primary/20 backdrop-blur">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Share your thoughts..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[120px] bg-background border-primary/20 text-text
                         focus:ring-2 focus:ring-primary/20 transition-all
                         resize-none rounded-xl p-4 pr-12"
                maxLength={500}
              />
              <div className="absolute bottom-4 right-4">
                <span className="text-sm text-muted-foreground">
                  {replyText.length}/500
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EmojiPickerButton onEmojiSelect={addEmoji} />
                <ActionButtons
                  onMention={addMention}
                  onHashtag={addHashtag}
                  onFileUpload={handleFileUpload}
                />
              </div>

              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                disabled={!replyText.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Post Reply
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
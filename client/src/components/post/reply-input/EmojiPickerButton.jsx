
import { Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import EmojiPicker from 'emoji-picker-react'

export function EmojiPickerButton({ onEmojiSelect }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 border-primary/20" 
        side="top"
        align="start"
      >
        <EmojiPicker
          onEmojiClick={onEmojiSelect}
          autoFocusSearch={false}
          theme="dark"
          width={320}
          height={400}
          searchDisabled
          skinTonesDisabled
          previewConfig={{ showPreview: false }}
        />
      </PopoverContent>
    </Popover>
  )
}
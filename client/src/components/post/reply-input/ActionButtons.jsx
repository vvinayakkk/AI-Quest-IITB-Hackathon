import { AtSign, Hash, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef } from "react"

export function ActionButtons({ onMention, onHashtag, onFileUpload }) {
  const fileInputRef = useRef(null)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
    e.target.value = '' // Reset input
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-primary"
        onClick={onMention}
      >
        <AtSign className="h-5 w-5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-primary"
        onClick={onHashtag}
      >
        <Hash className="h-5 w-5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-primary"
        onClick={handleFileClick}
      >
        <ImageIcon className="h-5 w-5" />
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  )
}
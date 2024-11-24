import { useState, useCallback } from "react"

export function useReplyForm(onSubmit) {
  const [replyText, setReplyText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    
    setIsLoading(true)
    try {
      await onSubmit(replyText)
      setReplyText("")
    } catch (error) {
      console.error("Failed to submit reply:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addEmoji = (emojiObject) => {
    setReplyText(prev => prev + emojiObject.emoji)
  }

  const insertAtCursor = (textToInsert) => {
    const textarea = document.querySelector('textarea')
    const cursorPos = textarea?.selectionStart || replyText.length
    const textBefore = replyText.substring(0, cursorPos)
    const textAfter = replyText.substring(cursorPos)
    setReplyText(textBefore + textToInsert + ' ' + textAfter)
  }

  const addMention = () => {
    insertAtCursor('@')
  }

  const addHashtag = () => {
    insertAtCursor('#')
  }

  const handleFileUpload = (file) => {
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setSelectedFile(file)
      insertAtCursor(`[Image: ${file.name}] `)
    } else {
      alert('File size should be less than 5MB')
    }
  }

  return {
    replyText,
    setReplyText,
    isLoading,
    selectedFile,
    handleSubmit,
    addEmoji,
    addMention,
    addHashtag,
    handleFileUpload
  }
}
import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handlePrev = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setSelectedImage(image)
              setCurrentIndex(index)
            }}
          >
            <img
              src={image.url}
              alt={"Post image"}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95">
          <div className="relative h-[80vh]">
            <img
              src={images[currentIndex]?.url}
              alt={"Post image"}
              className="w-full h-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
            {/* <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button> */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ImageGallery
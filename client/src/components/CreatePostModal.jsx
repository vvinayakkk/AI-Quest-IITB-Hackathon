import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { X, Upload, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const CreatePostModal = ({ isOpen, onClose }) => {
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: [],
    images: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const fileInputRef = useRef(null);

  const handleTagInput = (e) => {
    const value = e.target.value;
    if (value.endsWith(' ') || value.endsWith(',')) {
      const tag = value.slice(0, -1).trim().toLowerCase();
      if (tag && !newPost.tags.includes(tag) && newPost.tags.length < 5) {
        setNewPost(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
      }
      setCurrentTag('');
    } else {
      setCurrentTag(value);
    }
  };

  const removeTag = (tagToRemove) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 3 - newPost.images.length;

    if (remainingSlots <= 0)
      return;

    files.slice(0, remainingSlots).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewPost(prev => ({
            ...prev,
            images: [...prev.images, {
              id: Date.now(),
              data: reader.result
            }]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${SERVER_URL}/post/new`, newPost);
      setNewPost({ title: '', content: '', tags: [], images: [] });
      onClose();
    } catch (error) {
      console.error('Error creating post', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-black/60 backdrop-blur-xl rounded-xl p-6 w-full max-w-2xl my-8 border border-purple-500/20 shadow-xl shadow-purple-500/5"
      >
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create a New Post
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-6">
          <Input
            placeholder="Post Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            required
            className="bg-black/40 border-gray-800 focus:border-purple-500 text-white placeholder:text-gray-500"
          />

          <Textarea
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            required
            rows={4}
            className="bg-black/40 border-gray-800 focus:border-purple-500 text-white placeholder:text-gray-500"
          />

          <div className="space-y-3">
            <Input
              placeholder={newPost.tags.length >= 5 ? "Max tags reached" : "Add tags (press space/comma after each tag)"}
              value={currentTag}
              onChange={handleTagInput}
              disabled={newPost.tags.length >= 5}
              className="bg-black/40 border-gray-800 focus:border-purple-500 text-white placeholder:text-gray-500"
            />
            <div className="flex flex-wrap gap-1.5">
              {newPost.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-purple-500/10 text-purple-300 px-2 py-0.5 text-xs rounded-full flex items-center gap-1 border border-purple-500/20"
                >
                  #{tag}
                  <XCircle
                    className="h-3 w-3 cursor-pointer hover:text-purple-400"
                    onClick={() => removeTag(tag)}
                  />
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {5 - newPost.tags.length} tags remaining
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              disabled={newPost.images.length >= 3}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/60"
              onClick={() => fileInputRef.current?.click()}
              disabled={newPost.images.length >= 3}
            >
              <Upload className="h-4 w-4 mr-2" />
              {newPost.images.length >= 3 ? 'Image limit reached' : 'Upload Images'}
            </Button>
            <p className="text-xs text-gray-500">
              {3 - newPost.images.length} image slots remaining (max 3)
            </p>

            {newPost.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {newPost.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.data}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg ring-1 ring-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full 
                               opacity-0 group-hover:opacity-100 transition-opacity
                               hover:bg-black"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2.5 shadow-lg shadow-purple-500/20"
          >
            Publish Post
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default CreatePostModal;
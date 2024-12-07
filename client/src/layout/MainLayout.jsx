import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet } from 'react-router-dom'
import { Plus } from 'lucide-react';
import CreatePostModal from '@/components/CreatePostModal';
import { useState } from 'react';

const MainLayout = () => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  return (
    <div>
      <Navbar />
      <Sidebar />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsPostModalOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-500 text-white p-4 rounded-full shadow-lg hover:bg-purple-600 z-50"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        <CreatePostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
        />
      </AnimatePresence>

      <Outlet />
    </div>
  )
}

export default MainLayout
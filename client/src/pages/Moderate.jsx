import React, { useState, useEffect } from 'react';
import { Users, Shield, Ban, Search, Trash2 } from 'lucide-react';
import axios from 'axios';

const Moderate = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const BACKEND_URL = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/user/allUsers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        // The data is directly available in response.data
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to make a user a moderator
  const makeModerator = async (userId) => {
    try {
      await axios.put(`${BACKEND_URL}/user/${userId}/role`, 
        { role: 'moderator' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: 'moderator' } : user
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  // Function to ban a user
  const banUser = async (userId) => {
    try {
      await axios.put(`${BACKEND_URL}/user/${userId}/role`,
        { role: 'banned' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: 'banned' } : user
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to ban user');
    }
  };

  // Add deleteUser function
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-text">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 max-w-[900px] mx-auto">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center text-text">
          <Users className="mr-3 text-primary" /> User Management
        </h1>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <input 
            type="text" 
            placeholder="Search users by username or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 bg-background border border-secondary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent text-text placeholder:text-gray-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
        </div>

        {/* User Table */}
        <div className="bg-secondary/20 shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="p-4 text-left text-text">Name</th>
                <th className="p-4 text-left text-text">Email</th>
                <th className="p-4 text-left text-text">Role</th>
                <th className="p-4 text-left text-text">Answers</th>
                <th className="p-4 text-center text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} className="border-b border-secondary/30 hover:bg-secondary/40">
                  <td className="p-4 text-text">{user.firstName}</td>
                  <td className="p-4 text-text">{user.email}</td>
                  <td className="p-4">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-semibold
                      ${user.role === 'moderator' ? 'bg-accent/20 text-accent' : 
                        user.role === 'banned' ? 'bg-red-900/20 text-red-400' : 
                        'bg-primary/20 text-primary'}
                    `}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-text">{user.answers}</td>
                  <td className="p-4 flex justify-center space-x-2">
                    {user.role !== 'moderator' && (
                      <button 
                        onClick={() => makeModerator(user._id)}
                        className="flex items-center bg-accent/20 text-accent px-3 py-1 rounded-md hover:bg-accent/30 transition"
                      >
                        <Shield className="mr-1 w-4 h-4" /> Moderator
                      </button>
                    )}
                    {user.role !== 'banned' && (
                      <button 
                        onClick={() => banUser(user._id)}
                        className="flex items-center bg-red-900/20 text-red-400 px-3 py-1 rounded-md hover:bg-red-900/30 transition"
                      >
                        <Ban className="mr-1 w-4 h-4" /> Ban
                      </button>
                    )}
                    <button 
                      onClick={() => deleteUser(user._id)}
                      className="flex items-center bg-red-900/20 text-red-400 px-3 py-1 rounded-md hover:bg-red-900/30 transition"
                    >
                      <Trash2 className="mr-1 w-4 h-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* No Users Found Message */}
          {filteredUsers.length === 0 && (
            <div className="text-center p-6 text-primary/70">
              No users found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Moderate;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Shield } from 'lucide-react';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/auth/signup', {
        firstName,
        lastName,
        email,
        password
      });

      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Redirect to login or home page
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border border-purple-500/20 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-gray-400">Join our community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:outline-none 
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                  placeholder="First Name"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:outline-none 
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                  placeholder="Last Name"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg 
                  text-white placeholder-gray-500 focus:outline-none 
                  focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg 
                  text-white placeholder-gray-500 focus:outline-none 
                  focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                placeholder="Create a strong password"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg 
                  text-white placeholder-gray-500 focus:outline-none 
                  focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              required
              className="rounded bg-gray-700 border-transparent text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
              I agree to the{' '}
              <a href="/terms" className="text-purple-500 hover:text-purple-400">
                Terms of Service
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg 
              transition duration-300 ease-in-out transform hover:scale-[1.02] 
              focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="text-purple-500 hover:text-purple-400 font-semibold"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
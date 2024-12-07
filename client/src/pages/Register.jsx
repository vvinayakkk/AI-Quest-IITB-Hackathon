import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Shield, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'Member'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Enhanced validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await axios.post('http://localhost:3000/auth/signup', submitData);

      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Redirect to profile page
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md bg-gray-800 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-white">
            Create Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
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
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                Department
              </label>
              <div className="relative">
                <BookMarked className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:outline-none 
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                  placeholder="Your department (optional)"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Create Account
            </Button>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { User, Mail, Lock, Shield, BookMarked, Upload, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'Member',
    avatar: null
  });
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prevState => ({
          ...prevState,
          avatar: base64String
        }));
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
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
      await register(submitData);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-gray-800 border-purple-500/20">
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

            {/* Updated Avatar section with better styling */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-purple-500/20 group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <User className="w-14 h-14 text-gray-400" />
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 bg-black/50 flex items-center justify-center 
                           opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-white" />
                </label>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
            </div>

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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:outline-none 
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
                           hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-lg 
                    text-white placeholder-gray-500 focus:outline-none 
                    focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
                           hover:text-gray-300 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-3 bg-gray-900/50 border border-gray-700 rounded-lg 
                         text-white appearance-none focus:outline-none 
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              >
                <option value="Member">Member</option>
                <option value="Moderator">Moderator</option>
              </select>
              <div className="absolute right-3 top-[42px] pointer-events-none text-gray-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
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

export default SignupPage;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ShieldCheck, GraduationCap, Eye, EyeOff, BookOpen, Plus, Check } from 'lucide-react';

const SignupPage = () => {
  const { signup, subjects, addSubject } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setError, setValue } = useForm();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const onSubmit = async (data) => {
    try {
      await signup(data.name, data.email, data.password, data.role, data.subject);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('root', { 
        type: 'manual', 
        message: err.response?.data?.message || 'Something went wrong. Please try again.' 
      });
    }
  };

  const handleAddNewSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      await addSubject(newSubjectName.trim());
      setValue('subject', newSubjectName.trim());
      setIsAddingNewSubject(false);
      setNewSubjectName('');
    } catch (err) {
      alert('Error adding new subject');
    }
  };

  const selectedRole = watch('role');

  if (success) {
// ... existing success UI ...
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-sm w-full mx-4 border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 font-sans">Success!</h2>
          <p className="text-gray-500 font-medium">Your account has been created. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-2">tailwebs.</h1>
          <p className="text-gray-500 font-medium lowercase tracking-widest uppercase">Create Your Account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <UserPlus className="text-primary w-6 h-6" />
            Sign Up
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest pl-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900 font-medium`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                  })}
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900 font-medium`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest pl-1">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative cursor-pointer group">
                  <input
                    type="radio"
                    value="student"
                    {...register('role', { required: 'Please select a role' })}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-100 rounded-xl flex flex-col items-center gap-2 peer-checked:border-primary peer-checked:bg-primary/5 group-hover:bg-gray-50 transition-all">
                    <GraduationCap className="w-6 h-6 text-gray-400 peer-checked:text-primary" />
                    <span className="text-xs font-bold text-gray-600">Student</span>
                  </div>
                </label>
                <label className="relative cursor-pointer group">
                  <input
                    type="radio"
                    value="teacher"
                    {...register('role', { required: 'Please select a role' })}
                    className="sr-only peer"
                  />
                  <div className="p-4 border-2 border-gray-100 rounded-xl flex flex-col items-center gap-2 peer-checked:border-primary peer-checked:bg-primary/5 group-hover:bg-gray-50 transition-all">
                    <ShieldCheck className="w-6 h-6 text-gray-400 peer-checked:text-primary" />
                    <span className="text-xs font-bold text-gray-600">Teacher</span>
                  </div>
                </label>
              </div>
              {errors.role && <p className="mt-2 text-xs text-red-500">{errors.role.message}</p>}
            </div>

            {selectedRole === 'teacher' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Primary Subject</label>
                  {!isAddingNewSubject && (
                    <button 
                      type="button"
                      onClick={() => setIsAddingNewSubject(true)}
                      className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add New
                    </button>
                  )}
                </div>
                
                {isAddingNewSubject ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BookOpen className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        autoFocus
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-primary/30 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900 font-medium font-sans"
                        placeholder="Subject Name (e.g. Robotics)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={handleAddNewSubject}
                        className="flex-1 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"
                      >
                        <Check className="w-3 h-3" /> Create & Select
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingNewSubject(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...register('subject', { required: 'Subject is required for teachers' })}
                      className={`block w-full pl-10 pr-3 py-3 border ${errors.subject ? 'border-red-500' : 'border-gray-300'} rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900 font-medium appearance-none`}
                    >
                      <option value="">Select Department</option>
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest pl-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                  className={`block w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900 font-medium`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all uppercase tracking-wider mt-4"
            >
              {isSubmitting ? 'Creating Account...' : 'Register Now'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

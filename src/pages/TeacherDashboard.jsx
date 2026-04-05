import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, MoreVertical, FileText, CheckCircle2, Clock, Send, Trash2, Edit3, ArrowRight, File, User, Calendar, Settings, UserCircle, BookOpen, Save, X, Check } from 'lucide-react';
import { format } from 'date-fns';

const TeacherDashboard = () => {
  const { user, updateProfile, subjects, addSubject, socket } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [meta, setMeta] = useState({ total: 0, published: 0, drafts: 0, totalSubmissions: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });
  const [profileData, setProfileData] = useState({ name: user?.name || '', subject: user?.subject || '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    fetchAssignments();

    // Setup real-time auto-refresh
    if (socket) {
      socket.on('assignments-changed', fetchAssignments);
      return () => socket.off('assignments-changed', fetchAssignments);
    }
  }, [socket, filter]);

  const fetchAssignments = async () => {
    try {
      const { data } = await client.get('/assignments');
      
      // Defensively handle both old (array) and new (object) backend formats
      let assignmentsData = data.assignments || (Array.isArray(data) ? data : []);
      
      // AUTO-SORT BY NEWEST FIRST (Latest on top)
      assignmentsData = [...assignmentsData].sort((a, b) => b.id - a.id);

      // If server provides meta, use it. Otherwise, calculate locally for the visible list.
      const metaData = data.meta || { 
        total: assignmentsData.length, 
        published: assignmentsData.filter(a => a.status === 'Published').length,
        drafts: assignmentsData.filter(a => a.status === 'Draft').length,
        totalSubmissions: assignmentsData.reduce((acc, curr) => acc + (curr.submissionCount || 0), 0)
      };

      setAssignments(assignmentsData);
      setMeta(metaData);
    } catch (err) {
      console.error('Error fetching assignments', err);
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await client.put(`/assignments/${editingId}`, newAssignment);
      } else {
        await client.post('/assignments', newAssignment);
      }
      setShowCreateModal(false);
      setIsEditing(false);
      setEditingId(null);
      setNewAssignment({ title: '', description: '', dueDate: '' });
      fetchAssignments();
    } catch (err) {
      console.error('Error saving assignment', err);
      alert(err.response?.data?.message || 'Error saving assignment');
    }
  };

  const openEditModal = (assignment) => {
    setNewAssignment({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate.split('T')[0] // Format for date input
    });
    setEditingId(assignment.id);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const openCreateModal = () => {
    setNewAssignment({ title: '', description: '', dueDate: '' });
    setIsEditing(false);
    setEditingId(null);
    setShowCreateModal(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await client.put(`/assignments/${id}/status`, { status });
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      await client.delete(`/assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting assignment');
    }
  };

  const viewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    try {
      const { data } = await client.get(`/submissions/${assignment.id}`);
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const finalSubject = profileData.subject === 'Other' ? profileData.customSubject : profileData.subject;
      await updateProfile(profileData.name, finalSubject);
      setShowProfileModal(false);
      fetchAssignments(); // Refresh to catch any new assignments in the new subject
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const filteredAssignments = filter === 'All' 
    ? assignments 
    : assignments.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-primary pl-4">Assignment Overview</h1>
            <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest pl-4">Manage your teaching workflow</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center px-5 py-3 border border-gray-200 rounded-xl shadow-sm text-gray-600 bg-white hover:bg-gray-50 transition-all font-bold uppercase text-xs tracking-widest"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button 
              onClick={openCreateModal}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-white bg-primary hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-bold uppercase text-xs tracking-widest"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Assignment
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Assignments', value: meta.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Drafts', value: meta.drafts, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Published', value: meta.published, icon: Send, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Submissions', value: meta.totalSubmissions, icon: CheckCircle2, color: 'text-primary', bg: 'bg-red-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-all hover:shadow-md">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</p>
                <p className="text-[10px] uppercase font-black text-gray-400 mt-2 tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Filter By Status</span>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg self-start">
              {['All', 'Draft', 'Published', 'Completed'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFilter(s);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all uppercase tracking-widest ${
                    filter === s 
                      ? 'bg-white text-primary shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Assignment</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Submissions</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                   <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400">Loading assignments...</td>
                   </tr>
                ) : filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-medium italic">No assignments found matching your filter.</td>
                  </tr>
                ) : filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          assignment.status === 'Completed' ? 'bg-primary/10 text-primary' : 
                          assignment.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">{assignment.title}</p>
                            {assignment.subject && (
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary/60 px-2 py-0.5 rounded border border-primary/10">
                                {assignment.subject}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">{assignment.description}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Publisher: {assignment.teacherName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button 
                        onClick={() => viewSubmissions(assignment)}
                        className="flex items-center gap-2 group/sub cursor-pointer"
                      >
                         <div className="flex -space-x-2">
                            {[1, 2, 3].slice(0, assignment.submissionCount).map((_, i) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-white border-2 border-white ring-1 ring-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">
                                <User className="w-3 h-3" />
                              </div>
                            ))}
                            {assignment.submissionCount > 3 && (
                              <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-white ring-1 ring-gray-100 flex items-center justify-center text-[8px] font-black text-primary">
                                +{assignment.submissionCount - 3}
                              </div>
                            )}
                            {assignment.submissionCount === 0 && (
                               <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest pl-2">None yet</span>
                            )}
                         </div>
                         {assignment.submissionCount > 0 && (
                           <span className="text-[10px] font-black text-primary uppercase ml-2 group-hover/sub:underline">
                             {assignment.submissionCount} Submissions
                           </span>
                         )}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        assignment.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        assignment.status === 'Published' ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-red-50 text-primary border-primary/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          assignment.status === 'Draft' ? 'bg-amber-500' :
                          assignment.status === 'Published' ? 'bg-green-500' : 'bg-primary'
                        }`}></div>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                       {assignment.status === 'Draft' && (
                         <>
                          <button onClick={() => openEditModal(assignment)} className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-all" title="Edit Draft">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(assignment.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Draft">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusChange(assignment.id, 'Published')} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Publish Assignment">
                            <Send className="w-4 h-4" />
                          </button>
                         </>
                       )}
                       {assignment.status === 'Published' && (
                         <>
                          <button onClick={() => viewSubmissions(assignment)} className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-all" title="View Submissions">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusChange(assignment.id, 'Completed')} className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-lg transition-all" title="Mark as Completed">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                         </>
                       )}
                       {assignment.status === 'Completed' && (
                         <button onClick={() => viewSubmissions(assignment)} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg transition-all">
                            Submissions
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  Previous
                </button>
                <button 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark shadow-sm disabled:opacity-50 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="bg-primary px-8 py-8 text-white relative">
              <h2 className="text-2xl font-bold uppercase tracking-widest">{isEditing ? 'Edit Assignment' : 'New Assignment'}</h2>
              <p className="text-white/70 text-xs font-bold mt-1 tracking-wider uppercase">
                {isEditing ? 'Modify your assignment details' : 'Set up a new task for your students'}
              </p>
              <button onClick={() => setShowCreateModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Assignment Title</label>
                <input 
                  required
                  value={newAssignment.title}
                  placeholder="E.g. React Fundamentals Quiz"
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-gray-800 font-bold placeholder:text-gray-300 transition-all"
                  onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Description</label>
                <textarea 
                  required
                  rows="3"
                  value={newAssignment.description}
                  placeholder="Provide details about the assignment..."
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-gray-800 font-bold placeholder:text-gray-300 transition-all"
                  onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Due Date</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-gray-300">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input 
                    type="date"
                    required
                    value={newAssignment.dueDate}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-gray-800 font-bold cursor-pointer transition-all"
                    onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-300">
                    {/* The native date picker icon will typically appear here in most browsers */}
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-primary text-white rounded-2xl shadow-lg hover:bg-primary-dark transition-all transform hover:-translate-y-0.5 font-black uppercase text-sm tracking-[0.2em]"
              >
                {isEditing ? 'Save Changes' : 'Create Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="bg-gray-900 px-8 py-10 text-white relative text-center">
               <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 backdrop-blur-md">
                  <UserCircle className="w-12 h-12 text-primary" />
               </div>
               <h2 className="text-xl font-bold uppercase tracking-widest">Manage Profile</h2>
               <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Update your personal details</p>
               <button onClick={() => setShowProfileModal(false)} className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
               </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <input 
                    required
                    value={profileData.name}
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-4 focus:ring-primary/10 text-gray-800 font-bold placeholder:text-gray-300 transition-all"
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-widest pl-1">Teaching Subject</label>
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
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <input 
                        autoFocus
                        value={newSubjectName}
                        placeholder="E.g. Computer Science"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-4 focus:ring-primary/10 text-gray-800 font-bold placeholder:text-gray-300 transition-all font-sans"
                        onChange={e => setNewSubjectName(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={async () => {
                          if (!newSubjectName.trim()) return;
                          try {
                            await addSubject(newSubjectName.trim());
                            setProfileData({...profileData, subject: newSubjectName.trim()});
                            setIsAddingNewSubject(false);
                            setNewSubjectName('');
                          } catch (err) { alert('Error adding subject'); }
                        }}
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
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <select 
                      required
                      value={profileData.subject}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-4 focus:ring-primary/10 text-gray-800 font-bold appearance-none transition-all"
                      onChange={e => setProfileData({...profileData, subject: e.target.value})}
                    >
                      <option value="">Select Department</option>
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 leading-relaxed italic pl-1">
                  * Changing your subject will immediately show you assignments from colleagues in the new department.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isUpdatingProfile}
                className="w-full py-4 bg-primary text-white rounded-2xl shadow-xl shadow-red-100 hover:bg-primary-dark transition-all transform hover:-translate-y-1 font-black uppercase text-xs tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingProfile ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 h-[80vh] flex flex-col">
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                <p className="text-xs uppercase font-bold text-gray-400 tracking-widest mt-1">Student Submissions</p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {submissions.length === 0 ? (
                <div className="text-center py-20 text-gray-400 italic font-medium">No one has submitted this assignment yet.</div>
              ) : (
                submissions.map(sub => (
                  <div key={sub.id} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-400 border border-gray-200 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{sub.studentName}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Submitted on {format(new Date(sub.submittedAt), 'MMM dd, yyyy HH:mm')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm text-gray-600 line-height-relaxed shadow-sm">
                      {sub.answer}
                    </div>
                    {sub.file && (
                      <div className="mt-3 bg-white p-3 rounded-xl border border-gray-50 flex items-center justify-between group-hover:border-primary/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/5 rounded-lg">
                            <File className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700">{sub.file.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Attachment ({(sub.file.size / 1024 / 1024).toFixed(2)} MB)</p>
                          </div>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

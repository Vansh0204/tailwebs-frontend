import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FileText, Send, Clock, CheckCircle2, AlertCircle, Calendar, Plus, Paperclip, File, X } from 'lucide-react';
import { format, isPast } from 'date-fns';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState({}); // assignmentId -> submission

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes] = await Promise.all([
        client.get('/assignments')
      ]);
      
      setAssignments(assignmentsRes.data);
      
      // Fetch submissions for each assignment to check status
      const submissionPromises = assignmentsRes.data.map(a => 
        client.get(`/submissions/${a.id}`).catch(() => ({ data: null }))
      );
      
      const submissionResults = await Promise.all(submissionPromises);
      const submissionMap = {};
      submissionResults.forEach((res, index) => {
        if (res.data) {
          submissionMap[assignmentsRes.data[index].id] = res.data;
        }
      });
      setSubmissions(submissionMap);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    setSubmitting(true);
    try {
      await client.post('/submissions', { 
        assignmentId: selectedAssignment.id, 
        answer,
        file: selectedFile ? {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        } : null
      });
      setSelectedAssignment(null);
      setAnswer('');
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting answer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-primary pl-4">Hello, {user?.name}!</h1>
            <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest pl-4">Your current learning progress</p>
          </div>
          <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
             <div className="text-right">
                <span className="block text-[10px] uppercase font-black text-gray-400">Total Completed</span>
                <span className="text-sm font-bold text-primary">{Object.keys(submissions).length} Assignments</span>
             </div>
             <div className="h-8 w-px bg-gray-100"></div>
             <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             <div className="col-span-full text-center py-20 text-gray-400 italic">Finding your assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
               <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-400 font-medium">No published assignments available at the moment.</p>
            </div>
          ) : assignments.map(assignment => {
            const submission = submissions[assignment.id];
            const isDue = isPast(new Date(assignment.dueDate));
            const isCompleted = assignment.status === 'Completed';

            return (
              <div 
                key={assignment.id} 
                className={`group relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                  submission || isCompleted ? 'opacity-80' : ''
                }`}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${
                      submission ? 'bg-green-50 text-green-600' : 'bg-primary/5 text-primary'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    {submission ? (
                      <span className="flex items-center text-[10px] uppercase font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                         <CheckCircle2 className="w-3 h-3 mr-1" />
                         Submitted
                      </span>
                    ) : isDue ? (
                      <span className="text-[10px] uppercase font-black text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                         Past Due
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                         Pending
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{assignment.title}</h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[40px]">{assignment.description}</p>
                  
                  <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-400 font-bold uppercase tracking-tighter">
                        <Calendar className="w-4 h-4 mr-1.5 text-gray-300" />
                        Due {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-[10px] font-black uppercase text-primary/60 tracking-widest">
                        <User className="w-3.5 h-3.5 mr-1.5" />
                        Prof. {assignment.teacherName}
                      </div>
                    </div>
                    
                    {submission ? (
                      <button 
                        onClick={() => setSelectedAssignment({...assignment, viewOnly: true})}
                        className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
                      >
                        View Answer
                      </button>
                    ) : (
                      <button 
                        disabled={isDue || isCompleted}
                        onClick={() => setSelectedAssignment(assignment)}
                        className={`inline-flex items-center px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all ${
                          isDue || isCompleted
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-dark shadow-red-200'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5 mr-2" />
                        Submit Task
                      </button>
                    )}
                  </div>
                </div>
                {isCompleted && (
                   <div className="absolute top-0 right-0 p-1">
                      <div className="bg-primary text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-bl-xl rounded-tr-3xl">
                        Locked
                      </div>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
            <div className="bg-primary px-8 py-10 text-white relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                   <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-widest">{selectedAssignment.title}</h2>
              </div>
              <p className="text-white/70 text-xs font-bold tracking-wider uppercase ml-11">
                {selectedAssignment.viewOnly ? 'Your Submitted Work' : 'Provide your final answer'}
              </p>
              <button onClick={() => setSelectedAssignment(null)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors">
                <Plus className="w-8 h-8 rotate-45" />
              </button>
            </div>
            
            <div className="p-10">
              {selectedAssignment.viewOnly ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-gray-700 italic font-medium leading-relaxed">
                    {submissions[selectedAssignment.id]?.answer}
                  </div>

                  {submissions[selectedAssignment.id]?.file && (
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <File className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{submissions[selectedAssignment.id].file.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Attached File</p>
                        </div>
                      </div>
                      <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                        Download
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                    <Clock className="w-4 h-4" />
                    Submitted on {format(new Date(submissions[selectedAssignment.id]?.submittedAt), 'MMMM dd, yyyy @ HH:mm')}
                  </div>
                  <button 
                    onClick={() => setSelectedAssignment(null)}
                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all font-mono"
                  >
                    Close Preview
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 text-amber-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-tighter leading-relaxed">
                      Note: Submissions are final. You won't be able to edit your answer once it's sent.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-3 tracking-[0.2em] pl-1">Your Answer Text</label>
                    <textarea 
                      required
                      placeholder="Start typing your response here..."
                      rows="6"
                      className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 text-gray-800 font-medium placeholder:text-gray-300 transition-all resize-none shadow-inner"
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-3 tracking-[0.2em] pl-1">Attach File (Optional)</label>
                    {!selectedFile ? (
                      <div className="relative group">
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                        <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                          <Paperclip className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors" />
                          <p className="text-xs font-bold text-gray-400 group-hover:text-primary uppercase tracking-widest">Click or drag to upload from device</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <File className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{selectedFile.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-red-500"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={submitting || !answer.trim()}
                    className="w-full py-5 bg-primary text-white rounded-2xl shadow-xl shadow-red-100 hover:bg-primary-dark transition-all transform hover:-translate-y-1 font-black uppercase text-sm tracking-[0.3em] disabled:opacity-50"
                  >
                    {submitting ? 'Sending Work...' : 'Submit Now'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

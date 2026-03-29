import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Plus, Clock, User, 
  MapPin, Phone, Truck, X, Loader2
} from 'lucide-react';

export default function DailyOps() {
  const [staffList, setStaffList] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    staffId: '',
    hour: '10',
    type: 'FOLLOW_UP', // FOLLOW_UP, DELIVERY, MEETING
    client: ''
  });

  const START_HOUR = 8; // 8 AM
  const END_HOUR = 20;  // 8 PM
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

  // 1. Fetch Real Staff & Load Persistent Tasks
  const initSchedule = useCallback(async () => {
    setLoading(true);
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.invoke('get_all_staff');
        setStaffList(data && data.length > 0 ? data : [{ id: 'system', name: 'System Admin' }]);
      } else {
        setStaffList([{ id: 'system', name: 'System Admin' }]);
      }
      
      const savedTasks = JSON.parse(localStorage.getItem('vs_daily_tasks') || '[]');
      setTasks(savedTasks);
    } catch (error) {
      console.error("Failed to load schedule data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSchedule();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, [initSchedule]);

  // 2. Save Task Logic
  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.staffId) return;

    const taskRecord = {
      id: Date.now().toString(),
      ...newTask,
      hour: parseInt(newTask.hour)
    };

    const updatedTasks = [...tasks, taskRecord];
    setTasks(updatedTasks);
    localStorage.setItem('vs_daily_tasks', JSON.stringify(updatedTasks));
    
    setIsAdding(false);
    setNewTask({ title: '', staffId: staffList[0]?.id || '', hour: '10', type: 'FOLLOW_UP', client: '' });
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    localStorage.setItem('vs_daily_tasks', JSON.stringify(updatedTasks));
  };

  // Real-time timeline indicator calculation
  const currentHour = currentTime.getHours();
  const currentMin = currentTime.getMinutes();
  const showTimeLine = currentHour >= START_HOUR && currentHour <= END_HOUR;
  const timeLineTopOffset = ((currentHour - START_HOUR) * 120) + ((currentMin / 60) * 120); // 120px is row height

  return (
    <div className="flex flex-col h-full gap-6 select-none font-sans text-white overflow-hidden relative">
      
      {/* ADD TASK MODAL (Frosted Glass iOS Style) */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1c1c1e] w-[450px] rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] border border-white/5 overflow-hidden"
            >
              <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#252525]/50">
                <h3 className="font-bold text-xl tracking-tight">Schedule Operation</h3>
                <button onClick={() => setIsAdding(false)} className="text-[#888888] hover:text-white transition-colors"><X size={24}/></button>
              </div>
              
              <form onSubmit={handleSaveTask} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Task Title *</label>
                  <input required autoFocus type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-[#0a0a0a] p-4 rounded-2xl border-none outline-none text-white font-bold focus:ring-2 focus:ring-[#007AFF] transition-all" placeholder="e.g. Restock Inventory" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Assign To</label>
                    <select value={newTask.staffId} onChange={e => setNewTask({...newTask, staffId: e.target.value})} className="w-full bg-[#0a0a0a] p-4 rounded-2xl border-none outline-none text-white font-bold focus:ring-2 focus:ring-[#007AFF] cursor-pointer">
                      <option value="" disabled>Select Staff</option>
                      {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Time Block</label>
                    <select value={newTask.hour} onChange={e => setNewTask({...newTask, hour: e.target.value})} className="w-full bg-[#0a0a0a] p-4 rounded-2xl border-none outline-none text-white font-bold focus:ring-2 focus:ring-[#007AFF] cursor-pointer">
                      {hours.map(h => <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Operation Type</label>
                  <div className="flex gap-2">
                    {['FOLLOW_UP', 'DELIVERY', 'MEETING'].map(type => (
                      <button 
                        key={type} type="button" onClick={() => setNewTask({...newTask, type})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${newTask.type === type ? 'bg-[#007AFF] text-white shadow-glow-blue' : 'bg-[#0a0a0a] text-[#888888] hover:bg-[#252525]'}`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full py-5 mt-4 bg-[#007AFF] hover:bg-[#007AFF]/80 text-white rounded-[2rem] font-black tracking-widest uppercase transition-all shadow-[0_10px_40px_-10px_rgba(0,122,255,0.8)] active:scale-95">
                  Confirm Schedule
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER: Title & Actions */}
      <div className="flex items-center justify-between shrink-0">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-3xl font-bold text-white tracking-tight">Operations Grid</h1>
          <p className="text-[#888888] text-sm mt-1 font-medium">{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-[#1c1c1e] text-white font-bold rounded-2xl flex items-center gap-2 border border-white/5 hover:bg-[#252525] transition-all">
            <Calendar size={18} className="text-[#888888]"/> Today
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-[#007AFF] text-white font-bold rounded-2xl flex items-center gap-2 shadow-glow-blue hover:bg-[#007AFF]/80 transition-all active:scale-95"
          >
            <Plus size={18} /> Schedule Task
          </button>
        </div>
      </div>

      {/* BODY: Master Calendar Grid */}
      <div className="flex-1 bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] relative">
        
        {loading && (
          <div className="absolute inset-0 bg-[#1c1c1e]/60 backdrop-blur-sm z-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#007AFF]" size={40} />
          </div>
        )}

        {/* Top Resource Header Row */}
        <div className="flex border-b border-[#2a2a2a] bg-[#1c1c1e] shrink-0 sticky top-0 z-10">
          <div className="w-24 shrink-0 border-r border-[#2a2a2a]"></div> {/* Empty top-left corner */}
          {staffList.map(staff => (
            <div key={staff.id} className="flex-1 p-4 border-r border-[#2a2a2a] last:border-r-0 flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-[10px] font-black text-[#888888]">
                {staff.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-sm text-white tracking-tight">{staff.name}</span>
            </div>
          ))}
        </div>

        {/* Scrollable Time Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0a0a0a]">
          
          {/* Live Time Indicator Line */}
          {showTimeLine && (
            <div 
              className="absolute left-24 right-0 h-px bg-[#FF5F56] z-20 pointer-events-none flex items-center shadow-[0_0_10px_rgba(255,95,86,0.8)]"
              style={{ top: `${timeLineTopOffset}px` }}
            >
              <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            </div>
          )}

          {hours.map((hour, idx) => (
            <div key={hour} className="flex h-[120px] border-b border-[#1c1c1e] last:border-b-0 relative group">
              
              {/* Time Column */}
              <div className="w-24 shrink-0 border-r border-[#1c1c1e] flex justify-end pr-4 pt-2">
                <span className="text-[11px] font-bold text-[#888888] tracking-widest">
                  {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                </span>
              </div>

              {/* Staff Columns for this specific hour */}
              {staffList.map(staff => {
                const blockTasks = tasks.filter(t => t.hour === hour && t.staffId === staff.id);
                
                return (
                  <div key={`${hour}-${staff.id}`} className="flex-1 border-r border-[#1c1c1e] last:border-r-0 relative p-2">
                    
                    {/* Render Active Task Blocks */}
                    {blockTasks.map(task => {
                      const isBlue = task.type === 'DELIVERY';
                      return (
                        <div 
                          key={task.id}
                          className={`absolute inset-2 rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all hover:scale-[1.02] cursor-pointer group/task ${
                            isBlue 
                              ? 'bg-[#007AFF] text-white shadow-[0_10px_30px_-10px_rgba(0,122,255,0.6)] border border-[#007AFF]/50' 
                              : 'bg-[#1c1c1e] text-white border border-[#2a2a2a] hover:border-white/20'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[14px] leading-tight line-clamp-2 pr-4">{task.title}</h4>
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isBlue ? 'bg-white' : 'bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.8)]'}`}></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 opacity-80">
                              {task.type === 'DELIVERY' ? <Truck size={12}/> : task.type === 'FOLLOW_UP' ? <Phone size={12}/> : <User size={12}/>}
                              <span className="text-[10px] font-black tracking-widest uppercase">{task.type.replace('_', ' ')}</span>
                            </div>
                            {/* Hidden delete button on hover */}
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className={`opacity-0 group-hover/task:opacity-100 transition-opacity p-1.5 rounded-full ${isBlue ? 'bg-white/20 hover:bg-white/30' : 'bg-[#2a2a2a] hover:bg-[#f87171]/20 hover:text-[#f87171]'}`}>
                              <X size={12} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Subtle grid hover effect for scheduling new empty slots */}
                    {blockTasks.length === 0 && (
                      <div 
                        onClick={() => { setNewTask({...newTask, staffId: staff.id, hour: hour.toString()}); setIsAdding(true); }}
                        className="w-full h-full rounded-2xl border-2 border-dashed border-transparent hover:border-[#2a2a2a] hover:bg-[#1c1c1e]/50 cursor-pointer transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        <Plus size={20} className="text-[#555]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
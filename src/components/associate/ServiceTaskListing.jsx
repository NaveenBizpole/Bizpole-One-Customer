import React, { useState, useMemo } from 'react';
import {
    CheckCircle2, Clock, XCircle, AlertCircle,
    User, ChevronRight, Layout, ArrowRight,
    Search, Filter, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceTaskForm from './ServiceTaskForm';

const ServiceTaskListing = ({ formConfig, serviceDetails, onTaskUpdate }) => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All');

    // ── Logic: Split into Current (5) and Upcoming ──
    // For this logic, we assume 'Current' are the first 5 tasks that are NOT Approved.
    // However, the user wants "if any task approved the upcoming task will come in that position".
    // This means we maintain a window of 5 slots.

    const tasks = useMemo(() => {
        if (!formConfig) return [];
        return formConfig.map((item, index) => ({
            id: item.Id,
            title: item.SubFormMaster?.SubFormName || 'Required Form',
            subtitle: item.Section || item.Sections?.[0]?.SectionName || 'Documentation',
            status: item.Status || 'In review',
            date: item.UpdatedAt ? new Date(item.UpdatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending',
            progress: item.Progress || (item.Status === 'Approved' ? 100 : 40),
            assignee: {
                name: 'Aaron More',
                image: 'https://ui-avatars.com/api/?name=Aaron+More&background=4b49ac&color=fff'
            },
            originalData: item
        }));
    }, [formConfig]);

    const activeTasksSource = useMemo(() => {
        // According to logic: Current tasks are non-approved tasks.
        // But for the UI to match the screenshot (which shows Approved tasks too), 
        // we might need to include them but the user said "if any task approved the upcoming task will come in that position".
        // This strongly implies Approved tasks leave the "Active Slots".
        return tasks.filter(t => t.status !== 'Approved');
    }, [tasks]);

    const filteredTasks = activeTasksSource.filter(t => statusFilter === 'All' || t.status === statusFilter);

    const currentTasks = useMemo(() => filteredTasks.slice(0, 5), [filteredTasks]);
    const upcomingTasks = useMemo(() => filteredTasks.slice(5), [filteredTasks]);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'In review': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Not Approved': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'Disable': return 'bg-slate-50 text-slate-400 border-slate-100 opacity-50';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'bg-emerald-400';
        if (progress >= 50) return 'bg-amber-400';
        return 'bg-rose-400';
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* ── Filters & Search ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {['All', 'Approved', 'In review', 'Not Approved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`whitespace-nowrap pb-2 text-[11px] font-black uppercase tracking-wider transition-all border-b-2 ${statusFilter === status
                                ? 'text-[#4b49ac] border-[#4b49ac]'
                                : 'text-slate-400 border-transparent hover:text-slate-600'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-[#4b49ac]/10 outline-none w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            {/* ── Current Task Section ── */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Current Task</h2>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">
                        {currentTasks.length} Active Slots
                    </span>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-8 py-5">Task</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5">Date</th>
                                    <th className="px-6 py-5">Progress</th>
                                    <th className="px-6 py-5">Assignee</th>
                                    <th className="px-6 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {currentTasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        onClick={() => setSelectedTask(task)}
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${task.status === 'Approved' ? 'bg-amber-400 border-amber-400' : 'border-slate-200 group-hover:border-amber-400'}`}>
                                                    {task.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-slate-700 group-hover:text-[#4b49ac] transition-colors">{task.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{task.subtitle}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-[11px] font-bold text-slate-500">{task.date}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getProgressColor(task.progress)} rounded-full`}
                                                        style={{ width: `${task.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400">{task.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <img src={task.assignee.image} alt={task.assignee.name} className="w-6 h-6 rounded-full ring-2 ring-white" />
                                                <span className="text-[11px] font-bold text-slate-600 whitespace-nowrap">{task.assignee.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#4b49ac] transition-all group-hover:translate-x-1" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ── Upcoming Task Section ── */}
            {upcomingTasks.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-slate-400 tracking-tight">Upcoming Task</h2>
                            <span className="flex items-center justify-center w-6 h-6 bg-amber-400 text-white rounded-full text-[10px] font-black">
                                {upcomingTasks.length}
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-50/30 rounded-3xl border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse opacity-60">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-8 py-5">Task</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5">Date</th>
                                        <th className="px-6 py-5">Progress</th>
                                        <th className="px-6 py-5">Assignee</th>
                                        <th className="px-6 py-5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    {upcomingTasks.map((task) => (
                                        <tr key={task.id} className="cursor-not-allowed grayscale">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-200">
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-slate-400">{task.title}</p>
                                                        <p className="text-[10px] text-slate-300 font-medium">{task.subtitle}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="flex items-center gap-1 text-[10px] font-black text-rose-400 uppercase tracking-wider">
                                                    <XCircle className="w-3 h-3" /> Disable
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 font-bold text-slate-300 text-[11px]">{task.date}</td>
                                            <td className="px-6 py-5">
                                                <div className="w-20 h-1.5 bg-slate-100 rounded-full" />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 opacity-30">
                                                    <img src={task.assignee.image} alt={task.assignee.name} className="w-6 h-6 rounded-full" />
                                                    <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">{task.assignee.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Task Form Modal ── */}
            <AnimatePresence>
                {selectedTask && (
                    <ServiceTaskForm
                        task={selectedTask}
                        serviceDetails={serviceDetails}
                        onClose={() => setSelectedTask(null)}
                        onSuccess={() => {
                            setSelectedTask(null);
                            if (onTaskUpdate) onTaskUpdate();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ServiceTaskListing;

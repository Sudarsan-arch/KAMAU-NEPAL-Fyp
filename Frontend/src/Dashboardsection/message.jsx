import React, { useState } from 'react';
import {
    MessageSquare,
    Inbox,
    Send,
    Archive,
    Star,
    Search,
    Plus,
    MoreVertical,
    User,
    Clock,
    ChevronRight,
    Filter,
    Settings,
    X,
    Menu,
    Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Logo from '../Logo';

const MOCK_MESSAGES = [
    {
        id: '1',
        sender: 'Alex Rivera',
        subject: 'Project Update: Q3 Design System',
        preview: "Hey team, I've just uploaded the latest components to the Figma file. Take a look when you can...",
        time: '10:24 AM',
        unread: true,
        starred: false,
        category: 'inbox',
        avatar: 'https://picsum.photos/seed/alex/100/100'
    },
    {
        id: '2',
        sender: 'Sarah Chen',
        subject: 'Weekly Sync Meeting',
        preview: "Can we move our sync to 2 PM today? I have a conflict with the client call.",
        time: 'Yesterday',
        unread: false,
        starred: true,
        category: 'inbox',
        avatar: 'https://picsum.photos/seed/sarah/100/100'
    },
    {
        id: '3',
        sender: 'Design Weekly',
        subject: 'Your weekly inspiration is here',
        preview: "Discover the top 10 trends in brutalist web design for 2024. From bold typography to...",
        time: 'Mon',
        unread: false,
        starred: false,
        category: 'inbox',
        avatar: 'https://picsum.photos/seed/design/100/100'
    },
    {
        id: '4',
        sender: 'Jordan Smith',
        subject: 'Re: Contract Signature',
        preview: "Thanks for the quick turnaround! I've forwarded the signed documents to the legal team.",
        time: '2 days ago',
        unread: false,
        starred: false,
        category: 'sent',
        avatar: 'https://picsum.photos/seed/jordan/100/100'
    },
    {
        id: '5',
        sender: 'System Admin',
        subject: 'Security Alert: New Login',
        preview: "A new login was detected from a Chrome browser on a macOS device near San Francisco, CA.",
        time: 'Oct 12',
        unread: false,
        starred: false,
        category: 'archived',
        avatar: 'https://picsum.photos/seed/admin/100/100'
    }
];

export default function MessagePage() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState('inbox');
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to log out?');
        if (confirmLogout) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            navigate('/');
        }
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const filteredMessages = MOCK_MESSAGES.filter(msg => {
        const matchesPage = activePage === 'starred' ? msg.starred : msg.category === activePage;
        const matchesSearch = msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesPage && matchesSearch;
    });

    const selectedMessage = MOCK_MESSAGES.find(m => m.id === selectedMessageId);

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleLogout={handleLogout}
            />

            {/* Message App Sidebar Navigation (Secondary) */}
            <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col hidden lg:flex">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                            <MessageSquare size={18} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Messages</span>
                    </div>

                    <button
                        onClick={() => setIsComposeOpen(true)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium transition-all shadow-lg shadow-orange-200 mb-8 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>New Message</span>
                    </button>

                    <nav className="space-y-1">
                        <NavButton
                            active={activePage === 'inbox'}
                            onClick={() => setActivePage('inbox')}
                            icon={<Inbox size={18} />}
                            label="Inbox"
                            count={MOCK_MESSAGES.filter(m => m.category === 'inbox' && m.unread).length}
                        />
                        <NavButton
                            active={activePage === 'starred'}
                            onClick={() => setActivePage('starred')}
                            icon={<Star size={18} />}
                            label="Starred"
                        />
                        <NavButton
                            active={activePage === 'sent'}
                            onClick={() => setActivePage('sent')}
                            icon={<Send size={18} />}
                            label="Sent"
                        />
                        <NavButton
                            active={activePage === 'archived'}
                            onClick={() => setActivePage('archived')}
                            icon={<Archive size={18} />}
                            label="Archived"
                        />
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <img
                            src="https://picsum.photos/seed/me/100/100"
                            alt="User"
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                            referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">Saugat Bista</p>
                            <p className="text-xs text-gray-500 truncate">saugat@example.com</p>
                        </div>
                        <Settings size={16} className="text-gray-400" />
                    </div>
                </div>
            </aside>

            {/* Message List Area */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center px-4 lg:px-8 justify-between shrink-0">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                            />
                        </div>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                            <Filter size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <img
                                    key={i}
                                    src={`https://picsum.photos/seed/user${i}/100/100`}
                                    className="w-8 h-8 rounded-full border-2 border-white"
                                    alt="User"
                                    referrerPolicy="no-referrer"
                                />
                            ))}
                        </div>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold capitalize">{activePage}</h2>
                            <span className="text-sm text-gray-500 font-medium">{filteredMessages.length} messages</span>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {filteredMessages.map((message) => (
                                    <MessageButton
                                        key={message.id}
                                        message={message}
                                        isSelected={selectedMessageId === message.id}
                                        onClick={() => setSelectedMessageId(message.id)}
                                    />
                                ))}
                            </AnimatePresence>

                            {filteredMessages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-20"
                                >
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                        <Inbox size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">No messages found</h3>
                                    <p className="text-gray-500">Try adjusting your search or filter</p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Message Detail / Preview Panel */}
            <AnimatePresence>
                {selectedMessageId && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-[450px] bg-white border-l border-[#E5E7EB] shadow-2xl flex flex-col z-20"
                    >
                        {selectedMessage ? (
                            <>
                                <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                                    <button
                                        onClick={() => setSelectedMessageId(null)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                                    >
                                        <X size={20} />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                                            <Star size={18} className={selectedMessage.starred ? "fill-yellow-400 text-yellow-400" : ""} />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                                            <Archive size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <img
                                            src={selectedMessage.avatar}
                                            alt={selectedMessage.sender}
                                            className="w-12 h-12 rounded-full shadow-sm"
                                            referrerPolicy="no-referrer"
                                        />
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedMessage.sender}</h3>
                                            <p className="text-sm text-gray-500">{selectedMessage.time}</p>
                                        </div>
                                    </div>

                                    <h1 className="text-2xl font-bold mb-6 leading-tight">
                                        {selectedMessage.subject}
                                    </h1>

                                    <div className="prose prose-orange max-w-none text-gray-700 leading-relaxed">
                                        <p>{selectedMessage.preview}</p>
                                        <p className="mt-4">
                                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                        </p>
                                        <p className="mt-4">
                                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-[#E5E7EB] bg-gray-50">
                                    <div className="flex gap-3">
                                        <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md active:scale-95">
                                            Reply
                                        </button>
                                        <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all active:scale-95">
                                            Forward
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <p>Select a message to view</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Compose Modal */}
            <AnimatePresence>
                {isComposeOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
                        >
                            <div className="p-6 bg-orange-600 text-white flex items-center justify-between">
                                <h3 className="text-lg font-bold">New Message</h3>
                                <button
                                    onClick={() => setIsComposeOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">To</label>
                                    <input
                                        type="text"
                                        placeholder="Email or name"
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="What's this about?"
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Message</label>
                                    <textarea
                                        placeholder="Type your message here..."
                                        rows={6}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsComposeOpen(false)}
                                        className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        onClick={() => setIsComposeOpen(false)}
                                        className="px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function NavButton({ active, onClick, icon, label, count }) {
    return (
        <button
            onClick={onClick}
            className={`
        w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
        ${active ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
      `}
        >
            <div className="flex items-center gap-3">
                <span className={`${active ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {icon}
                </span>
                <span className="text-sm">{label}</span>
            </div>
            {count !== undefined && count > 0 && (
                <span className={`
          text-[10px] px-2 py-0.5 rounded-full font-bold
          ${active ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}
        `}>
                    {count}
                </span>
            )}
        </button>
    );
}

function MessageButton({ message, isSelected, onClick }) {
    return (
        <motion.button
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`
        w-full text-left p-5 rounded-2xl transition-all duration-300 border
        ${isSelected
                    ? 'bg-white border-orange-200 shadow-xl shadow-orange-100 ring-2 ring-orange-500/10'
                    : 'bg-white border-transparent hover:border-gray-200 hover:shadow-md shadow-sm'}
      `}
        >
            <div className="flex gap-4">
                <div className="relative shrink-0">
                    <img
                        src={message.avatar}
                        alt={message.sender}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                        referrerPolicy="no-referrer"
                    />
                    {message.unread && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-600 border-2 border-white rounded-full" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm truncate ${message.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {message.sender}
                        </h4>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-medium text-gray-400">{message.time}</span>
                            {message.starred && <Star size={12} className="fill-yellow-400 text-yellow-400" />}
                        </div>
                    </div>

                    <h5 className={`text-sm mb-1 truncate ${message.unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {message.subject}
                    </h5>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {message.preview}
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={18} className="text-gray-300" />
                </div>
            </div>
        </motion.button>
    );
}

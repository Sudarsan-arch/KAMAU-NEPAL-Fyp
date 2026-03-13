import React, { useState } from 'react';
import { Send, MessageSquare, Users, UserCheck, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { broadcastNotification } from './adminService';

const MessageCenter = () => {
  const [recipient, setRecipient] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { success, text }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setResult(null);
    try {
      const res = await broadcastNotification({ recipient, title: title.trim(), message: message.trim() });
      setResult({ success: true, text: `Sent to ${res.count} recipient(s)` });
      setTitle('');
      setMessage('');
    } catch (err) {
      setResult({ success: false, text: err.message || 'Failed to send notification' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-3xl border border-blue-500/20 shadow-xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
          <MessageSquare size={20} />
        </div>
        <h3 className="text-lg font-black text-white tracking-tight uppercase">Broadcast Center</h3>
      </div>

      <form onSubmit={handleSendMessage} className="space-y-4 flex-1 flex flex-col">
        {/* Recipient Selector */}
        <div className="flex gap-2 p-1 bg-gray-950/50 rounded-xl border border-blue-500/10">
          {[
            { id: 'all', label: 'All', icon: Zap },
            { id: 'professionals', label: 'Pros', icon: UserCheck },
            { id: 'users', label: 'Users', icon: Users },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setRecipient(type.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                recipient === type.id
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <type.icon size={12} />
              {type.label}
            </button>
          ))}
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title..."
          className="w-full bg-gray-950/50 border border-blue-500/10 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-gray-700 text-blue-100"
        />

        {/* Message Textarea */}
        <div className="relative flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message body..."
            className="w-full h-28 bg-gray-950/50 border border-blue-500/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-gray-700 resize-none text-blue-100"
          />
        </div>

        {/* Result feedback */}
        {result && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold ${
            result.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {result.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {result.text}
          </div>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={sending || !title.trim() || !message.trim()}
          className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${
            sending || !title.trim() || !message.trim()
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-95'
          }`}
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send size={14} />
              Transmit
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageCenter;
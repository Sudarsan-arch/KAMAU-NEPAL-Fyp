import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: <Clock className="w-3 h-3" />,
      label: 'Pending'
    },
    verified: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Verified'
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Approved'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: <XCircle className="w-3 h-3" />,
      label: 'Rejected'
    }
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;

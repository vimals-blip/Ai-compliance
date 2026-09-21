import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'EFFECTIVE':
      case 'VALID':
      case 'COMPLIANT':
      case 'CLOSED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PARTIAL':
      case 'UNDER_REVIEW':
      case 'PENDING_REVIEW':
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ISSUE':
      case 'NON_COMPLIANT':
      case 'REJECTED':
      case 'EXPIRED':
      case 'NOT_OPERATING':
      case 'OPEN':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'NOT_TESTED':
      case 'PLANNED':
      case 'TODO':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};

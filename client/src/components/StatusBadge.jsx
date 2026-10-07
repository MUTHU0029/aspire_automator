const StatusBadge = ({ status }) => {
  const normalized = String(status || '').toLowerCase();

  let className = 'status-badge';
  if (normalized === 'approved') className += ' status-approved';
  else if (normalized === 'rejected') className += ' status-rejected';
  else className += ' status-pending';

  const labelMap = {
    approved: 'Approved',
    rejected: 'Rejected',
    pending: 'Pending',
  };

  return <span className={className}>{labelMap[normalized] || 'Pending'}</span>;
};

export default StatusBadge;

import React from 'react';

function EmptyState({ icon, title, text, children }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children && <div className="empty-state-actions">{children}</div>}
    </div>
  );
}

export default EmptyState;

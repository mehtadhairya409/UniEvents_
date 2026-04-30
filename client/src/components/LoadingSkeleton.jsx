import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 3 }) => {
  if (type === 'card') {
    return (
      <div className="grid-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: '200px', borderRadius: '12px 12px 0 0' }} />
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton" style={{ height: '14px', width: '30%' }} />
              <div className="skeleton" style={{ height: '22px', width: '90%' }} />
              <div className="skeleton" style={{ height: '22px', width: '70%' }} />
              <div className="skeleton" style={{ height: '14px', width: '50%' }} />
              <div className="skeleton" style={{ height: '14px', width: '60%' }} />
              <div className="skeleton" style={{ height: '6px', width: '100%', marginTop: '4px' }} />
              <div className="skeleton" style={{ height: '42px', width: '100%', borderRadius: '8px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="grid-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton" style={{ height: '14px', width: '60%' }} />
              <div className="skeleton" style={{ height: '40px', width: '40%' }} />
              <div className="skeleton" style={{ height: '12px', width: '80%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'row') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '12px', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="skeleton" style={{ height: '16px', width: '70%' }} />
              <div className="skeleton" style={{ height: '13px', width: '50%' }} />
            </div>
            <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '8px' }} />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;

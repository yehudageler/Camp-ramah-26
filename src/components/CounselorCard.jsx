import { useState } from 'react';
import { AvatarSVG } from './AuthScreen';

export default function CounselorCard({ counselor }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const statsHTML = Object.entries(counselor.funStats || {}).map(([key, val]) => (
    <div className="stat-item" key={key}>
      <span className="stat-label">{key}: </span>{val}
    </div>
  ));

  return (
    <div 
      className={`counselor-card ${isFlipped ? 'flipped' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="counselor-inner">
        <div className="counselor-front">
          <div className="counselor-avatar-container">
            <AvatarSVG avatarType={counselor.avatar} size={90} />
          </div>
          <h3 className="counselor-name">{counselor.name}</h3>
          <span 
            className="counselor-role" 
            style={counselor.isCurrentUser ? { backgroundColor: 'var(--forest-green)' } : {}}
          >
            {counselor.role}
          </span>
          <span className="card-hint">לחצו לכרטיס המלא 🔄</span>
        </div>
        <div className="counselor-back">
          <h3 className="counselor-stats-title">{counselor.name}</h3>
          <div className="counselor-stats">
            {statsHTML}
          </div>
          <span className="card-hint" style={{ color: 'var(--forest-green)', marginTop: '8px' }}>
            לחצו חזרה 🔄
          </span>
        </div>
      </div>
    </div>
  );
}

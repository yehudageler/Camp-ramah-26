import { AvatarSVG } from './AuthScreen';

export default function CounselorCard({ counselor, mode = "grid" }) {
  if (mode === "list") {
    return (
      <div className="counselor-list-item">
        <div className="counselor-list-avatar">
          <AvatarSVG avatarType={counselor.avatar} size={48} />
        </div>
        <div className="counselor-list-info">
          <h3 className="counselor-list-name">{counselor.name}</h3>
          <span 
            className="counselor-list-role" 
            style={counselor.isCurrentUser ? { backgroundColor: 'var(--forest-green)' } : {}}
          >
            {counselor.role}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="counselor-card" style={{ cursor: 'default' }}>
      <div className="counselor-inner" style={{ transform: 'none', transition: 'none' }}>
        <div className="counselor-front" style={{ position: 'relative', transform: 'none' }}>
          <div className="counselor-avatar-container" style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}>
            <AvatarSVG avatarType={counselor.avatar} size={90} />
          </div>
          <h3 className="counselor-name">{counselor.name}</h3>
          <span 
            className="counselor-role" 
            style={counselor.isCurrentUser ? { backgroundColor: 'var(--forest-green)' } : {}}
          >
            {counselor.role}
          </span>
        </div>
      </div>
    </div>
  );
}

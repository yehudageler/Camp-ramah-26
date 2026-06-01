import { AvatarSVG } from './AuthScreen';

export default function CounselorCard({ counselor }) {
  return (
    <div className="counselor-card" style={{ cursor: 'default' }}>
      <div className="counselor-inner" style={{ transform: 'none', transition: 'none' }}>
        <div className="counselor-front" style={{ position: 'relative', transform: 'none' }}>
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
        </div>
      </div>
    </div>
  );
}

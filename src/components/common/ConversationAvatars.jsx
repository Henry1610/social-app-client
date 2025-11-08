const ConversationAvatars = ({ members, size = 48, borderWidth = 2 }) => {
    // size là width và height tính bằng px
    const containerSize = size;
    const avatarSize = Math.round(size * 0.67); // Avatar = 2/3 của container
    
    const positions = [
      "absolute top-0 left-1/2 transform -translate-x-1/2 z-10",
      "absolute bottom-0 left-0 z-20",
      "absolute bottom-0 right-0 z-30",
    ];
  
    return (
      <div className="relative" style={{ width: `${containerSize}px`, height: `${containerSize}px` }}>
        {members?.slice(0, 3)?.map((member, index) => (
          <div
            key={member.user.id}
            className={`rounded-full overflow-hidden shadow-md ${positions[index]}`}
            style={{ 
              width: `${avatarSize}px`, 
              height: `${avatarSize}px`,
              border: `${borderWidth}px solid white`
            }}
          >
            <img
              src={member.user.avatarUrl || "/images/avatar-IG-mac-dinh-1.jpg"}
              alt={member.user.username}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {members?.length > 3 && (
          <div 
            className="absolute bottom-0 right-0 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 shadow-md z-40"
            style={{ 
              width: `${avatarSize}px`, 
              height: `${avatarSize}px`,
              fontSize: `${Math.round(avatarSize * 0.4)}px`,
              border: `${borderWidth}px solid white`
            }}
          >
            +
          </div>
        )}
      </div>
    );
  };

  export default ConversationAvatars;
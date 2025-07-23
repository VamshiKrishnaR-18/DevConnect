const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {/* Post header */}
      <div className="flex items-center mb-3">
        <img 
          src={post.user.profilepic || '/default-avatar.png'} 
          alt={post.user.username}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-semibold">{post.user.username}</h3>
          <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Post content */}
      <p className="mb-3">{post.content}</p>

      {/* Media display */}
      {post.media && post.media.length > 0 && (
        <div className={`grid gap-2 mb-3 ${
          post.media.length === 1 ? 'grid-cols-1' : 
          post.media.length === 2 ? 'grid-cols-2' : 
          'grid-cols-2 md:grid-cols-3'
        }`}>
          {post.media.map((media, index) => (
            <div key={index} className="relative">
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt="Post media"
                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => openMediaModal(media.url)}
                />
              ) : (
                <video
                  src={media.url}
                  controls
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post actions */}
      <div className="flex items-center space-x-4 pt-3 border-t">
        <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
          <span>👍</span>
          <span>{post.likes?.length || 0}</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
          <span>💬</span>
          <span>Comment</span>
        </button>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { X, Search, Home, Bell, Mail, User, MessageCircle, Heart, Repeat2, BarChart3, Share, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TwitterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const currentUser = {
  name: 'Umesh Khanna',
  handle: '@forwarddeploy',
  avatar: 'https://pbs.twimg.com/profile_images/1934350294642733056/qXErHn6w_400x400.jpg',
  banner: 'https://pbs.twimg.com/profile_banners/3291691/1721196082/1500x500',
  bio: '@xai talent engineering | 👸 forward deployed angels | 🌲 @uwaterloo',
  location: 'San Francisco, CA',
  joinDate: 'Joined August 2015',
  following: '2,952',
  followers: '7,407',
};

const mockTweets = [
  {
    id: 1,
    author: 'Elon Musk',
    handle: '@elonmusk',
    avatar: 'https://pbs.twimg.com/profile_images/1845482317180366848/uGdmwp0A_400x400.jpg',
    content: "I've lost a few battles over the years, but I've never lost a war",
    time: '23h',
    replies: '4.1K',
    retweets: '6.1K',
    likes: '89K',
    views: '56M',
    verified: true,
  },
  {
    id: 2,
    author: 'Ben Vinegar',
    handle: '@bentlegen',
    avatar: 'https://pbs.twimg.com/profile_images/1673023717950726145/e1NRxWdG_400x400.jpg',
    content: 'Seeing lots of LLM doomers believe tokens will only get more expensive.\n\nBut Opus 4.5 is *3x cheaper* than previous, less-powerful versions.',
    time: '3h',
    replies: '3',
    retweets: '1',
    likes: '391',
    views: '12K',
    verified: true,
  },
  {
    id: 3,
    author: 'Steve Hanov',
    handle: '@smhanov',
    avatar: 'https://pbs.twimg.com/profile_images/1559894990/image_400x400.jpg',
    content: "I'd love to run Opus but I already got burned badly when I used it for a day and it was $100.",
    time: '3h',
    replies: '',
    retweets: '',
    likes: '1',
    views: '29',
    verified: true,
  },
];

export function TwitterDropdown({ isOpen, onClose }: TwitterDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState<'feed' | 'messages'>('feed');

  if (!isOpen) return null;

  return (
    <div className="absolute top-14 right-0 w-[420px] h-[85vh] max-h-[800px] bg-black border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col">
      <div className="relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        
        <div 
          className="h-24 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentUser.banner})` }}
        />
        
        <div className="px-4 pb-3">
          <div className="flex justify-between items-start">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-black -mt-8"
            />
            <div className="flex items-center gap-2 mt-2">
              <button className="p-1.5 border border-gray-600 rounded-full hover:bg-gray-800">
                <MoreHorizontal className="w-4 h-4 text-white" />
              </button>
              <button className="p-1.5 border border-gray-600 rounded-full hover:bg-gray-800">
                <Mail className="w-4 h-4 text-white" />
              </button>
              <button className="px-4 py-1.5 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-200">
                Following
              </button>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center gap-1">
              <span className="font-bold text-white">{currentUser.name}</span>
              <span className="text-base">🇨🇦🇺🇸</span>
              <svg viewBox="0 0 22 22" className="w-4 h-4 text-blue-400 fill-current">
                <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
              </svg>
              <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
                <span className="text-black text-xs font-bold">𝕏</span>
              </div>
            </div>
            <span className="text-gray-500 text-sm">{currentUser.handle}</span>
            <span className="ml-2 text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">Follows you</span>
          </div>
          
          <p className="text-white text-sm mt-2">{currentUser.bio}</p>
          
          <div className="flex items-center gap-3 mt-2 text-gray-500 text-sm">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {currentUser.location}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {currentUser.joinDate}
            </span>
          </div>
          
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span><strong className="text-white">{currentUser.following}</strong> <span className="text-gray-500">Following</span></span>
            <span><strong className="text-white">{currentUser.followers}</strong> <span className="text-gray-500">Followers</span></span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-800">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'feed' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          For you
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'messages' ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
        >
          Messages
        </button>
      </div>

      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2 bg-gray-900 rounded-full px-4 py-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-sm flex-1 placeholder:text-gray-500"
          />
        </div>
      </div>

      {activeTab === 'feed' ? (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="flex gap-3">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <textarea
                  placeholder="What's happening?"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white text-lg resize-none placeholder:text-gray-600"
                  rows={2}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1 text-blue-400">
                    <button className="p-2 hover:bg-blue-500/10 rounded-full"><BarChart3 className="w-4 h-4" /></button>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 font-bold"
                    disabled={!messageText.trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {mockTweets.map((tweet) => (
            <div key={tweet.id} className="px-4 py-3 border-b border-gray-800 hover:bg-gray-900/50 transition-colors cursor-pointer">
              <div className="flex gap-3">
                <img 
                  src={tweet.avatar} 
                  alt={tweet.author}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23334155" width="40" height="40" rx="20"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="16">' + tweet.author[0] + '</text></svg>';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-white text-sm">{tweet.author}</span>
                    {tweet.verified && (
                      <svg viewBox="0 0 22 22" className="w-4 h-4 text-blue-400 fill-current">
                        <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                      </svg>
                    )}
                    <span className="text-gray-500 text-sm">{tweet.handle}</span>
                    <span className="text-gray-500 text-sm">· {tweet.time}</span>
                  </div>
                  <p className="text-white text-sm mt-1 whitespace-pre-line">{tweet.content}</p>
                  <div className="flex items-center justify-between mt-3 text-gray-500 max-w-[320px]">
                    <button className="flex items-center gap-1 hover:text-blue-400 transition-colors group">
                      <div className="p-1.5 group-hover:bg-blue-400/10 rounded-full">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs">{tweet.replies}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-400 transition-colors group">
                      <div className="p-1.5 group-hover:bg-green-400/10 rounded-full">
                        <Repeat2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs">{tweet.retweets}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-pink-400 transition-colors group">
                      <div className="p-1.5 group-hover:bg-pink-400/10 rounded-full">
                        <Heart className="w-4 h-4" />
                      </div>
                      <span className="text-xs">{tweet.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-400 transition-colors group">
                      <div className="p-1.5 group-hover:bg-blue-400/10 rounded-full">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <span className="text-xs">{tweet.views}</span>
                    </button>
                    <button className="hover:text-blue-400 transition-colors group">
                      <div className="p-1.5 group-hover:bg-blue-400/10 rounded-full">
                        <Share className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xl font-bold text-white mb-1">Messages</h3>
            <p className="text-gray-500 text-sm">Search for someone to start a conversation</p>
          </div>
          
          <div className="px-4 space-y-2">
            <div className="flex items-center gap-3 p-3 hover:bg-gray-900 rounded-xl cursor-pointer transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Amitav Krishna</span>
                  <span className="text-gray-500 text-xs">2d</span>
                </div>
                <p className="text-gray-500 text-sm truncate">Thanks for reaching out! I'd love to chat...</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 hover:bg-gray-900 rounded-xl cursor-pointer transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                E
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Eden Chan</span>
                  <span className="text-gray-500 text-xs">1w</span>
                </div>
                <p className="text-gray-500 text-sm truncate">Yes, I'm definitely interested in exploring...</p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 font-bold">
              <Mail className="w-5 h-5 mr-2" />
              New message
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-around py-2 border-t border-gray-800 bg-black">
        <button className="p-3 hover:bg-gray-800 rounded-full transition-colors text-white">
          <Home className="w-5 h-5" />
        </button>
        <button className="p-3 hover:bg-gray-800 rounded-full transition-colors text-gray-500">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-3 hover:bg-gray-800 rounded-full transition-colors text-gray-500">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-3 hover:bg-gray-800 rounded-full transition-colors text-gray-500">
          <Mail className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name}
            className="w-6 h-6 rounded-full object-cover"
          />
        </button>
      </div>
    </div>
  );
}

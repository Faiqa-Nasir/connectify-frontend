// Dummy data for direct messages and group chats

export const dummyDirectMessages = [
  {
    id: '1',
    user: {
      id: '101',
      username: 'JohnDoe',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      isOnline: true
    },
    lastMessage: {
      text: 'Hey, are you free to meet up later?',
      timestamp: '10:30 AM',
      isRead: false
    },
    unreadCount: 2,
  },
  {
    id: '2',
    user: {
      id: '102',
      username: 'JaneSmith',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      isOnline: false
    },
    lastMessage: {
      text: 'Thanks for the photos you sent! They look amazing.',
      timestamp: 'Yesterday',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: '3',
    user: {
      id: '103',
      username: 'MikeJohnson',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      isOnline: true
    },
    lastMessage: {
      text: 'Did you check out the new update?',
      timestamp: 'Yesterday',
      isRead: false
    },
    unreadCount: 1,
  },
  {
    id: '4',
    user: {
      id: '104',
      username: 'EmilyBrown',
      profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
      isOnline: false
    },
    lastMessage: {
      text: 'Looking forward to seeing you at the event! 🎉',
      timestamp: 'Monday',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: '5',
    user: {
      id: '105',
      username: 'DavidWilson',
      profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
      isOnline: true
    },
    lastMessage: {
      text: 'I sent you the project files.',
      timestamp: 'Monday',
      isRead: false
    },
    unreadCount: 3,
  },
  {
    id: '6',
    user: {
      id: '106',
      username: 'SarahLee',
      profileImage: 'https://randomuser.me/api/portraits/women/6.jpg',
      isOnline: false
    },
    lastMessage: {
      media: {
        type: 'image',
        preview: '📷 Photo'
      },
      timestamp: 'Sunday',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: '7',
    user: {
      id: '107',
      username: 'AlexWong',
      profileImage: 'https://randomuser.me/api/portraits/men/7.jpg',
      isOnline: true
    },
    lastMessage: {
      text: 'Have you decided about the vacation plans?',
      timestamp: '2 days ago',
      isRead: false
    },
    unreadCount: 1,
  },
  {
    id: '8',
    user: {
      id: '108',
      username: 'OliviaGarcia',
      profileImage: 'https://randomuser.me/api/portraits/women/8.jpg',
      isOnline: false
    },
    lastMessage: {
      text: 'The concert was amazing! Thanks for inviting me.',
      timestamp: '2 days ago',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: '9',
    user: {
      id: '109',
      username: 'EthanTaylor',
      profileImage: 'https://randomuser.me/api/portraits/men/9.jpg',
      isOnline: true
    },
    lastMessage: {
      media: {
        type: 'audio',
        preview: '🎵 Voice Message'
      },
      timestamp: '3 days ago',
      isRead: false
    },
    unreadCount: 2,
  },
  {
    id: '10',
    user: {
      id: '110',
      username: 'SophiaMiller',
      profileImage: 'https://randomuser.me/api/portraits/women/10.jpg',
      isOnline: false
    },
    lastMessage: {
      text: 'Can you help me with the presentation tomorrow?',
      timestamp: '4 days ago',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: '11',
    user: {
      id: '111',
      username: 'NoahAnderson',
      profileImage: 'https://randomuser.me/api/portraits/men/11.jpg',
      isOnline: true
    },
    lastMessage: {
      text: 'Did you see the game last night? Incredible!',
      timestamp: 'Last week',
      isRead: false
    },
    unreadCount: 1,
  },
  {
    id: '12',
    user: {
      id: '112',
      username: 'AvaMartinez',
      profileImage: 'https://randomuser.me/api/portraits/women/12.jpg',
      isOnline: false
    },
    lastMessage: {
      text: 'Happy birthday! Hope you have a fantastic day! 🎂',
      timestamp: 'Last week',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: '13',
    user: {
      id: '113',
      username: 'LiamThompson',
      profileImage: 'https://randomuser.me/api/portraits/men/13.jpg',
      isOnline: true
    },
    lastMessage: {
      media: {
        type: 'document',
        preview: '📄 Document'
      },
      timestamp: '2 weeks ago',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: '14',
    user: {
      id: '114',
      username: 'IsabellaRoberts',
      profileImage: 'https://randomuser.me/api/portraits/women/14.jpg',
      isOnline: false
    },
    lastMessage: {
      text: 'The restaurant you recommended was fantastic!',
      timestamp: '2 weeks ago',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: '15',
    user: {
      id: '115',
      username: 'JamesWilliams',
      profileImage: 'https://randomuser.me/api/portraits/men/15.jpg',
      isOnline: true
    },
    lastMessage: {
      text: 'Let me know when you finish reviewing the code.',
      timestamp: '3 weeks ago',
      isRead: true
    },
    unreadCount: 0,
  },
];

export const dummyGroupChats = [
  {
    id: 'g1',
    name: 'Project Team',
    profileImage: 'https://picsum.photos/200',
    members: [
      { id: '101', username: 'JohnDoe' },
      { id: '102', username: 'JaneSmith' },
      { id: '103', username: 'MikeJohnson' },
      { id: '104', username: 'EmilyBrown' },
    ],
    lastMessage: {
      text: 'Meeting scheduled for tomorrow at 10 AM',
      sender: 'JohnDoe',
      timestamp: '11:45 AM',
      isRead: false
    },
    unreadCount: 5,
  },
  {
    id: 'g2',
    name: 'Family Group',
    profileImage: 'https://picsum.photos/201',
    members: [
      { id: '101', username: 'JohnDoe' },
      { id: '105', username: 'DavidWilson' },
      { id: '106', username: 'SarahLee' },
    ],
    lastMessage: {
      text: 'Who\'s bringing the dessert for Sunday?',
      sender: 'SarahLee',
      timestamp: 'Yesterday',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: 'g3',
    name: 'Gaming Squad',
    profileImage: 'https://picsum.photos/202',
    members: [
      { id: '101', username: 'JohnDoe' },
      { id: '103', username: 'MikeJohnson' },
      { id: '105', username: 'DavidWilson' },
    ],
    lastMessage: {
      media: {
        type: 'video',
        preview: '🎮 Game Clip'
      },
      sender: 'MikeJohnson',
      timestamp: 'Monday',
      isRead: false
    },
    unreadCount: 2,
  },
  {
    id: 'g4',
    name: 'Weekend Trip Planning',
    profileImage: 'https://picsum.photos/203',
    members: [
      { id: '102', username: 'JaneSmith' },
      { id: '104', username: 'EmilyBrown' },
      { id: '106', username: 'SarahLee' },
    ],
    lastMessage: {
      text: 'I found some great places we can visit!',
      sender: 'EmilyBrown',
      timestamp: 'Last week',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: 'g5',
    name: 'Book Club',
    profileImage: 'https://picsum.photos/204',
    members: [
      { id: '104', username: 'EmilyBrown' },
      { id: '108', username: 'OliviaGarcia' },
      { id: '110', username: 'SophiaMiller' },
      { id: '114', username: 'IsabellaRoberts' },
    ],
    lastMessage: {
      text: 'Next book: "The Midnight Library" by Matt Haig',
      sender: 'OliviaGarcia',
      timestamp: 'Today',
      isRead: false
    },
    unreadCount: 3,
  },
  {
    id: 'g6',
    name: 'Fitness Buddies',
    profileImage: 'https://picsum.photos/205',
    members: [
      { id: '103', username: 'MikeJohnson' },
      { id: '107', username: 'AlexWong' },
      { id: '111', username: 'NoahAnderson' },
    ],
    lastMessage: {
      text: 'New workout plan attached. Let\'s crush this!',
      sender: 'AlexWong',
      timestamp: 'Yesterday',
      isRead: false
    },
    unreadCount: 1,
  },
  {
    id: 'g7',
    name: 'Tech Enthusiasts',
    profileImage: 'https://picsum.photos/206',
    members: [
      { id: '101', username: 'JohnDoe' },
      { id: '103', username: 'MikeJohnson' },
      { id: '109', username: 'EthanTaylor' },
      { id: '113', username: 'LiamThompson' },
      { id: '115', username: 'JamesWilliams' },
    ],
    lastMessage: {
      text: 'Did anyone try the new AI features in the beta?',
      sender: 'EthanTaylor',
      timestamp: '3 hours ago',
      isRead: false
    },
    unreadCount: 8,
  },
  {
    id: 'g8',
    name: 'Office Happy Hour',
    profileImage: 'https://picsum.photos/207',
    members: [
      { id: '102', username: 'JaneSmith' },
      { id: '104', username: 'EmilyBrown' },
      { id: '105', username: 'DavidWilson' },
      { id: '110', username: 'SophiaMiller' },
    ],
    lastMessage: {
      text: 'Friday, 6 PM at The Blue Bar. Don\'t be late!',
      sender: 'JaneSmith',
      timestamp: '2 days ago',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: 'g9',
    name: 'Photography Club',
    profileImage: 'https://picsum.photos/208',
    members: [
      { id: '106', username: 'SarahLee' },
      { id: '108', username: 'OliviaGarcia' },
      { id: '112', username: 'AvaMartinez' },
    ],
    lastMessage: {
      media: {
        type: 'image',
        preview: '📷 Photo'
      },
      sender: 'AvaMartinez',
      timestamp: 'Yesterday',
      isRead: false
    },
    unreadCount: 4,
  },
  {
    id: 'g10',
    name: 'Travel Planners',
    profileImage: 'https://picsum.photos/209',
    members: [
      { id: '102', username: 'JaneSmith' },
      { id: '107', username: 'AlexWong' },
      { id: '114', username: 'IsabellaRoberts' },
    ],
    lastMessage: {
      text: 'I found flights for $299 round trip!',
      sender: 'IsabellaRoberts',
      timestamp: 'Monday',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: 'g11',
    name: 'Movie Night',
    profileImage: 'https://picsum.photos/210',
    members: [
      { id: '104', username: 'EmilyBrown' },
      { id: '109', username: 'EthanTaylor' },
      { id: '112', username: 'AvaMartinez' },
      { id: '115', username: 'JamesWilliams' },
    ],
    lastMessage: {
      text: 'Let\'s watch the new Marvel movie this weekend',
      sender: 'JamesWilliams',
      timestamp: '2 days ago',
      isRead: false
    },
    unreadCount: 2,
  },
  {
    id: 'g12',
    name: 'Foodies Group',
    profileImage: 'https://picsum.photos/211',
    members: [
      { id: '106', username: 'SarahLee' },
      { id: '110', username: 'SophiaMiller' },
      { id: '114', username: 'IsabellaRoberts' },
    ],
    lastMessage: {
      media: {
        type: 'image',
        preview: '🍕 Food Photo'
      },
      sender: 'SophiaMiller',
      timestamp: '4 days ago',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: 'g13',
    name: 'Music Producers',
    profileImage: 'https://picsum.photos/212',
    members: [
      { id: '103', username: 'MikeJohnson' },
      { id: '109', username: 'EthanTaylor' },
      { id: '111', username: 'NoahAnderson' },
    ],
    lastMessage: {
      media: {
        type: 'audio',
        preview: '🎵 Audio Track'
      },
      sender: 'NoahAnderson',
      timestamp: 'Last week',
      isRead: false
    },
    unreadCount: 1,
  },
  {
    id: 'g14',
    name: 'Volunteer Committee',
    profileImage: 'https://picsum.photos/213',
    members: [
      { id: '102', username: 'JaneSmith' },
      { id: '108', username: 'OliviaGarcia' },
      { id: '112', username: 'AvaMartinez' },
      { id: '114', username: 'IsabellaRoberts' },
    ],
    lastMessage: {
      text: 'The community garden event is scheduled for next Saturday',
      sender: 'AvaMartinez',
      timestamp: '2 weeks ago',
      isRead: true
    },
    unreadCount: 0,
  },
  {
    id: 'g15',
    name: 'Sports Fans',
    profileImage: 'https://picsum.photos/214',
    members: [
      { id: '101', username: 'JohnDoe' },
      { id: '105', username: 'DavidWilson' },
      { id: '111', username: 'NoahAnderson' },
      { id: '115', username: 'JamesWilliams' },
    ],
    lastMessage: {
      text: 'Anyone watching the finals tonight?',
      sender: 'NoahAnderson',
      timestamp: 'Today',
      isRead: false
    },
    unreadCount: 6,
  },
];

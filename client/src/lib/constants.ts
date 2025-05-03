// Categories available in the platform
export const CATEGORIES = [
  { id: 'all', name: 'All Posts', icon: 'globe' },
  { id: 'technology', name: 'Technology', icon: 'microchip' },
  { id: 'gaming', name: 'Gaming', icon: 'gamepad' },
  { id: 'movies', name: 'Movies', icon: 'film' },
  { id: 'music', name: 'Music', icon: 'music' },
  { id: 'media_station', name: 'Media Station', icon: 'images' },
  { id: 'gossips', name: 'Gossips', icon: 'user-secret' },
  { id: 'campus_tour', name: 'Campus Tour', icon: 'university' }
];

// Community guidelines to display in the right sidebar
export const COMMUNITY_GUIDELINES = [
  'Be respectful to all community members',
  'No spam or self-promotion',
  'Respect the privacy of others',
  'Keep posts relevant to their categories',
  'No hate speech or harassment'
];

// Trending topics for right sidebar
export const TRENDING_TOPICS = [
  '#FinalExams',
  '#CampusRenovation',
  '#SummerInternships',
  '#GradSchoolApplications',
  '#StudyAbroad2023'
];

// Storage key for user information
export const USER_STORAGE_KEY = 'vSpaceUserInfo';

// Post creation defaults
export const POST_DEFAULTS = {
  title: '',
  content: '',
  media: '',
  is_idea: false,
  genre: '',
  language: ''
};

// Sort options
export const SORT_OPTIONS = [
  { id: 'recent', name: 'Recent', icon: 'clock' },
  { id: 'popular', name: 'Popular', icon: 'fire' }
];

// Mock top tech ideas for the right sidebar
export const TOP_TECH_IDEAS = [
  { title: 'AR Navigation System for Campus', upvotes: 42, days: 4 },
  { title: 'Blockchain-Based Attendance System', upvotes: 38, days: 6 },
  { title: 'Sustainable Energy Monitoring App', upvotes: 29, days: 7 }
];

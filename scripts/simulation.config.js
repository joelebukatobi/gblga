// scripts/simulation.config.js
// Configuration for analytics simulation

export default {
  // Simulation settings
  duration: 7, // days
  runTime: '0 9 * * *', // 9:00 AM daily
  
  // Post categorization (by title substring matching)
  categories: {
    trendingUp: [
      'React Hooks',
      'CSS Grid',
      'TypeScript Patterns'
    ],
    
    trendingDown: [
      'Docker',
      'PostgreSQL',
      'Web Security'
    ],
    
    excluded: [
      'Async/Await',
      'Responsive Design'
    ]
  },
  
  // Daily volume targets
  dailyTargets: {
    views: { min: 100, max: 200 },
    comments: { min: 3, max: 7 },
    subscribers: { min: 2, max: 4 }
  },
  
  // Day multipliers (weekend dips, midweek peaks)
  dayMultipliers: {
    1: 0.8,   // Monday: Baseline
    2: 1.0,   // Tuesday: Slight bump
    3: 0.9,   // Wednesday: Dip
    4: 1.2,   // Thursday: Mid-week peak
    5: 1.1,   // Friday: High
    6: 0.85,  // Saturday: Weekend dip
    7: 1.15   // Sunday: Weekend surge
  },
  
  // View distribution by category
  viewRanges: {
    trendingUp: { min: 40, max: 60 },
    trendingDown: { min: 5, max: 12 },
    stable: { min: 15, max: 25 },
    excluded: { min: 0, max: 0 }
  },
  
  // Fake comment templates
  commentTemplates: [
    'Great post! Really helpful.',
    'Thanks for sharing this.',
    'Exactly what I was looking for.',
    'Well explained, thanks!',
    'This is super useful.',
    'Can you elaborate on this?',
    'Bookmarked for later.',
    'Simple and clear explanation.'
  ],
  
  // Fake subscriber names
  subscriberNames: [
    'John Smith', 'Emma Wilson', 'Michael Brown', 'Sarah Davis',
    'David Miller', 'Lisa Garcia', 'James Johnson', 'Jennifer Lee',
    'Robert Taylor', 'Maria Anderson', 'William Martinez', 'Patricia White',
    'Thomas Robinson', 'Linda Clark', 'Charles Rodriguez', 'Barbara Lewis'
  ]
};

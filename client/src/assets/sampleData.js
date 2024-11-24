
export const samplePost = {
  id: "1",
  title: "Is @bitcoin_expert's analysis of #Bitcoin still relevant?",
  content: "Looking for insights on the current #crypto market. @crypto_analyst mentioned some interesting points about #blockchain adoption. What are your thoughts?",
  author: {
    name: "CryptoKing",
    avatar: "/avatars/cryptoking.jpg",
    initials: "CK",
    verified: true
  },
  department: "Finance",
  timestamp: "2024-03-20T10:00:00Z",
  images: [
    {
      url: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
      alt: "Bitcoin chart"
    },
    {
      url: "https://images.unsplash.com/photo-1516245834210-c4c142787335",
      alt: "Crypto trading"
    }
  ],
  categories: ["Cryptocurrency", "Investment"],
  tags: ["Bitcoin", "Analysis", "Trading"],
  votes: 42,
  replies: [
    {
      id: "r1",
      type: "ai",
      username: "AI Assistant",
      content: "Based on historical data and market trends...",
      votes: 15,
      timestamp: "2024-03-20T10:30:00Z",
      avatar: "/avatars/ai-assistant.jpg",
      initials: "AI",
      verified: true
    },
    {
      id: "r2",
      type: "department",
      username: "Finance Team",
      content: "Our analysis indicates a strong support level...",
      votes: 12,
      timestamp: "2024-03-20T11:00:00Z",
      department: "Finance",
      avatar: "/avatars/finance.jpg",
      initials: "FT",
      verified: true
    }
  ]
}

export const relatedQuestions = [
  {
    id: "2",
    title: "What are the risks of cryptocurrency investment?",
    replies: 3,
    timestamp: "2024-03-19T08:00:00Z",
    tags: ["Risk", "Investment"]
  },
  {
    id: "3",
    title: "How to secure your Bitcoin wallet?",
    replies: 5,
    timestamp: "2024-03-18T13:30:00Z",
    tags: ["Security", "Wallet"]
  }
]
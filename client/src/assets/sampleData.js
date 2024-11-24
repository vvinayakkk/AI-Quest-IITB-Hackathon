export const samplePosts = [
  {
    id: "1",
    title: "Is @bitcoin_expert's analysis of #Bitcoin still relevant?",
    content: "Looking for insights on the current #crypto market. @crypto_analyst mentioned some interesting points about #blockchain adoption. What are your thoughts?",
    author: {
      id: "user1", // Added author id
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
        avatar: "https://source.unsplash.com/100x100/?finance",
        initials: "FT",
        verified: true
      }
    ],
    relatedQuestions: [
      {
        id: "2",
        title: "How does #Ethereum differ from #Bitcoin?",
        replies: 2,
        timestamp: "2024-03-21T09:00:00Z",
        tags: ["Ethereum", "Bitcoin", "SmartContracts"]
      },
      {
        id: "5",
        title: "What's new in #Bitcoin's latest update?",
        replies: 4,
        timestamp: "2024-03-24T11:30:00Z",
        tags: ["Bitcoin", "Update"]
      }
    ]
  },
  {
    id: "2",
    title: "How does #Ethereum differ from #Bitcoin?",
    content: "Can someone explain the technical differences between #Ethereum and #Bitcoin? I'm particularly interested in smart contracts.",
    author: {
      id: "user2", // Added author id
      name: "BlockchainEnthusiast",
      avatar: "https://source.unsplash.com/100x100/?blockchain",
      initials: "BE",
      verified: false
    },
    department: "Technology",
    timestamp: "2024-03-21T09:00:00Z",
    images: [],
    categories: ["Blockchain", "Technology"],
    tags: ["Ethereum", "Bitcoin", "SmartContracts"],
    votes: 30,
    replies: [
      {
        id: "r3",
        type: "user",
        username: "TechGuru",
        content: "Ethereum allows for smart contracts, while Bitcoin is primarily a digital currency.",
        votes: 10,
        timestamp: "2024-03-21T09:15:00Z",
        avatar: "https://source.unsplash.com/100x100/?technology,expert",
        initials: "TG",
        verified: false
      },
      {
        id: "r4",
        type: "ai",
        username: "AI Assistant",
        content: "Ethereum is a decentralized platform that runs smart contracts...",
        votes: 12,
        timestamp: "2024-03-21T09:20:00Z",
        avatar: "https://source.unsplash.com/100x100/?ai,assistant",
        initials: "AI",
        verified: true
      }
    ],
    relatedQuestions: [
      {
        id: "1",
        title: "Is @bitcoin_expert's analysis of #Bitcoin still relevant?",
        replies: 3,
        timestamp: "2024-03-20T10:00:00Z",
        tags: ["Bitcoin", "Analysis", "Trading"]
      },
      {
        id: "4",
        title: "Understanding #SmartContracts on #Ethereum",
        replies: 2,
        timestamp: "2024-03-23T10:00:00Z",
        tags: ["SmartContracts", "Ethereum"]
      }
    ]
  },
  {
    id: "3",
    title: "Best practices for #cryptocurrency security?",
    content: "What are some best practices to keep my cryptocurrency secure? I've heard about hardware wallets, are they necessary?",
    author: {
      id: "user3", // Added author id
      name: "SecurityFirst",
      avatar: "https://source.unsplash.com/100x100/?security",
      initials: "SF",
      verified: false
    },
    department: "Security",
    timestamp: "2024-03-22T14:30:00Z",
    images: [],
    categories: ["Security", "Cryptocurrency"],
    tags: ["Security", "HardwareWallets"],
    votes: 25,
    replies: [
      {
        id: "r5",
        type: "department",
        username: "Security Team",
        content: "Using hardware wallets is recommended for storing large amounts of cryptocurrency.",
        votes: 20,
        timestamp: "2024-03-22T15:00:00Z",
        department: "Security",
        avatar: "https://source.unsplash.com/100x100/?security,team",
        initials: "ST",
        verified: true
      },
      {
        id: "r6",
        type: "user",
        username: "CryptoNerd",
        content: "Always enable two-factor authentication on your accounts.",
        votes: 8,
        timestamp: "2024-03-22T15:10:00Z",
        avatar: "https://source.unsplash.com/100x100/?crypto,nerd",
        initials: "CN",
        verified: false
      }
    ],
    relatedQuestions: [
      {
        id: "2",
        title: "How does #Ethereum differ from #Bitcoin?",
        replies: 2,
        timestamp: "2024-03-21T09:00:00Z",
        tags: ["Ethereum", "Bitcoin", "SmartContracts"]
      },
      {
        id: "6",
        title: "The rise of #NFTs in the digital art world",
        replies: 5,
        timestamp: "2024-03-25T09:45:00Z",
        tags: ["NFTs", "DigitalArt"]
      }
    ]
  },
  {
    id: "4",
    title: "Understanding #SmartContracts on #Ethereum",
    content: "Can someone explain how smart contracts work on the Ethereum blockchain? #Development #Blockchain",
    author: {
      id: "user4", // Added author id
      name: "DevGuru",
      avatar: "/avatars/devguru.jpg",
      initials: "DG",
      verified: false
    },
    department: "Technology",
    timestamp: "2024-03-23T10:00:00Z",
    images: [],
    categories: ["Blockchain", "Development"],
    tags: ["SmartContracts", "Ethereum"],
    votes: 18,
    replies: [
      {
        id: "r7",
        type: "user",
        username: "CodeMaster",
        content: "Smart contracts are self-executing contracts with the terms directly written into code.",
        votes: 5,
        timestamp: "2024-03-23T10:15:00Z",
        avatar: "/avatars/codemaster.jpg",
        initials: "CM",
        verified: false
      },
      {
        id: "r8",
        type: "ai",
        username: "AI Assistant",
        content: "A smart contract is a program that runs on the Ethereum blockchain that facilitates the exchange of assets.",
        votes: 9,
        timestamp: "2024-03-23T10:20:00Z",
        avatar: "/avatars/ai-assistant.jpg",
        initials: "AI",
        verified: true
      }
    ],
    relatedQuestions: [
      {
        id: "2",
        title: "How does #Ethereum differ from #Bitcoin?",
        replies: 2,
        timestamp: "2024-03-21T09:00:00Z",
        tags: ["Ethereum", "Bitcoin", "SmartContracts"]
      },
      {
        id: "7",
        title: "Implications of #QuantumComputing on #Cryptocurrency",
        replies: 3,
        timestamp: "2024-03-26T08:30:00Z",
        tags: ["QuantumComputing", "Security"]
      }
    ]
  },
  {
    id: "5",
    title: "What's new in #Bitcoin's latest update?",
    content: "Has anyone explored the new features introduced in the latest Bitcoin update? #Cryptocurrency",
    author: {
      id: "user5", // Added author id
      name: "CryptoNews",
      avatar: "/avatars/cryptonews.jpg",
      initials: "CN",
      verified: false
    },
    department: "Finance",
    timestamp: "2024-03-24T11:30:00Z",
    images: [],
    categories: ["Cryptocurrency", "Bitcoin"],
    tags: ["Bitcoin", "Update"],
    votes: 22,
    replies: [
      {
        id: "r9",
        type: "department",
        username: "TechInsights",
        content: "The update introduces improved transaction speeds and enhanced security features.",
        votes: 14,
        timestamp: "2024-03-24T12:00:00Z",
        department: "Technology",
        avatar: "/avatars/techinsights.jpg",
        initials: "TI",
        verified: true
      },
      {
        id: "r10",
        type: "user",
        username: "BlockchainFan",
        content: "Yes, it also includes support for new scripting capabilities.",
        votes: 6,
        timestamp: "2024-03-24T12:05:00Z",
        avatar: "/avatars/blockchainfan.jpg",
        initials: "BF",
        verified: false
      }
    ],
    relatedQuestions: [
      {
        id: "1",
        title: "Is @bitcoin_expert's analysis of #Bitcoin still relevant?",
        replies: 3,
        timestamp: "2024-03-20T10:00:00Z",
        tags: ["Bitcoin", "Analysis", "Trading"]
      },
      {
        id: "8",
        title: "Exploring #DeFi opportunities",
        replies: 4,
        timestamp: "2024-03-27T13:20:00Z",
        tags: ["DeFi", "Investment"]
      }
    ]
  },
  {
    id: "6",
    title: "The rise of #NFTs in the digital art world",
    content: "How are NFTs changing the landscape of digital art? Curious about their impact on artists. #Art #Blockchain",
    author: {
      id: "user6", // Added author id
      name: "ArtFanatic",
      avatar: "/avatars/artfanatic.jpg",
      initials: "AF",
      verified: false
    },
    department: "Creative",
    timestamp: "2024-03-25T09:45:00Z",
    images: [
      {
        url: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde",
        alt: "Digital art piece"
      }
    ],
    categories: ["Art", "Blockchain"],
    tags: ["NFTs", "DigitalArt"],
    votes: 35,
    replies: [
      {
        id: "r11",
        type: "user",
        username: "DigitalCreator",
        content: "NFTs allow artists to monetize their digital creations like never before.",
        votes: 12,
        timestamp: "2024-03-25T10:00:00Z",
        avatar: "/avatars/digitalcreator.jpg",
        initials: "DC",
        verified: false
      },
      {
        id: "r12",
        type: "ai",
        username: "AI Assistant",
        content: "Non-Fungible Tokens represent unique digital items, making them ideal for art authentication.",
        votes: 15,
        timestamp: "2024-03-25T10:05:00Z",
        avatar: "/avatars/ai-assistant.jpg",
        initials: "AI",
        verified: true
      }
    ],
    relatedQuestions: [
      {
        id: "3",
        title: "Best practices for #cryptocurrency security?",
        replies: 2,
        timestamp: "2024-03-22T14:30:00Z",
        tags: ["Security", "HardwareWallets"]
      },
      {
        id: "11",
        title: "Understanding the legal aspects of NFTs",
        replies: 3,
        timestamp: "2024-03-23T13:20:00Z",
        tags: ["NFTs", "Legal"]
      }
    ]
  },
  {
    id: "7",
    title: "Implications of #QuantumComputing on #Cryptocurrency",
    content: "What could be the effects of quantum computing on cryptocurrency security? #Security #FutureTech",
    author: {
      id: "user7", // Added author id
      name: "FutureThinker",
      avatar: "/avatars/futurethinker.jpg",
      initials: "FT",
      verified: false
    },
    department: "Research",
    timestamp: "2024-03-26T08:30:00Z",
    images: [],
    categories: ["Technology", "Cryptocurrency"],
    tags: ["QuantumComputing", "Security"],
    votes: 28,
    replies: [
      {
        id: "r13",
        type: "department",
        username: "ResearchDept",
        content: "Quantum computing poses risks to traditional cryptographic methods used in cryptocurrencies.",
        votes: 13,
        timestamp: "2024-03-26T09:00:00Z",
        department: "Research",
        avatar: "/avatars/researchdept.jpg",
        initials: "RD",
        verified: true
      },
      {
        id: "r14",
        type: "user",
        username: "TechEnthusiast",
        content: "It's a concern, but quantum-resistant algorithms are being developed.",
        votes: 7,
        timestamp: "2024-03-26T09:15:00Z",
        avatar: "/avatars/techenthusiast.jpg",
        initials: "TE",
        verified: false
      }
    ],
    relatedQuestions: [
      {
        id: "4",
        title: "Understanding #SmartContracts on #Ethereum",
        replies: 2,
        timestamp: "2024-03-23T10:00:00Z",
        tags: ["SmartContracts", "Ethereum"]
      },
      {
        id: "13",
        title: "Timeline for practical quantum computing?",
        replies: 4,
        timestamp: "2024-03-24T16:30:00Z",
        tags: ["QuantumComputing", "Future"]
      }
    ]
  },
  {
    id: "8",
    title: "Exploring #DeFi opportunities",
    content: "What are the best platforms to get started with decentralized finance? #Investment #Crypto",
    author: {
      id: "user8", // Added author id
      name: "Investor101",
      avatar: "/avatars/investor101.jpg",
      initials: "I1",
      verified: false
    },
    department: "Finance",
    timestamp: "2024-03-27T13:20:00Z",
    images: [],
    categories: ["Finance", "Cryptocurrency"],
    tags: ["DeFi", "Investment"],
    votes: 20,
    replies: [
      {
        id: "r15",
        type: "user",
        username: "CryptoAdvisor",
        content: "Platforms like Uniswap and Aave are great places to start.",
        votes: 8,
        timestamp: "2024-03-27T13:45:00Z",
        avatar: "/avatars/cryptoadvisor.jpg",
        initials: "CA",
        verified: false
      },
      {
        id: "r16",
        type: "ai",
        username: "AI Assistant",
        content: "Decentralized finance platforms offer a range of financial services without intermediaries.",
        votes: 10,
        timestamp: "2024-03-27T13:50:00Z",
        avatar: "/avatars/ai-assistant.jpg",
        initials: "AI",
        verified: true
      }
    ],
    relatedQuestions: [
      {
        id: "5",
        title: "What's new in #Bitcoin's latest update?",
        replies: 4,
        timestamp: "2024-03-24T11:30:00Z",
        tags: ["Bitcoin", "Update"]
      },
      {
        id: "14",
        title: "Risks involved in DeFi investments?",
        replies: 3,
        timestamp: "2024-03-26T11:00:00Z",
        tags: ["DeFi", "RiskManagement"]
      }
    ]
  }
]
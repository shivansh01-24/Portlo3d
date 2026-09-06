/**
 * AUTHORITATIVE PORTFOLIO KNOWLEDGE BASE — SHIVANSH SRIVASTAVA
 * 
 * STRICT RULE: This is the ONLY source of truth for the AI assistant.
 * The AI MUST NOT invent, guess, or extrapolate any information not present here.
 */

const PORTFOLIO_KNOWLEDGE = {
  profile: {
    fullName: "Shivansh Srivastava",
    title: "Software Engineer | Full-Stack Developer | Systems & AI",
    currentRole: "Computer Science Engineer specializing in full-stack web applications, real-time distributed systems, and autonomous AI agents",
    location: "Varanasi, Uttar Pradesh, India",
    email: "shivanshsrivastava080@gmail.com",
    phone: "+91-7525891099",
    github: "https://github.com/shivansh01-24",
    linkedin: "https://www.linkedin.com/in/shivansh-srivastava-67b7892b9/",
    leetcode: "https://leetcode.com/u/shivansh_srivastava/",
    summary: "Shivansh Srivastava is a Computer Science Engineer passionate about clean architecture, high-performance systems, algorithmic problem solving, and building scalable full-stack applications and AI agent workflows.",
    designPhilosophy: "Focuses on combining aesthetic elegance with high-performance engineering. Believes in minimal monochrome aesthetics, buttery-smooth 120fps interactions, clean modular architecture, and sub-millisecond responsiveness.",
    workingStyle: "Systematic, detail-oriented, and security-first. Excels in rapid prototyping, clean code standards, test-driven methodologies, and robust error handling."
  },

  education: [
    {
      institution: "Lovely Professional University (LPU)",
      degree: "Bachelor of Technology (B.Tech) in Computer Science and Engineering",
      location: "Punjab, India",
      timeline: "2024 - 2028",
      highlights: "Focusing on Data Structures & Algorithms, Systems Programming, Distributed Architecture, and Full-Stack Engineering."
    },
    {
      institution: "Senior Secondary School (Class XII)",
      degree: "Higher Secondary Certificate (PCM with Computer Science)",
      location: "Varanasi, Uttar Pradesh, India",
      year: "2024",
      highlights: "Physics, Chemistry, Mathematics with Computer Science foundation."
    },
    {
      institution: "Secondary School (Class X)",
      degree: "Secondary School Examination",
      location: "Varanasi, Uttar Pradesh, India",
      year: "2020",
      highlights: "Foundational academics with excellence in Mathematics and Science."
    }
  ],

  experience: [
    {
      organization: "Banaras Locomotive Works (BLW), Indian Railways",
      role: "Summer Industrial Trainee — EDP & Technical Systems (Locomotive Software)",
      location: "Varanasi, India",
      timeline: "June 2026 - July 2026",
      type: "Industrial & Vocational Training",
      responsibilitiesAndAchievements: [
        "Automated modular Electronic Data Processing (EDP) pipelines, streamlining enterprise report compilation across 4 production divisions and reducing data processing latency by 45%.",
        "Evaluated locomotive control software architectures and diagnostic telemetry, verifying 20+ system parameters to ensure 99.9% fault-tolerant real-time hardware communication.",
        "Collaborated with cross-functional engineering teams in an Agile development environment to optimize computer numerical control execution pipelines, increasing industrial scheduling throughput by 30%."
      ]
    }
  ],

  projects: [
    {
      id: "blw-eams",
      title: "BLW-EAMS - Enterprise Asset Management & Maintenance ERP",
      category: "Full-Stack ERP & Industrial IoT",
      timeline: "2026",
      technologies: ["React", "Vite", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "JWT", "Helmet"],
      liveDemo: "https://blw-eams.vercel.app/login",
      github: "https://github.com/shivansh01-24/blw-eams",
      description: "An industrial-grade Enterprise Asset Management & Maintenance platform designed to streamline heavy machinery tracking, predictive maintenance, and inventory workflows.",
      keyFeatures: [
        "Role-Based Access Control (RBAC) with secure JWT authentication and Helmet security headers across 100% of user routes.",
        "Work order tracking and asset lifecycle workflows with QR code tagging and analytical dashboards.",
        "Decreased industrial equipment maintenance downtime by 35%.",
        "Rate-limiting, input sanitization, and structured REST APIs maintaining 100% transaction consistency with response times under 120ms."
      ]
    },
    {
      id: "revive",
      title: "REVIVE - Autonomous Financial Recovery & Debt Resolution Engine",
      category: "AI Agent Architecture & Fintech",
      timeline: "2026",
      technologies: ["React", "Node.js", "Express.js", "AI Multi-Agent Reasoning", "Financial Modeling", "Tailwind CSS"],
      liveDemo: "https://revive-navy-sigma.vercel.app/",
      github: "https://github.com/shivansh01-24",
      description: "An automated debt resolution and financial recovery platform that uses autonomous multi-agent reasoning to evaluate liabilities, risk categories, and dynamic settlement schedules.",
      keyFeatures: [
        "Autonomous multi-agent architecture analyzing complex liability portfolios and predicting settlement probabilities.",
        "Interactive financial command center with real-time risk assessment, predictive cash-flow forecasting, and automated ledger auditing.",
        "Atomic microservice transaction pipelines ensuring zero reconciliation discrepancies across high-frequency payment channels."
      ]
    },
    {
      id: "localdrop",
      title: "LocalDrop - High-Performance Encrypted P2P File Transfer Engine",
      category: "Distributed Systems & Networking",
      timeline: "2026",
      technologies: ["Next.js", "TypeScript", "WebRTC Data Channels", "WebSockets", "Tailwind CSS"],
      liveDemo: "https://localdrop-seven.vercel.app/",
      github: "https://github.com/shivansh01-24/LocalDrop",
      description: "A serverless peer-to-peer encrypted file sharing application leveraging direct WebRTC data channels and WebSocket signaling with zero server storage overhead.",
      keyFeatures: [
        "Direct peer-to-peer browser encryption with zero intermediary server storage.",
        "Chunked binary streaming protocols and automated local subnet discovery delivering 3x higher throughput compared to multi-hop cloud uploads.",
        "Real-time transfer progress tracking, connection health indicators, and automatic peer reconnection logic."
      ]
    },
    {
      id: "chinh",
      title: "Chinh - Universal In-Context AI Annotation & Note Vault",
      category: "Browser Extension & Local-First Software",
      timeline: "2026",
      technologies: ["JavaScript (ES6+)", "Manifest V3", "HTML5 File System Access API", "DOM Mutation Engine"],
      liveDemo: "https://chromewebstore.google.com/detail/chinh/ijgeclhbbdffmfcbmdkkjggljgokcddb",
      github: "https://github.com/shivansh01-24/web-note",
      description: "An approved Chrome Web Store extension that injects in-context annotation overlays across major AI platforms (ChatGPT, Claude, Gemini, Perplexity) with local-first file storage.",
      keyFeatures: [
        "Published and verified on the official Google Chrome Web Store.",
        "Seamless in-context overlay injection across ChatGPT, Claude, Gemini, and Perplexity without breaking native chat DOMs.",
        "Local-first vault architecture using HTML5 File System Access API, writing atomic backups directly to local disk for 100% privacy and data ownership."
      ]
    },
    {
      id: "portlo3d",
      title: "Portlo3d - 3D Celestial Portfolio & Systems Showcase",
      category: "Creative Engineering & WebGL",
      timeline: "2026",
      technologies: ["HTML5", "CSS3", "JavaScript (Vanilla ES6+)", "Three.js", "Canvas API", "OpenRouter AI"],
      liveDemo: "https://portlo3d.vercel.app/",
      github: "https://github.com/shivansh01-24/Portlo3d",
      description: "A luxury monochrome 3D portfolio featuring procedural atmospheric starfields, kinetic bezier wave physics, 3D project carousel, interactive orbital certificate inspector, and an AI companion mascot.",
      keyFeatures: [
        "120fps hardware-accelerated animations using Canvas 2D and Three.js.",
        "Interactive 3D orbital certificate inspector and 3D project depth cards.",
        "Integrated production-ready AI companion chatbot powered by OpenRouter free model fallback architecture."
      ]
    }
  ],

  skills: {
    programmingLanguages: ["C++", "Python", "JavaScript (ES6+)", "TypeScript", "C", "SQL (PostgreSQL, MySQL)", "HTML5", "CSS3"],
    frameworksAndLibraries: ["React.js", "Next.js", "Node.js", "Express.js", "Three.js", "Redux Toolkit", "Tailwind CSS", "Vite"],
    databasesAndCloud: ["MongoDB", "PostgreSQL", "MySQL", "Oracle Cloud Infrastructure (OCI)", "Google Cloud Platform (GCP)", "Docker", "Vercel"],
    protocolsAndAPIs: ["RESTful APIs", "WebSockets", "WebRTC Data Channels", "JWT Authentication", "OpenRouter AI API"],
    coreCompetencies: [
      "Data Structures & Algorithms (DSA)",
      "Object-Oriented Programming (OOP)",
      "Database Management Systems (DBMS)",
      "Operating Systems & Linux Shell Scripting",
      "Computer Networks",
      "Git & Version Control",
      "Clean Architecture & Microservices"
    ],
    leetcodeProblemSolving: {
      profileUrl: "https://leetcode.com/u/shivansh_srivastava/",
      focusAreas: "Dynamic Programming, Graph Theory, Trees, Two Pointers, Binary Search, and Sliding Window in C++.",
      complexityStandards: "Prioritizes optimal O(N) or O(log N) time complexity and O(1) auxiliary space efficiency."
    }
  },

  certifications: [
    {
      title: "Summer Industrial Training — EDP & Technical Systems",
      issuer: "Banaras Locomotive Works (BLW), Indian Railways",
      year: "2026",
      credentialUrl: "https://github.com/shivansh01-24/Portlo3d",
      relevance: "Industrial automation, locomotive diagnostic telemetry, and enterprise report pipelines."
    },
    {
      title: "Oracle Cloud Infrastructure (OCI) 2025 AI Foundations Associate",
      issuer: "Oracle Cloud Infrastructure",
      year: "2025",
      credentialUrl: "https://github.com/shivansh01-24/Portlo3d",
      relevance: "Generative AI architectures, foundation models, prompt engineering, and OCI AI services."
    },
    {
      title: "Oracle Cloud Infrastructure (OCI) 2025 Data Platform Foundations",
      issuer: "Oracle Cloud Infrastructure",
      year: "2025",
      credentialUrl: "https://github.com/shivansh01-24/Portlo3d",
      relevance: "Cloud database architectures, Autonomous Database, data lakes, and enterprise pipelines."
    },
    {
      title: "Cloud Computing & Data Engineering",
      issuer: "Google Cloud Platform",
      year: "2025",
      credentialUrl: "https://github.com/shivansh01-24/Portlo3d",
      relevance: "Cloud storage, scalable compute, BigQuery data analytics, and cloud security best practices."
    },
    {
      title: "Artificial Intelligence & Machine Learning with Python",
      issuer: "IBM / Cognitive Class",
      year: "2025",
      credentialUrl: "https://github.com/shivansh01-24/Portlo3d",
      relevance: "Supervised and unsupervised learning, neural network fundamentals, and Python ML pipelines."
    },
    {
      title: "Certified C++ Professional (OOP / Data Structures)",
      issuer: "Infosys Springboard",
      year: "2025",
      credentialUrl: "https://github.com/shivansh01-24/Portlo3d",
      relevance: "Advanced C++ memory management, pointers, OOP principles, and standard template library (STL)."
    },
    {
      title: "Database Management Systems & SQL Schema Specialist",
      issuer: "Infosys Springboard",
      year: "2025",
      credentialUrl: "https://github.com/shivansh01-24/Portlo3d",
      relevance: "Relational schema design, SQL query optimization, ACID transactions, and indexing strategies."
    },
    {
      title: "DSA Placement Bootcamp (Grade 'A+' Outstanding)",
      issuer: "Lovely Professional University (LPU / CPE)",
      year: "2025",
      credentialUrl: "https://github.com/shivansh01-24/Portlo3d",
      relevance: "Rigorous competitive programming, algorithmic mastery, graph algorithms, and dynamic programming."
    }
  ],

  achievements: [
    {
      title: "1st Rank Winner — Infosys College Hackathon (2025)",
      organization: "Infosys Springboard / LPU",
      description: "Awarded 1st place out of 100+ competing engineering teams for developing a production-ready software prototype within a 24-hour hackathon."
    },
    {
      title: "2nd Position (Silver Medalist) — Flight Fury Aeromodeling",
      organization: "Adwitiya Technical Symposium",
      description: "Awarded Certificate of Excellence in autonomous drone flight stability, aerodynamics, and telemetry control."
    },
    {
      title: "3rd Position — Drone Forge Hackathon",
      organization: "Chandigarh University",
      description: "Recognized for embedded drone flight controller algorithms, sensor integration, and hardware-software telemetry."
    }
  ],

  contact: {
    email: "shivanshsrivastava080@gmail.com",
    phone: "+91-7525891099",
    location: "Varanasi, Uttar Pradesh, India",
    github: "https://github.com/shivansh01-24",
    linkedin: "https://www.linkedin.com/in/shivansh-srivastava-67b7892b9/",
    portfolio: "https://portlo3d.vercel.app/",
    leetcode: "https://leetcode.com/u/shivansh_srivastava/"
  }
};

module.exports = PORTFOLIO_KNOWLEDGE;

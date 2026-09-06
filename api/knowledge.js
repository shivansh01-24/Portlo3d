/**
 * AUTHORITATIVE FIRST-PERSON KNOWLEDGE BASE — SHIVANSH SRIVASTAVA
 * 
 * STRICT RULE: This is the ONLY source of truth for the conversation.
 * Written in first-person voice so all responses are naturally personal and authentic.
 */

const PORTFOLIO_KNOWLEDGE = {
  aboutMe: {
    name: "Shivansh Srivastava",
    role: "Computer Science Engineer | Full-Stack Developer | Systems & AI",
    location: "Varanasi, Uttar Pradesh, India",
    email: "shivanshsrivastava080@gmail.com",
    phone: "+91-7525891099",
    github: "https://github.com/shivansh01-24",
    linkedin: "https://www.linkedin.com/in/shivansh-srivastava-67b7892b9/",
    leetcode: "https://leetcode.com/u/shivansh_srivastava/",
    summary: "I'm a Computer Science Engineer passionate about building scalable full-stack applications, real-time distributed systems, and autonomous AI agents. I care deeply about clean architecture, high performance, and crafting smooth user experiences.",
    designPhilosophy: "I like combining clean engineering with great UX. My philosophy centers on minimal monochrome aesthetics, buttery-smooth interactions, modular architecture, and sub-millisecond responsiveness.",
    workingStyle: "I'm systematic, detail-oriented, and security-first. I focus on clean code standards, rapid prototyping, robust error handling, and writing software that actually performs reliably."
  },

  education: [
    {
      institution: "Lovely Professional University (LPU)",
      degree: "B.Tech in Computer Science and Engineering",
      timeline: "2024 - 2028",
      details: "Focusing on Data Structures & Algorithms, Systems Programming, Distributed Architecture, and Full-Stack Engineering."
    },
    {
      institution: "Senior Secondary School (Class XII)",
      degree: "Higher Secondary Certificate (PCM with Computer Science)",
      location: "Varanasi, Uttar Pradesh, India",
      year: "2024",
      details: "Physics, Chemistry, Mathematics with Computer Science foundation."
    },
    {
      institution: "Secondary School (Class X)",
      degree: "Secondary School Examination",
      location: "Varanasi, Uttar Pradesh, India",
      year: "2020",
      details: "Foundational academics with excellence in Mathematics and Science."
    }
  ],

  experienceAtBLW: {
    organization: "Banaras Locomotive Works (BLW), Indian Railways",
    role: "Summer Industrial Trainee — EDP & Technical Systems (Locomotive Software)",
    timeline: "June 2026 - July 2026",
    location: "Varanasi, India",
    whatIDid: [
      "Automated modular Electronic Data Processing (EDP) pipelines, streamlining enterprise report compilation across 4 production divisions and reducing data processing latency by 45%.",
      "Evaluated locomotive control software architectures and diagnostic telemetry, verifying 20+ system parameters to ensure 99.9% fault-tolerant real-time hardware communication.",
      "Collaborated with cross-functional engineering teams in an Agile development environment to optimize computer numerical control execution pipelines, increasing industrial scheduling throughput by 30%."
    ]
  },

  projectsIBuilt: [
    {
      title: "BLW-EAMS - Enterprise Asset Management & Maintenance ERP",
      technologies: ["React", "Vite", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "JWT", "Helmet"],
      liveDemo: "https://blw-eams.vercel.app/login",
      github: "https://github.com/shivansh01-24/blw-eams",
      whatItIs: "An industrial-grade Enterprise Asset Management & Maintenance platform I built to streamline heavy machinery tracking, predictive maintenance, and inventory workflows.",
      highlights: [
        "Role-Based Access Control (RBAC) with secure JWT authentication and Helmet security headers across 100% of user routes.",
        "Work order tracking and asset lifecycle workflows with QR code tagging and analytical dashboards.",
        "Decreased industrial equipment maintenance downtime by 35%.",
        "Rate-limiting, input sanitization, and structured REST APIs maintaining 100% transaction consistency with response times under 120ms."
      ]
    },
    {
      title: "REVIVE - Autonomous Financial Recovery & Debt Resolution Engine",
      technologies: ["React", "Node.js", "Express.js", "AI Multi-Agent Reasoning", "Financial Modeling", "Tailwind CSS"],
      liveDemo: "https://revive-navy-sigma.vercel.app/",
      github: "https://github.com/shivansh01-24",
      whatItIs: "An automated debt resolution and financial recovery platform I built that uses autonomous multi-agent reasoning to evaluate liabilities, risk categories, and dynamic settlement schedules.",
      highlights: [
        "Autonomous multi-agent architecture analyzing complex liability portfolios and predicting settlement probabilities.",
        "Interactive financial command center with real-time risk assessment, predictive cash-flow forecasting, and automated ledger auditing.",
        "Atomic microservice transaction pipelines ensuring zero reconciliation discrepancies across payment channels."
      ]
    },
    {
      title: "LocalDrop - High-Performance Encrypted P2P File Transfer Engine",
      technologies: ["Next.js", "TypeScript", "WebRTC Data Channels", "WebSockets", "Tailwind CSS"],
      liveDemo: "https://localdrop-seven.vercel.app/",
      github: "https://github.com/shivansh01-24/LocalDrop",
      whatItIs: "A serverless peer-to-peer encrypted file sharing application I built leveraging direct WebRTC data channels and WebSocket signaling with zero server storage overhead.",
      highlights: [
        "Direct peer-to-peer browser encryption with zero intermediary server storage.",
        "Chunked binary streaming protocols and local subnet discovery delivering 3x higher throughput compared to multi-hop cloud uploads.",
        "Real-time transfer progress tracking, connection health indicators, and automatic peer reconnection logic."
      ]
    },
    {
      title: "Chinh - Universal In-Context AI Annotation & Note Vault",
      technologies: ["JavaScript (ES6+)", "Manifest V3", "HTML5 File System Access API", "DOM Mutation Engine"],
      liveDemo: "https://chromewebstore.google.com/detail/chinh/ijgeclhbbdffmfcbmdkkjggljgokcddb",
      github: "https://github.com/shivansh01-24/web-note",
      whatItIs: "An approved Chrome Web Store extension I developed that injects in-context annotation overlays across major AI platforms (ChatGPT, Claude, Gemini, Perplexity) with local-first file storage.",
      highlights: [
        "Published and verified on the official Google Chrome Web Store.",
        "Seamless in-context overlay injection across ChatGPT, Claude, Gemini, and Perplexity without breaking native chat DOMs.",
        "Local-first vault architecture using HTML5 File System Access API, writing atomic backups directly to local disk for 100% privacy and data ownership."
      ]
    },
    {
      title: "Portlo3d - 3D Celestial Portfolio & Systems Showcase",
      technologies: ["HTML5", "CSS3", "JavaScript (Vanilla ES6+)", "Three.js", "Canvas API", "OpenRouter AI"],
      liveDemo: "https://portlo3d.vercel.app/",
      github: "https://github.com/shivansh01-24/Portlo3d",
      whatItIs: "My personal 3D celestial portfolio featuring procedural atmospheric starfields, kinetic bezier wave physics, 3D project carousel, interactive orbital certificate inspector, and an AI companion mascot.",
      highlights: [
        "120fps hardware-accelerated animations using Canvas 2D and Three.js.",
        "Interactive 3D orbital certificate inspector and 3D project depth cards.",
        "Integrated production-ready AI companion chatbot powered by OpenRouter free model fallback architecture."
      ]
    }
  ],

  mySkills: {
    programmingLanguages: ["C++", "Python", "JavaScript (ES6+)", "TypeScript", "C", "SQL (PostgreSQL, MySQL)", "HTML5", "CSS3"],
    frameworksAndTools: ["React.js", "Next.js", "Node.js", "Express.js", "Three.js", "Redux Toolkit", "Tailwind CSS", "Vite", "Docker"],
    cloudAndDatabases: ["MongoDB", "PostgreSQL", "MySQL", "Oracle Cloud Infrastructure (OCI)", "Google Cloud Platform (GCP)", "Vercel"],
    protocolsAndArchitecture: ["REST APIs", "WebSockets", "WebRTC Data Channels", "JWT Authentication", "OpenRouter AI API", "Clean Architecture", "Microservices"],
    dsaProblemSolving: "I solve algorithmic problems actively on LeetCode (https://leetcode.com/u/shivansh_srivastava/) focusing on Dynamic Programming, Graph Theory, Trees, Binary Search, and Sliding Window in C++ with optimal O(N) or O(log N) time complexity."
  },

  myCertificates: [
    { title: "Certificate of Appreciation: Data Structure and Algorithm", issuer: "neo colab / iamneo (NIIT) & LPU", year: "2026", certNo: "20C12D63AJ0dK7dL7BM1" },
    { title: "Certificate of Appreciation: Object Oriented Programming", issuer: "neo colab / iamneo (NIIT) & LPU", year: "2026", certNo: "30b25B710N85O9cP6BQ1" },
    { title: "Certificate of Completion: Computer Programming (72 Hours)", issuer: "iamneo & LPU", year: "2025", certNo: "290m8529579CN2AO0BP1" },
    { title: "Summer Industrial Training — EDP & Technical Systems", issuer: "Banaras Locomotive Works (BLW), Indian Railways", year: "2026" },
    { title: "Oracle Cloud Infrastructure (OCI) 2025 AI Foundations Associate", issuer: "Oracle", year: "2025" },
    { title: "Oracle Cloud Infrastructure (OCI) 2025 Data Platform Foundations", issuer: "Oracle", year: "2025" },
    { title: "Introduction to Git and GitHub", issuer: "Google & Coursera", year: "2025", certId: "BYD54O2TLDJF" },
    { title: "Hands-on Introduction to Linux Commands and Shell Scripting", issuer: "IBM & Coursera", year: "2025", certId: "J7UC6FNS11AL" },
    { title: "Server side JavaScript with Node.js", issuer: "NIIT & Coursera", year: "2026", certId: "2X8UA1725PMQ" },
    { title: "Certified C++ Professional (OOP / Data Structures)", issuer: "Infosys Springboard", year: "2025" },
    { title: "Database Management Systems & SQL Schema Specialist", issuer: "Infosys Springboard", year: "2025" },
    { title: "DSA Placement Bootcamp (Grade 'A')", issuer: "Lovely Professional University (LPU / CPE)", year: "2026" }
  ],

  myAchievements: [
    { title: "1st Rank Winner — Infosys College Hackathon (2025)", details: "I won 1st place out of 100+ competing engineering teams for developing a production-ready software prototype within a 24-hour hackathon." },
    { title: "2nd Position (Silver Medalist) — Flight Fury Aeromodeling", details: "Certificate of Excellence in autonomous drone flight stability, aerodynamics, and telemetry control at Adwitiya Technical Symposium." },
    { title: "3rd Position — Drone Forge Hackathon", details: "Recognized for embedded drone flight controller algorithms, sensor integration, and telemetry at Chandigarh University." }
  ],

  myContact: {
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

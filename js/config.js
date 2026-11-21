/* ==========================================================================
   SITE CONFIG: edit everything here. No other file needs to change for text.

   - characterName:     the guide's name. "{name}" in any speech line is
                        replaced with it.
   - showPlaceholders:  any text written like "[LIKE THIS]" is a placeholder.
                        Placeholders render with a dashed outline so they are
                        easy to spot. Set this to false to hide every unfilled
                        placeholder on the live site.
   - image:             any project, research item, or award can take an image
                        path (e.g. "assets/img/awards/poster.webp"). Leave it
                        null to use code-drawn art instead.
   ========================================================================== */
window.SITE_CONFIG = {
  characterName: "Kenny",
  ownerName: "Kenny Adu Antwi",
  showPlaceholders: true,

  // Lines the guide says when he arrives at each stop (typed letter by letter).
  speech: {
    start:    "Hi, I'm {name}! 👋 Welcome to my portfolio! Scroll down and follow me, I'll show you around.",
    about:    "Here's a little about me!",
    projects: "Check out what I've built!",
    links:    "Find me here!",
    awards:   "Some things I'm proud of!",
    goals:    "Here's where I'm headed next!",
    beyond:   "When I'm not coding, you'll find me here!",
    finish:   "Thanks for following me! Let's connect!",
    closed:   "Scroll to keep running!",   // after a visitor closes a checkpoint pop-up
    idle:     "" // optional line when he waves after standing still (leave "" for none)
  },

  // Sound effects. Chime + fanfare are made in the browser.
  // runSound: plays once each time he starts running (set to null for chiptune footsteps instead).
  // runLoop:  alternative, a sound that loops for as long as he runs (e.g. "assets/sound/loop.mp3").
  sound: { enabled: true, volume: 0.35, runSound: "assets/sound/run.mp3", runVolume: 0.7, runLoop: null },

  // Retro sky life + look. Set any to false to turn it off.
  retro: { birds: true, spaceships: true, stars: true, scanlines: true },

  // Sky colours [top, bottom] for each stop. The sky blends between them as you travel.
  sky: [
    ["#2b1260", "#ff5f9e"], // start: synthwave dusk
    ["#291159", "#fb5a9b"], // about
    ["#250f52", "#f45498"], // projects
    ["#1d0b44", "#de468e"], // awards
    ["#18093c", "#cf3f88"], // goals
    ["#130733", "#bc3781"], // beyond code
    ["#0e0529", "#a52f78"]  // finish: night
  ],

  /* ---------------------------------------------------------------- START */
  start: {
    title: "Kenny Adu Antwi",
    subtitle: "Computer Science · University of Arkansas at Pine Bluff",
    hint: "Scroll to start ↓"
  },

  /* ---------------------------------------------------------- CHECKPOINT 1 */
  about: {
    title: "About Me",
    fullName: "Kenny Nana Kojo Adu Antwi",
    photo: "assets/img/profile.webp",   // headshot shown on the Bio tab (null to hide)
    tagline: "Computer Science student at the University of Arkansas at Pine Bluff, building AI, computer-vision, and full-stack software.",
    bio: "I'm Kenny Adu Antwi, a Computer Science student at the University of Arkansas at Pine Bluff, rooted in Accra, Ghana. Growing up, I saw how much time and opportunity people lost to problems that simple technology could have solved, from long waits to see a doctor to everyday systems that just didn't work as well as they should. That stuck with me, and it's what drives me today. I'm passionate about software development and artificial intelligence, and I'm building my skills through real-world projects. I want to use technology and AI to close those gaps in Ghana and beyond, and I thrive on collaborating with others to build solutions that make a real difference.",
    stats: [
      { label: "School",     value: "University of Arkansas at Pine Bluff" },
      { label: "Degree",     value: "BSc Computer Science" },
      { label: "GPA",        value: "4.00" },
      { label: "Graduating", value: "Expected December 2029" },
      { label: "Honors",     value: "Blakely Honors Program" },
      { label: "Base",       value: "Pine Bluff, Arkansas" }
    ],
    coursework: ["CS I & II", "Computer Organization", "Calculus I", "CodePath WEB 101", "CodePath Interview Prep"],
    experience: [
      {
        position: "AI Research Assistant",
        company: "Fish Nutrigenomics & AI Lab, University of Arkansas at Pine Bluff",
        location: "Pine Bluff, AR",
        duration: "August 2026 to Present",
        description: [
          "Built AquaVision, a computer-vision app that identifies and sizes 4 aquaculture species from one photo",
          "Automated length, mass, and biomass measurements, cutting batch sizing time by ~80% versus calipers",
          "Deployed it as a web app with a REST API so lab staff upload image batches and get annotated results",
          "Building a model that forecasts pond dissolved-oxygen drops so aerators run only when needed, reducing energy use",
          "Building LiveTank, a camera-based AI model that tracks pond fish to study behavior and detect hunger"
        ]
      },
      {
        position: "Student Researcher",
        company: "University of Arkansas at Pine Bluff",
        location: "Pine Bluff, AR",
        duration: "2026 to Present",
        description: [
          "Built an Arkansas public health dashboard that pulls state health data from the CDC API",
          "Deployed it on a self-hosted Kubernetes cluster built from repurposed desktop computers",
          "Enabled a professor to compare their research data against official CDC public health data"
        ]
      }
    ],
    leadership: [
      {
        position: "Social Media Director",
        company: "Association for Computing Machinery (ACM), UAPB Chapter",
        location: "Pine Bluff, AR",
        duration: "November 2026 to Present",
        description: [
          "Manage the chapter's social media accounts, creating posts that promote meetings, workshops, and events",
          "Share internship, scholarship, and career opportunities with computer science students"
        ]
      },
      {
        position: "Student Ambassador",
        company: "Adobe",
        location: "Pine Bluff, AR",
        duration: "August 2026 to Present",
        description: [
          "Promote Adobe creative tools and free student resources across campus",
          "Host events connecting students with Adobe resources and professional networks"
        ]
      },
      {
        position: "Volunteer",
        company: "First Love Foundation",
        location: "Accra, Ghana",
        duration: "October 2022 to October 2023",
        description: [
          "Distributed school supplies, clothing, and essentials to 150+ underprivileged children in rural communities including Awoshie and Madina",
          "Planned and oversaw a bi-annual blood donation campaign",
          "Took part in an annual youth outreach program focused on environmental cleanup"
        ]
      }
    ],
    affiliations: ["National Society of Black Engineers (NSBE)", "ColorStack"],
    skills: [
      { group: "Languages",          items: ["TypeScript", "JavaScript", "Python", "SQL", "HTML/CSS"] },
      { group: "Frameworks & Tools", items: ["React", "Node.js", "Express", "REST APIs", "GraphQL", "OpenAI API", "Kubernetes", "Git", "Supabase"] },
      { group: "Concepts",           items: ["Full-Stack Development", "Data Structures & Algorithms", "OOP", "Machine Learning", "Computer Vision"] }
    ]
  },

  /* ---------------------------------------------------------- CHECKPOINT 2 */
  // Clicking a card opens a pop-up with the details and links.
  projects: {
    title: "Projects",
    levels: [
      {
        name: "AquaVision",
        date: "August 2026 – Present",
        meta: "Fish Nutrigenomics & AI Lab, UAPB",
        summary: "A computer-vision app that identifies and sizes 4 aquaculture species from one photo.",
        details: [
          "Identifies and sizes 4 aquaculture species from a single photo",
          "Automated length, mass, and biomass measurements, cutting batch sizing time by ~80% versus calipers",
          "Deployed as a web app with a REST API so lab staff upload image batches and get annotated results"
        ],
        tech: ["Computer Vision", "Machine Learning", "REST API"],
        image: "assets/img/projects/aquavision.webp",
        links: [{ label: "Open AquaVision", href: "https://fnai-website-1.onrender.com" }]
      },
      {
        name: "Shipwright: Autonomous AI Coding Agent",
        date: "August 2026",
        meta: "Team project",
        summary: "A team AI agent that turns new GitHub issues into code changes and sends them to human review.",
        details: [
          "Built the Express API gateway and GitHub webhook for a team AI agent that turns new issues into code changes",
          "Implemented a draft pull request flow so the agent's changes go to human review instead of merging directly",
          "Cut GitHub API requests by up to 97% by batching 40 file reads into one GraphQL query"
        ],
        tech: ["TypeScript", "Node.js", "Express", "GitHub API", "GraphQL"],
        image: "assets/img/projects/shipwright.webp",
        links: [{ label: "View on GitHub", href: "https://github.com/abj360/shipwright" }]
      },
      {
        name: "Vitals: AI Health Coach",
        date: "April 2026",
        meta: "UAPB Innovation Sprint · 2nd place",
        summary: "An AI health app for heart-disease prevention that won 2nd place at the UAPB Innovation Sprint.",
        details: [
          "Prototyped an AI health app for heart-disease prevention at the UAPB Innovation Sprint, winning 2nd place",
          "Built a GPT-4o-mini food scanner with heart-health scoring and a conversational health assistant",
          "Developed the React frontend and Node.js/Supabase backend with authentication, demoed to 30+ testers"
        ],
        tech: ["TypeScript", "React", "Node.js", "Supabase", "GPT-4o-mini"],
        image: "assets/img/projects/vitals.webp",
        links: [{ label: "Open Vitals", href: "https://vitals-ivory.vercel.app" }]
      }
    ],
    bonusTitle: "Research",
    bonusIntro: "What I'm working on in the lab right now.",
    bonus: [
      {
        name: "Arkansas Public Health Dashboard",
        date: "2026 – Present",
        meta: "Student Researcher, UAPB",
        summary: "A dashboard that pulls Arkansas state health data from the CDC API.",
        details: [
          "Built an Arkansas public health dashboard that pulls state health data from the CDC API",
          "Deployed it on a self-hosted Kubernetes cluster built from repurposed desktop computers",
          "Enabled a professor to compare their research data against official CDC public health data"
        ],
        tech: ["CDC API", "Kubernetes"],
        image: null,
        links: []
      },
      {
        name: "LiveTank",
        date: "In progress",
        meta: "Fish Nutrigenomics & AI Lab, UAPB",
        summary: "A camera-based AI model that tracks pond fish to study behavior and detect hunger.",
        details: ["Building a camera-based AI model that tracks pond fish to study behavior and detect hunger"],
        tech: ["Computer Vision", "Machine Learning"],
        image: null,
        links: []
      },
      {
        name: "Dissolved-Oxygen Forecasting",
        date: "In progress",
        meta: "Fish Nutrigenomics & AI Lab, UAPB",
        summary: "A model that forecasts pond dissolved-oxygen drops so aerators run only when needed.",
        details: ["Building a model that forecasts pond dissolved-oxygen drops so aerators run only when needed, reducing energy use"],
        tech: ["Machine Learning"],
        image: null,
        links: []
      }
    ]
  },

  /* ---------------------------------------------------------- CHECKPOINT 3 */
  links: {
    title: "Links",
    // icon: github | linkedin | mail | resume | camera | globe
    items: [
      { label: "GitHub",   sub: "github.com/kenshewrote",         href: "https://github.com/kenshewrote", icon: "github" },
      { label: "LinkedIn", sub: "linkedin.com/in/kenny-adu-antwi", href: "https://www.linkedin.com/in/kenny-adu-antwi/", icon: "linkedin" },
      { label: "Resume",   sub: "PDF",                            href: "kenny_adu_antwi_resume.pdf", icon: "resume" },
      { label: "Email",    sub: "aduantk35745@uapb.edu",          href: "mailto:aduantk35745@uapb.edu", icon: "mail" }
    ]
  },

  /* ---------------------------------------------------------- CHECKPOINT 4 */
  awards: {
    title: "Awards & Honors",
    // icon: trophy | medal | star.   image: optional photo, shown on the badge and in its pop-up.
    items: [
      { icon: "trophy", name: "2nd Place, UAPB Innovation Sprint", detail: "Vitals: an AI health app for heart-disease prevention. The hackathon started in April 2026 and the final competition was on May 1, 2026.", when: "April–May 2026", image: "assets/img/awards/innovation-sprint.webp" },
      { icon: "medal",  name: "3rd Place, PAWC GSD Poster Competition", detail: "Poster competition placement.", when: "", image: "assets/img/awards/pawc-poster.webp" },
      { icon: "star",   name: "Chancellor's Full Scholarship", detail: "University of Arkansas at Pine Bluff.", when: "", image: null },
      { icon: "star",   name: "Blakely Honors Program", detail: "University of Arkansas at Pine Bluff.", when: "", image: null },
      { icon: "medal",  name: "4.00 GPA", detail: "BSc Computer Science.", when: "", image: null }
    ]
  },

  /* ---------------------------------------------------------- CHECKPOINT 5 */
  goals: {
    title: "Goals",
    // status: "done" | "active" | "todo".  progress: 0 to 100, or null for an animated "in progress" bar.
    quests: [
      { status: "active", name: "Earn my BSc in Computer Science", note: "Expected December 2029", progress: null },
      { status: "active", name: "Ship LiveTank: AI that tracks pond fish behavior and detects hunger", note: "In progress", progress: null },
      { status: "active", name: "Forecast pond dissolved-oxygen drops so aerators only run when needed", note: "In progress", progress: null },
      { status: "todo",   name: "Land my first internship", note: "Next up", progress: 0 },
      { status: "todo",   name: "Use tech and AI to help bridge the healthcare gap in Ghana", note: "The long game", progress: 0 }
    ]
  },

  /* ---------------------------------------------------------- CHECKPOINT 6 */
  beyond: {
    title: "Beyond Code",
    soccer: {
      intro: "I like to watch soccer.",
      team: "Chelsea FC",
      teamNote: "My favorite team",
      image: "assets/img/beyond/chelsea-cl-2012.webp",
      imageAlt: "Chelsea players on an open-top bus with the Champions League trophy and a 'Champions of Europe' banner",
      caption: "Champions of Europe: the 2012 Champions League victory parade",
      // Free to use under CC BY 2.0 as long as this credit stays.
      credit: { text: "Photo: Julian Mason, CC BY 2.0", href: "https://commons.wikimedia.org/wiki/File:Chelsea_Champions_League_trophy_parade_2012.jpg" }
    },
    // Cover cards. image: picture on the card. Without one, a pixel cover is drawn using
    // art (spiral | blade | spade | flame | chess) and colors [top, bottom].
    anime: {
      intro: "I like to watch anime. My favorites:",
      list: [
        { name: "Naruto",                 image: "assets/img/beyond/naruto.webp",    art: "spiral", colors: ["#ff8a2b", "#b33c12"] },
        { name: "Bleach",                 image: "assets/img/beyond/bleach.webp",    art: "blade",  colors: ["#3a3f52", "#0d0f18"] },
        { name: "Hunter x Hunter",        image: "assets/img/beyond/hxh.webp",       art: "spade",  colors: ["#3fae6a", "#145236"] },
        { name: "Fairy Tail",             image: "assets/img/beyond/fairytail.webp", art: "flame",  colors: ["#e8476a", "#6b1035"] },
        { name: "Classroom of the Elite", image: "assets/img/beyond/cote.webp",      art: "chess",  colors: ["#c8344a", "#1c2550"] },
        { name: "Pokémon",                image: "assets/img/beyond/pokemon.webp",   art: "spiral", colors: ["#ffcc33", "#d23a2a"] }
      ]
    },
    games: {
      intro: "I like to play games. My favorites:",
      list: [
        { name: "Devil May Cry",  image: "assets/img/beyond/dmc.webp", art: "blade", colors: ["#b0182a", "#1a0508"] },
        { name: "Kingdom Hearts", image: "assets/img/beyond/kh.webp",  art: "spade", colors: ["#3a6fd8", "#121a44"] },
        { name: "Mario",                          image: "assets/img/beyond/mario.webp",        art: "spiral", colors: ["#e62828", "#780a14"] },
        { name: "EA Sports FC",                   image: "assets/img/beyond/eafc.webp",         art: "spade",  colors: ["#167850", "#061e1c"] },
        { name: "Army of Two: The Devil's Cartel", image: "assets/img/beyond/aotdc.webp",       art: "blade",  colors: ["#6b5a3a", "#1a140c"] },
        { name: "Batman: Arkham Knight",          image: "assets/img/beyond/arkhamknight.webp", art: "flame",  colors: ["#2a2f3a", "#06070a"] }
      ]
    },
    art: {
      intro: "I like to draw and make art.",
      // Add your pieces: { image: "assets/img/beyond/art-1.webp", title: "Name of the piece" }
      pieces: [
        { image: "assets/img/art/drawing-4.webp", title: "Drawing 1" },
        { image: "assets/img/art/drawing-2.webp", title: "Drawing 2" },
        { image: "assets/img/art/drawing-3.webp", title: "Drawing 3" },
        { image: "assets/img/art/drawing-1.webp", title: "Drawing 4" }
      ]
    },
    editing: {
      intro: "I like editing photos and videos, turning raw clips and shots into finished posts.",
      tags: ["Photo editing", "Video editing", "Social media content", "Adobe creative tools"]
    },
    // Same format as experience entries.
    clubs: {
      intro: "Outside class I'm active in clubs on campus:",
      list: [
        { position: "Social Media Director", company: "ACM, UAPB Chapter", duration: "November 2026 to Present",
          description: ["Create posts promoting meetings, workshops, and events", "Share internship, scholarship, and career opportunities with CS students"] },
        { position: "Student Ambassador", company: "Adobe", duration: "August 2026 to Present",
          description: ["Host events connecting students with Adobe tools and free student resources"] },
        { position: "Member", company: "National Society of Black Engineers (NSBE)", description: [] },
        { position: "Member", company: "ColorStack", description: [] },
        { position: "Scholar", company: "Blakely Honors Program", description: [] }
      ]
    }
  },

  /* ------------------------------------------------------------- FINISH */
  finish: {
    title: "Thanks for visiting!",
    text: "Want to build something together or just say hi? Reach out below.",
    email: "aduantk35745@uapb.edu",
    github: "https://github.com/kenshewrote",
    linkedin: "https://www.linkedin.com/in/kenny-adu-antwi/",
    resume: "kenny_adu_antwi_resume.pdf",
    quote: "",        // optional quote shown at the bottom (leave "" to hide)
    quoteSource: ""
  }
};

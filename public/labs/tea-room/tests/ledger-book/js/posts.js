// The posts of this chapter, in the owner's order, each as its own front matter has it (id, title, date and the
// preview block: verdict, takeaway, points, picture). Written by a script from src/content/posts/<slug>.md: nothing
// here is retyped. A post that is a draft or unlisted is left out by the script.
export const POSTS = [
  {
    "id": "AO-007",
    "slug": "no-vs-code-no-terminal",
    "title": "My first AI projects, before I knew what a terminal was",
    "topic": "learning",
    "date": "2026-08-08",
    "verdict": "The code was the easy part",
    "takeaway": "The model wrote all my code, but it couldn't set up my computer or tell me what I didn't know to ask, and that was the real beginner barrier.",
    "points": [
      "I didn't know where files go, had no code editor and had never used a terminal, so GitHub was a wall.",
      "I did git, the tool that tracks code versions, by hand and badly. Much later I learned a code editor does it for me.",
      "Each gap was invisible until I ran into it. Then one sentence from the model fixed it for good."
    ],
    "image": "/media/previews/no-vs-code-no-terminal.webp",
    "alt": "Aaron's cartoon self in a green kimono, sitting with a laptop and scratching his head, an unplugged cable beside him",
    "icon": "/media/icons/AO-007.webp"
  },
  {
    "id": "AO-008",
    "slug": "monster-hunter-was-my-degree",
    "title": "Learning to program by building an AI monster game",
    "topic": "learning",
    "date": "2026-08-08",
    "verdict": "The AI call is the easy part",
    "takeaway": "The hard part of an AI app is everything around the model call, like queueing requests, chaining steps, handling failures and telling the user what's going on.",
    "points": [
      "The model kept breaking my code's structure, so I read every line and learned that structure myself.",
      "Picking by hand which files Claude saw, on every message, forced me to learn my own code.",
      "One GPU runs one prompt at a time, so every request waits in a queue and the whole app is built to wait."
    ],
    "image": "/media/previews/monster-hunter-was-my-degree.webp",
    "alt": "Luminel's card from LLM Monster Hunter: a glowing cream moth with starry blue wings in a mossy forest",
    "icon": "/media/icons/AO-008.webp"
  },
  {
    "id": "AO-029",
    "slug": "the-missing-map",
    "title": "44 agents made the first lesson of my course for AI builders",
    "topic": "learning",
    "date": "2026-10-01",
    "verdict": "The checks made it safe",
    "takeaway": "An agent that knew the material wrote a line a beginner would learn wrong, and another agent, told to read the script as a beginner, caught it.",
    "points": [
      "The draft said Python's can't-open-file error \"usually\" isn't your code. It never is. Python never opened the file.",
      "Also caught: the AI on screen typing the exact command the next scene shows failing, and a narrator voice saying \"uh\".",
      "$134 at API list prices for a 5:15 lesson. The first run of the daily lesson job stopped at its first command."
    ],
    "image": "/media/previews/the-missing-map.webp",
    "alt": "Title card of lesson 00.01, The hidden curriculum, over a painted tea house at night",
    "icon": "/media/icons/AO-029.webp"
  },
  {
    "id": "AO-077",
    "slug": "reading-the-logs-of-mit-s-ai-weight-editing-experiments",
    "title": "Reading the logs of MIT's AI weight-editing experiments",
    "topic": "learning",
    "date": "2026-11-04",
    "verdict": "First take, since retracted",
    "takeaway": "What I concluded from the logs before I made a film of the experiments. Watching the film changed my mind about most of it.",
    "points": [],
    "image": "/media/previews/reading-the-logs-of-mit-s-ai-weight-editing-experiments.webp",
    "alt": "Heatmaps of four trained game networks' first-layer weights: a paddle row in Breakout, a paddle column in Pong, a maze in Pac-Man, road lanes in Freeway",
    "icon": "/media/icons/AO-077.webp"
  }
];

// The last spread. icons: the newest listed posts' own icons (their public addresses), as a wall. The words are a
// plain stand-in for the owner to rewrite, but for "line", which is his own sentence from the homepage's card.
export const MORE = {
  "cover": "The Ledger",
  "title": "There is more in the ledger",
  "stamp": "Every post, newest first",
  "line": "The Ledger logs everything from mistakes to funny moments to aspirational ideas.",
  "button": "Open the ledger",
  "href": "/ledger/",
  "icons": [
    "/media/icons/AO-081-96.webp",
    "/media/icons/AO-072-96.webp",
    "/media/icons/AO-071-96.webp",
    "/media/icons/AO-069-96.webp",
    "/media/icons/AO-068-96.webp",
    "/media/icons/AO-067-96.webp",
    "/media/icons/AO-066-96.webp",
    "/media/icons/AO-065-96.webp",
    "/media/icons/AO-064-96.webp",
    "/media/icons/AO-063-96.webp",
    "/media/icons/AO-062-96.webp",
    "/media/icons/AO-061-96.webp",
    "/media/icons/AO-060-96.webp",
    "/media/icons/AO-059-96.webp",
    "/media/icons/AO-058-96.webp",
    "/media/icons/AO-057-96.webp"
  ]
};

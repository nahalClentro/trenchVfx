export type CinematicWorkItem = {
  id: string;
  title: string;
  category: string;
  youtubeId: string;
  description: string;
};

export const cinematicWorks: CinematicWorkItem[] = [
  {
    id: "1",
    title: "AGENCY REEL 2026",
    category: "Showreel",
    youtubeId: "dQw4w9WgXcQ",
    description: "A showcase of our most technically demanding and visually striking long-form projects from the past year.",
  },
  {
    id: "2",
    title: "NEON CITYSCAPE",
    category: "VFX Integration",
    youtubeId: "LXb3EKWsInQ",
    description: "Seamlessly blending 3D assets with live-action footage for a futuristic brand campaign.",
  },
  {
    id: "3",
    title: "AUTOMOTIVE COMMERCIAL",
    category: "Color Grade",
    youtubeId: "9bZkp7q19f0",
    description: "High-contrast cinematic grading for a luxury car manufacturer.",
  },
  {
    id: "4",
    title: "MUSIC VIDEO MASTER",
    category: "Editing",
    youtubeId: "v2AC41dglnM",
    description: "Fast-paced rhythm editing and dynamic transitions for a chart-topping single.",
  },
  {
    id: "5",
    title: "DOCUMENTARY SHORT",
    category: "Sound Design",
    youtubeId: "jNQXAC9IVRw",
    description: "Immersive foley and spatial sound design for a deep-dive documentary.",
  },
  {
    id: "6",
    title: "SCI-FI ORIGINALS",
    category: "CGI & Comp",
    youtubeId: "ZVT82w5Eu5w",
    description: "Complex green screen keying and CGI set extensions for independent sci-fi.",
  },
];

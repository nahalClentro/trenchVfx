export type WorkItem = {
  id: string;
  title: string;
  category: string;
  youtubeId: string;
  description?: string;
};

export const works: WorkItem[] = [
  {
    id: "1",
    title: "DYNAMIC WARP SPEED",
    category: "Transitions",
    youtubeId: "9XpRuHhmock",
    description: "Speed ramping and motion blur zoom transitions",
  },
  {
    id: "2",
    title: "SOUND DESIGN SYNC",
    category: "Sound Design",
    youtubeId: "GuO_EqeutKk",
    description: "Spatial sound editing and speed ramp synchronization",
  },
  {
    id: "3",
    title: "MOTION GRAPHICS REEL",
    category: "Motion Design",
    youtubeId: "5iwy5v6FCas",
    description: "Typography animation and kinetic motion design",
  }
];

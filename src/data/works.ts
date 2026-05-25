export type WorkItem = {
  id: string;
  title: string;
  category: string;
  youtubeId: string;
  description?: string;
};

export const works: WorkItem[] = [
  {
    id: "2",
    title: "CINEMATIC CORRECTION",
    category: "Color Grade",
    youtubeId: "ZVT82w5Eu5w",
    description: "Premiere Pro cinematic color wheels and tone curves correction",
  },
  {
    id: "3",
    title: "3D CAMERA INTEGRATION",
    category: "CGI Edit",
    youtubeId: "ncx7kBmxXHs",
    description: "Blender CGI tracking and realistic light integration",
  },
  {
    id: "4",
    title: "DYNAMIC WARP SPEED",
    category: "Transitions",
    youtubeId: "9XpRuHhmock",
    description: "Speed ramping and motion blur zoom transitions",
  },
  {
    id: "5",
    title: "SOUND DESIGN SYNC",
    category: "Sound Design",
    youtubeId: "GuO_EqeutKk",
    description: "Spatial sound editing and speed ramp synchronization",
  },
  {
    id: "6",
    title: "MOTION GRAPHICS REEL",
    category: "Motion Design",
    youtubeId: "5iwy5v6FCas",
    description: "Typography animation and kinetic motion design",
  },
];

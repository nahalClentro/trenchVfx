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
    title: "CINEMATIC CORRECTION",
    category: "Color Grade",
    youtubeId: "ZVT82w5Eu5w",
    description: "Premiere Pro cinematic color wheels and tone curves correction",
  },
  {
    id: "2",
    title: "3D CAMERA INTEGRATION",
    category: "CGI Edit",
    youtubeId: "ncx7kBmxXHs",
    description: "Blender CGI tracking and realistic light integration",
  },
  {
    id: "3",
    title: "PODCAST EDIT",
    category: "Long Form",
    youtubeId: "UYQ8iB6mnkE",
    description: "Long-form podcast edit with dynamic pacing and sound design",
  },
  {
    id: "4",
    title: "CINEMATIC REEL",
    category: "Cinematic",
    youtubeId: "hB_ODiIlLIc",
    description: "Cinematic storytelling with color grade and motion design",
  },
];

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
    description: "Premiere Pro cinematic color wheels and tone curves correction.",
  },
  {
    id: "2",
    title: "3D CAMERA INTEGRATION",
    category: "CGI Edit",
    youtubeId: "ncx7kBmxXHs",
    description: "Blender CGI tracking and realistic light integration.",
  },
];

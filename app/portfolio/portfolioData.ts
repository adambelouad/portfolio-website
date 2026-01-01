// Portfolio items data - add your projects here!

export interface PortfolioItem {
  id: string;
  name: string;
  icon: string; // Path to icon image
  dateModified: string;
  size: string;
  kind: string;
  link: string; // URL to open when clicked
  windowId?: string; // Window ID to open instead of link
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: "1",
    name: "Personal Website",
    icon: "/computer-image.png",
    dateModified: "Sat, Dec 27, 2025, 2:30 PM",
    size: "4.2 MB",
    kind: "React",
    link: "/portfolio/personal-website/",
    windowId: "personal-website",
  },
  {
    id: "2",
    name: "SporkAI",
    icon: "/default-folder.png",
    dateModified: "Fri, Dec 20, 2024, 11:15 AM",
    size: "12 MB",
    kind: "Swift",
    link: "/portfolio/personal-website/",
    windowId: "personal-website",
  },
  {
    id: "3",
    name: "WasteWise",
    icon: "/default-folder.png",
    dateModified: "Mon, Nov 18, 2024, 9:00 AM",
    size: "68 K",
    kind: "Swift",
    link: "#",
  },
  {
    id: "4",
    name: "Hoagie.IO",
    icon: "/default-folder.png",
    dateModified: "Wed, Oct 30, 2024, 4:45 PM",
    size: "2.1 MB",
    kind: "React",
    link: "#",
  },
  {
    id: "5",
    name: "Daily Princetonian Projects",
    icon: "/default-folder.png",
    dateModified: "Tue, Sep 15, 2024, 1:20 PM",
    size: "856 K",
    kind: "React",
    link: "#",
  },
  {
    id: "6",
    name: "Buisness Today Mobile App",
    icon: "/default-folder.png",
    dateModified: "Tue, Sep 15, 2024, 1:20 PM",
    size: "856 K",
    kind: "Swift",
    link: "#",
  },
];


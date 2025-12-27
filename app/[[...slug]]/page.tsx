"use client";

import Image from "next/image";
import Clock from "../components/Clock";
import MenuItem from "../components/MenuItem";
import DesktopIcon from "../components/DesktopIcon";
import Window from "../components/Window";
import PortfolioWindow from "../portfolio/PortfolioWindow";
import AboutWindow from "../about/AboutWindow";
import { useState, useEffect, useCallback } from "react";

// Define available windows and their configurations
const WINDOW_CONFIG: Record<
  string,
  { title: string; component: React.ComponentType }
> = {
  portfolio: { title: "Portfolio", component: PortfolioWindow },
  about: { title: "About", component: AboutWindow },
};

// Helper to get initial open windows from URL (runs during SSR and client)
function getInitialWindowFromPath(): string | null {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname.slice(1);
  return path && WINDOW_CONFIG[path] ? path : null;
}

export default function Home() {
  // Use a fixed default position for SSR (right-aligned, assuming common screen width)
  const defaultRightX = 1920 - 96 - 16;

  const [iconPositions, setIconPositions] = useState({
    portfolio: { x: defaultRightX, y: 45 },
    about: { x: defaultRightX, y: 140 },
    resume: { x: defaultRightX, y: 235 },
    github: { x: defaultRightX, y: 330 },
    linkedin: { x: defaultRightX, y: 425 },
  });

  // Use lazy initialization to read from localStorage synchronously on first render
  const [openWindows, setOpenWindows] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const windowFromPath = getInitialWindowFromPath();
      const saved = localStorage.getItem("openWindows");
      const savedWindows = saved
        ? JSON.parse(saved).filter((w: string) => WINDOW_CONFIG[w])
        : [];

      if (windowFromPath && !savedWindows.includes(windowFromPath)) {
        return [...savedWindows, windowFromPath];
      }
      return savedWindows;
    } catch {
      return [];
    }
  });

  const [windowPositions, setWindowPositions] = useState<
    Record<string, { x: number; y: number }>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("windowPositions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [windowOrder, setWindowOrder] = useState<string[]>([]); // Track z-order (last = top)
  const [isClient, setIsClient] = useState(false);

  // Storage keys for persisting state
  const STORAGE_KEY = "openWindows";
  const POSITIONS_KEY = "windowPositions";

  // Mark client-side hydration complete
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Bring a window to front
  const bringToFront = useCallback((windowId: string) => {
    setWindowOrder((prev) => {
      const filtered = prev.filter((id) => id !== windowId);
      return [...filtered, windowId];
    });
  }, []);

  // Get current window from URL path
  const getWindowFromPath = useCallback(() => {
    if (typeof window === "undefined") return null;
    const path = window.location.pathname.slice(1); // Remove leading slash
    return path && WINDOW_CONFIG[path] ? path : null;
  }, []);

  // Save open windows to localStorage
  const saveWindowsToStorage = useCallback((windows: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
    } catch {
      // localStorage might be unavailable
    }
  }, []);

  // Load open windows from localStorage
  const loadWindowsFromStorage = useCallback((): string[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter to only valid windows
          return parsed.filter((w) => WINDOW_CONFIG[w]);
        }
      }
    } catch {
      // localStorage might be unavailable or corrupted
    }
    return [];
  }, []);

  // Save window positions to localStorage
  const savePositionsToStorage = useCallback(
    (positions: Record<string, { x: number; y: number }>) => {
      try {
        localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
      } catch {
        // localStorage might be unavailable
      }
    },
    [],
  );

  // Load window positions from localStorage
  const loadPositionsFromStorage = useCallback((): Record<
    string,
    { x: number; y: number }
  > => {
    try {
      const saved = localStorage.getItem(POSITIONS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // localStorage might be unavailable or corrupted
    }
    return {};
  }, []);

  // Update a single window's position
  const updateWindowPosition = useCallback(
    (windowId: string, position: { x: number; y: number }) => {
      setWindowPositions((prev) => {
        const newPositions = { ...prev, [windowId]: position };
        savePositionsToStorage(newPositions);
        return newPositions;
      });
    },
    [savePositionsToStorage],
  );

  // Calculate center position for new windows (100px higher than true center)
  const getCenteredPosition = useCallback(() => {
    if (typeof window === "undefined") {
      return { x: 200, y: 200 }; // SSR fallback
    }
    // Window component is 600px wide and ~400px tall
    const windowWidth = 600;
    const windowHeight = 400;
    const menuBarHeight = 30;
    const verticalOffset = 100; // Higher than center

    return {
      x: Math.max(0, (window.innerWidth - windowWidth) / 2),
      y: Math.max(
        0,
        (window.innerHeight - menuBarHeight - windowHeight) / 2 -
          verticalOffset,
      ),
    };
  }, []);

  // Get position for a window (saved or centered for new)
  const getWindowPosition = useCallback(
    (windowId: string) => {
      // First check saved positions
      if (windowPositions[windowId]) {
        return windowPositions[windowId];
      }
      // New windows open centered
      return getCenteredPosition();
    },
    [windowPositions, getCenteredPosition],
  );

  // Sync URL window to storage on mount (lazy init already loaded the state)
  useEffect(() => {
    const windowFromPath = getWindowFromPath();
    if (windowFromPath && openWindows.includes(windowFromPath)) {
      saveWindowsToStorage(openWindows);
    }
  }, []); // Only run once on mount

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Use saved state if available (preserves multiple windows)
      if (event.state?.openWindows && Array.isArray(event.state.openWindows)) {
        setOpenWindows(event.state.openWindows);
        saveWindowsToStorage(event.state.openWindows);
      } else {
        // Fallback to URL-based detection
        const windowFromPath = getWindowFromPath();
        if (windowFromPath) {
          const savedWindows = loadWindowsFromStorage();
          if (!savedWindows.includes(windowFromPath)) {
            const newWindows = [...savedWindows, windowFromPath];
            setOpenWindows(newWindows);
            saveWindowsToStorage(newWindows);
          } else {
            setOpenWindows(savedWindows);
          }
        } else {
          setOpenWindows([]);
          saveWindowsToStorage([]);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [getWindowFromPath, loadWindowsFromStorage, saveWindowsToStorage]);

  // Calculate icon positions after mount
  useEffect(() => {
    const rightPosition = (y: number) => ({
      x: window.innerWidth - 96 - 16,
      y,
    });

    setIconPositions({
      portfolio: rightPosition(45),
      about: rightPosition(140),
      resume: rightPosition(235),
      github: rightPosition(330),
      linkedin: rightPosition(425),
    });

    const handleResize = () => {
      setIconPositions({
        portfolio: rightPosition(45),
        about: rightPosition(140),
        resume: rightPosition(235),
        github: rightPosition(330),
        linkedin: rightPosition(425),
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Open a window and update URL (no page refresh)
  const openWindow = (windowId: string) => {
    if (!openWindows.includes(windowId)) {
      const newOpenWindows = [...openWindows, windowId];
      setOpenWindows(newOpenWindows);
      saveWindowsToStorage(newOpenWindows);
      // Add to window order (bring to front)
      setWindowOrder((prev) => [
        ...prev.filter((id) => id !== windowId),
        windowId,
      ]);
      // Store all open windows in history state for back/forward navigation
      window.history.pushState(
        { openWindows: newOpenWindows },
        "",
        `/${windowId}`,
      );
    } else {
      // Window already open, close it (toggle behavior)
      closeWindow(windowId);
    }
  };

  // Close a window and update URL (no page refresh)
  const closeWindow = (windowId: string) => {
    const newOpenWindows = openWindows.filter((id) => id !== windowId);
    setOpenWindows(newOpenWindows);
    saveWindowsToStorage(newOpenWindows);

    // Remove from window order
    setWindowOrder((prev) => prev.filter((id) => id !== windowId));

    // Clear saved position so window reopens centered
    setWindowPositions((prev) => {
      const newPositions = { ...prev };
      delete newPositions[windowId];
      savePositionsToStorage(newPositions);
      return newPositions;
    });

    // Update URL to reflect remaining windows or go home
    if (newOpenWindows.length > 0) {
      // Set URL to the last remaining window
      const lastWindow = newOpenWindows[newOpenWindows.length - 1];
      window.history.pushState(
        { openWindows: newOpenWindows },
        "",
        `/${lastWindow}`,
      );
    } else {
      window.history.pushState({ openWindows: [] }, "", "/");
    }
  };

  // Menu items configuration
  // const menuItems = [
  //   {
  //     label: "Portfolio",
  //     items: ["Projects", "Gallery", "Case Studies", "---", "View All"],
  //   },
  //   {
  //     label: "About",
  //     items: ["About Me", "Experience", "Skills", "---", "Resume"],
  //   },
  //   {
  //     label: "Contact",
  //     items: ["Email", "LinkedIn", "GitHub"],
  //   },
  // ];

  return (
    <div className="flex min-h-screen flex-col font-sans bg-[url('/quantum-foam-background.png')] bg-cover bg-center bg-no-repeat">
      {/* Top Header Bar */}
      <div className="w-full h-[30px] bg-[#DDDDDD] relative border-b-[1px] border-b-[#BBBBBB] after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-[-2px] after:h-[1px] after:bg-[#262626] flex flex-row items-center justify-between">
        {/* Left Side of Top Header Bar */}
        <div className="flex h-full items-center justify-start">
          <div className="flex h-[30px] items-center px-4 hover:bg-[#333399] hover:text-white transition-colors cursor-pointer">
            <Image
              src="/apple-logo.png"
              alt="Apple Logo"
              width={18}
              height={18}
            />
          </div>
          {/* <div className="flex h-[30px]">
            {menuItems.map((menu, index) => (
              <MenuItem key={index} label={menu.label} items={menu.items} />
            ))}
          </div> */}
        </div>

        {/* Right Side of Top Header Bar */}
        <div className="flex h-full items-center justify-end">
          <Clock />
          <Image
            src="/menu-bar-resizer.png"
            alt="Menu Bar Resizer"
            width={10}
            height={10}
            className="cursor-pointer"
          />
          <div className="relative flex h-[30px] items-center">
            <MenuItem
              label="Finder"
              icon={
                <Image
                  src="/finder.png"
                  alt="Finder Icon"
                  width={20}
                  height={15}
                  className="mr-1"
                />
              }
            />
          </div>
        </div>
      </div>

      {/* Desktop Area */}
      <div className="flex-1 relative overflow-hidden">
        <DesktopIcon
          iconSrc="/default-folder.png"
          label="Portfolio"
          onOpen={() => openWindow("portfolio")}
          initialPosition={iconPositions.portfolio}
          menuBarHeight={30}
        />

        <DesktopIcon
          iconSrc="/default-folder.png"
          label="About"
          onOpen={() => openWindow("about")}
          initialPosition={iconPositions.about}
          menuBarHeight={30}
        />

        <DesktopIcon
          iconSrc="/default-folder.png"
          label="Resume"
          link="/belouad_adam_resume.pdf"
          openInNewTab={true}
          initialPosition={iconPositions.resume}
          menuBarHeight={30}
        />

        <DesktopIcon
          iconSrc="/github-icon.png"
          label="GitHub"
          link="https://github.com/adambelouad"
          openInNewTab={true}
          initialPosition={iconPositions.github}
          menuBarHeight={30}
        />

        <DesktopIcon
          iconSrc="/linkedin-logo.png"
          label="LinkedIn"
          link="https://www.linkedin.com/in/adambelouad"
          openInNewTab={true}
          initialPosition={iconPositions.linkedin}
          menuBarHeight={30}
        />

        {/* Render all open windows */}
        {isClient &&
          openWindows.map((windowId) => {
            const config = WINDOW_CONFIG[windowId];
            if (!config) return null;
            const WindowComponent = config.component;
            const savedPosition = getWindowPosition(windowId);
            // Calculate z-index based on window order (50 base + position in order)
            const zIndex = 50 + windowOrder.indexOf(windowId);
            return (
              <Window
                key={windowId}
                title={config.title}
                onClose={() => closeWindow(windowId)}
                initialPosition={savedPosition}
                onPositionChange={(pos) => updateWindowPosition(windowId, pos)}
                zIndex={zIndex}
                onFocus={() => bringToFront(windowId)}
              >
                <WindowComponent />
              </Window>
            );
          })}
      </div>
    </div>
  );
}

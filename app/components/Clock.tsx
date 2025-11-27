"use client";

import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      
      const period = hours >= 12 ? "PM" : "AM";
      
      hours = hours % 12 || 12;
      
      setTime(`${hours}:${minutes.toString().padStart(2, "0")} ${period}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span className="text-[14px] px-4">{time}</span>;
}

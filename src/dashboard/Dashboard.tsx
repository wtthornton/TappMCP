import React, { useState, useEffect, useRef } from 'react';
import EnhancedDashboard from '../visualization/EnhancedDashboard';
import RealTimeMetricsService from './RealTimeMetricsService';
import { RealTimeData } from './RealTimeDataManager';

interface DashboardProps {
  width?: number;
  height?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ width = 1200, height = 800 }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Detect screen size and device type
  useEffect(() => {
    const checkScreenSize = () => {
      const currentWidth = window.innerWidth;
      setIsMobile(currentWidth < 768);
      setIsTablet(currentWidth >= 768 && currentWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <EnhancedDashboard
      width={width}
      height={height}
      isMobile={isMobile}
      isTablet={isTablet}
    />
  );
};

export default Dashboard;

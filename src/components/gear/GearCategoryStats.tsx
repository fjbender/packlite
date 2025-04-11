'use client';
import { useState, useRef } from 'react';

interface GearCategoryStatsProps {
  categoryWeights: Record<string, number>;
}

interface TooltipState {
  visible: boolean;
  category: string;
  weight: number;
  percentage: number;
  position: {
    top: number;
    left: number;
  };
  color: string;
}

export default function GearCategoryStats({ categoryWeights }: GearCategoryStatsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // State for tooltip
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    category: '',
    weight: 0,
    percentage: 0,
    position: { top: 0, left: 0 },
    color: ''
  });
  
  // Filter out categories with no weight
  const categories = Object.entries(categoryWeights)
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1]);
  
  // Calculate total weight for percentages
  const totalWeight = Object.values(categoryWeights).reduce((sum, weight) => sum + weight, 0);
  
  // Generate a color for each category with more vibrant options
  const getColorForIndex = (index: number) => {
    const colors = [
      'bg-blue-500 hover:bg-blue-600',
      'bg-green-500 hover:bg-green-600',
      'bg-yellow-500 hover:bg-yellow-600',
      'bg-purple-500 hover:bg-purple-600',
      'bg-pink-500 hover:bg-pink-600',
      'bg-indigo-500 hover:bg-indigo-600',
      'bg-red-500 hover:bg-red-600',
      'bg-orange-500 hover:bg-orange-600',
      'bg-teal-500 hover:bg-teal-600',
      'bg-cyan-500 hover:bg-cyan-600',
      'bg-emerald-500 hover:bg-emerald-600',
      'bg-fuchsia-500 hover:bg-fuchsia-600',
      'bg-amber-500 hover:bg-amber-600',
      'bg-lime-500 hover:bg-lime-600',
      'bg-rose-500 hover:bg-rose-600',
    ];
    return colors[index % colors.length];
  };

  // Map tailwind class names to actual color hex codes for SVG fills
  const getColorHexForIndex = (index: number) => {
    const colorMap: Record<string, string> = {
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#22c55e',
      'bg-yellow-500': '#eab308',
      'bg-purple-500': '#a855f7',
      'bg-pink-500': '#ec4899',
      'bg-indigo-500': '#6366f1',
      'bg-red-500': '#ef4444',
      'bg-orange-500': '#f97316',
      'bg-teal-500': '#14b8a6',
      'bg-cyan-500': '#06b6d4',
      'bg-emerald-500': '#10b981',
      'bg-fuchsia-500': '#d946ef',
      'bg-amber-500': '#f59e0b',
      'bg-lime-500': '#84cc16',
      'bg-rose-500': '#f43f5e',
    };
    
    const baseColor = getColorForIndex(index).split(' ')[0];
    return colorMap[baseColor] || '#000000'; // Default to black if color not found
  };

  if (totalWeight === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        No gear items to display stats for.
      </div>
    );
  }

  // Calculate the pie chart segments
  const createPieChartSegments = () => {
    let cumulativePercentage = 0;
    return categories.map(([category, weight], index) => {
      const percentage = (weight / totalWeight) * 100;
      const startAngle = cumulativePercentage;
      cumulativePercentage += percentage;
      const endAngle = cumulativePercentage;
      
      // Convert percentage to coordinates for SVG path
      const startX = 50 + 40 * Math.cos(2 * Math.PI * startAngle / 100);
      const startY = 50 + 40 * Math.sin(2 * Math.PI * startAngle / 100);
      const endX = 50 + 40 * Math.cos(2 * Math.PI * endAngle / 100);
      const endY = 50 + 40 * Math.sin(2 * Math.PI * endAngle / 100);
      
      // Calculate center point for tooltip positioning
      const midAngle = (startAngle + endAngle) / 2;
      const centerX = 50 + 25 * Math.cos(2 * Math.PI * midAngle / 100);
      const centerY = 50 + 25 * Math.sin(2 * Math.PI * midAngle / 100);
      
      // Flag for large arc (> 180 degrees)
      const largeArcFlag = percentage > 50 ? 1 : 0;
      
      // Create SVG path
      const path = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
      
      return {
        category,
        weight,
        percentage,
        path,
        color: getColorHexForIndex(index),
        centerX,
        centerY
      };
    });
  };
  
  const pieSegments = createPieChartSegments();

  interface PieSegment {
    category: string;
    weight: number;
    percentage: number;
    path: string;
    color: string;
    centerX: number;
    centerY: number;
  }

  const handleMouseEnter = (segment: PieSegment, event: React.MouseEvent) => {
    if (!svgRef.current) return;
    
    // Get SVG bounding rect
    const svgRect = svgRef.current.getBoundingClientRect();
    
    // Calculate position for tooltip (fixed position relative to the container)
    const position = {
      // Position tooltip above the chart to avoid cursor conflicts
      top: -60,
      left: svgRect.width / 2 - 70, // Center the tooltip
    };
    
    setTooltip({
      visible: true,
      category: segment.category,
      weight: segment.weight,
      percentage: segment.percentage,
      position,
      color: segment.color
    });

    // Highlight the segment
    const target = event.target as SVGPathElement;
    target.style.opacity = '0.9';
    target.style.transform = 'scale(1.03)';
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    // Reset segment style
    const target = event.target as SVGPathElement;
    target.style.opacity = '1';
    target.style.transform = 'scale(1)';
    
    // Hide tooltip with a small delay to prevent flickering
    // when moving between segments
    setTimeout(() => {
      setTooltip(prev => {
        if (prev.visible) {
          return { ...prev, visible: false };
        }
        return prev;
      });
    }, 100);
  };

  const setTooltipFromLegend = (category: string, weight: number, percentage: number, color: string) => {
    if (!svgRef.current) return;
    
    // Get SVG bounding rect
    const svgRect = svgRef.current.getBoundingClientRect();
    
    // Calculate position for tooltip (fixed position relative to the container)
    const position = {
      // Position tooltip above the chart to avoid cursor conflicts
      top: -60,
      left: svgRect.width / 2 - 70, // Center the tooltip
    };
    
    setTooltip({
      visible: true,
      category,
      weight,
      percentage,
      position,
      color
    });
  };

  return (
    <div className="space-y-4">
      {/* Pie Chart for weight distribution */}
      <div className="flex justify-center mb-4 relative">
        <div className="relative">
          {/* Fixed position tooltip above the chart */}
          {tooltip.visible && (
            <div 
              className="absolute z-10 pointer-events-none transform -translate-x-1/2"
              style={{
                top: tooltip.position.top + 'px',
                left: tooltip.position.left + 'px',
              }}
            >
              <div className="bg-gray-900 text-white text-xs p-2 rounded-md shadow-lg whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tooltip.color }}
                  ></div>
                  <span className="font-medium">{tooltip.category}</span>
                </div>
                <div className="text-center mt-1">
                  {(tooltip.weight / 1000).toFixed(2)} kg ({tooltip.percentage.toFixed(1)}%)
                </div>
                <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -ml-1 -bottom-1"></div>
              </div>
            </div>
          )}
          
          <svg 
            ref={svgRef}
            viewBox="0 0 100 100" 
            className="w-56 h-56"
          >
            {pieSegments.map((segment) => (
              <path
                key={segment.category}
                d={segment.path}
                fill={segment.color}
                stroke="#ffffff"
                strokeWidth="1"
                style={{ 
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => handleMouseEnter(segment, e)}
                onMouseLeave={handleMouseLeave}
              />
            ))}
          </svg>
        </div>
      </div>
      
      {/* Weight details with interactive hover effect */}
      <div className="space-y-1">
        {categories.map(([category, weight], index) => {
          const percentage = (weight / totalWeight) * 100;
          const color = getColorHexForIndex(index);
          
          return (
            <div 
              key={category} 
              className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-150"
              onMouseEnter={() => setTooltipFromLegend(category, weight, percentage, color)}
              onMouseLeave={() => setTimeout(() => setTooltip(prev => ({ ...prev, visible: false })), 100)}
            >
              <div className="flex items-center">
                <div 
                  className={`w-4 h-4 ${getColorForIndex(index).split(' ')[0]} rounded-full mr-2 transition-transform duration-150 ease-in-out hover:scale-125`}
                ></div>
                <span className="text-gray-700 dark:text-gray-300">{category}</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {(weight / 1000).toFixed(2)} kg ({percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="text-sm font-medium text-center pt-3 border-t border-gray-200 dark:border-gray-700">
        Total: {(totalWeight / 1000).toFixed(2)} kg
      </div>
    </div>
  );
}
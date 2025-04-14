'use client';
import { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface GearCategoryStatsProps {
  categoryWeights: Record<string, number>;
}

export default function GearCategoryStats({ categoryWeights }: GearCategoryStatsProps) {
  // Filter out categories with no weight
  const categories = useMemo(() => {
    return Object.entries(categoryWeights)
      .filter(([, weight]) => weight > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [categoryWeights]);
  
  // Calculate total weight for percentages and display
  const totalWeight = useMemo(() => {
    return Object.values(categoryWeights).reduce((sum, weight) => sum + weight, 0);
  }, [categoryWeights]);

  // Color palette for chart segments - using the same colors as before
  const colorPalette = useMemo(() => [
    '#3b82f6', // blue-500
    '#22c55e', // green-500
    '#eab308', // yellow-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#10b981', // emerald-500
    '#d946ef', // fuchsia-500
    '#f59e0b', // amber-500
    '#84cc16', // lime-500
    '#f43f5e', // rose-500
  ], []);
  
  // Prepare data for the chart
  const chartData = useMemo(() => {
    return {
      labels: categories.map(([category]) => category),
      datasets: [
        {
          data: categories.map(([, weight]) => weight),
          backgroundColor: categories.map((_, index) => colorPalette[index % colorPalette.length]),
          borderColor: 'rgb(255, 255, 255)',
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    };
  }, [categories, colorPalette]);
  
  // Chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false, // We'll create our own custom legend below
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const value = context.raw as number;
            const percentage = ((value / totalWeight) * 100).toFixed(1);
            const weightInKg = (value / 1000).toFixed(2);
            return `${weightInKg} kg (${percentage}%)`;
          },
          title: (context: TooltipItem<'pie'>[]) => {
            return context[0].label;
          }
        },
        bodyFont: {
          size: 12
        },
        titleFont: {
          size: 13,
          weight: 'bold' as const
        },
      },
    },
  }), [totalWeight]);

  if (totalWeight === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        No gear items to display stats for.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pie Chart using Chart.js */}
      <div className="flex justify-center mb-4">
        <div style={{ width: '224px', height: '224px' }}>
          <Pie data={chartData} options={chartOptions} />
        </div>
      </div>
      
      {/* Custom legend with detailed weight information */}
      <div className="space-y-1">
        {categories.map(([category, weight], index) => {
          const percentage = (weight / totalWeight) * 100;
          const color = colorPalette[index % colorPalette.length];
          
          return (
            <div 
              key={category} 
              className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-150"
            >
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2 transition-transform duration-150 ease-in-out hover:scale-125"
                  style={{ backgroundColor: color }}
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
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HabitCompletion {
  id: string;
  completedAt: Date;
}

interface Habit {
  id: string;
  name: string;
  completions: HabitCompletion[];
}

interface HabitHeatmapProps {
  habits: Habit[];
}

interface DateCompletion {
  date: string;
  count: number;
}

interface MonthLabel {
  month: string;
  date: string;
  weekIndex: number;
}

export function HabitHeatmap({ habits }: HabitHeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleWeeks, setVisibleWeeks] = useState(15);
  
  // Fixed dimensions
  const SQUARE_SIZE = 14;
  const GAP_SIZE = 2;
  const CELL_SIZE = SQUARE_SIZE + GAP_SIZE;
  const DAY_LABELS_WIDTH = 40;
  const CONTAINER_PADDING = 24;
  
  // State for pagination
  const [startWeekIndex, setStartWeekIndex] = useState(-1); // Initialize to -1 to trigger update when weeks are calculated

  // Calculate the start date (January 1st of the year before registration)
  const calculateStartDate = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 1, 0, 1); // Default to Jan 1st of last year
    
    // If we have habits data, use the earliest habit's creation date
    if (habits.length > 0) {
      const registrationYear = new Date(Math.min(...habits.map(h => 
        h.completions.length > 0 
          ? Math.min(...h.completions.map(c => new Date(c.completedAt).getTime()))
          : new Date().getTime()
      ))).getFullYear();
      
      startDate.setFullYear(registrationYear - 1);
      startDate.setMonth(0);
      startDate.setDate(1);
    }
    
    return startDate;
  }, [habits]);

  // Calculate total days to show
  const totalDays = useMemo(() => {
    const now = new Date();
    return Math.ceil((now.getTime() - calculateStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [calculateStartDate]);

  useEffect(() => {
    const updateVisibleWeeks = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const availableWidth = containerWidth - DAY_LABELS_WIDTH - CONTAINER_PADDING;
      const possibleWeeks = Math.floor(availableWidth / CELL_SIZE);
      const newVisibleWeeks = Math.max(1, possibleWeeks);
      setVisibleWeeks(newVisibleWeeks);
      
      // Set initial startWeekIndex to show the most recent weeks
      if (startWeekIndex === -1) {
        const totalWeeks = Math.ceil(totalDays / 7);
        setStartWeekIndex(Math.max(0, totalWeeks - newVisibleWeeks));
      }
    };

    const resizeObserver = new ResizeObserver(updateVisibleWeeks);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [totalDays, startWeekIndex, CELL_SIZE, DAY_LABELS_WIDTH, CONTAINER_PADDING]);

  const completionsByDate = useMemo(() => {
    console.log('Heatmap: Calculating completions for dates');
    
    const dates = new Array(totalDays).fill(0).map((_, i) => {
      const date = new Date(calculateStartDate);
      date.setDate(date.getDate() + i);
      // Set to start of day in local timezone
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const completions = new Map<string, number>();
    
    // Initialize all dates with 0 completions
    dates.forEach(date => {
      // Format date in local timezone
      const dateStr = date.toLocaleDateString('en-CA');
      console.log('Heatmap: Adding date to map:', { date, dateStr });
      completions.set(dateStr, 0);
    });

    // Count completions for each date
    habits.forEach(habit => {
      habit.completions.forEach(completion => {
        // Parse the UTC date and convert to local
        const date = new Date(completion.completedAt);
        // Format in local timezone
        const dateStr = date.toLocaleDateString('en-CA');
        
        console.log('Heatmap: Processing completion:', {
          completedAt: completion.completedAt,
          parsedDate: date,
          localString: date.toString(),
          dateStr
        });
        
        if (completions.has(dateStr)) {
          const newCount = (completions.get(dateStr) || 0) + 1;
          completions.set(dateStr, newCount);
          console.log('Heatmap: Updated count for', dateStr, 'to', newCount);
        } else {
          console.log('Heatmap: Date string not found in completions map:', dateStr);
        }
      });
    });

    const result = Array.from(completions.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date,
        count,
      }));
    
    console.log('Heatmap: Final completions by date:', result);
    return result;
  }, [habits, totalDays, calculateStartDate]);

  const maxCompletions = Math.max(...completionsByDate.map(d => d.count), 1);

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/30";
    const intensity = Math.ceil((count / maxCompletions) * 4);
    return {
      1: "bg-primary/25",
      2: "bg-primary/50",
      3: "bg-primary/75",
      4: "bg-primary",
    }[intensity] || "bg-primary";
  };

  // Group dates by week for the grid layout
  const weeks = useMemo(() => {
    const result: (DateCompletion | null)[][] = [];
    let week: (DateCompletion | null)[] = [];
    
    completionsByDate.forEach(({ date, count }, index) => {
      // Create date object in local timezone
      const localDate = new Date(date + 'T00:00:00');
      const dayOfWeek = localDate.getDay();
      
      // Fill in empty days at the start of the first week
      if (index === 0 && dayOfWeek !== 0) {
        for (let i = 0; i < dayOfWeek; i++) {
          week.push(null);
        }
      }
      
      week.push({ date, count });
      
      if (dayOfWeek === 6 || index === completionsByDate.length - 1) {
        // Fill in empty days at the end of the last week
        if (index === completionsByDate.length - 1 && dayOfWeek !== 6) {
          for (let i = dayOfWeek + 1; i <= 6; i++) {
            week.push(null);
          }
        }
        result.push(week);
        week = [];
      }
    });
    
    return result;
  }, [completionsByDate]);

  // Total number of weeks
  const totalWeeks = weeks.length;
  
  // Ensure startWeekIndex is valid
  const maxStartIndex = Math.max(0, totalWeeks - visibleWeeks);
  if (startWeekIndex > maxStartIndex) {
    setStartWeekIndex(maxStartIndex);
  }
  
  // Visible weeks only
  const displayedWeeks = weeks.slice(startWeekIndex, startWeekIndex + visibleWeeks);

  const monthLabels = useMemo(() => {
    if (weeks.length === 0) return [];
    
    const months: MonthLabel[] = [];
    let lastWeekIndex = -1;
    
    completionsByDate.forEach(({ date }, index) => {
      // Create date object in local timezone
      const dateObj = new Date(date + 'T00:00:00');
      const month = dateObj.toLocaleString('default', { month: 'short' });
      const year = dateObj.getFullYear();
      const weekIndex = Math.floor(index / 7);
      
      // Only add new month label if it's the first day of the month
      if (dateObj.getDate() === 1) {
        // Add year to month label if it's January or first month shown
        const monthDisplay = (month === 'Jan' || months.length === 0) 
          ? `${month} ${year}`
          : month;
        
        // Only add if there's enough space from the last label
        if (weekIndex - lastWeekIndex > 2 || months.length === 0) {
          months.push({ 
            month: monthDisplay,
            date,
            weekIndex
          });
          lastWeekIndex = weekIndex;
        }
      }
    });
    
    // Filter visible month labels
    return months
      .filter(m => m.weekIndex >= startWeekIndex && m.weekIndex < startWeekIndex + visibleWeeks)
      .map(m => ({
        ...m,
        weekIndex: m.weekIndex - startWeekIndex
      }));
  }, [completionsByDate, startWeekIndex, visibleWeeks, weeks.length]);

  const handlePrevious = () => {
    setStartWeekIndex(prev => Math.max(0, prev - visibleWeeks));
  };

  const handleNext = () => {
    setStartWeekIndex(prev => Math.min(maxStartIndex, prev + visibleWeeks));
  };

  // Calculate if we need pagination controls
  const showPagination = totalWeeks > visibleWeeks;
  const canGoPrevious = startWeekIndex > 0;
  const canGoNext = startWeekIndex < maxStartIndex;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Habit Completion History</div>
        {showPagination && (
          <div className="flex gap-1">
            <button 
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={cn(
                "p-1 rounded-md",
                canGoPrevious 
                  ? "text-muted-foreground hover:bg-muted hover:text-foreground" 
                  : "text-muted-foreground/30"
              )}
              aria-label="Previous period"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={handleNext}
              disabled={!canGoNext}
              className={cn(
                "p-1 rounded-md",
                canGoNext 
                  ? "text-muted-foreground hover:bg-muted hover:text-foreground" 
                  : "text-muted-foreground/30"
              )}
              aria-label="Next period"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-3" ref={containerRef}>
        <div className="text-xs text-muted-foreground grid grid-rows-7 pr-2 shrink-0" style={{ height: SQUARE_SIZE * 7 + GAP_SIZE * 6 }}>
          <div className="flex items-center" style={{ height: SQUARE_SIZE }}>Sun</div>
          <div className="flex items-center" style={{ height: SQUARE_SIZE }}>Mon</div>
          <div className="flex items-center" style={{ height: SQUARE_SIZE }}>Tue</div>
          <div className="flex items-center" style={{ height: SQUARE_SIZE }}>Wed</div>
          <div className="flex items-center" style={{ height: SQUARE_SIZE }}>Thu</div>
          <div className="flex items-center" style={{ height: SQUARE_SIZE }}>Fri</div>
          <div className="flex items-center" style={{ height: SQUARE_SIZE }}>Sat</div>
        </div>
        <div className="relative flex-1">
          <div className="flex text-xs text-muted-foreground absolute -top-6 w-full">
            {monthLabels.map(({ month, weekIndex }, i) => (
              <div 
                key={`${month}-${weekIndex}`}
                className="absolute whitespace-nowrap"
                style={{ 
                  left: `${weekIndex * CELL_SIZE}px`,
                  width: i < monthLabels.length - 1 
                    ? `${(monthLabels[i + 1].weekIndex - weekIndex) * CELL_SIZE - 8}px`
                    : undefined
                }}
              >
                {month}
              </div>
            ))}
          </div>
          <div className="flex" style={{ gap: `${GAP_SIZE}px`, height: SQUARE_SIZE * 7 + GAP_SIZE * 6 }}>
            {displayedWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7" style={{ gap: `${GAP_SIZE}px` }}>
                {week.map((day, dayIndex) => (
                  <div key={dayIndex} className="group relative" style={{ height: SQUARE_SIZE }}>
                    {day ? (
                      <>
                        <div
                          className={cn(
                            "rounded-sm",
                            getIntensityClass(day.count)
                          )}
                          style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }}
                        />
                        <div className="absolute bottom-full mb-1 hidden group-hover:block whitespace-nowrap bg-popover text-popover-foreground text-xs rounded-md px-2 py-1 z-10 shadow-md">
                          {new Date(day.date + 'T00:00:00').toLocaleDateString()} - {day.count} completion{day.count !== 1 ? 's' : ''}
                        </div>
                      </>
                    ) : (
                      <div style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex" style={{ gap: `${GAP_SIZE}px` }}>
          <div className="rounded-sm bg-muted/30" style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }} />
          <div className="rounded-sm bg-primary/25" style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }} />
          <div className="rounded-sm bg-primary/50" style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }} />
          <div className="rounded-sm bg-primary/75" style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }} />
          <div className="rounded-sm bg-primary" style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
} 
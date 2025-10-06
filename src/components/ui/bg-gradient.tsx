import { cn } from "@/lib/utils";

interface BackgroundGradientProps {
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientSize?: string;
  gradientPosition?: string;
  gradientStop?: string;
}

export const BackgroundGradient = ({ 
  className,
  gradientFrom = "#8B5CF6",  // Fixed purple color
  gradientTo = "#F97316",    // Fixed orange color
  gradientSize = "125% 125%",
  gradientPosition = "50% 10%",
  gradientStop = "40%"
}: BackgroundGradientProps) => {
  return (
    <div 
      className={cn(
        "absolute inset-0 w-full h-full -z-10",
        className
      )}
      style={{
        background: `radial-gradient(${gradientSize} at ${gradientPosition}, ${gradientFrom} ${gradientStop}, ${gradientTo} 100%)`
      }}
    />
  );
};
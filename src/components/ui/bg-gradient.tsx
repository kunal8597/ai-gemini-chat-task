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
  gradientFrom = "#fff",
  gradientTo = "#63e",
  gradientSize = "125% 125%",
  gradientPosition = "50% 10%",
  gradientStop = "40%"
}: BackgroundGradientProps) => {
  return (
    <div 
      className={cn(
        "absolute inset-0 w-full h-full -z-10",
        "transition-all duration-500 ease-in-out",
        className
      )}
      style={{
        background: `radial-gradient(${gradientSize} at ${gradientPosition}, ${gradientFrom} ${gradientStop}, ${gradientTo} 100%)`
      }}
    />
  );
};
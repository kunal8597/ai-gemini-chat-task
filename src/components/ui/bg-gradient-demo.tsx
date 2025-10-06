import { BackgroundGradient } from "./bg-gradient";

export const BackgroundGradientDemo = () => {
  return (
    <div className="relative min-h-[400px] w-full overflow-hidden rounded-lg">
      <BackgroundGradient 
        className="dark:opacity-80"
        gradientFrom="hsl(var(--gradient-start))"
        gradientTo="hsl(var(--gradient-end))"
      />
      <div className="relative z-10 p-10">
        <h2 className="text-3xl font-bold text-foreground">
          Gradient Background Demo
        </h2>
        <p className="mt-4 text-muted-foreground">
          This component demonstrates the background gradient effect
        </p>
      </div>
    </div>
  );
};
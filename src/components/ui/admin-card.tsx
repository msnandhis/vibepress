import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function AdminCard({
  children,
  className,
  hover = true,
  padding = "md"
}: AdminCardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <Card className={cn(
      // Consistent card styling matching landing page
      "bg-card rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] border border-border",
      hover && "transition-all duration-300 hover:shadow-md hover:border-border/80",
      className
    )}>
      <CardContent className={cn(paddingClasses)}>
        {children}
      </CardContent>
    </Card>
  );
}
import { cn } from "@/lib/utils";

interface MasonryGridProps {
    children: React.ReactNode;
    className?: string;
    columns?: {
        default: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
}

export function MasonryGrid({
    children,
    className,
    columns = { default: 4, sm: 5, md: 6, lg: 8, xl: 10 }
}: MasonryGridProps) {
    return (
        <div className={cn(
            "columns-4 sm:columns-5 md:columns-6 lg:columns-8 xl:columns-10 gap-2 space-y-2",
            className
        )}>
            {children}
        </div>
    );
}

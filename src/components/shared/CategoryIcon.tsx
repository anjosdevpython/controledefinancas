import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function CategoryIcon({ icon, color, size = 'md', className }: CategoryIconProps) {
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.HelpCircle;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: `${color}20` }}
    >
      <IconComponent
        className={iconSizeClasses[size]}
        style={{ color }}
      />
    </div>
  );
}

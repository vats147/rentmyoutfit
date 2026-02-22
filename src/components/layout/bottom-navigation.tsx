'use client';

import { motion } from 'framer-motion';
import { Home, Search, Map, Package, User, Plus } from 'lucide-react';
import { useUIStore, useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'map', icon: Map, label: 'Near Me' },
  { id: 'bookings', icon: Package, label: 'Bookings' },
  { id: 'profile', icon: User, label: 'Profile' },
] as const;

interface BottomNavigationProps {
  onProfileClick?: () => void;
  onListOutfitClick?: () => void;
}

export function BottomNavigation({ onProfileClick, onListOutfitClick }: BottomNavigationProps) {
  const { activeTab, setActiveTab } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  const handleTabClick = (tab: typeof navItems[number]['id']) => {
    if (tab === 'profile' && onProfileClick) {
      onProfileClick();
    }
    setActiveTab(tab);
  };

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 shrink-0"
      style={{ 
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 0.5rem)',
        touchAction: 'manipulation'
      }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto relative">
        {/* Floating Action Button for List Outfit */}
        {isAuthenticated && onListOutfitClick && (
          <button
            onClick={onListOutfitClick}
            className="absolute -top-5 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-[#C9A84C] flex items-center justify-center shadow-lg hover:bg-[#F0D080] transition-colors touch-minimal"
            style={{ touchAction: 'manipulation' }}
          >
            <Plus className="w-5 h-5 text-[#1B4332]" />
          </button>
        )}

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative transition-colors touch-minimal",
                isActive ? "text-[#1B4332]" : "text-gray-400"
              )}
              style={{ touchAction: 'manipulation' }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 w-10 h-1 bg-[#C9A84C] rounded-b-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] mt-0.5 font-medium",
                isActive ? "text-[#1B4332]" : "text-gray-400"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}

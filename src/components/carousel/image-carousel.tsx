'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: { id: string; url: string }[];
  initialIndex?: number;
  onClose?: () => void;
  showClose?: boolean;
  showZoom?: boolean;
}

export function ImageCarousel({ 
  images, 
  initialIndex = 0, 
  onClose,
  showClose = true,
  showZoom = true 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, images.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, onClose]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      goToPrevious();
    } else if (info.offset.x < -threshold && currentIndex < images.length - 1) {
      goToNext();
    }
  };

  const toggleZoom = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomScale(1);
    } else {
      setIsZoomed(true);
      setZoomScale(2);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black"
    >
      {/* Main Image Container */}
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag={!isZoomed ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <motion.img
              src={images[currentIndex]?.url || '/placeholder-outfit.png'}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              style={{ scale: zoomScale }}
              animate={{ scale: zoomScale }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag={isZoomed}
              dragConstraints={containerRef}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white touch-minimal",
                currentIndex === 0 && "opacity-50 pointer-events-none"
              )}
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white touch-minimal",
                currentIndex === images.length - 1 && "opacity-50 pointer-events-none"
              )}
              onClick={goToNext}
              disabled={currentIndex === images.length - 1}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}
      </div>

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        {/* Image Counter */}
        <div className="bg-black/50 rounded-full px-3 py-1.5 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {showZoom && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white touch-minimal"
              onClick={toggleZoom}
            >
              {isZoomed ? (
                <ZoomOut className="w-5 h-5" />
              ) : (
                <ZoomIn className="w-5 h-5" />
              )}
            </Button>
          )}
          {showClose && onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white touch-minimal"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10">
          <div className="flex gap-2 overflow-x-auto max-w-full py-2 px-3 bg-black/30 rounded-full scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={image.id || index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                  setIsZoomed(false);
                  setZoomScale(1);
                }}
                className={cn(
                  "shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 transition-all touch-minimal",
                  index === currentIndex 
                    ? "border-[#C9A84C] scale-110" 
                    : "border-white/50 opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Swipe Indicators */}
      {images.length > 1 && !isZoomed && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={cn(
                "transition-all touch-minimal",
                index === currentIndex 
                  ? "w-6 h-1.5 bg-[#C9A84C] rounded-full" 
                  : "w-1.5 h-1.5 bg-white/50 rounded-full hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

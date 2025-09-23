import { useState, Suspense, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  Variants,
} from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight, Play, Pause, ArrowDown } from "lucide-react";
import { Scene3D } from "@/components/Scene3D"; 

// --- DATA STRUCTURES & DATA GENERATION ---
interface ImageItem { id: string; url: string; alt: string; }
interface GalleryCategory { id: string; title: string; imageCount: number; path: string; }

const selectiveImages: ImageItem[] = [
  { id: 'sel-1', url: '/event_photos/img1.jpg', alt: 'Event Highlight 1' },
  { id: 'sel-2', url: '/team_photos/img4.jpg', alt: 'Team Photo 1' },
  { id: 'sel-3', url: '/event_photos/img2.jpg', alt: 'Event Highlight 2' },
  { id: 'sel-4', url: '/team_photos/img5.jpg', alt: 'Team Photo 2' },
  { id: 'sel-5', url: '/event_photos/img3.jpg', alt: 'Event Highlight 3' },
];

const galleryData: GalleryCategory[] = [
  { id: 'cat_events', title: 'Event Highlights', imageCount: 100, path: '/event_photos/' },
  // CORRECTION: The path has been fixed to correctly load team photos.
  { id: 'cat_team', title: 'Event Highlights', imageCount: 100, path: '/team_photos/' },
];

const generateImages = (category: GalleryCategory): ImageItem[] =>
  Array.from({ length: category.imageCount }, (_, i) => ({
    id: `${category.id}-img${i + 1}`,
    url: `${category.path}img${i + 1}.jpg`,
    alt: "",
  }));

const allImages = galleryData.flatMap(generateImages);

// --- HERO SLIDESHOW COMPONENT ---
const HeroSlideshow = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => { setIndex(prev => (prev + 1) % selectiveImages.length); }, 5000);
        return () => clearInterval(interval);
    }, []);

    const imageVariants: Variants = {
      enter: { opacity: 0, scale: 0.95 },
      center: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    };
    
    const kenBurnsVariant: Variants = {
        animate: {
            scale: [1, 1.1, 1.05], x: [0, -10, 5], y: [0, 5, -10],
            transition: { duration: 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
        }
    };

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 z-0 opacity-50"><Suspense fallback={null}><Scene3D /></Suspense></div>
             <AnimatePresence>
                 <motion.div key={index} className="absolute inset-0" variants={imageVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}>
                    <motion.div className="absolute inset-0" style={{ backgroundImage: `url(${selectiveImages[index].url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} variants={kenBurnsVariant} animate="animate" />
                    <div className="absolute inset-0 bg-black/60" />
                 </motion.div>
             </AnimatePresence>
             <div className="relative z-10 text-center text-white">
                <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-6xl md:text-9xl font-bold tracking-tighter" style={{ textShadow: '0px 5px 30px rgba(0, 255, 153, 0.5)'}}>
                    Our Gallery
                </motion.h1>
                 <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-lg text-gray-300 max-w-2xl mx-auto mt-4">
                     A collection of moments from our events and team activities.
                 </motion.p>
             </div>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white">
                <span className="text-sm">Scroll Down</span>
                <ArrowDown className="animate-bounce" />
            </motion.div>
        </section>
    );
};

// --- IMAGE CARD COMPONENT ---
const ImageCard = ({ image, onImageClick }: { image: ImageItem, onImageClick: () => void }) => (
    <motion.div layoutId={`card-${image.id}`} onClick={onImageClick} className="relative aspect-[4/3] w-full rounded-xl overflow-hidden cursor-pointer group" whileHover="hover">
      <img
        loading="lazy"
        src={image.url}
        alt={image.alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 mix-blend-screen opacity-90 group-hover:opacity-100"
      />
      <motion.div className="absolute inset-0 border-2 border-transparent rounded-xl" variants={{ hover: { borderColor: "rgba(0, 255, 153, 0.7)" }}} />
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <motion.p className="font-bold text-white truncate" variants={{ hover: { y: -5 }}}> {image.alt} </motion.p>
      </div>
    </motion.div>
);

// --- LIGHTBOX COMPONENT ---
const Lightbox = ({ activeImage, onClose, onNext, onPrev }: { activeImage: ImageItem | null, onClose: () => void, onNext: () => void, onPrev: () => void }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPlaying && onNext) {
            interval = setInterval(onNext, 4000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isPlaying, onNext]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') onNext();
        if (e.key === 'ArrowLeft') onPrev();
        if (e.key === 'Escape') onClose();
        if (e.key === ' ') { e.preventDefault(); setIsPlaying(p => !p); }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNext, onPrev, onClose]);
    
    if (!activeImage) return null;
    const imageIndex = allImages.findIndex(img => img.id === activeImage.id);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center">
            <AnimatePresence>
                <motion.img key={activeImage.id} layoutId={`card-${activeImage.id}`} src={activeImage.url} className="w-full h-full object-contain max-w-6xl max-h-[85vh] shadow-2xl shadow-green-500/10" transition={{ type: "spring", stiffness: 200, damping: 25 }}/>
            </AnimatePresence>

            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><ChevronLeft /></button>
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><ChevronRight /></button>
            <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><X /></button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 bg-black/50 px-4 py-2 rounded-xl text-white">
                <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}>{isPlaying ? <Pause /> : <Play />}</button>
                <div className="text-center"> <p className="font-bold">{activeImage.alt}</p> <p className="text-sm text-gray-400">{imageIndex + 1} / {allImages.length}</p> </div>
            </div>
        </motion.div>
    );
};

// --- MAIN GALLERY PAGE COMPONENT ---
const Gallery = () => {
    const [activeImageId, setActiveImageId] = useState<string | null>(null);
    const activeImage = activeImageId ? allImages.find(img => img.id === activeImageId) : null;
    
    const handleNavigation = (direction: 'next' | 'prev') => {
        if (!activeImageId) return;
        const currentIndex = allImages.findIndex(img => img.id === activeImageId);
        const nextIndex = direction === 'next' ? (currentIndex + 1) % allImages.length : (currentIndex - 1 + allImages.length) % allImages.length;
        setActiveImageId(allImages[nextIndex].id);
    };

    return (
        <div className="text-white bg-[#0a0a14]">
            <HeroSlideshow />
            
            <main className="relative z-10 container mx-auto px-4 py-24 space-y-24">
                {galleryData.map((category) => (
                  <motion.div key={category.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.8 }}>
                      <div className="mb-8 ml-2 flex items-center gap-4">
                          <Camera className="w-8 h-8 text-green-400" />
                          <h2 className="text-3xl font-sans font-bold text-white">{category.title}</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {generateImages(category).map((image) => (
                              <ImageCard key={image.id} image={image} onImageClick={() => setActiveImageId(image.id)} />
                          ))}
                      </div>
                  </motion.div>
                ))}
            </main>

            <AnimatePresence>
                {activeImage && (
                    <Lightbox
                        activeImage={activeImage}
                        onClose={() => setActiveImageId(null)}
                        onNext={() => handleNavigation('next')}
                        onPrev={() => handleNavigation('prev')}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
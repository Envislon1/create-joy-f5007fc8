import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { Trophy, Medal, Award } from "lucide-react";
import heroImage from "@/assets/hero-family.jpg";
import amaraImg from "@/assets/contestants/amara.jpg";
import adaezeImg from "@/assets/contestants/adaeze.jpg";
import chidiImg from "@/assets/contestants/chidi.jpg";
import nkechiImg from "@/assets/contestants/nkechi.jpg";
import zuriImg from "@/assets/contestants/zuri.jpg";
import tundeImg from "@/assets/contestants/tunde.jpg";

const contestants = [
  { name: "Amara", image: amaraImg },
  { name: "Adaeze", image: adaezeImg },
  { name: "Chidi", image: chidiImg },
  { name: "Nkechi", image: nkechiImg },
  { name: "Zuri", image: zuriImg },
  { name: "Tunde", image: tundeImg },
];

// Preload all images on mount
const preloadImages = (images: string[]): Promise<void[]> => {
  return Promise.all(
    images.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to not block
          img.src = src;
        })
    )
  );
};

const OptimizedImage = ({ 
  src, 
  alt, 
  className,
  onLoadComplete
}: { 
  src: string; 
  alt: string; 
  className?: string;
  onLoadComplete?: () => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const retryCount = useRef(0);
  
  const handleLoad = useCallback(() => {
    setLoaded(true);
    setError(false);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback(() => {
    if (retryCount.current < 3) {
      retryCount.current += 1;
      // Retry loading with cache bust
      const imgElement = document.querySelector(`img[src="${src}"]`) as HTMLImageElement;
      if (imgElement) {
        imgElement.src = `${src}?retry=${retryCount.current}`;
      }
    } else {
      setError(true);
      onLoadComplete?.(); // Don't block carousel
    }
  }, [src, onLoadComplete]);
  
  return (
    <div className="relative w-full h-full">
      {!loaded && !error && <Skeleton className="absolute inset-0 w-full h-full" />}
      {error && (
        <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
    </div>
  );
};

const Home = () => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [heroError, setHeroError] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const heroRetryCount = useRef(0);
  const loadedImagesCount = useRef(0);

  // Preload all contestant images
  useEffect(() => {
    const allImages = [heroImage, ...contestants.map(c => c.image)];
    preloadImages(allImages).then(() => {
      setAllImagesLoaded(true);
    });
  }, []);

  // Start autoplay only after all images are loaded
  useEffect(() => {
    if (carouselApi && allImagesLoaded) {
      const autoplayPlugin = (carouselApi as any).plugins()?.autoplay;
      if (autoplayPlugin) {
        autoplayPlugin.play();
      }
    }
  }, [carouselApi, allImagesLoaded]);

  const handleHeroLoad = () => {
    setHeroLoaded(true);
    setHeroError(false);
  };

  const handleHeroError = () => {
    if (heroRetryCount.current < 3) {
      heroRetryCount.current += 1;
      setHeroError(false);
    } else {
      setHeroError(true);
    }
  };

  const handleContestantImageLoad = () => {
    loadedImagesCount.current += 1;
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-muted">
        {!heroLoaded && !heroError && <Skeleton className="absolute inset-0 w-full h-full" />}
        {heroError && (
          <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Loading image...</span>
          </div>
        )}
        <img
          src={heroError && heroRetryCount.current < 3 ? `${heroImage}?retry=${heroRetryCount.current}` : heroImage}
          alt="Happy family - Little Stars Contest"
          onLoad={handleHeroLoad}
          onError={handleHeroError}
          className={`w-full h-full object-cover object-center ${heroLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-4">
            Little Stars Contest
          </h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow-md max-w-2xl">
            Vote for your favorite child contestant! ₦50 per vote.
          </p>
        </div>
      </section>

      {/* Countdown & Actions */}
      <section className="py-12 px-4 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <CountdownTimer />

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link
              to="/register"
              className="bg-primary text-primary-foreground px-6 py-3 rounded font-medium hover:opacity-90 transition"
            >
              Register Your Child
            </Link>
            <Link
              to="/leaderboard"
              className="border border-border px-6 py-3 rounded font-medium hover:bg-muted transition"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Contestants Carousel */}
      <section className="py-12 px-4 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Our Little Stars
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            setApi={setCarouselApi}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {contestants.map((contestant) => (
                <CarouselItem key={contestant.name} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <div className="text-center group">
                    <div className="aspect-square overflow-hidden rounded-xl shadow-lg mb-3 bg-background">
                      <OptimizedImage
                        src={contestant.image}
                        alt={contestant.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onLoadComplete={handleContestantImageLoad}
                      />
                    </div>
                    <p className="font-semibold text-foreground">{contestant.name}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4" />
            <CarouselNext className="hidden sm:flex -right-4" />
          </Carousel>
        </div>
      </section>

      {/* Fun Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Fun!</h2>
          <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
            <p>
              Little Stars Contest is more than just a competition—it's a celebration of every child's unique sparkle! 
              Watch your little one shine as they gather votes from family, friends, and supporters across Nigeria.
            </p>
            <p>
              Every vote is a cheer, every share spreads the joy, and every participant is already a winner in our hearts. 
              This is your chance to create unforgettable memories and show the world just how special your child is.
            </p>
            <p className="font-semibold text-foreground">
              Ready to let your little star shine? Register today and let the fun begin! ✨
            </p>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Win Amazing Prizes</h2>
            <p className="text-muted-foreground">Top performers take home incredible rewards!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 1st Place */}
            <div className="md:col-span-1 md:order-2">
              <div className="relative bg-card border-2 border-primary rounded-2xl p-6 text-center shadow-lg transform md:-translate-y-4">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary rounded-full p-3 shadow-md">
                    <Trophy className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <div className="mt-6">
                  <span className="text-muted-foreground font-medium text-sm uppercase tracking-wide">1st Place</span>
                  <div className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-1">₦4M</div>
                  <span className="text-muted-foreground text-sm">Four Million Naira</span>
                </div>
              </div>
            </div>
            
            {/* 2nd Place */}
            <div className="md:order-1">
              <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-md h-full flex flex-col justify-center">
                <div className="bg-secondary rounded-full p-3 w-fit mx-auto mb-4">
                  <Medal className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground font-medium text-sm uppercase tracking-wide">2nd Place</span>
                <div className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-1">₦2M</div>
                <span className="text-muted-foreground text-sm">Two Million Naira</span>
              </div>
            </div>
            
            {/* 3rd Place */}
            <div className="md:order-3">
              <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-md h-full flex flex-col justify-center">
                <div className="bg-secondary rounded-full p-3 w-fit mx-auto mb-4">
                  <Award className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground font-medium text-sm uppercase tracking-wide">3rd Place</span>
                <div className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-1">₦1M</div>
                <span className="text-muted-foreground text-sm">One Million Naira</span>
              </div>
            </div>
          </div>
          
          {/* 4th & 5th Place */}
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <span className="font-semibold text-lg">4th & 5th Place</span>
            <p className="text-muted-foreground mt-1">Special compensation packages for our runners-up</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 bg-muted">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <p className="text-muted-foreground">Register your child with their details and photo.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <p className="text-muted-foreground">Get a unique link for your child's profile - copy and keep this safe!</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <p className="text-muted-foreground">Share the link with family and friends to vote.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <p className="text-muted-foreground">Each vote costs ₦50. Multiple votes allowed!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms and Conditions Link */}
      <section className="py-8 px-4 bg-background border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <Link
            to="/terms"
            className="text-primary hover:underline font-medium"
          >
            Terms and Conditions
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

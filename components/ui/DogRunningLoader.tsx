
import { useEffect, useState } from 'react';

interface LoaderProps {
  isVisible: boolean;
  onFinished?: () => void;
  textOverride?: string;
  subtextOverride?: string;
}

const ANIMAL_FUN_FACTS = [
  "Indie dogs are genetically robust with unique local immunity to Indian seasonal shifts!",
  "Rescued calves like Ganga thrive on quiet farm pasture rehab and love fresh yellow bananas!",
  "Indian Calico cats Meenu are almost always female due to unique genetics of coat pigmentation!",
  "Dwarf Hamster Golu can run up to 8 kilometers a night on his cozy exercise wheel!",
  "Rabbits display peak happiness by doing 'binkies'—vertical jumps with twists in the air!",
  "Aathia channels 100% of fundraising receipts straight to surgical caches & veteran aid.",
  "Street native animals are incredibly intelligent, loyal, and master human emotional cues easily!",
  "Regular deworming and street vaccinations stop standard canine rabies vectors entirely."
];

export default function DogRunningLoader({
  isVisible,
  onFinished,
  textOverride = "Nurturing Street Angels...",
  subtextOverride = "Fetching something good..."
}: LoaderProps) {
  const [render, setRender] = useState(isVisible);
  const [fadeOut, setFadeOut] = useState(false);
  const [currentFact, setCurrentFact] = useState("");

  useEffect(() => {
    // Select a random sweet fact on load
    const randIndex = Math.floor(Math.random() * ANIMAL_FUN_FACTS.length);
    setCurrentFact(ANIMAL_FUN_FACTS[randIndex]);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      setRender(true);
      setFadeOut(false);
    } else {
      setFadeOut(true);
      const timer = setTimeout(() => {
        setRender(false);
        if (onFinished) onFinished();
      }, 500); // Wait for transition fade
      return () => clearTimeout(timer);
    }
  }, [isVisible, onFinished]);

  if (!render) return null;

  return (
    <div
      id="aathia-dog-loader"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-tr from-[#E8572A] via-[#FF6636] to-[#FF8C64] text-white transition-opacity duration-500 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Decorative Parallax Sky Clouds */}
      <div className="absolute inset-x-0 top-12 flex justify-around pointer-events-none opacity-20 overflow-hidden">
        <div className="w-24 h-8 bg-white rounded-full blur-[2px] animate-[slide-left_12s_linear_infinite]" />
        <div className="w-40 h-12 bg-white rounded-full blur-[3px] animate-[slide-left_20s_linear_infinite]" style={{ animationDelay: '3s' }} />
        <div className="w-28 h-10 bg-white rounded-full blur-[1px] animate-[slide-left_16s_linear_infinite]" style={{ animationDelay: '7s' }} />
      </div>

      {/* Decorative Parallax Distant Mountains Silhouette */}
      <div className="absolute inset-x-0 bottom-40 h-28 pointer-events-none opacity-10 overflow-hidden select-none">
        <svg viewBox="0 0 1000 100" className="w-full h-full fill-white preserve-3d animate-[parallax-hills_25s_linear_infinite]">
          <path d="M 0 100 L 120 40 L 250 80 L 380 30 L 520 75 L 680 20 L 800 65 L 940 35 L 1000 100 Z" />
          <path d="M 120 100 L 260 55 L 400 90 L 580 40 L 710 82 L 850 48 L 1000 100 Z" opacity="0.5" />
        </svg>
      </div>

      {/* Decorative Parallax Gliding Street Trees/Fences */}
      <div className="absolute inset-x-0 bottom-24 h-16 pointer-events-none opacity-15 overflow-hidden select-none">
        <div className="flex w-[200%] animate-[parallax-trees_8s_linear_infinite] items-end justify-around h-full">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              {/* Cute minimal pine tree shape */}
              <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[30px] border-b-white" />
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-b-white mt-[-15px]" />
              <div className="w-2 h-4 bg-white" />
            </div>
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i + 6} className="flex flex-col items-center">
              <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[30px] border-b-white" />
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[40px] border-b-white mt-[-15px]" />
              <div className="w-2 h-4 bg-white" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        {/* Animated Paw Prints Trail behind the dog */}
        <div className="absolute right-[-45px] top-[15px] w-6 h-6 text-orange-200/40 pointer-events-none animate-paw-print-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 14c-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zm-4-2c-1.1 0-2-.9-2-2s0.9-2 2-2 2 0.9 2 2-.9 2-2 2zm8 0c-1.1 0-2-.9-2-2s0.9-2 2-2 2 0.9 2 2-.9 2-2 2zm-11 4c-.83 0-1.5-.67-1.5-1.5S4.17 13 5 13s1.5.67 1.5 1.5S5.83 16 5 16zm14 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
        </div>
        <div className="absolute right-[-85px] top-[30px] w-5 h-5 text-orange-200/30 pointer-events-none animate-paw-print-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 14c-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zm-4-2c-1.1 0-2-.9-2-2s0.9-2 2-2 2 0.9 2 2-.9 2-2 2zm8 0c-1.1 0-2-.9-2-2s0.9-2 2-2 2 0.9 2 2-.9 2-2 2zm-11 4c-.83 0-1.5-.67-1.5-1.5S4.17 13 5 13s1.5.67 1.5 1.5S5.83 16 5 16zm14 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
        </div>
        <div className="absolute right-[-120px] top-[10px] w-4 h-4 text-orange-200/20 pointer-events-none animate-paw-print-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 14c-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zm-4-2c-1.1 0-2-.9-2-2s0.9-2 2-2 2 0.9 2 2-.9 2-2 2zm8 0c-1.1 0-2-.9-2-2s0.9-2 2-2 2 0.9 2 2-.9 2-2 2zm-11 4c-.83 0-1.5-.67-1.5-1.5S4.17 13 5 13s1.5.67 1.5 1.5S5.83 16 5 16zm14 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
        </div>

        {/* --- Smooth Running INDog Vector --- */}
        <div className="relative w-48 h-32 flex items-center justify-center animate-indog-bob">
          <svg
            id="aathia-indog-vector-refined"
            viewBox="0 0 100 60"
            className="w-44 h-30 fill-none stroke-white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* BACK LEG 2 (deep side) */}
            <g className="animate-leg-b2 stroke-orange-200">
              <line x1="22" y1="36" x2="16" y2="46" />
              <line x1="16" y1="46" x2="11" y2="50" />
            </g>

            {/* FRONT LEG 2 (deep side) */}
            <g className="animate-leg-f2 stroke-orange-200">
              <line x1="42" y1="36" x2="44" y2="46" />
              <line x1="44" y1="46" x2="49" y2="50" />
            </g>

            {/* DOG BODY */}
            {/* Back to neck curve */}
            <path
              d="M 18 33 C 18 26, 30 23, 44 26 C 44 26, 45 23, 48 20"
              className="stroke-white"
            />
            {/* Belly line */}
            <path
              d="M 21 36 C 25 36, 38 36, 42 36"
              className="stroke-white"
            />

            {/* BACK LEG 1 (near side) */}
            <g className="animate-leg-b1 stroke-white">
              <line x1="22" y1="36" x2="24" y2="46" />
              <line x1="24" y1="46" x2="29" y2="49" />
            </g>

            {/* FRONT LEG 1 (near side) */}
            <g className="animate-leg-f1 stroke-white">
              <line x1="42" y1="36" x2="39" y2="46" />
              <line x1="39" y1="46" x2="34" y2="49" />
            </g>

            {/* DOG HEAD */}
            <g className="stroke-white">
              {/* Head structure & muzzle */}
              <path d="M 48 20 L 56 16 C 58 15, 60 17, 60 20 L 55 24 Z" />
              {/* Little nose */}
              <circle cx="59.5" cy="20" r="1.2" className="fill-white" />
            </g>

            {/* ELEM: BOUNCING FLOPPY EAR */}
            <g className="animate-indog-ear stroke-white fill-[#FFF9F4]">
              <path d="M 45 15 Q 36 14, 34 21 Q 38 24, 45 15" />
            </g>

            {/* ELEM: WAGGING TAIL */}
            <g className="animate-indog-tail stroke-white">
              <path d="M 18 33 Q 9 28, 11 16" />
            </g>
          </svg>
        </div>

        {/* Road line scrolling fast */}
        <div className="relative w-48 h-3 mt-[-5px] overflow-hidden rounded-full">
          <div className="absolute inset-x-0 h-0.5 bg-white/40 opacity-70" />
          <svg className="w-[300px] h-full stroke-white/80 animate-dusty-ground" viewBox="0 0 100 5">
            <line x1="0" y1="2" x2="100" y2="2" strokeDasharray="8 6" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* Title & Static State Message */}
      <div className="mt-10 text-center px-6 max-w-lg space-y-4">
        <div className="space-y-1.5 animate-pulse">
          <h3 className="text-2xl md:text-3xl font-baloo font-extrabold text-[#FFFDFB] tracking-wide">
            {textOverride}
          </h3>
          <p className="text-xs md:text-sm tracking-wider text-orange-100 font-mono font-bold uppercase opacity-95">
            {subtextOverride}
          </p>
        </div>

        {/* Interactive Fact Highlight */}
        <div className="bg-black/15 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-xs md:text-sm text-center leading-relaxed font-sans shadow-lg inline-block transform transition hover:scale-[1.02]">
          <span className="text-secondary font-bold mr-1.5">Quick Tip:</span>
          <span className="text-cream opacity-95 font-medium">{currentFact || "Aathia supports 100% transparent local rehabilitation networks."}</span>
        </div>
      </div>

      {/* Progress loop indicators */}
      <div className="absolute bottom-16 w-32 bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-secondary to-white rounded-full animate-[loader-fill_2s_ease-in-out_infinite]" />
      </div>

      {/* Brand Footer Credit */}
      <div className="absolute bottom-6 flex items-center space-x-2 text-[10px] md:text-xs tracking-widest font-mono uppercase text-orange-100/60 font-semibold">
        <span>AATHIA ANIMAL WELFARE</span>
        <span>•</span>
        <span>INDIA REGIONAL REGISTRY</span>
      </div>
    </div>
  );
}

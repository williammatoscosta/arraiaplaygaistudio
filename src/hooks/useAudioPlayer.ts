import { useState, useRef, useCallback, useEffect } from 'react';
import { Howl } from 'howler';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const howlRef = useRef<Howl | null>(null);
  const nextHowlRef = useRef<Howl | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    let interval: number;
    if (isPlaying && howlRef.current) {
      interval = setInterval(() => {
        if (howlRef.current) {
          setCurrentTime(howlRef.current.seek() as number);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const play = useCallback((src: string, crossfadeSettings?: any) => {
    if (howlRef.current && currentSrc === src) {
      if (!howlRef.current.playing()) {
        howlRef.current.play();
      }
      return;
    }

    const mixDuration = crossfadeSettings?.manual.mixNextMseg || 2000;
    const mixEnabled = crossfadeSettings?.manual.mixNext;

    if (howlRef.current) {
      if (mixEnabled) {
          // Fade-out na faixa anterior enquanto a nova começa em volume total
          howlRef.current.fade(1, 0, mixDuration);
          nextHowlRef.current = howlRef.current;
          setTimeout(() => {
              if (nextHowlRef.current) {
                  nextHowlRef.current.stop();
                  nextHowlRef.current = null;
              }
          }, mixDuration);
      } else {
          howlRef.current.stop();
      }
    }
    
    const sound = new Howl({ 
      src: [src],
      html5: true,
      volume: 1, // Volume total imediato
      onplay: () => {
        setIsPlaying(true);
        setDuration(sound.duration());
        // Sem fade-in aqui
      },
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => setIsPlaying(false)
    });
    
    sound.play();
    howlRef.current = sound;
    setCurrentSrc(src);
    setCurrentTime(0);
  }, [currentSrc]);

  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
      setCurrentSrc(null);
      setCurrentTime(0);
      setDuration(0);
    }
  }, []);

  return { isPlaying, play, pause, stop, currentTime, duration };
}

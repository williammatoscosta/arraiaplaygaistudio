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

  const play = useCallback((src: string, crossfadeSettings?: any, onEnd?: () => void) => {
    console.log('Play chamado:', src);
    if (howlRef.current && currentSrc === src) {
      console.log('Mesma fonte, tentando retomar.');
      if (!howlRef.current.playing()) {
        howlRef.current.play();
      }
      return;
    }

    const mixDuration = crossfadeSettings?.manual.mixNextMseg || 2000;
    const mixEnabled = crossfadeSettings?.manual.mixNext;

    console.log('Configurações de mixagem:', { mixEnabled, mixDuration });

    if (howlRef.current) {
      if (mixEnabled) {
          // Fade-out na faixa anterior
          console.log('Aplicando fade-out na faixa anterior');
          howlRef.current.fade(1, 0, mixDuration);
          const oldSound = howlRef.current;
          setTimeout(() => {
              console.log('Parando faixa anterior após fade-out');
              oldSound.stop();
          }, mixDuration);
      } else {
          console.log('Parando faixa anterior imediatamente');
          howlRef.current.stop();
      }
    }
    
    const sound = new Howl({ 
      src: [src],
      html5: true,
      volume: 1, // Volume total imediato
      onplay: () => {
        console.log('Faixa iniciada:', src);
        setIsPlaying(true);
        setDuration(sound.duration());
      },
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => {
        console.log('Faixa finalizada:', src);
        setIsPlaying(false);
        if (onEnd) onEnd();
      },
      onloaderror: (id, error) => {
          console.error('Erro de carregamento Howler:', id, error);
          if (onEnd) onEnd();
      }
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

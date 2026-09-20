import { useState, useRef, useCallback } from 'react';
import { Howl } from 'howler';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const howlRef = useRef<Howl | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  const play = useCallback((src: string) => {
    // Se for a mesma faixa e ela estiver pausada, retoma
    if (howlRef.current && currentSrc === src) {
      if (!howlRef.current.playing()) {
        howlRef.current.play();
      }
      return;
    }

    // Se for uma nova faixa, para a anterior e inicia a nova
    if (howlRef.current) howlRef.current.stop();
    
    const sound = new Howl({ 
      src: [src],
      html5: true,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => setIsPlaying(false)
    });
    
    sound.play();
    howlRef.current = sound;
    setCurrentSrc(src);
  }, [currentSrc]);

  const pause = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop();
      setCurrentSrc(null); // Reseta a faixa atual ao parar
    }
  }, []);

  return { isPlaying, play, pause, stop };
}

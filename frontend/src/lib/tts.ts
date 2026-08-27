let currentAudio: HTMLAudioElement | null = null;
let currentOnEnd: (() => void) | null = null;

export const stopCloudTTS = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentOnEnd) {
    currentOnEnd();
    currentOnEnd = null;
  }
};

export const playCloudTTS = async (text: string, onStart?: () => void, onEnd?: () => void) => {
  stopCloudTTS();
  if (onEnd) currentOnEnd = onEnd;
  
  try {
    const response = await fetch('/api/v1/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      currentAudio = new Audio(url);
      currentAudio.onplay = () => onStart?.();
      currentAudio.play();
      currentAudio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        if (currentOnEnd) {
          currentOnEnd();
          currentOnEnd = null;
        }
      };
      return;
    }
  } catch {
    // fall through to browser fallback
  }

  // Graceful fallback: browser Web Speech API
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.lang = 'en-US';
    utterance.onstart = () => onStart?.();
    utterance.onend = () => {
      if (currentOnEnd) {
        currentOnEnd();
        currentOnEnd = null;
      }
    };
    window.speechSynthesis.speak(utterance);
  } else {
    if (currentOnEnd) {
      currentOnEnd();
      currentOnEnd = null;
    }
  }
};

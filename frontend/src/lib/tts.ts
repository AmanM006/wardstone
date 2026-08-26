export const playCloudTTS = async (text: string) => {
  try {
    const response = await fetch('/api/v1/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
      return;
    }
  } catch {
    // fall through to browser fallback
  }

  // Graceful fallback: browser Web Speech API
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
};

export const playCloudTTS = async (text: string) => {
  try {
    const response = await fetch('/api/v1/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      console.error('TTS API error');
      return;
    }
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  } catch (error) {
    console.error('Failed to play TTS:', error);
  }
};

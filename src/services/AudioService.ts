import Sound from 'react-native-sound';

Sound.setCategory('Playback');

class AudioService {
  private sound: Sound | null = null;

  playWordAudio(word: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // For demo purposes, we'll use TTS API
      // In a real app, you might use pre-recorded audio files or a TTS service
      try {
        // Release previous sound if exists
        if (this.sound) {
          this.sound.release();
        }

        // Create a new sound instance
        // This is a placeholder - in a real app you'd have actual audio files
        // or use a proper TTS service
        console.log(`Playing audio for word: ${word}`);
        
        // Simulate audio playing
        setTimeout(() => {
          resolve();
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  stopAudio(): void {
    if (this.sound) {
      this.sound.stop();
      this.sound.release();
      this.sound = null;
    }
  }
}

export default new AudioService();
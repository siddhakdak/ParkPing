let audioContext: AudioContext | null = null;
let audioElement: HTMLAudioElement | null = null;
let alarmTimer: ReturnType<typeof setInterval> | null = null;

let audioEnabled = false;

export async function enableAlarmAudio(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    /*
     * Create AudioContext.
     */
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (AudioContextClass) {
      if (!audioContext) {
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
    }

    /*
     * Create the custom ParkPing sound.
     */
    if (!audioElement) {
      audioElement = new Audio(
        "/sounds/parkping-alert.mp3"
      );

      audioElement.preload = "auto";
      audioElement.volume = 1;
    }

    /*
     * Test the audio element.
     *
     * If the browser blocks autoplay, this will fail
     * silently and we'll try again on user interaction.
     */
    audioElement.currentTime = 0;

    await audioElement.play();

    audioElement.pause();
    audioElement.currentTime = 0;

    audioEnabled = true;

    return true;
  } catch (error) {
    console.log(
      "ParkPing: Audio requires user interaction.",
      error
    );

    return false;
  }
}

async function playCustomAlarm() {
  if (!audioElement) {
    audioElement = new Audio(
      "/sounds/parkping-alert.mp3"
    );

    audioElement.preload = "auto";
    audioElement.volume = 1;
  }

  try {
    audioElement.currentTime = 0;

    await audioElement.play();
  } catch (error) {
    console.log(
      "ParkPing alarm playback blocked:",
      error
    );
  }
}

export function startAlarm(): boolean {
  /*
   * If audio has not been unlocked by the browser,
   * don't attempt to force playback.
   */
  if (!audioEnabled) {
    return false;
  }

  /*
   * Don't create multiple alarms.
   */
  if (alarmTimer) {
    return true;
  }

  void playCustomAlarm();

  /*
   * Repeat the custom sound.
   */
  alarmTimer = setInterval(() => {
    void playCustomAlarm();
  }, 2500);

  return true;
}

export function stopAlarm() {
  if (alarmTimer) {
    clearInterval(alarmTimer);
    alarmTimer = null;
  }

  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
}

export function isAlarmEnabled() {
  return audioEnabled;
}
let audioContext: AudioContext | null = null;
let alarmTimer: ReturnType<typeof setInterval> | null = null;
let audioEnabled = false;

export async function enableAlarmAudio(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioContextClass) return false;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (audioContext.state !== "running") {
      return false;
    }

    // Small test beep to unlock audio after user interaction
    playBeep(880, 0.08);

    audioEnabled = true;
    return true;
  } catch (error) {
    console.error("Alarm audio error:", error);
    return false;
  }
}

function playBeep(frequency: number, duration: number) {
  if (!audioContext || audioContext.state !== "running") return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  const now = audioContext.currentTime;

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + duration
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

function alarmSound() {
  if (!audioEnabled) return;
  if (!audioContext) return;

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  playBeep(880, 0.15);

  setTimeout(() => {
    playBeep(660, 0.15);
  }, 180);
}

export function startAlarm(): boolean {
  if (!audioEnabled || !audioContext) {
    return false;
  }

  if (alarmTimer) {
    return true;
  }

  alarmSound();

  alarmTimer = setInterval(() => {
    alarmSound();
  }, 1200);

  return true;
}

export function stopAlarm() {
  if (alarmTimer) {
    clearInterval(alarmTimer);
    alarmTimer = null;
  }
}

export function isAlarmEnabled() {
  return audioEnabled;
}
let timerDuration; // Duration in seconds
let timerInterval;
let timeLeft;

export function startTimer(onTimeUp, duration) {
    console.log(`Starting timer for ${duration} seconds`);
    clearInterval(timerInterval);
    timeLeft = duration;

    const timerBar = document.getElementById('timer-bar');
    if(!timerBar) return;

    timerBar.style.width = '100%';

    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        const percent = timeLeft / duration;
        updateTimerBar(percent, timerBar);

        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            if(onTimeUp) onTimeUp();
        }
    }, 100);
}

function updateTimerBar(percentRemaining, timerEl) {
  const hue = percentRemaining * 120; // 120 (green) to 0 (red)

  timerEl.style.width = `${percentRemaining * 100}%`;
  timerEl.style.backgroundColor = `hsl(${hue}, 80%, 50%)`;

  if (percentRemaining <= 0.2) {
    startFlashing();
  } else {
    stopFlashing();
  }
}

function startFlashing() {
    const containerEl = document.getElementById("timer-container");
    if (!containerEl.classList.contains("warning-flash"))
        containerEl.classList.add("warning-flash");
}

function stopFlashing() {
    const containerEl = document.getElementById("timer-container");
    if (containerEl.classList.contains("warning-flash"))
        containerEl.classList.remove("warning-flash");
}

export function stopTimer() {
    stopFlashing();
    clearInterval(timerInterval);
}
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
        const percent = (timeLeft / duration) * 100;
        timerBar.style.width = percent + '%';

        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            if(onTimeUp) onTimeUp();
        }
    }, 100);
}

export function stopTimer() {
    clearInterval(timerInterval);
}
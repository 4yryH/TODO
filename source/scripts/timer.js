export function createTimer(deadline, element) {
  // Удалить предыдущий таймер, если есть
  const oldTimer = element.querySelector('.todo__timer');
  if (oldTimer) {
    clearInterval(Number(oldTimer.dataset.intervalId)); // остановить предыдущий интервал
    oldTimer.remove();
  }

  // Новый таймер
  const timerEl = document.createElement('span');
  timerEl.classList.add('todo__timer');
  element.appendChild(timerEl);

  let intervalId; // нужен для остановки при завершении или обновлении

  // отображение времени
  function updateTimer() {
    const now = new Date();
    const timeLeft = deadline - now;

    // Просроченный таймер
    if (timeLeft <= 0) {
      clearInterval(intervalId);
      timerEl.textContent = 'Просрочено!';
      timerEl.classList.add('todo__timer--expired');
      return;
    }

    // разбил на формат ДД.чч.мм.сс
    const totalSeconds = Math.floor(timeLeft / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const format = n => String(n).padStart(2, '0');
    timerEl.textContent = `⏳ ${format(days)}д ${format(hours)}ч ${format(minutes)}м ${format(seconds)}с`;
  }

  updateTimer(); // запуск первого таймера
  intervalId = setInterval(updateTimer, 1000);
  timerEl.dataset.intervalId = intervalId; // сохраним ID в элементе
}

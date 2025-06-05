import {createTimer} from './timer.js';
import {updateTask, removeTask} from './storage.js';
import {deleteTaskFromServer} from './api.js';

export function renderTask(taskData) {
  const listTodo = document.querySelector('.todo__list');
  // проверка чтобы не было дублирования
  if (listTodo.querySelector(`[data-id="${taskData.id}"]`)) return;

  const liTodo = document.createElement('li');
  liTodo.classList.add('todo__item');
  liTodo.dataset.id = taskData.id;

  if (taskData.completed) liTodo.classList.add('todo__item--completed');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('todo__checkbox');
  checkbox.checked = taskData.completed;

  const title = document.createElement('p');
  title.classList.add('todo__text');
  title.textContent = taskData.title;

  const btnDelete = document.createElement('button');
  btnDelete.textContent = 'Удалить';
  btnDelete.classList.add('todo__button-delete');

  const btnTimer = document.createElement('button');
  btnTimer.textContent = '⏰';
  btnTimer.classList.add('todo__button-timer');

  const inputDeadline = document.createElement('input');
  inputDeadline.type = 'datetime-local';
  inputDeadline.style.display = 'none';
  inputDeadline.classList.add('todo__deadline');

  const btnSet = document.createElement('button');
  btnSet.textContent = 'Установить';
  btnSet.style.display = 'none';
  btnSet.classList.add('todo__button-set-timer');

  // блок таймера при отметке задачи
  if (taskData.completed) {
    btnTimer.disabled = true;
    btnTimer.classList.add('todo__button-timer--disabled');
    btnTimer.title = 'Таймер недоступен для выполненной задачи';
  }

  // запуск таймера, если установлен дедлайн
  if (taskData.deadline) {
    const deadline = new Date(taskData.deadline);
    createTimer(deadline, liTodo);
  }

  // показ выбора времени
  btnTimer.addEventListener('click', () => {
    inputDeadline.style.display = 'inline-block';
    btnSet.style.display = 'inline-block';
  });

  // установка таймера
  btnSet.addEventListener('click', () => {
    const value = inputDeadline.value;
    if (!value) return alert('Выберите дату и время!');
    const deadlineDate = new Date(value);
    if (deadlineDate <= new Date()) return alert('Будущее время!');

    taskData.deadline = deadlineDate.toISOString();
    updateTask(taskData);
    createTimer(deadlineDate, liTodo);

    alert(`Таймер установлен на ${deadlineDate.toLocaleString()}`);
    inputDeadline.style.display = 'none';
    btnSet.style.display = 'none';
  });

  // чекбокс на выполнение
  checkbox.addEventListener('change', () => {
    taskData.completed = checkbox.checked;
    liTodo.classList.toggle('todo__item--completed', checkbox.checked);
    updateTask(taskData);

    if (taskData.completed && taskData.deadline) {
      const oldTimer = liTodo.querySelector('.todo__timer');
      if (oldTimer) {
        clearInterval(Number(oldTimer.dataset.intervalId));
        oldTimer.remove();
      }
      taskData.deadline = null;
      btnTimer.disabled = true;
      btnTimer.classList.add('todo__button-timer--disabled');
      btnTimer.title = 'Таймер недоступен для выполненной задачи';
      updateTask(taskData);
    } else {
      btnTimer.disabled = false;
      btnTimer.classList.remove('todo__button-timer--disabled');
      btnTimer.title = '';
    }
  });

  // удаление задачи
  btnDelete.addEventListener('click', async () => {
    liTodo.remove();
    removeTask(taskData.id);
    // проверка флага на локал, который добавил в task.js
    if (!taskData._localOnly) {
      try {
        await deleteTaskFromServer(taskData.id);
        console.log(`Задача ${taskData.id} удалена с сервера`);
      } catch (err) {
        console.error(`Ошибка удаления задачи ${taskData.id} с сервера:`, err);
        alert(`Не удалось удалить задачу с сервера`);
      }
    }
  });

  liTodo.append(checkbox, title, btnTimer, inputDeadline, btnSet, btnDelete);
  listTodo.appendChild(liTodo);
}

// Показать спиннер загрузки
export function showLoadingSpinner(container) {
  const spinner = document.createElement('div');
  spinner.classList.add('todo__loading-spinner');
  container.parentNode.insertBefore(spinner, container);
  return spinner;
}

// Показать сообщение "Нет задач"
export function showEmptyMessage(container) {
  if (!container.querySelector('.todo__empty')) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'Нет задач';
    emptyMsg.classList.add('todo__empty');
    container.appendChild(emptyMsg);
  }
}

// Удалить сообщение "Нет задач"
export function removeEmptyMessage(container) {
  const emptyMsg = container.querySelector('.todo__empty');
  if (emptyMsg) emptyMsg.remove();
}

// наблюдатель на задачи
export function setupEmptyListObserver(container) {
  const observer = new MutationObserver(() => {
    const hasTasks = container.querySelectorAll('.todo__item').length > 0;
    const emptyMsg = container.querySelector('.todo__empty');

    if (hasTasks && emptyMsg) {
      emptyMsg.remove(); // скрыть сообщение
    } else if (!hasTasks && !emptyMsg) {
      const msg = document.createElement('p');
      msg.textContent = 'Нет задач';
      msg.classList.add('todo__empty');
      container.appendChild(msg);
    }
  });

  observer.observe(container, {childList: true});
}

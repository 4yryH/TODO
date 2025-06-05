import { loadTasks as loadLocalTasks, addTask } from './tasks.js';
import { loadTasks as loadServerTasks } from './api.js';
import { filters } from './filters.js';
import { showLoadingSpinner, showEmptyMessage, removeEmptyMessage, setupEmptyListObserver } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const todoAdd = document.querySelector('.todo__add-button');
  const todoInput = document.querySelector('.todo__input');
  const todoList = document.querySelector('.todo__list');

  // спиннер при загрузке
  const loadingIndicator = showLoadingSpinner(todoList);
  // показать "нет задач"
  showEmptyMessage(todoList);
  // скрыть "нет задач"
  removeEmptyMessage(todoList);

  try {
    await loadLocalTasks(); // сначала из localStorage
    await loadServerTasks(); // потом с сервера
    // удалить спиннер после загрузки
    loadingIndicator.remove();
    // если нет задач, то показать сообщение
    const hasTasks = todoList.querySelectorAll('.todo__item').length > 0;
    if (!hasTasks) showEmptyMessage(todoList);
  } catch (err) {
    console.error('Ошибка при загрузке задач:', err);
    // показ пользователю сообщения об ошибке
    loadingIndicator.classList.remove('todo__loading-spinner');
    loadingIndicator.classList.add('todo__loading-error');
    loadingIndicator.textContent = 'Не удалось загрузить задачи';
  }

  // вызываем фильтр
  filters();

  //обработка кнопки добавить и проверка на пустое поле
  todoAdd.addEventListener('click', async (evt) => {
    evt.preventDefault();
    const value = todoInput.value.trim();
    if (!value) {
      alert('Пустая задача не может быть добавлена!');
      return;
    }

    await addTask(value);
    todoInput.value = '';
    removeEmptyMessage(todoList);
  });

  // обработчик добавления задачи по enter в input и проверка ну пустое поле
  todoInput.addEventListener('keydown', async (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      const value = todoInput.value.trim();
      if (!value) {
        alert('Пустая задача не может быть добавлена!');
        return;
      }

      await addTask(value);
      todoInput.value = '';
      removeEmptyMessage(todoList);
    }
  });
  // возов наблюдателя за задачами из ui.js
  setupEmptyListObserver(todoList, showEmptyMessage);
});

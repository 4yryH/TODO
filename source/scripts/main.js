import {loadTasks as loadLocalTasks, addTask} from './tasks.js';
import {loadTasks as loadServerTasks} from './fetch.js';
import {filters} from './filters.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    loadLocalTasks();     // сначала локал
    await loadServerTasks(); // потом сервер
    filters();

    const todoAdd = document.querySelector('.todo__add-button');
    const todoInput = document.querySelector('.todo__input');

    todoAdd.addEventListener('click', async (evt) => {
      evt.preventDefault();
      await addTask(todoInput.value);
      todoInput.value = '';
    });
  } catch (err) {
    console.error('Ошибка при загрузке задач:', err);
  }
});

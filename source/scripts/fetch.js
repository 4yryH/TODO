import { getTaskById, saveFullTask, getDeletedIds } from './storage.js';
import { renderTask } from './tasks.js';

// загрузка задач с сервера
export async function loadTasks() {
  try {
    // сделал лимит на загрузку 5 задач
    const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
    if (!response.ok) {
      throw Error(`HTTP error! status: ${response.status}`);
    }

    const todos = await response.json();
    const deletedIds = getDeletedIds();

    todos.forEach(todo => {
      if (deletedIds.includes(todo.id)) {
        return; // задача была удалена вручную, то не загружаем
      }

      let taskData = getTaskById(todo.id);

      if (!taskData) {
        // Новая задача с сервера
        taskData = { ...todo, deadline: null };
        saveFullTask(taskData);
      } else {
        // Обновим только title
        taskData = { ...taskData, title: todo.title };
      }

      renderTask(taskData);
    });
  } catch (err) {
    console.error(`Ошибка загрузки: ${err.message}`);
    throw err;
  }
}

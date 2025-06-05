import { getTaskById, saveFullTask, getDeletedIds } from './storage.js';
import { renderTask } from './ui.js';

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
    alert(`Ошибка загрузки: ${err.message}`);
    throw err;
  }
}

// отправка задачи на сервер
export async function createTaskOnServer(task) {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      title: task,
      completed: false,
      userId: 1
    })
  });

  if (!response.ok) {
    throw new Error(`Ошибка сервера: ${response.status}`);
  }

  return await response.json();
}

// удаление задачи
export async function deleteTaskFromServer(id) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(`Ошибка удаления задачи ${id} с сервера`);
  }
}

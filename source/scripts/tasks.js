import { saveFullTask, getTaskById } from './storage.js';
import { createTaskOnServer } from './api.js';
import { renderTask } from './ui.js';

// добавить новую задачу
export async function addTask(task) {
  if (!task.trim()) return; // проверка на пустое поле

  try {
    const newTodo = await createTaskOnServer(task);

    // проверка ID и генерация своего id
    let id = newTodo.id;
    if (!id || getTaskById(id)) {
      id = Date.now() + Math.floor(Math.random() * 1000);
      newTodo._localOnly = true; // метка, если задача новая и хранится локально
    }

    newTodo.id = id;
    newTodo.deadline = null; // при создании задачи таймер обнулен

    saveFullTask(newTodo); // в локал
    renderTask(newTodo); // рендер
  } catch (err) {
    console.error('Ошибка при добавлении задачи:', err);
    alert('Ошибка при добавлении задачи');
  }
}

// загрузка задач из локал и рендер
export function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];
  tasks.forEach(renderTask);
}

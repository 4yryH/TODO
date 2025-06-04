const TASKS_KEY = 'todo_tasks';
const DELETED_KEY = 'todo_deleted_ids';

// из localStorage
export function loadTasks() {
  return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
}

// в localStorage
export function saveFullTask(task) {
  const tasks = loadTasks();
  const index = tasks.findIndex(t => t.id === task.id);

  if (index !== -1) {
    // Уже есть, то обновляем
    tasks[index] = task
  } else {
    // Если новая, то пушим
    tasks.push(task)
  }
  // сохраняем в localStorage
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// получение задачи по ID
export function getTaskById(id) {
  return loadTasks().find(t => t.id === id);
}

// Обновление существующей задачи
export function updateTask(task) {
  saveFullTask(task);
}

// Удаление задачи по ID
export function removeTask(id) {
  const tasks = loadTasks().filter(t => t.id !== id);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  addToDeletedIds(id);
}

// Получение удаленных задач
export function getDeletedIds() {
  return JSON.parse(localStorage.getItem(DELETED_KEY)) || [];
}

// Добавление удаленных задач в список
export function addToDeletedIds(id) {
  const deleted = getDeletedIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
  }
}

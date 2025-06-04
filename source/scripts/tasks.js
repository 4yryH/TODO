import {createTimer} from './timer.js';
import {saveFullTask, updateTask, removeTask} from './storage.js';

// добавление задачи с сохранением в локал и отправкой на сервер
export async function addTask(task) {
  if (!task.trim()) return;

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        title: task,
        completed: false,
        userId: 1
      })
    });

    if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

    const newTodo = await response.json();

    // подмена ID, потому-что сервер присваивает ID 201, решил сделать через дату
    if (newTodo.id === 201) {
      newTodo.id = Date.now();
    }

    newTodo.deadline = null;

    saveFullTask(newTodo); // в локал
    renderTask(newTodo);
  } catch (err) {
    console.error('Ошибка при добавлении задачи:', err);
  }
}

// рендер
export function renderTask(taskData) {
  const listTodo = document.querySelector('.todo__list');

  // что бы не было дублирования задач
  if (listTodo.querySelector(`[data-id="${taskData.id}"]`)) {
    return;
  }

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

  if (taskData.deadline) {
    const deadline = new Date(taskData.deadline);
    createTimer(deadline, liTodo);
  }

  btnTimer.addEventListener('click', () => {
    inputDeadline.style.display = 'inline-block';
    btnSet.style.display = 'inline-block';
  });

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

  checkbox.addEventListener('change', () => {
    taskData.completed = checkbox.checked;
    liTodo.classList.toggle('todo__item--completed', checkbox.checked);
    updateTask(taskData);
  });

  btnDelete.addEventListener('click', async () => {
    liTodo.remove();
    removeTask(taskData.id);

    try {
      await fetch(`https://jsonplaceholder.typicode.com/todos/${taskData.id}`, {
        method: 'DELETE'
      });
      console.log(`Задача ${taskData.id} удалена с сервера`);
    } catch (err) {
      console.error(`Не удалось удалить задачу ${taskData.id} с сервера:`, err);
    }
  });

  liTodo.append(checkbox, title, btnTimer, inputDeadline, btnSet, btnDelete);
  listTodo.appendChild(liTodo);
}

export function loadTasks() {
  const tasks = loadTasksFromStorage();
  tasks.forEach(renderTask);
}

// из локал
function loadTasksFromStorage() {
  return JSON.parse(localStorage.getItem('todo_tasks')) || [];
}

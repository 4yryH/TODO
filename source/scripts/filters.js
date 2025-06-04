export function filters() {
  const filterButtons = document.querySelectorAll('.todo__filter-button');
  const listTodo = document.querySelector('.todo__list');

  filterButtons.forEach(button => {
    button.addEventListener('click', (evt) => {
      evt.preventDefault();

      // Снимаем класс "active" со всех кнопок и добавляем только на нажатую
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.textContent.toLowerCase();

      const items = listTodo.querySelectorAll('.todo__item');

      // Применяем фильтр к каждой задаче
      items.forEach(item => {
        const isCompleted = item.classList.contains('todo__item--completed');

        if (filter === 'все задачи') {
          item.classList.remove('todo__item--hidden');
        } else if (filter === 'выполненные задачи') {
          item.classList.toggle('todo__item--hidden', !isCompleted);
        } else if (filter === 'невыполненные задачи') {
          item.classList.toggle('todo__item--hidden', isCompleted);
        }
      })
    })
  })
}

document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const filterTasks = document.getElementById('filter-tasks');
    const themeToggle = document.getElementById('theme-toggle');
    const modal = document.getElementById('modal');
    const editTaskInput = document.getElementById('edit-task-input');
    const saveTaskButton = document.getElementById('save-task');
    const closeModal = document.querySelector('.close');

    let tasks = [];
    let currentTaskId = null;

    // Загрузка задач из localStorage
    loadTasks();

    // Добавление задачи
    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            addTask(taskText);
            taskInput.value = '';
        } else {
            showToast('Задача не может быть пустой');
        }
    });

    // Фильтрация задач
    filterTasks.addEventListener('change', () => {
        filterTasksList(filterTasks.value);
    });

    // Переключение темы
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDarkTheme = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
        themeToggle.textContent = isDarkTheme ? 'Светлая тема 🌝' : 'Тёмная тема 🌚';
    });

    // Открытие модального окна для редактирования задачи
    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-task')) {
            currentTaskId = e.target.dataset.id;
            const task = tasks.find(task => task.id == currentTaskId);
            editTaskInput.value = task.text;
            modal.style.display = 'flex';
        }
    });

    // Сохранение изменений задачи
    saveTaskButton.addEventListener('click', () => {
        const newText = editTaskInput.value.trim();
        if (newText) {
            updateTask(currentTaskId, newText);
            modal.style.display = 'none';
        } else {
            showToast('Задача не может быть пустой');
        }
    });

    // Закрытие модального окна
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Загрузка задач из API
    loadTasksFromAPI();

    // Добавление задачи
    function addTask(text) {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            favorite: false
        };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        showToast('Задача добавлена');
    }

    // Обновление задачи
    function updateTask(id, newText) {
        const task = tasks.find(task => task.id == id);
        task.text = newText;
        saveTasks();
        renderTasks();
        showToast('Задача обновлена');
    }

    // Удаление задачи
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id != id);
        saveTasks();
        renderTasks();
        showToast('Задача удалена');
    }

    // Переключения статуса задачи
    function toggleTaskStatus(id) {
        const task = tasks.find(task => task.id == id);
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }

    // Переключения "избранного"
    function toggleFavorite(id) {
        const task = tasks.find(task => task.id == id);
        task.favorite = !task.favorite;
        saveTasks();
        renderTasks();
    }

    // Фильтр задач
    function filterTasksList(filter) {
        let filteredTasks = [];
        switch (filter) {
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            case 'uncompleted':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'favorite':
                filteredTasks = tasks.filter(task => task.favorite);
                break;
            default:
                filteredTasks = tasks;
        }
        renderTasks(filteredTasks);
    }

    // Рендер задач
    function renderTasks(tasksToRender = tasks) {
        taskList.innerHTML = '';
        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
                <div>
                    <button class="edit-task" data-id="${task.id}">✏️</button>
                    <button class="delete-task" data-id="${task.id}">🗑️</button>
                    <button class="favorite-task" data-id="${task.id}">${task.favorite ? '⭐' : '☆'}</button>
                    <input type="checkbox" class="task-status" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                </div>
            `;
            taskList.appendChild(li);
        });

        // Добавление обработчиков событий для кнопок
        document.querySelectorAll('.delete-task').forEach(button => {
            button.addEventListener('click', () => deleteTask(button.dataset.id));
        });

        document.querySelectorAll('.task-status').forEach(checkbox => {
            checkbox.addEventListener('change', () => toggleTaskStatus(checkbox.dataset.id));
        });

        document.querySelectorAll('.favorite-task').forEach(button => {
            button.addEventListener('click', () => toggleFavorite(button.dataset.id));
        });
    }

    // Сохраняем массив задач в JSON
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // загрузки задач
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        }
    }

    function showToast(message) {
        // Создаём элемент уведомления
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        // Добавляем уведомление в верхнюю часть страницы
        document.body.appendChild(toast);

        // Позиционируем уведомление сверху
        toast.style.position = 'fixed';
        toast.style.top = '20px'; // Отступ сверху
        toast.style.left = '50%'; // Центрирование по горизонтали
        toast.style.transform = 'translateX(-50%)'; // Смещение для точного центрирования
        toast.style.padding = '10px 20px';
        toast.style.backgroundColor = '#989393';
        toast.style.color = '#111c01';
        toast.style.borderRadius = '5px';
        toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        toast.style.zIndex = '1000'; // Убедимся, что уведомление поверх других элементов
        toast.style.transition = 'opacity 0.3s ease-in-out'; // Плавное исчезновение

        // Показываем уведомление
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300); // Ждём завершения анимации
        }, 3000);
    }

    // Загружает задачи с внешнего API (JSONPlaceholder)
    function loadTasksFromAPI() {
        fetch('https://jsonplaceholder.typicode.com/todos')
            .then(response => response.json())
            .then(data => {
                tasks = data.map(task => ({
                    id: task.id,
                    text: task.title,
                    completed: task.completed,
                    favorite: false
                }));
                renderTasks();
            })
            .catch(error => console.error('Ошибка при загрузке задач:', error));
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const todosContainer = document.querySelector('.todo-container'); // FIX 1: match HTML class
    const form = document.querySelector('.input-area');

    const toggleEmptyState = () => {
        emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
        todosContainer.style.width = taskList.children.length === 0 ? '100%' : '50px';
    };

    const addTask = (event, completed = false) => { // FIX 2: define `completed`
        event.preventDefault();
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
            <span>${taskText}</span>
            <div class="task-button">
                <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>`;

        const checkbox = li.querySelector('.task-checkbox'); // FIX 3: was "chechbox"
        const editBtn = li.querySelector('.edit-btn');

        if (completed) {
            li.classList.add('completed');
            editBtn.setAttribute('aria-disabled', 'true');
            editBtn.style.opacity = 0.5;
            editBtn.style.pointerEvents = 'none';
        }

        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            li.classList.toggle('completed', isChecked);
            editBtn.setAttribute('aria-disabled', isChecked);
            editBtn.style.opacity = isChecked ? 0.5 : 1;
            editBtn.style.pointerEvents = isChecked ? 'none' : 'auto';
        });

        editBtn.addEventListener('click', () => {
            if (!checkbox.checked) {
                taskInput.value = li.querySelector('span').textContent;
                li.remove();
                toggleEmptyState();
            }
        });

        li.querySelector('.delete-btn').addEventListener('click', () => {
            li.remove();
            toggleEmptyState();
        });

        // FIX 4: removed the duplicate empty edit-btn listener

        taskList.appendChild(li);
        taskInput.value = '';
        toggleEmptyState();
    };

    form.addEventListener('submit', addTask);
    toggleEmptyState();
});
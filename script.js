document.addEventListener('DOMContentLoaded', () => {
    const taskInput      = document.getElementById('task-input');
    const taskList       = document.getElementById('task-list');
    const emptyState     = document.querySelector('.empty-state');
    const form           = document.querySelector('.input-area');
    const progressBar    = document.getElementById('progress');
    const progressNumber = document.getElementById('number');
    const progressText   = document.getElementById('progress-text');

    /* ---------------- Confetti celebration ---------------- */
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx    = confettiCanvas.getContext('2d');
    let confettiParticles = [];

    const resizeConfettiCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        confettiCanvas.width  = window.innerWidth  * dpr;
        confettiCanvas.height = window.innerHeight * dpr;
        confettiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);

    const launchConfetti = (x, y) => {
        const colors = ['#ff6f91', '#ffbf00', '#ff4c4c', '#f857a6', '#ff5858', '#ffffff', '#ffd1dc', '#845ef7', '#22d3ee'];
        for (let i = 0; i < 90; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6;
            confettiParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 4,
                size: 4 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                life: 1,
                shape: Math.random() > 0.5 ? 'rect' : 'circle'
            });
        }
    };

    const tickConfetti = () => {
        confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (let i = confettiParticles.length - 1; i >= 0; i--) {
            const p = confettiParticles[i];
            p.vy += 0.18;
            p.vx *= 0.99;
            p.x  += p.vx;
            p.y  += p.vy;
            p.rotation += p.rotationSpeed;
            p.life -= 0.012;
            if (p.life <= 0) { confettiParticles.splice(i, 1); continue; }
            confettiCtx.save();
            confettiCtx.globalAlpha = Math.max(0, p.life);
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate(p.rotation);
            confettiCtx.fillStyle = p.color;
            if (p.shape === 'rect') {
                confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
                confettiCtx.beginPath();
                confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                confettiCtx.fill();
            }
            confettiCtx.restore();
        }
        requestAnimationFrame(tickConfetti);
    };
    tickConfetti();

    const toggleEmptyState = () => {
        if (!emptyState) return;
        emptyState.style.display = taskList.children.length === 0 ? 'flex' : 'none';
    };

    const updateProgress = () => {
        const totalTasks     = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('.task-checkbox:checked').length;
        const pct = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
        progressBar.style.width = `${pct}%`;
        progressNumber.textContent = `${completedTasks}/${totalTasks}`;
        if (progressText) progressText.textContent = `${Math.round(pct)}%`;
    };

    const saveTasksToLocalStorage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector('span').textContent,
            completed: li.querySelector('.task-checkbox').checked
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        savedTasks.forEach(({ text, completed }) => addTask(text, completed, false));
        toggleEmptyState();
        updateProgress();
    };

    const ICON_EDIT = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.21a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    const ICON_DELETE = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';

    const addTask = (textOrEvent, completed = false, save = true) => {
        let taskText;
        if (textOrEvent && typeof textOrEvent.preventDefault === 'function') {
            textOrEvent.preventDefault();
            taskText = taskInput.value.trim();
        } else if (typeof textOrEvent === 'string') {
            taskText = textOrEvent.trim();
        } else {
            taskText = taskInput.value.trim();
        }
        if (!taskText) return;

        const li = document.createElement('li');
        li.innerHTML =
            '<input type="checkbox" class="task-checkbox"' + (completed ? ' checked' : '') + '>' +
            '<span></span>' +
            '<div class="task-button">' +
                '<button class="edit-btn" aria-label="Edit task">' + ICON_EDIT + '</button>' +
                '<button class="delete-btn" aria-label="Delete task">' + ICON_DELETE + '</button>' +
            '</div>';
        li.querySelector('span').textContent = taskText;

        const checkbox = li.querySelector('.task-checkbox');
        const editBtn  = li.querySelector('.edit-btn');

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
            updateProgress();
            saveTasksToLocalStorage();
            if (isChecked) {
                const r = checkbox.getBoundingClientRect();
                launchConfetti(r.left + r.width / 2, r.top + r.height / 2);
            }
        });

        editBtn.addEventListener('click', () => {
            if (!checkbox.checked) {
                taskInput.value = li.querySelector('span').textContent;
                taskInput.focus();
                li.remove();
                toggleEmptyState();
                updateProgress();
                saveTasksToLocalStorage();
            }
        });

        li.querySelector('.delete-btn').addEventListener('click', () => {
            li.style.transition = 'all 0.25s ease';
            li.style.transform = 'translateX(20px)';
            li.style.opacity = '0';
            setTimeout(() => {
                li.remove();
                toggleEmptyState();
                updateProgress();
                saveTasksToLocalStorage();
            }, 220);
        });

        taskList.appendChild(li);
        taskInput.value = '';
        toggleEmptyState();
        updateProgress();
        if (save) saveTasksToLocalStorage();
    };

    form.addEventListener('submit', addTask);

    loadTasksFromLocalStorage();
    toggleEmptyState();
    updateProgress();
});
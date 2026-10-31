/**
 * storage.js - LocalStorage management for Personal Task Manager
 */

const STORAGE_KEY = 'personal_task_manager_data';

// Default initial tasks if localStorage is empty
const DEFAULT_TASKS = [
    {
        id: 'task-1740000001',
        title: 'Mengerjakan laporan praktikum Pemrograman Web',
        description: 'Menyusun laporan modul 4 mengenai DOM manipulation dan event handling.',
        category: 'Kuliah',
        priority: 'High',
        dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0], // Besok
        status: 'Pending',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
        id: 'task-1740000002',
        title: 'Menyiapkan materi presentasi klien',
        description: 'Buat slide presentasi untuk meeting progres proyek mingguan.',
        category: 'Pekerjaan',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 hari lagi
        status: 'Pending',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
        id: 'task-1740000003',
        title: 'Belanja kebutuhan bulanan di supermarket',
        description: 'Beras, minyak goreng, telur, sayuran hijau, dan buah-buahan.',
        category: 'Personal',
        priority: 'Low',
        dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        status: 'Pending',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
        id: 'task-1740000004',
        title: 'Membaca buku Clean Code Bab 3',
        description: 'Memahami prinsip pembuatan fungsi yang baik dan bersih.',
        category: 'Personal',
        priority: 'Medium',
        dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], // Kemarin (completed)
        status: 'Completed',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    }
];

const Storage = {
    /**
     * Get all tasks from localStorage
     * @returns {Array} List of tasks
     */
    getTasks() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                this.saveTasks(DEFAULT_TASKS);
                return DEFAULT_TASKS;
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    },

    /**
     * Save tasks array to localStorage
     * @param {Array} tasks 
     */
    saveTasks(tasks) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    /**
     * Get single task by ID
     * @param {string} id 
     * @returns {Object|null}
     */
    getTaskById(id) {
        const tasks = this.getTasks();
        return tasks.find(t => t.id === id) || null;
    },

    /**
     * Add a new task
     * @param {Object} taskData 
     * @returns {Object} Created task
     */
    addTask(taskData) {
        const tasks = this.getTasks();
        const newTask = {
            id: 'task-' + Date.now(),
            title: taskData.title.trim(),
            description: taskData.description ? taskData.description.trim() : '',
            category: taskData.category || 'Personal',
            priority: taskData.priority || 'Medium',
            dueDate: taskData.dueDate || '',
            status: taskData.status || 'Pending',
            createdAt: new Date().toISOString()
        };
        tasks.unshift(newTask);
        this.saveTasks(tasks);
        return newTask;
    },

    /**
     * Update an existing task
     * @param {string} id 
     * @param {Object} taskData 
     * @returns {Object|null}
     */
    updateTask(id, taskData) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) return null;

        tasks[index] = {
            ...tasks[index],
            title: taskData.title !== undefined ? taskData.title.trim() : tasks[index].title,
            description: taskData.description !== undefined ? taskData.description.trim() : tasks[index].description,
            category: taskData.category || tasks[index].category,
            priority: taskData.priority || tasks[index].priority,
            dueDate: taskData.dueDate !== undefined ? taskData.dueDate : tasks[index].dueDate,
            status: taskData.status || tasks[index].status,
            updatedAt: new Date().toISOString()
        };

        this.saveTasks(tasks);
        return tasks[index];
    },

    /**
     * Delete a task by ID
     * @param {string} id 
     * @returns {boolean} Success status
     */
    deleteTask(id) {
        let tasks = this.getTasks();
        const initialLength = tasks.length;
        tasks = tasks.filter(t => t.id !== id);
        if (tasks.length < initialLength) {
            this.saveTasks(tasks);
            return true;
        }
        return false;
    },

    /**
     * Toggle task completion status
     * @param {string} id 
     * @returns {Object|null} Updated task
     */
    toggleTaskStatus(id) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) return null;

        task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
        task.updatedAt = new Date().toISOString();
        this.saveTasks(tasks);
        return task;
    }
};

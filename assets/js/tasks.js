/**
 * tasks.js - Business logic and task management operations
 */

const TaskManager = {
    getAllTasks() {
        return Storage.getTasks();
    },

    getTask(id) {
        return Storage.getTaskById(id);
    },

    createTask(data) {
        if (!data.title || !data.title.trim()) {
            throw new Error('Judul tugas wajib diisi.');
        }
        if (!data.category || !data.category.trim()) {
            throw new Error('Kategori tugas wajib diisi.');
        }
        return Storage.addTask(data);
    },

    updateTask(id, data) {
        if (data.title !== undefined && !data.title.trim()) {
            throw new Error('Judul tugas tidak boleh kosong.');
        }
        if (data.category !== undefined && !data.category.trim()) {
            throw new Error('Kategori tugas tidak boleh kosong.');
        }
        return Storage.updateTask(id, data);
    },

    deleteTask(id) {
        return Storage.deleteTask(id);
    },

    toggleStatus(id) {
        return Storage.toggleTaskStatus(id);
    },

    /**
     * Get all unique categories from tasks plus defaults
     */
    getAllCategories() {
        const tasks = this.getAllTasks();
        const categoriesSet = new Set(['Kuliah', 'Pekerjaan', 'Personal']);
        tasks.forEach(t => {
            if (t.category && t.category.trim()) {
                categoriesSet.add(t.category.trim());
            }
        });
        return Array.from(categoriesSet);
    },

    /**
     * Get dashboard statistics
     */
    getStatistics() {
        const tasks = this.getAllTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'Completed').length;
        const pending = total - completed;

        // Upcoming deadlines: Pending tasks with due dates in the future or today
        const todayStr = new Date().toISOString().split('T')[0];
        const upcoming = tasks.filter(t => {
            if (t.status === 'Completed' || !t.dueDate) return false;
            return t.dueDate >= todayStr;
        }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

        return {
            total,
            completed,
            pending,
            upcoming
        };
    },

    /**
     * Filter and search tasks
     * @param {Object} options - { search, category, status, priority, sortBy }
     */
    getFilteredTasks(options = {}) {
        let tasks = this.getAllTasks();

        // Search query (matches title or description)
        if (options.search && options.search.trim() !== '') {
            const query = options.search.toLowerCase().trim();
            tasks = tasks.filter(t => 
                t.title.toLowerCase().includes(query) || 
                (t.description && t.description.toLowerCase().includes(query)) ||
                (t.category && t.category.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (options.category && options.category !== 'All') {
            tasks = tasks.filter(t => t.category && t.category.toLowerCase() === options.category.toLowerCase());
        }

        // Status filter
        if (options.status && options.status !== 'All') {
            tasks = tasks.filter(t => t.status === options.status);
        }

        // Priority filter
        if (options.priority && options.priority !== 'All') {
            tasks = tasks.filter(t => t.priority === options.priority);
        }

        // Sorting
        if (options.sortBy) {
            tasks.sort((a, b) => {
                if (options.sortBy === 'dueDate') {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return a.dueDate.localeCompare(b.dueDate);
                } else if (options.sortBy === 'priority') {
                    const weight = { High: 3, Medium: 2, Low: 1 };
                    return (weight[b.priority] || 0) - (weight[a.priority] || 0);
                } else if (options.sortBy === 'title') {
                    return a.title.localeCompare(b.title);
                } else {
                    // Default: newest createdAt
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });
        } else {
            // Default sort by newest
            tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return tasks;
    }
};

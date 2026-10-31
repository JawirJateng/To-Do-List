/**
 * app.js - Initialization, routing, and event coordination for Personal Task Manager
 */

const App = {
    currentFilters: {
        search: '',
        category: 'All',
        status: 'All',
        priority: 'All',
        sortBy: 'priority' // Prioritize High, Medium, Low by default
    },

    init() {
        this.bindGlobalEvents();
        this.handleRoute();
        
        // Listen to hash changes for SPA routing
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });
    },

    /**
     * Handle SPA routing based on URL hash
     */
    handleRoute() {
        const hash = window.location.hash || '#dashboard';
        const [path, queryString] = hash.split('?');
        
        // Parse query params if any (e.g. #tasks?category=Kuliah)
        const params = new URLSearchParams(queryString || '');
        const categoryParam = params.get('category');

        // Set header title
        const headerTitle = document.getElementById('headerTitle');

        if (path === '#dashboard') {
            headerTitle.textContent = 'Dashboard';
            this.currentFilters.category = 'All';
            UI.renderDashboard();
            UI.renderSidebarCategories('All');
        } else if (path === '#tasks') {
            if (categoryParam) {
                headerTitle.textContent = `Tugas: ${categoryParam}`;
                this.currentFilters.category = categoryParam;
            } else {
                headerTitle.textContent = 'Semua Tugas';
                this.currentFilters.category = 'All';
            }
            UI.renderTasksView(this.currentFilters);
            UI.renderSidebarCategories(this.currentFilters.category);
        } else {
            // Default fallback
            window.location.hash = '#dashboard';
            return;
        }

        // Precisely update active class in sidebar for whatever was clicked
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.classList.remove('active');
            const itemHref = item.getAttribute('href');
            const itemCategory = item.getAttribute('data-category');

            if (categoryParam) {
                if (itemCategory && itemCategory.toLowerCase() === categoryParam.toLowerCase()) {
                    item.classList.add('active');
                }
            } else {
                if (itemHref === hash) {
                    item.classList.add('active');
                }
            }
        });

        // Close mobile sidebar if open
        document.getElementById('sidebar').classList.remove('active');
    },

    /**
     * Bind global event listeners
     */
    bindGlobalEvents() {
        // Sidebar toggle for mobile
        const menuToggleBtn = document.getElementById('menuToggleBtn');
        const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
        const sidebar = document.getElementById('sidebar');

        menuToggleBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });

        sidebarCloseBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && !menuToggleBtn.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });

        // Open Add Task Modal buttons
        document.getElementById('openAddTaskModal').addEventListener('click', () => {
            UI.openTaskModal();
        });

        // Close Modals buttons
        document.getElementById('closeTaskModal').addEventListener('click', UI.closeTaskModal);
        document.getElementById('cancelTaskModal').addEventListener('click', UI.closeTaskModal);

        document.getElementById('closeDetailModal').addEventListener('click', UI.closeDetailModal);
        
        document.getElementById('closeDeleteModal').addEventListener('click', UI.closeDeleteModal);
        document.getElementById('cancelDeleteBtn').addEventListener('click', UI.closeDeleteModal);

        // Close modal when clicking on backdrop overlay
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Task Form Submit
        const taskForm = document.getElementById('taskForm');
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskFormSubmit();
        });
    },

    /**
     * Handle task form submission (Create or Update)
     */
    handleTaskFormSubmit() {
        const id = document.getElementById('taskId').value;
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const category = document.getElementById('taskCategory').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const status = document.getElementById('taskStatus').value;

        try {
            if (id) {
                // Update existing
                TaskManager.updateTask(id, {
                    title,
                    description,
                    category,
                    priority,
                    dueDate,
                    status
                });
                UI.showToast('Tugas berhasil diperbarui!', 'success');
            } else {
                // Create new
                TaskManager.createTask({
                    title,
                    description,
                    category,
                    priority,
                    dueDate,
                    status: 'Pending'
                });
                UI.showToast('Tugas baru berhasil ditambahkan!', 'success');
            }

            UI.closeTaskModal();
            this.refreshCurrentView();
        } catch (error) {
            UI.showToast(error.message, 'error');
        }
    },

    /**
     * Handle checkbox status toggle
     */
    handleToggleStatus(id) {
        const updated = TaskManager.toggleStatus(id);
        if (updated) {
            const msg = updated.status === 'Completed' ? 'Tugas ditandai selesai! 🎉' : 'Tugas dikembalikan ke pending.';
            UI.showToast(msg, 'success');
            this.refreshCurrentView();
        }
    },

    /**
     * Handle task deletion confirmation
     */
    handleConfirmDelete(id) {
        const success = TaskManager.deleteTask(id);
        if (success) {
            UI.showToast('Tugas berhasil dihapus.', 'success');
            UI.closeDeleteModal();
            this.refreshCurrentView();
        } else {
            UI.showToast('Gagal menghapus tugas.', 'error');
        }
    },

    /**
     * Bind filters and search events in Tasks view
     */
    bindTaskFilterEvents() {
        const searchInput = document.getElementById('searchInput');
        const filterCategory = document.getElementById('filterCategory');
        const filterStatus = document.getElementById('filterStatus');
        const filterPriority = document.getElementById('filterPriority');
        const sortBy = document.getElementById('sortBy');

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.currentFilters.search = e.target.value;
                UI.renderTasksView(this.currentFilters);
            }, 300);
        });

        filterCategory.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'All') {
                window.location.hash = '#tasks';
            } else {
                window.location.hash = `#tasks?category=${encodeURIComponent(val)}`;
            }
        });

        filterStatus.addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            UI.renderTasksView(this.currentFilters);
        });

        filterPriority.addEventListener('change', (e) => {
            this.currentFilters.priority = e.target.value;
            UI.renderTasksView(this.currentFilters);
        });

        sortBy.addEventListener('change', (e) => {
            this.currentFilters.sortBy = e.target.value;
            UI.renderTasksView(this.currentFilters);
        });
    },

    resetFilters() {
        this.currentFilters = {
            search: '',
            category: 'All',
            status: 'All',
            priority: 'All',
            sortBy: 'priority'
        };
        window.location.hash = '#tasks';
    },

    refreshCurrentView() {
        const hash = window.location.hash || '#dashboard';
        if (hash.startsWith('#dashboard')) {
            UI.renderDashboard();
            UI.renderSidebarCategories('All');
        } else if (hash.startsWith('#tasks')) {
            UI.renderTasksView(this.currentFilters);
            UI.renderSidebarCategories(this.currentFilters.category);
        }
    }
};

// Initialize App when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

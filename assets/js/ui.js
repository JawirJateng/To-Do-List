/**
 * ui.js - User Interface rendering and DOM interaction management
 */

const UI = {
    /**
     * Show toast notification
     * @param {string} message 
     * @param {string} type - 'success', 'error', 'info'
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    },

    /**
     * Format date string to Indonesian format (e.g., 25 Feb 2026)
     * @param {string} dateString 
     * @returns {string}
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', options);
        } catch (e) {
            return dateString;
        }
    },

    /**
     * Get badge color/class for category (supports custom categories)
     */
    getCategoryBadge(category) {
        const cat = category ? category.trim() : 'Personal';
        const lower = cat.toLowerCase();
        let colorClass = 'badge-custom';
        if (lower === 'kuliah') colorClass = 'badge-kuliah';
        else if (lower === 'pekerjaan') colorClass = 'badge-pekerjaan';
        else if (lower === 'personal') colorClass = 'badge-personal';
        return `<span class="badge ${colorClass}">${cat}</span>`;
    },

    /**
     * Get badge color/class for priority
     */
    getPriorityBadge(priority) {
        let pClass = 'priority-medium';
        if (priority === 'High') pClass = 'priority-high';
        else if (priority === 'Low') pClass = 'priority-low';
        return `<span class="priority-badge ${pClass}">${priority}</span>`;
    },

    /**
     * Render dynamic categories in the sidebar navigation
     */
    renderSidebarCategories(activeCategory = 'All') {
        const container = document.getElementById('sidebarCategoryList');
        if (!container) return;
        const categories = TaskManager.getAllCategories();
        
        container.innerHTML = categories.map(cat => {
            const isActive = (activeCategory && activeCategory.toLowerCase() === cat.toLowerCase()) ? 'active' : '';
            let dotColor = '#58654F';
            const lower = cat.toLowerCase();
            if (lower === 'kuliah') dotColor = '#3B5330';
            else if (lower === 'pekerjaan') dotColor = '#2A4B6B';
            else if (lower === 'personal') dotColor = '#784F33';
            
            return `
                <a href="#tasks?category=${encodeURIComponent(cat)}" class="nav-item sub-nav ${isActive}" data-view="tasks" data-category="${cat}">
                    <span class="badge-dot" style="background-color: ${dotColor};"></span>
                    ${cat}
                </a>
            `;
        }).join('');
    },

    /**
     * Update datalist options for category input in task modal
     */
    updateCategorySuggestions() {
        const datalist = document.getElementById('categorySuggestions');
        if (!datalist) return;
        const categories = TaskManager.getAllCategories();
        datalist.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');
    },

    /**
     * Render Dashboard view
     */
    renderDashboard() {
        const contentBody = document.getElementById('contentBody');
        const stats = TaskManager.getStatistics();
        const recentTasks = TaskManager.getFilteredTasks({ sortBy: 'createdAt' }).slice(0, 5);

        contentBody.innerHTML = `
            <div class="dashboard-view">
                <!-- Welcome Banner -->
                <div class="welcome-banner">
                    <div class="welcome-text">
                        <h2>Halo, Selamat Datang! 👋</h2>
                        <p>Kelola Tugas Harianmu Dengan Lebih Teratur</p>
                    </div>
                    <button class="btn btn-primary" onclick="UI.openTaskModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Tambah Tugas Baru
                    </button>
                </div>

                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon total">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-label">Total Tugas</span>
                            <h3 class="stat-value">${stats.total}</h3>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon pending">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-label">Belum Selesai (Pending)</span>
                            <h3 class="stat-value">${stats.pending}</h3>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon completed">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div class="stat-info">
                            <span class="stat-label">Sudah Selesai</span>
                            <h3 class="stat-value">${stats.completed}</h3>
                        </div>
                    </div>
                </div>

                <!-- Two Column Section -->
                <div class="dashboard-grid">
                    <!-- Upcoming Deadlines -->
                    <div class="dashboard-card">
                        <div class="card-header-flex">
                            <h3>Deadline Terdekat</h3>
                            <a href="#tasks" class="text-link" data-view="tasks">Lihat Semua</a>
                        </div>
                        <div class="task-mini-list">
                            ${stats.upcoming.length === 0 ? `
                                <div class="empty-state-sm">
                                    <p>Tidak ada deadline mendesak saat ini. Kerja bagus!</p>
                                </div>
                            ` : stats.upcoming.slice(0, 4).map(task => `
                                <div class="task-mini-item ${task.status === 'Completed' ? 'completed' : ''}">
                                    <label class="checkbox-container">
                                        <input type="checkbox" ${task.status === 'Completed' ? 'checked' : ''} onchange="App.handleToggleStatus('${task.id}')">
                                        <span class="checkmark"></span>
                                    </label>
                                    <div class="task-mini-content" onclick="UI.openDetailModal('${task.id}')">
                                        <h4>${task.title}</h4>
                                        <div class="task-mini-meta">
                                            ${this.getCategoryBadge(task.category)}
                                            <span class="due-date-badge ${task.dueDate < new Date().toISOString().split('T')[0] ? 'overdue' : ''}">
                                                📅 ${this.formatDate(task.dueDate)}
                                            </span>
                                        </div>
                                    </div>
                                    ${this.getPriorityBadge(task.priority)}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Recent Tasks -->
                    <div class="dashboard-card">
                        <div class="card-header-flex">
                            <h3>Tugas Terbaru</h3>
                            <a href="#tasks" class="text-link" data-view="tasks">Kelola Tugas</a>
                        </div>
                        <div class="task-mini-list">
                            ${recentTasks.length === 0 ? `
                                <div class="empty-state-sm">
                                    <p>Belum ada tugas. Silakan tambahkan tugas baru.</p>
                                </div>
                            ` : recentTasks.map(task => `
                                <div class="task-mini-item ${task.status === 'Completed' ? 'completed' : ''}">
                                    <label class="checkbox-container">
                                        <input type="checkbox" ${task.status === 'Completed' ? 'checked' : ''} onchange="App.handleToggleStatus('${task.id}')">
                                        <span class="checkmark"></span>
                                    </label>
                                    <div class="task-mini-content" onclick="UI.openDetailModal('${task.id}')">
                                        <h4>${task.title}</h4>
                                        <div class="task-mini-meta">
                                            ${this.getCategoryBadge(task.category)}
                                            <span class="text-muted">Dibuat ${this.formatDate(task.createdAt)}</span>
                                        </div>
                                    </div>
                                    ${this.getPriorityBadge(task.priority)}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render All Tasks view with filters and search (Card layout prioritizing Priority High -> Medium -> Low)
     */
    renderTasksView(filters = {}) {
        const contentBody = document.getElementById('contentBody');
        const tasks = TaskManager.getFilteredTasks(filters);
        const allCategories = TaskManager.getAllCategories();

        contentBody.innerHTML = `
            <div class="tasks-view">
                <!-- Filter & Search Toolbar -->
                <div class="toolbar">
                    <div class="search-box">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" id="searchInput" placeholder="Cari judul, deskripsi, atau kategori..." value="${filters.search || ''}">
                    </div>

                    <div class="filter-group">
                        <select id="filterCategory" class="filter-select">
                            <option value="All" ${(!filters.category || filters.category === 'All') ? 'selected' : ''}>Semua Kategori</option>
                            ${allCategories.map(cat => `
                                <option value="${cat}" ${filters.category && filters.category.toLowerCase() === cat.toLowerCase() ? 'selected' : ''}>${cat}</option>
                            `).join('')}
                        </select>

                        <select id="filterStatus" class="filter-select">
                            <option value="All" ${(!filters.status || filters.status === 'All') ? 'selected' : ''}>Semua Status</option>
                            <option value="Pending" ${filters.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Completed" ${filters.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>

                        <select id="filterPriority" class="filter-select">
                            <option value="All" ${(!filters.priority || filters.priority === 'All') ? 'selected' : ''}>Semua Prioritas</option>
                            <option value="High" ${filters.priority === 'High' ? 'selected' : ''}>High</option>
                            <option value="Medium" ${filters.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                            <option value="Low" ${filters.priority === 'Low' ? 'selected' : ''}>Low</option>
                        </select>

                        <select id="sortBy" class="filter-select">
                            <option value="priority" ${(!filters.sortBy || filters.sortBy === 'priority') ? 'selected' : ''}>Urutkan: Prioritas (High - Low)</option>
                            <option value="createdAt" ${filters.sortBy === 'createdAt' ? 'selected' : ''}>Urutkan: Terbaru</option>
                            <option value="dueDate" ${filters.sortBy === 'dueDate' ? 'selected' : ''}>Urutkan: Deadline</option>
                            <option value="title" ${filters.sortBy === 'title' ? 'selected' : ''}>Urutkan: Judul (A-Z)</option>
                        </select>
                    </div>
                </div>

                <!-- Task List Container (Modern Cards - No Table Headers) -->
                <div class="task-list-container">
                    ${tasks.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon">🔍</div>
                            <h3>Tidak ada tugas ditemukan</h3>
                            <p>Coba ubah kata kunci pencarian atau filter yang aktif.</p>
                            <button class="btn btn-secondary" onclick="App.resetFilters()">Reset Filter</button>
                        </div>
                    ` : `
                        <div class="task-items-container">
                            ${tasks.map(task => `
                                <div class="task-item-card ${task.status === 'Completed' ? 'row-completed' : ''}">
                                    <div class="task-item-left">
                                        <label class="checkbox-container">
                                            <input type="checkbox" ${task.status === 'Completed' ? 'checked' : ''} onchange="App.handleToggleStatus('${task.id}')">
                                            <span class="checkmark"></span>
                                        </label>
                                        <div class="task-item-content" onclick="UI.openDetailModal('${task.id}')">
                                            <div class="task-item-header-row">
                                                <h4 class="task-name">${task.title}</h4>
                                                <div class="task-item-badges">
                                                    ${this.getCategoryBadge(task.category)}
                                                    ${this.getPriorityBadge(task.priority)}
                                                </div>
                                            </div>
                                            ${task.description ? `<p class="task-desc-preview">${task.description}</p>` : ''}
                                            <div class="task-item-meta-row">
                                                <span class="due-date-badge ${task.dueDate && task.dueDate < new Date().toISOString().split('T')[0] && task.status !== 'Completed' ? 'text-danger' : ''}">
                                                    📅 ${this.formatDate(task.dueDate)}
                                                </span>
                                                <span class="status-badge ${task.status === 'Completed' ? 'status-completed' : 'status-pending'}">
                                                    ${task.status === 'Completed' ? 'Selesai' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="task-item-actions">
                                        <div class="action-buttons">
                                            <button class="icon-btn" title="Detail / Edit" onclick="UI.openDetailModal('${task.id}')">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            </button>
                                            <button class="icon-btn" title="Edit" onclick="UI.openEditTaskModal('${task.id}')">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button class="icon-btn text-danger" title="Hapus" onclick="UI.openDeleteModal('${task.id}', '${task.title.replace(/'/g, "\\'")}')">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;

        App.bindTaskFilterEvents();
    },

    /**
     * Open Task Modal for Creating
     */
    openTaskModal() {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        const modalTitle = document.getElementById('modalTitle');
        const statusGroup = document.getElementById('statusGroup');

        form.reset();
        document.getElementById('taskId').value = '';
        modalTitle.textContent = 'Tambah Tugas Baru';
        statusGroup.style.display = 'none';
        this.updateCategorySuggestions();
        modal.classList.add('active');
    },

    /**
     * Open Task Modal for Editing
     */
    openEditTaskModal(id) {
        const task = TaskManager.getTask(id);
        if (!task) return;

        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const statusGroup = document.getElementById('statusGroup');

        this.updateCategorySuggestions();

        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskCategory').value = task.category || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate || '';
        document.getElementById('taskStatus').value = task.status;

        modalTitle.textContent = 'Edit Tugas';
        statusGroup.style.display = 'block';
        modal.classList.add('active');
    },

    /**
     * Close Task Modal
     */
    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
    },

    /**
     * Open Detail Modal
     */
    openDetailModal(id) {
        const task = TaskManager.getTask(id);
        if (!task) return;

        const modal = document.getElementById('detailModal');
        const body = document.getElementById('detailModalBody');
        const editBtn = document.getElementById('detailEditBtn');
        const deleteBtn = document.getElementById('detailDeleteBtn');

        body.innerHTML = `
            <div class="detail-group">
                <span class="detail-label">Judul Tugas</span>
                <h3 class="detail-title">${task.title}</h3>
            </div>
            <div class="detail-row">
                <div class="detail-group">
                    <span class="detail-label">Kategori</span>
                    <div>${this.getCategoryBadge(task.category)}</div>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Prioritas</span>
                    <div>${this.getPriorityBadge(task.priority)}</div>
                </div>
                <div class="detail-group">
                    <span class="detail-label">Status</span>
                    <div>
                        <span class="status-badge ${task.status === 'Completed' ? 'status-completed' : 'status-pending'}">
                            ${task.status === 'Completed' ? 'Selesai' : 'Pending'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="detail-group">
                <span class="detail-label">Deadline</span>
                <p class="detail-text">${this.formatDate(task.dueDate)}</p>
            </div>
            <div class="detail-group">
                <span class="detail-label">Deskripsi</span>
                <p class="detail-text description-text">${task.description ? task.description.replace(/\n/g, '<br>') : '<span class="text-muted">Tidak ada deskripsi.</span>'}</p>
            </div>
            <div class="detail-row meta-row">
                <span class="text-muted">Dibuat: ${new Date(task.createdAt).toLocaleString('id-ID')}</span>
                ${task.updatedAt ? `<span class="text-muted">Diperbarui: ${new Date(task.updatedAt).toLocaleString('id-ID')}</span>` : ''}
            </div>
        `;

        editBtn.onclick = () => {
            modal.classList.remove('active');
            this.openEditTaskModal(task.id);
        };

        deleteBtn.onclick = () => {
            modal.classList.remove('active');
            this.openDeleteModal(task.id, task.title);
        };

        modal.classList.add('active');
    },

    closeDetailModal() {
        document.getElementById('detailModal').classList.remove('active');
    },

    /**
     * Open Delete Confirmation Modal
     */
    openDeleteModal(id, title) {
        const modal = document.getElementById('deleteModal');
        document.getElementById('deleteTaskTitle').textContent = `"${title}"`;
        
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.onclick = () => {
            App.handleConfirmDelete(id);
        };

        modal.classList.add('active');
    },

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('active');
    }
};

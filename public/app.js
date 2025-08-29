// MOOC Application JavaScript

class MOOCApp {
    constructor() {
        this.currentUser = null;
        this.currentTask = 1;
        this.tasks = this.initializeTasks();
        this.saveTimer = null;
        
        this.init();
    }

    async init() {
        // Check if user is already logged in
        const token = localStorage.getItem('mooc_token');
        if (token) {
            try {
                await this.loadUserProgress();
                this.showCourseScreen();
            } catch (error) {
                console.error('Token validation failed:', error);
                localStorage.removeItem('mooc_token');
                this.showWelcomeScreen();
            }
        } else {
            this.showWelcomeScreen();
        }

        this.setupEventListeners();
    }

    initializeTasks() {
        return [
            {
                id: 1,
                title: "Einführung in die Argumentation",
                content: `
                    <h2>Einführung in die Argumentation</h2>
                    <p>Willkommen zu Ihrem ersten Schritt in die Welt der Argumentation! In dieser Aufgabe lernen Sie die Grundlagen kennen.</p>
                    <p><strong>Was ist ein Argument?</strong></p>
                    <p>Ein Argument besteht aus mindestens zwei Teilen:</p>
                    <ul>
                        <li><strong>Behauptung (These):</strong> Was Sie beweisen möchten</li>
                        <li><strong>Begründung:</strong> Warum Ihre Behauptung stimmt</li>
                    </ul>
                    <p><strong>Ihre Aufgabe:</strong></p>
                    <p>Schreiben Sie einen kurzen Text (150-200 Wörter) über ein Thema Ihrer Wahl. Stellen Sie dabei eine klare Behauptung auf und begründen Sie diese mit mindestens zwei Argumenten.</p>
                `
            },
            {
                id: 2,
                title: "Thesen formulieren",
                content: `
                    <h2>Thesen formulieren</h2>
                    <p>Eine starke These ist das Fundament jedes guten Arguments. Sie muss klar, präzise und vertretbar sein.</p>
                    <p><strong>Eigenschaften einer guten These:</strong></p>
                    <ul>
                        <li>Eindeutig und verständlich formuliert</li>
                        <li>Nicht zu allgemein oder zu spezifisch</li>
                        <li>Kontrovers diskutierbar</li>
                        <li>Mit Argumenten belegbar</li>
                    </ul>
                    <p><strong>Ihre Aufgabe:</strong></p>
                    <p>Formulieren Sie zu drei verschiedenen Themen jeweils eine These. Erklären Sie, warum jede These ein gutes Fundament für eine Argumentation darstellt.</p>
                `
            },
            {
                id: 3,
                title: "Argumente finden und strukturieren",
                content: `
                    <h2>Argumente finden und strukturieren</h2>
                    <p>Gute Argumente zu finden erfordert systematisches Vorgehen. Hier lernen Sie verschiedene Strategien kennen.</p>
                    <p><strong>Argumentationsstrategien:</strong></p>
                    <ul>
                        <li><strong>Faktenargument:</strong> Berufung auf nachprüfbare Tatsachen</li>
                        <li><strong>Autoritätsargument:</strong> Berufung auf Experten</li>
                        <li><strong>Analogieargument:</strong> Vergleich mit ähnlichen Situationen</li>
                        <li><strong>Kausalargument:</strong> Ursache-Wirkungs-Beziehungen</li>
                    </ul>
                    <p><strong>Ihre Aufgabe:</strong></p>
                    <p>Wählen Sie eine These aus der vorherigen Aufgabe. Entwickeln Sie für diese These vier verschiedene Argumente entsprechend den vier Strategien.</p>
                `
            },
            // Add more tasks as needed...
            {
                id: 4,
                title: "Gegenargumente antizipieren",
                content: `
                    <h2>Gegenargumente antizipieren</h2>
                    <p>Ein starker argumentativer Text berücksichtigt auch mögliche Einwände und Gegenargumente.</p>
                    <p><strong>Warum Gegenargumente wichtig sind:</strong></p>
                    <ul>
                        <li>Zeigen Sie die Komplexität des Themas</li>
                        <li>Stärken Ihre Glaubwürdigkeit</li>
                        <li>Ermöglichen eine differenzierte Argumentation</li>
                    </ul>
                    <p><strong>Ihre Aufgabe:</strong></p>
                    <p>Nehmen Sie Ihre bisherige Argumentation und identifizieren Sie drei mögliche Gegenargumente. Entwickeln Sie für jedes Gegenargument eine Erwiderung.</p>
                `
            },
            {
                id: 5,
                title: "Einleitung schreiben",
                content: `
                    <h2>Einleitung schreiben</h2>
                    <p>Die Einleitung ist der erste Eindruck Ihres argumentativen Textes. Sie sollte das Interesse wecken und zur These hinführen.</p>
                    <p><strong>Elemente einer guten Einleitung:</strong></p>
                    <ul>
                        <li>Aufmerksamkeit erregendes Element (Frage, Zitat, Statistik)</li>
                        <li>Hinführung zum Thema</li>
                        <li>Klare These am Ende</li>
                    </ul>
                    <p><strong>Ihre Aufgabe:</strong></p>
                    <p>Schreiben Sie drei verschiedene Einleitungen für dasselbe Thema. Verwenden Sie dabei unterschiedliche Eröffnungsstrategien.</p>
                `
            }
        ];
        
        // Add placeholder tasks for remaining tasks (6-19)
        for (let i = 6; i <= 19; i++) {
            this.tasks.push({
                id: i,
                title: `Aufgabe ${i}`,
                content: `
                    <h2>Aufgabe ${i}</h2>
                    <p>Inhalt für Aufgabe ${i} wird hier eingefügt...</p>
                    <p><strong>Ihre Aufgabe:</strong></p>
                    <p>Arbeiten Sie an den spezifischen Anforderungen dieser Aufgabe.</p>
                `
            });
        }
        
        return this.tasks;
    }

    setupEventListeners() {
        // Auth form
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuth(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Text editor auto-save
        const textEditor = document.getElementById('text-editor');
        if (textEditor) {
            textEditor.addEventListener('input', () => this.scheduleAutoSave());
        }

        // Save button
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCurrentText());
        }

        // Complete task button
        const completeBtn = document.getElementById('complete-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.completeTask());
        }

        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Legal page navigation
        document.querySelectorAll('[data-legal]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLegalPage(link.dataset.legal);
            });
        });

        // Back button from legal pages
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showCourseScreen());
        }
    }

    async handleAuth(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const errorDiv = document.getElementById('auth-error');

        if (username.length < 3) {
            this.showError('Benutzername muss mindestens 3 Zeichen lang sein.');
            return;
        }

        try {
            // Try login first
            let response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            // If login fails, try registration
            if (!response.ok) {
                response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
                });
            }

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('mooc_token', data.token);
                this.currentUser = {
                    username: data.username,
                    userId: data.userId,
                    lastTask: data.lastTask || 1
                };
                
                this.currentTask = this.currentUser.lastTask;
                await this.loadUserProgress();
                this.showCourseScreen();
            } else {
                const error = await response.json();
                this.showError(error.error || 'Fehler bei der Anmeldung');
            }
        } catch (error) {
            console.error('Auth error:', error);
            this.showError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
        }
    }

    async loadUserProgress() {
        const token = localStorage.getItem('mooc_token');
        const response = await fetch('/api/user/progress', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            this.currentUser = {
                username: data.username,
                lastTask: data.lastTask,
                progress: data.progress || []
            };
            this.currentTask = this.currentUser.lastTask;
        } else {
            throw new Error('Failed to load user progress');
        }
    }

    showWelcomeScreen() {
        this.hideAllScreens();
        document.getElementById('welcome-screen').style.display = 'block';
    }

    showCourseScreen() {
        this.hideAllScreens();
        document.getElementById('course-screen').style.display = 'block';
        
        // Update UI
        document.getElementById('username-display').textContent = this.currentUser.username;
        this.renderTaskNavigation();
        this.loadTask(this.currentTask);
        this.updateProgressBar();
    }

    showLegalPage(type) {
        this.hideAllScreens();
        document.getElementById('legal-screen').style.display = 'block';
        
        const title = document.getElementById('legal-title');
        const content = document.getElementById('legal-content');
        
        switch (type) {
            case 'impressum':
                title.textContent = 'Impressum';
                content.innerHTML = this.getLegalContent('impressum');
                break;
            case 'datenschutz':
                title.textContent = 'Datenschutzerklärung';
                content.innerHTML = this.getLegalContent('datenschutz');
                break;
            case 'kontakt':
                title.textContent = 'Kontakt';
                content.innerHTML = this.getLegalContent('kontakt');
                break;
            case 'nutzungsbedingungen':
                title.textContent = 'Nutzungsbedingungen';
                content.innerHTML = this.getLegalContent('nutzungsbedingungen');
                break;
        }
    }

    getLegalContent(type) {
        const templates = {
            impressum: `
                <h2>Angaben gemäß § 5 TMG</h2>
                <p>
                    [Ihr Name/Organisation]<br>
                    [Ihre Adresse]<br>
                    [PLZ Ort]
                </p>
                
                <h3>Kontakt</h3>
                <p>
                    Telefon: [Ihre Telefonnummer]<br>
                    E-Mail: [Ihre E-Mail]
                </p>

                <h3>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
                <p>
                    [Verantwortliche Person]<br>
                    [Adresse]<br>
                    [PLZ Ort]
                </p>

                <h3>Haftungsausschluss</h3>
                <h4>Haftung für Inhalte</h4>
                <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.</p>
            `,
            
            datenschutz: `
                <h2>Datenschutzerklärung</h2>
                
                <h3>1. Datenschutz auf einen Blick</h3>
                <h4>Allgemeine Hinweise</h4>
                <p>Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten auf unserer Webseite auf.</p>
                
                <h3>2. Allgemeine Hinweise und Pflichtinformationen</h3>
                <h4>Datenschutz</h4>
                <p>Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
                
                <h3>3. Datenerfassung auf unserer Website</h3>
                <h4>Welche Daten erfassen wir?</h4>
                <p>Wir erfassen nur die minimal notwendigen Daten für den Kursbetrieb:</p>
                <ul>
                    <li>Benutzername (frei wählbar)</li>
                    <li>Kursfortschritt</li>
                    <li>Geschriebene Texte</li>
                </ul>
                
                <p><strong>Wichtig:</strong> Wir erfassen keine E-Mail-Adressen, Namen oder andere persönliche Daten.</p>
            `,
            
            kontakt: `
                <h2>Kontakt</h2>
                <p>Sie erreichen uns über folgende Kontaktmöglichkeiten:</p>
                
                <h3>Postanschrift</h3>
                <p>
                    [Ihr Name/Organisation]<br>
                    [Ihre Adresse]<br>
                    [PLZ Ort]<br>
                    Deutschland
                </p>
                
                <h3>Elektronische Kontaktaufnahme</h3>
                <p>
                    E-Mail: <a href="mailto:[ihre-email]">[Ihre E-Mail]</a><br>
                    Telefon: [Ihre Telefonnummer]
                </p>
                
                <h3>Sprechzeiten</h3>
                <p>
                    Montag bis Freitag: 9:00 - 17:00 Uhr<br>
                    (oder nach individueller Vereinbarung)
                </p>
            `,
            
            nutzungsbedingungen: `
                <h2>Nutzungsbedingungen</h2>
                
                <h3>1. Geltungsbereich</h3>
                <p>Diese Nutzungsbedingungen gelten für die Nutzung des MOOC-Kurses "Argumentationsaufsatz".</p>
                
                <h3>2. Nutzungsberechtigung</h3>
                <p>Der Kurs steht allen Interessierten zur freien Nutzung zur Verfügung.</p>
                
                <h3>3. Nutzerpflichten</h3>
                <ul>
                    <li>Respektvoller Umgang mit der Plattform</li>
                    <li>Keine missbräuchliche Nutzung</li>
                    <li>Beachtung der deutschen Gesetze</li>
                </ul>
                
                <h3>4. Haftungsausschluss</h3>
                <p>Die Nutzung erfolgt auf eigene Verantwortung. Wir übernehmen keine Haftung für Schäden, die durch die Nutzung entstehen können.</p>
                
                <h3>5. Änderungen</h3>
                <p>Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern.</p>
            `
        };
        
        return templates[type] || '<p>Inhalt wird geladen...</p>';
    }

    hideAllScreens() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('course-screen').style.display = 'none';
        document.getElementById('legal-screen').style.display = 'none';
    }

    renderTaskNavigation() {
        const nav = document.getElementById('task-nav');
        nav.innerHTML = '';
        
        this.tasks.forEach(task => {
            const item = document.createElement('div');
            item.className = 'task-item';
            
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'task-link';
            if (task.id === this.currentTask) link.classList.add('active');
            
            // Check if task is completed
            const isCompleted = this.currentUser?.progress?.some(p => p.task_id === task.id && p.completed);
            if (isCompleted) link.classList.add('completed');
            
            link.innerHTML = `
                <span class="task-status">${isCompleted ? '✓' : task.id}</span>
                <span class="task-title">${task.title}</span>
            `;
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadTask(task.id);
            });
            
            item.appendChild(link);
            nav.appendChild(item);
        });
    }

    async loadTask(taskId) {
        this.currentTask = taskId;
        
        // Update navigation
        document.querySelectorAll('.task-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`a[onclick*="${taskId}"]`)?.classList.add('active');
        
        // Load task content
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('task-content').innerHTML = task.content;
        }
        
        // Load saved text for this task
        await this.loadTaskText(taskId);
        
        // Update progress bar and save last task
        this.updateProgressBar();
        await this.updateLastTask(taskId);
        
        // Re-render navigation to update active state
        this.renderTaskNavigation();
    }

    async loadTaskText(taskId) {
        const token = localStorage.getItem('mooc_token');
        try {
            const response = await fetch(`/api/tasks/${taskId}/text`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                document.getElementById('text-editor').value = data.content || '';
            }
        } catch (error) {
            console.error('Failed to load text:', error);
        }
    }

    scheduleAutoSave() {
        this.setSaveStatus('saving');
        
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        
        this.saveTimer = setTimeout(() => {
            this.saveCurrentText();
        }, 2000); // Auto-save after 2 seconds of no typing
    }

    async saveCurrentText() {
        const content = document.getElementById('text-editor').value;
        const token = localStorage.getItem('mooc_token');
        
        try {
            const response = await fetch(`/api/tasks/${this.currentTask}/text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            
            if (response.ok) {
                this.setSaveStatus('saved');
            } else {
                this.setSaveStatus('error');
            }
        } catch (error) {
            console.error('Save failed:', error);
            this.setSaveStatus('error');
        }
    }

    async completeTask() {
        const token = localStorage.getItem('mooc_token');
        
        try {
            // First save the current text
            await this.saveCurrentText();
            
            // Then mark as completed
            const response = await fetch(`/api/tasks/${this.currentTask}/complete`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                // Refresh progress
                await this.loadUserProgress();
                this.renderTaskNavigation();
                
                // Move to next task if available
                if (this.currentTask < 19) {
                    this.loadTask(this.currentTask + 1);
                }
            }
        } catch (error) {
            console.error('Failed to complete task:', error);
        }
    }

    async updateLastTask(taskId) {
        const token = localStorage.getItem('mooc_token');
        
        try {
            await fetch('/api/user/last-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ taskId })
            });
        } catch (error) {
            console.error('Failed to update last task:', error);
        }
    }

    updateProgressBar() {
        const completed = this.currentUser?.progress?.filter(p => p.completed).length || 0;
        const percentage = (completed / 19) * 100;
        
        document.getElementById('progress-fill').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `Aufgabe ${this.currentTask} von 19`;
    }

    setSaveStatus(status) {
        const statusEl = document.getElementById('save-status');
        statusEl.className = '';
        
        switch (status) {
            case 'saving':
                statusEl.textContent = 'Speichert...';
                statusEl.classList.add('saving');
                break;
            case 'saved':
                statusEl.textContent = 'Gespeichert';
                statusEl.classList.add('saved');
                break;
            case 'error':
                statusEl.textContent = 'Fehler beim Speichern';
                statusEl.classList.add('error');
                break;
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }

    logout() {
        localStorage.removeItem('mooc_token');
        this.currentUser = null;
        this.currentTask = 1;
        this.showWelcomeScreen();
    }

    showError(message) {
        const errorDiv = document.getElementById('auth-error');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MOOCApp();
});
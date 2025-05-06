window.onload = function () {
    // Clear any stale user data when arriving at login page
    if (!document.getElementById('dashboardSection')) {
        console.log("Creating missing dashboardSection element");
        const mainContainer = document.querySelector('.container') || document.body;
        const dashboardSectionDiv = document.createElement('div');
        dashboardSectionDiv.id = 'dashboardSection';
        dashboardSectionDiv.className = 'container mt-4';

        // Make sure it's inserted at a good position in the DOM
        const existingContent = document.querySelector('main') || document.querySelector('.container');
        if (existingContent) {
            // Insert after the main content
            if (existingContent.nextSibling) {
                existingContent.parentNode.insertBefore(dashboardSectionDiv, existingContent.nextSibling);
            } else {
                existingContent.parentNode.appendChild(dashboardSectionDiv);
            }
        } else {
            // If no main content, append to body
            document.body.appendChild(dashboardSectionDiv);
        }
    }

    // Add dashboardContent container if it doesn't exist
    if (document.getElementById('dashboardSection') && !document.getElementById('dashboardContent')) {
        console.log("Creating missing dashboardContent element");
        const dashboardContent = document.createElement('div');
        dashboardContent.id = 'dashboardContent';
        dashboardContent.className = 'container';
        document.getElementById('dashboardSection').appendChild(dashboardContent);
    }

    // Rest of your existing window.onload code...
    // Clear any stale user data when arriving at login page
    localStorage.removeItem("currentUser");

    // Add SweetAlert library if not already included
    if (!window.Swal) {
        const sweetAlertScript = document.createElement('script');
        sweetAlertScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.head.appendChild(sweetAlertScript);
    }

    // Add Leaflet if not already included
    if (typeof L === 'undefined') {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);

        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(leafletScript);
    }

    
    
    // Verificare che il contenitore perizie-content esista, altrimenti crearlo
    if (!document.getElementById('perizie-content')) {
        const perizieContentDiv = document.createElement('div');
        perizieContentDiv.id = 'perizie-content';
        perizieContentDiv.className = 'container d-none';
        perizieContentDiv.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-12">
                    <h2>Gestione Perizie</h2>
                    <div class="card mb-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-map-marked-alt me-2"></i>Mappa delle perizie
                        </div>
                        <div class="card-body">
                            <div id="perizieMappa" style="height: 400px;"></div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-clipboard-list me-2"></i>Elenco Perizie
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-light text-dark me-2">Totale: <span id="perizieTotali">0</span></span>
                                <span class="badge bg-light text-dark">Visualizzate: <span id="perizieVisualizzate">0</span></span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="selectAllInspections">
                                    <label class="form-check-label" for="selectAllInspections">Seleziona tutti</label>
                                </div>
                                <div>
                                    
                                    <button id="deleteSelectedInspections" class="btn btn-sm btn-danger" disabled>
                                        <i class="fas fa-trash me-1"></i>Elimina selezionate (0)
                                    </button>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="headerCheckbox">
                                                </div>
                                            </th>
                                            <th>ID</th>
                                            <th>Operatore</th>
                                            <th>Data</th>
                                            <th>Tipo</th>
                                            <th>Indirizzo</th>
                                            <th>Stato</th>
                                            <th>Foto</th>
                                            <th>Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody id="perizieTableBody">
                                        <!-- Dati perizie verranno inseriti qui -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="card-footer d-flex justify-content-between align-items-center">
                            <div>
                                Totale perizie: <span id="perizieTotaliFooter">0</span>
                            </div>
                            <nav aria-label="Paginazione perizie">
                                <ul class="pagination mb-0">
                                    <li class="page-item disabled">
                                        <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Precedente</a>
                                    </li>
                                    <li class="page-item active"><a class="page-link" href="#">1</a></li>
                                    <li class="page-item"><a class="page-link" href="#">2</a></li>
                                    <li class="page-item"><a class="page-link" href="#">3</a></li>
                                    <li class="page-item">
                                        <a class="page-link" href="#">Successiva</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('dashboardSection').appendChild(perizieContentDiv);
    }

    // Login form submit handler
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;
            login(username, password);
        });
    }

    // Password change form submit handler
    const passwordChangeForm = document.getElementById("passwordChangeForm");
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener("submit", function (e) {
            e.preventDefault();
            changePassword();
        });
    }

    // Fallback per la funzione inviaRichiesta se non esiste
    if (typeof inviaRichiesta !== 'function') {
        window.inviaRichiesta = async function (method, url, parameters = {}) {
            let options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
            };

            if (method.toUpperCase() != "GET") {
                options.body = JSON.stringify(parameters);
            } else if (Object.keys(parameters).length > 0) {
                const queryString = Object.entries(parameters)
                    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                    .join('&');
                url = `${url}?${queryString}`;
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            if (response.headers.get("content-type")?.includes("application/json")) {
                return response.json();
            }

            return response.text();
        };
    }
    function logout() {
        // Clear user data
        localStorage.removeItem("currentUser");
        
        // Hide all application content
        document.getElementById("dashboardSection").classList.add("d-none");
        document.getElementById("dashboardContent")?.classList.add("d-none");
        document.getElementById("operatori-content")?.classList.add("d-none");
        document.getElementById("perizie-content")?.classList.add("d-none");
        
        // Remove filter containers that might be floating
        const filterContainers = document.querySelectorAll('.filter-container');
        filterContainers.forEach(container => {
            container.remove();
        });
        
        // Ensure any modals are closed
        if (window.bootstrap && window.bootstrap.Modal) {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modalEl => {
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) modal.hide();
            });
        }
        
        // Show authentication section
        document.getElementById("authSection").classList.remove("d-none");
        
        // Show login card and hide password change card
        document.getElementById("loginCard").classList.remove("d-none");
        document.getElementById("passwordChangeCard").classList.add("d-none");
        
        // Reset login form if it exists
        const loginForm = document.getElementById("loginForm");
        if (loginForm) loginForm.reset();
    }
    
    // Replace the existing logout functionality with our enhanced version
    
    async function login(username, password) {
        if (!username || !password) {
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Inserire username e password',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Inserire username e password');
            }
            return;
        }

        try {
            const response = await inviaRichiesta("GET", "/api/login", { username, password });

            if (response && response.length > 0) {
                // Clear any existing user data first
                localStorage.removeItem("currentUser");

                // Store user data in localStorage
                const userData = {
                    username: response[0].username,
                    firstName: response[0].firstName || "",
                    lastName: response[0].lastName || "",
                    fullName: `${response[0].firstName || ""} ${response[0].lastName || ""}`.trim(),
                    role: response[0].role || "user",
                    loginTime: new Date().getTime(),
                    firstLogin: response[0].firstLogin || false
                };

                localStorage.setItem("currentUser", JSON.stringify(userData));

                // Check if it's first login - only show password change if firstLogin is true
                if (userData.firstLogin === true) {
                    console.log("First-time login detected, showing password change form");
                    // Show password change form
                    document.getElementById("loginCard").classList.add("d-none");
                    document.getElementById("passwordChangeCard").classList.remove("d-none");
                } else {
                    console.log("Regular login, proceeding to dashboard");

                    // Hide authentication section and show dashboard
                    document.getElementById("authSection").classList.add("d-none");
                    document.getElementById("dashboardSection").classList.remove("d-none");

                    // Aggiorna le informazioni utente nella navbar
                    updateUserInfoInNavbar(userData);

                    // Load dashboard data
                    loadDashboardData();
                }
            } else {
                throw new Error("Invalid credentials");
            }
        } catch (error) {
            console.error("Errore nel login:", error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Accesso negato',
                    text: 'Credenziali non valide. Riprova.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Credenziali non valide. Riprova.');
            }
        }
    }

    // Nuova funzione per aggiornare le informazioni utente nella navbar
    function updateUserInfoInNavbar(userData) {
        // Aggiorna le iniziali dell'utente
        const userInitials = document.getElementById('userInitials');
        if (userInitials) {
            userInitials.textContent = userData.firstName.charAt(0) || userData.username.charAt(0);
        }

        // Aggiorna il nome dell'utente
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName) {
            userDisplayName.textContent = userData.fullName || userData.username;
        }

        // Aggiorna il ruolo dell'utente
        const userRole = document.getElementById('userRole');
        if (userRole) {
            userRole.textContent = userData.role === 'admin' ? 'Amministratore' : 'Operatore';
        }

        // Aggiungi funzionalità al pulsante di logout
        const btnLogout = document.getElementById("btnLogout");
        if (btnLogout) {
            btnLogout.addEventListener("click", function () {
                localStorage.removeItem("currentUser");
                document.getElementById("dashboardSection").classList.add("d-none");
                document.getElementById("authSection").classList.remove("d-none");
                // Show login card and hide password change card when logging out
                document.getElementById("loginCard").classList.remove("d-none");
                document.getElementById("passwordChangeCard").classList.add("d-none");
            });
        }
    }

    // Function to handle password change for first-time login
    async function changePassword() {
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const passwordChangeError = document.getElementById("passwordChangeError");

        // Clear previous error
        if (passwordChangeError) {
            passwordChangeError.classList.add("d-none");
        }

        // Basic validation
        if (!newPassword || !confirmPassword) {
            if (passwordChangeError) {
                passwordChangeError.textContent = "Tutti i campi sono obbligatori";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Tutti i campi sono obbligatori',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Tutti i campi sono obbligatori');
            }
            return;
        }

        if (newPassword !== confirmPassword) {
            if (passwordChangeError) {
                passwordChangeError.textContent = "Le password non coincidono";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Le password non coincidono',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Le password non coincidono');
            }
            return;
        }

        // Get current user from localStorage
        const userData = JSON.parse(localStorage.getItem("currentUser"));
        if (!userData || !userData.username) {
            if (passwordChangeError) {
                passwordChangeError.textContent = "Sessione scaduta. Effettua di nuovo il login.";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Sessione scaduta. Effettua di nuovo il login.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Sessione scaduta. Effettua di nuovo il login.');
            }
            return;
        }

        // Skip password change if firstLogin is false
        if (userData.firstLogin === false) {
            console.log("Password change skipped, firstLogin is false");

            // Hide authentication section and show dashboard directly
            document.getElementById("authSection").classList.add("d-none");
            document.getElementById("dashboardSection").classList.remove("d-none");

            // Load dashboard data
            loadDashboardData();
            return;
        }

        try {
            // Send request to update password
            const response = await inviaRichiesta("PATCH", "/api/users/password", {
                username: userData.username,
                newPassword: newPassword,
                firstLogin: false
            });

            console.log("Password change response:", response);

            // Update firstLogin status in localStorage
            userData.firstLogin = false;
            localStorage.setItem("currentUser", JSON.stringify(userData));

            // Display user name in dashboard if element exists
            const userDisplayName = document.getElementById("userDisplayName");
            if (userDisplayName) {
                userDisplayName.textContent = userData.fullName || userData.username;
            }

            // Show success message
            if (window.Swal) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Modificata',
                    text: 'La tua password è stata modificata con successo.',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    // Hide authentication section and show dashboard
                    document.getElementById("authSection").classList.add("d-none");
                    document.getElementById("dashboardSection").classList.remove("d-none");

                    // Aggiorna le informazioni utente nella navbar
                    updateUserInfoInNavbar(userData);

                    // Load dashboard data
                    loadDashboardData();
                });
            } else {
                alert('La tua password è stata modificata con successo.');
                // Hide authentication section and show dashboard
                document.getElementById("authSection").classList.add("d-none");
                document.getElementById("dashboardSection").classList.remove("d-none");

                // Aggiorna le informazioni utente nella navbar
                updateUserInfoInNavbar(userData);

                // Load dashboard data
                loadDashboardData();
            }
        } catch (error) {
            console.error("Errore nella modifica della password:", error);
            if (passwordChangeError) {
                passwordChangeError.textContent = "Impossibile modificare la password. Riprova.";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Impossibile modificare la password. Riprova.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Impossibile modificare la password. Riprova.');
            }
        }
    }

    // Add logout functionality
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function () {
            localStorage.removeItem("currentUser");
            document.getElementById("dashboardSection").classList.add("d-none");
            document.getElementById("authSection").classList.remove("d-none");
            // Show login card and hide password change card when logging out
            document.getElementById("loginCard").classList.remove("d-none");
            document.getElementById("passwordChangeCard").classList.add("d-none");
        });
    }
    async function loadDashboardData() {
        console.log("Loading dashboard data...");
        try {
            const perizie = await loadPerizie();
            
            // Aggiorna le statistiche nella dashboard
            updateDashboardStatistics(perizie);
            
            // Carica le perizie recenti nella dashboard
            loadRecentPerizieDashboard(perizie);
        } catch (error) {
            console.error("Errore nel caricamento della dashboard:", error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Impossibile caricare i dati della dashboard',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Impossibile caricare i dati della dashboard');
            }
        }
    }

    // Aggiungi gestione dei click sui link della navbar per mostrare le sezioni appropriate
    initNavbarListeners();

    // Function to initialize the navbar links
    function initNavbarListeners() {
        const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
        navLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();

                // Rimuovi la classe active da tutti i link
                navLinks.forEach(l => l.classList.remove("active"));

                // Aggiungi la classe active a questo link
                this.classList.add("active");

                // Ottieni l'ID della sezione da mostrare
                const targetId = this.getAttribute("href").substring(1);

                // Nascondi tutte le sezioni
                document.getElementById("dashboardContent")?.classList.add("d-none");
                document.getElementById("operatori-content")?.classList.add("d-none");
                document.getElementById("perizie-content")?.classList.add("d-none");

                // Mostra la sezione appropriata
                if (targetId === "dashboard") {
                    const dashboardContent = document.getElementById("dashboardContent");
                    if (dashboardContent) {
                        dashboardContent.classList.remove("d-none");
                        // Ricarica i dati della dashboard se necessario
                        updateDashboardStatistics(window.perizie || []);
                        loadRecentPerizieDashboard(window.perizie || []);
                    }
                } else if (targetId === "operatori") {
                    document.getElementById("operatori-content")?.classList.remove("d-none");
                    // Carica i dati degli operatori
                } else if (targetId === "perizie") {
                    const perizieContent = document.getElementById("perizie-content");
                    if (perizieContent) {
                        perizieContent.classList.remove("d-none");
                        // Assicuriamoci che inizializziamo la sezione perizie
                        initPeriziePage();
                    }
                }
            });
        });
    }

    // Function to load dashboard data


    // Funzione per caricare le perizie dal server MongoDB
    async function loadPerizie() {
        console.log("Caricamento perizie dal server...");

        try {
            // Invia richiesta al server utilizzando la funzione esistente
            const response = await inviaRichiesta("GET", "/api/perizie");

            console.log("Risposta del server:", response);

            // Verifica che la risposta sia un array o un oggetto con dati
            if (Array.isArray(response)) {
                window.perizie = response;
            } else if (response && response.data) {
                window.perizie = response.data;
            } else if (response && typeof response === 'object') {
                window.perizie = [response]; // Converti oggetto singolo in array
            } else {
                throw new Error("Formato risposta non valido");
            }

            console.log(`Caricate ${window.perizie.length} perizie`);

            // Se siamo nella dashboard, aggiorna le statistiche
            if (document.getElementById('dashboardContent') &&
                !document.getElementById('dashboardContent').classList.contains('d-none')) {
                updateDashboardStatistics(window.perizie);
                loadRecentPerizieDashboard(window.perizie);
            }

            return window.perizie;
        } catch (error) {
            console.error("Errore nel caricamento delle perizie:", error);

            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Impossibile caricare i dati delle perizie dal server',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Impossibile caricare i dati delle perizie dal server');
            }

            // Inizializza con array vuoto per evitare errori
            window.perizie = [];
            return [];
        }
    }

    // Funzione per aggiornare le statistiche nella dashboard
    function updateDashboardStatistics(perizie) {
        // Totale perizie
        const totalElement = document.getElementById("totalInspections");
        if (totalElement) totalElement.textContent = perizie.length;

        // Operatori attivi (conteggio unico degli operatori)
        const operatoriUnici = [...new Set(perizie.map(p => p.operatoreId))].filter(Boolean);
        const activeElement = document.getElementById("activeUsers");
        if (activeElement) activeElement.textContent = operatoriUnici.length;

        // Totale foto
        const totaleFoto = perizie.reduce((acc, p) => {
            return acc + (p.fotografie ? p.fotografie.length : 0);
        }, 0);
        const photosElement = document.getElementById("totalPhotos");
        if (photosElement) photosElement.textContent = totaleFoto;
    }

    // Funzione per caricare le perizie recenti nella dashboard
    function loadRecentPerizieDashboard(perizie) {
        const tableBody = document.getElementById("inspectionTableBody");
        if (!tableBody) return;
    
        // Svuota la tabella
        tableBody.innerHTML = '';
    
        // Ordina le perizie per data più recenti prima (senza filtrare per operatore assegnato)
        const sortedPerizie = [...perizie]
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .slice(0, 5); // Prendi solo le prime 5
    
        if (sortedPerizie.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-3">Non ci sono perizie disponibili</td>
                </tr>
            `;
            return;
        }
    
        sortedPerizie.forEach(perizia => {
            const row = document.createElement('tr');
        
            // Format date
            const formattedDate = new Date(perizia.data).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        
            // Determine status badge
            const statusText = getStatusText(perizia.stato, perizia.operatoreId);
            const statusBadgeColor = getStatusBadgeColor(perizia.stato, perizia.operatoreId);
            const statusBadge = `<span class="badge bg-${statusBadgeColor}">${statusText}</span>`;
        
            // Count photos
            const numFoto = perizia.fotografie ? perizia.fotografie.length : 0;
        
            // RIMOSSO IL CHECKBOX TD
            row.innerHTML = `
                <td>${perizia.id}</td>
                <td>${perizia.operatore || 'N/D'}</td>
                <td>${formattedDate}</td>
                <td>${perizia.tipo || 'N/D'}</td>
                <td>${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : 'N/D'}</td>
                <td>${statusBadge}</td>
                <td>${numFoto}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-info view-inspection" data-id="${perizia.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${!perizia.operatoreId ? 
                        `<button class="btn btn-sm btn-success assign-inspection-dashboard" data-id="${perizia.id}">
                            <i class="fas fa-user-check"></i>
                        </button>` : ''}
                    <button class="btn btn-sm btn-warning edit-inspection" data-id="${perizia.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-inspection" data-id="${perizia.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        
            tableBody.appendChild(row);
        });
    
    
        // Aggiungi listener agli elementi appena creati
        document.querySelectorAll('.view-inspection').forEach(btn => {
            btn.addEventListener('click', function () {
                viewPerizia(this.getAttribute('data-id'));
            });
        });
    
        document.querySelectorAll('.edit-inspection').forEach(btn => {
            btn.addEventListener('click', function () {
                editPerizia(this.getAttribute('data-id'));
            });
        });
    
        document.querySelectorAll('.delete-inspection').forEach(btn => {
            btn.addEventListener('click', function () {
                deletePerizia(this.getAttribute('data-id'));
            });
        });
    
        // Aggiungi listener per assegnare perizia direttamente dalla dashboard
        document.querySelectorAll('.assign-inspection-dashboard').forEach(btn => {
            btn.addEventListener('click', function () {
                const periziaId = this.getAttribute('data-id');
                assignSinglePerizia(periziaId);
            });
        });
    
        // Update operators in perizia list
        updateOperatoriInPerizia(perizie);
    }

    // Funzione per popolare la lista degli operatori in perizia nella dashboard
    function updateOperatoriInPerizia(perizie) {
        // Trova il container della lista
        const operatoriList = document.getElementById("operatoriInPeriziaList");
        if (!operatoriList) return;
    
        // Svuota la lista
        operatoriList.innerHTML = "";
    
        // Filtra solo le perizie effettivamente assegnate e in corso
        const perizieAssegnate = perizie.filter(p => {
            // Verifica che ci sia un operatore assegnato E che la perizia sia attiva
            return (p.operatoreId || p.operatore) && 
                   (p.stato === 'in_progress' || p.stato === 'scheduled' || !p.stato);
        });
    
        // Crea una mappa degli operatori con le loro perizie
        const operatoriMap = new Map();
        perizieAssegnate.forEach(p => {
            const operatoreId = p.operatoreId || "unknown";
            // Verifica che l'operatore esista veramente
            if (operatoreId && operatoreId !== "unknown") {
                const operatoreNome = p.operatore || "Operatore sconosciuto";
                
                if (!operatoriMap.has(operatoreId)) {
                    operatoriMap.set(operatoreId, {
                        id: operatoreId,
                        nome: operatoreNome,
                        perizie: []
                    });
                }
                
                operatoriMap.get(operatoreId).perizie.push(p);
            }
        });
    
        // Aggiorna il contatore nel badge
        const countBadge = document.getElementById("operatoriInPeriziaCount");
        if (countBadge) {
            countBadge.textContent = operatoriMap.size;
        }
    
        // Se non ci sono operatori con perizie
        if (operatoriMap.size === 0) {
            operatoriList.innerHTML = `
                <div class="text-center py-3">
                    <i class="fas fa-info-circle me-2 text-muted"></i>
                    <span class="text-muted">Nessun operatore con perizie assegnate</span>
                </div>
            `;
            return;
        }
    
        // Converti la mappa in array e ordina per numero di perizie (decrescente)
        const operatoriArray = Array.from(operatoriMap.values())
            .filter(op => op.perizie.length > 0)  // Ulteriore filtro per sicurezza
            .sort((a, b) => b.perizie.length - a.perizie.length);
    
        // Mostra massimo 5 operatori
        const topOperatori = operatoriArray.slice(0, 5);
        
        // Crea gli elementi della lista
        topOperatori.forEach(operatore => {
            // Estrai le iniziali per l'avatar
            const nomiParts = operatore.nome.split(' ');
            let initials = '';
            if (nomiParts.length >= 2) {
                initials = `${nomiParts[0].charAt(0)}${nomiParts[1].charAt(0)}`;
            } else {
                initials = operatore.nome.substring(0, 2);
            }
            initials = initials.toUpperCase();
            
            // Genera un colore per l'avatar basato sull'ID operatore
            const avatarColor = getAvatarColor(operatore.id);
            
            // Crea l'elemento della lista
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <div class="avatar-circle ${avatarColor} text-white me-3" style="width: 35px; height: 35px; font-size: 14px; display: flex; align-items: center; justify-content: center;">${initials}</div>
                    <div>
                        <h6 class="mb-0">${operatore.nome}</h6>
                        <small class="text-muted">Perizie: ${operatore.perizie.length}</small>
                    </div>
                </div>
                <span class="badge bg-warning rounded-pill">${operatore.perizie.length}</span>
            `;
            
            operatoriList.appendChild(listItem);
        });
    }
    
    // Aggiungi questa funzione se non esiste già
    function getAvatarColor(id) {
        // Array di classi di colori Bootstrap
        const colorClasses = [
            "bg-primary", "bg-success", "bg-danger", "bg-warning", "bg-info",
            "bg-secondary", "bg-dark"
        ];
        
        // Genera un indice basato sull'ID
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Seleziona un colore dall'array
        const index = Math.abs(hash) % colorClasses.length;
        return colorClasses[index];
    }
    document.addEventListener('DOMContentLoaded', function () {
        const manageUsersBtn = document.querySelector('.btn-manage-users, #manageUsersBtn, [data-action="manage-users"]');
        if (manageUsersBtn) {
            manageUsersBtn.addEventListener('click', function (e) {
                e.preventDefault();

                // Nascondi altre sezioni
                document.getElementById('dashboardContent')?.classList.add('d-none');
                document.getElementById('perizie-content')?.classList.add('d-none');

                // Mostra la sezione operatori
                const operatoriContent = document.getElementById('operatori-content');
                if (operatoriContent) {
                    operatoriContent.classList.remove('d-none');

                    // Inizializza la sezione operatori
                    initOperatoriPage();
                }

                // Aggiorna active state nel menu
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });

                document.querySelector('a[href="#operatori"]')?.classList.add('active');
            });
        }
    });
    document.addEventListener('DOMContentLoaded', function () {
        // Cambia il titolo della sezione da "Perizie Recenti" a "Nuove Perizie"
        const recentPerizieTitle = document.querySelector('.card-header h5, .card-header .h5');
        if (recentPerizieTitle && recentPerizieTitle.textContent === "Perizie Recenti") {
            recentPerizieTitle.textContent = "Nuove Perizie";
        }
    });
    document.addEventListener('DOMContentLoaded', function () {
        const manageUsersBtn = document.querySelector('.btn-manage-users, #manageUsersBtn, [data-action="manage-users"]');
        if (manageUsersBtn) {
            manageUsersBtn.addEventListener('click', function (e) {
                e.preventDefault();

                // Nascondi altre sezioni
                document.getElementById('dashboardContent')?.classList.add('d-none');
                document.getElementById('perizie-content')?.classList.add('d-none');

                // Mostra la sezione operatori
                const operatoriContent = document.getElementById('operatori-content');
                if (operatoriContent) {
                    operatoriContent.classList.remove('d-none');

                    // Inizializza la sezione operatori
                    initOperatoriPage();
                }

                // Aggiorna active state nel menu
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });

                document.querySelector('a[href="#operatori"]')?.classList.add('active');
            });
        }
    });

    // Helpers per funzionalità relative alle perizie
    function viewPerizia(id) {
        if (!window.perizie) return;

        const perizia = window.perizie.find(p => p.id === id);
        if (!perizia) {
            console.error(`Perizia con ID ${id} non trovata`);
            return;
        }

        // Formatta la data in formato italiano
        const formattedDate = new Date(perizia.data).toLocaleString('it-IT');

        // Prepara galleria di foto se presenti
        let fotoHtml = "<p>Nessuna foto disponibile</p>";
        if (perizia.fotografie && perizia.fotografie.length > 0) {
            fotoHtml = `
                <div class="row">
                    ${perizia.fotografie.map((foto, index) => `
                        <div class="col-md-4 mb-3">
                            <img src="${foto.url}" class="img-fluid img-thumbnail" alt="Foto ${index + 1}" onerror="this.src='https://via.placeholder.com/300x200?text=Anteprima+non+disponibile'">
                            <p class="small mt-1">${foto.commento || ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Visualizza la modal con i dettagli della perizia
        if (window.Swal) {
            Swal.fire({
                title: `Perizia ${perizia.id}`,
                html: `
                    <div class="text-start">
                        <p><strong>Tipo:</strong> ${perizia.tipo ? (perizia.tipo.charAt(0).toUpperCase() + perizia.tipo.slice(1)) : 'N/D'}</p>
                        <p><strong>Operatore:</strong> ${perizia.operatore || 'N/D'} ${perizia.operatoreId ? `(ID: ${perizia.operatoreId})` : ''}</p>
                        <p><strong>Data:</strong> ${formattedDate}</p>
                        <p><strong>Indirizzo:</strong> ${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : 'N/D'}</p>
                        <p><strong>Coordinate:</strong> ${perizia.posizione ? `${perizia.posizione.lat || 'N/D'}, ${perizia.posizione.lng || 'N/D'}` : 'N/D'}</p>
                        <p><strong>Descrizione:</strong> ${perizia.descrizione || 'N/D'}</p>
                        <p><strong>Cliente:</strong> ${perizia.cliente ? `${perizia.cliente.nome || 'N/D'} (${perizia.cliente.contatto || 'N/D'})` : 'N/D'}</p>
                        <p><strong>Polizza:</strong> ${perizia.polizza || 'N/D'}</p>
                        <h5 class="mt-4">Fotografie (${perizia.fotografie ? perizia.fotografie.length : 0})</h5>
                        ${fotoHtml}
                    </div>
                `,
                width: 800,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Chiudi'
            });
        } else {
            alert(`Perizia ${perizia.id} - Per visualizzare tutti i dettagli, assicurati che SweetAlert2 sia caricato.`);
        }
    }

    function isUserAdmin() {
        const userData = JSON.parse(localStorage.getItem("currentUser"));
        return userData && userData.role === 'admin';
    }
    document.addEventListener('DOMContentLoaded', function() {
        // Migliora il comportamento del toggler navbar
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (navbarToggler && navbarCollapse) {
          navbarToggler.addEventListener('click', function() {
            // Attende che il collasso sia completato prima di aggiustare layout
            setTimeout(function() {
              // Assicurati che gli elementi utente siano visibili e ben posizionati
              const userInfoContainer = document.querySelector('.user-info-container');
              if (userInfoContainer) {
                if (navbarCollapse.classList.contains('show')) {
                  userInfoContainer.style.marginTop = '10px';
                } else {
                  userInfoContainer.style.marginTop = '0';
                }
              }
            }, 350);
          });
        }
      });

    // Funzione per verificare i permessi prima di eseguire un'azione riservata agli admin
    function checkAdminPermission() {
        if (!isUserAdmin()) {
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Permesso negato',
                    text: 'Questa operazione può essere eseguita solo da un amministratore',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Permesso negato. Questa operazione può essere eseguita solo da un amministratore');
            }
            return false;
        }
        return true;
    }
    async function assignSinglePerizia(periziaId) {
        try {
            if (!checkAdminPermission()) return;

            const perizia = window.perizie.find(p => p.id === periziaId);
            if (!perizia) {
                throw new Error('Perizia non trovata');
            }

            if (perizia.operatoreId || perizia.operatore) {
                if (window.Swal) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Perizia già assegnata',
                        text: 'Questa perizia è già stata assegnata a un operatore'
                    });
                }
                return;
            }

            // Recupera gli operatori
            const operatori = await inviaRichiesta("GET", "/api/users");
            const operatoriAttivi = operatori.filter(op => op.role !== 'admin');

            if (operatoriAttivi.length === 0) {
                if (window.Swal) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Nessun operatore',
                        text: 'Non ci sono operatori disponibili per l\'assegnazione'
                    });
                }
                return;
            }

            // Crea le opzioni per il select
            const operatoriOptions = operatoriAttivi.map(op =>
                `<option value="${op.username}">${op.firstName || ''} ${op.lastName || ''} (${op.username})</option>`
            ).join('');

            // Mostra il dialog di selezione operatore
            if (window.Swal) {
                const result = await Swal.fire({
                    title: `Assegna Perizia ${perizia.id}`,
                    html: `
                        <p>Seleziona l'operatore a cui assegnare questa perizia:</p>
                        <select id="singleOperatorSelect" class="form-select">
                            <option value="">-- Seleziona un operatore --</option>
                            ${operatoriOptions}
                        </select>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Assegna',
                    cancelButtonText: 'Annulla',
                    preConfirm: () => {
                        const operatorId = document.getElementById('singleOperatorSelect').value;
                        if (!operatorId) {
                            Swal.showValidationMessage('Devi selezionare un operatore');
                            return false;
                        }
                        return operatorId;
                    }
                });

                if (result.isConfirmed && result.value) {
                    const operatoreId = result.value;
                    const operatore = operatori.find(op => op.username === operatoreId);

                    // Mostra il loader
                    Swal.fire({
                        title: 'Assegnazione in corso...',
                        html: 'Attendere prego',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    // Prepara i dati per l'aggiornamento
                    const updateData = {
                        operatoreId: operatore.username,
                        operatore: `${operatore.firstName || ''} ${operatore.lastName || ''}`.trim() || operatore.username
                    };

                    // Aggiorna la perizia
                    await inviaRichiesta("PATCH", `/api/perizie/${periziaId}`, updateData);

                    // Aggiorna i dati locali
                    await loadPerizie();

                    // Aggiorna l'interfaccia utente
                    loadRecentPerizieDashboard(window.perizie);

                    // Mostra messaggio di successo
                    Swal.fire({
                        icon: 'success',
                        title: 'Perizia Assegnata',
                        text: `La perizia è stata assegnata con successo a ${updateData.operatore}`
                    });
                }
            }
        } catch (error) {
            console.error("Errore nell'assegnazione della perizia:", error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: `Impossibile assegnare la perizia: ${error.message}`
                });
            }
        }
    }

    // Funzione per modificare una perizia


    // Set up event listeners for the navigation links
    const perizieNavLink = document.querySelector('a[href="#perizie"]');
    if (perizieNavLink) {
        console.log("Trovato link perizie, aggiungo event listener");
        perizieNavLink.addEventListener('click', function (e) {
            e.preventDefault();
            console.log("Click su link perizie");

            // Verifica esistenza elementi necessari
            const dashboardContent = document.getElementById('dashboardContent');
            const gestioneUtentiContent = document.getElementById('gestione-utenti-content');
            const perizieContent = document.getElementById('perizie-content');

            if (!perizieContent) {
                console.error("Elemento perizie-content non trovato");
                if (window.Swal) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore',
                        text: 'Sezione perizie non disponibile',
                        confirmButtonColor: '#3085d6'
                    });
                } else {
                    alert('Sezione perizie non disponibile');
                }
                return;
            }

            // Nascondi altri contenuti e mostra sezione perizie
            if (dashboardContent) dashboardContent.classList.add('d-none');
            if (gestioneUtentiContent) gestioneUtentiContent.classList.add('d-none');
            perizieContent.classList.remove('d-none');

            // Carica dati perizie se non già caricato
            initPeriziePage();
        });
    } else {
        console.warn("Link perizie non trovato nel DOM");
    }

    const operatoriNavLink = document.querySelector('a[href="#operatori"]');
    if (operatoriNavLink) {
        console.log("Trovato link operatori, aggiungo event listener");
        operatoriNavLink.addEventListener('click', function (e) {
            e.preventDefault();
            console.log("Click su link operatori");

            // Nascondi altri contenuti
            const dashboardContent = document.getElementById('dashboardContent');
            const perizieContent = document.getElementById('perizie-content');

            if (dashboardContent) dashboardContent.classList.add('d-none');
            if (perizieContent) perizieContent.classList.add('d-none');

            // Inizializza la sezione operatori
            initOperatoriPage();
        });
    } else {
        console.warn("Link operatori non trovato nel DOM");
    }

    // Funzioni per la sezione perizie
    // Function to initialize the perizie page with the new workflow
async function initPeriziePage() {
    console.log("Inizializzazione pagina perizie...");
    
    // Create perizie table if it doesn't exist
    if (!document.getElementById('perizieTable')) {
        createPerizieTable();
    }
    
    // Add "Create New Perizia" button if it doesn't exist
    if (!document.getElementById('createNewPerizia')) {
        const buttonContainer = document.querySelector('.perizie-filters');
        if (buttonContainer) {
            const createButton = document.createElement('button');
            createButton.id = 'createNewPerizia';
            createButton.className = 'btn btn-success ms-2';
            createButton.innerHTML = '<i class="fas fa-plus me-1"></i>Nuova Perizia';
            createButton.addEventListener('click', createNewPerizia);
            buttonContainer.appendChild(createButton);
        }
    }
    
    // Load perizie from the server
    await loadPerizie();
    
    // Initialize map
    initPerizieMappa();
    
    // Populate the operator filter dropdown
    populateOperatorFilter();
    
    // Load perizie into table
    loadPerizieTable();
    
    // Update counters
    updatePerizieCounts();
    
    // Initialize filter listeners
    initFilterListeners();
}
    // Nuova funzione per creare la tabella delle perizie se non esiste
    function createPerizieTable() {
        console.log("Inizializzazione tabella perizie");
        
        // Controlliamo che l'elemento table body esista già
        const tableBody = document.getElementById('perizieTableBody');
        if (!tableBody) {
            console.error("Elemento perizieTableBody non trovato");
            return;
        }
        
        // Svuota solo il body della tabella
        tableBody.innerHTML = '';
        
        // Configura i controlli di selezione
        const selectAllCheckbox = document.getElementById('selectAllInspections');
        const headerCheckbox = document.getElementById('headerCheckbox');
        const deleteSelectedBtn = document.getElementById('deleteSelectedInspections');
        
        if (selectAllCheckbox && headerCheckbox) {
            // Assicurati che entrambi i checkbox si comportino allo stesso modo
            selectAllCheckbox.addEventListener('change', function() {
                headerCheckbox.checked = this.checked;
                toggleAllCheckboxes(this.checked);
            });
            
            headerCheckbox.addEventListener('change', function() {
                selectAllCheckbox.checked = this.checked;
                toggleAllCheckboxes(this.checked);
            });
        }
        
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', function() {
                deleteSelectedPerizie();
            });
        }
        
        // Aggiungi event listener per la selezione
        setupPerizieButtons();
    }
    // Funzione per inizializzare la mappa delle perizie
    function initPerizieMappa() {
        console.log("Inizializzazione mappa perizie");
    
        // Verifica che Leaflet sia caricato e che il container della mappa esista
        if (typeof L === 'undefined') {
            console.error("Leaflet non è disponibile");
            return;
        }
    
        const mappaContainer = document.getElementById('perizieMappa');
        if (!mappaContainer) {
            console.error("Container mappa non esiste nel DOM");
            return;
        }
    
        try {
            // Elimina la mappa esistente se presente
            if (window.perizieMap) {
                window.perizieMap.remove();
            }
    
            // Coordinate di Bra, Italia come posizione della sede aziendale
            const sedeCoords = [44.7005, 7.8472];
    
            // Inizializza la mappa centrata su Bra con zoom appropriato per la città
            window.perizieMap = L.map('perizieMappa').setView(sedeCoords, 17);
    
            // Aggiungi il layer di OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(window.perizieMap);
    
            // Aggiorna le dimensioni della mappa
            setTimeout(() => {
                if (window.perizieMap) {
                    window.perizieMap.invalidateSize();
                }
            }, 300);
    
            // Aggiungi marker per la sede dell'azienda con stile personalizzato
            const sedeMarker = L.marker(sedeCoords, {
                icon: L.divIcon({
                    className: 'sede-marker',
                    html: `<div style="background-color: #e74c3c; width: 24px; height: 24px; border-radius: 50%; 
                           border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(window.perizieMap);
    
            // Aggiungi popup informativo sulla sede che si apre automaticamente
            sedeMarker.bindPopup(`
                <div class="map-popup">
                    <h5><i class="fas fa-building me-2"></i>Sede Aziendale</h5>
                    <p><strong>Indirizzo:</strong> Via Roma 123, Bra (CN)</p>
                    <p><strong>Telefono:</strong> +39 0172 123456</p>
                    <p class="small text-muted mb-0">Sede centrale operativa</p>
                </div>
            `).openPopup();
    
            // Aggiungi marker per ogni perizia
            const markers = [sedeMarker]; // Inizia l'array con il marker della sede
    
            // Verifica che perizie sia stato caricato
            if (window.perizie && window.perizie.length > 0) {
                const showOnlyActiveCheckbox = document.getElementById('showOnlyActiveInspections');
                const showOnlyActive = showOnlyActiveCheckbox ? showOnlyActiveCheckbox.checked : false;
    
                window.perizie.forEach(perizia => {
                    // Se l'opzione "solo perizie attive" è selezionata, filtra per stato
                    if (showOnlyActive && perizia.stato !== 'pending' && perizia.stato !== 'in_progress') {
                        return;
                    }
    
                    // Verifica che la perizia abbia coordinate valide
                    if (perizia.posizione && perizia.posizione.lat && perizia.posizione.lng) {
                        // Crea il marker
                        const marker = L.marker([perizia.posizione.lat, perizia.posizione.lng]).addTo(window.perizieMap);
    
                        // Aggiungi popup con informazioni
                        marker.bindPopup(`
                            <div class="map-popup">
                                <h5>${perizia.id}</h5>
                                <p><strong>Operatore:</strong> ${perizia.operatore || 'N/D'}</p>
                                <p><strong>Indirizzo:</strong> ${perizia.posizione.indirizzo || 'N/D'}</p>
                                <div class="text-center mt-2">
                                    <button class="btn btn-sm btn-primary view-perizia-map" data-id="${perizia.id}">
                                        <i class="fas fa-eye me-1"></i> Dettagli
                                    </button>
                                </div>
                            </div>
                        `);
    
                        markers.push(marker);
                    }
                });
    
                // Se ci sono marker oltre alla sede, adatta la vista per mostrarli tutti
                if (markers.length > 1) {
                    const group = new L.featureGroup(markers);
                    window.perizieMap.fitBounds(group.getBounds(), { padding: [50, 50] });
                }
            }
    
            // Aggiungi listener per la vista dei dettagli della perizia
            window.perizieMap.on('popupopen', function () {
                document.querySelectorAll('.view-perizia-map').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const periziaId = this.getAttribute('data-id');
                        viewPerizia(periziaId);
                    });
                });
            });
    
        } catch (error) {
            console.error("Errore nell'inizializzazione della mappa:", error);
            mappaContainer.innerHTML = `
                <div class="alert alert-danger">
                    Errore nell'inizializzazione della mappa: ${error.message}
                </div>
            `;
        }
    }

    // Funzione per aggiornare i contatori delle perizie
    function updatePerizieCounts() {
        if (!window.perizie) return;

        const totalElement = document.getElementById('perizieTotali');
        const totalFooterElement = document.getElementById('perizieTotaliFooter');
        const visualizzateElement = document.getElementById('perizieVisualizzate');

        if (totalElement) totalElement.textContent = window.perizie.length;
        if (totalFooterElement) totalFooterElement.textContent = window.perizie.length;
        if (visualizzateElement) visualizzateElement.textContent = window.perizie.length;
    }

    // Funzione per popolare i filtri degli operatori
    function populateOperatorFilter() {
        console.log("Popolamento filtro operatori");
        
        if (!window.perizie) {
            console.warn("Nessuna perizia disponibile per popolare il filtro operatori");
            return;
        }
    
        const filterSelect = document.getElementById('filterOperator');
        if (!filterSelect) {
            console.warn("Elemento filterOperator non trovato nel DOM");
            return;
        }
    
        // Svuota il select tranne l'opzione "Tutti gli operatori"
        while (filterSelect.options.length > 1) {
            filterSelect.remove(1);
        }
    
        // Estrai operatori unici (solo quelli che hanno effettivamente un nome)
        const operatori = [...new Set(window.perizie
            .map(p => p.operatore)
            .filter(Boolean)
        )];
        
        console.log(`Trovati ${operatori.length} operatori unici`);
    
        // Aggiungi le opzioni
        operatori.forEach(operatore => {
            const option = document.createElement('option');
            option.value = operatore;
            option.textContent = operatore;
            filterSelect.appendChild(option);
        });
    }

    // Funzione per impostare i listener dei filtri
    function initFilterListeners() {
        const applyFilters = document.getElementById('applyFilters');
        const resetFilters = document.getElementById('resetFilters');

        // Removed state filter code here
        
        if (applyFilters) {
            applyFilters.addEventListener('click', function () {
                applyFiltersToPerizie();
            });
        }

        if (resetFilters) {
            resetFilters.addEventListener('click', function () {
                // Reset filtri
                const filterOperator = document.getElementById('filterOperator');
                const filterDate = document.getElementById('filterDate');
                // State filter reference removed

                if (filterOperator) filterOperator.value = '';
                if (filterDate) filterDate.value = '';
                // State filter reset removed

                // Ricarica tutte le perizie
                loadPerizieTable();
            });
        }

        // Event listener for individual filters
        document.getElementById('filterOperator')?.addEventListener('change', applyFiltersToPerizie);
        document.getElementById('filterDate')?.addEventListener('change', applyFiltersToPerizie);
        // State filter event listener removed
    }

    // Funzione aggiornata per applicare filtri alle perizie
    function applyFiltersToPerizie() {
        console.log("Applicazione filtri alle perizie");
        
        if (!window.perizie) {
            console.warn("Nessuna perizia disponibile per applicare i filtri");
            return;
        }
    
        const filterOperator = document.getElementById('filterOperator');
        const filterDate = document.getElementById('filterDate');
        
        let filteredPerizie = [...window.perizie];
        console.log(`Totale perizie prima del filtro: ${filteredPerizie.length}`);
    
        // Filtra per operatore se selezionato
        if (filterOperator && filterOperator.value) {
            console.log(`Filtro per operatore: ${filterOperator.value}`);
            filteredPerizie = filteredPerizie.filter(p => 
                p.operatore && p.operatore === filterOperator.value
            );
            console.log(`Perizie dopo filtro operatore: ${filteredPerizie.length}`);
        }
    
        // Filtra per data se selezionata
        if (filterDate && filterDate.value) {
            console.log(`Filtro per data: ${filterDate.value}`);
            const selectedDate = new Date(filterDate.value);
            selectedDate.setHours(0, 0, 0, 0);
    
            filteredPerizie = filteredPerizie.filter(p => {
                if (!p.data) return false;
                const periziaDate = new Date(p.data);
                periziaDate.setHours(0, 0, 0, 0);
                return periziaDate.getTime() === selectedDate.getTime();
            });
            console.log(`Perizie dopo filtro data: ${filteredPerizie.length}`);
        }
    
        // Aggiorna il contatore delle visualizzate
        const visualizzateElement = document.getElementById('perizieVisualizzate');
        if (visualizzateElement) {
            visualizzateElement.textContent = filteredPerizie.length;
        }
    
        // Carica la tabella con le perizie filtrate
        loadPerizieTable(filteredPerizie);
    }


    // Funzione per eliminare perizie dal database
    window.deletePerizieByIds = async function (ids) {
        try {
            const response = await inviaRichiesta("DELETE", "/api/perizie", { ids });
            if (response && response.success) {
                // Ricarica le perizie dopo l'eliminazione
                await loadPerizie();
                loadPerizieTable();
                updatePerizieCounts();

                if (window.Swal) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminazione completata',
                        text: 'Perizie eliminate con successo',
                        confirmButtonColor: '#3085d6'
                    });
                }
            }
        } catch (error) {
            console.error("Errore nell'eliminazione delle perizie:", error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: `Impossibile eliminare le perizie: ${error.message}`,
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert(`Impossibile eliminare le perizie: ${error.message}`);
            }
        }
    }

    // Funzione per gestire i bottoni delle perizie
    function setupPerizieButtons() {
        // Gestione bottone per assegnare perizie selezionate
        const assignBtn = document.getElementById('assignSelectedInspections');
        if (assignBtn) {
            assignBtn.addEventListener('click', function () {
                assignSelectedPerizie();
            });
        }

        // Gestione bottone per eliminare perizie selezionate
        const deleteBtn = document.getElementById('deleteSelectedInspections');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                deleteSelectedPerizie();
            });
        }

        // Gestione checkbox "seleziona tutti"
        const selectAllCheckbox = document.getElementById('selectAllInspections');
        const headerCheckbox = document.getElementById('headerCheckbox');

        if (selectAllCheckbox && headerCheckbox) {
            // Assicurati che entrambi i checkbox si comportino allo stesso modo
            selectAllCheckbox.addEventListener('change', function () {
                headerCheckbox.checked = this.checked;
                toggleAllCheckboxes(this.checked);
            });

            headerCheckbox.addEventListener('change', function () {
                selectAllCheckbox.checked = this.checked;
                toggleAllCheckboxes(this.checked);
            });
        }
    }

    // Function to toggle all checkboxes
    function toggleAllCheckboxes(checked) {
        document.querySelectorAll('.inspection-select').forEach(checkbox => {
            checkbox.checked = checked;
        });
        updateSelectedCount();
    }
    // Aggiungere questo codice alla fine del file, prima della chiusura della funzione window.onload

    // Funzione per gestire il click su "Vedi Tutte" nelle perizie in corso
    document.addEventListener('DOMContentLoaded', function () {
        // Gestione pulsante "Vedi Tutte" delle perizie in corso
        const vediTutteBtn = document.querySelector('.card-header.bg-warning + .card-body + .card-footer .btn-outline-warning');
        if (vediTutteBtn) {
            vediTutteBtn.addEventListener('click', function (e) {
                e.preventDefault();
                mostrarePerizieCorseSweetAlert();
            });
        }

        // Cambia il titolo della card degli operatori attivi
        const operatoriAttiviTitle = document.querySelector('.card-header.bg-success .d-flex div');
        if (operatoriAttiviTitle && operatoriAttiviTitle.textContent.includes('Operatori Attivi')) {
            operatoriAttiviTitle.innerHTML = '<i class="fas fa-user-check me-2"></i>Operatori in Perizia';
        }

        // Gestione pulsante "Gestisci operatori"
        const gestisciOperatoriBtn = document.querySelector('[data-action="manage-users"], .btn-manage-users');
        if (gestisciOperatoriBtn) {
            gestisciOperatoriBtn.addEventListener('click', function (e) {
                e.preventDefault();

                // Nascondi altre sezioni
                document.getElementById('dashboardContent')?.classList.add('d-none');
                document.getElementById('perizie-content')?.classList.add('d-none');

                // Mostra la sezione operatori
                const operatoriContent = document.getElementById('operatori-content');
                if (operatoriContent) {
                    operatoriContent.classList.remove('d-none');

                    // Inizializza la sezione operatori
                    initOperatoriPage();
                }

                // Aggiorna active state nel menu
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });

                document.querySelector('a[href="#operatori"]')?.classList.add('active');
            });
        }
    });

    // Funzione per mostrare le perizie in corso nella SweetAlert
    function mostrarePerizieCorseSweetAlert() {
        // Verificare che le perizie siano caricate
        if (!window.perizie || !Array.isArray(window.perizie)) {
            console.error("Perizie non disponibili");
            if (window.Swal) {
                Swal.fire({
                    icon: 'info',
                    title: 'Informazione',
                    text: 'Nessuna perizia disponibile al momento.'
                });
            }
            return;
        }

        // Filtra solo le perizie assegnate (che hanno operatoreId o operatore)
        const perizieAssegnate = window.perizie.filter(p => p.operatoreId || p.operatore);

        if (perizieAssegnate.length === 0) {
            if (window.Swal) {
                Swal.fire({
                    icon: 'info',
                    title: 'Informazione',
                    text: 'Non ci sono perizie assegnate al momento.'
                });
            }
            return;
        }

        // Ordina per data più recente
        const perizieSorted = [...perizieAssegnate].sort((a, b) =>
            new Date(b.data).getTime() - new Date(a.data).getTime()
        );

        // Prepara l'HTML per la tabella delle perizie
        let tableHTML = `
        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Operatore</th>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Indirizzo</th>
                        <th>Stato</th>
                    </tr>
                </thead>
                <tbody>
    `;

        perizieSorted.forEach(perizia => {
            const formattedDate = new Date(perizia.data).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const statusText = getStatusText(perizia.stato, perizia.operatoreId);
            const statusBadgeColor = getStatusBadgeColor(perizia.stato, perizia.operatoreId);

            tableHTML += `
            <tr>
                <td>${perizia.id}</td>
                <td>${perizia.operatore || 'N/D'}</td>
                <td>${formattedDate}</td>
                <td>${perizia.tipo || 'N/D'}</td>
                <td>${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo.split(',')[0] : 'N/D'}</td>
                <td><span class="badge bg-${statusBadgeColor}">${statusText}</span></td>
            </tr>
        `;
        });

        tableHTML += `
                </tbody>
            </table>
        </div>
    `;

        // Mostra la SweetAlert con le perizie
        if (window.Swal) {
            Swal.fire({
                title: 'Perizie in Corso',
                html: tableHTML,
                width: 900,
                confirmButtonText: 'Chiudi',
                confirmButtonColor: '#3085d6'
            });
        }
    }
    // Add event listener for the "Visualizza Operatori" button
    document.getElementById("visualizzaOperatori")?.addEventListener("click", function() {
        // Hide other sections first
        document.getElementById('dashboardContent')?.classList.add('d-none');
        document.getElementById('perizie-content')?.classList.add('d-none');
        
        // Show operators section and initialize it
        const operatoriContent = document.getElementById('operatori-content');
        if (operatoriContent) {
            operatoriContent.classList.remove('d-none');
            
            // Initialize the operators page
            initOperatoriPage();
            
            // Update active state in navbar
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector('a[href="#operatori"]')?.classList.add('active');
        }
    });

    // Aggiungere questo codice alla fine del file, prima della chiusura della funzione window.onload

// Funzione per gestire il click su "Vedi Tutte" nelle perizie in corso
document.addEventListener('DOMContentLoaded', function() {
    // Gestione pulsante "Vedi Tutte" delle perizie in corso
    const vediTutteBtn = document.querySelector('.card-header.bg-warning + .card-body + .card-footer .btn-outline-warning');
    if (vediTutteBtn) {
        vediTutteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarePerizieCorseSweetAlert();
        });
    }
    
    // Cambia il titolo della card degli operatori attivi
    const operatoriAttiviTitle = document.querySelector('.card-header.bg-success .d-flex div');
    if (operatoriAttiviTitle && operatoriAttiviTitle.textContent.includes('Operatori Attivi')) {
        operatoriAttiviTitle.innerHTML = '<i class="fas fa-user-check me-2"></i>Operatori in Perizia';
    }
    
    // Gestione pulsante "Gestisci operatori"
    const gestisciOperatoriBtn = document.querySelector('[data-action="manage-users"], .btn-manage-users');
    if (gestisciOperatoriBtn) {
        gestisciOperatoriBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Nascondi altre sezioni
            document.getElementById('dashboardContent')?.classList.add('d-none');
            document.getElementById('perizie-content')?.classList.add('d-none');
            
            // Mostra la sezione operatori
            const operatoriContent = document.getElementById('operatori-content');
            if (operatoriContent) {
                operatoriContent.classList.remove('d-none');
                
                // Inizializza la sezione operatori
                initOperatoriPage();
            }
            
            // Aggiorna active state nel menu
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            document.querySelector('a[href="#operatori"]')?.classList.add('active');
        });
    }
});

// Funzione per mostrare le perizie in corso nella SweetAlert
function mostrarePerizieCorseSweetAlert() {
    // Verificare che le perizie siano caricate
    if (!window.perizie || !Array.isArray(window.perizie)) {
        console.error("Perizie non disponibili");
        if (window.Swal) {
            Swal.fire({
                icon: 'info',
                title: 'Informazione',
                text: 'Nessuna perizia disponibile al momento.'
            });
        }
        return;
    }
    
    // Filtra solo le perizie assegnate (che hanno operatoreId o operatore)
    const perizieAssegnate = window.perizie.filter(p => p.operatoreId || p.operatore);
    
    if (perizieAssegnate.length === 0) {
        if (window.Swal) {
            Swal.fire({
                icon: 'info',
                title: 'Informazione',
                text: 'Non ci sono perizie assegnate al momento.'
            });
        }
        return;
    }
    
    // Ordina per data più recente
    const perizieSorted = [...perizieAssegnate].sort((a, b) => 
        new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    
    // Prepara l'HTML per la tabella delle perizie
    let tableHTML = `
        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Operatore</th>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Indirizzo</th>
                        <th>Stato</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    perizieSorted.forEach(perizia => {
        const formattedDate = new Date(perizia.data).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusText = getStatusText(perizia.stato, perizia.operatoreId);
        const statusBadgeColor = getStatusBadgeColor(perizia.stato, perizia.operatoreId);
        
        tableHTML += `
            <tr>
                <td>${perizia.id}</td>
                <td>${perizia.operatore || 'N/D'}</td>
                <td>${formattedDate}</td>
                <td>${perizia.tipo || 'N/D'}</td>
                <td>${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo.split(',')[0] : 'N/D'}</td>
                <td><span class="badge bg-${statusBadgeColor}">${statusText}</span></td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    // Mostra la SweetAlert con le perizie
    if (window.Swal) {
        Swal.fire({
            title: 'Perizie in Corso',
            html: tableHTML,
            width: 900,
            confirmButtonText: 'Chiudi',
            confirmButtonColor: '#3085d6'
        });
    }
}

// Modifica alla funzione displayOperatori per mostrare solo operatori con perizie in corso

    
}


// Add custom styles for maps and markers
const customStyles = document.createElement('style');
customStyles.textContent = `
        #perizieMappa, #inspectionMap {
            height: 400px;
            width: 100%;
        }
        
        .marker-pin {
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            position: relative;
            transform: rotate(-45deg);
            margin: -15px 0 0 -15px;
        }
        
        .bg-green { background-color: #28a745; }
        .bg-orange { background-color: #ffc107; }
        .bg-blue { background-color: #3498db; }
        
        .loading-spinner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 20px;
            border-radius: 5px;
        }
        
        .map-popup h5 {
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .map-popup p {
            margin-bottom: 4px;
            font-size: 14px;
        }
        
        .avatar-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }
        
        @media (max-width: 768px) {
            .avatar-circle {
                width: 28px;
                height: 28px;
                font-size: 12px;
            }
        }
    `;
document.head.appendChild(customStyles);

// Verificare che il contenitore perizie-content esista, altrimenti crearlo
const dashboardSection = document.getElementById('dashboardSection');
if (dashboardSection) {
    dashboardSection.appendChild(perizieContentDiv);
}
// Login form submit handler
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;
        login(username, password);
    });
}

// Password change form submit handler
const passwordChangeForm = document.getElementById("passwordChangeForm");
if (passwordChangeForm) {
    passwordChangeForm.addEventListener("submit", function (e) {
        e.preventDefault();
        changePassword();
    });
}

// Fallback per la funzione inviaRichiesta se non esiste
if (typeof inviaRichiesta !== 'function') {
    window.inviaRichiesta = async function (method, url, parameters = {}) {
        let options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
        };

        if (method.toUpperCase() != "GET") {
            options.body = JSON.stringify(parameters);
        } else if (Object.keys(parameters).length > 0) {
            const queryString = Object.entries(parameters)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&');
            url = `${url}?${queryString}`;
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        if (response.headers.get("content-type")?.includes("application/json")) {
            return response.json();
        }

        return response.text();
    };
}

async function login(username, password) {
    if (!username || !password) {
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Inserire username e password',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert('Inserire username e password');
        }
        return;
    }

    try {
        const response = await inviaRichiesta("GET", "/api/login", { username, password });

        if (response && response.length > 0) {
            // Clear any existing user data first
            localStorage.removeItem("currentUser");

            // Store user data in localStorage
            const userData = {
                username: response[0].username,
                firstName: response[0].firstName || "",
                lastName: response[0].lastName || "",
                fullName: `${response[0].firstName || ""} ${response[0].lastName || ""}`.trim(),
                role: response[0].role || "user",
                loginTime: new Date().getTime(),
                firstLogin: response[0].firstLogin || false
            };

            localStorage.setItem("currentUser", JSON.stringify(userData));

            // Check if it's first login - only show password change if firstLogin is true
            if (userData.firstLogin === true) {
                console.log("First-time login detected, showing password change form");
                // Show password change form
                document.getElementById("loginCard").classList.add("d-none");
                document.getElementById("passwordChangeCard").classList.remove("d-none");
            } else {
                console.log("Regular login, proceeding to dashboard");

                // Hide authentication section and show dashboard
                document.getElementById("authSection").classList.add("d-none");
                document.getElementById("dashboardSection").classList.remove("d-none");

                // Aggiorna le informazioni utente nella navbar
                updateUserInfoInNavbar(userData);

                // Load dashboard data
                loadDashboardData();
            }
        } else {
            throw new Error("Invalid credentials");
        }
    } catch (error) {
        console.error("Errore nel login:", error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Accesso negato',
                text: 'Credenziali non valide. Riprova.',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert('Credenziali non valide. Riprova.');
        }
    }
}

// Nuova funzione per aggiornare le informazioni utente nella navbar
function updateUserInfoInNavbar(userData) {
    // Aggiorna le iniziali dell'utente
    const userInitials = document.getElementById('userInitials');
    if (userInitials) {
        userInitials.textContent = userData.firstName.charAt(0) || userData.username.charAt(0);
    }

    // Aggiorna il nome dell'utente
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName) {
        userDisplayName.textContent = userData.fullName || userData.username;
    }

    // Aggiorna il ruolo dell'utente
    const userRole = document.getElementById('userRole');
    if (userRole) {
        userRole.textContent = userData.role === 'admin' ? 'Amministratore' : 'Operatore';
    }

    // Aggiungi funzionalità al pulsante di logout
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function () {
            localStorage.removeItem("currentUser");
            document.getElementById("dashboardSection").classList.add("d-none");
            document.getElementById("authSection").classList.remove("d-none");
            // Show login card and hide password change card when logging out
            document.getElementById("loginCard").classList.remove("d-none");
            document.getElementById("passwordChangeCard").classList.add("d-none");
        });
    }
}

// Function to handle password change for first-time login
async function changePassword() {
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const passwordChangeError = document.getElementById("passwordChangeError");

    // Clear previous error
    if (passwordChangeError) {
        passwordChangeError.classList.add("d-none");
    }

    // Basic validation
    if (!newPassword || !confirmPassword) {
        if (passwordChangeError) {
            passwordChangeError.textContent = "Tutti i campi sono obbligatori";
            passwordChangeError.classList.remove("d-none");
        } else if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Tutti i campi sono obbligatori',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert('Tutti i campi sono obbligatori');
        }
        return;
    }

    if (newPassword !== confirmPassword) {
        if (passwordChangeError) {
            passwordChangeError.textContent = "Le password non coincidono";
            passwordChangeError.classList.remove("d-none");
        } else if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Le password non coincidono',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert('Le password non coincidono');
        }
        return;
    }

    // Get current user from localStorage
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (!userData || !userData.username) {
        if (passwordChangeError) {
            passwordChangeError.textContent = "Sessione scaduta. Effettua di nuovo il login.";
            passwordChangeError.classList.remove("d-none");
        } else if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Sessione scaduta. Effettua di nuovo il login.',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert('Sessione scaduta. Effettua di nuovo il login.');
        }
        return;
    }

    // Skip password change if firstLogin is false
    if (userData.firstLogin === false) {
        console.log("Password change skipped, firstLogin is false");

        // Hide authentication section and show dashboard directly
        document.getElementById("authSection").classList.add("d-none");
        document.getElementById("dashboardSection").classList.remove("d-none");

        // Load dashboard data
        loadDashboardData();
        return;
    }

    try {
        // Send request to update password
        const response = await inviaRichiesta("PATCH", "/api/users/password", {
            username: userData.username,
            newPassword: newPassword,
            firstLogin: false
        });

        console.log("Password change response:", response);

        // Update firstLogin status in localStorage
        userData.firstLogin = false;
        localStorage.setItem("currentUser", JSON.stringify(userData));

        // Display user name in dashboard if element exists
        const userDisplayName = document.getElementById("userDisplayName");
        if (userDisplayName) {
            userDisplayName.textContent = userData.fullName || userData.username;
        }

        // Show success message
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Password Modificata',
                text: 'La tua password è stata modificata con successo.',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                // Hide authentication section and show dashboard
                document.getElementById("authSection").classList.add("d-none");
                document.getElementById("dashboardSection").classList.remove("d-none");

                // Aggiorna le informazioni utente nella navbar
                updateUserInfoInNavbar(userData);

                // Load dashboard data
                loadDashboardData();
            });
        } else {
            alert('La tua password è stata modificata con successo.');
            // Hide authentication section and show dashboard
            document.getElementById("authSection").classList.add("d-none");
            document.getElementById("dashboardSection").classList.remove("d-none");

            // Aggiorna le informazioni utente nella navbar
            updateUserInfoInNavbar(userData);

            // Load dashboard data
            loadDashboardData();
        }
    } catch (error) {
        console.error("Errore nella modifica della password:", error);
        if (passwordChangeError) {
            passwordChangeError.textContent = "Impossibile modificare la password. Riprova.";
            passwordChangeError.classList.remove("d-none");
        } else if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Impossibile modificare la password. Riprova.',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert('Impossibile modificare la password. Riprova.');
        }
    }
}

// Add logout functionality
const btnLogout = document.getElementById("btnLogout");
if (btnLogout) {
    btnLogout.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        document.getElementById("dashboardSection").classList.add("d-none");
        document.getElementById("authSection").classList.remove("d-none");
        // Show login card and hide password change card when logging out
        document.getElementById("loginCard").classList.remove("d-none");
        document.getElementById("passwordChangeCard").classList.add("d-none");
    });
}

// Aggiungi gestione dei click sui link della navbar per mostrare le sezioni appropriate
initNavbarListeners();

// Function to initialize the navbar links
function initNavbarListeners() {
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            // Rimuovi la classe active da tutti i link
            navLinks.forEach(l => l.classList.remove("active"));

            // Aggiungi la classe active a questo link
            this.classList.add("active");

            // Ottieni l'ID della sezione da mostrare
            const targetId = this.getAttribute("href").substring(1);

            // Nascondi tutte le sezioni
            document.getElementById("dashboardContent")?.classList.add("d-none");
            document.getElementById("operatori-content")?.classList.add("d-none");
            document.getElementById("perizie-content")?.classList.add("d-none");

            // Mostra la sezione appropriata
            if (targetId === "dashboard") {
                const dashboardContent = document.getElementById("dashboardContent");
                if (dashboardContent) {
                    dashboardContent.classList.remove("d-none");
                    // Ricarica i dati della dashboard se necessario
                    updateDashboardStatistics(window.perizie || []);
                    loadRecentPerizieDashboard(window.perizie || []);
                }
            } else if (targetId === "operatori") {
                document.getElementById("operatori-content")?.classList.remove("d-none");
                // Carica i dati degli operatori
            } else if (targetId === "perizie") {
                const perizieContent = document.getElementById("perizie-content");
                if (perizieContent) {
                    perizieContent.classList.remove("d-none");
                    // Assicuriamoci che inizializziamo la sezione perizie
                    initPeriziePage();
                }
            }
        });
    });
}

// Function to load dashboard data

// Funzione per caricare le perizie dal server MongoDB
async function loadPerizie() {
    console.log("Caricamento perizie dal server...");

    try {
        // Invia richiesta al server utilizzando la funzione esistente
        const response = await inviaRichiesta("GET", "/api/perizie");

        console.log("Risposta del server:", response);

        // Verifica che la risposta sia un array o un oggetto con dati
        if (Array.isArray(response)) {
            window.perizie = response;
        } else if (response && response.data) {
            window.perizie = response.data;
        } else if (response && typeof response === 'object') {
            window.perizie = [response]; // Converti oggetto singolo in array
        } else {
            throw new Error("Formato risposta non valido");
        }

        console.log(`Caricate ${window.perizie.length} perizie`);

        // Se siamo nella dashboard, aggiorna le statistiche
        if (document.getElementById('dashboardContent') &&
            !document.getElementById('dashboardContent').classList.contains('d-none')) {
            updateDashboardStatistics(window.perizie);
            loadRecentPerizieDashboard(window.perizie);
        }

        return window.perizie;
    } catch (error) {
        console.error("Errore nel caricamento delle perizie:", error);

        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'Impossibile caricare i dati delle perizie dal server',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert('Impossibile caricare i dati delle perizie dal server');
        }

        // Inizializza con array vuoto per evitare errori
        window.perizie = [];
        return [];
    }
}

// Funzione per aggiornare le statistiche nella dashboard
function updateDashboardStatistics(perizie) {
    // Totale perizie
    const totalElement = document.getElementById("totalInspections");
    if (totalElement) totalElement.textContent = perizie.length;

    // Operatori attivi (conteggio unico degli operatori)
    const operatoriUnici = [...new Set(perizie.map(p => p.operatoreId))].filter(Boolean);
    const activeElement = document.getElementById("activeUsers");
    if (activeElement) activeElement.textContent = operatoriUnici.length;

    // Totale foto
    const totaleFoto = perizie.reduce((acc, p) => {
        return acc + (p.fotografie ? p.fotografie.length : 0);
    }, 0);
    const photosElement = document.getElementById("totalPhotos");
    if (photosElement) photosElement.textContent = totaleFoto;
}


// Funzione per inizializzare la mappa nella dashboard


// Helpers per funzionalità relative alle perizie
function viewPerizia(id) {
    if (!window.perizie) return;

    const perizia = window.perizie.find(p => p.id === id);
    if (!perizia) {
        console.error(`Perizia con ID ${id} non trovata`);
        return;
    }

    // Formatta la data in formato italiano
    const formattedDate = new Date(perizia.data).toLocaleString('it-IT');

    // Prepara galleria di foto se presenti
    let fotoHtml = "<p>Nessuna foto disponibile</p>";
    if (perizia.fotografie && perizia.fotografie.length > 0) {
        fotoHtml = `
                <div class="row">
                    ${perizia.fotografie.map((foto, index) => `
                        <div class="col-md-4 mb-3">
                            <img src="${foto.url}" class="img-fluid img-thumbnail" alt="Foto ${index + 1}" onerror="this.src='https://via.placeholder.com/300x200?text=Anteprima+non+disponibile'">
                            <p class="small mt-1">${foto.commento || ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
    }

    // Visualizza la modal con i dettagli della perizia
    if (window.Swal) {
        Swal.fire({
            title: `Perizia ${perizia.id}`,
            html: `
                    <div class="text-start">
                        <p><strong>Tipo:</strong> ${perizia.tipo ? (perizia.tipo.charAt(0).toUpperCase() + perizia.tipo.slice(1)) : 'N/D'}</p>
                        <p><strong>Operatore:</strong> ${perizia.operatore || 'N/D'} ${perizia.operatoreId ? `(ID: ${perizia.operatoreId})` : ''}</p>
                        <p><strong>Data:</strong> ${formattedDate}</p>
                        <p><strong>Indirizzo:</strong> ${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : 'N/D'}</p>
                        <p><strong>Coordinate:</strong> ${perizia.posizione ? `${perizia.posizione.lat || 'N/D'}, ${perizia.posizione.lng || 'N/D'}` : 'N/D'}</p>
                        <p><strong>Descrizione:</strong> ${perizia.descrizione || 'N/D'}</p>
                        <p><strong>Cliente:</strong> ${perizia.cliente ? `${perizia.cliente.nome || 'N/D'} (${perizia.cliente.contatto || 'N/D'})` : 'N/D'}</p>
                        <p><strong>Polizza:</strong> ${perizia.polizza || 'N/D'}</p>
                        <h5 class="mt-4">Fotografie (${perizia.fotografie ? perizia.fotografie.length : 0})</h5>
                        ${fotoHtml}
                    </div>
                `,
            width: 800,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Chiudi'
        });
    } else {
        alert(`Perizia ${perizia.id} - Per visualizzare tutti i dettagli, assicurati che SweetAlert2 sia caricato.`);
    }
}

function isUserAdmin() {
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    return userData && userData.role === 'admin';
}

// Funzione per verificare i permessi prima di eseguire un'azione riservata agli admin
function checkAdminPermission() {
    if (!isUserAdmin()) {
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Permesso negato',
                text: 'Questa operazione può essere eseguita solo da un amministratore',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert('Permesso negato. Questa operazione può essere eseguita solo da un amministratore');
        }
        return false;
    }
    return true;
}

// Function to toggle all checkboxes
function toggleAllCheckboxes(checked) {
    document.querySelectorAll('.inspection-select').forEach(checkbox => {
        checkbox.checked = checked;
    });
    updateSelectedCount();
}

// Function to update the count of selected perizie
function updateSelectedCount() {
    const selectedCheckboxes = document.querySelectorAll('.inspection-select:checked');
    const count = selectedCheckboxes.length;


    // Update the text in the delete button
    const deleteButton = document.getElementById('deleteSelectedInspections');
    if (deleteButton) {
        deleteButton.innerHTML = `<i class="fas fa-trash me-1"></i>Elimina selezionate (${count})`;
        deleteButton.disabled = count === 0;
    }
}

// Function to delete a single perizia
async function deletePerizia(id) {
    // Check admin permissions first
    if (!checkAdminPermission()) return;
    const request = inviaRichiesta("DELETE", `/api/perizie/${id}`);
    // Confirm deletion
    if (window.Swal) {
        const confirmation = await Swal.fire({
            title: 'Conferma eliminazione',
            text: `Sei sicuro di voler eliminare la perizia ${id}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sì, elimina',
            cancelButtonText: 'Annulla'
        });
        
        if (confirmation.isConfirmed) {
            await deletePerizieByIds([id]);
        }
        } else {
        if (confirm(`Sei sicuro di voler eliminare la perizia ${id}?`)) {
            await deletePerizieByIds([id]);
        }
    }
}

// Function to delete selected perizie
async function deleteSelectedPerizie() {
    // Check admin permissions first
    if (!checkAdminPermission()) return;

    const selectedCheckboxes = document.querySelectorAll('.inspection-select:checked');
    if (selectedCheckboxes.length === 0) return;

    const ids = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));
    
    // Confirm deletion
    if (window.Swal) {
        const confirmation = await Swal.fire({
            title: 'Conferma eliminazione',
            text: `Sei sicuro di voler eliminare ${ids.length} perizie?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sì, elimina',
            cancelButtonText: 'Annulla'
        });
        
        if (confirmation.isConfirmed) {
            await window.deletePerizieByIds(ids);
        }
        } else {
        if (confirm(`Sei sicuro di voler eliminare ${ids.length} perizie?`)) {
            await deletePerizieByIds(ids);
        }
    }
}

// Function to assign selected perizie to an operator

// Function to update a perizia
// Function to update a perizia
async function editPerizia(id) {
    try {
        // Find the perizia in the array
        const perizia = window.perizie.find(p => p.id === id);
        
        if (!perizia) {
            console.error(`Perizia with ID ${id} not found`);
            return;
        }
        
        // Format date for input field
        const formattedDate = perizia.data ? new Date(perizia.data).toISOString().slice(0, 16) : '';
        
        if (window.Swal) {
            Swal.fire({
                title: `Modifica Perizia ${perizia.id}`,
                html: `
                    <form id="editPeriziaForm" class="text-start">
                        <div class="mb-3">
                            <label for="editType" class="form-label">Tipo di perizia</label>
                            <select class="form-select" id="editType">
                                <option value="">Seleziona il tipo</option>
                                <option value="incendio" ${perizia.tipo === 'incendio' ? 'selected' : ''}>Incendio</option>
                                <option value="allagamento" ${perizia.tipo === 'allagamento' ? 'selected' : ''}>Allagamento</option>
                                <option value="grandine" ${perizia.tipo === 'grandine' ? 'selected' : ''}>Grandine</option>
                                <option value="furto" ${perizia.tipo === 'furto' ? 'selected' : ''}>Furto</option>
                                <option value="altro" ${perizia.tipo === 'altro' ? 'selected' : ''}>Altro</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="editAddress" class="form-label">Indirizzo</label>
                            <input type="text" class="form-control" id="editAddress" value="${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : ''}">
                        </div>
                        <div class="mb-3">
                            <label for="editDescription" class="form-label">Descrizione</label>
                            <textarea class="form-control" id="editDescription" rows="3">${perizia.descrizione || ''}</textarea>
                        </div>
                        <div class="mb-3">
                            <label for="editStatus" class="form-label">Stato</label>
                            <select class="form-select" id="editStatus">
                                <option value="pending" ${perizia.stato === 'pending' ? 'selected' : ''}>In attesa</option>
                                <option value="scheduled" ${perizia.stato === 'scheduled' ? 'selected' : ''}>Pianificata</option>
                                <option value="in_progress" ${perizia.stato === 'in_progress' ? 'selected' : ''}>In corso</option>
                                <option value="completed" ${perizia.stato === 'completed' ? 'selected' : ''}>Completata</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="editDate" class="form-label">Data</label>
                            <input type="datetime-local" class="form-control" id="editDate" value="${formattedDate}">
                        </div>
                        <div class="mb-3">
                            <label for="editClientName" class="form-label">Nome Cliente</label>
                            <input type="text" class="form-control" id="editClientName" value="${perizia.cliente && perizia.cliente.nome ? perizia.cliente.nome : ''}">
                        </div>
                        <div class="mb-3">
                            <label for="editClientContact" class="form-label">Contatto Cliente</label>
                            <input type="text" class="form-control" id="editClientContact" value="${perizia.cliente && perizia.cliente.contatto ? perizia.cliente.contatto : ''}">
                        </div>
                        <div class="mb-3">
                            <label for="editPolicy" class="form-label">Numero Polizza</label>
                            <input type="text" class="form-control" id="editPolicy" value="${perizia.polizza || ''}">
                        </div>
                    </form>
                `,
                width: 600,
                showCancelButton: true,
                confirmButtonText: 'Salva Modifiche',
                cancelButtonText: 'Annulla',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#dc3545',
                preConfirm: () => {
                    // Validate form
                    const type = document.getElementById('editType').value;
                    const address = document.getElementById('editAddress').value?.trim();
                    const description = document.getElementById('editDescription').value?.trim();
                    
                    if (!type || !address || !description) {
                        Swal.showValidationMessage('I campi Tipo, Indirizzo e Descrizione sono obbligatori');
                        return false;
                    }
                    
                    return {
                        tipo: type,
                        posizione: {
                            ...perizia.posizione,
                            indirizzo: address
                        },
                        descrizione: description,
                        stato: document.getElementById('editStatus').value,
                        data: document.getElementById('editDate').value ? new Date(document.getElementById('editDate').value).toISOString() : perizia.data,
                        cliente: {
                            nome: document.getElementById('editClientName').value?.trim() || '',
                            contatto: document.getElementById('editClientContact').value?.trim() || ''
                        },
                        polizza: document.getElementById('editPolicy').value?.trim() || '',
                        ultimoAggiornamento: new Date().toISOString()
                    };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Update the perizia
                    await updatePerizia(id, result.value);
                }
            });
        } else {
            alert('Modifica perizia non disponibile. Verifica che SweetAlert2 sia caricato.');
        }
    } catch (error) {
        console.error('Errore nella modifica della perizia:', error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Si è verificato un errore: ${error.message}`,
                confirmButtonColor: '#dc3545'
            });
        } else {
            alert(`Errore: ${error.message}`);
        }
    }
}

async function updatePerizia(id, updateData) {
    try {
        // Show loading indicator
        if (window.Swal) {
            Swal.fire({
                title: 'Aggiornamento in corso...',
                text: 'Attendere prego',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }
        
        // Validate the status value if present
        if (updateData.stato) {
            // Check if it's a valid status
            const validStatuses = ['pending', 'scheduled', 'in_progress', 'completed'];
            if (!validStatuses.includes(updateData.stato)) {
                updateData.stato = 'pending'; // Default to pending if invalid
            }
        }
        
        // Update lastUpdate timestamp
        updateData.ultimoAggiornamento = new Date().toISOString();
        
        // Make API call
        const response = await fetch(`/api/perizie/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        // Update local data and UI
        await loadPerizie();
        loadPerizieTable();
        
        // Show success message
        if (window.Swal) {
            await Swal.fire({
                icon: 'success',
                title: 'Perizia aggiornata',
                text: `La perizia ${id} è stata aggiornata con successo`,
                confirmButtonColor: '#28a745'
            });
        } else {
            alert(`La perizia ${id} è stata aggiornata con successo`);
        }
        
    } catch (error) {
        console.error("Errore nell'aggiornamento della perizia:", error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Si è verificato un errore durante l'aggiornamento: ${error.message}`,
                confirmButtonColor: '#dc3545'
            });
        } else {
            alert(`Si è verificato un errore durante l'aggiornamento: ${error.message}`);
        }
    }
}

// Function to load recent perizie in the dashboard
function loadRecentPerizieDashboard(perizie) {
    console.log("Loading recent perizie for dashboard");
    const tableBody = document.getElementById("inspectionTableBody");
    
    if (!tableBody) {
        console.error("Element inspectionTableBody not found");
        return;
    }
    
    // Clear the table
    tableBody.innerHTML = '';
    
    // Sort perizie by date (most recent first) and take only the first 5
    const recentPerizie = [...perizie]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 5);
    
    if (recentPerizie.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-3">Non ci sono perizie disponibili</td>
            </tr>
        `;
        return;
    }
    
    // Populate the table with recent perizie
    recentPerizie.forEach(perizia => {
        const row = document.createElement('tr');
        
        // Format date
        const formattedDate = new Date(perizia.data).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Determine status badge
        const statusText = getStatusText(perizia.stato, perizia.operatoreId);
        const statusBadgeColor = getStatusBadgeColor(perizia.stato, perizia.operatoreId);
        const statusBadge = `<span class="badge bg-${statusBadgeColor}">${statusText}</span>`;
        
        // Count photos
        const numFoto = perizia.fotografie ? perizia.fotografie.length : 0;
        
        row.innerHTML = `
            <td>${perizia.id}</td>
            <td>${perizia.operatore || 'N/D'}</td>
            <td>${formattedDate}</td>
            <td>${perizia.tipo || 'N/D'}</td>
            <td>${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : 'N/D'}</td>
            <td>${statusBadge}</td>
            <td>${numFoto}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-info view-inspection" data-id="${perizia.id}">
                    <i class="fas fa-eye"></i>
                </button>
                ${!perizia.operatoreId ? 
                    `<button class="btn btn-sm btn-success assign-inspection-dashboard" data-id="${perizia.id}">
                        <i class="fas fa-user-check"></i>
                    </button>` : ''}
                <button class="btn btn-sm btn-warning edit-inspection" data-id="${perizia.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-inspection" data-id="${perizia.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to the buttons
    document.querySelectorAll('.view-inspection').forEach(btn => {
        btn.addEventListener('click', function () {
            viewPerizia(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.edit-inspection').forEach(btn => {
        btn.addEventListener('click', function () {
            editPerizia(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-inspection').forEach(btn => {
        btn.addEventListener('click', function () {
            deletePerizia(this.getAttribute('data-id'));
        });
    });
    
    // Add event listener for assign button
    document.querySelectorAll('.assign-inspection-dashboard').forEach(btn => {
        btn.addEventListener('click', function () {
            const periziaId = this.getAttribute('data-id');
            assignSinglePerizia(periziaId);
        });
    });
    
    // Update the operators in perizia list
    updateOperatoriInPerizia(perizie);
}
// Fixed function for loading perizie table
// Fixed function for loading perizie table
function loadPerizieTable(filteredPerizie = null) {
    console.log("Caricamento tabella perizie...");

    // Find the table body element
    const tableBody = document.getElementById('perizieTableBody');
    if (!tableBody) {
        console.error("Elemento perizieTableBody non trovato");
        return;
    }

    // Empty the table
    tableBody.innerHTML = '';

    // Use filtered perizie if provided, otherwise use all perizie
    const perizie = filteredPerizie || window.perizie;

    // Check if perizie are loaded
    if (!perizie || perizie.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-3">Nessuna perizia disponibile</td>
            </tr>
        `;
        return;
    }

    // Sort perizie by date (most recent first)
    const sortedPerizie = [...perizie].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    // Populate the table
    sortedPerizie.forEach(perizia => {
        const row = document.createElement('tr');

        // Format date
        const formattedDate = new Date(perizia.data).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Determine status badge - simplified status
        const statusText = getStatusText(perizia.stato);
        const statusBadgeColor = getStatusBadgeColor(perizia.stato);
        const statusBadge = `<span class="badge bg-${statusBadgeColor}">${statusText}</span>`;

        // Count photos
        const numFoto = perizia.fotografie ? perizia.fotografie.length : 0;

        row.innerHTML = `
            <td>
                <div class="form-check">
                    <input class="form-check-input inspection-select" type="checkbox" data-id="${perizia.id}">
                </div>
            </td>
            <td>${perizia.id}</td>
            <td>${perizia.operatore || 'N/D'}</td>
            <td>${formattedDate}</td>
            <td>${perizia.tipo || 'N/D'}</td>
            <td>${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : 'N/D'}</td>
            <td>${statusBadge}</td>
            <td>${numFoto}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-info view-inspection" data-id="${perizia.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning edit-inspection" data-id="${perizia.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-inspection" data-id="${perizia.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.view-inspection').forEach(btn => {
        btn.addEventListener('click', function () {
            viewPerizia(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.edit-inspection').forEach(btn => {
        btn.addEventListener('click', function () {
            editPerizia(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.delete-inspection').forEach(btn => {
        btn.addEventListener('click', function () {
            deletePerizia(this.getAttribute('data-id'));
        });
    });

    // Add event listeners to checkboxes
    document.querySelectorAll('.inspection-select').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });
}


// Add new function to create perizia by operator
async function createNewPerizia() {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (!userData) {
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: 'È necessario effettuare il login per creare una perizia',
                confirmButtonColor: '#3085d6'
            });
        }
        return;
    }

    // Show form to create new perizia
    if (window.Swal) {
        Swal.fire({
            title: 'Crea Nuova Perizia',
            html: `
                <form id="createInspectionForm" class="text-start">
                    <div class="mb-3">
                        <label for="inspectionType" class="form-label">Tipo di perizia*</label>
                        <select class="form-select" id="inspectionType" required>
                            <option value="" selected disabled>Seleziona il tipo</option>
                            <option value="incendio">Incendio</option>
                            <option value="allagamento">Allagamento</option>
                            <option value="grandine">Grandine</option>
                            <option value="furto">Furto</option>
                            <option value="altro">Altro</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="inspectionAddress" class="form-label">Indirizzo*</label>
                        <input type="text" class="form-control" id="inspectionAddress" required>
                    </div>
                    <div class="mb-3">
                        <label for="inspectionDescription" class="form-label">Descrizione*</label>
                        <textarea class="form-control" id="inspectionDescription" rows="3" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="clientName" class="form-label">Nome Cliente*</label>
                        <input type="text" class="form-control" id="clientName" required>
                    </div>
                    <div class="mb-3">
                        <label for="clientContact" class="form-label">Contatto Cliente*</label>
                        <input type="text" class="form-control" id="clientContact" required>
                    </div>
                    <div class="mb-3">
                        <label for="policyNumber" class="form-label">Numero Polizza*</label>
                        <input type="text" class="form-control" id="policyNumber" required>
                    </div>
                    <div class="mb-3">
                        <label for="priority" class="form-label">Priorità</label>
                        <select class="form-select" id="priority">
                            <option value="low">Bassa</option>
                            <option value="medium" selected>Media</option>
                            <option value="high">Alta</option>
                        </select>
                    </div>
                </form>
            `,
            width: 600,
            showCancelButton: true,
            confirmButtonText: 'Crea Perizia',
            cancelButtonText: 'Annulla',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            preConfirm: () => {
                const tipo = document.getElementById('inspectionType').value;
                const indirizzo = document.getElementById('inspectionAddress').value?.trim();
                const descrizione = document.getElementById('inspectionDescription').value?.trim();
                const clienteNome = document.getElementById('clientName').value?.trim();
                const clienteContatto = document.getElementById('clientContact').value?.trim();
                const polizza = document.getElementById('policyNumber').value?.trim();

                if (!tipo || !indirizzo || !descrizione || !clienteNome || !clienteContatto || !polizza) {
                    Swal.showValidationMessage('Tutti i campi obbligatori devono essere compilati');
                    return false;
                }

                // Generate a new ID (format: PRZ-YYYY-XXX)
                const now = new Date();
                const year = now.getFullYear();
                // In a real app, you would get the next sequential number from the server
                const nextId = Math.floor(Math.random() * 900) + 100; // Just for demo
                const id = `PRZ-${year}-${nextId.toString().padStart(3, '0')}`;

                return {
                    id: id,
                    operatoreId: userData.username,
                    operatore: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username,
                    data: now.toISOString(),
                    tipo: tipo,
                    posizione: {
                        indirizzo: indirizzo,
                        // In a real app, you would geocode the address to get lat/lng
                        lat: 0,
                        lng: 0
                    },
                    descrizione: descrizione,
                    cliente: {
                        nome: clienteNome,
                        contatto: clienteContatto
                    },
                    polizza: polizza,
                    priorita: document.getElementById('priority').value,
                    stato: "completed", // New perizie are marked as completed by default
                    fotografie: [],
                    ultimoAggiornamento: now.toISOString()
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Show loader
                    Swal.fire({
                        title: 'Creazione perizia in corso...',
                        html: '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>',
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });

                    // Create the perizia
                    await inviaRichiesta("POST", "/api/perizie", result.value);

                    // Show success message
                    Swal.fire({
                        icon: 'success',
                        title: 'Successo',
                        text: `Perizia ${result.value.id} creata con successo`,
                        confirmButtonColor: '#28a745'
                    });

                    // Reload perizie
                    await loadPerizie();
                    loadPerizieTable();
                } catch (error) {
                    console.error("Errore nella creazione della perizia:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore',
                        text: `Si è verificato un errore durante la creazione: ${error.message}`,
                        confirmButtonColor: '#3085d6'
                    });
                }
            }
        });
    }
}
// Function for deleting perizie by IDs (corrected version)
async function deletePerizieByIds(ids) {
    try {
        if (!ids || ids.length === 0) {
            console.error("Nessun ID fornito per l'eliminazione");
            return;
        }

        console.log("Tentativo di eliminazione delle perizie con ID:", ids);

        // Show loading indicator
        if (window.Swal) {
            Swal.fire({
                title: 'Eliminazione in corso...',
                text: 'Attendere prego',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }

        // Make the API request to delete the perizie
        const response = await inviaRichiesta("DELETE", "/api/perizie", { ids });

        console.log("Risposta eliminazione:", response);

        // Reload perizie after deletion
        await loadPerizie();
        loadPerizieTable();
        updatePerizieCounts();

        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Eliminazione completata',
                text: 'Perizie eliminate con successo',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert('Perizie eliminate con successo');
        }
    } catch (error) {
        console.error("Errore nell'eliminazione delle perizie:", error);

        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Impossibile eliminare le perizie: ${error.message}`,
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert(`Impossibile eliminare le perizie: ${error.message}`);
        }
    }
}
// Function to delete a single perizia
async function deletePerizia(id) {
    if (!id) {
        console.error("ID perizia mancante");
        return;
    }
    
    console.log("Tentativo di eliminare perizia:", id);
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    let permesso = userData && userData.role === 'admin';
    
    // Check admin permissions
    if (!permesso) {
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Permesso negato',
                text: 'Solo gli amministratori possono eliminare perizie'
            });
        } else {
            alert('Solo gli amministratori possono eliminare perizie');
        }
        return;
    }

    // Confirm deletion
    let userConfirmed = false;
    
    if (window.Swal) {
        const result = await Swal.fire({
            title: 'Conferma eliminazione',
            text: `Sei sicuro di voler eliminare la perizia ${id}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sì, elimina',
            cancelButtonText: 'Annulla'
        });
        
        userConfirmed = result.isConfirmed;
    } else {
        userConfirmed = confirm(`Sei sicuro di voler eliminare la perizia ${id}?`);
    }
    
    if (!userConfirmed) {
        return;
    }
    
    try {
        // Show loading indicator
        if (window.Swal) {
            Swal.fire({
                title: 'Eliminazione in corso...',
                html: 'Attendere prego',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
        }
        
        // Direct fetch call to ensure correct format
        const response = await fetch(`/api/perizie/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error: ${response.status} - ${errorText}`);
            throw new Error(`Errore server: ${response.status} ${response.statusText}`);
        }
        
        console.log(`Perizia ${id} eliminata con successo`);
        
        // Reload perizie
        await loadPerizie();
        loadPerizieTable();
        updatePerizieCounts();
        
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Eliminazione completata',
                text: `Perizia ${id} eliminata con successo`
            });
        } else {
            alert(`Perizia ${id} eliminata con successo`);
        }
    } catch (error) {
        console.error("Errore nell'eliminazione della perizia:", error);
        
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Impossibile eliminare la perizia: ${error.message}`
            });
        } else {
            alert(`Impossibile eliminare la perizia: ${error.message}`);
        }
    }
}

    // Funzione per aggiornare i contatori delle perizie
    function updatePerizieCounts() {
        if (!window.perizie) return;

        const totalElement = document.getElementById('perizieTotali');
        const totalFooterElement = document.getElementById('perizieTotaliFooter');
        const visualizzateElement = document.getElementById('perizieVisualizzate');

        if (totalElement) totalElement.textContent = window.perizie.length;
        if (totalFooterElement) totalFooterElement.textContent = window.perizie.length;
        if (visualizzateElement) visualizzateElement.textContent = window.perizie.length;
    }
// Simple direct function to delete multiple perizie
async function deleteSelectedPerizie() {
    // Check admin permissions
    if (!isUserAdmin()) {
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Permesso negato',
                text: 'Solo gli amministratori possono eliminare perizie'
            });
        } else {
            alert('Solo gli amministratori possono eliminare perizie');
        }
        return;
    }
    
    // Get selected checkboxes
    const selectedCheckboxes = document.querySelectorAll('.inspection-select:checked');
    
    if (selectedCheckboxes.length === 0) {
        if (window.Swal) {
            Swal.fire({
                icon: 'warning',
                title: 'Attenzione',
                text: 'Nessuna perizia selezionata'
            });
        } else {
            alert('Nessuna perizia selezionata');
        }
        return;
    }
    
    // Extract IDs
    const ids = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));
    
    console.log("Perizie selezionate per l'eliminazione:", ids);
    
    // Confirm deletion
    let userConfirmed = false;
    
    if (window.Swal) {
        const result = await Swal.fire({
            title: 'Conferma eliminazione',
            text: `Sei sicuro di voler eliminare ${ids.length} perizie?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sì, elimina',
            cancelButtonText: 'Annulla'
        });
        
        userConfirmed = result.isConfirmed;
    } else {
        userConfirmed = confirm(`Sei sicuro di voler eliminare ${ids.length} perizie?`);
    }
    
    if (!userConfirmed) {
        return;
    }
    
    try {
        // Show loading indicator
        if (window.Swal) {
            Swal.fire({
                title: 'Eliminazione in corso...',
                html: 'Attendere prego',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
        }
        
        // Direct DELETE request for bulk delete
        const response = await fetch('/api/perizie', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });
        
        if (!response.ok) {
            throw new Error(`Errore server: ${response.status} ${response.statusText}`);
        }
        
        console.log(`${ids.length} perizie eliminate con successo`);
        
        // Reload perizie
        await loadPerizie();
        loadPerizieTable();
        updatePerizieCounts();
        
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Eliminazione completata',
                text: `${ids.length} perizie eliminate con successo`
            });
        } else {
            alert(`${ids.length} perizie eliminate con successo`);
        }
    } catch (error) {
        console.error("Errore nell'eliminazione delle perizie:", error);
        
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Impossibile eliminare le perizie: ${error.message}`
            });
        } else {
            alert(`Impossibile eliminare le perizie: ${error.message}`);
        }
    }
}

// Function to delete selected perizie (corrected version)
// Fixed implementation for deleteSelectedPerizie
async function deleteSelectedPerizie() {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    const isAdmin = userData && userData.role === 'admin';
    
    if (!isAdmin) {
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Permesso negato',
                text: 'Questa operazione può essere eseguita solo da un amministratore'
            });
        } else {
            alert('Permesso negato. Questa operazione può essere eseguita solo da un amministratore');
        }
        return;
    }

    // Get selected checkboxes
    const selectedCheckboxes = document.querySelectorAll('.inspection-select:checked');
    if (selectedCheckboxes.length === 0) {
        console.log("Nessuna perizia selezionata per l'eliminazione");
        if (window.Swal) {
            Swal.fire({
                icon: 'warning',
                title: 'Attenzione',
                text: 'Nessuna perizia selezionata'
            });
        }
        return;
    }

    // Extract IDs from selected checkboxes
    const ids = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));
    console.log("Perizie selezionate per l'eliminazione:", ids);

    // Confirm deletion
    let confirmed = false;
    if (window.Swal) {
        const result = await Swal.fire({
            title: 'Conferma eliminazione',
            text: `Sei sicuro di voler eliminare ${ids.length} perizie?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sì, elimina',
            cancelButtonText: 'Annulla'
        });
        confirmed = result.isConfirmed;
    } else {
        confirmed = confirm(`Sei sicuro di voler eliminare ${ids.length} perizie?`);
    }

    if (!confirmed) return;

    try {
        // Show loading indicator
        if (window.Swal) {
            Swal.fire({
                title: 'Eliminazione in corso...',
                text: 'Attendere prego',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }
        
        // Use the proper endpoint from your server
        const response = await fetch('/api/eliminaPerizie', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server response: ${response.status} - ${errorText}`);
            throw new Error(`Errore server: ${response.status} ${response.statusText}`);
        }
        
        // Reload perizie
        await loadPerizie();
        loadPerizieTable();
        updatePerizieCounts();
        
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Eliminazione completata',
                text: `${ids.length} perizie eliminate con successo`
            });
        } else {
            alert(`${ids.length} perizie eliminate con successo`);
        }
    } catch (error) {
        console.error("Errore nell'eliminazione delle perizie:", error);
        
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Impossibile eliminare le perizie: ${error.message}`
            });
        } else {
            alert(`Impossibile eliminare le perizie: ${error.message}`);
        }
    }
}
// Funzioni per la sezione operatori

// Inizializza la sezione operatori
function initOperatoriPage() {
    console.log("Inizializzazione sezione operatori");

    // Mostra il contenuto degli operatori
    const operatoriContent = document.getElementById('operatori-content');
    if (operatoriContent) {
        operatoriContent.classList.remove('d-none');
    }

    // Nascondi il vecchio pulsante se l'utente è admin (lo sostituiamo con la card)
    const addOperatorBtn = document.getElementById('addOperatoreBtn');
    if (addOperatorBtn && isUserAdmin()) {
        addOperatorBtn.style.display = 'none';
    }
    // Mostra loader
    const loaderElement = document.getElementById('operatori-loader');
    if (loaderElement) loaderElement.classList.remove('d-none');

    // Clear container and hide alerts
    const cardsContainer = document.getElementById('operatori-cards');
    if (cardsContainer) cardsContainer.innerHTML = '';

    const alertElement = document.getElementById('operatori-alert');
    if (alertElement) alertElement.classList.add('d-none');

    // Correggi il pulsante Nuovo Operatore
    setTimeout(fixAddOperatorButton, 300);  // Aggiungi un piccolo ritardo per assicurarsi che il DOM sia pronto

    // Carica gli operatori
    loadOperatori().catch(error => {
        console.error("Errore nell'inizializzazione della sezione operatori:", error);
        showOperatoriError("Impossibile caricare la sezione operatori. Riprova più tardi.");
    });
}
function fixAddOperatorButton() {
    console.log("Tentativo di correggere il pulsante Nuovo Operatore");

    // Cerca il pulsante nel DOM
    const addOperatorBtn = document.getElementById('addOperatoreBtn');

    if (addOperatorBtn) {
        console.log("Pulsante trovato, aggiungo event listener");

        // Rimuovi eventuali event listener esistenti per evitare duplicati
        const newButton = addOperatorBtn.cloneNode(true);
        addOperatorBtn.parentNode.replaceChild(newButton, addOperatorBtn);

        // Aggiungi il nuovo event listener
        newButton.addEventListener('click', function (e) {
            e.preventDefault();
            console.log("Pulsante Nuovo Operatore cliccato!");
            addOperatore();
        });
    } else {
        console.warn("Pulsante Nuovo Operatore non trovato nel DOM");
    }
}

// Aggiungi un solo listener per DOMContentLoaded
document.addEventListener('DOMContentLoaded', fixAddOperatorButton);

// Aggiungi anche un listener globale per clicks sul documento per catturare il click sul pulsante
document.addEventListener('click', function (e) {
    if (e.target && (e.target.id === 'addOperatoreBtn' || e.target.closest('#addOperatoreBtn'))) {
        console.log("Click rilevato sul pulsante Nuovo Operatore tramite event delegation");
        e.preventDefault();
        addOperatore();
    }
});

// Funzione per caricare gli operatori dal server
async function loadOperatori() {
    console.log("Caricamento operatori");

    // Mostra loader
    const loaderElement = document.getElementById('operatori-loader');
    if (loaderElement) loaderElement.classList.remove('d-none');

    // Nascondi messaggi di errore precedenti
    const alertElement = document.getElementById('operatori-alert');
    if (alertElement) alertElement.classList.add('d-none');

    try {
        // Chiamata API per ottenere gli operatori
        const operatori = await inviaRichiesta("GET", "/api/users");

        // Nascondi il loader
        if (loaderElement) loaderElement.classList.add('d-none');

        // Mostra gli operatori
        displayOperatori(operatori);
    } catch (error) {
        console.error("Errore nel caricamento degli operatori:", error);

        // Nascondi il loader
        if (loaderElement) loaderElement.classList.add('d-none');

        // Mostra messaggio di errore
        showOperatoriError("Impossibile caricare gli operatori dal server. Riprova più tardi.");
    }
}

// Funzione per mostrare un messaggio di errore nella sezione operatori
function showOperatoriError(message) {
    const alertElement = document.getElementById('operatori-alert');
    if (alertElement) {
        alertElement.textContent = message;
        alertElement.classList.remove('d-none');
    }
}

// Funzione per visualizzare le card degli operatori
function displayOperatori(operatori) {
    const cardsContainer = document.getElementById('operatori-cards');
    if (!cardsContainer) return;
    
    // Svuota il contenitore
    cardsContainer.innerHTML = '';
    
    // Verifica se l'utente è admin per aggiungere la card "+"
    const isAdmins = isUserAdmin();
    
    // Se l'utente è admin, aggiungi la card per nuovo operatore
    if (isAdmins) {
        const addCard = document.createElement('div');
        addCard.className = 'col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4';
        addCard.innerHTML = `
            <div class="card h-100 shadow-sm add-operator-card" style="cursor: pointer; border: 2px dashed #ccc;">
                <div class="card-body d-flex flex-column align-items-center justify-content-center" onclick="addOperatore()">
                    <div class="add-operator-icon mb-3">
                        <i class="fas fa-plus-circle" style="font-size: 48px; color: #28a745;"></i>
                    </div>
                    <h5 class="card-title text-center">Aggiungi Nuovo Operatore</h5>
                    <p class="card-text text-muted text-center">Clicca per aggiungere un nuovo operatore</p>
                </div>
            </div>
        `;
        cardsContainer.appendChild(addCard);
    }
    
    // Verifica se ci sono operatori
    if (!operatori || operatori.length === 0) {
        cardsContainer.innerHTML += `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>Nessun operatore trovato.
                </div>
            </div>
        `;
        return;
    }
    
    // Verifico quali operatori hanno perizie assegnate
    const perizie = window.perizie || [];
    
    // Verifica se l'utente loggato è amministratore
    const isAdmin = isUserAdmin();
    
    // Crea una card per ogni operatore
    operatori.forEach(operatore => {
        // Controlla se l'operatore ha perizie assegnate
        const perizieAssegnate = perizie.filter(p =>
            p.operatoreId === operatore.username ||
            p.operatore === operatore.username ||
            (p.operatore && p.operatore.includes(operatore.username))
        );
        
        // Determina lo stato dell'operatore
        const isOccupato = perizieAssegnate.length > 0;
        
        // Generate initials for avatar
        const initials = getOperatorInitials(operatore);
        
        // Generate a background color based on username
        const avatarColor = getAvatarColor(operatore.username);
        
        const card = document.createElement('div');
        card.className = 'col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4';
        
        // Determina la classe di sfondo della card in base allo stato
        const cardBackground = isOccupato ? 'operator-card-busy' : 'operator-card-available';
        
        card.innerHTML = `
            <div class="card h-100 shadow-sm ${cardBackground}">
                <div class="card-body text-center">
                    <div class="mb-3">
                        <div class="avatar-circle mx-auto" style="width: 80px; height: 80px; background-color: ${avatarColor}; color: white; font-size: 32px;">
                            ${initials}
                        </div>
                    </div>
                    <h5 class="card-title">${operatore.firstName || ''} ${operatore.lastName || ''}</h5>
                    <p class="card-text text-muted mb-1">@${operatore.username}</p>
                    <p class="card-text small mb-3"><i class="fas fa-envelope me-1"></i>${operatore.email || 'No email'}</p>
                    <div class="mb-3">
                        <span class="badge ${operatore.role === 'admin' ? 'bg-danger' : 'bg-primary'} mb-2">
                            ${operatore.role === 'admin' ? 'Amministratore' : 'Operatore'}
                        </span>
                        
                    </div>
                    <div class="d-flex justify-content-center">
                        <button class="btn btn-sm btn-info me-2 view-operator" data-id="${operatore.username}">
                            <i class="fas fa-info-circle"></i> Info
                        </button>
                        ${isAdmin ? `
                            <button class="btn btn-sm btn-warning me-2 edit-operator" data-id="${operatore.username}">
                                <i class="fas fa-edit"></i> Modifica
                            </button>
                            <button class="btn btn-sm btn-danger delete-operator" data-id="${operatore.username}">
                                <i class="fas fa-trash"></i> Elimina
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="card-footer bg-transparent border-0">
                    <small class="text-muted">
                        <i class="fas fa-clipboard-check me-1"></i>Perizie: <span class="fw-bold">${perizieAssegnate.length}</span>
                    </small>
                </div>
            </div>
        `;
        
        cardsContainer.appendChild(card);
    });
    
    // Aggiungi event listeners ai bottoni
    addOperatorButtonListeners();
}

// Funzione per generare le iniziali dell'operatore
function getOperatorInitials(operatore) {
    if (operatore.firstName && operatore.lastName) {
        return `${operatore.firstName.charAt(0)}${operatore.lastName.charAt(0)}`.toUpperCase();
    } else if (operatore.firstName) {
        return operatore.firstName.charAt(0).toUpperCase();
    } else if (operatore.username) {
        return operatore.username.substring(0, 2).toUpperCase();
    } else {
        return 'OP';
    }
}

// Funzione per generare un colore basato sul nome utente
function getAvatarColor(username) {
    // Array di colori predefiniti
    const colors = [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
        '#1abc9c', '#34495e', '#16a085', '#27ae60', '#2980b9',
        '#8e44ad', '#f1c40f', '#e67e22', '#c0392b', '#d35400'
    ];

    // Genera un indice basato sul nome utente
    let hash = 0;
    if (username) {
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
    }

    // Seleziona un colore dall'array
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

// Funzione per aggiungere gli event listeners ai bottoni delle card
function addOperatorButtonListeners() {
    // Info button
    document.querySelectorAll('.view-operator').forEach(button => {
        button.addEventListener('click', function () {
            const operatorId = this.getAttribute('data-id');
            viewOperatorInfo(operatorId);
        });
    });

    // Edit button (solo per admin)
    document.querySelectorAll('.edit-operator').forEach(button => {
        button.addEventListener('click', function () {
            const operatorId = this.getAttribute('data-id');
            editOperatore(operatorId);
        });
    });

    // Delete button (solo per admin)
    document.querySelectorAll('.delete-operator').forEach(button => {
        button.addEventListener('click', function () {
            const operatorId = this.getAttribute('data-id');
            deleteOperatore(operatorId);
        });
    });
}
// Visualizza informazioni dettagliate sull'operatore
async function viewOperatorInfo(operatorId) {
    try {
        // Mostra un loader nello sweetalert mentre carichiamo i dettagli
        if (window.Swal) {
            Swal.fire({
                title: 'Caricamento...',
                html: 'Recupero informazioni operatore',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }

        // Ottieni i dati dell'operatore
        const operatori = await inviaRichiesta("GET", "/api/users");
        const operatore = operatori.find(op => op.username === operatorId);

        if (!operatore) {
            throw new Error('Operatore non trovato');
        }

        // Ottieni anche le perizie dell'operatore
        const perizie = window.perizie || await inviaRichiesta("GET", "/api/perizie");
        const perizieDellOperatore = perizie.filter(p =>
            p.operatore === operatore.username ||
            p.operatoreId === operatore.username ||
            (p.operatore && p.operatore.includes(operatore.username))
        );

        // Prepare perizie HTML
        let perizieHtml = '<p>Nessuna perizia associata</p>';
        if (perizieDellOperatore.length > 0) {
            perizieHtml = `
                    <div class="table-responsive">
                        <table class="table table-sm table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Data</th>
                                    <th>Tipo</th>
                                    <th>Stato</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${perizieDellOperatore.slice(0, 5).map(p => `
                                    <tr>
                                        <td>${p.id}</td>
                                        <td>${new Date(p.data).toLocaleDateString('it-IT')}</td>
                                        <td>${p.tipo || 'N/D'}</td>
                                        <td>
                                            <span class="badge bg-${getStatusBadgeColor(p.stato)}">
                                                ${getStatusText(p.stato)}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ${perizieDellOperatore.length > 5 ?
                    `<p class="small text-end">Mostrate 5 di ${perizieDellOperatore.length} perizie</p>` : ''}
                    </div>
                `;
        }

        // Mostra i dettagli dell'operatore
        if (window.Swal) {
            Swal.fire({
                title: `${operatore.firstName || ''} ${operatore.lastName || ''} (${operatore.username})`,
                html: `
                        <div class="text-start">
                            <div class="d-flex justify-content-center mb-3">
                                <div class="avatar-circle" style="width: 80px; height: 80px; background-color: ${getAvatarColor(operatore.username)}; color: white; font-size: 32px;">
                                    ${getOperatorInitials(operatore)}
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p><strong>Username:</strong> ${operatore.username}</p>
                                    <p><strong>Nome:</strong> ${operatore.firstName || 'N/D'}</p>
                                    <p><strong>Cognome:</strong> ${operatore.lastName || 'N/D'}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Email:</strong> ${operatore.email || 'N/D'}</p>
                                    <p><strong>Ruolo:</strong> ${operatore.role === 'admin' ? 'Amministratore' : 'Operatore'}</p>
                                    <p><strong>Perizie:</strong> ${perizieDellOperatore.length}</p>
                                </div>
                            </div>
                            <hr>
                            <h5 class="mb-3">Perizie non assegnate</h5>
                            ${perizieHtml}
                        </div>
                    `,
                width: 700,
                confirmButtonText: 'Chiudi',
                confirmButtonColor: '#3085d6',
                showCloseButton: true
            });
        } else {
            alert(`Informazioni su ${operatore.username}: ${operatore.firstName} ${operatore.lastName}, ${operatore.email}`);
        }
    } catch (error) {
        console.error("Errore nel caricamento delle informazioni dell'operatore:", error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Impossibile caricare le informazioni dell'operatore: ${error.message}`
            });
        } else {
            alert(`Errore: ${error.message}`);
        }
    }
}

// Assegna perizie all'operatore
async function assignPerizie(operatorId) {
    try {
        // Verifica che l'utente sia amministratore
        if (!checkAdminPermission()) return;

        // Ottieni i dati dell'operatore
        const operatori = await inviaRichiesta("GET", "/api/users");
        const operatore = operatori.find(op => op.username === operatorId);

        if (!operatore) {
            throw new Error('Operatore non trovato');
        }

        // Ottieni le perizie disponibili (non assegnate)
        const perizie = window.perizie || await inviaRichiesta("GET", "/api/perizie");
        const perizieNonAssegnate = perizie.filter(p => !p.operatoreId && !p.operatore);

        // Se non ci sono perizie non assegnate
        if (perizieNonAssegnate.length === 0) {
            if (window.Swal) {
                Swal.fire({
                    icon: 'info',
                    title: 'Nessuna perizia disponibile',
                    text: 'Non ci sono perizie da assegnare.'
                });
            } else {
                alert('Non ci sono perizie da assegnare.');
            }
            return;
        }

        // Prepare perizie HTML for selection
        const perizieOptionsHtml = perizieNonAssegnate.map(p => `
            <div class="form-check mb-2">
                <input class="form-check-input perizia-checkbox" type="checkbox" value="${p.id}" id="perizia-${p.id}">
                <label class="form-check-label d-flex justify-content-between" for="perizia-${p.id}">
                    <span>${p.id}</span>
                    <small class="text-muted">${new Date(p.data).toLocaleDateString('it-IT')}</small>
                </label>
                <small class="text-muted d-block">${p.tipo || 'N/D'} - ${p.posizione?.indirizzo || 'N/D'}</small>
            </div>
        `).join('');

        // Mostra la form per l'assegnazione
        if (window.Swal) {
            Swal.fire({
                title: `Assegna perizie a ${operatore.firstName || ''} ${operatore.lastName || ''}`,
                html: `
                    <div class="text-start">
                        <p>Seleziona le perizie da assegnare:</p>
                        <div class="mb-3">
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="selectAllPerizie">
                                <label class="form-check-label fw-bold" for="selectAllPerizie">
                                    Seleziona tutte (${perizieNonAssegnate.length})
                                </label>
                            </div>
                            <hr>
                            <div style="max-height: 300px; overflow-y: auto;">
                                ${perizieOptionsHtml}
                            </div>
                        </div>
                    </div>
                `,
                width: 600,
                showCancelButton: true,
                confirmButtonText: 'Assegna',
                cancelButtonText: 'Annulla',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#dc3545',
                didOpen: () => {
                    // Add event listener to "select all" checkbox
                    document.getElementById('selectAllPerizie').addEventListener('change', function () {
                        const checkboxes = document.querySelectorAll('.perizia-checkbox');
                        checkboxes.forEach(checkbox => {
                            checkbox.checked = this.checked;
                        });
                    });
                },
                preConfirm: () => {
                    const selectedIds = Array.from(document.querySelectorAll('.perizia-checkbox:checked'))
                        .map(cb => cb.value);

                    if (selectedIds.length === 0) {
                        Swal.showValidationMessage('Seleziona almeno una perizia');
                        return false;
                    }

                    return { selectedIds };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await performAssignPerizie(operatore, result.value.selectedIds);
                }
            });
        } else {
            alert('Assegnazione perizie non disponibile. Verifica che SweetAlert2 sia caricato.');
        }
    } catch (error) {
        console.error("Errore nell'assegnazione delle perizie:", error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Impossibile assegnare perizie: ${error.message}`
            });
        } else {
            alert(`Errore: ${error.message}`);
        }
    }
}

// Esegui effettivamente l'assegnazione delle perizie
async function performAssignPerizie(operatore, perizieIds) {
    try {
        // Mostra loader
        if (window.Swal) {
            Swal.fire({
                title: 'Assegnazione in corso...',
                html: 'Attendere prego',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }

        // Verifica che le perizie non siano già assegnate
        const perizie = window.perizie || await inviaRichiesta("GET", "/api/perizie");
        const perizieGiaAssegnate = perizieIds.filter(id => {
            const perizia = perizie.find(p => p.id === id);
            return perizia && (perizia.operatoreId || perizia.operatore);
        });

        if (perizieGiaAssegnate.length > 0) {
            // Alcune perizie sono già assegnate
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: `${perizieGiaAssegnate.length === 1 ? 'La perizia' : 'Le perizie'} ${perizieGiaAssegnate.join(', ')} ${perizieGiaAssegnate.length === 1 ? 'è' : 'sono'} già ${perizieGiaAssegnate.length === 1 ? 'assegnata' : 'assegnate'} ad un operatore.`,
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert(`Alcune perizie sono già assegnate ad operatori. Operazione annullata.`);
            }
            return;
        }

        // Prepara i dati per l'aggiornamento
        const updateData = {
            operatoreId: operatore.username,
            operatore: `${operatore.firstName || ''} ${operatore.lastName || ''}`.trim() || operatore.username
        };

        // Esegui le chiamate API per aggiornare ogni perizia
        const updatePromises = perizieIds.map(id =>
            inviaRichiesta("PATCH", `/api/perizie/${id}`, updateData)
        );

        // Attendi che tutte le chiamate siano completate
        await Promise.all(updatePromises);

        // Aggiorna i dati locali
        if (window.perizie) {
            perizieIds.forEach(id => {
                const perizia = window.perizie.find(p => p.id === id);
                if (perizia) {
                    perizia.operatoreId = updateData.operatoreId;
                    perizia.operatore = updateData.operatore;
                }
            });
        }

        // Mostra messaggio di successo
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Assegnazione completata',
                text: `${perizieIds.length} perizie assegnate con successo a ${updateData.operatore}`,
                confirmButtonColor: '#28a745'
            });
        } else {
            alert(`${perizieIds.length} perizie assegnate con successo a ${updateData.operatore}`);
        }

        // Ricarica i dati
        await loadPerizie();
        loadOperatori();

    } catch (error) {
        console.error("Errore nell'assegnazione delle perizie:", error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Si è verificato un errore durante l'assegnazione: ${error.message}`,
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert(`Si è verificato un errore durante l'assegnazione: ${error.message}`);
        }
    }
}

// Modifica operatore
async function editOperatore(operatorId) {
    try {
        // Verifica che l'utente sia amministratore
        if (!checkAdminPermission()) return;

        // Ottieni i dati dell'operatore
        const operatori = await inviaRichiesta("GET", "/api/users");
        const operatore = operatori.find(op => op.username === operatorId);

        if (!operatore) {
            throw new Error('Operatore non trovato');
        }

        // Mostra la form per la modifica
        if (window.Swal) {
            Swal.fire({
                title: `Modifica Operatore: ${operatore.username}`,
                html: `
                        <form id="editOperatorForm" class="text-start">
                            <div class="mb-3">
                                <label for="editFirstName" class="form-label">Nome</label>
                                <input type="text" class="form-control" id="editFirstName" value="${operatore.firstName || ''}">
                            </div>
                            <div class="mb-3">
                                <label for="editLastName" class="form-label">Cognome</label>
                                <input type="text" class="form-control" id="editLastName" value="${operatore.lastName || ''}">
                            </div>
                            <div class="mb-3">
                                <label for="editEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="editEmail" value="${operatore.email || ''}">
                            </div>
                            <div class="mb-3">
                                <label for="editRole" class="form-label">Ruolo</label>
                                <select class="form-select" id="editRole">
                                    <option value="user" ${operatore.role !== 'admin' ? 'selected' : ''}>Operatore</option>
                                    <option value="admin" ${operatore.role === 'admin' ? 'selected' : ''}>Amministratore</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="resetPassword">
                                    <label class="form-check-label" for="resetPassword">
                                        Reimposta password
                                    </label>
                                </div>
                            </div>
                        </form>
                    `,
                width: 600,
                showCancelButton: true,
                confirmButtonText: 'Salva',
                cancelButtonText: 'Annulla',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#dc3545',
                preConfirm: () => {
                    return {
                        firstName: document.getElementById('editFirstName').value,
                        lastName: document.getElementById('editLastName').value,
                        email: document.getElementById('editEmail').value,
                        role: document.getElementById('editRole').value,
                        resetPassword: document.getElementById('resetPassword').checked
                    };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await updateOperatore(operatorId, result.value);
                }
            });
        } else {
            alert('Modifica operatore non disponibile. Verifica che SweetAlert2 sia caricato.');
        }
    } catch (error) {
        console.error("Errore nella modifica dell'operatore:", error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Impossibile modificare l'operatore: ${error.message}`
            });
        } else {
            alert(`Errore: ${error.message}`);
        }
    }
}

// Aggiorna operatore
async function updateOperatore(operatorId, updateData) {
    try {
        // Mostra loader
        if (window.Swal) {
            Swal.fire({
                title: 'Aggiornamento in corso...',
                html: 'Attendere prego',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }

        // Gestisci il reset della password se richiesto
        if (updateData.resetPassword) {
            updateData.password = 'changeme';
            updateData.firstLogin = true;
            delete updateData.resetPassword;
        }

        // Esegui la chiamata API per aggiornare l'operatore
        await inviaRichiesta("PATCH", `/api/users/${operatorId}`, updateData);

        // Mostra messaggio di successo
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Aggiornamento completato',
                text: `Operatore ${operatorId} aggiornato con successo`,
                confirmButtonColor: '#28a745'
            });
        } else {
            alert(`Operatore ${operatorId} aggiornato con successo`);
        }

        // Ricarica i dati
        loadOperatori();

    } catch (error) {
        console.error("Errore nell'aggiornamento dell'operatore:", error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Si è verificato un errore durante l'aggiornamento: ${error.message}`,
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert(`Si è verificato un errore durante l'aggiornamento: ${error.message}`);
        }
    }
}

// Elimina operatore
async function deleteOperatore(operatorId) {
    try {
        // Verifica che l'utente sia amministratore
        if (!checkAdminPermission()) return;

        // Chiedi conferma prima di procedere
        let confirmDelete = false;

        if (window.Swal) {
            const result = await Swal.fire({
                title: 'Conferma eliminazione',
                text: `Sei sicuro di voler eliminare l'operatore ${operatorId}? Questa azione non può essere annullata.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sì, elimina',
                cancelButtonText: 'Annulla',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6'
            });

            confirmDelete = result.isConfirmed;
        } else {
            confirmDelete = confirm(`Sei sicuro di voler eliminare l'operatore ${operatorId}? Questa azione non può essere annullata.`);
        }

        if (!confirmDelete) return;

        // Mostra loader
        if (window.Swal) {
            Swal.fire({
                title: 'Eliminazione in corso...',
                html: 'Attendere prego',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }

        // Esegui la chiamata API per eliminare l'operatore
        await inviaRichiesta("DELETE", `/api/users/${operatorId}`);

        // Mostra messaggio di successo
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Eliminazione completata',
                text: `Operatore ${operatorId} eliminato con successo`,
                confirmButtonColor: '#28a745'
            });
        } else {
            alert(`Operatore ${operatorId} eliminato con successo`);
        }

        // Ricarica i dati
        loadOperatori();

    } catch (error) {
        console.error("Errore nell'eliminazione dell'operatore:", error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Si è verificato un errore durante l'eliminazione: ${error.message}`,
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert(`Si è verificato un errore durante l'eliminazione: ${error.message}`);
        }
    }
}

// Funzione per aggiungere un nuovo operatore
async function addOperatore() {
    try {
        // Verifica che l'utente sia amministratore
        if (!checkAdminPermission()) return;

        // Mostra la form per l'aggiunta
        if (window.Swal) {
            Swal.fire({
                title: 'Aggiungi Nuovo Operatore',
                html: `
                    <form id="addOperatorForm" class="text-start">
                        <div class="mb-3">
                            <label for="newFirstName" class="form-label">Nome*</label>
                            <input type="text" class="form-control" id="newFirstName" required>
                        </div>
                        <div class="mb-3">
                            <label for="newLastName" class="form-label">Cognome*</label>
                            <input type="text" class="form-control" id="newLastName" required>
                        </div>
                        <div class="mb-3">
                            <label for="newEmail" class="form-label">Email*</label>
                            <input type="email" class="form-control" id="newEmail" required>
                        </div>
                        <div class="mb-3">
                            <label for="newRole" class="form-label">Ruolo</label>
                            <select class="form-select" id="newRole">
                                <option value="user" selected>Operatore</option>
                                <option value="admin">Amministratore</option>
                            </select>
                        </div>
                        <p class="small text-muted">*Campi obbligatori. L'username verrà generato automaticamente e la password iniziale sarà "password".</p>
                    </form>
                `,
                width: 600,
                showCancelButton: true,
                confirmButtonText: 'Crea Operatore',
                cancelButtonText: 'Annulla',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#dc3545',
                preConfirm: () => {
                    const firstName = document.getElementById('newFirstName').value?.trim();
                    const lastName = document.getElementById('newLastName').value?.trim();
                    const email = document.getElementById('newEmail').value?.trim();

                    if (!firstName) {
                        Swal.showValidationMessage('Nome obbligatorio');
                        return false;
                    }

                    if (!lastName) {
                        Swal.showValidationMessage('Cognome obbligatorio');
                        return false;
                    }

                    if (!email) {
                        Swal.showValidationMessage('Email obbligatoria');
                        return false;
                    }

                    // Genera username: prima lettera del nome + cognome, tutto minuscolo
                    const username = (firstName.charAt(0) + lastName).toLowerCase()
                        .replace(/\s+/g, '') // rimuovi spazi
                        .replace(/[^a-z0-9]/gi, ''); // rimuovi caratteri speciali

                    return {
                        firstName,
                        lastName,
                        email,
                        username,
                        role: document.getElementById('newRole').value
                    };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Aggiungi password e firstLogin
                    const userData = {
                        ...result.value,
                        password: 'password',
                        firstLogin: true
                    };

                    // Mostra lo username generato
                    await Swal.fire({
                        title: 'Username Generato',
                        html: `
                            <p>È stato generato il seguente username:</p>
                            <h4 class="mb-4">${userData.username}</h4>
                            <p>La password iniziale è: <strong>password</strong></p>
                            <p>L'utente dovrà cambiarla al primo accesso.</p>
                        `,
                        icon: 'info',
                        confirmButtonText: 'Conferma',
                        showCancelButton: true,
                        cancelButtonText: 'Annulla'
                    }).then(async (confirmResult) => {
                        if (confirmResult.isConfirmed) {
                            await createOperatore(userData);
                        }
                    });
                }
            });
        } else {
            alert('Aggiunta operatore non disponibile. Verifica che SweetAlert2 sia caricato.');
        }
    } catch (error) {
        console.error("Errore nell'aggiunta dell'operatore:", error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Impossibile aggiungere l'operatore: ${error.message}`
            });
        } else {
            alert(`Errore: ${error.message}`);
        }
    }
}

// Crea nuovo operatore
async function createOperatore(userData) {
    try {
        // Mostra loader
        if (window.Swal) {
            Swal.fire({
                title: 'Creazione in corso...',
                html: 'Attendere prego',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }

        // Esegui la chiamata API per creare l'operatore
        await inviaRichiesta("POST", "/api/users", userData);

        // Mostra messaggio di successo
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: 'Operatore creato',
                text: `Operatore ${userData.username} creato con successo`,
                confirmButtonColor: '#28a745'
            });
        } else {
            alert(`Operatore ${userData.username} creato con successo`);
        }

        // Ricarica i dati
        loadOperatori();

    } catch (error) {
        console.error("Errore nella creazione dell'operatore:", error);
        if (window.Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Errore',
                text: `Si è verificato un errore durante la creazione: ${error.message}`,
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert(`Si è verificato un errore durante la creazione: ${error.message}`);
        }
    }
}

// Funzioni di supporto
function getStatusBadgeColor(stato, operatoreId) {
    if (operatoreId) {
        return 'warning'; // Giallo per "In esecuzione"
    }

    if (!operatoreId) {
        return 'secondary'; // Grigio per "In attesa"
    }

    switch (stato) {
        case 'completed': return 'success';
        case 'in_progress': return 'warning';
        case 'scheduled': return 'info';
        case 'pending': return 'secondary';
        default: return 'secondary';
    }
}


function getStatusText(stato, operatoreId) {
    // Se la perizia è assegnata, mostra "In esecuzione" indipendentemente dallo stato
    if (operatoreId) {
        return 'In esecuzione';
    }

    // Altrimenti mostra "In attesa" o lo stato originale
    if (!operatoreId) {
        return 'In attesa';
    }

    switch (stato) {
        case 'completed': return 'Completata';
        case 'in_progress': return 'In corso';
        case 'scheduled': return 'Pianificata';
        case 'pending': return 'In attesa';
        default: return 'N/D';
    }


}

// Aggiungi l'event listener per il link Operatori nella barra di navigazione
window.addOperatore = async function () {
    try {
        // Verifica che l'utente sia amministratore
        if (!checkAdminPermission()) return;

        // Mostra la form per l'aggiunta
        if (window.Swal) {
            Swal.fire({
                title: 'Aggiungi Nuovo Operatore',
                html: `
                    <form id="addOperatorForm" class="text-start">
                        <div class="mb-3">
                            <label for="newFirstName" class="form-label">Nome*</label>
                            <input type="text" class="form-control" id="newFirstName" required>
                        </div>
                        <div class="mb-3">
                            <label for="newLastName" class="form-label">Cognome*</label>
                            <input type="text" class="form-control" id="newLastName" required>
                        </div>
                        <div class="mb-3">
                            <label for="newEmail" class="form-label">Email*</label>
                            <input type="email" class="form-control" id="newEmail" required>
                        </div>
                        <div class="mb-3">
                            <label for="newRole" class="form-label">Ruolo</label>
                            <select class="form-select" id="newRole">
                                <option value="user" selected>Operatore</option>
                                <option value="admin">Amministratore</option>
                            </select>
                        </div>
                        <p class="small text-muted">*Campi obbligatori. L'username verrà generato automaticamente e la password iniziale sarà "password".</p>
                    </form>
                `,
                width: 600,
                showCancelButton: true,
                confirmButtonText: 'Crea Operatore',
                cancelButtonText: 'Annulla',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#dc3545',
                preConfirm: () => {
                    const firstName = document.getElementById('newFirstName').value?.trim();
                    const lastName = document.getElementById('newLastName').value?.trim();
                    const email = document.getElementById('newEmail').value?.trim();

                    if (!firstName) {
                        Swal.showValidationMessage('Nome obbligatorio');
                        return false;
                    }

                    if (!lastName) {
                        Swal.showValidationMessage('Cognome obbligatorio');
                        return false;
                    }

                    if (!email) {
                        Swal.showValidationMessage('Email obbligatoria');
                        return false;
                    }

                    // Genera username: prima lettera del nome + cognome, tutto minuscolo
                    const username = (firstName.charAt(0) + lastName).toLowerCase()
                        .replace(/\s+/g, '') // rimuovi spazi
                        .replace(/[^a-z0-9]/gi, ''); // rimuovi caratteri speciali

                    return {
                        firstName,
                        lastName,
                        email,
                        username,
                        role: document.getElementById('newRole').value
                    };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Aggiungi password e firstLogin
                    const userData = {
                        ...result.value,
                        password: 'password',
                        firstLogin: true
                    };

                    // Mostra lo username generato
                    await Swal.fire({
                        title: 'Username Generato',
                        html: `
                            <p>È stato generato il seguente username:</p>
                            <h4 class="mb-4">${userData.username}</h4>
                            <p>La password iniziale è: <strong>password</strong></p>
                            <p>L'utente dovrà cambiarla al primo accesso.</p>
                        `,
                        icon: 'info',
                        confirmButtonText: 'Conferma',
                        showCancelButton: true,
                        cancelButtonText: 'Annulla'
                    }).then(async (confirmResult) => {
                        if (confirmResult.isConfirmed) {
                            await createOperatore(userData);
                        }
                    });
                }
            });
        } else {
            alert('Aggiunta operatore non disponibile. Verifica che SweetAlert2 sia caricato.');
        }
    } catch (error) {
        console.error("Errore nell'aggiunta dell'operatore:", error);
        sweetalert('Errore', `Impossibile aggiungere l'operatore: ${error.message}`, 'error', 'Chiudi', '#dc3545');
    }
};

function sweetalert(title, text, icon, confirmButtonText, color) {
    if (window.Swal) {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            color: color,
            confirmButtonText: confirmButtonText,
        });
    }
}
const sweetAlertScript = document.createElement('script');
sweetAlertScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
document.head.appendChild(sweetAlertScript);

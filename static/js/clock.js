/**
 * Horloge Infernale - Sélection de date pour la migration NIRD
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        maxClicks: 50, // Nombre de clics avant inversion
        hardcoreMode: true, // Mode hardcore activé par défaut
        targetDate: null, // Date cible (sera définie dynamiquement)
        minClicksRequired: 7, // Exactement 7 clics requis
        requiredDiff: null, // Différence nécessaire pour atteindre la date
        solutionSequence: [], // Séquence de 7 clics qui mène à la solution
        buttonValues: {
            day: null,
            month: null,
            year: null,
            dayNeg: null
        },
        seventhClickOptions: [], // 4 lignes x 4 colonnes pour le 7ème clic
        correctSeventhClick: null // La bonne réponse pour le 7ème clic
    };
    
    // État
    let state = {
        currentDate: new Date(),
        clicks: 0,
        inverted: false,
        validated: false
    };
    
    // Plus besoin de générer une séquence complète, on calcule juste au 6ème clic
    function generateSolutionSequence() {
        // Cette fonction est gardée pour compatibilité mais ne fait plus grand chose
        // La vraie logique est dans generateRandomButtonValues au 6ème clic
        console.log('🎯 Solution garantie : au 6ème clic, le 7ème aura la bonne valeur');
    }
    
    // Calculer la différence restante pour atteindre la date cible
    function calculateRemainingDifference() {
        const target = CONFIG.targetDate;
        const current = state.currentDate;
        
        // Calculer la différence en années, mois, jours
        const targetYear = target.getFullYear();
        const targetMonth = target.getMonth();
        const targetDay = target.getDate();
        
        const currentYear = current.getFullYear();
        const currentMonth = current.getMonth();
        const currentDay = current.getDate();
        
        const years = targetYear - currentYear;
        const months = targetMonth - currentMonth;
        const days = targetDay - currentDay;
        
        return { days, months, years };
    }
    
    // Générer 16 propositions pour le 7ème clic (4 lignes x 4 colonnes) avec + et -
    function generateSeventhClickOptions() {
        const remaining = calculateRemainingDifference();
        
        // Déterminer la bonne réponse
        let correctAnswer = null;
        let correctType = null;
        let correctSign = '+';
        
        // Priorité : années > mois > jours
        if (remaining.years !== 0) {
            correctAnswer = Math.abs(remaining.years);
            correctType = 'year';
            correctSign = remaining.years > 0 ? '+' : '-';
        } else if (remaining.months !== 0) {
            correctAnswer = Math.abs(remaining.months);
            correctType = 'month';
            correctSign = remaining.months > 0 ? '+' : '-';
        } else if (remaining.days !== 0) {
            correctAnswer = Math.abs(remaining.days);
            correctType = 'day';
            correctSign = remaining.days > 0 ? '+' : '-';
        } else {
            // Si déjà à la bonne date (ne devrait pas arriver)
            correctAnswer = 0;
            correctType = 'day';
            correctSign = '+';
        }
        
        // Stocker la bonne réponse pour la validation
        CONFIG.correctSeventhClick = { 
            value: correctAnswer, 
            type: correctType,
            sign: correctSign,
            originalRemaining: remaining
        };
        
        // Générer 15 valeurs incorrectes avec des signes aléatoires
        const options = [];
        const usedCombinations = new Set([`${correctSign}${correctAnswer}`]);
        
        // Ajouter la bonne réponse
        options.push({
            value: correctAnswer,
            sign: correctSign,
            isCorrect: true
        });
        
        // Générer des valeurs incorrectes
        for (let i = 0; i < 15; i++) {
            let value;
            let sign;
            let combination;
            let attempts = 0;
            
            do {
                // Générer un signe aléatoire
                sign = Math.random() < 0.5 ? '+' : '-';
                
                // Générer une valeur proche de la bonne réponse ou aléatoire
                if (Math.random() < 0.5 && correctAnswer > 0) {
                    // Valeur proche (±5)
                    value = Math.max(1, correctAnswer + Math.floor(Math.random() * 10) - 5);
                } else {
                    // Valeur aléatoire selon le type
                    if (correctType === 'year') {
                        value = Math.floor(Math.random() * 3) + 1;
                    } else if (correctType === 'month') {
                        value = Math.floor(Math.random() * 12) + 1;
                    } else {
                        value = Math.floor(Math.random() * 30) + 1;
                    }
                }
                
                combination = `${sign}${value}`;
                attempts++;
            } while (usedCombinations.has(combination) && attempts < 100);
            
            options.push({
                value: value,
                sign: sign,
                isCorrect: false
            });
            usedCombinations.add(combination);
        }
        
        // Mélanger les options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        
        // Organiser en 4 lignes de 4 valeurs
        CONFIG.seventhClickOptions = [];
        for (let row = 0; row < 4; row++) {
            CONFIG.seventhClickOptions[row] = [];
            for (let col = 0; col < 4; col++) {
                const index = row * 4 + col;
                CONFIG.seventhClickOptions[row][col] = options[index];
            }
        }
        
        console.log('🎯 7ème clic - Différence restante:', remaining);
        console.log('🎯 Bonne réponse:', correctSign, correctAnswer, 'Type:', correctType);
        console.log('🎯 Options générées:', CONFIG.seventhClickOptions);
        
        return CONFIG.seventhClickOptions;
    }
    
    // Générer des valeurs qui changent à chaque clic
    function generateRandomButtonValues(clickIndex = 0) {
        // Si on vient de faire le 6ème clic (clickIndex = 6), générer les 16 propositions
        if (clickIndex === 6) {
            // Cacher la date et afficher le message
            hideDateAndShowMessage();
            // Générer les options pour le 7ème clic
            generateSeventhClickOptions();
            showSeventhClickInterface();
        } else {
            // Pour les 6 premiers clics, valeurs complètement aléatoires
            CONFIG.buttonValues.day = Math.floor(Math.random() * 30) + 1;
            CONFIG.buttonValues.month = Math.floor(Math.random() * 12) + 1;
            CONFIG.buttonValues.year = Math.floor(Math.random() * 3) + 1;
            CONFIG.buttonValues.dayNeg = Math.floor(Math.random() * 30) + 1;
            updateButtonLabels();
        }
    }
    
    // Cacher la date et afficher le message au 6ème clic
    function hideDateAndShowMessage() {
        const dateDisplay = document.getElementById('clock-date-display');
        if (dateDisplay) {
            dateDisplay.style.display = 'none';
        }
        
        // Créer ou mettre à jour le message
        let messageEl = document.getElementById('clock-remember-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'clock-remember-message';
            messageEl.className = 'clock-remember-message';
            const dateDisplay = document.getElementById('clock-date-display');
            if (dateDisplay && dateDisplay.parentNode) {
                dateDisplay.parentNode.insertBefore(messageEl, dateDisplay.nextSibling);
            }
        }
        
        messageEl.textContent = '💭 Rappelez-vous du compteur de clics ?';
        messageEl.style.display = 'block';
    }
    
    // Afficher l'interface du 7ème clic (4 lignes x 4 colonnes)
    function showSeventhClickInterface() {
        const controls = document.querySelector('.clock-controls');
        if (!controls) return;
        
        // Cacher les boutons normaux
        controls.style.display = 'none';
        
        // Créer le container pour les 16 propositions
        let gridContainer = document.getElementById('clock-seventh-grid');
        if (!gridContainer) {
            gridContainer = document.createElement('div');
            gridContainer.id = 'clock-seventh-grid';
            gridContainer.className = 'clock-seventh-grid';
            controls.parentNode.insertBefore(gridContainer, controls.nextSibling);
        }
        
        gridContainer.innerHTML = '';
        gridContainer.style.display = 'grid';
        
        // Créer les 4 lignes de 4 boutons avec signes + et -
        CONFIG.seventhClickOptions.forEach((row, rowIndex) => {
            row.forEach((option, colIndex) => {
                const button = document.createElement('button');
                button.className = 'clock-seventh-btn';
                
                // Afficher avec le signe
                button.textContent = `${option.sign}${option.value}`;
                button.dataset.value = option.value;
                button.dataset.sign = option.sign;
                button.dataset.isCorrect = option.isCorrect;
                
                // Style différent pour les valeurs négatives
                if (option.sign === '-') {
                    button.classList.add('negative');
                }
                
                // Ajouter un événement de clic
                button.addEventListener('click', () => handleSeventhClick(option.value, option.sign, option.isCorrect));
                
                gridContainer.appendChild(button);
            });
        });
    }
    
    // Gérer le clic sur une des 16 propositions
    function handleSeventhClick(value, sign, isCorrect) {
        // Appliquer la modification selon le type de la bonne réponse
        if (isCorrect) {
            const correct = CONFIG.correctSeventhClick;
            const actualValue = sign === '+' ? value : -value;
            
            if (correct.type === 'year' || correct.type === 'yearNeg') {
                adjustDate(0, 0, actualValue);
            } else if (correct.type === 'month' || correct.type === 'monthNeg') {
                adjustDate(0, actualValue, 0);
            } else if (correct.type === 'day' || correct.type === 'dayNeg') {
                adjustDate(actualValue, 0, 0);
            }
        } else {
            // Mauvaise réponse - appliquer quand même pour montrer l'erreur
            const actualValue = sign === '+' ? value : -value;
            adjustDate(actualValue, 0, 0);
        }
        
        // Réafficher la date
        const dateDisplay = document.getElementById('clock-date-display');
        if (dateDisplay) {
            dateDisplay.style.display = 'block';
        }
        
        // Cacher le message
        const rememberMessage = document.getElementById('clock-remember-message');
        if (rememberMessage) {
            rememberMessage.style.display = 'none';
        }
        
        // Cacher la grille et réafficher les boutons normaux
        const gridContainer = document.getElementById('clock-seventh-grid');
        if (gridContainer) {
            gridContainer.style.display = 'none';
        }
        const controls = document.querySelector('.clock-controls');
        if (controls) {
            controls.style.display = 'flex';
        }
    }
    
    
    // Mettre à jour les labels des boutons (4 boutons seulement)
    function updateButtonLabels() {
        const btnDay = document.getElementById('clock-btn-day');
        const btnMonth = document.getElementById('clock-btn-month');
        const btnYear = document.getElementById('clock-btn-year');
        const btnDayNeg = document.getElementById('clock-btn-day-neg');
        
        if (btnDay && CONFIG.buttonValues.day !== null) {
            btnDay.textContent = `+${CONFIG.buttonValues.day} jour${CONFIG.buttonValues.day > 1 ? 's' : ''}`;
        }
        if (btnMonth && CONFIG.buttonValues.month !== null) {
            btnMonth.textContent = `+${CONFIG.buttonValues.month} mois`;
        }
        if (btnYear && CONFIG.buttonValues.year !== null) {
            btnYear.textContent = `+${CONFIG.buttonValues.year} an${CONFIG.buttonValues.year > 1 ? 's' : ''}`;
        }
        if (btnDayNeg && CONFIG.buttonValues.dayNeg !== null) {
            btnDayNeg.textContent = `-${CONFIG.buttonValues.dayNeg} jour${CONFIG.buttonValues.dayNeg > 1 ? 's' : ''}`;
        }
    }
    
    // Initialisation
    function initClock(targetDateString) {
        if (targetDateString) {
            const [day, month, year] = targetDateString.split('/');
            CONFIG.targetDate = new Date(year, month - 1, day);
        } else {
            // Date par défaut : 10/12/2025
            CONFIG.targetDate = new Date(2025, 11, 10);
        }
        
        state.currentDate = new Date(2025, 0, 1); // Date de départ : 01/01/2025
        
        renderClock();
        setupControls();
        updateDateDisplay();
        
        // Générer les valeurs pour le premier clic (après que les éléments existent)
        generateRandomButtonValues(0);
        displayTargetDate();
        displayClicksInfo();
    }
    
    // Afficher l'information sur les 7 clics requis
    function displayClicksInfo() {
        const infoEl = document.getElementById('clock-clicks-info');
        if (infoEl) {
            infoEl.textContent = `⚠️ Il faut exactement ${CONFIG.minClicksRequired} clics pour atteindre la date cible !`;
        }
    }
    
    // Afficher la date cible
    function displayTargetDate() {
        const targetDisplay = document.getElementById('clock-target-date');
        if (targetDisplay && CONFIG.targetDate) {
            targetDisplay.textContent = `Date de migration vers le NIRD : ${formatDate(CONFIG.targetDate)}`;
        }
    }
    
    // Rendu de l'horloge
    function renderClock() {
        const clockWrapper = document.getElementById('clock-wrapper');
        if (!clockWrapper) return;
        
        clockWrapper.innerHTML = `
            <div class="clock-face">
                <div class="clock-numbers">
                    <span class="clock-number">1</span>
                    <span class="clock-number">2</span>
                    <span class="clock-number">3</span>
                    <span class="clock-number">4</span>
                    <span class="clock-number">5</span>
                    <span class="clock-number">6</span>
                    <span class="clock-number">7</span>
                    <span class="clock-number">8</span>
                </div>
                <div class="clock-hand hour" id="hour-hand"></div>
                <div class="clock-hand minute" id="minute-hand"></div>
                <div class="clock-center"></div>
            </div>
        `;
        
        updateClockHands();
    }
    
    // Mise à jour des aiguilles
    function updateClockHands() {
        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        
        if (!hourHand || !minuteHand) return;
        
        // Calculer l'angle basé sur le nombre de clics
        // Chaque clic = 30 minutes symboliques
        const totalMinutes = state.clicks * 30;
        const hours = Math.floor(totalMinutes / 60) % 12;
        const minutes = totalMinutes % 60;
        
        const hourAngle = (hours * 30) + (minutes * 0.5);
        const minuteAngle = minutes * 6;
        
        hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
        minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
    }
    
    // Configuration des contrôles
    function setupControls() {
        const btnDay = document.getElementById('clock-btn-day');
        const btnDayNeg = document.getElementById('clock-btn-day-neg');
        const btnMonth = document.getElementById('clock-btn-month');
        const btnYear = document.getElementById('clock-btn-year');
        const btnValidate = document.getElementById('clock-btn-validate');
        const btnReset = document.getElementById('clock-btn-reset');
        
        if (btnDay) {
            btnDay.addEventListener('click', () => {
                const value = CONFIG.buttonValues.day || 1;
                adjustDate(value, 0, 0);
                // Régénérer les valeurs pour le prochain clic
                generateRandomButtonValues(state.clicks);
            });
        }
        if (btnDayNeg) {
            btnDayNeg.addEventListener('click', () => {
                const value = CONFIG.buttonValues.dayNeg || 1;
                adjustDate(-value, 0, 0);
                generateRandomButtonValues(state.clicks);
            });
        }
        if (btnMonth) {
            btnMonth.addEventListener('click', () => {
                const value = CONFIG.buttonValues.month || 1;
                adjustDate(0, value, 0);
                generateRandomButtonValues(state.clicks);
            });
        }
        if (btnYear) {
            btnYear.addEventListener('click', () => {
                const value = CONFIG.buttonValues.year || 1;
                adjustDate(0, 0, value);
                generateRandomButtonValues(state.clicks);
            });
        }
        if (btnValidate) {
            btnValidate.addEventListener('click', validateDate);
        }
        if (btnReset) {
            btnReset.addEventListener('click', resetClock);
        }
        
        const btnHint = document.getElementById('clock-btn-hint');
        const btnReload = document.getElementById('clock-btn-reload');
        
        if (btnHint) {
            btnHint.addEventListener('click', showHint);
        }
        if (btnReload) {
            btnReload.addEventListener('click', reloadClock);
        }
    }
    
    // Afficher un indice
    function showHint() {
        const messageEl = document.getElementById('clock-validation-message');
        if (!messageEl) return;
        
        messageEl.textContent = '💡 Calcul mental requis ! Les valeurs des boutons changent à chaque clic.';
        messageEl.className = 'clock-validation-message';
        messageEl.style.display = 'block';
        messageEl.style.background = 'rgba(251, 191, 36, 0.2)';
        messageEl.style.color = '#fbbf24';
        messageEl.style.border = '2px solid #fbbf24';
        
        // Faire disparaître après 5 secondes
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
    
    // Recharger l'horloge (réinitialise date + valeurs + nouvelle séquence)
    function reloadClock() {
        state.currentDate = new Date(2025, 0, 1); // Date de départ : 01/01/2025
        state.clicks = 0;
        state.inverted = false;
        state.validated = false;
        
        // Réactiver les boutons
        document.querySelectorAll('.clock-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
        
        // Cacher le message de validation
        const validationMessage = document.getElementById('clock-validation-message');
        if (validationMessage) {
            validationMessage.style.display = 'none';
            validationMessage.textContent = '';
            validationMessage.className = 'clock-validation-message';
        }
        
        // Cacher la grille du 7ème clic si elle existe (IMPORTANT : même pendant le 7ème clic)
        const gridContainer = document.getElementById('clock-seventh-grid');
        if (gridContainer) {
            gridContainer.style.display = 'none';
            gridContainer.innerHTML = ''; // Vider le contenu pour éviter les références
        }
        
        // Réafficher la date
        const dateDisplay = document.getElementById('clock-date-display');
        if (dateDisplay) {
            dateDisplay.style.display = 'block';
        }
        
        // Cacher le message de rappel
        const rememberMessage = document.getElementById('clock-remember-message');
        if (rememberMessage) {
            rememberMessage.style.display = 'none';
        }
        
        // Réafficher les boutons normaux (IMPORTANT : même si la grille était affichée)
        const controls = document.querySelector('.clock-controls');
        if (controls) {
            controls.style.display = 'flex';
        }
        
        // Réinitialiser les options du 7ème clic
        CONFIG.seventhClickOptions = [];
        CONFIG.correctSeventhClick = null;
        
        // Régénérer la séquence de solution
        generateSolutionSequence();
        
        // Régénérer les valeurs pour le premier clic
        generateRandomButtonValues(0);
        
        // Mettre à jour l'affichage
        updateClockHands();
        updateDateDisplay();
        updateClickCounter();
        displayClicksInfo();
        
        console.log('🔄 Horloge rechargée');
    }
    
    // Réinitialiser l'horloge
    function resetClock() {
        state.currentDate = new Date(2025, 0, 1); // Date de départ : 01/01/2025
        state.clicks = 0;
        state.inverted = false;
        state.validated = false;
        
        // Réactiver les boutons
        document.querySelectorAll('.clock-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
        
        // Cacher le message de validation
        const validationMessage = document.getElementById('clock-validation-message');
        if (validationMessage) {
            validationMessage.style.display = 'none';
            validationMessage.textContent = '';
            validationMessage.className = 'clock-validation-message';
        }
        
        // Cacher la grille du 7ème clic si elle existe
        const gridContainer = document.getElementById('clock-seventh-grid');
        if (gridContainer) {
            gridContainer.style.display = 'none';
        }
        
        // Réafficher la date
        const dateDisplay = document.getElementById('clock-date-display');
        if (dateDisplay) {
            dateDisplay.style.display = 'block';
        }
        
        // Cacher le message de rappel
        const rememberMessage = document.getElementById('clock-remember-message');
        if (rememberMessage) {
            rememberMessage.style.display = 'none';
        }
        
        // Réafficher les boutons normaux
        const controls = document.querySelector('.clock-controls');
        if (controls) {
            controls.style.display = 'flex';
        }
        
        // Régénérer la séquence de solution
        generateSolutionSequence();
        
        // Régénérer les valeurs pour le premier clic
        generateRandomButtonValues(0);
        
        // Mettre à jour l'affichage
        updateClockHands();
        updateDateDisplay();
        updateClickCounter();
        displayClicksInfo();
        
        console.log('🔄 Horloge réinitialisée');
    }
    
    // Ajuster la date
    function adjustDate(days, months, years) {
        if (state.validated) return;
        
        state.clicks++;
        
        // Vérifier si on dépasse le nombre max de clics
        if (state.clicks > CONFIG.maxClicks) {
            state.inverted = !state.inverted;
        }
        
        // Appliquer l'inversion si nécessaire
        const multiplier = state.inverted ? -1 : 1;
        days *= multiplier;
        months *= multiplier;
        years *= multiplier;
        
        // Ajuster la date (avec protection contre les dates invalides)
        const newDate = new Date(state.currentDate);
        const originalDate = newDate.getDate();
        newDate.setDate(newDate.getDate() + days);
        newDate.setMonth(newDate.getMonth() + months);
        newDate.setFullYear(newDate.getFullYear() + years);
        
        // Vérifier que la date est valide (protection contre dépassement)
        if (isNaN(newDate.getTime())) {
            console.warn('⚠️ Date invalide générée, utilisation de la date précédente');
            return;
        }
        
        state.currentDate = newDate;
        
        // Mode hardcore : déplacer les boutons
        if (CONFIG.hardcoreMode) {
            moveButtons();
        }
        
        updateClockHands();
        updateDateDisplay();
        updateClickCounter();
    }
    
    // Déplacer les boutons (mode hardcore)
    function moveButtons() {
        const buttons = document.querySelectorAll('.clock-btn:not(.clock-validation-btn)');
        buttons.forEach(btn => {
            btn.classList.add('moved');
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            btn.style.transform = `translate(${randomX}px, ${randomY}px)`;
            
            setTimeout(() => {
                btn.classList.remove('moved');
            }, 500);
        });
    }
    
    // Mise à jour de l'affichage de la date
    function updateDateDisplay() {
        const display = document.getElementById('clock-date-display');
        if (!display) return;
        
        const day = String(state.currentDate.getDate()).padStart(2, '0');
        const month = String(state.currentDate.getMonth() + 1).padStart(2, '0');
        const year = state.currentDate.getFullYear();
        
        display.textContent = `${day}/${month}/${year}`;
        
        if (state.inverted) {
            display.style.color = '#ef4444';
            display.style.animation = 'pulse 1s infinite';
        } else {
            display.style.color = 'var(--accent)';
            display.style.animation = 'none';
        }
    }
    
    // Mise à jour du compteur de clics
    function updateClickCounter() {
        const counter = document.getElementById('clock-click-counter');
        if (!counter) return;
        
        counter.textContent = `Clics: ${state.clicks}${state.inverted ? ' (INVERSÉ!)' : ''}`;
        
        counter.className = 'clock-click-counter';
        if (state.clicks > CONFIG.maxClicks * 0.7) {
            counter.classList.add('warning');
        }
        if (state.clicks > CONFIG.maxClicks) {
            counter.classList.add('danger');
        }
    }
    
    // Valider la date
    function validateDate() {
        if (state.validated) return;
        
        const messageEl = document.getElementById('clock-validation-message');
        if (!messageEl) {
            console.error('❌ Élément clock-validation-message non trouvé');
            return;
        }
        
        // Afficher le message
        messageEl.style.display = 'block';
        
        // Vérifier le nombre exact de clics
        if (state.clicks < CONFIG.minClicksRequired) {
            messageEl.textContent = `❌ Pas assez de clics ! Il faut exactement ${CONFIG.minClicksRequired} clics (vous avez ${state.clicks} clics).`;
            messageEl.className = 'clock-validation-message error';
            messageEl.style.display = 'block';
            return;
        }
        
        if (state.clicks > CONFIG.minClicksRequired) {
            messageEl.textContent = `❌ Trop de clics ! Il faut exactement ${CONFIG.minClicksRequired} clics (vous avez ${state.clicks} clics).`;
            messageEl.className = 'clock-validation-message error';
            messageEl.style.display = 'block';
            return;
        }
        
        const currentDay = state.currentDate.getDate();
        const currentMonth = state.currentDate.getMonth() + 1;
        const currentYear = state.currentDate.getFullYear();
        
        const targetDay = CONFIG.targetDate.getDate();
        const targetMonth = CONFIG.targetDate.getMonth() + 1;
        const targetYear = CONFIG.targetDate.getFullYear();
        
        const isCorrect = currentDay === targetDay && 
                         currentMonth === targetMonth && 
                         currentYear === targetYear;
        
        if (isCorrect) {
            state.validated = true;
            messageEl.textContent = `✅ Date correcte ! Migration NIRD validée en ${state.clicks} clics.`;
            messageEl.className = 'clock-validation-message success';
            
            // Désactiver les boutons
            document.querySelectorAll('.clock-btn').forEach(btn => {
                btn.disabled = true;
                btn.classList.add('disabled');
            });
            
            // Émettre un événement personnalisé
            const event = new CustomEvent('clockValidated', {
                detail: { date: state.currentDate, clicks: state.clicks }
            });
            document.dispatchEvent(event);
        } else {
            messageEl.textContent = `❌ Date incorrecte. Attendu: ${formatDate(CONFIG.targetDate)}, Actuel: ${formatDate(state.currentDate)}`;
            messageEl.className = 'clock-validation-message error';
            messageEl.style.display = 'block';
        }
        
        console.log('🔍 Validation:', {
            current: formatDate(state.currentDate),
            target: formatDate(CONFIG.targetDate),
            clicks: state.clicks,
            minRequired: CONFIG.minClicksRequired,
            isCorrect
        });
    }
    
    // Formater une date
    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    // Activer le mode hardcore
    function enableHardcoreMode() {
        CONFIG.hardcoreMode = true;
        const controls = document.querySelector('.clock-controls');
        if (controls) {
            controls.classList.add('hardcore');
        }
        
        // Changer les labels des boutons
        const btnDay = document.getElementById('clock-btn-day');
        const btnMonth = document.getElementById('clock-btn-month');
        const btnYear = document.getElementById('clock-btn-year');
        
        if (btnDay) btnDay.textContent = `+${Math.floor(Math.random() * 20) + 10} jours`;
        if (btnMonth) btnMonth.textContent = `+${Math.floor(Math.random() * 6) + 2} mois`;
        if (btnYear) btnYear.textContent = `+${Math.floor(Math.random() * 3) + 1} an(s)`;
    }
    
    // Exposer les fonctions publiques
    window.ClockInfernal = {
        init: initClock,
        enableHardcore: enableHardcoreMode,
        getState: () => ({ ...state }),
        getConfig: () => ({ ...CONFIG })
    };
    
    // Auto-initialisation si le container existe
    if (document.getElementById('clock-container')) {
        // Récupérer la date cible depuis un attribut data ou utiliser la date par défaut
        const container = document.getElementById('clock-container');
        const targetDate = container.getAttribute('data-target-date');
        initClock(targetDate);
    }
})();


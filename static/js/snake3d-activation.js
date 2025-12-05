/**
 * Système d'activation secrète pour le Snake 3D
 * Séquence : Clic secret → Taper "NIRD" → Konami Code
 */

(function() {
    'use strict';
    
    console.log('🐍 Snake3D Activation System: Initialisation...');
    
    // État du système d'activation
    let activationState = {
        secretClickDone: false,
        nirdTyped: false,
        konamiSequence: [],
        clickSequence: []
    };
    
    // Séquences à détecter (Konami Code simplifié sans B A pour compatibilité QWERTY)
    const KONAMI_SEQUENCE = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'
    ];
    
    const NIRD_SEQUENCE = ['KeyN', 'KeyI', 'KeyR', 'KeyD'];
    
    // Éléments secrets à cliquer (les 3 piliers NIRD dans l'ordre)
    // Cibler spécifiquement les cartes de la section #nird
    const SECRET_CLICKS = [
        { selector: '#nird .card-grid .card:nth-child(1)', order: 0, label: 'Inclusif' },
        { selector: '#nird .card-grid .card:nth-child(2)', order: 1, label: 'Responsable' },
        { selector: '#nird .card-grid .card:nth-child(3)', order: 2, label: 'Durable' }
    ];
    
    // Initialiser le système
    function initActivationSystem() {
        console.log('🐍 Initialisation du système d\'activation...');
        setupSecretClicks();
        setupKeyboardDetection();
        setupSnake3D();
        console.log('🐍 Système d\'activation prêt !');
    }
    
    // Configuration des clics secrets sur les 3 piliers NIRD
    function setupSecretClicks() {
        let foundCount = 0;
        SECRET_CLICKS.forEach((clickConfig, index) => {
            const element = document.querySelector(clickConfig.selector);
            if (element) {
                foundCount++;
                console.log(`✅ Élément trouvé: ${clickConfig.label} (${clickConfig.selector})`);
                element.addEventListener('click', function(e) {
                    console.log(`🖱️ Clic détecté sur: ${clickConfig.label}`);
                    handleSecretClick(index % 3, clickConfig.order % 3);
                });
            } else {
                console.warn(`⚠️ Élément non trouvé: ${clickConfig.selector}`);
            }
        });
        
        if (foundCount === 0) {
            console.error('❌ Aucune carte NIRD trouvée ! Vérifiez les sélecteurs CSS.');
        } else {
            console.log(`✅ ${foundCount} élément(s) de clic secret configuré(s)`);
        }
    }
    
    // Gérer les clics secrets (doit être dans l'ordre : Inclusif → Responsable → Durable)
    function handleSecretClick(index, expectedOrder) {
        if (!activationState.secretClickDone) {
            if (activationState.clickSequence.length === expectedOrder) {
                activationState.clickSequence.push(index);
                console.log(`📝 Séquence de clics: [${activationState.clickSequence.join(', ')}]`);
                
                // Vérifier si les 3 clics sont faits dans l'ordre
                if (activationState.clickSequence.length === 3) {
                    const isCorrectOrder = activationState.clickSequence.every((click, i) => click === i);
                    if (isCorrectOrder) {
                        activationState.secretClickDone = true;
                        console.log('✅ Clics secrets activés !');
                        showActivationHint("Clics secrets activés ! Tapez 'NIRD'");
                        // Réinitialiser après 5 secondes si pas de suite
                        setTimeout(() => {
                            if (!activationState.nirdTyped) {
                                console.log('⏱️ Timeout: réinitialisation');
                                resetActivation();
                            }
                        }, 5000);
                    } else {
                        console.log('❌ Mauvais ordre de clics');
                        resetActivation();
                        showActivationHint("❌ Mauvais ordre, réessayez");
                    }
                }
            } else {
                console.log('❌ Clic dans le mauvais ordre, réinitialisation');
                resetActivation();
            }
        }
    }
    
    // Détection du clavier (NIRD + Konami Code)
    function setupKeyboardDetection() {
        document.addEventListener('keydown', function(e) {
            // Si les clics secrets sont faits, détecter "NIRD"
            if (activationState.secretClickDone && !activationState.nirdTyped) {
                detectNIRDSequence(e);
            }
            // Si NIRD est tapé, détecter Konami Code
            else if (activationState.nirdTyped) {
                detectKonamiCode(e);
            }
        });
        console.log('⌨️ Détection clavier activée');
    }
    
    // Détecter la séquence "NIRD"
    function detectNIRDSequence(e) {
        const currentSequence = activationState.konamiSequence;
        
        if (currentSequence.length === 0 && e.code === NIRD_SEQUENCE[0]) {
            currentSequence.push(e.code);
            console.log(`⌨️ Touche détectée: ${e.code} (N)`);
        } else if (currentSequence.length > 0 && 
                   currentSequence.length < NIRD_SEQUENCE.length &&
                   e.code === NIRD_SEQUENCE[currentSequence.length]) {
            currentSequence.push(e.code);
            console.log(`⌨️ Séquence NIRD: [${currentSequence.map(c => c.replace('Key', '')).join(', ')}]`);
            
            if (currentSequence.length === NIRD_SEQUENCE.length && !activationState.nirdTyped) {
                activationState.nirdTyped = true;
                activationState.konamiSequence = [];
                console.log('✅ "NIRD" détecté ! En attente du Konami Code...');
                showActivationHint("'NIRD' détecté !");
                // Afficher les flèches animées (une seule fois)
                showKonamiArrows();
            }
        } else {
            // Mauvaise touche, réinitialiser
            if (currentSequence.length > 0) {
                console.log(`❌ Mauvaise touche: ${e.code}, réinitialisation`);
            }
            activationState.konamiSequence = [];
        }
    }
    
    // Détecter le Konami Code
    function detectKonamiCode(e) {
        const sequence = activationState.konamiSequence;
        sequence.push(e.code);
        
        // Garder seulement les dernières touches (taille du Konami Code)
        if (sequence.length > KONAMI_SEQUENCE.length) {
            sequence.shift();
        }
        
        console.log(`⌨️ Konami: [${sequence.map(c => c.replace('Arrow', '').replace('Key', '')).join(', ')}]`);
        
        // Vérifier si la séquence correspond
        if (sequence.length === KONAMI_SEQUENCE.length &&
            sequence.every((code, i) => code === KONAMI_SEQUENCE[i])) {
            // ACTIVATION DU SNAKE 3D !
            console.log('🎉 KONAMI CODE DÉTECTÉ ! Activation du Snake 3D...');
            activateSnake3D();
            resetActivation();
        }
    }
    
    // Réinitialiser l'état d'activation
    function resetActivation() {
        activationState = {
            secretClickDone: false,
            nirdTyped: false,
            konamiSequence: [],
            clickSequence: []
        };
        console.log('🔄 État d\'activation réinitialisé');
    }
    
    // Afficher un indice visuel (optionnel)
    function showActivationHint(message) {
        // Créer ou mettre à jour un élément d'indice
        let hint = document.getElementById('snake3d-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'snake3d-hint';
            hint.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(52, 211, 153, 0.9);
                color: #0b1220;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transition: opacity 0.3s;
                font-family: "Inter", "Segoe UI", Roboto, system-ui, sans-serif;
            `;
            document.body.appendChild(hint);
        }
        hint.textContent = message;
        hint.style.opacity = '1';
        
        // Faire disparaître après 3 secondes
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 300);
        }, 3000);
    }
    
    // Afficher les flèches Konami Code en animation
    function showKonamiArrows() {
        // Empêcher les appels multiples (vérification immédiate)
        if (window.konamiArrowsActive) {
            console.log('⚠️ Animation déjà en cours, ignoré');
            return;
        }
        // Définir le flag IMMÉDIATEMENT avant toute autre opération
        window.konamiArrowsActive = true;
        console.log('🎬 Démarrage de l\'animation des flèches Konami');
        
        // Supprimer TOUS les containers et flèches existants
        const existingContainers = document.querySelectorAll('#konami-arrows-container');
        existingContainers.forEach(container => {
            console.log('🗑️ Suppression d\'un container existant');
            container.remove();
        });
        
        // Supprimer toutes les flèches orphelines
        const orphanArrows = document.querySelectorAll('.konami-arrow');
        orphanArrows.forEach(arrow => {
            console.log('🗑️ Suppression d\'une flèche orpheline');
            arrow.remove();
        });
        
        // Attendre un peu pour s'assurer que tout est nettoyé
        setTimeout(() => {
            // Créer le container pour les flèches
            const container = document.createElement('div');
            container.id = 'konami-arrows-container';
            container.className = 'konami-arrows-container';
            document.body.appendChild(container);
            
            // Séquence des flèches du Konami Code
            const arrows = [
                { symbol: '↑', direction: 'up' },
                { symbol: '↑', direction: 'up' },
                { symbol: '↓', direction: 'down' },
                { symbol: '↓', direction: 'down' },
                { symbol: '←', direction: 'left' },
                { symbol: '→', direction: 'right' },
                { symbol: '←', direction: 'left' },
                { symbol: '→', direction: 'right' }
            ];
            
            // Stocker les timeouts pour pouvoir les annuler si nécessaire
            const timeouts = [];
            
            // Créer et afficher chaque flèche avec un délai de 3 secondes
            arrows.forEach((arrow, index) => {
                const timeoutId = setTimeout(() => {
                    // Vérifier que le container existe toujours
                    const currentContainer = document.getElementById('konami-arrows-container');
                    if (!currentContainer) {
                        console.log(`⚠️ Container introuvable pour la flèche ${index}, arrêt`);
                        return;
                    }
                    
                    // Supprimer TOUTES les flèches existantes dans le container avant d'en créer une nouvelle
                    const existingArrows = currentContainer.querySelectorAll('.konami-arrow');
                    if (existingArrows.length > 0) {
                        console.log(`⚠️ ${existingArrows.length} flèche(s) existante(s) trouvée(s), suppression...`);
                        existingArrows.forEach(arr => arr.remove());
                    }
                    
                    // Créer UNE SEULE flèche
                    const arrowElement = document.createElement('div');
                    arrowElement.className = `konami-arrow ${arrow.direction}`;
                    arrowElement.textContent = arrow.symbol;
                    arrowElement.setAttribute('data-index', index);
                    currentContainer.appendChild(arrowElement);
                    
                    console.log(`✅ Flèche ${arrow.symbol} créée (index: ${index}, direction: ${arrow.direction})`);
                    
                    // Supprimer la flèche après l'animation (2 secondes)
                    setTimeout(() => {
                        if (arrowElement.parentNode) {
                            arrowElement.remove();
                            console.log(`🗑️ Flèche ${arrow.symbol} (index: ${index}) supprimée`);
                        }
                    }, 2000);
                }, index * 1500); // Délai de 1.5 secondes entre chaque flèche
                
                timeouts.push(timeoutId);
            });
            
            // Stocker les timeouts pour pouvoir les annuler si nécessaire
            window.konamiArrowsTimeouts = timeouts;
            
            // Supprimer le container après toutes les animations
            // (8 flèches * 1.5s + 2s d'animation de la dernière = 14 secondes)
            setTimeout(() => {
                const finalContainer = document.getElementById('konami-arrows-container');
                if (finalContainer && finalContainer.parentNode) {
                    finalContainer.remove();
                }
                // Réinitialiser le flag après la fin de l'animation
                window.konamiArrowsActive = false;
                window.konamiArrowsTimeouts = null;
                console.log('🏁 Animation des flèches terminée');
            }, (arrows.length * 1500) + 2000);
        }, 50); // Petit délai pour s'assurer que le nettoyage est terminé
    }
    
    // Activer le Snake 3D
    function activateSnake3D() {
        console.log('🚀 Activation du Snake 3D...');
        const overlay = document.getElementById('snake3d-overlay');
        if (overlay) {
            console.log('✅ Overlay trouvé');
            overlay.classList.remove('snake3d-hidden');
            overlay.classList.add('snake3d-visible');
            
            // Afficher les instructions de déplacement
            showSnakeInstructions();
            
            // Initialiser le jeu si pas déjà fait
            if (!window.snake3dInitialized) {
                console.log('🎮 Initialisation du jeu...');
                setTimeout(() => {
                    initSnake3D();
                }, 100);
                window.snake3dInitialized = true;
            } else {
                console.log('ℹ️ Jeu déjà initialisé');
            }
        } else {
            console.error('❌ Overlay non trouvé ! Vérifiez que l\'élément #snake3d-overlay existe dans le HTML.');
        }
    }
    
    // Afficher les instructions de déplacement pour le Snake
    function showSnakeInstructions() {
        // Vérifier si les instructions existent déjà
        let instructions = document.getElementById('snake3d-instructions');
        
        if (!instructions) {
            // Créer l'élément d'instructions
            instructions = document.createElement('div');
            instructions.id = 'snake3d-instructions';
            instructions.className = 'snake3d-instructions';
            instructions.innerHTML = `
                <div class="snake3d-instructions-content">
                    <h3>🎮 Contrôles</h3>
                    <p><strong>A</strong> : Tourner à gauche</p>
                    <p><strong>D</strong> : Tourner à droite</p>
                    <p><strong>W</strong> : Accélérer | <strong>S</strong> : Ralentir</p>
                    <p><strong>Échap</strong> : Fermer le jeu</p>
                    <button class="snake3d-instructions-close" onclick="this.parentElement.parentElement.style.display='none'">Compris</button>
                </div>
            `;
            
            const overlay = document.getElementById('snake3d-overlay');
            if (overlay) {
                overlay.appendChild(instructions);
            } else {
                document.body.appendChild(instructions);
            }
        } else {
            // Réafficher si elles existent déjà
            instructions.style.display = 'block';
        }
        
        // Faire disparaître automatiquement après 8 secondes
        setTimeout(() => {
            if (instructions && instructions.parentNode) {
                instructions.style.opacity = '0';
                setTimeout(() => {
                    if (instructions && instructions.parentNode) {
                        instructions.style.display = 'none';
                    }
                }, 500);
            }
        }, 8000);
    }
    
    // Initialiser le jeu Snake 3D
    function initSnake3D() {
        console.log('🎮 Initialisation du Snake 3D...');
        
        // S'assurer que les objets globaux existent
        if (typeof window.tiny_graphics === 'undefined') {
            console.warn('⚠️ window.tiny_graphics non défini');
            window.tiny_graphics = {};
        }
        if (typeof window.classes === 'undefined') {
            console.warn('⚠️ window.classes non défini');
            window.classes = {};
        }
        
        // Vérifier que Canvas_Widget existe
        if (typeof Canvas_Widget === 'undefined') {
            console.error('❌ Canvas_Widget non défini ! Les scripts ne sont peut-être pas chargés.');
            showActivationHint('❌ Erreur: Scripts du jeu non chargés. Vérifiez la console.');
            return;
        }
        
        // Charger les scripts si pas déjà chargés
        const scenes = ["Team_Slytherin_Project"];
        const canvasContainer = document.getElementById('snake3d-canvas');
        
        if (canvasContainer) {
            console.log('✅ Container canvas trouvé');
            try {
                console.log('🎨 Création du Canvas_Widget...');
                new Canvas_Widget("snake3d-canvas", scenes);
                console.log('✅ Snake 3D initialisé avec succès !');
            } catch (error) {
                console.error('❌ Erreur lors de l\'initialisation du Snake 3D:', error);
                showActivationHint('❌ Erreur: ' + error.message);
            }
        } else {
            console.error('❌ Container canvas non trouvé !');
            showActivationHint('❌ Erreur: Container canvas introuvable');
        }
    }
    
    // Fermer le Snake 3D
    function closeSnake3D() {
        const overlay = document.getElementById('snake3d-overlay');
        if (overlay) {
            overlay.classList.add('snake3d-hidden');
            overlay.classList.remove('snake3d-visible');
            console.log('🚪 Snake 3D fermé');
        }
    }
    
    // Redémarrer le Snake 3D
    function restartSnake3D() {
        console.log('🔄 Redémarrage du Snake 3D...');
        const canvasContainer = document.getElementById('snake3d-canvas');
        if (canvasContainer) {
            // Vider le canvas
            canvasContainer.innerHTML = '';
            // Réinitialiser le flag
            window.snake3dInitialized = false;
            // Réinitialiser le jeu
            setTimeout(() => {
                initSnake3D();
                window.snake3dInitialized = true;
            }, 100);
        }
    }
    
    // Initialiser quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initActivationSystem);
    } else {
        initActivationSystem();
    }
    
    // Exposer les fonctions globalement
    window.closeSnake3D = closeSnake3D;
    window.restartSnake3D = restartSnake3D;
    
    // Exposer la fonction d'activation pour debug
    window.debugActivateSnake = activateSnake3D;
    console.log('🐍 Pour tester: window.debugActivateSnake() dans la console');
})();

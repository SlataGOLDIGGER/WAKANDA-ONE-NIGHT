(() => {
    // ---------------------------
    // Jauge NIRD
    // ---------------------------
    const gaugeFill = document.getElementById('gauge-fill');
    const gaugeValue = document.getElementById('gauge-value');
    const gaugeFeedback = document.getElementById('gauge-feedback');
    const actionCheckboxes = Array.from(document.querySelectorAll('.action-checkbox'));
    const storageKey = 'nird-actions';

    const feedbackLevels = [
        { max: 30, text: 'Débutant NIRD 🌱 — commence par la mobilisation !' },
        { max: 50, text: 'Explorateur NIRD 🚀 — lance ton expérimentation !' },
        { max: 70, text: 'Champion NIRD 🏆 — en route vers l\'intégration !' },
        { max: 100, text: 'Expert NIRD 💎 — établissement pilote exemplaire !' }
    ];

    const maxScore = actionCheckboxes.reduce((sum, checkbox) => sum + Number(checkbox.value), 0);

    function loadSavedActions() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
            actionCheckboxes.forEach((checkbox, index) => {
                checkbox.checked = Boolean(saved[index]);
            });
        } catch (e) {
            // ignore parsing errors
        }
    }

    function persistActions() {
        const snapshot = actionCheckboxes.map(cb => cb.checked);
        localStorage.setItem(storageKey, JSON.stringify(snapshot));
    }

    function updateGauge() {
        const total = actionCheckboxes.reduce((score, checkbox) => {
            return checkbox.checked ? score + Number(checkbox.value) : score;
        }, 0);

        const normalized = Math.min(Math.round((total / maxScore) * 100), 100);
        gaugeFill.style.width = `${normalized}%`;
        gaugeValue.textContent = `${normalized}%`;

        const feedback = feedbackLevels.find(level => normalized <= level.max);
        gaugeFeedback.textContent = feedback ? feedback.text : '';
        persistActions();
    }

    actionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateGauge);
    });

    loadSavedActions();
    updateGauge();

    // ---------------------------
    // Mini-quiz NIRD
    // ---------------------------
    const questions = [
        {
            text: 'Quel pourcentage de l\'impact environnemental du numérique est dû à la fabrication ?',
            options: ['25%', '50%', '75%'],
            correctIndex: 2
        },
        {
            text: 'Que signifie NIRD ?',
            options: [
                'Numérique Inclusif, Responsable et Durable',
                'Nouveau Internet Responsable et Décentralisé',
                'Niveau Informatique Requis pour Diplôme'
            ],
            correctIndex: 0
        },
        {
            text: 'Quelle distribution Linux est recommandée pour le primaire ?',
            options: ['PrimTux', 'Ubuntu', 'Fedora'],
            correctIndex: 0
        },
        {
            text: 'Combien d\'établissements pilotes sont engagés en 2025/2026 ?',
            options: ['5', '18', '50'],
            correctIndex: 1
        },
        {
            text: 'Quel est le premier jalon de la démarche NIRD ?',
            options: ['Mobilisation', 'Installation', 'Formation'],
            correctIndex: 0
        },
        {
            text: 'Quelle année marque la fin du support Windows 10 ?',
            options: ['2024', '2025', '2027'],
            correctIndex: 1
        },
        {
            text: 'Quel lycée a inspiré la démarche NIRD ?',
            options: [
                'Lycée Victor Hugo',
                'Lycée Carnot de Bruay-la-Buissière',
                'Lycée Louis le Grand'
            ],
            correctIndex: 1
        },
        {
            text: 'Quel objectif de réemploi fixe la loi AGEC pour 2025 ?',
            options: ['25%', '50%', '75%'],
            correctIndex: 1
        },
        {
            text: 'Linux NIRD peut-il fonctionner sans connexion Internet ?',
            options: ['Oui', 'Non', 'Seulement en mode limité'],
            correctIndex: 0
        },
        {
            text: 'Quelle ville économise 350 000€/an grâce aux logiciels libres ?',
            options: ['Lyon', 'Grenoble', 'Échirolles'],
            correctIndex: 2
        }
        // TODO: compléter ou adapter les questions selon les futures infos
    ];

    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const validateBtn = document.getElementById('validate-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const quizCounter = document.getElementById('quiz-counter');
    const quizScore = document.getElementById('quiz-score');
    const quizFeedback = document.getElementById('quiz-feedback');

    let currentQuestion = 0;
    let score = 0;
    let answered = false;

    function renderQuestion() {
        const question = questions[currentQuestion];
        quizQuestion.textContent = question.text;
        quizOptions.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionLabel = document.createElement('label');
            optionLabel.className = 'quiz-option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'quiz-option';
            input.value = index;
            input.setAttribute('aria-label', option);

            optionLabel.appendChild(input);
            optionLabel.append(option);
            quizOptions.appendChild(optionLabel);
        });

        quizCounter.textContent = `Question ${currentQuestion + 1} / ${questions.length}`;
        quizFeedback.textContent = '';
        answered = false;
    }

    function getSelectedOption() {
        const selected = quizOptions.querySelector('input[name="quiz-option"]:checked');
        return selected ? Number(selected.value) : null;
    }

    function validateAnswer() {
        if (answered) return;
        const selectedIndex = getSelectedOption();
        if (selectedIndex === null) {
            quizFeedback.textContent = 'Choisis une réponse avant de valider.';
            return;
        }

        const isCorrect = selectedIndex === questions[currentQuestion].correctIndex;
        if (isCorrect) {
            score += 1;
            quizFeedback.textContent = 'Bonne réponse !';
        } else {
            quizFeedback.textContent = 'Ce n\'est pas tout à fait ça, continue d\'explorer la NIRD.';
        }

        quizScore.textContent = `Score : ${score}`;
        answered = true;
    }

    function showFinalMessage() {
        const ratio = score / questions.length;
        let message = '';

        if (ratio === 1) {
            message = 'Parfait ! Tu es un véritable artisan du numérique souverain.';
        } else if (ratio >= 0.66) {
            message = 'Très bien ! Encore quelques actions pour atteindre l\'excellence NIRD.';
        } else if (ratio >= 0.33) {
            message = 'Pas mal ! Continue à découvrir les leviers pour résister aux Big Tech.';
        } else {
            message = 'Le voyage commence : replonge dans les piliers NIRD et essaie à nouveau.';
        }

        quizQuestion.textContent = 'Fin du quiz';
        quizOptions.innerHTML = '';
        quizFeedback.textContent = message;
        validateBtn.disabled = true;
        nextBtn.disabled = true;
    }

    function nextQuestion() {
        if (!answered) {
            quizFeedback.textContent = 'Valide d\'abord ta réponse.';
            return;
        }

        currentQuestion += 1;
        if (currentQuestion >= questions.length) {
            showFinalMessage();
            return;
        }

        renderQuestion();
    }

    function restartQuiz() {
        currentQuestion = 0;
        score = 0;
        answered = false;
        quizScore.textContent = 'Score : 0';
        validateBtn.disabled = false;
        nextBtn.disabled = false;
        renderQuestion();
    }

    validateBtn.addEventListener('click', validateAnswer);
    nextBtn.addEventListener('click', nextQuestion);
    restartBtn.addEventListener('click', restartQuiz);

    renderQuestion();
})();

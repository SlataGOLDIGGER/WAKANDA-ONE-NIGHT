(() => {
    // ---------------------------
    // Jauge NIRD
    // ---------------------------
    const gaugeFill = document.getElementById('gauge-fill');
    const gaugeValue = document.getElementById('gauge-value');
    const gaugeFeedback = document.getElementById('gauge-feedback');
    const actionCheckboxes = Array.from(document.querySelectorAll('.action-checkbox'));

    const feedbackLevels = [
        { max: 20, text: "Un premier pas vers la résistance numérique. Continue !" },
        { max: 60, text: "Belle dynamique ! Le village NIRD s'organise." },
        { max: 100, text: "Excellent : l'établissement devient un modèle de résilience." }
    ];

    function updateGauge() {
        const total = actionCheckboxes.reduce((score, checkbox) => {
            return checkbox.checked ? score + Number(checkbox.value) : score;
        }, 0);

        const normalized = Math.min(total, 100);
        gaugeFill.style.width = `${normalized}%`;
        gaugeValue.textContent = `${normalized}%`;

        const feedback = feedbackLevels.find(level => normalized <= level.max);
        gaugeFeedback.textContent = feedback ? feedback.text : '';
    }

    actionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateGauge);
    });

    updateGauge();

    // ---------------------------
    // Mini-quiz NIRD
    // ---------------------------
    const questions = [
        {
            text: "Que signifie la démarche NIRD dans un établissement scolaire ?",
            options: [
                "Adopter uniquement des solutions propriétaires pour assurer la compatibilité.",
                "Construire un numérique inclusif, responsable et durable pour toute la communauté éducative.",
                "Remplacer tout le matériel tous les deux ans pour rester à la pointe."
            ],
            correctIndex: 1
        },
        {
            text: "Pourquoi les logiciels libres sont-ils essentiels dans la NIRD ?",
            options: [
                "Ils permettent d'adapter les outils, favorisent la souveraineté et réduisent les coûts de licence.",
                "Ils sont toujours plus lents que les solutions propriétaires.",
                "Ils obligent à stocker les données hors de l'UE."
            ],
            correctIndex: 0
        },
        {
            text: "Quelle action lutte contre la fracture numérique ?",
            options: [
                "Imposer un appareil récent à chaque élève.",
                "Reconditionner et prêter des ordinateurs sous Linux aux élèves non équipés.",
                "Ne proposer que des services cloud payants." 
            ],
            correctIndex: 1
        },
        {
            text: "Comment encourager la sobriété numérique ?",
            options: [
                "Multiplier les envois de pièces jointes lourdes.",
                "Sensibiliser les élèves à la réduction des consommations et au réemploi du matériel.",
                "Installer des applications en doublon pour chaque usage."
            ],
            correctIndex: 1
        }
        // TODO: compléter les textes des questions
    ];

    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const validateBtn = document.getElementById('validate-btn');
    const nextBtn = document.getElementById('next-btn');
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
            quizFeedback.textContent = "Choisis une réponse avant de valider.";
            return;
        }

        const isCorrect = selectedIndex === questions[currentQuestion].correctIndex;
        if (isCorrect) {
            score += 1;
            quizFeedback.textContent = "Bonne réponse !";
        } else {
            quizFeedback.textContent = "Ce n'est pas tout à fait ça, continue d'explorer la NIRD.";
        }

        quizScore.textContent = `Score : ${score}`;
        answered = true;
    }

    function showFinalMessage() {
        const ratio = score / questions.length;
        let message = '';

        if (ratio === 1) {
            message = "Parfait ! Tu es un véritable artisan du numérique souverain.";
        } else if (ratio >= 0.66) {
            message = "Très bien ! Encore quelques actions pour atteindre l'excellence NIRD.";
        } else if (ratio >= 0.33) {
            message = "Pas mal ! Continue à découvrir les leviers pour résister aux Big Tech.";
        } else {
            message = "Le voyage commence : replonge dans les piliers NIRD et essaie à nouveau.";
        }

        quizQuestion.textContent = "Fin du quiz";
        quizOptions.innerHTML = '';
        quizFeedback.textContent = message;
        validateBtn.disabled = true;
        nextBtn.disabled = true;
    }

    function nextQuestion() {
        if (!answered) {
            quizFeedback.textContent = "Valide d'abord ta réponse.";
            return;
        }

        currentQuestion += 1;
        if (currentQuestion >= questions.length) {
            showFinalMessage();
            return;
        }

        quizScore.textContent = `Score : ${score}`;
        renderQuestion();
    }

    validateBtn.addEventListener('click', validateAnswer);
    nextBtn.addEventListener('click', nextQuestion);

    renderQuestion();
})();

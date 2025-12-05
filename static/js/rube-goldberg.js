/**
 * Interface JavaScript pour la Machine de Rube Goldberg
 * Appelle l'API Flask pour exécuter les transformations
 */

(function() {
    'use strict';
    
    // Initialisation
    function initRubeGoldberg() {
        const submitBtn = document.getElementById('rube-submit-btn');
        const input = document.getElementById('rube-text-input');
        
        if (submitBtn) {
            submitBtn.addEventListener('click', handleSubmit);
        }
        
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSubmit();
                }
            });
        }
    }
    
    // Gérer la soumission
    async function handleSubmit() {
        const input = document.getElementById('rube-text-input');
        const text = input.value.trim();
        
        if (!text) {
            alert('Veuillez entrer un texte !');
            return;
        }
        
        // Afficher le loading
        showLoading();
        hideResults();
        
        try {
            const response = await fetch('/api/rube-goldberg', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });
            
            const data = await response.json();
            
            if (data.success) {
                displayResults(data.results);
            } else {
                showError(data.error || 'Une erreur est survenue');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showError('Erreur de connexion au serveur');
        } finally {
            hideLoading();
        }
    }
    
    // Afficher le loading
    function showLoading() {
        const loading = document.getElementById('rube-loading');
        if (loading) {
            loading.style.display = 'block';
        }
    }
    
    // Cacher le loading
    function hideLoading() {
        const loading = document.getElementById('rube-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
    
    // Afficher les résultats
    function displayResults(results) {
        const container = document.getElementById('rube-steps-container');
        const finalResult = document.getElementById('rube-final-result');
        const resultsDiv = document.getElementById('rube-results');
        
        if (!container || !finalResult || !resultsDiv) return;
        
        // Vider le contenu précédent
        container.innerHTML = '';
        
        // Afficher chaque étape
        results.steps.forEach((step, index) => {
            const stepElement = createStepElement(step, index);
            container.appendChild(stepElement);
        });
        
        // Afficher le résultat final
        if (results.final_result) {
            const success = results.final_result.success;
            finalResult.innerHTML = `
                <div class="rube-final-message ${success ? 'success' : 'failure'}">
                    <h3>🎯 Résultat Final</h3>
                    <p>${results.final_result.message}</p>
                </div>
            `;
        }
        
        // Afficher le container
        resultsDiv.style.display = 'block';
        
        // Animation de scroll
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Créer un élément d'étape
    function createStepElement(step, index) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'rube-step';
        stepDiv.style.animationDelay = `${index * 0.1}s`;
        
        let content = `
            <div class="rube-step-header">
                <span class="rube-step-number">Étape ${step.step}</span>
                <h4>${step.name}</h4>
            </div>
            <div class="rube-step-content">
        `;
        
        // Résultat principal
        if (step.result) {
            content += `<div class="rube-step-result">${escapeHtml(step.result)}</div>`;
        }
        
        // Statistiques
        if (step.stats) {
            content += '<div class="rube-step-stats">';
            if (step.stats.dots !== undefined) {
                content += `<p>Points (.): ${step.stats.dots} | Traits (-): ${step.stats.dashes}</p>`;
            }
            if (step.stats.ones !== undefined) {
                content += `<p>1: ${step.stats.ones} | 0: ${step.stats.zeros} | Ratio: ${step.stats.ratio.toFixed(2)}</p>`;
                content += `<p>Coefficient quantique: ${step.stats.quantum_complexity.toFixed(2)}</p>`;
            }
            if (step.stats['🔥'] !== undefined) {
                content += '<p>';
                for (const [emoji, count] of Object.entries(step.stats)) {
                    content += `${emoji}: ${count} `;
                }
                content += '</p>';
            }
            content += '</div>';
        }
        
        // Couleurs
        if (step.colors) {
            content += '<div class="rube-colors">';
            step.colors.slice(0, 10).forEach(color => {
                content += `<span class="rube-color" style="background-color: ${color}"></span>`;
            });
            if (step.colors.length > 10) {
                content += `<span>... (+${step.colors.length - 10})</span>`;
            }
            content += '</div>';
        }
        
        // Sentiment
        if (step.sentiment !== undefined) {
            const sentimentClass = step.sentiment > 0.2 ? 'positive' : step.sentiment > -0.2 ? 'neutral' : 'negative';
            content += `<div class="rube-sentiment ${sentimentClass}">`;
            content += `<p>Score: ${step.sentiment.toFixed(2)}</p>`;
            if (step.haiku) {
                content += `<div class="rube-haiku">${step.haiku.replace(/\n/g, '<br>')}</div>`;
            }
            content += '</div>';
        }
        
        // Sentiment IA
        if (step.sentiment_ia) {
            content += `<div class="rube-sentiment-ia">`;
            content += `<p>🤖 IA: ${step.sentiment_ia.label} (${step.sentiment_ia.score}%)</p>`;
            content += '</div>';
        }
        
        content += '</div>';
        stepDiv.innerHTML = content;
        
        return stepDiv;
    }
    
    // Afficher une erreur
    function showError(message) {
        const resultsDiv = document.getElementById('rube-results');
        const container = document.getElementById('rube-steps-container');
        const finalResult = document.getElementById('rube-final-result');
        
        if (resultsDiv && container && finalResult) {
            container.innerHTML = '';
            finalResult.innerHTML = `
                <div class="rube-final-message error">
                    <h3>❌ Erreur</h3>
                    <p>${escapeHtml(message)}</p>
                </div>
            `;
            resultsDiv.style.display = 'block';
        }
    }
    
    // Cacher les résultats
    function hideResults() {
        const resultsDiv = document.getElementById('rube-results');
        if (resultsDiv) {
            resultsDiv.style.display = 'none';
        }
    }
    
    // Échapper le HTML pour la sécurité
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Initialiser au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRubeGoldberg);
    } else {
        initRubeGoldberg();
    }
})();


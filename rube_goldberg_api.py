"""
API Flask pour le Rube Goldberg Machine
Route pour exécuter le script Python côté serveur
"""

from flask import Flask, request, jsonify
import sys
import os
import random
import requests

# Importer la classe du script original
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class RubeGoldbergValidator:
    """Version adaptée pour l'API Flask - Utilise l'API Hugging Face pour éviter les problèmes de RAM"""
    
    def __init__(self):
        self.text = None
        # Plus besoin de charger le modèle localement, on utilise l'API Hugging Face
        self.api_url = "https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment"

        self.morse_code = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
            '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', "'": '.----.', ' ': '/', '"': '.-..-.',
            '(': '-.--.', ')': '-.--.-', '[': '-.--.', ']': '-.--.-', '+': '.-.-.',
            ',': '--..--', '-': '-....-', '.': '.-.-.-', ':': '---...', ';': '-.-.-.',
            '?': '..--..', '=': '-...-', '@': '.--.-.', '_': '..--.-', '!': '---.'
        }

        self.emoji_map = {'.': '🔥', '-': '💧', '/': '🚪', ' ': '🌊'}
        self.reverse_morse = {v: k for k, v in self.morse_code.items()}
        self.reverse_emoji = {v: k for k, v in self.emoji_map.items()}

    def text_to_morse(self, text):
        morse = ' '.join(self.morse_code.get(c.upper(), '?') for c in text)
        return morse

    def morse_stats(self, morse):
        return {
            'dots': morse.count('.'),
            'dashes': morse.count('-')
        }

    def morse_to_emoji(self, morse):
        emoji = ''.join(self.emoji_map.get(c, c) for c in morse)
        return emoji

    def emoji_stat(self, emojis):
        stats = {}
        for key, value in self.emoji_map.items():
            stats[value] = emojis.count(value)
        return stats

    def emoji_to_morse(self, emojis):
        morse = ''.join(self.reverse_emoji.get(c, c) for c in emojis)
        return morse

    def morse_to_text(self, morse):
        decoded = []
        words = morse.split(' / ')
        for word in words:
            letters = word.split(' ')
            decoded_word = ''.join(self.reverse_morse.get(letter, '?') for letter in letters if letter)
            decoded.append(decoded_word)
        return ' '.join(decoded)

    def text_to_hex(self, text):
        hex_text = ' '.join(hex(ord(c))[2:].upper().zfill(2) for c in text)
        return hex_text

    def hex_to_colors(self, hex_text):
        hex_values = hex_text.split()
        colors = []
        for i in range(0, len(hex_values), 3):
            color = '#' + ''.join(hex_values[i:i + 3]).ljust(6, '0')[:6]
            colors.append(color)
        return colors

    def color_to_sentiment(self, colors):
        sentiment_score = 0
        for color in colors:
            r = int(color[1:3], 16)
            g = int(color[3:5], 16)
            b = int(color[5:7], 16)
            brightness = (r + g + b) / 3
            sentiment_score += (brightness - 127.5) / 127.5
        avg_sentiment = sentiment_score / len(colors) if colors else 0
        return avg_sentiment

    def generate_haiku(self, sentiment):
        if sentiment > 0.2:
            return "Lumière éclatante\nLe texte rayonne\nSécurité claire"
        elif sentiment > -0.2:
            return "Entre ombre et clarté\nLe texte reste équilibré\nValidation calme"
        else:
            return "Nuit profonde et sombre\nLes mystères bien gardés\nTexte inspirant"

    def hex_to_text(self, hex_text):
        hex_values = hex_text.split()
        return ''.join(chr(int(h, 16)) for h in hex_values)

    def text_to_binary(self, text):
        return ' '.join(format(ord(c), '08b') for c in text)

    def binary_stats(self, binary):
        ones = binary.count('1')
        zeros = binary.count('0')
        ratio = ones / zeros if zeros > 0 else float('inf')
        return {
            'ones': ones,
            'zeros': zeros,
            'ratio': ratio,
            'quantum_complexity': random.uniform(0.1, 9.9)
        }

    def binary_to_text(self, binary):
        binary_values = binary.split()
        return ''.join(chr(int(b, 2)) for b in binary_values)

    def _simple_sentiment(self, text):
        """Analyse de sentiment simplifiée basée sur des mots-clés (fallback)"""
        text_lower = text.lower()
        positive_words = ['bon', 'bien', 'excellent', 'super', 'génial', 'cool', 'fantastique', 
                         'merveilleux', 'formidable', 'parfait', 'agréable', 'sympa', 'chouette']
        negative_words = ['mauvais', 'mal', 'nul', 'horrible', 'terrible', 'décevant', 
                         'déplorable', 'affreux', 'catastrophique', 'médiocre']
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            score = min(85, 30 + positive_count * 8)
            label = "POSITIVE"
        elif negative_count > positive_count:
            score = min(85, 30 + negative_count * 8)
            label = "NEGATIVE"
        else:
            score = 50
            label = "NEUTRAL"
        
        return {'score': score, 'label': label}
    
    def sentiment(self, text):
        """Analyse de sentiment via l'API Hugging Face avec fallback"""
        try:
            # Essayer l'API Hugging Face (gratuite, pas de clé requise pour les modèles publics)
            response = requests.post(
                self.api_url,
                json={"inputs": text},
                timeout=15,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    if isinstance(result[0], list):
                        # Format: [[{"label": "...", "score": ...}]]
                        ia_result = result[0][0]
                    else:
                        # Format: [{"label": "...", "score": ...}]
                        ia_result = result[0]
                    
                    label = ia_result.get('label', 'NEUTRAL')
                    score = round(ia_result.get('score', 0.5) * 100, 2)
                    return {'score': score, 'label': label}
        except requests.exceptions.Timeout:
            print("⚠️ Timeout de l'API Hugging Face, utilisation du fallback")
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Erreur API Hugging Face: {e}, utilisation du fallback")
        except Exception as e:
            print(f"⚠️ Erreur lors de l'analyse de sentiment: {e}, utilisation du fallback")
        
        # Fallback vers version simplifiée
        return self._simple_sentiment(text)

    def validate(self, text):
        """Exécute toute la chaîne de transformations et retourne les résultats"""
        self.text = text
        
        results = {
            'steps': [],
            'final_result': None
        }
        
        # Étape 1: Texte → Morse
        r1 = self.text_to_morse(text)
        stats1 = self.morse_stats(r1)
        results['steps'].append({
            'step': 1,
            'name': 'Conversion en code Morse',
            'result': r1[:100] + '...' if len(r1) > 100 else r1,
            'stats': stats1
        })
        
        # Étape 2: Morse → Emojis
        r2 = self.morse_to_emoji(r1)
        stats2 = self.emoji_stat(r2)
        results['steps'].append({
            'step': 2,
            'name': 'Traduction en émojis',
            'result': r2[:50] + '...' if len(r2) > 50 else r2,
            'stats': stats2
        })
        
        # Étape 3: Emojis → Morse
        r3 = self.emoji_to_morse(r2)
        results['steps'].append({
            'step': 3,
            'name': 'Retour en code Morse',
            'result': r3[:100] + '...' if len(r3) > 100 else r3
        })
        
        # Étape 4: Morse → Texte
        r4 = self.morse_to_text(r3)
        results['steps'].append({
            'step': 4,
            'name': 'Décodage morse',
            'result': r4[:100] + '...' if len(r4) > 100 else r4
        })
        
        # Étape 5: Texte → Hex
        r5 = self.text_to_hex(r4)
        results['steps'].append({
            'step': 5,
            'name': 'Conversion en hexadécimal',
            'result': r5[:100] + '...' if len(r5) > 100 else r5
        })
        
        # Étape 6: Hex → Couleurs
        r6 = self.hex_to_colors(r5)
        results['steps'].append({
            'step': 6,
            'name': 'Interprétation en couleurs HTML',
            'result': r6[:10],  # Premières couleurs
            'colors': r6
        })
        
        # Étape 7: Couleurs → Sentiment
        r7 = self.color_to_sentiment(r6)
        haiku = self.generate_haiku(r7)
        results['steps'].append({
            'step': 7,
            'name': 'Analyse sentimentale des couleurs',
            'result': f"Score: {r7:.2f}",
            'sentiment': r7,
            'haiku': haiku
        })
        
        # Étape 8: Hex → Texte
        r8 = self.hex_to_text(r5)
        results['steps'].append({
            'step': 8,
            'name': 'Décodage hexadécimal → texte',
            'result': r8[:100] + '...' if len(r8) > 100 else r8
        })
        
        # Étape 9: Texte → Binaire
        r9 = self.text_to_binary(r8)
        stats9 = self.binary_stats(r9)
        results['steps'].append({
            'step': 9,
            'name': 'Conversion en binaire',
            'result': r9[:100] + '...' if len(r9) > 100 else r9,
            'stats': stats9
        })
        
        # Étape 10: Binaire → Texte
        r10 = self.binary_to_text(r9)
        results['steps'].append({
            'step': 10,
            'name': 'Décodage binaire → texte',
            'result': r10[:100] + '...' if len(r10) > 100 else r10
        })
        
        # Étape 11: Analyse de sentiment IA
        r11 = self.sentiment(r10)
        results['steps'].append({
            'step': 11,
            'name': 'Analyse psychologique (IA)',
            'result': f"Label: {r11['label']}, Score: {r11['score']}%",
            'sentiment_ia': r11
        })
        
        # Étape 12: Vérification finale
        is_l_starter = text.strip().upper().startswith('L')
        if is_l_starter:
            if r11['score'] > 25:
                final_message = "C'est un **SUCCÈS POSITIF** ! La phrase commence par 'L' après cette validation critique!"
            else:
                final_message = "C'est un **SUCCÈS NÉGATIF** ! La phrase commence par 'L' malgré le doute de l'IA!"
        else:
            final_message = "Échec. La phrase ne commence PAS par 'L'. Le décodage binaire était-il compromis ?"
        
        results['final_result'] = {
            'success': is_l_starter,
            'message': final_message,
            'starts_with_l': is_l_starter
        }
        
        return results


# Créer une instance globale (le modèle sera chargé une seule fois)
validator = RubeGoldbergValidator()


def create_rube_goldberg_route(app):
    """Ajoute la route pour le Rube Goldberg Machine à l'application Flask"""
    
    @app.route('/api/rube-goldberg', methods=['POST'])
    def rube_goldberg():
        """Route pour exécuter le Rube Goldberg Machine"""
        try:
            data = request.get_json()
            text = data.get('text', '')
            
            if not text:
                return jsonify({'error': 'Le texte est requis'}), 400
            
            # Exécuter la validation
            results = validator.validate(text)
            
            return jsonify({
                'success': True,
                'results': results
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    return app


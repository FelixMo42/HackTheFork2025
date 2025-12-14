# 🥕 Système d'Évaluation des Menus - Cantine.OS

## Vue d'ensemble

Le système d'évaluation permet aux étudiants de noter les menus quotidiens avec un système de notation de 1 à 5 carottes. Les notes sont agrégées pour calculer un **score de popularité** pour chaque menu.

## Fonctionnalités

### 1. Score de Popularité
- Chaque menu a un score de popularité calculé comme la moyenne des notes reçues
- Échelle de 1 à 5 carottes (🥕)
- Affiché dans la vue planning pour chaque jour
- Mis à jour automatiquement après chaque nouvelle évaluation

### 2. QR Code pour Feedback
- Un QR code unique est généré pour chaque jour de menu
- Les étudiants scannent le QR code avec leur smartphone
- Ils sont redirigés vers une page de feedback mobile-optimisée
- Le QR code est affiché dans l'en-tête de chaque jour dans le planning

### 3. Page de Feedback
- Interface intuitive avec des carottes cliquables (1-5)
- Affichage du menu du jour
- Champ de commentaire optionnel
- Message de confirmation avec statistiques après soumission
- Design responsive et mobile-first

## Architecture Technique

### Backend (FastAPI)

#### Endpoints API

**POST /api/feedback/rate**
```json
{
  "menu_date": "2024-12-16",
  "rating": 5,
  "comment": "Excellent repas!"
}
```
Soumet une évaluation pour un menu spécifique.

**GET /api/feedback/menu/{menu_date}**
Récupère toutes les évaluations et le score de popularité pour une date donnée.

**GET /api/feedback/stats**
Récupère les statistiques globales :
- Nombre total d'évaluations
- Score moyen
- Top menus
- Évaluations récentes

**GET /api/qrcode/generate?menu_date={date}&size={size}**
Génère un QR code pour la page de feedback d'un menu spécifique.
Retourne l'image en base64 pour un affichage facile.

#### Stockage des Données

Fichier : `data/feedback.json`

Structure :
```json
{
  "ratings": [
    {
      "id": "rating_00001",
      "menu_date": "2024-12-16",
      "rating": 5,
      "comment": "Excellent repas!",
      "timestamp": "2025-12-14 13:21:41"
    }
  ],
  "menu_scores": {
    "2024-12-16": {
      "score": 4.67,
      "total_ratings": 3,
      "last_updated": "2025-12-14 13:22:23"
    }
  },
  "meta": {
    "version": "1.0",
    "description": "Système d'évaluation des menus par les étudiants",
    "last_updated": "2025-12-14 13:22:23"
  }
}
```

### Frontend

#### Page de Feedback (`feedback.html`)
- Design moderne avec gradient violet
- Système de notation visuel avec carottes animées
- Affichage du menu du jour (si disponible dans le planning)
- Validation côté client
- Messages d'erreur et de succès
- Statistiques post-soumission

#### Intégration Planning (`app.js`)
- Fonction `loadPopularityScores()` : Charge les scores pour la semaine affichée
- Fonction `displayPopularityScore()` : Affiche le score dans l'en-tête du jour
- Fonction `generateQRCodeForDay()` : Génère et affiche le QR code
- Fonction `toggleQRCode()` : Affiche/masque le popup du QR code

#### Styles (`styles.css`)
- `.popularity-score` : Affichage du score avec carottes
- `.qr-code-container` : Conteneur du bouton QR code
- `.qr-code-popup` : Popup avec l'image QR code
- Design cohérent avec le reste de l'application

## Installation

### Dépendances Python
```bash
pip install qrcode[pil] pillow
```

Ces bibliothèques sont nécessaires pour la génération des QR codes.

## Utilisation

### 1. Démarrer le Backend
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Démarrer le Frontend
```bash
cd frontend
python3 -m http.server 3000
```

### 3. Accéder à l'Application
- Dashboard : http://localhost:3000/
- Page de feedback : http://localhost:3000/feedback.html?date=2024-12-16

### 4. Workflow Étudiant
1. Scanner le QR code affiché dans la cantine
2. Ouvrir la page de feedback sur smartphone
3. Sélectionner une note de 1 à 5 carottes
4. (Optionnel) Ajouter un commentaire
5. Soumettre l'évaluation
6. Voir les statistiques du menu

### 5. Workflow Gestionnaire
1. Accéder au planning dans le dashboard
2. Voir les scores de popularité pour chaque jour
3. Cliquer sur "📱 QR Code Avis" pour afficher le QR code
4. Imprimer ou afficher le QR code dans la cantine
5. Consulter les statistiques via l'API

## Tests

### Test de Soumission d'Évaluation
```bash
curl -X POST "http://localhost:8000/api/feedback/rate" \
  -H "Content-Type: application/json" \
  -d '{"menu_date": "2024-12-16", "rating": 5, "comment": "Excellent!"}'
```

### Test de Récupération des Scores
```bash
curl "http://localhost:8000/api/feedback/menu/2024-12-16"
```

### Test de Génération QR Code
```bash
curl "http://localhost:8000/api/qrcode/generate?menu_date=2024-12-16"
```

### Test de Statistiques
```bash
curl "http://localhost:8000/api/feedback/stats"
```

## Exemples de Résultats

### Score de Popularité
- Menu avec 3 évaluations (5, 4, 5) → Score : 4.67/5 🥕🥕🥕🥕🥕
- Menu avec 1 évaluation (3) → Score : 3.0/5 🥕🥕🥕

### QR Code
Le QR code généré contient l'URL :
```
http://localhost:8000/feedback.html?date=2024-12-16
```

## Améliorations Futures

1. **Authentification** : Limiter une évaluation par étudiant par jour
2. **Analytics** : Dashboard avec graphiques d'évolution des scores
3. **Notifications** : Alertes pour les menus mal notés
4. **Export** : Export des évaluations en CSV/Excel
5. **Modération** : Système de modération des commentaires
6. **Gamification** : Badges pour les étudiants actifs
7. **Suggestions** : IA pour suggérer des améliorations basées sur les commentaires

## Support

Pour toute question ou problème, consultez la documentation principale de Cantine.OS ou créez une issue sur le dépôt GitHub.

---

**Version** : 1.0  
**Date** : Décembre 2024  
**Auteur** : Cantine.OS Team

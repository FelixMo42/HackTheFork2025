#!/bin/bash

echo "🧪 Test du Système d'Évaluation des Menus - Cantine.OS"
echo "========================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000/api"

echo -e "${BLUE}1. Test de génération de QR Code${NC}"
echo "-----------------------------------"
curl -s "${API_URL}/qrcode/generate?menu_date=2024-12-20&size=200" | python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ QR Code généré pour: {data[\"menu_date\"]}'); print(f'📱 URL: {data[\"feedback_url\"]}')"
echo ""

echo -e "${BLUE}2. Test de soumission d'évaluations${NC}"
echo "------------------------------------"
echo "Soumission de 3 évaluations pour le 2024-12-20..."

curl -s -X POST "${API_URL}/feedback/rate" \
  -H "Content-Type: application/json" \
  -d '{"menu_date": "2024-12-20", "rating": 5, "comment": "Délicieux!"}' | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Évaluation 1: {data[\"rating\"][\"rating\"]}/5 - Score actuel: {data[\"popularity_score\"]}')"

curl -s -X POST "${API_URL}/feedback/rate" \
  -H "Content-Type: application/json" \
  -d '{"menu_date": "2024-12-20", "rating": 4, "comment": "Très bon"}' | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Évaluation 2: {data[\"rating\"][\"rating\"]}/5 - Score actuel: {data[\"popularity_score\"]}')"

curl -s -X POST "${API_URL}/feedback/rate" \
  -H "Content-Type: application/json" \
  -d '{"menu_date": "2024-12-20", "rating": 5, "comment": "Parfait!"}' | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ Évaluation 3: {data[\"rating\"][\"rating\"]}/5 - Score actuel: {data[\"popularity_score\"]}')"

echo ""

echo -e "${BLUE}3. Test de récupération des scores${NC}"
echo "-----------------------------------"
curl -s "${API_URL}/feedback/menu/2024-12-20" | python3 -c "
import sys, json
data = json.load(sys.stdin)
score = data['popularity_score']
total = data['total_ratings']
carrots = '🥕' * round(score)
print(f'📊 Menu du {data[\"menu_date\"]}')
print(f'   Score: {score}/5 {carrots}')
print(f'   Nombre d\'avis: {total}')
print(f'   Dernière mise à jour: {data[\"last_updated\"]}')
"
echo ""

echo -e "${BLUE}4. Test des statistiques globales${NC}"
echo "-----------------------------------"
curl -s "${API_URL}/feedback/stats" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'📈 Statistiques Globales')
print(f'   Total d\'évaluations: {data[\"total_ratings\"]}')
print(f'   Score moyen: {data[\"average_score\"]}/5')
print(f'   Menus évalués: {data[\"total_menus_rated\"]}')
print(f'')
print(f'🏆 Top 3 Menus:')
for i, menu in enumerate(data['top_menus'][:3], 1):
    carrots = '🥕' * round(menu['score'])
    print(f'   {i}. {menu[\"date\"]}: {menu[\"score\"]}/5 {carrots} ({menu[\"total_ratings\"]} avis)')
"
echo ""

echo -e "${GREEN}✅ Tous les tests sont passés avec succès!${NC}"
echo ""
echo "📱 Accès aux interfaces:"
echo "   - Dashboard: http://localhost:3000/"
echo "   - Feedback: http://localhost:3000/feedback.html?date=2024-12-20"
echo "   - API Docs: http://localhost:8000/docs"
echo ""

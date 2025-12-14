<p align="center">
  <img width="567" height="169" alt="Ardoise" src="https://github.com/user-attachments/assets/25737dac-8ebf-4f3e-b38a-cd454a7233e8" />
</p>

## 🎯 The Challenge

Since 2019, under France's **EGAlim Law**, canteens are required to serve **1 vegetarian dish per week**. This is in addition to the 4 meat-based dishes a canteen will have on average for each vegetarian dish. Many municipal canteens struggle to:

- ✅ Meet EGAlim compliance requirements
- 💰 Control rising food costs
- 🌱 Create appealing vegetarian menus
- 📊 Track and report sustainability metrics
- ⚖️ Balance nutrition, cost, and regulations

---

## 💡 Our Solution: The Ardoise Ecosystem

A comprehensive three-part platform that collects canteen data, visualizes compliance, and generates AI-powered vegetarian menus.

---

## 🤖 Cantine OS

**Canteen.OS** is our flagship AI-powered menu generation system that harnesses information about the newest regulations alongside AI technology to generate cost-effective menus for your canteen.

### Key Features
- 🍽️ **AI Menu Generation** - Weekly menus with complete recipes
- 📋 **EGAlim Compliance** - Automatically ensures regulatory compliance
- 🌿 **Plant-Based Focus** - Promotes vegetarian and sustainable options
- 💵 **Cost Optimization** - Uses OR-Tools to minimize expenses while maintaining quality
- 📊 **Nutritional Balance** - Ensures healthy, balanced meal plans

### Pricing
**Monthly subscription:** Only **25€/month** for canteen managers to receive:
- Weekly menu plans
- Complete recipes with ingredients
- Compliance with latest regulations
- More plant-based options
- Cost-saving recommendations

**Tech Stack:** Python, FastAPI, OR-Tools (optimization), Pydantic

---

## 🗺️ Cantine CRM

Interactive dashboard for visualizing and managing canteen data across France.

### Key Features
- 📍 **Interactive Map** - Visualize 36,000+ canteens using Leaflet
- 📊 **Compliance Tracking** - Monitor EGAlim badge status (quality products, waste reduction, vegetarian menus, plastic ban, consumer info)
- 🤖 **AI Reports** - Generated sustainability analysis for each canteen
- 🔍 **Gap Analysis** - Identify canteens needing support

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Leaflet, React Markdown

[📖 View CRM Documentation](./cantine_crm/README.md)

---

## 🔍 Cantine Scraper

Automated data collection tool that powers our platform with real-time canteen information.

### Key Features
- 🌐 **Comprehensive Data** - Scrapes 36,000+ canteens from [ma-cantine.agriculture.gouv.fr](https://ma-cantine.agriculture.gouv.fr)
- 🏅 **Compliance Badges** - Tracks all 5 EGAlim compliance indicators
- 📈 **Sustainability Metrics** - Bio percentages, meal counts, management types
- 💾 **Auto-Resume** - Incremental saving with resume capability
- 🤖 **AI Analysis** - Generates detailed reports for each canteen

**Tech Stack:** Node.js, Puppeteer

[📖 View Scraper Documentation](./cantine_scraper/README.md)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **npm** or **yarn**

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/FelixMo42/HackTheFork2025.git
cd HackTheFork2025
```

#### 2. Setup Cantine Scraper
```bash
cd cantine_scraper
npm install
npm start
```

#### 3. Setup Cantine CRM
```bash
cd cantine_crm
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

#### 4. Setup Cantine OS
```bash
cd cantine_os/backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 📊 How It Works

```
┌─────────────────────┐
│  Cantine Scraper    │  Collects 36K+ canteen data from government website
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Cantine CRM       │  Visualizes compliance gaps & generates AI reports
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Cantine OS        │  Generates optimized vegetarian menus for canteens
└─────────────────────┘
```

---

## 🌱 Why Vegetarian Menus Matter

Our AI-powered system specializes in creating **sustainable vegetarian menus** that:

- ✅ **Meet EGAlim Law** - Comply with mandatory vegetarian dish requirements
- 💰 **Reduce Costs** - Vegetarian ingredients are typically 30-40% cheaper than meat
- 🌍 **Lower Carbon Footprint** - Plant-based meals reduce environmental impact
- 🥗 **Improve Nutrition** - Balanced, healthy meals for students and staff
- ♻️ **Minimize Waste** - Optimized ingredient sourcing reduces food waste

---

## 📈 Impact & Metrics

- **36,000+ canteens** analyzed across France
- **5 compliance badges** tracked per canteen
- **25€/month** affordable subscription for canteen managers
- **30-40% cost savings** through vegetarian menu optimization
- **100% EGAlim compliance** guaranteed

---

## 🛠️ Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Cantine OS** | Python, FastAPI, OR-Tools, Pydantic |
| **Cantine CRM** | Next.js 16, React 19, TypeScript, Tailwind CSS, Leaflet |
| **Cantine Scraper** | Node.js, Puppeteer |

---

## 🎯 Target Audience

- 🏫 **Municipal Canteen Managers** - Primary users of Cantine OS
- 🏛️ **Local Government Officials** - Monitor compliance across regions
- 📊 **Policy Makers** - Track EGAlim law implementation
- 🌍 **Sustainability Advocates** - Promote plant-based nutrition

---

## 📝 License

MIT

---

## 🤝 Contributing

This project was created for **Hack The Fork 2025** hackathon. Contributions are welcome!

---

## 🔗 Links

- **Repository:** [github.com/FelixMo42/HackTheFork2025](https://github.com/FelixMo42/HackTheFork2025)
- **French Canteen Database:** [ma-cantine.agriculture.gouv.fr](https://ma-cantine.agriculture.gouv.fr)

---

**Built with 💚 for sustainable food systems by Team Ardoise**

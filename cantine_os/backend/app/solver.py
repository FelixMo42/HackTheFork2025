"""
Cantine.OS - Menu Optimization Solver
Using Google OR-Tools CP-SAT for constraint programming
"""

import json
from ortools.sat.python import cp_model
from dataclasses import dataclass
from typing import List, Dict, Optional
from pathlib import Path


@dataclass
class Recipe:
    id: str
    nom: str
    type: str  # entree, plat_principal, garniture, dessert, produit_laitier
    vegetarien: bool
    bio: bool
    local: bool
    cout_portion_euro: float
    proteines_g: float
    lipides_g: float
    glucides_g: float
    fer_mg: float
    calcium_mg: float
    fibres_g: float
    co2_kg_portion: float
    tags: List[str]


@dataclass
class ConviveProfile:
    label: str
    age_min: int
    age_max: int
    effectif: int
    grammages: Dict[str, float]


@dataclass
class CanteenConfig:
    nom: str
    budget_max_par_repas: float  # User-defined budget
    nb_jours: int
    convives: List[ConviveProfile]
    priorite_carbone: float  # 0-1
    priorite_local: float  # 0-1
    priorite_budget: float  # 0-1


class MenuSolver:
    """
    Constraint Programming solver for menu optimization.
    Solves: Egalim + GEMRCN + Budget + Carbon constraints.
    """

    def __init__(self, config: CanteenConfig, recipes: List[Recipe], gemrcn: dict):
        self.config = config
        self.recipes = recipes
        self.gemrcn = gemrcn
        self.model = cp_model.CpModel()

        # Index recipes by type
        self.recipes_by_type = {}
        for r in recipes:
            if r.type not in self.recipes_by_type:
                self.recipes_by_type[r.type] = []
            self.recipes_by_type[r.type].append(r)

        # Decision variables: x[day, component, recipe_id] = 1 if selected
        self.x = {}

    def build_model(self):
        """Build the constraint model."""
        print("Building optimization model...")

        components = ["entree", "plat_principal", "garniture", "dessert", "produit_laitier"]
        days = range(self.config.nb_jours)

        # Create decision variables
        for d in days:
            for comp in components:
                if comp in self.recipes_by_type:
                    for recipe in self.recipes_by_type[comp]:
                        self.x[(d, comp, recipe.id)] = self.model.NewBoolVar(
                            f"x_{d}_{comp}_{recipe.id}"
                        )

        # CONSTRAINT 1: Exactly one recipe per component per day
        for d in days:
            for comp in components:
                if comp in self.recipes_by_type:
                    self.model.Add(
                        sum(
                            self.x[(d, comp, r.id)]
                            for r in self.recipes_by_type[comp]
                        )
                        == 1
                    )

        # CONSTRAINT 2: Budget constraint (user-defined)
        total_cost = sum(
            self.x[(d, comp, r.id)] * int(r.cout_portion_euro * 100)  # cents for integer math
            for d in days
            for comp in components
            if comp in self.recipes_by_type
            for r in self.recipes_by_type[comp]
        )
        budget_cents = int(self.config.budget_max_par_repas * 100 * self.config.nb_jours)
        self.model.Add(total_cost <= budget_cents)

        # CONSTRAINT 3: Egalim - At least 1 vegetarian main course per 5 days (week)
        weeks = self.config.nb_jours // 5
        for w in range(weeks):
            week_days = range(w * 5, min((w + 1) * 5, self.config.nb_jours))
            veg_count = sum(
                self.x[(d, "plat_principal", r.id)]
                for d in week_days
                for r in self.recipes_by_type.get("plat_principal", [])
                if r.vegetarien
            )
            self.model.Add(veg_count >= 1)

        # CONSTRAINT 4: GEMRCN frequency constraints (over 20 meals, prorated)
        # Get the appropriate population constraints from gemrcn
        # Default to 'elementaire' if available
        population_key = 'elementaire'
        if self.config.convives and hasattr(self.config.convives[0], 'age_min'):
            age = self.config.convives[0].age_min
            if age < 3:
                population_key = 'petite_enfance'
            elif age < 6:
                population_key = 'maternelle'
            elif age < 11:
                population_key = 'elementaire'
            else:
                population_key = 'adolescents'
        
        pop_constraints = self.gemrcn.get('populations', {}).get(population_key, {}).get('frequences_sur_20_repas', {})
        
        # Scale factor: if we have fewer than 20 days, scale constraints proportionally
        scale = self.config.nb_jours / 20.0
        
        # Helper to scale minimum constraints (round down, but at least 1 if original > 0)
        def scale_min(val):
            scaled = int(val * scale)
            return max(1, scaled) if val > 0 and scaled == 0 else scaled
        
        # Helper to scale maximum constraints (round up)
        def scale_max(val):
            return max(1, int(val * scale + 0.5))
        
        days_range = range(self.config.nb_jours)
        
        # --- MINIMUM CONSTRAINTS (>= X) ---
        
        # Crudités (raw vegetables) - min 10/20
        crudites_min = pop_constraints.get('crudites_min', 10)
        crudites_recipes = [r for r in self.recipes_by_type.get("entree", []) if "crudites" in r.tags]
        if crudites_recipes:
            crudites_count = sum(
                self.x[(d, "entree", r.id)]
                for d in days_range
                for r in crudites_recipes
            )
            self.model.Add(crudites_count >= scale_min(crudites_min))
        
        # Poisson qualité - min 4/20
        poisson_min = pop_constraints.get('poisson_qualite_min', pop_constraints.get('poisson_min', 4))
        fish_recipes = [r for r in self.recipes_by_type.get("plat_principal", []) if "poisson" in r.tags]
        if fish_recipes:
            fish_count = sum(
                self.x[(d, "plat_principal", r.id)]
                for d in days_range
                for r in fish_recipes
            )
            self.model.Add(fish_count >= scale_min(poisson_min))
        
        # Viande non hachée - min 4/20
        viande_min = pop_constraints.get('viande_non_hachee_min', 4)
        viande_recipes = [r for r in self.recipes_by_type.get("plat_principal", []) 
                          if "viande" in r.tags and "hache" not in r.tags]
        if viande_recipes:
            viande_count = sum(
                self.x[(d, "plat_principal", r.id)]
                for d in days_range
                for r in viande_recipes
            )
            self.model.Add(viande_count >= scale_min(viande_min))
        
        # Légumes en garniture - min 10/20
        legumes_min = pop_constraints.get('legumes_min', pop_constraints.get('legumes_cuits_min', 10))
        legumes_recipes = [r for r in self.recipes_by_type.get("garniture", []) if "legumes" in r.tags]
        if legumes_recipes:
            legumes_count = sum(
                self.x[(d, "garniture", r.id)]
                for d in days_range
                for r in legumes_recipes
            )
            self.model.Add(legumes_count >= scale_min(legumes_min))
        
        # Féculents en garniture - min 10/20
        feculents_min = pop_constraints.get('feculents_min', 10)
        feculents_recipes = [r for r in self.recipes_by_type.get("garniture", []) if "feculents" in r.tags]
        if feculents_recipes:
            feculents_count = sum(
                self.x[(d, "garniture", r.id)]
                for d in days_range
                for r in feculents_recipes
            )
            self.model.Add(feculents_count >= scale_min(feculents_min))
        
        # Fromages riches en calcium - min 8/20
        fromages_min = pop_constraints.get('fromages_calcium_min', 8)
        fromages_recipes = [r for r in self.recipes_by_type.get("produit_laitier", []) 
                           if "fromage" in r.tags or "calcium_eleve" in r.tags]
        if fromages_recipes:
            fromages_count = sum(
                self.x[(d, "produit_laitier", r.id)]
                for d in days_range
                for r in fromages_recipes
            )
            self.model.Add(fromages_count >= scale_min(fromages_min))
        
        # Laitages sains - min 6/20
        laitages_min = pop_constraints.get('laitages_sains_min', 6)
        laitages_recipes = [r for r in self.recipes_by_type.get("produit_laitier", []) 
                           if "laitages" in r.tags]
        if laitages_recipes:
            laitages_count = sum(
                self.x[(d, "produit_laitier", r.id)]
                for d in days_range
                for r in laitages_recipes
            )
            self.model.Add(laitages_count >= scale_min(laitages_min))
        
        # Fruits crus - min 8/20
        fruits_min = pop_constraints.get('fruits_crus_min', pop_constraints.get('fruits_min', 8))
        fruits_recipes = [r for r in self.recipes_by_type.get("dessert", []) if "fruits" in r.tags]
        if fruits_recipes:
            fruits_count = sum(
                self.x[(d, "dessert", r.id)]
                for d in days_range
                for r in fruits_recipes
            )
            self.model.Add(fruits_count >= scale_min(fruits_min))
        
        # --- MAXIMUM CONSTRAINTS (<= X) ---
        
        # Entrées grasses - max 4/20
        entrees_grasses_max = pop_constraints.get('entrees_grasses_max', 4)
        entrees_grasses = [r for r in self.recipes_by_type.get("entree", []) 
                          if "gras" in r.tags or "friture" in r.tags]
        if entrees_grasses:
            entrees_grasses_count = sum(
                self.x[(d, "entree", r.id)]
                for d in days_range
                for r in entrees_grasses
            )
            self.model.Add(entrees_grasses_count <= scale_max(entrees_grasses_max))
        
        # Fritures - max 4/20
        fritures_max = pop_constraints.get('fritures_max', 4)
        fritures_recipes = [r for r in self.recipes_by_type.get("plat_principal", []) 
                           if "friture" in r.tags or "frit" in str(r.tags)]
        if fritures_recipes:
            fritures_count = sum(
                self.x[(d, "plat_principal", r.id)]
                for d in days_range
                for r in fritures_recipes
            )
            self.model.Add(fritures_count <= scale_max(fritures_max))
        
        # Plats industriels - max 3/20
        plats_indus_max = pop_constraints.get('plats_industriels_max', 3)
        plats_indus = [r for r in self.recipes_by_type.get("plat_principal", []) 
                       if "industriel" in r.tags]
        if plats_indus:
            plats_indus_count = sum(
                self.x[(d, "plat_principal", r.id)]
                for d in days_range
                for r in plats_indus
            )
            self.model.Add(plats_indus_count <= scale_max(plats_indus_max))
        
        # Desserts gras - max 3/20
        desserts_gras_max = pop_constraints.get('desserts_gras_max', 3)
        desserts_gras = [r for r in self.recipes_by_type.get("dessert", []) 
                        if "gras" in r.tags]
        if desserts_gras:
            desserts_gras_count = sum(
                self.x[(d, "dessert", r.id)]
                for d in days_range
                for r in desserts_gras
            )
            self.model.Add(desserts_gras_count <= scale_max(desserts_gras_max))
        
        # Desserts sucrés - max 4/20
        desserts_sucres_max = pop_constraints.get('desserts_sucres_max', 4)
        desserts_sucres = [r for r in self.recipes_by_type.get("dessert", []) 
                          if "sucre" in r.tags and "sans_sucre" not in str(r.tags)]
        if desserts_sucres:
            desserts_sucres_count = sum(
                self.x[(d, "dessert", r.id)]
                for d in days_range
                for r in desserts_sucres
            )
            self.model.Add(desserts_sucres_count <= scale_max(desserts_sucres_max))

        # CONSTRAINT 5: Variety - same main dish not within 5 days
        # Only apply this constraint if we have more recipes than days,
        # otherwise the solver may not find a solution
        main_dishes = self.recipes_by_type.get("plat_principal", [])
        if len(main_dishes) > self.config.nb_jours:
            for r in main_dishes:
                for d in range(self.config.nb_jours - 4):
                    # At most 1 occurrence in any 5-day window
                    self.model.Add(
                        sum(self.x[(d + i, "plat_principal", r.id)] for i in range(5)) <= 1
                    )

        # OBJECTIVE: Minimize weighted sum of cost + carbon
        alpha = self.config.priorite_budget
        beta = self.config.priorite_carbone
        gamma = self.config.priorite_local

        # Cost component (cents)
        cost_obj = sum(
            self.x[(d, comp, r.id)] * int(r.cout_portion_euro * 100)
            for d in days
            for comp in components
            if comp in self.recipes_by_type
            for r in self.recipes_by_type[comp]
        )

        # Carbon component (grams for integer math)
        carbon_obj = sum(
            self.x[(d, comp, r.id)] * int(r.co2_kg_portion * 1000)
            for d in days
            for comp in components
            if comp in self.recipes_by_type
            for r in self.recipes_by_type[comp]
        )

        # Local bonus (negative = good)
        local_obj = sum(
            self.x[(d, comp, r.id)] * (-100 if r.local else 0)
            for d in days
            for comp in components
            if comp in self.recipes_by_type
            for r in self.recipes_by_type[comp]
        )

        # Weighted objective
        self.model.Minimize(
            int(alpha * 100) * cost_obj +
            int(beta * 100) * carbon_obj +
            int(gamma * 100) * local_obj
        )

        print(f"Model built: {self.config.nb_jours} days, {len(self.recipes)} recipes")

    def solve(self) -> Optional[Dict]:
        """Solve the model and return the menu plan."""
        self.build_model()

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 30.0

        print("Solving...")
        status = solver.Solve(self.model)

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            print(f"Solution found! Status: {'OPTIMAL' if status == cp_model.OPTIMAL else 'FEASIBLE'}")
            return self._extract_solution(solver)
        else:
            print(f"No solution found. Status: {status}")
            return None

    def _extract_solution(self, solver) -> Dict:
        """Extract the solution into a readable format."""
        components = ["entree", "plat_principal", "garniture", "dessert", "produit_laitier"]
        menu = {"jours": [], "stats": {}}

        total_cost = 0
        total_carbon = 0
        veg_count = 0
        bio_count = 0
        local_count = 0

        for d in range(self.config.nb_jours):
            day_menu = {"jour": d + 1, "composantes": {}}
            day_cost = 0
            day_carbon = 0

            for comp in components:
                if comp in self.recipes_by_type:
                    for r in self.recipes_by_type[comp]:
                        if solver.Value(self.x[(d, comp, r.id)]) == 1:
                            day_menu["composantes"][comp] = {
                                "recette": r.nom,
                                "cout": r.cout_portion_euro,
                                "co2": r.co2_kg_portion,
                                "vegetarien": r.vegetarien,
                                "bio": r.bio,
                                "local": r.local
                            }
                            day_cost += r.cout_portion_euro
                            day_carbon += r.co2_kg_portion
                            if r.vegetarien and comp == "plat_principal":
                                veg_count += 1
                            if r.bio:
                                bio_count += 1
                            if r.local:
                                local_count += 1

            day_menu["cout_total"] = round(day_cost, 2)
            day_menu["co2_total"] = round(day_carbon, 2)
            menu["jours"].append(day_menu)
            total_cost += day_cost
            total_carbon += day_carbon

        total_items = self.config.nb_jours * len(components)
        menu["stats"] = {
            "cout_moyen_par_jour": round(total_cost / self.config.nb_jours, 2),
            "cout_total": round(total_cost, 2),
            "co2_moyen_par_jour_kg": round(total_carbon / self.config.nb_jours, 2),
            "pct_repas_vegetariens": round(veg_count / self.config.nb_jours * 100, 1),
            "pct_bio": round(bio_count / total_items * 100, 1),
            "pct_local": round(local_count / total_items * 100, 1),
            "budget_respecte": total_cost <= self.config.budget_max_par_repas * self.config.nb_jours
        }

        return menu


def load_recipes(path: str) -> List[Recipe]:
    """Load recipes from JSON file."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    recipes = []
    for item in data:
        nutrition = item.get("nutrition_par_portion", {})
        recipes.append(Recipe(
            id=item["id"],
            nom=item["nom"],
            type=item["type"],
            vegetarien=item.get("vegetarien", False),
            bio=item.get("bio", False),
            local=item.get("local", False),
            cout_portion_euro=item.get("cout_portion_euro", 0),
            proteines_g=nutrition.get("proteines_g", 0),
            lipides_g=nutrition.get("lipides_g", 0),
            glucides_g=nutrition.get("glucides_g", 0),
            fer_mg=nutrition.get("fer_mg", 0),
            calcium_mg=nutrition.get("calcium_mg", 0),
            fibres_g=nutrition.get("fibres_g", 0),
            co2_kg_portion=item.get("co2_kg_portion", 0),
            tags=item.get("tags", [])
        ))
    return recipes


def main():
    """Demo: Generate a 5-day menu for a primary school."""
    # Load data
    data_dir = Path(__file__).parent.parent / "data"
    recipes = load_recipes(data_dir / "recettes.json")

    with open(data_dir / "gemrcn_constraints.json", "r", encoding="utf-8") as f:
        gemrcn = json.load(f)

    # Configure the canteen (user-defined parameters)
    config = CanteenConfig(
        nom="École Primaire Jean Moulin",
        budget_max_par_repas=2.00,  # USER INPUT
        nb_jours=5,
        convives=[
            ConviveProfile(
                label="Élémentaire",
                age_min=6,
                age_max=11,
                effectif=200,
                grammages={"proteines_g": 70, "feculents_cuits_g": 170}
            )
        ],
        priorite_carbone=0.3,
        priorite_local=0.3,
        priorite_budget=0.4
    )

    # Solve
    solver = MenuSolver(config, recipes, gemrcn)
    menu = solver.solve()

    if menu:
        print("\n" + "=" * 60)
        print("MENU GÉNÉRÉ")
        print("=" * 60)

        for jour in menu["jours"]:
            print(f"\n📅 Jour {jour['jour']} (Coût: {jour['cout_total']}€ | CO2: {jour['co2_total']}kg)")
            for comp, details in jour["composantes"].items():
                badges = []
                if details.get("vegetarien"):
                    badges.append("🌱")
                if details.get("bio"):
                    badges.append("🌿")
                if details.get("local"):
                    badges.append("📍")
                badge_str = " ".join(badges)
                print(f"   {comp.replace('_', ' ').title()}: {details['recette']} {badge_str}")

        print("\n" + "-" * 60)
        print("STATISTIQUES")
        print("-" * 60)
        stats = menu["stats"]
        print(f"💰 Coût moyen/jour: {stats['cout_moyen_par_jour']}€")
        print(f"🌍 CO2 moyen/jour: {stats['co2_moyen_par_jour_kg']}kg")
        print(f"🌱 Repas végétariens: {stats['pct_repas_vegetariens']}%")
        print(f"🌿 Produits bio: {stats['pct_bio']}%")
        print(f"📍 Produits locaux: {stats['pct_local']}%")
        print(f"✅ Budget respecté: {'Oui' if stats['budget_respecte'] else 'Non'}")

        # Save result
        output_path = data_dir / "menu_genere.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(menu, f, ensure_ascii=False, indent=2)
        print(f"\n📄 Menu sauvegardé: {output_path}")

    else:
        print("\n❌ Impossible de générer un menu avec les contraintes actuelles.")
        print("   Suggestions: Augmenter le budget ou relaxer les contraintes.")


if __name__ == "__main__":
    main()

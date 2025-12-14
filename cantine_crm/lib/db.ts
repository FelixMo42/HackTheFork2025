import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'canteens_data.json');
const COORDS_FILE = path.join(process.cwd(), 'data/city_coordinates.json');

export interface CanteenBadges {
    qualityProducts: boolean;
    wasteReduction: boolean;
    vegetarianMenus: boolean;
    plasticBan: boolean;
    consumerInfo: boolean;
}

export interface Canteen {
    id: number;
    name: string;
    city: string; // Used to be 'region' in old app, mapping concepts
    region?: string; // Not in json, city is main loc
    sector: string;
    managementType?: string;
    meals?: number;
    bioPercentage?: number;
    qualityPercentage?: number;
    badges: CanteenBadges;
    year?: number;
    // Helper for map if coordinates ever come back
    coordinates?: { lat: number; lng: number };
    aiReport?: string;
    url?: string;
}

export const db = {
    async getAll(search?: string): Promise<Canteen[]> {
        try {
            const dataPromise = fs.readFile(DATA_FILE, 'utf-8');
            const coordsPromise = fs.readFile(COORDS_FILE, 'utf-8');

            const [dataStr, coordsStr] = await Promise.all([dataPromise, coordsPromise]);

            const canteens: Omit<Canteen, 'id' | 'coordinates'>[] = JSON.parse(dataStr);
            const coords: Record<string, { lat: number, lng: number }> = JSON.parse(coordsStr);

            let results = canteens.map((c, index) => ({
                ...c,
                id: index,
                coordinates: coords[c.city] || undefined
            }));

            if (search) {
                const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                const searchNormalized = normalize(search);

                results = results.filter(c =>
                    normalize(c.name).includes(searchNormalized) ||
                    normalize(c.city).includes(searchNormalized)
                );
            }

            return results;
        } catch (error) {
            console.error("Error reading DB:", error);
            // Fallback if coords file fails, still return data
            try {
                const data = await fs.readFile(DATA_FILE, 'utf-8');
                return JSON.parse(data);
            } catch (e) {
                return [];
            }
        }
    },

    async getStats() {
        const canteens = await this.getAll();
        const totalCanteens = canteens.length;

        let totalBio = 0;
        let canteensWithBio = 0;
        let vegetarianCount = 0;
        let plasticBanCount = 0;

        canteens.forEach(c => {
            if (c.bioPercentage !== null && c.bioPercentage !== undefined) {
                totalBio += c.bioPercentage;
                canteensWithBio++;
            }
            if (c.badges.vegetarianMenus) vegetarianCount++;
            if (c.badges.plasticBan) plasticBanCount++;
        });

        const avgBio = canteensWithBio > 0 ? Math.round(totalBio / canteensWithBio) : 0;

        return {
            canteenCount: totalCanteens,
            avgBioPercentage: avgBio,
            vegetarianCount,
            plasticBanCount
        };
    },

    async getRecentCanteens() {
        // Just returning the first 5 for now as there is no specific "updatedAt" in the new JSON
        const canteens = await this.getAll();
        return canteens.slice(0, 5);
    },

    async getWorstPerformingCanteens(limit: number = 5): Promise<Canteen[]> {
        const canteens = await this.getAll();
        return canteens
            .sort((a, b) => {
                const bioA = a.bioPercentage || 0;
                const bioB = b.bioPercentage || 0;
                if (bioA !== bioB) return bioA - bioB;

                const qualA = a.qualityPercentage || 0;
                const qualB = b.qualityPercentage || 0;
                return qualA - qualB;
            })
            .slice(0, limit);
    },

    async getById(id: number): Promise<Canteen | null> {
        const canteens = await this.getAll();
        return canteens.find(c => c.id === id) || null;
    },

    async saveReport(id: number, report: string): Promise<void> {
        try {
            // Read raw data to preserve structure effectively
            const dataStr = await fs.readFile(DATA_FILE, 'utf-8');
            const canteens: Omit<Canteen, 'id' | 'coordinates'>[] = JSON.parse(dataStr);

            if (id >= 0 && id < canteens.length) {
                // @ts-ignore - The JSON structure accepts extra fields, extending type loosely here for persistence
                canteens[id].aiReport = report;

                await fs.writeFile(DATA_FILE, JSON.stringify(canteens, null, 2), 'utf-8');
            }
        } catch (error) {
            console.error("Error saving report:", error);
            throw error;
        }
    }
};

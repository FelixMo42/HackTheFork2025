
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data/municipalities.json');

export interface Policy {
    title: string;
    status: 'Adopted' | 'In Progress' | 'Draft' | 'Rejected';
    description: string;
    updatedAt?: string; // Optional in JSON, defaulted in app
}

export interface Contact {
    name: string;
    role: string;
    email: string;
}

export interface Municipality {
    id?: string; // Generated or inferred
    name: string;
    coordinates: { lat: number; lng: number };
    region: string;
    population: number;
    policies: Policy[];
    contacts: Contact[];
}

export const db = {
    async getAll(): Promise<Municipality[]> {
        try {
            const data = await fs.readFile(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error reading DB:", error);
            return [];
        }
    },

    async getStats() {
        const municipalities = await this.getAll();
        const totalMunicipalities = municipalities.length;

        let totalPolicies = 0;
        let adoptedPolicies = 0;
        let inProgressPolicies = 0;

        municipalities.forEach(m => {
            m.policies.forEach(p => {
                totalPolicies++;
                if (p.status === 'Adopted') adoptedPolicies++;
                if (p.status === 'In Progress') inProgressPolicies++;
            });
        });

        return {
            municipalityCount: totalMunicipalities,
            policyCount: totalPolicies,
            adoptedCount: adoptedPolicies,
            inProgressCount: inProgressPolicies
        };
    },

    async getRecentPolicies() {
        const municipalities = await this.getAll();
        const allPolicies = municipalities.flatMap(m =>
            m.policies.map(p => ({
                ...p,
                municipalityName: m.name,
                // Mocking date since JSON doesn't strictly have it, using current time for demo or needing a field in JSON
                updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date()
            }))
        );

        // Sort by date descending (mock logic if dates are missing, or just take first 5)
        return allPolicies.slice(0, 5);
    }
};

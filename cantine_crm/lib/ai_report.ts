import { spawn } from 'child_process';
import { db } from '@/lib/db';

export async function generateCanteenReport(canteenName: string, city: string, id: number, url?: string): Promise<string> {
    try {
        // 1. Check if report already exists in DB
        const canteen = await db.getById(id);
        if (canteen?.aiReport) {
            console.log(`Using cached report for ${canteenName}`);
            return canteen.aiReport;
        }

        // 2. If not, generate it
        const urlContext = url ? `Utilise cette URL pour trouver des informations spécifiques : ${url}` : '';
        const prompt = `Agis comme un expert en restauration collective durable. Analyse la cantine "${canteenName}" située à "${city}".
        ${urlContext}
        Génère un rapport structuré en français (Markdown) contenant :
        1. Une synthèse générale sur l'établissement.
        2. Les points forts (basé sur le nom, la localisation, et les données trouvées).
        3. 3 Recommandations stratégiques courtes pour améliorer la durabilité (bio, végétarien, zéro plastique).
        
        Sois concis, professionnel et encourageant.`;

        const blackboxPath = '/Users/felixmoses/.local/bin/blackbox';

        const report = await new Promise<string>((resolve, reject) => {
            const child = spawn(blackboxPath, [], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            let errorOutput = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            child.on('close', (code) => {
                if (code !== 0) {
                    console.warn(`Blackbox CLI exited with code ${code}. Stderr: ${errorOutput}`);
                    // If we have output despite error code, we might still want to use it, but safer to reject
                    if (!output.trim()) {
                        reject(new Error(`Blackbox CLI failed with code ${code}: ${errorOutput}`));
                        return;
                    }
                }

                // Clean up output
                let cleanReport = output
                    .replace(/^\| Tool read_file.*$/gm, '') // Remove tool logs
                    .replace(/^\| Read lines.*$/gm, '')
                    .replace(/^[|].*$/gm, '') // Catch all table-like logs
                    .trim();

                // Remove conversational filler if present (find first Markdown header)
                const firstHeadingIndex = cleanReport.indexOf('#');
                if (firstHeadingIndex !== -1) {
                    cleanReport = cleanReport.substring(firstHeadingIndex);
                }

                resolve(cleanReport.trim());
            });

            child.on('error', (err) => {
                reject(err);
            });

            // Write prompt to stdin
            child.stdin.write(prompt);
            child.stdin.end();
        });

        // 3. Save the report cache
        if (report && report.length > 50) {
            await db.saveReport(id, report);
        }

        return report;

    } catch (error) {
        console.error("Error generating report with Blackbox CLI:", error);
        return `
# Rapport non disponible

Une erreur est survenue lors de la génération du rapport via l'IA.
Veuillez réessayer plus tard.

*Erreur système*
        `.trim();
    }
}

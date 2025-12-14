import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Page non trouvée</h2>
            <p className="text-gray-600 mb-8">Désolé, nous n'avons pas pu trouver la ressource demandée.</p>
            <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Retour à l'accueil
            </Link>
        </div>
    )
}

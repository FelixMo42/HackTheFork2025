import { db } from '@/lib/db'

export default async function CanteensPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const { search } = await searchParams
    const canteens = await db.getAll(search)

    return (
        <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-8 max-w-2xl">Cantines</h2>
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nom</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ville</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Secteur</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bio (%)</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Qualité (%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {canteens.map((canteen) => (
                            <tr key={canteen.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 max-w-xs truncate" title={canteen.name}>{canteen.name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{canteen.city}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{canteen.sector}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{canteen.bioPercentage ? `${canteen.bioPercentage}%` : '-'}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{canteen.qualityPercentage ? `${canteen.qualityPercentage}%` : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

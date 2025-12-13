import { db } from '@/lib/db'

export default async function CanteensPage() {
    const municipalities = await db.getAll()

    return (
        <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-8 max-w-2xl">Cantines</h2>
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Ville</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Région</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Population</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Politiques suivies</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {municipalities.map((city) => (
                            <tr key={city.name}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{city.name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{city.region}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{city.population.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{city.policies.length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

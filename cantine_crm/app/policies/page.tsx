import { db } from '@/lib/db'
import Link from 'next/link'

export default async function IndicatorsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const { search } = await searchParams
    const canteens = await db.getAll(search)
    const total = canteens.length

    const indicators = [
        { key: 'vegetarianMenus', label: 'Menus Végétariens', desc: 'Propose régulièrement des repas végétariens' },
        { key: 'plasticBan', label: 'Zéro Plastique', desc: 'Interdiction des plastiques à usage unique' },
        { key: 'wasteReduction', label: 'Anti-Gaspillage', desc: 'Actions concrètes de réduction des déchets' },
        { key: 'qualityProducts', label: 'Produits de Qualité', desc: 'Utilisation significative de produits labellisés' },
        { key: 'consumerInfo', label: 'Information Convives', desc: 'Transparence sur la provenance des produits' }
    ]

    const stats = indicators.map(ind => {
        const count = canteens.filter(c => c.badges[ind.key as keyof typeof c.badges]).length
        return {
            ...ind,
            count,
            percentage: Math.round((count / total) * 100)
        }
    })

    return (
        <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-8 max-w-2xl">Indicateurs de Durabilité</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.key} className="overflow-hidden rounded-lg bg-white shadow border border-gray-100">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900">{stat.label}</h3>
                            <p className="text-sm text-gray-500 mt-1 mb-4 h-10">{stat.desc}</p>
                            <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-indigo-600">{stat.percentage}%</span>
                                <span className="ml-2 text-sm text-gray-500">soit {stat.count} cantines</span>
                            </div>
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${stat.percentage}%` }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cantines les moins performantes</h3>
                <div className="overflow-hidden rounded-lg bg-white shadow border border-red-100">
                    <ul className="divide-y divide-red-100">
                        {(await db.getWorstPerformingCanteens()).map(c => (
                            <li key={c.id} className="p-4 flex justify-between items-center bg-red-50/50">
                                <div className="min-w-0 flex-1 mr-4">
                                    <Link href={`/canteens/${c.id}`} className="font-medium text-gray-900 truncate hover:text-indigo-600 hover:underline" title={c.name}>
                                        {c.name}
                                    </Link>
                                    <p className="text-xs text-gray-500">{c.city}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="text-right">
                                        <p className="font-bold text-red-600">{c.bioPercentage || 0}%</p>
                                        <p className="text-xs text-gray-500">Bio</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-600">{c.qualityPercentage || 0}%</p>
                                        <p className="text-xs text-gray-500">Qualité</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail des labels</h3>
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {canteens.slice(0, 50).map(c => (
                            <li key={c.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                                <div>
                                    <Link href={`/canteens/${c.id}`} className="font-medium text-gray-900 hover:text-indigo-600 hover:underline">
                                        {c.name}
                                    </Link>
                                    <p className="text-xs text-gray-500">{c.city}</p>
                                </div>
                                <div className="flex gap-2">
                                    {/* Small dots for active badges */}
                                    {indicators.map(ind => (
                                        <div
                                            key={ind.key}
                                            title={ind.label}
                                            className={`w-3 h-3 rounded-full ${c.badges[ind.key as keyof typeof c.badges] ? 'bg-green-500' : 'bg-gray-200'}`}
                                        />
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <p className="p-4 text-xs text-center text-gray-500 bg-gray-50">Affichage limité aux 50 premiers établissements</p>
                </div>
            </div>
        </div>
    )
}

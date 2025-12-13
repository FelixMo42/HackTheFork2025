import { db } from '@/lib/db'

export default async function PoliciesPage() {
    const policies = await db.getRecentPolicies()

    return (
        <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-8 max-w-2xl">Toutes les politiques</h2>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                    {policies.map((policy) => (
                        <li key={policy.title + policy.municipalityName}>
                            <div className="block hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="truncate text-sm font-medium text-indigo-600">{policy.title}</p>
                                        <div className="ml-2 flex flex-shrink-0">
                                            <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                {policy.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {policy.municipalityName}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <p>
                                                Mis à jour le <time dateTime={policy.updatedAt.toISOString()}>{new Date(policy.updatedAt).toLocaleDateString('fr-FR')}</time>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

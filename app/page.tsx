
import { db } from '@/lib/db'
import { CheckCircle2, XCircle, Clock, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import dynamicLoader from 'next/dynamic'

const Map = dynamicLoader(() => import('@/components/Map'))

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const stats = await db.getStats()
  const recentPolicies = await db.getRecentPolicies()
  const municipalities = await db.getAll()

  const statCards = [
    { name: 'Total Municipalités', value: stats.municipalityCount, sub: 'Villes suivies activement', color: 'bg-blue-500' },
    { name: 'Total Politiques', value: stats.policyCount, sub: 'Toutes catégories', color: 'bg-indigo-500' },
    { name: 'Politiques Adoptées', value: stats.adoptedCount, sub: 'Entièrement mises en œuvre', color: 'bg-green-500' },
    { name: 'En Cours', value: stats.inProgressCount, sub: 'Suivi actuel', color: 'bg-yellow-500' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
        Suivi des Cantines
      </h2>

      {/* Map Section */}
      <div className="mb-8">
        <Map municipalities={municipalities} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {statCards.map((item) => (
          <div key={item.name} className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{item.value}</dd>
                </div>
                <div className={`h-2 w-2 rounded-full ${item.color}`} />
              </div>
              <p className="mt-3 text-sm text-gray-500">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Mises à jour récentes des politiques</h3>
              <p className="mt-2 text-sm text-gray-700">
                Derniers changements dans les politiques de durabilité pour toutes les municipalités.
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Link href="/policies" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Voir tout
              </Link>
            </div>
          </div>
          <div className="mt-6 flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200">
              {recentPolicies.map((policy: any) => (
                <li key={policy.title + policy.municipalityName} className="py-5">
                  <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                    <h3 className="text-sm font-semibold text-gray-800">
                      <Link href={`#`} className="hover:underline focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {policy.title}
                      </Link>
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{policy.description}</p>
                    <div className="mt-2 flex items-center gap-x-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-900">{policy.municipalityName}</span>
                      <span>&middot;</span>
                      <StatusBadge status={policy.status} />
                      <span>&middot;</span>
                      <time dateTime={policy.updatedAt.toISOString()}>{new Date(policy.updatedAt).toLocaleDateString('fr-FR')}</time>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    'Adopted': 'text-green-700 bg-green-50 ring-green-600/20',
    'In Progress': 'text-yellow-800 bg-yellow-50 ring-yellow-600/20',
    'Draft': 'text-gray-600 bg-gray-50 ring-gray-500/10',
    'Rejected': 'text-red-700 bg-red-50 ring-red-600/10',
  }
  const style = styles[status as keyof typeof styles] || styles['Draft']

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${style}`}>
      {status}
    </span>
  )
}

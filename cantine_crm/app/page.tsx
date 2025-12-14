
import { db } from '@/lib/db'
import { CheckCircle2, XCircle, Clock, ArrowUpRight, Leaf, Utensils, Ban } from 'lucide-react'
import Link from 'next/link'
import Map from '@/components/Map'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const stats = await db.getStats()
  const recentCanteens = await db.getRecentCanteens()

  // Empty array for now as we have no coords
  const mapData: any[] = []

  const statCards = [
    { name: 'Total Cantines', value: stats.canteenCount, sub: 'Établissements suivis', color: 'bg-blue-500' },
    { name: 'Moyenne Bio', value: `${stats.avgBioPercentage}%`, sub: 'Dans les assiettes', color: 'bg-green-500' },
    { name: 'Menu Végétarien', value: stats.vegetarianCount, sub: 'Cantines engagées', color: 'bg-indigo-500' },
    { name: 'Zéro Plastique', value: stats.plasticBanCount, sub: 'Cantines sans plastique', color: 'bg-pink-500' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-8">
        Suivi des Cantines
      </h2>

      {/* Map Section */}
      <div className="mb-8">
        <Map municipalities={stats.canteenCount > 0 ? await db.getAll() : []} />
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

      {/* Recent Activity / List */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Cantines Récentes</h3>
              <p className="mt-2 text-sm text-gray-700">
                Aperçu des derniers établissements ajoutés à la base.
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <Link href="/canteens" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Voir tout
              </Link>
            </div>
          </div>
          <div className="mt-6 flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200">
              {recentCanteens.map((canteen: any) => (
                <li key={canteen.name} className="py-5">
                  <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                    <h3 className="text-sm font-semibold text-gray-800">
                      <Link href={`/canteens/${canteen.id}`} className="hover:underline focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {canteen.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">{canteen.city} &middot; {canteen.sector}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      {canteen.bioPercentage !== null && (
                        <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          Bio: {canteen.bioPercentage}%
                        </span>
                      )}
                      {canteen.badges.vegetarianMenus && (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          Menu Végé
                        </span>
                      )}
                      {canteen.badges.plasticBan && (
                        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                          Zéro Plastique
                        </span>
                      )}
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

import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ReportSection } from '@/components/ReportSection';
import { ReportSkeleton } from '@/components/ReportSkeleton';

export default async function CanteenPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const ids = params.id;
    const canteenId = parseInt(ids, 10);

    if (isNaN(canteenId)) {
        return notFound();
    }

    const canteen = await db.getById(canteenId);

    if (!canteen) {
        return notFound();
    }



    return (
        <div>
            <div className="mb-6">
                <Link href="/canteens" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    &larr; Retour à la liste
                </Link>
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
                {/* Information Section */}
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 mb-8 lg:mb-0">
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight mb-4">
                        {canteen.name}
                    </h1>

                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Ville</dt>
                            <dd className="mt-1 text-sm text-gray-900">{canteen.city}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Secteur</dt>
                            <dd className="mt-1 text-sm text-gray-900">{canteen.sector}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Repas par jour (est.)</dt>
                            <dd className="mt-1 text-sm text-gray-900">{canteen.meals || 'N/A'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Type Gestion</dt>
                            <dd className="mt-1 text-sm text-gray-900">{canteen.managementType || 'N/A'}</dd>
                        </div>

                        <div className="sm:col-span-2 border-t border-gray-100 pt-4">
                            <h3 className="font-medium text-gray-900 mb-2">Performance Durable</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="text-sm text-green-600 font-medium">Bio</div>
                                    <div className="mt-1 text-2xl font-bold text-green-900">
                                        {canteen.bioPercentage ? `${canteen.bioPercentage}%` : '0%'}
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-50 rounded-lg">
                                    <div className="text-sm text-indigo-600 font-medium">Qualité & Durable</div>
                                    <div className="mt-1 text-2xl font-bold text-indigo-900">
                                        {canteen.qualityPercentage ? `${canteen.qualityPercentage}%` : '0%'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </dl>
                </div>

                {/* AI Report Section - Streamed */}
                <Suspense fallback={<ReportSkeleton />}>
                    <ReportSection canteenName={canteen.name} city={canteen.city} id={canteen.id} />
                </Suspense>
            </div>
        </div>
    );
}

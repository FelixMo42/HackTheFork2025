'use client';

import dynamic from 'next/dynamic';

const MapInner = dynamic(() => import('./MapInner'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />
});

export default function Map(props: any) {
    return <MapInner {...props} />;
}

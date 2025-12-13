'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icon in Next.js
const customIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function Map({ municipalities }: { municipalities: any[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" />;

    // Default center (France approx)
    const position: [number, number] = [46.603354, 1.888334];

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 z-0 relative">
            <MapContainer center={position} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {municipalities.map((city) => (
                    city.coordinates && (
                        <Marker
                            key={city.name}
                            position={[city.coordinates.lat, city.coordinates.lng]}
                            icon={customIcon}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-sm mb-1">{city.name}</h3>
                                    <p className="text-xs text-gray-600 mb-2">{city.region}</p>
                                    <div className="text-xs">
                                        <span className="font-semibold block mb-1">Politiques:</span>
                                        {city.policies.slice(0, 2).map((p: any) => (
                                            <div key={p.title} className="flex items-center gap-1 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${p.status === 'Adopted' ? 'bg-green-500' :
                                                        p.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-300'
                                                    }`} />
                                                <span className="truncate max-w-[150px]">{p.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
}

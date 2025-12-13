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

export default function MapInner({ municipalities }: { municipalities: any[] }) {
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
                {municipalities.map((canteen) => (
                    canteen.coordinates && (
                        <Marker
                            key={`${canteen.name}-${canteen.city}`}
                            position={[canteen.coordinates.lat, canteen.coordinates.lng]}
                            icon={customIcon}
                        >
                            <Popup>
                                <div className="p-1 min-w-[150px]">
                                    <h3 className="font-bold text-sm mb-1">{canteen.name}</h3>
                                    <p className="text-xs text-gray-600 mb-2">{canteen.city} ({canteen.sector})</p>

                                    <div className="mb-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span>Bio:</span>
                                            <span className="font-semibold">{canteen.bioPercentage ?? 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-green-500 h-1.5 rounded-full"
                                                style={{ width: `${canteen.bioPercentage ?? 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {canteen.badges.vegetarianMenus && (
                                            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-medium">Végé</span>
                                        )}
                                        {canteen.badges.plasticBan && (
                                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-medium">Plastique</span>
                                        )}
                                        {canteen.badges.wasteReduction && (
                                            <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 text-[10px] font-medium">Déchets</span>
                                        )}
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

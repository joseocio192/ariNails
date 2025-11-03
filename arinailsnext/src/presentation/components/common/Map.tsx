"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Typography, Box } from '@mui/material';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  address?: string;
  latitude?: number;
  longitude?: number;
}

export const Map: React.FC<Props> = ({ address, latitude, longitude }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [pos, setPos] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  const [error, setError] = useState<string | null>(null);

  // Ensure component only renders on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (latitude && longitude) return;
    if (!address) return;

    const q = encodeURIComponent(address + ', Culiacan, Sinaloa');
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;

    let cancelled = false;

    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          setPos([lat, lon]);
        } else {
          setError('No se encontró la ubicación.');
        }
      })
      .catch((err) => {
        console.error('Geocoding error', err);
        if (!cancelled) setError('Error al buscar la dirección.');
      });

    return () => { cancelled = true; };
  }, [address, isMounted]);

  // Don't render anything until mounted on client
  if (!isMounted) {
    return (
      <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: 'text.secondary' }}>Cargando mapa...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!pos) {
    return (
      <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: 'text.secondary' }}>Buscando ubicación...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <MapContainer center={pos} zoom={16} style={{ width: '100%', height: '100%', borderRadius: 12 }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={pos}>
          <Popup>
            {address}
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
};

export default Map;

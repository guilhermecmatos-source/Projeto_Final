"use client";

import { useEffect, useRef, useState } from "react";
import FormModal from "@/components/ui/FormModal";
import Icon from "@/components/ui/Icon";
import { geocodingApi } from "@/services/api";
import * as L from "leaflet";

interface GoogleMapsGeoselectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (address: string, lat: number, lng: number) => void;
  title?: string;
}

interface PlaceResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function GoogleMapsGeoselector({
  open,
  onClose,
  onSelect,
  title = "Selecione a Localização no Mapa",
}: GoogleMapsGeoselectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!open || !mapRef.current || mapInstance.current) return;

    let cancelled = false;

    async function init() {
      const Leaflet = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;

      const defaultLat = -10.184;
      const defaultLng = -48.333;

      const map = Leaflet.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 12,
        zoomControl: false,
      });

      Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      Leaflet.control.zoom({ position: "bottomright" }).addTo(map);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 14);
            setCoords({ lat: latitude, lng: longitude });
            setSelectedAddress(`Minha Localização: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            if (markerInstance.current) {
              markerInstance.current.setLatLng([latitude, longitude]);
            } else {
              markerInstance.current = Leaflet.marker([latitude, longitude]).addTo(map);
            }
          },
          () => {},
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }

      // Map Click Event
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setCoords({ lat, lng });
        setSelectedAddress(`Coordenadas Selecionadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);

        if (markerInstance.current) {
          markerInstance.current.setLatLng(e.latlng);
        } else {
          markerInstance.current = Leaflet.marker(e.latlng).addTo(map);
        }
      });

      mapInstance.current = map;
      setMapReady(true);
    }

    init();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markerInstance.current = null;
      setMapReady(false);
    };
  }, [open]);

  // Search places
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await geocodingApi.places(searchQuery);
      // Backend api /api/geocoding/places might return Nominatim results or customized array
      const data = Array.isArray(res.data) ? res.data : [];
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = async (res: PlaceResult) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    
    setCoords({ lat, lng });
    setSelectedAddress(res.display_name);
    setResults([]);
    setSearchQuery(res.display_name);

    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 15);
      
      const Leaflet = (await import("leaflet")).default;
      if (markerInstance.current) {
        markerInstance.current.setLatLng([lat, lng]);
      } else {
        markerInstance.current = Leaflet.marker([lat, lng]).addTo(mapInstance.current);
      }
    }
  };

  const handleConfirm = () => {
    if (coords && selectedAddress) {
      onSelect(selectedAddress, coords.lat, coords.lng);
      onClose();
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={title}
      subtitle="Busque o endereço ou clique diretamente no mapa para capturar a localização exata."
      wide
    >
      <div className="space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar endereço, cidade ou ponto de interesse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-fleet flex-1"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-4 py-2 flex items-center gap-1 uppercase"
          >
            <Icon name="search" />
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {/* Results dropdown list */}
        {results.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-high divide-y divide-outline-variant/30 text-xs">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectResult(r)}
                className="w-full text-left p-3 text-slate-100 hover:bg-white/10 transition"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}

        {/* Map view container */}
        <div className="relative overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
          <div ref={mapRef} style={{ height: "300px" }} className="w-full z-[100]" />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
              <Icon name="hourglass_top" className="animate-spin text-xl mr-2 text-primary" />
              Carregando mapa operacional...
            </div>
          )}
        </div>

        {/* Coords indicator and Confirm Button */}
        {coords && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-surface-container-high/40 border border-outline-variant/30 rounded-lg p-3 text-xs">
            <div className="flex-1">
              <p className="font-bold text-primary uppercase text-[10px] tracking-wider mb-1">Local Escolhido</p>
              <p className="text-slate-100 font-semibold truncate max-w-lg">{selectedAddress}</p>
              <p className="text-slate-400 mt-0.5">Lat: {coords.lat.toFixed(6)} | Lng: {coords.lng.toFixed(6)}</p>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              className="btn-primary w-full md:w-auto px-6 py-2.5 flex items-center justify-center gap-2 uppercase font-semibold text-xs tracking-wider"
            >
              <Icon name="check" />
              Confirmar Localização
            </button>
          </div>
        )}
      </div>
    </FormModal>
  );
}

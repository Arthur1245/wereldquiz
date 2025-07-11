// src/LocatieKaart.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, GeoJSON, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const kaartStijl = {
  fillColor: "#4a90e2",
  weight: 1,
  color: "black",
  fillOpacity: 0.7,
};

const getLandNaam = (feature) =>
  feature.properties.ADMIN ||
  feature.properties.name ||
  feature.properties.NAME ||
  feature.properties.NAME_LONG ||
  "";

export default function LocatieKaart({ correctCountry, onLandClick }) {
  const [landen, setLanden] = useState([]);
  const [geoJsonLayer, setGeoJsonLayer] = useState(null);
  const [aangeduid, setAangeduid] = useState({});

  // Reset kleuren bij nieuwe vraag
  useEffect(() => {
    setAangeduid({});
    if (geoJsonLayer) {
      geoJsonLayer.eachLayer((layer) => {
        geoJsonLayer.resetStyle(layer);
      });
    }
  }, [correctCountry, geoJsonLayer]);

  // GeoJSON ophalen zonder TopoJSON
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.features) {
          setLanden(data.features);
        } else {
          console.error("❌ Geen geldige GeoJSON:", data);
        }
      })
      .catch((err) => {
        console.error("🌍 Fout bij laden landen:", err);
      });
  }, []);

  const landStijl = (feature) => {
    const name = getLandNaam(feature);
    if (aangeduid[name] === "juist") {
      return { ...kaartStijl, fillColor: "green" };
    } else if (aangeduid[name] === "fout") {
      return { ...kaartStijl, fillColor: "red" };
    }
    return kaartStijl;
  };

  const onEachFeature = (feature, layer) => {
    const name = getLandNaam(feature);
    if (!name) return;

    layer.on({
      click: () => {
        const gekozen = name;
        const gekozenNorm = gekozen.toLowerCase().trim();
        const correctNorm = correctCountry.englishName.toLowerCase().trim();

        const correct = gekozenNorm === correctNorm;

        setAangeduid({
          [gekozen]: correct ? "juist" : "fout",
          ...(correct ? {} : { [correctCountry.englishName]: "juist" }),
        });

        if (onLandClick) onLandClick(gekozen);
      },
    });
  };

  return (
    <div
      style={{
        height: "min(70vh, 500px)",
        width: "100%",
        maxWidth: "900px",
        margin: "auto",
        border: "2px solid #ccc",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        backgroundColor: "white",
      }}
    >
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
          attribution=""
        />
        {landen.length > 0 && (
          <GeoJSON
            data={landen}
            style={landStijl}
            onEachFeature={onEachFeature}
            ref={(layer) => setGeoJsonLayer(layer)}
          />
        )}
      </MapContainer>
    </div>
  );
}

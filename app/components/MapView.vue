```vue
<template>
  <div class="absolute inset-y-0 left-70 right-0">
    <div id="map" class="h-full w-full"></div>
  </div>
</template>

<script setup>
import {
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";

import { useDeviceStore } from "../stores/deviceStore";
import { useGeofenceStore } from "../stores/geofenceStore";

const deviceStore = useDeviceStore();
const geofenceStore = useGeofenceStore();

let L = null;
let map;
let markers = [];
let drawnItems;
let activeDrawHandler = null;

const geofenceLayers = new Map();

let polygonPoints = [];
let polygonMarkers = [];
let polygonLine = null;
let polygonPreviewLine = null;
let polygonDrawing = false;

let tempDrawnLayer = null;

onMounted(async () => {
  deviceStore.loadDevices();
  geofenceStore.loadGeo();

  const leaflet = await import("leaflet");
  L = leaflet.default || leaflet;
  if (import.meta.client) {
    window.L = L;
  }
  await import("leaflet-draw");
  map = L.map("map").setView(
    [-6.927872140221646, 107.59082794189455],
    13
  );
  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "© OpenStreetMap",
    }
  ).addTo(map);
  drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  map.on(
    L.Draw.Event.CREATED,
    handleDrawCreated
  );
  map.on(
    "click",
    handleMapClick
  );

  window.addEventListener(
    "focus-geofence",
    handleFocusGeofence
  );

  renderMarkers();
  renderGeofences();
});

watch(
  () => deviceStore.devices,
  () => {
    if (map) {
      renderMarkers();
    }
  },
  {
    deep: true,
  }
);

watch(
  () => deviceStore.selectedDevice,
  (device) => {
    if (!device || !map) {
      return;
    }

    map.setView(
      [
        device.lat,
        device.lng,
      ],
      16
    );

    const selected =
      markers.find(
        (m) =>
          m.id === device.id
      );

    if (selected) {
      selected.marker.openPopup();
    }
  }
);

watch(
  () => [
    deviceStore.isAdding,
    deviceStore.isEditing,
  ],
  ([adding, editing]) => {
    if (!map) {
      return;
    }

    if (
      adding ||
      editing
    ) {
      map.getContainer().style.cursor =
        "crosshair";
    } else if (
      !geofenceStore.showForm
    ) {
      map.getContainer().style.cursor =
        "grab";
    }
  }
);

watch(
  () => geofenceStore.showForm,
  (show) => {
    if (!map) {
      return;
    }

    if (show) {
      if (
        geofenceStore.isEditing
      ) {
        showEditingGeometry();
      } else {
        startDrawing(
          geofenceStore.type ||
          "polygon"
        );
      }
    } else {
      stopDrawing();
    }
  }
);

watch(
  () => geofenceStore.type,
  (type, oldType) => {
    if (!map) {
      return;
    }

    if (
      !geofenceStore.showForm
    ) {
      return;
    }

    if (
      type === oldType
    ) {
      return;
    }

    clearTempDrawing();

    if (
      geofenceStore.isEditing &&
      type ===
      geofenceStore.originalType
    ) {
      restoreOriginalGeometry();

      return;
    }

    startDrawing(type);
  }
);

watch(
  () => geofenceStore.color,
  () => {
    updateTempLayerStyle();
  }
);

watch(
  () => geofenceStore.geofence,
  () => {
    if (!map) {
      return;
    }

    if (
      geofenceStore.showForm
    ) {
      return;
    }

    renderGeofences();
  },
  {
    deep: true,
  }
);

function handleFocusGeofence(event) {
  const geo = event.detail;

  if (!geo || !map) {
    return;
  }

  focusGeofence(geo);
}

function handleMapClick(e) {
  if (
    deviceStore.isAdding ||
    deviceStore.isEditing
  ) {
    deviceStore.setTempLocation(
      e.latlng.lat,
      e.latlng.lng
    );
  }
}

function renderMarkers() {
  markers.forEach(
    (item) => {
      map.removeLayer(
        item.marker
      );
    }
  );

  markers = [];

  deviceStore.devices.forEach(
    (device) => {
      const marker =
        L.marker([
          device.lat,
          device.lng,
        ])
          .addTo(map)
          .bindPopup(
            device.name
          );

      markers.push({
        id: device.id,
        marker,
      });
    }
  );
}

function focusGeofence(geo) {
  if (
    !geo ||
    !geo.geometry ||
    !map
  ) {
    return;
  }

  const geometry =
    geo.geometry;

  if (
    geometry.type ===
    "Polygon"
  ) {
    const coordinates =
      geometry.coordinates?.[0];

    if (
      !Array.isArray(
        coordinates
      ) ||
      coordinates.length === 0
    ) {
      return;
    }

    const latlngs =
      coordinates
        .map(
          (point) => {
            if (
              !Array.isArray(
                point
              ) ||
              point.length < 2
            ) {
              return null;
            }

            const lng =
              Number(point[0]);

            const lat =
              Number(point[1]);

            if (
              !Number.isFinite(
                lat
              ) ||
              !Number.isFinite(
                lng
              )
            ) {
              return null;
            }

            return [
              lat,
              lng,
            ];
          }
        )
        .filter(Boolean);

    if (
      latlngs.length === 0
    ) {
      return;
    }

    const bounds =
      L.latLngBounds(
        latlngs
      );

    if (
      !bounds.isValid()
    ) {
      return;
    }

    map.fitBounds(
      bounds,
      {
        padding: [
          80,
          80,
        ],
        maxZoom: 17,
        animate: true,
      }
    );

    setTimeout(
      () => {
        if (!map) {
          return;
        }

        L.popup()
          .setLatLng(
            bounds.getCenter()
          )
          .setContent(
            `<b>${geo.name}</b>`
          )
          .openOn(map);
      },
      500
    );

    return;
  }

  if (
    geometry.type ===
    "Circle"
  ) {
    let circleLayer =
      geofenceLayers.get(
        geo.id
      );

    if (!circleLayer) {
      const entry =
        [...geofenceLayers.entries()]
          .find(
            ([id]) =>
              String(id) ===
              String(geo.id)
          );

      circleLayer =
        entry
          ? entry[1]
          : null;
    }

    if (
      !circleLayer ||
      typeof circleLayer.getBounds !==
      "function"
    ) {
      renderGeofences();

      circleLayer =
        geofenceLayers.get(
          geo.id
        );

      if (!circleLayer) {
        const entry =
          [...geofenceLayers.entries()]
            .find(
              ([id]) =>
                String(id) ===
                String(geo.id)
            );

        circleLayer =
          entry
            ? entry[1]
            : null;
      }
    }

    if (
      !circleLayer ||
      typeof circleLayer.getBounds !==
      "function"
    ) {
      return;
    }

    const bounds =
      circleLayer.getBounds();

    if (
      !bounds ||
      !bounds.isValid()
    ) {
      return;
    }

    map.fitBounds(
      bounds,
      {
        padding: [
          80,
          80,
        ],
        maxZoom: 17,
        animate: true,
      }
    );

    setTimeout(
      () => {
        if (!map) {
          return;
        }

        const center =
          circleLayer.getLatLng();

        L.popup()
          .setLatLng(center)
          .setContent(
            `<b>${geo.name}</b>`
          )
          .openOn(map);
      },
      500
    );
  }
}

function findGeofenceLayer(id) {
  const layer =
    geofenceLayers.get(
      id
    );

  if (layer) {
    return layer;
  }

  const entry =
    [...geofenceLayers.entries()]
      .find(
        ([layerId]) =>
          String(layerId) ===
          String(id)
      );

  if (!entry) {
    return null;
  }

  const foundLayer =
    entry[1];

  if (
    foundLayer instanceof
    L.GeoJSON
  ) {
    let childLayer =
      null;

    foundLayer.eachLayer(
      (child) => {
        childLayer =
          child;
      }
    );

    return (
      childLayer ||
      foundLayer
    );
  }

  return foundLayer;
}

function showEditingGeometry() {
  clearTempDrawing();

  if (
    !geofenceStore.tempGeometry
  ) {
    startDrawing(
      geofenceStore.type
    );

    return;
  }

  if (
    geofenceStore
      .tempGeometry
      .type === "Polygon"
  ) {
    showPolygonGeometry(
      geofenceStore.tempGeometry
    );
  }

  if (
    geofenceStore
      .tempGeometry
      .type === "Circle"
  ) {
    showCircleGeometry(
      geofenceStore.tempGeometry
    );
  }
}

function showPolygonGeometry(
  geometry
) {
  const coordinates =
    geometry.coordinates[0];

  const latlngs =
    coordinates.map(
      ([lng, lat]) => [
        lat,
        lng,
      ]
    );

  tempDrawnLayer =
    L.polygon(
      latlngs,
      {
        color:
          geofenceStore.color ||
          "#2563eb",

        weight: 3,

        fillColor:
          geofenceStore.color ||
          "#2563eb",

        fillOpacity: 0.2,
      }
    ).addTo(
      drawnItems
    );
}

function showCircleGeometry(
  geometry
) {
  tempDrawnLayer =
    L.circle(
      geometry.center,
      {
        radius:
          geometry.radius,

        color:
          geofenceStore.color ||
          "#2563eb",

        weight: 3,

        fillColor:
          geofenceStore.color ||
          "#2563eb",

        fillOpacity: 0.2,
      }
    ).addTo(
      drawnItems
    );
}

function restoreOriginalGeometry() {
  if (
    !geofenceStore.originalGeometry
  ) {
    startDrawing(
      geofenceStore.type
    );

    return;
  }

  geofenceStore.setTempGeometry(
    JSON.parse(
      JSON.stringify(
        geofenceStore.originalGeometry
      )
    )
  );

  showEditingGeometry();
}

function startDrawing(
  type
) {
  stopDrawing();

  geofenceStore.startDrawing();

  map.getContainer().style.cursor =
    "crosshair";

  if (
    type === "polygon"
  ) {
    startPolygonDrawing();

    return;
  }

  if (
    type === "circle"
  ) {
    activeDrawHandler =
      new L.Draw.Circle(
        map,
        {
          shapeOptions: {
            color:
              geofenceStore.color ||
              "#2563eb",

            weight: 3,

            fillColor:
              geofenceStore.color ||
              "#2563eb",

            fillOpacity: 0.2,
          },
        }
      );

    activeDrawHandler.enable();
  }
}

function startPolygonDrawing() {
  polygonDrawing = true;

  polygonPoints = [];

  polygonMarkers = [];

  map.getContainer().style.cursor =
    "crosshair";

  map.on(
    "click",
    handlePolygonMapClick
  );

  map.on(
    "mousemove",
    handlePolygonMouseMove
  );
}

function handlePolygonMapClick(
  e
) {
  if (!polygonDrawing) {
    return;
  }

  const latlng =
    e.latlng;

  if (
    polygonPoints.length >=
    3
  ) {
    const first =
      map.latLngToContainerPoint(
        polygonPoints[0]
      );

    const current =
      map.latLngToContainerPoint(
        latlng
      );

    if (
      first.distanceTo(
        current
      ) <= 20
    ) {
      finishPolygonDrawing();

      return;
    }
  }

  addPolygonPoint(
    latlng
  );
}

function addPolygonPoint(
  latlng
) {
  polygonPoints.push(
    latlng
  );

  const isFirst =
    polygonPoints.length ===
    1;

  const marker =
    L.marker(
      latlng,
      {
        icon:
          L.divIcon({
            className:
              isFirst
                ? "polygon-first-point"
                : "polygon-point",

            html: "",

            iconSize:
              isFirst
                ? [20, 20]
                : [16, 16],

            iconAnchor:
              isFirst
                ? [10, 10]
                : [8, 8],
          }),

        interactive:
          isFirst,

        zIndexOffset:
          1000,
      }
    );

  if (isFirst) {
    marker.on(
      "click",
      (event) => {
        L.DomEvent.stopPropagation(
          event
        );

        if (
          polygonPoints.length >=
          3
        ) {
          finishPolygonDrawing();
        }
      }
    );
  }

  marker.addTo(map);

  polygonMarkers.push(
    marker
  );

  updatePolygonLine();
}

function handlePolygonMouseMove(
  e
) {
  if (!polygonDrawing) {
    return;
  }

  if (
    polygonPoints.length ===
    0
  ) {
    return;
  }

  if (
    polygonPreviewLine
  ) {
    map.removeLayer(
      polygonPreviewLine
    );
  }

  polygonPreviewLine =
    L.polyline(
      [
        ...polygonPoints,
        e.latlng,
      ],
      {
        color:
          geofenceStore.color ||
          "#2563eb",

        weight: 3,

        dashArray:
          "6 6",
      }
    ).addTo(map);
}

function updatePolygonLine() {
  if (polygonLine) {
    map.removeLayer(
      polygonLine
    );

    polygonLine = null;
  }

  if (
    polygonPoints.length <
    2
  ) {
    return;
  }

  polygonLine =
    L.polyline(
      polygonPoints,
      {
        color:
          geofenceStore.color ||
          "#2563eb",

        weight: 3,
      }
    ).addTo(map);
}

function finishPolygonDrawing() {
  if (!polygonDrawing) {
    return;
  }

  if (
    polygonPoints.length <
    3
  ) {
    return;
  }

  if (polygonLine) {
    map.removeLayer(
      polygonLine
    );

    polygonLine = null;
  }

  if (
    polygonPreviewLine
  ) {
    map.removeLayer(
      polygonPreviewLine
    );

    polygonPreviewLine = null;
  }

  polygonMarkers.forEach(
    (marker) => {
      map.removeLayer(
        marker
      );
    }
  );

  polygonMarkers = [];

  if (
    tempDrawnLayer
  ) {
    drawnItems.removeLayer(
      tempDrawnLayer
    );
  }

  tempDrawnLayer =
    L.polygon(
      polygonPoints,
      {
        color:
          geofenceStore.color ||
          "#2563eb",

        weight: 3,

        fillColor:
          geofenceStore.color ||
          "#2563eb",

        fillOpacity: 0.2,
      }
    ).addTo(
      drawnItems
    );

  const geoJson =
    tempDrawnLayer.toGeoJSON();

  geofenceStore.setTempGeometry(
    {
      type: "Polygon",

      coordinates:
        geoJson.geometry
          .coordinates,
    }
  );

  polygonDrawing = false;

  geofenceStore.stopDrawing();

  map.off(
    "click",
    handlePolygonMapClick
  );

  map.off(
    "mousemove",
    handlePolygonMouseMove
  );

  map.getContainer().style.cursor =
    "grab";
}

function handleDrawCreated(
  e
) {
  if (
    e.layerType !==
    "circle"
  ) {
    return;
  }

  if (
    tempDrawnLayer
  ) {
    drawnItems.removeLayer(
      tempDrawnLayer
    );

    tempDrawnLayer = null;
  }

  const layer =
    e.layer;

  const center =
    layer.getLatLng();

  const radius =
    layer.getRadius();

  const color =
    geofenceStore.color ||
    "#2563eb";

  layer.setStyle({
    color,
    fillColor: color,
  });

  tempDrawnLayer =
    layer;

  drawnItems.addLayer(
    tempDrawnLayer
  );

  geofenceStore.setTempGeometry(
    {
      type: "Circle",

      center: [
        center.lat,
        center.lng,
      ],

      radius,
    }
  );

  geofenceStore.stopDrawing();

  if (
    activeDrawHandler
  ) {
    activeDrawHandler.disable();

    activeDrawHandler = null;
  }

  map.getContainer().style.cursor =
    "grab";
}

function updateTempLayerStyle() {
  if (
    !tempDrawnLayer
  ) {
    return;
  }

  const color =
    geofenceStore.color ||
    "#2563eb";

  tempDrawnLayer.setStyle({
    color,
    fillColor: color,
  });

  if (polygonLine) {
    polygonLine.setStyle({
      color,
    });
  }

  if (
    polygonPreviewLine
  ) {
    polygonPreviewLine.setStyle({
      color,
    });
  }
}

function clearTempDrawing() {
  polygonDrawing = false;

  polygonPoints = [];

  map?.off(
    "click",
    handlePolygonMapClick
  );

  map?.off(
    "mousemove",
    handlePolygonMouseMove
  );

  polygonMarkers.forEach(
    (marker) => {
      if (map) {
        map.removeLayer(
          marker
        );
      }
    }
  );

  polygonMarkers = [];

  if (
    polygonLine &&
    map
  ) {
    map.removeLayer(
      polygonLine
    );

    polygonLine = null;
  }

  if (
    polygonPreviewLine &&
    map
  ) {
    map.removeLayer(
      polygonPreviewLine
    );

    polygonPreviewLine = null;
  }

  if (
    activeDrawHandler
  ) {
    activeDrawHandler.disable();

    activeDrawHandler = null;
  }

  if (
    tempDrawnLayer &&
    drawnItems
  ) {
    drawnItems.removeLayer(
      tempDrawnLayer
    );

    tempDrawnLayer = null;
  }
}

function stopDrawing() {
  clearTempDrawing();

  if (map) {
    map.getContainer().style.cursor =
      "grab";
  }
}

function renderGeofences() {
  if (
    !map ||
    !drawnItems
  ) {
    return;
  }

  geofenceLayers.forEach(
    (layer) => {
      drawnItems.removeLayer(
        layer
      );
    }
  );

  geofenceLayers.clear();

  geofenceStore.geofence.forEach(
    (geofence) => {
      const layer =
        createGeofenceLayer(
          geofence
        );

      if (!layer) {
        return;
      }

      drawnItems.addLayer(
        layer
      );

      geofenceLayers.set(
        geofence.id,
        layer
      );
    }
  );
}

function createGeofenceLayer(
  geofence
) {
  if (
    !geofence.geometry
  ) {
    return null;
  }

  if (
    geofence.geometry.type ===
    "Polygon"
  ) {
    const layer =
      L.geoJSON(
        {
          type: "Feature",

          geometry:
            geofence.geometry,

          properties: {},
        },
        {
          style: {
            color:
              geofence.color ||
              "#2563eb",

            weight: 3,

            fillColor:
              geofence.color ||
              "#2563eb",

            fillOpacity: 0.2,
          }
        }
      );

    layer.bindPopup(
      `<b>${geofence.name}</b>`
    );

    return layer;
  }

  if (
    geofence.geometry.type ===
    "Circle"
  ) {
    const circle =
      L.circle(
        geofence.geometry.center,
        {
          radius:
            geofence.geometry.radius,

          color:
            geofence.color ||
            "#2563eb",

          weight: 3,

          fillColor:
            geofence.color ||
            "#2563eb",

          fillOpacity: 0.2,
        }
      );

    circle.bindPopup(
      `<b>${geofence.name}</b>`
    );

    return circle;
  }

  return null;
}

onBeforeUnmount(() => {
  window.removeEventListener(
    "focus-geofence",
    handleFocusGeofence
  );

  if (map) {
    map.off(
      "click",
      handleMapClick
    );
  }

  stopDrawing();

  if (map) {
    map.remove();
  }
});
</script>

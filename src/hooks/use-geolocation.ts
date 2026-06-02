import { useState, useCallback } from "react";

// ----------------------------------------------------------------------

type GeoLocation = { lat: number; lng: number };
export type GeolocationPermission = "idle" | "pending" | "granted" | "denied";

interface ReturnType {
  location: GeoLocation | null;
  permissionStatus: GeolocationPermission;
  getLocation: () => void;
}

export function useGeolocation(): ReturnType {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<GeolocationPermission>("idle");

  const getLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPermissionStatus("denied");
      return;
    }
    setPermissionStatus("pending");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPermissionStatus("granted");
      },
      () => setPermissionStatus("denied"),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  return { location, permissionStatus, getLocation };
}

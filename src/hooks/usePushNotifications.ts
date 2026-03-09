import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported] = useState(
    typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
  );

  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission);
    checkSubscription();
  }, [isSupported, user]);

  const checkSubscription = useCallback(async () => {
    if (!isSupported || !user) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch {
      // ignore
    }
  }, [isSupported, user]);

  const getVapidPublicKey = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("vapid-public-key");
      if (error || !data) return null;
      return data.publicKey ?? null;
    } catch {
      return null;
    }
  };

  const subscribe = useCallback(async () => {
    if (!user || !isSupported) return false;
    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      const vapidKey = await getVapidPublicKey();
      if (!vapidKey) {
        console.warn("VAPID public key not configured yet");
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const subJson = subscription.toJSON();
      const { error } = await (supabase as any)
        .from("push_subscriptions")
        .upsert(
          { user_id: user.id, endpoint: subJson.endpoint, subscription: subJson },
          { onConflict: "user_id" }
        );

      if (!error) {
        setIsSubscribed(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Push subscribe error:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      await (supabase as any).from("push_subscriptions").delete().eq("user_id", user.id);
      setIsSubscribed(false);
    } catch (err) {
      console.error("Push unsubscribe error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return { permission, isSubscribed, isLoading, isSupported, subscribe, unsubscribe };
}

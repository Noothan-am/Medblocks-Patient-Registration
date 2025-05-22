import React, { createContext, useContext, useEffect } from "react";

type TabSyncEvent = {
  type:
    | "PATIENT_ADDED"
    | "PATIENT_DELETED"
    | "PATIENTS_UPDATED"
    | "TAB_CONNECTED"
    | "TAB_DISCONNECTED";
  data?: any;
};

type TabSyncContextType = {
  broadcastEvent: (event: TabSyncEvent) => void;
  isConnected: boolean;
  connectedTabs: number;
};

const TabSyncContext = createContext<TabSyncContextType>({
  broadcastEvent: () => {},
  isConnected: false,
  connectedTabs: 1,
});

const CHANNEL_NAME = "patient-registration-sync";

export const useTabSync = () => useContext(TabSyncContext);

export const TabSyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [channel, setChannel] = React.useState<BroadcastChannel | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectedTabs, setConnectedTabs] = React.useState(1);

  useEffect(() => {
    // Create broadcast channel
    const broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    setChannel(broadcastChannel);
    setIsConnected(true);

    // Broadcast that this tab is connected
    broadcastChannel.postMessage({ type: "TAB_CONNECTED" });

    // Cleanup on unmount
    return () => {
      broadcastChannel.postMessage({ type: "TAB_DISCONNECTED" });
      broadcastChannel.close();
      setIsConnected(false);
    };
  }, []);

  const broadcastEvent = React.useCallback(
    (event: TabSyncEvent) => {
      if (channel) {
        channel.postMessage(event);
      }
    },
    [channel]
  );

  useEffect(() => {
    if (!channel) return;

    const handleMessage = (event: MessageEvent<TabSyncEvent>) => {
      // Handle different event types
      switch (event.data.type) {
        case "PATIENT_ADDED":
        case "PATIENT_DELETED":
        case "PATIENTS_UPDATED":
          // Dispatch a custom event that components can listen to
          window.dispatchEvent(
            new CustomEvent("tabSync", { detail: event.data })
          );
          break;
        case "TAB_CONNECTED":
          setConnectedTabs((prev) => prev + 1);
          break;
        case "TAB_DISCONNECTED":
          setConnectedTabs((prev) => Math.max(1, prev - 1));
          break;
      }
    };

    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
    };
  }, [channel]);

  return (
    <TabSyncContext.Provider
      value={{ broadcastEvent, isConnected, connectedTabs }}
    >
      {children}
    </TabSyncContext.Provider>
  );
};

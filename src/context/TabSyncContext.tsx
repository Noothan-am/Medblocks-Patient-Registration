import React, { createContext, useContext, useEffect } from "react";

type TabSyncEvent = {
  type: "PATIENT_ADDED" | "PATIENT_DELETED" | "PATIENTS_UPDATED";
  data?: any;
};

type TabSyncContextType = {
  broadcastEvent: (event: TabSyncEvent) => void;
};

const TabSyncContext = createContext<TabSyncContextType>({
  broadcastEvent: () => {},
});

const CHANNEL_NAME = "patient-registration-sync";

export const useTabSync = () => useContext(TabSyncContext);

export const TabSyncProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [channel, setChannel] = React.useState<BroadcastChannel | null>(null);

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    setChannel(broadcastChannel);

    return () => {
      broadcastChannel.close();
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
      switch (event.data.type) {
        case "PATIENT_ADDED":
        case "PATIENT_DELETED":
        case "PATIENTS_UPDATED":
          window.dispatchEvent(
            new CustomEvent("tabSync", { detail: event.data })
          );
          break;
      }
    };

    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
    };
  }, [channel]);

  return (
    <TabSyncContext.Provider value={{ broadcastEvent }}>
      {children}
    </TabSyncContext.Provider>
  );
};

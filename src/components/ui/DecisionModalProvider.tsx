"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";

type ActionTone = "primary" | "danger" | "neutral";

type DecisionAction = {
  key: string;
  label: string;
  tone?: ActionTone;
};

type DecisionRequest = {
  title: string;
  description?: string;
  icon?: "warning" | "info";
  actions: DecisionAction[];
};

type DecisionContextType = {
  choose: (request: DecisionRequest) => Promise<string>;
  confirm: (request: Omit<DecisionRequest, "actions"> & { confirmLabel?: string; cancelLabel?: string; danger?: boolean }) => Promise<boolean>;
  notify: (request: Omit<DecisionRequest, "actions"> & { closeLabel?: string }) => Promise<void>;
};

const DecisionContext = createContext<DecisionContextType | null>(null);

function toneClass(tone: ActionTone) {
  if (tone === "danger") return "bg-rose-600 hover:bg-rose-700 text-white";
  if (tone === "neutral") return "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50";
  return "bg-emerald-600 hover:bg-emerald-700 text-white";
}

export function DecisionModalProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<DecisionRequest | null>(null);
  const resolverRef = useRef<((value: string) => void) | null>(null);

  const closeWith = useCallback((value: string) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setRequest(null);
  }, []);

  const choose = useCallback((nextRequest: DecisionRequest) => {
    return new Promise<string>((resolve) => {
      resolverRef.current = resolve;
      setRequest(nextRequest);
    });
  }, []);

  const confirm = useCallback<DecisionContextType["confirm"]>(async ({ confirmLabel, cancelLabel, danger, ...rest }) => {
    const result = await choose({
      ...rest,
      icon: rest.icon || "warning",
      actions: [
        { key: "cancel", label: cancelLabel || "Batal", tone: "neutral" },
        { key: "confirm", label: confirmLabel || "Lanjutkan", tone: danger ? "danger" : "primary" },
      ],
    });
    return result === "confirm";
  }, [choose]);

  const notify = useCallback<DecisionContextType["notify"]>(async ({ closeLabel, ...rest }) => {
    await choose({
      ...rest,
      icon: rest.icon || "info",
      actions: [{ key: "close", label: closeLabel || "Tutup", tone: "primary" }],
    });
  }, [choose]);

  const contextValue = useMemo(
    () => ({ choose, confirm, notify }),
    [choose, confirm, notify]
  );

  return (
    <DecisionContext.Provider value={contextValue}>
      {children}
      {request && (
        <div className="fixed inset-0 z-[240] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm"
            onClick={() => closeWith("cancel")}
            aria-label="Tutup modal"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${request.icon === "warning" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"}`}>
                  {request.icon === "warning" ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                </div>
                <p className="font-bold text-gray-900">{request.title}</p>
              </div>
              <button
                type="button"
                onClick={() => closeWith("cancel")}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {request.description && (
              <div className="px-5 py-4">
                <p className="text-sm text-gray-600 leading-relaxed">{request.description}</p>
              </div>
            )}
            <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap justify-end gap-2 bg-gray-50/60">
              {request.actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => closeWith(action.key)}
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${toneClass(action.tone || "primary")}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </DecisionContext.Provider>
  );
}

export function useDecisionModal() {
  const ctx = useContext(DecisionContext);
  if (!ctx) {
    throw new Error("useDecisionModal must be used inside DecisionModalProvider");
  }
  return ctx;
}

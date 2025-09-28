import { useState, useEffect } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

const toasts: Toast[] = [];
const listeners: ((toasts: Toast[]) => void)[] = [];

function addToast(toast: Omit<Toast, "id">) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { ...toast, id };
  toasts.push(newToast);
  listeners.forEach((listener) => listener(toasts));

  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);

  return id;
}

function removeToast(id: string) {
  const index = toasts.findIndex((t) => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    listeners.forEach((listener) => listener(toasts));
  }
}

export function toast(options: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}) {
  return addToast(options);
}

toast.success = (description: string) => {
  return addToast({
    title: "Éxito",
    description,
    variant: "default",
  });
};

toast.error = (description: string) => {
  return addToast({
    title: "Error",
    description,
    variant: "destructive",
  });
};

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToastList([...newToasts]);
    };

    listeners.push(listener);
    listener(toasts);

    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    toasts: toastList,
    toast,
    dismiss: removeToast,
  };
}

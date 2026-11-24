import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import ToastProvider from "../../components/ui/ToastProvider";

function AdminShell() {
  return (
    <ToastProvider>
      <meta name="robots" content="noindex" />
      <Suspense
        fallback={
          <div className="grid min-h-dvh place-items-center bg-ink text-brand">
            <Icon name="spinner" className="size-8" />
            <span className="sr-only">Učitavanje …</span>
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </ToastProvider>
  );
}

export default AdminShell;

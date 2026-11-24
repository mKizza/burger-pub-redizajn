import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { clearToken, getToken } from "../lib/auth";

export function useAdminApi() {
  const navigate = useNavigate();

  return useCallback(
    async (path, options = {}) => {
      try {
        return await apiFetch(path, { ...options, token: getToken() });
      } catch (err) {
        if (err.status === 401) {
          clearToken();
          err.sessionExpired = true;
          navigate("/admin-login", { replace: true, state: { reason: "expired" } });
        }

        throw err;
      }
    },
    [navigate],
  );
}

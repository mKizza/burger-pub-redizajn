import { Navigate } from "react-router-dom";
import { getToken, isTokenUsable } from "../../lib/auth";

function RequireAdmin({ children }) {
  const token = getToken();

  if (!isTokenUsable(token)) {
    return (
      <Navigate
        to="/admin-login"
        replace
        state={token ? { reason: "expired" } : undefined}
      />
    );
  }

  return children;
}

export default RequireAdmin;

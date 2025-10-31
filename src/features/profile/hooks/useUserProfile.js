import * as React from "react";
import { me } from "../../../entities/auth/api";
import { getById as getUserById } from "../../../entities/user/api";

export function useUserProfile() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const meRes = await me();               // ApiResponse<UserDTO> | UserDTO
        const uShort = meRes?.data || meRes || {};
        let uFull = {};
        if (uShort?.id) {
          try {
            const got = await getUserById(uShort.id); // ApiResponse<User> | User
            uFull = got || {};
          } catch {}
        }

        const merged = {
          ...uShort,
          phoneNumber: uFull.phoneNumber ?? uShort.phoneNumber,
          avatarUrl:   uFull.avatarUrl   ?? uFull.avatar ?? uShort.avatarUrl,
          fullName:    (uShort.fullName && uShort.fullName.trim()) ? uShort.fullName : (uFull.fullName ?? ""),
          userName:    uShort.userName ?? uFull.userName,
          email:       uShort.email ?? uFull.email,
          userRoles:   uShort.userRoles ?? uFull.userRoles ?? [],
        };

        if (alive) setUser(merged);
      } catch {
        if (alive) setErr("Не вдалося завантажити профіль");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { user, setUser, loading, err };
}

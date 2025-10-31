import { http } from "../../api";

export async function uploadAvatar(file) {
  const fd = new FormData();
  
  fd.append("File", file);
  return http.postForm("/api/User/upload-avatar", fd);
}

// витягнути повний User по id
export async function getById(id) {
  const res = await http.get(`/api/User/get/${id}`);
  // бек повертає ApiResponse<User>, тому зручно віддати res.data || res
  return res?.data ?? res;
}

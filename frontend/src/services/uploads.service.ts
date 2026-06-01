import http from "./http";

export const uploadsApi = {
  upload: (file: File, entityType: string, entityId?: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("entityType", entityType);
    if (entityId) form.append("entityId", entityId);
    return http.post("/uploads", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

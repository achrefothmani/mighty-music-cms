import api from "./api";

export const getConfig = () => api.get("/config").then(res => res.data);
export const updateConfig = (data: any) => api.patch("/config", data).then(res => res.data);

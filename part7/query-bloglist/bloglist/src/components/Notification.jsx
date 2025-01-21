import React from "react";
import { useNotificationValue } from "../contexts/NotificationContext";
import { Alert } from "@mui/material";

const Notification = () => {
  // Consumimos el contexto mediante el hook personalizado "useNotificationValue()" (retorna el valor del estado recuperado de la consumición del contexto con el hook "useContext(NotificationContext)").
  const message = useNotificationValue();

  if (message) return <Alert severity="info">{message}</Alert>;
};

export default Notification;

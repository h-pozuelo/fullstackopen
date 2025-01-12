import React from "react";
import { useNotificationValue } from "../contexts/NotificationContext";

const Notification = () => {
  // Consumimos el contexto mediante el hook personalizado "useNotificationValue()" (retorna el valor del estado recuperado de la consumición del contexto con el hook "useContext(NotificationContext)").
  const message = useNotificationValue();

  const style = {
    border: "solid",
    padding: 10,
    borderWidth: 1,
    marginBottom: 5,
  };

  if (!message) return null;

  return <div style={style}>{message}</div>;
};

export default Notification;

import React from "react";
import { useSelector } from "react-redux";

const Notification = () => {
  // El hook "useSelector()" permite recuperar del almacén de estados un estado en concreto. En este caso estamos recuperando el estado al completo (el estado actualmente se compone del mensaje).
  const message = useSelector((state) => state.notification);

  if (message) return <div>{message}</div>;
};

export default Notification;

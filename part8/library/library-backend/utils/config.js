require("dotenv").config(); // Configuramos el acceso al fichero `.env` para poder recuperar variables de entorno.

const MONGODB_URI = process.env.MONGODB_URI; // Recuperamos la URI de la bbdd mediante variables de entorno.

module.exports = { MONGODB_URI };

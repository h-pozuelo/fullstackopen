const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  /* Establecemos la propiedad "username" como única para evitar la creación de cuentas de usuario con el mismo "username".
  Debemos controlar la excepción con nombre de error "MongoServerError" y mensaje de error "E11000 duplicate key error" en el middleware controlador de errores (`utils/middleware.js`).
   */
  username: { type: String, minLength: 3, required: true, unique: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  // Como cada usuario puede tener múltiples blogs incluimos una lista de identificadores "ObjectId" que hacen referencia al modelo "Blog" de nuestra base de datos.
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    // Como la propiedad "_id" es de tipo "ObjectId" debemos transformarlo a una cadena de texto.
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // Cuando un usuario es transformado a JSON ("json-parser" al responder solicitudes HTTP) no debemos incluir la propiedad "passwordHash".
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

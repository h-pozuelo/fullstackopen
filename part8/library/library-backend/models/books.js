const mongoose = require("mongoose"); // Importamos la librería de `Mongoose`.

/* Con el constructor de `mongoose.Schema()` creamos un esquema para el modelo `Book`.

El constructor recibe como parámetro un objeto en el que cada una de sus propiedades coincide con un campo del modelo.

Cada propiedad del objeto puede recibir una cadena de texto que define el tipo de dato (por ejemplo, `String`) o un objeto que define el tipo, si es requerido, si es único, etc...
*/
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true, minlength: 2 },
  published: { type: Number },
  // El esquema de `Book` contiene el campo `author` que hace referencia a un autor existente en la bbdd.
  author: {
    type: mongoose.Schema.Types.ObjectId, // Es de tipo `ObjectId` (no una cadena de texto).
    ref: "Author", // Contiene el nombre del modelo al que hace referencia.
  },
  genres: [{ type: String }],
});

// // ¡IMPORTANTE! No necesitamos modificar el método `toJSON` puesto que GraphQL de manera automática transforma la propiedad `._id` del objeto a la propiedad `.id`.
// bookSchema.set("toJSON", {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString();
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   },
// });

module.exports = mongoose.model("Book", bookSchema); // Exportamos un modelo personalizado que utilizaremos para manipular elementos de la colección/entidad `Books` (plural de `Book`).

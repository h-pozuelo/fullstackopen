import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import blogService from "./services/blogs";

const queryClient = new QueryClient();

// Construimos un hook personalizado para recuperar el resultado de la consulta a la clave "['blogs']".
export const useResult = () => {
  /* El hook "useQuery()" recibe como parámetro un objeto con las propiedades:
        - "queryKey" : Clave que identifica a la consulta. Para definir la clave la rodeamos por corchetes ([]).
        - "queryFn" : Función callback que se va a ejecutar. La información devuelta por la función callback es almacenada en la propiedad ".data" del objeto retornado por el hook "useQuery()".

    El hook "useQuery()" devuelve un objeto con propiedades como ".status", ".isLoading", ".data", ... (es como una promesa)
    */
  const result = useQuery({
    queryKey: ["blogs"],
    queryFn: blogService.getAllBlogs,
  });
  return result;
};

/* Para realizar operaciones como CREATE, UPDATE o DELETE debemos utilizar el hook "useMutation()". El hook recibe como parámetro un objeto con las propiedades:
    - "mutationFn" : Función callback que va a poder ser ejecutada mediante el método ".mutate()" que posee el objeto retornado al crear el "mutator" (createBlogMutation.mutate()).
    - "onSuccess" : Función callback que se ejecuta cuando se completa con éxito la operación. Podemos especificar que reciba un parámetro que será el valor retornado por la función callback "mutationFn".

Para poder ejecutar la operación llamamos al método "newBlogMutation.mutate()" pasándole como parámetro el objeto que esperaría la función "blogService.createBlog()".
*/
export const useNewBlogMutation = () => {
  const newBlogMutation = useMutation({
    mutationFn: blogService.createBlog,
    /* La función callback "onSuccess" puede recibir como parámetros:
        - "data" : Resultado retornado al ejecutar "blogService.createBlog()".
        - "variables" : Parámetros que recibe el método "newBlogMutation.mutate()" (corresponde con los parámetros que espera recibir la función "blogService.createBlog()").
        - "context" : Utilizando la propiedad "onMutate: (variables) => { ... }" podemos definir una función callback que retorne un valor (context).

    Si hubiesemos declarado el "mutation" fuera del fichero `src/client.js`...
    Con el hook "useQueryClient()" recuperamos el cliente pasado como contexto por el proveedor `<QueryClientProvider>` en el fichero `src/main.jsx`.
    De esta manera podremos manipular los valores de cada clave (ej. ["blogs"]).
    */
    onSuccess: (data, variables, context) => {
      // Recuperamos del cliente el valor de la clave ["blogs"].
      const currentBlogs = queryClient.getQueryData(["blogs"]);
      // Re-definimos el valor de la clave ["blogs"] concatenando la nueva publicación.
      queryClient.setQueryData(["blogs"], currentBlogs.concat(data));
    },
  });
  return newBlogMutation;
};

export const useUpdateBlogMutation = () => {
  const updateBlogMutation = useMutation({
    /* El método ".mutate()" sólo espera recibir un parámetro. Para poder actualizar publicaciones debemos pasar como parámetros tanto el identificador como la publicación.
    Podemos solucionar esto definiendo una función callback que reciba como parámetro un objeto.
    */
    mutationFn: ({ id, updatedBlog }) =>
      blogService.updateBlog(id, updatedBlog),
    onSuccess: (data, variables, context) => {
      const currentBlogs = queryClient.getQueryData(["blogs"]);
      queryClient.setQueryData(
        ["blogs"],
        currentBlogs.map((blog) => (blog.id !== data.id ? blog : data))
      );
    },
  });
  return updateBlogMutation;
};

export const useDeleteBlogMutation = () => {
  const deleteBlogMutation = useMutation({
    mutationFn: blogService.deleteBlog,
    onSuccess: (data, variables, context) => {
      const id = variables;
      const currentBlogs = queryClient.getQueryData(["blogs"]);
      queryClient.setQueryData(
        ["blogs"],
        currentBlogs.filter((blog) => blog.id !== id)
      );
    },
  });
  return deleteBlogMutation;
};

export const useCommentBlogMutation = () => {
  const commentBlogMutation = useMutation({
    mutationFn: ({ id, comment }) => blogService.commentBlog(id, comment),
    onSuccess: (data, variables, context) => {
      const id = variables.id;
      const currentBlogs = queryClient.getQueryData(["blogs"]);
      queryClient.setQueryData(
        ["blogs"],
        currentBlogs.map((blog) => (blog.id !== id ? blog : data))
      );
    },
  });
  return commentBlogMutation;
};

export default queryClient;

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (acc, blog) => acc + blog.likes;

  return blogs.reduce(reducer, 0);
};

const favouriteBlog = (blogs) => {
  const maxLikes = Math.max(...blogs.map((blog) => blog.likes));
  const { title, author, likes } = blogs.find(
    (blog) => blog.likes === maxLikes
  );

  return { title, author, likes };
};

const mostBlogs = (blogs) => {
  //   /* La función "reducer(acc, blog)" devuelve el acumulador pasado como parámetro sumándole un "+1" a la clave correspondiente al nombre del autor (si no existe la clave la inicializa a "1").
  //    */
  //   const reducer = (acc, blog) => {
  //     const key = blog.author;
  //     const value = acc[key];

  //     return { ...acc, [key]: value ? value + 1 : 1 };
  //   };
  //   const authors = blogs.reduce(reducer, {});

  //   const maxBlogs = Math.max(...Object.values(authors)); // Recuperamos el valor máximo.
  //   /* Con el método "Object.entries()" transformamos el objeto en una lista "[[key, value], ...]". Primero mapeamos cada elemento de la lista a un objeto JavaScript para a continuación recuperar el primer objeto en la que su propiedad "blogs" corresponda con el valor máximo.
  //    */
  //   const author = Object.entries(authors)
  //     .map(([key, value]) => ({ author: key, blogs: value }))
  //     .find((author) => author.blogs === maxBlogs);

  //   return author;

  const reducer = (acc, blog) => {
    const author = blog.author;
    const blogs = acc.find((a) => a.author === author)?.blogs;

    if (!blogs) return acc.concat({ author, blogs: 1 });

    return acc.map((a) =>
      a.author === author ? { ...a, blogs: a.blogs + 1 } : a
    );
  };
  const authors = blogs.reduce(reducer, []);

  const maxBlogs = Math.max(...authors.map((a) => a.blogs));
  const authorMostBlogs = authors.find((a) => a.blogs === maxBlogs);

  return authorMostBlogs;
};

const mostLikes = (blogs) => {
  const reducer = (acc, blog) => {
    const author = blog.author;
    const likes = acc.find((a) => a.author === author)?.likes;

    if (!likes) return acc.concat({ author, likes: blog.likes });

    return acc.map((a) =>
      a.author === author ? { ...a, likes: a.likes + blog.likes } : a
    );
  };
  const authors = blogs.reduce(reducer, []);

  const maxLikes = Math.max(...authors.map((a) => a.likes));
  const authorMostLikes = authors.find((a) => a.likes === maxLikes);

  return authorMostLikes;
};

module.exports = { dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes };

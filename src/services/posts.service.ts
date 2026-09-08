export const getPostById = (id: string) => {
  if (id === "1") {
    return {
      id: "1",
      title: "my first post",
      content: "Welcome to my BLOG",
    };
  }
  return null;
};

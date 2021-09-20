export const element = {
  type: "div",
  props: {
    id: "A",
    children: [
      {
        type: "div",
        props: {
          id: "B1",
          children: [
            {
              type: "div",

              props: {
                id: "C1",
              },
            },
            {
              type: "div",

              props: {
                id: "C2",
              },
            },
          ],
        },
      },
      {
        type: "div",
        props: {
          id: "B2",
        },
      },
    ],
  },
};

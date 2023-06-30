import { globalCss } from '@ignite-ui/react';

// ISSO É UMA FUNÇÃO
export const globalStyles = globalCss({
  '*': {
    boxSizing: 'border-box',

    margin: 0,
    padding: 0,
  },

  body: {
    backgroundColor: '$gray900',

    color: '$gray100',

    'webkit-font-smoothing': 'antialiased',
  },
});

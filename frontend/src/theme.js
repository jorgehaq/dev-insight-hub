import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f6ff',
      100: '#b3e0ff',
      200: '#80cbff',
      300: '#4db5ff',
      400: '#1a9fff',
      500: '#0080e6',
      600: '#0064b3',
      700: '#004880',
      800: '#002c4d',
      900: '#00101a',
    },
  },
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
    },
    Card: {
      baseStyle: {
        p: '6',
        bg: 'white',
        borderRadius: 'lg',
        boxShadow: 'md',
        _dark: {
          bg: 'gray.800',
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '600',
      },
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      },
    }),
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

export default theme;
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  },
  colors: {
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    surface: {
      bg: '#0f1117',
      card: '#1a1d2e',
      cardHover: '#1e2235',
      border: '#2d3148',
      borderHover: '#3d4168',
    },
  },
  styles: {
    global: {
      'html, body': {
        bg: '#0f1117',
        color: '#e2e8f0',
      },
      '::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '::-webkit-scrollbar-track': {
        bg: '#0f1117',
      },
      '::-webkit-scrollbar-thumb': {
        bg: '#2d3148',
        borderRadius: '3px',
      },
      '::-webkit-scrollbar-thumb:hover': {
        bg: '#3d4168',
      },
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: '#1a1d2e',
          borderColor: '#2d3148',
          borderWidth: '1px',
          borderRadius: '12px',
          overflow: 'hidden',
        },
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            borderColor: '#2d3148',
            color: '#94a3b8',
            fontWeight: 600,
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
          td: {
            borderColor: '#2d3148',
            fontSize: '0.9rem',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: '#1a1d2e',
          borderColor: '#2d3148',
          borderWidth: '1px',
        },
        header: {
          borderBottomColor: '#2d3148',
        },
      },
    },
    Button: {
      variants: {
        solid: {
          bg: '#6366f1',
          color: 'white',
          _hover: { bg: '#818cf8' },
          _active: { bg: '#4f46e5' },
        },
        outline: {
          borderColor: '#6366f1',
          color: '#6366f1',
          _hover: { bg: 'rgba(99,102,241,0.12)' },
        },
        ghost: {
          color: '#94a3b8',
          _hover: { bg: 'rgba(99,102,241,0.1)', color: '#e2e8f0' },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: '#12141f',
            borderColor: '#2d3148',
            color: '#e2e8f0',
            _hover: { borderColor: '#4338ca' },
            _focus: {
              borderColor: '#6366f1',
              boxShadow: '0 0 0 1px #6366f1',
            },
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: '#12141f',
            borderColor: '#2d3148',
            color: '#e2e8f0',
            _hover: { borderColor: '#4338ca' },
            _focus: {
              borderColor: '#6366f1',
              boxShadow: '0 0 0 1px #6366f1',
            },
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Textarea: {
      variants: {
        outline: {
          bg: '#12141f',
          borderColor: '#2d3148',
          color: '#e2e8f0',
          _hover: { borderColor: '#4338ca' },
          _focus: {
            borderColor: '#6366f1',
            boxShadow: '0 0 0 1px #6366f1',
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },
  },
})

export default theme

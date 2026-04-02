import { ThemeProvider as NextThemesProvider } from 'next-themes';

const ThemeProvider = ({ children }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="black"
      enableSystem={false}
      themes={['light', 'black', 'navy']}
    >
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;

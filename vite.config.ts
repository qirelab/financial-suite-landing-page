
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';
  import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

  export default defineConfig({
    plugins: [
      react(),
      ViteImageOptimizer({
        png: {
          quality: 80,
        },
        jpeg: {
          quality: 80,
        },
        jpg: {
          quality: 80,
        },
      }),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/fb623f6b059b888cf4155f7c95166d688f80915a.png': path.resolve(__dirname, './src/assets/fb623f6b059b888cf4155f7c95166d688f80915a.png'),
        'figma:asset/f554ef86411292e8560ed8724188cee18be01f76.png': path.resolve(__dirname, './src/assets/f554ef86411292e8560ed8724188cee18be01f76.png'),
        'figma:asset/dab8524954a5fe497d4d1edb8c7b2d895ef5ec5e.png': path.resolve(__dirname, './src/assets/dab8524954a5fe497d4d1edb8c7b2d895ef5ec5e.png'),
        'figma:asset/d7c829e6446a0d7cc043742324fd93fbd577c595.png': path.resolve(__dirname, './src/assets/d7c829e6446a0d7cc043742324fd93fbd577c595.png'),
        'figma:asset/d49350460393f2d896c13e87d9ce7a1de715d770.png': path.resolve(__dirname, './src/assets/d49350460393f2d896c13e87d9ce7a1de715d770.png'),
        'figma:asset/c1f7e99461eab8ee8f09fe6da69846f88cafaf6e.png': path.resolve(__dirname, './src/assets/c1f7e99461eab8ee8f09fe6da69846f88cafaf6e.png'),
        'figma:asset/abcaab10079b498b22949a643f21a26dc39c5c51.png': path.resolve(__dirname, './src/assets/abcaab10079b498b22949a643f21a26dc39c5c51.png'),
        'figma:asset/a6488a415e70d0f5731f542991b72ec3a8cae0e8.png': path.resolve(__dirname, './src/assets/a6488a415e70d0f5731f542991b72ec3a8cae0e8.png'),
        'figma:asset/7d335d71137e03ee85d696f5e82186da4bb6c8df.png': path.resolve(__dirname, './src/assets/7d335d71137e03ee85d696f5e82186da4bb6c8df.png'),
        'figma:asset/6f153b9573f5f80d955e408cf347b79f8e2e607f.png': path.resolve(__dirname, './src/assets/6f153b9573f5f80d955e408cf347b79f8e2e607f.png'),
        'figma:asset/532e1c6a1cfcaaa912587bdce67034f3654b4de2.png': path.resolve(__dirname, './src/assets/532e1c6a1cfcaaa912587bdce67034f3654b4de2.png'),
        'figma:asset/4fe3b3a6749c5e0517df48685236b67bca69b9b5.png': path.resolve(__dirname, './src/assets/4fe3b3a6749c5e0517df48685236b67bca69b9b5.png'),
        'figma:asset/4938db95a51ca2e4b9bc652ba753e4b7f2dab352.png': path.resolve(__dirname, './src/assets/4938db95a51ca2e4b9bc652ba753e4b7f2dab352.png'),
        'figma:asset/3692ab8bac828eea8f9c57d3164dc4f8120ab41b.png': path.resolve(__dirname, './src/assets/3692ab8bac828eea8f9c57d3164dc4f8120ab41b.png'),
        'figma:asset/360892e9378ede21394b51e62f6c410f09f4c0ec.png': path.resolve(__dirname, './src/assets/360892e9378ede21394b51e62f6c410f09f4c0ec.png'),
        'figma:asset/34cfac362a8aab00bb1d221e59d1682842e334b8.png': path.resolve(__dirname, './src/assets/34cfac362a8aab00bb1d221e59d1682842e334b8.png'),
        'figma:asset/3484287c39d20ad9e78c4e35767fbf8aafcd06b8.png': path.resolve(__dirname, './src/assets/3484287c39d20ad9e78c4e35767fbf8aafcd06b8.png'),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    base: './',
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
      // Run `npm run api` alongside `npm run dev` to test the forms locally
      proxy: {
        '/api': 'http://127.0.0.1:1804',
      },
    },
  });
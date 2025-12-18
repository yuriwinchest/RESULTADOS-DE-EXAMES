import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Prioritize VITE_EXAME_KEY then exame_key from any source (env files or system env)
      'process.env.exame_key': JSON.stringify(
        env.VITE_EXAME_KEY ||
        env.exame_key ||
        process.env.VITE_EXAME_KEY ||
        process.env.exame_key ||
        ""
      ),
    },
  };
});
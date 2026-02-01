import { defineConfig } from 'vitest/config'
import solidPlugin from 'vite-plugin-solid'
import { playwright } from '@vitest/browser-playwright'
import {preview} from "@vitest/browser-preview"

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(), 
      instances: [
        { browser: 'chromium' },
      ],
    }
  }
})
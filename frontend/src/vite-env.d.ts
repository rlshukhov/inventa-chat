/// <reference types="vite/client" />
export {}

declare global {
    interface Window {
        __t: (key: string) => string
        runtime?: {
            BrowserOpenURL: (url: string) => void
        }
    }
}
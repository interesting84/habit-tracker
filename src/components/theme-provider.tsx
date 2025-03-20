"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define attribute types from next-themes
type ValueObject = Record<string, string>
type ThemeColor = string | ValueObject

type Attribute = 'class' | 'data-theme' | 'data-mode'

// Define our own ThemeProviderProps type
interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: Attribute | Attribute[]
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
  themes?: string[]
  forcedTheme?: string
  onValueChange?: (value: string) => void
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
} 
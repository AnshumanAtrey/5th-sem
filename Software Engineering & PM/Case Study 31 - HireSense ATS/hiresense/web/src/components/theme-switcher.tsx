"use client"

import { useSyncExternalStore } from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
]

// The stored theme is only known in the browser; render no selection on the server to avoid a mismatch.
const useMounted = () => useSyncExternalStore(() => () => {}, () => true, () => false)

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  return (
    <div className="space-y-1.5 px-2">
      <div className="text-xs font-medium text-sidebar-foreground/70">Theme</div>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={0}
        value={mounted ? theme : undefined}
        onValueChange={(v) => v && setTheme(v)}
        className="w-full"
        aria-label="Theme"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <ToggleGroupItem key={value} value={value} aria-label={label} className="flex-1 gap-1 text-xs">
            <Icon /> {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

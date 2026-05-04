import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Before the viewport is measured, `!!undefined` was false — phones were treated as
  // desktop for one paint, breaking the shadcn sidebar (`peer` + `hidden md:*`) layout.
  // Mobile-first until we know the width avoids a broken shell on login / OAuth return.
  if (isMobile === undefined) return true
  return isMobile
}

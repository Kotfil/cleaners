import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Инициализируем с false для предотвращения гидрационных ошибок
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    // Устанавливаем флаг гидрации
    setIsHydrated(true)
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Устанавливаем начальное значение
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Возвращаем false до гидрации для консистентности
  return isHydrated ? isMobile : false
}

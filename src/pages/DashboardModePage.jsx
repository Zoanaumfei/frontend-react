import { useEffect, useRef, useState } from 'react'
import InitiativesHubPage from './InitiativesHubPage'
import MonthlyBirthdaysPage from './MonthlyBirthdaysPage'
import ProjectDashboardPage from './ProjectDashboardPage'
import { clearBirthdaysCache } from '../services/birthdayService'
import { clearBirthdayPhotoCache } from '../services/birthdayPhotoCache'
import { clearInitiativesCache } from '../services/initiativeService'
import { clearProjectDashboardCache } from '../services/projectDashboardCache'

const MIN_SCROLL_VIEWPORT = 320
const SCROLL_VIEWPORT_PADDING = 0
const TOTAL_PAGE_TIME_MS = 20000
const PAGE_ADVANCE_DELAY_MS = 300
const SCROLL_START_DELAY_MS = 2000
const SCROLL_END_DELAY_MS = 1000
const MIN_SCROLL_SPEED_PX_PER_SECOND = 10
const MAX_SCROLL_SPEED_PX_PER_SECOND = 120
const BIRTHDAYS_CACHE_TTL_MS = 60 * 60 * 1000
const INITIATIVES_CACHE_TTL_MS = 60 * 60 * 1000
const VIEWS = [
  {
    id: 'birthdays',
    label: 'Monthly Birthdays',
    Component: MonthlyBirthdaysPage,
    props: { useCache: true, cacheTtlMs: BIRTHDAYS_CACHE_TTL_MS, autoRefresh: false },
  },
  {
    id: 'project-dashboard',
    label: 'Project Dashboard',
    Component: ProjectDashboardPage,
    props: { useCache: true },
  },
  {
    id: 'initiatives',
    label: 'Initiatives Hub',
    Component: InitiativesHubPage,
    props: { useCache: true, cacheTtlMs: INITIATIVES_CACHE_TTL_MS, autoRefresh: false },
  },
]

function DashboardModePage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showOverlay, setShowOverlay] = useState(true)
  const [autoScrollActive, setAutoScrollActive] = useState(false)
  const [scrollViewportHeight, setScrollViewportHeight] = useState(null)
  const [contentVersion, setContentVersion] = useState(0)
  const scrollContainerRef = useRef(null)
  const scrollContentRef = useRef(null)
  const advancingRef = useRef(false)
  const scrollPositionRef = useRef(0)

  useEffect(
    () => () => {
      clearBirthdaysCache()
      clearBirthdayPhotoCache()
      clearInitiativesCache()
      clearProjectDashboardCache()
    },
    [],
  )

  const activeView = VIEWS[activeIndex]
  const ActiveComponent = activeView.Component
  const activeProps = activeView.props || {}

  useEffect(() => {
    if (!autoScrollActive) return

    const container = scrollContainerRef.current
    if (!container) return

    container.scrollTop = 0
    scrollPositionRef.current = 0
    advancingRef.current = false
    let animationId
    let lastTime = 0
    let advanceTimeoutId
    let holdTimeoutId
    const availableScrollTimeMs = Math.max(
      0,
      TOTAL_PAGE_TIME_MS -
        SCROLL_START_DELAY_MS -
        SCROLL_END_DELAY_MS -
        PAGE_ADVANCE_DELAY_MS,
    )

    const advanceToNext = () => {
      if (advancingRef.current) return
      advancingRef.current = true
      advanceTimeoutId = setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % VIEWS.length)
      }, PAGE_ADVANCE_DELAY_MS + SCROLL_END_DELAY_MS)
    }

    const startScrollOrWait = () => {
      const maxScrollTop = container.scrollHeight - container.clientHeight

      if (maxScrollTop <= 0) {
        holdTimeoutId = setTimeout(() => {
          advanceToNext()
        }, availableScrollTimeMs)
        return
      }

      const targetSpeed =
        availableScrollTimeMs > 0
          ? maxScrollTop / (availableScrollTimeMs / 1000)
          : MAX_SCROLL_SPEED_PX_PER_SECOND
      const scrollSpeed = Math.min(
        MAX_SCROLL_SPEED_PX_PER_SECOND,
        Math.max(MIN_SCROLL_SPEED_PX_PER_SECOND, targetSpeed),
      )
      const expectedScrollDurationMs = (maxScrollTop / scrollSpeed) * 1000
      const extraHoldMs = Math.max(
        0,
        availableScrollTimeMs - expectedScrollDurationMs,
      )

      const scroll = time => {
        if (!lastTime) lastTime = time
        const deltaSeconds = (time - lastTime) / 1000
        lastTime = time

        scrollPositionRef.current += scrollSpeed * deltaSeconds
        if (scrollPositionRef.current >= maxScrollTop - 1) {
          container.scrollTop = maxScrollTop
          if (extraHoldMs > 0) {
            holdTimeoutId = setTimeout(() => {
              advanceToNext()
            }, extraHoldMs)
          } else {
            advanceToNext()
          }
          return
        }

        container.scrollTop = scrollPositionRef.current
        animationId = requestAnimationFrame(scroll)
      }

      animationId = requestAnimationFrame(scroll)
    }

    const startTimeoutId = setTimeout(() => {
      startScrollOrWait()
    }, SCROLL_START_DELAY_MS)

    return () => {
      cancelAnimationFrame(animationId)
      if (advanceTimeoutId) clearTimeout(advanceTimeoutId)
      if (startTimeoutId) clearTimeout(startTimeoutId)
      if (holdTimeoutId) clearTimeout(holdTimeoutId)
    }
  }, [activeIndex, autoScrollActive, contentVersion])

  useEffect(() => {
    if (!autoScrollActive) return

    const target = scrollContentRef.current
    if (!target || typeof ResizeObserver === 'undefined') return

    let rafId
    const observer = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setContentVersion(prev => prev + 1)
      })
    })

    observer.observe(target)

    return () => {
      observer.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [activeIndex, autoScrollActive])

  useEffect(() => {
    if (!autoScrollActive) return

    const container = scrollContainerRef.current
    if (!container) return

    const updateHeight = () => {
      const top = container.getBoundingClientRect().top
      const availableHeight = Math.max(
        MIN_SCROLL_VIEWPORT,
        window.innerHeight - top - SCROLL_VIEWPORT_PADDING
      )
      setScrollViewportHeight(availableHeight)
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [activeIndex, autoScrollActive])

  const handleEnterFullscreen = async () => {
    const target = document.documentElement
    if (document.fullscreenElement || !target?.requestFullscreen) {
      setShowOverlay(false)
      setAutoScrollActive(true)
      return
    }

    try {
      await target.requestFullscreen()
    } catch {
      // Ignore fullscreen API failures and continue in embedded mode.
    } finally {
      setShowOverlay(false)
      setAutoScrollActive(true)
    }
  }

  return (
    <section
      className="dashboard-mode"
      aria-live="polite"
      aria-label={`Dashboard mode: ${activeView.label}`}
    >
      {showOverlay && (
        <button
          type="button"
          className="dashboard-mode__overlay"
          onClick={handleEnterFullscreen}
        >
          <span>
            Clique para entrar em tela cheia
          </span>
        </button>
      )}
      <div
        className="dashboard-mode__view"
        key={activeView.id}
        ref={scrollContainerRef}
        style={scrollViewportHeight ? { height: `${scrollViewportHeight}px` } : undefined}
      >
        <div ref={scrollContentRef}>
          <ActiveComponent {...activeProps} />
        </div>
      </div>
    </section>
  )
}

export default DashboardModePage

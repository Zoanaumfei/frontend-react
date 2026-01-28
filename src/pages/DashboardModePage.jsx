import { useEffect, useRef, useState } from 'react'
import InitiativesHubPage from './InitiativesHubPage'
import MonthlyBirthdaysPage from './MonthlyBirthdaysPage'
import ProjectMilestonesPage from './ProjectMilestonesPage'

const SCROLL_SPEED_PX_PER_SECOND = 18
const MIN_SCROLL_VIEWPORT = 320
const SCROLL_VIEWPORT_PADDING = 0
const PAGE_ADVANCE_DELAY_MS = 300
const VIEWS = [
  {
    id: 'initiatives',
    label: 'Initiatives Hub',
    Component: InitiativesHubPage,
  },
  {
    id: 'birthdays',
    label: 'Monthly Birthdays',
    Component: MonthlyBirthdaysPage,
  },
  {
    id: 'milestones',
    label: 'Project Milestones',
    Component: ProjectMilestonesPage,
  },
]

function DashboardModePage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [showOverlay, setShowOverlay] = useState(true)
  const [autoScrollActive, setAutoScrollActive] = useState(false)
  const [scrollViewportHeight, setScrollViewportHeight] = useState(null)
  const scrollContainerRef = useRef(null)
  const advancingRef = useRef(false)
  const scrollPositionRef = useRef(0)

  const activeView = VIEWS[activeIndex]
  const ActiveComponent = activeView.Component

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

    const advanceToNext = () => {
      if (advancingRef.current) return
      advancingRef.current = true
      advanceTimeoutId = setTimeout(() => {
        setActiveIndex(prev => (prev + 1) % VIEWS.length)
      }, PAGE_ADVANCE_DELAY_MS)
    }

    const scroll = time => {
      if (!lastTime) lastTime = time
      const deltaSeconds = (time - lastTime) / 1000
      lastTime = time

      const maxScrollTop = container.scrollHeight - container.clientHeight
      if (maxScrollTop <= 0) {
        advanceToNext()
        return
      }

      scrollPositionRef.current += SCROLL_SPEED_PX_PER_SECOND * deltaSeconds
      if (scrollPositionRef.current >= maxScrollTop - 1) {
        container.scrollTop = maxScrollTop
        advanceToNext()
        return
      }

      container.scrollTop = scrollPositionRef.current
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationId)
      if (advanceTimeoutId) clearTimeout(advanceTimeoutId)
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
    } catch (error) {
      console.error('Fullscreen request failed:', error)
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
        <ActiveComponent />
      </div>
    </section>
  )
}

export default DashboardModePage

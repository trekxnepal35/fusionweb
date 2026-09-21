"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const defaultSections = [
  {
    id: "overview",
    label: "Overview",
    icon: "📖",
  },
  {
    id: "highlight",
    label: "Highlight",
    icon: "⭐",
  },
  {
    id: "itinerary",
    label: "Itinerary",
    icon: "🗓️",
  },
  {
    id: "trek-information",
    label: "Trek Information",
    icon: "ℹ️",
  },
  {
    id: "included",
    label: "What's Included",
    icon: "✓",
  },
  {
    id: "excluded",
    label: "What's Not Included",
    icon: "×",
  },
  {
    id: "important-information",
    label: "Important Information",
    icon: "⚠️",
  },
  {
    id: "map-faq",
    label: "Map & FAQ",
    icon: "❓",
  },
  {
    id: "reviews",
    label: "Review",
    icon: "💬",
  },
];

export default function SectionNavigation({
  sections = defaultSections,
}) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const animationRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const positionRef = useRef(0);
  const lastTimeRef = useRef(null);
  const loopWidthRef = useRef(0);

  const [activeSection, setActiveSection] =
    useState(
      sections[0]?.id || "overview"
    );

  /*
  =========================================
  ACTIVE SECTION
  =========================================
  */

  /*
=========================================
ACTIVE SECTION
=========================================
*/

useEffect(() => {

  function updateActiveSection() {

    const scrollPosition =
      window.scrollY + 180;

    let currentSection =
      sections[0]?.id;

    for (const section of sections) {

      const element =
        document.getElementById(
          section.id
        );

      if (!element) {
        continue;
      }

      if (
        element.offsetTop <=
        scrollPosition
      ) {
        currentSection =
          section.id;
      }
    }

    setActiveSection(
      currentSection
    );
  }

  updateActiveSection();

  window.addEventListener(
    "scroll",
    updateActiveSection
  );

  return () => {

    window.removeEventListener(
      "scroll",
      updateActiveSection
    );

  };

}, [sections]);

  /*
  =========================================
  CALCULATE LOOP WIDTH
  =========================================
  */

  function calculateLoopWidth() {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    /*
    ========================================
    The track contains two identical
    copies of the menu.
    ========================================
    */

    /*
    ========================================
    Therefore half of the total
    track width = one complete menu.
    ========================================
    */

    loopWidthRef.current =
      track.scrollWidth / 2;
  }

  /*
  =========================================
  STOP AUTO PLAY
  =========================================
  */

  function stopAutoPlay() {
    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    lastTimeRef.current = null;
  }

  /*
  =========================================
  CONTINUOUS AUTO PLAY
  =========================================
  */

  function startAutoPlay() {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    calculateLoopWidth();

    if (loopWidthRef.current <= 0) {
      return;
    }

    stopAutoPlay();

    let lastTime =
      performance.now();

    lastTimeRef.current =
      lastTime;

    /*
    ========================================
    SPEED

    25 = slow
    35 = normal
    50 = faster
    ========================================
    */

    const speed = 30;

    function animate(currentTime) {
      const element =
        trackRef.current;

      if (!element) {
        return;
      }

      const delta =
        currentTime - lastTime;

      lastTime = currentTime;

      /*
      ========================================
      Move continuously RIGHT → LEFT.
      ========================================
      */

      positionRef.current -=
        (speed * delta) / 1000;

      /*
      ========================================
      When one complete menu has
      moved away, immediately reset
      by exactly one menu width.

      Because the second menu is
      identical, this is invisible.
      ========================================
      */

      if (
        Math.abs(
          positionRef.current
        ) >= loopWidthRef.current
      ) {
        positionRef.current +=
          loopWidthRef.current;
      }

      element.style.transform =
        `translate3d(${positionRef.current}px, 0, 0)`;

      animationRef.current =
        requestAnimationFrame(
          animate
        );
    }

    animationRef.current =
      requestAnimationFrame(
        animate
      );
  }

  /*
  =========================================
  PAUSE THEN CONTINUE
  =========================================
  */

  function pauseAndResume() {
    stopAutoPlay();

    if (resumeTimerRef.current) {
      clearTimeout(
        resumeTimerRef.current
      );
    }

    resumeTimerRef.current =
      setTimeout(() => {
        startAutoPlay();
      }, 2000);
  }

  /*
  =========================================
  CLICK MENU
  =========================================
  */

  function handleSectionClick(id) {
    const element =
      document.getElementById(id);

    if (!element) {
      return;
    }

    pauseAndResume();

    const offset = 140;

    const top =
      element.getBoundingClientRect()
        .top +
      window.scrollY -
      offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  }

  /*
  =========================================
  START AUTO PLAY
  =========================================
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateLoopWidth();
      startAutoPlay();
    }, 500);

    return () => {
      clearTimeout(timer);

      stopAutoPlay();

      if (resumeTimerRef.current) {
        clearTimeout(
          resumeTimerRef.current
        );
      }
    };
  }, [sections]);

  /*
  =========================================
  RESIZE
  =========================================
  */

  useEffect(() => {
    function handleResize() {
      calculateLoopWidth();

      /*
      ======================================
      Keep the current animation position.
      ======================================
      */

      if (
        loopWidthRef.current > 0 &&
        Math.abs(
          positionRef.current
        ) >= loopWidthRef.current
      ) {
        positionRef.current = 0;
      }
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  /*
  =========================================
  DUPLICATE MENU
  =========================================
  */

  const menuItems = [
    ...sections,
    ...sections,
  ];

  /*
  =========================================
  Expand/Collapse Toggle Section
  =========================================
  */

  function toggleSection(id) {
    const section =
      document.getElementById(id);

    if (!section) {
      return;
    }

    const content =
      section.querySelector(
        "[data-section-content]"
      );

    if (!content) {
      return;
    }

    const isCollapsed =
      content.dataset.collapsed === "true";

    if (isCollapsed) {
      content.dataset.collapsed = "false";

      content.style.maxHeight =
        content.scrollHeight + "px";

      content.style.opacity = "1";

      content.style.overflow = "hidden";

      setTimeout(() => {
        if (
          content.dataset.collapsed ===
          "false"
        ) {
          content.style.maxHeight =
            "none";
        }
      }, 400);
    } else {
      content.style.maxHeight =
        content.scrollHeight + "px";

      content.offsetHeight;

      content.dataset.collapsed = "true";

      content.style.maxHeight = "0px";

      content.style.opacity = "0";

      content.style.overflow = "hidden";
    }
  }

  /*
  =========================================
  RENDER
  =========================================
  */

  return (
    <nav
      className="
        sticky
        top-20
        z-40
        mt-0
        w-full
        overflow-hidden
        border-y
        border-gray-200
        bg-white/95
        shadow-sm
        backdrop-blur-md
      "
    >
      <div
        ref={viewportRef}
        onWheel={pauseAndResume}
        onTouchStart={pauseAndResume}
        onMouseDown={pauseAndResume}
        className="
          mx-auto
          w-full
          max-w-7xl
          overflow-hidden
          px-4
          py-3
          sm:px-6
          lg:px-8
        "
      >
        <div
          ref={trackRef}
          className="
            flex
            w-max
            gap-2
            will-change-transform
          "
        >
          {menuItems.map(
            (section, index) => {
              const isActive =
                activeSection ===
                section.id;

              return (
                <div
                  key={`${section.id}-${index}`}
                  className={`
                    flex
                    shrink-0
                    items-center
                    overflow-hidden
                    rounded-lg
                    ${
                      isActive
                        ? "bg-gray-900 text-white shadow-md"
                        : "bg-gray-50 text-gray-700"
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleSectionClick(
                        section.id
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      whitespace-nowrap
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                    "
                  >
                    <span>
                      {section.icon}
                    </span>

                    <span>
                      {section.label}
                    </span>
                  </button>

                 
                </div>
              );
            }
          )}
        </div>
      </div>
    </nav>
  );
}
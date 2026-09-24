"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function ImageGallery({
  images = [],
  fallbackImage = "",
  fallbackAlt = "",
}) {
  /*
  =========================================
  NORMALIZE IMAGES
  =========================================
  */

  const normalizedImages = Array.isArray(images)
    ? images
        .map((image) => ({
          url:
            typeof image === "string"
              ? image
              : image?.url || "",
          alt:
            typeof image === "string"
              ? fallbackAlt
              : image?.alt || fallbackAlt,
        }))
        .filter((image) => image.url)
    : [];

  /*
  =========================================
  FALLBACK IMAGE
  =========================================
  */

  if (
    normalizedImages.length === 0 &&
    fallbackImage
  ) {
    normalizedImages.push({
      url: fallbackImage,
      alt: fallbackAlt,
    });
  }

  /*
  =========================================
  REFS
  =========================================
  */

  const galleryRef = useRef(null);
  const transitionTimer = useRef(null);

  /*
  =========================================
  STATE
  =========================================
  */

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [isPaused, setIsPaused] =
    useState(false);

  const [isTransitioning, setIsTransitioning] =
    useState(false);

  /*
   * false = normal 750px
   * true  = expanded 900px
   */
  const [isExpanded, setIsExpanded] =
    useState(false);

  /*
  =========================================
  CHANGE IMAGE
  =========================================
  */

  function changeImage(index, source) {
    if (
      normalizedImages.length <= 1
    ) {
      return;
    }

    /*
    -----------------------------------------
    CLEAR PREVIOUS TIMER
    -----------------------------------------
    */

    if (transitionTimer.current) {
      clearTimeout(
        transitionTimer.current
      );
    }

    /*
    =========================================
    THUMBNAIL / NEXT / PREVIOUS
    =========================================

    Manual navigation:

    - expand
    - autoplay continues
    =========================================
    */

    if (
      source === "thumbnail" ||
      source === "next" ||
      source === "previous"
    ) {
      setIsExpanded(true);
      setIsPaused(false);
      setIsTransitioning(true);

      transitionTimer.current =
        setTimeout(() => {
          setCurrentIndex(index);

          transitionTimer.current =
            setTimeout(() => {
              setIsTransitioning(false);
            }, 500);
        }, 400);

      return;
    }

    /*
    =========================================
    AUTOPLAY
    =========================================

    Autoplay keeps whatever height state
    is currently active.
    =========================================
    */

    if (source === "autoplay") {
      setIsTransitioning(true);

      transitionTimer.current =
        setTimeout(() => {
          setCurrentIndex(index);

          transitionTimer.current =
            setTimeout(() => {
              setIsTransitioning(false);
            }, 500);
        }, 400);
    }
  }

  /*
  =========================================
  AUTOPLAY
  =========================================
  */

  useEffect(() => {
    if (
      normalizedImages.length <= 1 ||
      isPaused
    ) {
      return;
    }

    const interval = setInterval(() => {
      const nextIndex =
        currentIndex ===
        normalizedImages.length - 1
          ? 0
          : currentIndex + 1;

      changeImage(
        nextIndex,
        "autoplay"
      );
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [
    currentIndex,
    normalizedImages.length,
    isPaused,
  ]);

  /*
  =========================================
  MAIN IMAGE CLICK
  =========================================

  Click 1:
      750px → 900px
      autoplay continues

  Click 2:
      900px → 750px
      autoplay continues
  =========================================
  */

  function handleMainImageClick() {
    setIsExpanded(
      (expanded) => !expanded
    );

    setIsPaused(false);
  }

  /*
  =========================================
  NEXT
  =========================================
  */

  function showNext() {
    const nextIndex =
      currentIndex ===
      normalizedImages.length - 1
        ? 0
        : currentIndex + 1;

    changeImage(
      nextIndex,
      "next"
    );
  }

  /*
  =========================================
  PREVIOUS
  =========================================
  */

  function showPrevious() {
    const previousIndex =
      currentIndex === 0
        ? normalizedImages.length - 1
        : currentIndex - 1;

    changeImage(
      previousIndex,
      "previous"
    );
  }

  /*
  =========================================
  THUMBNAIL
  =========================================
  */

  function selectImage(index) {
    /*
     * Clicking current thumbnail:
     * expand but don't change image.
     */
    if (index === currentIndex) {
      setIsExpanded(true);
      setIsPaused(false);
      return;
    }

    changeImage(
      index,
      "thumbnail"
    );
  }

  /*
  =========================================
  CLICK OUTSIDE
  =========================================

  Expanded → normal
  Autoplay continues.
  =========================================
  */

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!isExpanded) {
        return;
      }

      if (
        galleryRef.current &&
        galleryRef.current.contains(
          event.target
        )
      ) {
        return;
      }

      setIsExpanded(false);
      setIsPaused(false);
      setIsTransitioning(false);

      if (transitionTimer.current) {
        clearTimeout(
          transitionTimer.current
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [isExpanded]);

  /*
  =========================================
  RESET INDEX
  =========================================
  */

  useEffect(() => {
    if (
      currentIndex >=
      normalizedImages.length
    ) {
      setCurrentIndex(0);
    }
  }, [
    currentIndex,
    normalizedImages.length,
  ]);

  /*
  =========================================
  CLEANUP
  =========================================
  */

  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        clearTimeout(
          transitionTimer.current
        );
      }
    };
  }, []);

  /*
  =========================================
  NO IMAGE
  =========================================
  */

  if (normalizedImages.length === 0) {
    return (
      <div className="h-[410px] bg-gray-800" />
    );
  }

  const currentImage =
    normalizedImages[currentIndex];

  /*
  =========================================
  GALLERY
  =========================================
  */

  return (
    <div
      ref={galleryRef}
      className={`
        relative
        w-full
        overflow-hidden
        bg-gray-900
        transition-[height]
        duration-700
        ease-in-out
        ${
          isExpanded
            ? "h-[750px]"
            : "h-[410px]"
        }
      `}
    >
      {/* =====================================
          IMAGE CONTAINER
          ===================================== */}

      <div
        onClick={handleMainImageClick}
        className={`
          absolute
          inset-0
          z-10
          flex
          cursor-pointer
          items-center
          justify-center
          overflow-hidden
          transition-colors
          duration-700
          ${
            isExpanded
              ? "bg-black"
              : "bg-gray-900"
          }
        `}
      >
        <img
          src={currentImage.url}
          alt={
            currentImage.alt ||
            fallbackAlt ||
            "Gallery image"
          }
          className={`
            transition-all
            duration-700
            ease-in-out

            ${
              isExpanded
                ? `
                  max-h-full
                  max-w-full
                  h-auto
                  w-auto
                  object-contain
                `
                : `
                  h-full
                  w-full
                  object-cover
                `
            }

            ${
              isTransitioning
                ? "scale-[1.02] opacity-0"
                : "scale-100 opacity-70"
            }
          `}
        />
      </div>

      {/* =====================================
          DARK OVERLAY
          =====================================

          Only use a lighter overlay when the
          image is in its normal state.

          Expanded mode shows the image more
          naturally.
          ===================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          inset-0
          z-10
          transition-colors
          duration-700
          ${
            isExpanded
              ? "bg-black/10"
              : "bg-black/40"
          }
        `}
      />

      {/* =====================================
          PREVIOUS
          ===================================== */}

      {normalizedImages.length > 1 && (
        <button
          type="button"
          onClick={showPrevious}
          aria-label="Previous image"
          className="
            absolute
            left-4
            top-1/2
            z-30
            flex
            h-12
            w-12
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-black/50
            text-3xl
            text-white
            backdrop-blur
            transition
            duration-300
            hover:bg-black/70
          "
        >
          ‹
        </button>
      )}

      {/* =====================================
          NEXT
          ===================================== */}

      {normalizedImages.length > 1 && (
        <button
          type="button"
          onClick={showNext}
          aria-label="Next image"
          className="
            absolute
            right-4
            top-1/2
            z-30
            flex
            h-12
            w-12
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-black/50
            text-3xl
            text-white
            backdrop-blur
            transition
            duration-300
            hover:bg-black/70
          "
        >
          ›
        </button>
      )}

      {/* =====================================
          COUNTER
          ===================================== */}

      {normalizedImages.length > 1 && (
        <div
          className="
            absolute
            right-5
            top-5
            z-30
            rounded-full
            bg-black/60
            px-4
            py-2
            text-sm
            font-medium
            text-white
            backdrop-blur
          "
        >
          {currentIndex + 1} /{" "}
          {normalizedImages.length}
        </div>
      )}

      {/* =====================================
          AUTOPLAY STATUS
          ===================================== */}

      {normalizedImages.length > 1 && (
        <div
          className="
            absolute
            left-5
            top-5
            z-30
            rounded-full
            bg-black/50
            px-3
            py-2
            text-xs
            text-white
            backdrop-blur
          "
        >
          {isPaused
            ? "Slideshow paused"
            : isExpanded
            ? "Slideshow playing • Actual image"
            : "Slideshow playing"}
        </div>
      )}

      {/* =====================================
          THUMBNAILS
          ===================================== */}

      {normalizedImages.length > 1 && (
        <div
          className="
            absolute
            bottom-5
            left-1/2
            z-30
            flex
            max-w-[90%]
            -translate-x-1/2
            gap-2
            overflow-x-auto
            rounded-xl
            bg-black/40
            p-2
            backdrop-blur
          "
        >
          {normalizedImages.map(
            (image, index) => (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() =>
                  selectImage(index)
                }
                aria-label={`View image ${
                  index + 1
                }`}
                className={`
                  h-14
                  w-20
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  border-2
                  transition-all
                  duration-500
                  ${
                    index === currentIndex
                      ? "scale-105 border-white"
                      : "border-transparent opacity-70 hover:scale-105 hover:opacity-100"
                  }
                `}
              >
                <img
                  src={image.url}
                  alt={
                    image.alt ||
                    `Thumbnail ${index + 1}`
                  }
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

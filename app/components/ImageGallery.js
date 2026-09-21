
"use client";

import {
  useEffect,
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
  FALLBACK FOR OLD IMAGE DATA
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
  CURRENT IMAGE
  =========================================
  */

  const [currentIndex, setCurrentIndex] =
    useState(0);

  /*
  =========================================
  AUTOPLAY STATUS
  =========================================
  */

  const [isPaused, setIsPaused] =
    useState(false);

  /*
  =========================================
  IMAGE TRANSITION
  =========================================
  */

  const [isTransitioning, setIsTransitioning] =
    useState(false);

  /*
  =========================================
  AUTOPLAY
  =========================================

  Changes image every 4 seconds.

  The image transition is intentionally
  slower and smoother.
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
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentIndex((current) =>
          current ===
          normalizedImages.length - 1
            ? 0
            : current + 1
        );

        setIsTransitioning(false);
      }, 700);
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [
    normalizedImages.length,
    isPaused,
  ]);

  /*
  =========================================
  RESET INDEX IF IMAGE LIST CHANGES
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
  NO IMAGE
  =========================================
  */

  if (normalizedImages.length === 0) {
    return (
      <div className="h-[420px] bg-gray-800" />
    );
  }

  /*
  =========================================
  PREVIOUS IMAGE
  =========================================
  */

  function showPrevious() {
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentIndex((current) =>
        current === 0
          ? normalizedImages.length - 1
          : current - 1
      );

      setIsTransitioning(false);
    }, 400);
  }

  /*
  =========================================
  NEXT IMAGE
  =========================================
  */

  function showNext() {
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentIndex((current) =>
        current === normalizedImages.length - 1
          ? 0
          : current + 1
      );

      setIsTransitioning(false);
    }, 400);
  }

  /*
  =========================================
  SELECT IMAGE
  =========================================
  */

  function selectImage(index) {
    if (index === currentIndex) {
      return;
    }

    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 500);
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
      className="relative h-[420px] w-full overflow-hidden bg-gray-900"
      onMouseEnter={() =>
        setIsPaused(true)
      }
      onMouseLeave={() =>
        setIsPaused(false)
      }
      onFocus={() =>
        setIsPaused(true)
      }
      onBlur={() =>
        setIsPaused(false)
      }
    >
      {/* =====================================
          MAIN IMAGE
      ===================================== */}

      <img
        src={currentImage.url}
        alt={
          currentImage.alt ||
          fallbackAlt ||
          "Gallery image"
        }
        className={`h-full w-full object-cover opacity-70 transition-all duration-[1400ms] ease-in-out ${
          isTransitioning
            ? "scale-[1.02] opacity-0"
            : "scale-100 opacity-70"
        }`}
      />

      {/* =====================================
          DARK OVERLAY
      ===================================== */}

      <div className="absolute inset-0 bg-black/40" />

      {/* =====================================
          PREVIOUS BUTTON
      ===================================== */}

      {normalizedImages.length > 1 && (
        <button
          type="button"
          onClick={showPrevious}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-3xl text-white backdrop-blur transition duration-300 hover:bg-black/70"
        >
          ‹
        </button>
      )}

      {/* =====================================
          NEXT BUTTON
      ===================================== */}

      {normalizedImages.length > 1 && (
        <button
          type="button"
          onClick={showNext}
          aria-label="Next image"
          className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-3xl text-white backdrop-blur transition duration-300 hover:bg-black/70"
        >
          ›
        </button>
      )}

      {/* =====================================
          IMAGE COUNTER
      ===================================== */}

      {normalizedImages.length > 1 && (
        <div className="absolute right-5 top-5 z-20 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur">
          {currentIndex + 1} /{" "}
          {normalizedImages.length}
        </div>
      )}

      {/* =====================================
          AUTOPLAY INDICATOR
      ===================================== */}

      {normalizedImages.length > 1 && (
        <div className="absolute left-5 top-5 z-20 rounded-full bg-black/50 px-3 py-2 text-xs text-white backdrop-blur">
          {isPaused
            ? "Slideshow paused"
            : "Slideshow"}
        </div>
      )}

      {/* =====================================
          THUMBNAILS
      ===================================== */}

      {normalizedImages.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex max-w-[90%] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl bg-black/40 p-2 backdrop-blur">

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
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-500 ${
                  index === currentIndex
                    ? "scale-105 border-white"
                    : "border-transparent opacity-70 hover:scale-105 hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt={
                    image.alt ||
                    `Thumbnail ${index + 1}`
                  }
                  className="h-full w-full object-cover transition-transform duration-700"
                />
              </button>
            )
          )}

        </div>
      )}
    </div>
  );
}


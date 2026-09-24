function getYoutubeVideoId(url) {
    if (!url) return null;
  
    try {
      const parsedUrl = new URL(url);
  
      // youtube.com/watch?v=VIDEO_ID
      if (
        parsedUrl.hostname.includes("youtube.com") &&
        parsedUrl.searchParams.get("v")
      ) {
        return parsedUrl.searchParams.get("v");
      }
  
      // youtu.be/VIDEO_ID
      if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.slice(1);
      }
  
      // youtube.com/embed/VIDEO_ID
      if (
        parsedUrl.hostname.includes("youtube.com") &&
        parsedUrl.pathname.startsWith("/embed/")
      ) {
        return parsedUrl.pathname.split("/embed/")[1];
      }
  
      return null;
    } catch {
      return null;
    }
  }
  
  
  export default function YouTubeVideos({
    videos = [],
  }) {
    const validVideos = videos.filter(
      (video) =>
        video &&
        video.url &&
        getYoutubeVideoId(video.url)
    );
  
    if (validVideos.length === 0) {
      return null;
    }
  
    return (
      <section className="mt-12">
  
        <div className="mb-6">
  
          <h2 className="text-2xl font-bold text-gray-900">
            Videos
          </h2>
  
          <p className="mt-2 text-gray-600">
            Watch videos about this experience.
          </p>
  
        </div>
  
  
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  
          {validVideos.map((video, index) => {
  
            const videoId =
              getYoutubeVideoId(video.url);
  
            return (
              <div
                key={`${videoId}-${index}`}
                className="overflow-hidden rounded-xl bg-white shadow-md"
              >
  
                <div className="aspect-video w-full">
  
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    title={video.title || "YouTube video"}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
  
                </div>
  
  
                {video.title && (
                  <div className="p-4">
  
                    <h3 className="text-lg font-semibold text-gray-900">
                      {video.title}
                    </h3>
  
                  </div>
                )}
  
              </div>
            );
          })}
  
        </div>
  
      </section>
    );
  }
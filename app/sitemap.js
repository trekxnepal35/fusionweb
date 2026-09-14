import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import Region from "@/models/Region";

export default async function sitemap() {
  await connectDB();

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  /*
  ========================================
  STATIC PAGES
  ========================================
  */

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/treks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  /*
  ========================================
  PUBLISHED GENERAL + TREK PAGES
  ========================================
  */

  const pages = await Page.find({
    published: true,
  })
    .select("slug updatedAt pageType seo")
    .lean();

  const dynamicPages = pages
    .filter((page) => !page.seo?.noIndex)
    .map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: page.pageType === "trek" ? 0.8 : 0.6,
    }));

  /*
  ========================================
  PUBLISHED REGIONS
  ========================================
  */

  const regions = await Region.find({
    published: true,
  })
    .select("slug updatedAt")
    .lean();

  const regionPages = regions.map((region) => ({
    url: `${baseUrl}/treks/${region.slug}`,
    lastModified: region.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  /*
  ========================================
  REMOVE DUPLICATE URLS
  ========================================
  */

  const allPages = [
    ...staticPages,
    ...regionPages,
    ...dynamicPages,
  ];

  const uniquePages = Array.from(
    new Map(
      allPages.map((page) => [page.url, page])
    ).values()
  );

  return uniquePages;
}
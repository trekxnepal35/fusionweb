import JsonLd from "./JsonLd";

export default function TrekJsonLd({
  trek,
  baseUrl,
}) {

  const details = trek.trekDetails || {};

  const trekUrl =
    `${baseUrl}/${trek.slug}`;


  const schema = {

    "@context": "https://schema.org",

    "@type": "Product",

    name: trek.title,

    description:
      trek.description || "",

    image:
      trek.imageUrl
        ? [trek.imageUrl]
        : [],

    url: trekUrl,


    brand: {
      "@type": "Organization",
      name: "Trek Nepal",
    },


    category:
      "Trekking in Nepal",


    additionalProperty: [

      {
        "@type": "PropertyValue",
        name: "Duration",
        value: details.duration || "",
      },

      {
        "@type": "PropertyValue",
        name: "Difficulty",
        value: details.difficulty || "",
      },

      {
        "@type": "PropertyValue",
        name: "Maximum Altitude",
        value: details.maxAltitude || "",
      },

      {
        "@type": "PropertyValue",
        name: "Best Season",
        value: details.bestSeason || "",
      },

      {
        "@type": "PropertyValue",
        name: "Accommodation",
        value: details.accommodation || "",
      },

      {
        "@type": "PropertyValue",
        name: "Meals",
        value: details.meals || "",
      },

      {
        "@type": "PropertyValue",
        name: "Group Size",
        value: details.groupSize || "",
      },

    ].filter(
      (item) => item.value
    ),


    ...(trek.region
      ? {
          areaServed: {
            "@type": "Place",
            name: trek.region.name,
          },
        }
      : {}),

  };
  return <JsonLd data={schema} />;
  }
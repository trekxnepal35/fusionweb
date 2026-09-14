
import JsonLd from './JsonLD';


export default function BreadcrumbJsonLd({
  items,
}) {

  const schema = {

    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    itemListElement:
      items.map((item, index) => ({

        "@type": "ListItem",

        position: index + 1,

        name: item.name,

        item: item.url,

      })),

  };


  return <JsonLd data={schema} />;
}
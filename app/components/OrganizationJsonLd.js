import JsonLd from "./JsonLD";


export default function OrganizationJsonLd({
  baseUrl,
}) {

  const schema = {

    "@context": "https://schema.org",

    "@type": "Organization",

    name: "Trek Nepal",

    url: baseUrl,

    logo:
      `${baseUrl}/logo.png`,

  };


  return <JsonLd data={schema} />;
}
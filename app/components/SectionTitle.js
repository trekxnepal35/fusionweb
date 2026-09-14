export default function SectionTitle({
    eyebrow,
    title,
    description,
    centered = true,
  }) {
    return (
      <div
        className={`mb-10 ${
          centered ? "mx-auto text-center" : ""
        } max-w-3xl`}
      >
        {eyebrow && (
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
            {eyebrow}
          </p>
        )}
  
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          {title}
        </h2>
  
        {description && (
          <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    );
  }
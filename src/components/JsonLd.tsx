interface JsonLdProps {
  data: object | object[]
}

/**
 * Renders one or more JSON-LD schema.org blobs as server-side `<script>` tags.
 * Array form emits a single `@graph` node to keep the DOM compact.
 */
export default function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data)
    ? { '@context': 'https://schema.org', '@graph': data }
    : data

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}

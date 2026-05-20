import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
  type?: string;
  price?: number;
}

const BASE_URL = "https://numarstore-v-final.vercel.app";

export default function SEO({ title, description, image, jsonLd, type = "website", price }: SEOProps) {
  const fullTitle = `${title} | Numar Store`;
  const fullImage = image ? (image.startsWith("http") ? image : `${BASE_URL}${image}`) : `${BASE_URL}/logo.png`;
  const url = typeof window !== "undefined" ? window.location.href : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Numar Store" />
      {price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content="BRL" />
        </>
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Helmet>
  );
}
// app/blog/[...slug]/page.tsx
import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "../../../components/builder";
import { notFound } from 'next/navigation';
import { cookies } from "next/headers";
import type { BuilderContent } from "@builder.io/react";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

interface BlogPostPageProps {
  params: {
    slug: string[];
  };
}

export async function generateStaticParams() {
  const allPosts = await builder.getAll('blog-article', {
    options: { noTargeting: true },
  });

  return allPosts.map(post => ({
    slug: post.data?.slug?.split('/') || [],
  }));
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "en-US";
  
  const content = await builder
    .get('blog-article', {
      options: {
        locale: locale,
        enrich: true
      },
      userAttributes: {
        urlPath: `/blog/${slug}`,
      },
    })
    .toPromise();

  return {
    title: content?.data?.title || 'Blog',
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const builderModelName = "blog-article";
  
  // Get locale from cookies or default to "en-US"
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "en-US";

  const slug = params.slug.join('/');
  
  // Instead of using URL targeting, fetch all articles and filter by name
  
  // Get all blog articles
  const allArticles = await builder
    .getAll(builderModelName, {
      options: {
        locale: locale,
        enrich: false
      },
      userAttributes: {},
      // Limit to a reasonable number to improve performance
      limit: 20
    });
  
  // Helper function to normalize strings for comparison
  const normalize = (str: string) => {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Normalize the URL slug for comparison
  const normalizedSlug = normalize(slug);
  
  // Filter to find the one matching our slug by name with more flexible matching
  const content = allArticles?.find((article: any) => {
    // Try to match by name (directly compare with slug) or by slug field if present
    const articleName = article.name;
    const articleSlug = article.data?.slug;
    
    // Normalize everything for comparison
    const normalizedName = normalize(articleName);
    const normalizedDataSlug = normalize(articleSlug || '');
    
    // Try multiple matching strategies
    return normalizedName === normalizedSlug || // Normalized name match
           normalizedDataSlug === normalizedSlug || // Normalized slug field match
           articleName === slug || // Exact name match
           articleSlug === slug || // Exact slug field match
           normalizedSlug.includes(normalizedName) || // Slug contains name
           normalizedName.includes(normalizedSlug); // Name contains slug
  }) || null;


  if (!content) return notFound();

  return (
    <>
      {/* Render the Builder blog post */}
      <RenderBuilderContent 
        content={content as any} 
        model={builderModelName} 
        options={{ 
          locale: locale, 
          enrich: true 
        }} 
      />
    </>
  );
}
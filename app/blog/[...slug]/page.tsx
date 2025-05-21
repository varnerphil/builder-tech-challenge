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
  console.log('params.slug: ', params.slug);
  console.log('slug: ', slug);
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
  
  // Debug info
  console.log('------------ DEBUG: BLOG POST PAGE -------------');
  console.log('params.slug: ', params.slug);
  console.log('Joined slug: ', slug);
  console.log('Model Name:', builderModelName);
  console.log('Full URL path:', `/blog/${slug}`);
  console.log('Locale:', locale);
  
  // Instead of using URL targeting, fetch all articles and filter by name
  console.log('Looking for blog article with name matching slug:', slug);
  
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
  
  console.log('Total articles found:', allArticles?.length || 0);
  
  // Helper function to normalize strings for comparison
  const normalize = (str: string) => {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Normalize the URL slug for comparison
  const normalizedSlug = normalize(slug);
  console.log('Normalized URL slug:', normalizedSlug);
  
  // Dump all articles for debugging
  allArticles?.forEach((article: any, index: number) => {
    console.log(`Article ${index}:`, {
      id: article.id,
      name: article.name,
      normalizedName: 'blog' + normalize(article.name),
      slug: article.data?.slug,
      normalizedDataSlug: normalize(article.data?.slug || ''),
    });
  });
  
  // Filter to find the one matching our slug by name with more flexible matching
  const content = allArticles?.find((article: any) => {
    // Try to match by name (directly compare with slug) or by slug field if present
    const articleName = article.name;
    const articleSlug = article.data?.slug;
    
    // Normalize everything for comparison
    const normalizedName = normalize(articleName);
    const normalizedDataSlug = normalize(articleSlug || '');
    
    console.log('Comparing:', {
      normalizedName,
      normalizedDataSlug,
      normalizedSlug
    });
    
    // Try multiple matching strategies
    return normalizedName === normalizedSlug || // Normalized name match
           normalizedDataSlug === normalizedSlug || // Normalized slug field match
           articleName === slug || // Exact name match
           articleSlug === slug || // Exact slug field match
           normalizedSlug.includes(normalizedName) || // Slug contains name
           normalizedName.includes(normalizedSlug); // Name contains slug
  }) || null;
  
  console.log('Matched article found:', content ? 'Yes' : 'No');
    
  // Log the response
  console.log('Builder.io API Response:', content ? 'Content found' : 'No content');
  if (content) {
    console.log('Content ID:', content.id);
    console.log('Content name:', content.name);
    console.log('Content data.slug:', content.data?.slug);
    console.log('Content data.title:', content.data?.title);
    console.log('Content lastUpdated:', content.lastUpdated);
  } else {
    console.log('No content returned from Builder.io API');
  }
  console.log('------------ END DEBUG -------------');

  if (!content) return notFound();

  console.log('content', content);

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
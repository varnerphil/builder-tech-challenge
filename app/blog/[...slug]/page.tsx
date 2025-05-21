// app/blog/[...slug]/page.tsx
import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "../../../components/builder";
import { notFound } from 'next/navigation';
import { cookies } from "next/headers";

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
  const content = await builder
    .get('blog-article', {
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

  const content = await builder
    // Get the blog post content from Builder with the specified options
    .get(builderModelName, {
      options: {
        locale: locale,
        enrich: false
      },
      userAttributes: {
        // Use the slug path specified in the URL to fetch the content
        urlPath: `/blog/${slug}`
      },
    })
    // Convert the result to a promise
    .toPromise();

  if (!content) return notFound();

  return (
    <>
      {/* Render the Builder blog post */}
      <RenderBuilderContent 
        content={content} 
        model={builderModelName} 
        options={{ 
          locale: locale, 
          enrich: false 
        }} 
      />
    </>
  );
}
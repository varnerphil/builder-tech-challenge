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
  const allPosts = await builder.getAll('blog-post', {
    options: { noTargeting: true },
  });

  return allPosts.map(post => ({
    slug: post.data?.slug?.split('/') || [],
  }));
}

export async function generateMetadata({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const content = await builder
    .get('blog-post', {
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
  const slug = params.slug.join('/');
  
  // Get locale from cookies or default to "en-US"
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "en-US";

  const content = await builder
    .get('blog-post', {
      options: {
        locale: locale,
      },
      userAttributes: {
        urlPath: `/blog/${slug}`,
      },
    })
    .toPromise();

  if (!content) return notFound();

  return (
    <RenderBuilderContent 
      content={content} 
      model="blog-post" 
      options={{ 
        locale: locale 
      }} 
    />
  );
}
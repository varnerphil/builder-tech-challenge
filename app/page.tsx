import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "../components/builder";
import { cookies } from "next/headers";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);


interface PageProps {
  params: {
    page: string[];
  };
}

export default async function Page(props: PageProps) {
  const homepageContent = await builder
    .get('homepage', {
      prerender: false,
    })
    .toPromise();

  return (
    <>
      {/* Render the Builder page */}
      <RenderBuilderContent 
        model="homepage" 
        content={homepageContent} />
    </>
  );
}


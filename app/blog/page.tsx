import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "../../components/builder";
import { cookies } from "next/headers";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

export default async function BlogIndexPage() {
  const builderModelName = "blog-index";
  
  // Get locale from cookies or default to "en-US"
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "en-US";

  const content = await builder
    .get(builderModelName, {
      options: {
        locale: locale,
        enrich: false
      },
      userAttributes: {
        urlPath: "/blog"
      },
    })
    .toPromise();

  return (
    <>
      {/* Render the Builder blog index page */}
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

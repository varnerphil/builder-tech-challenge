import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "../components/builder";
import { cookies } from "next/headers";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);


interface PageProps {
  params: {
    page: string[];
  };
}

export default async function Homepage(props: PageProps) {
  const builderModelName = "homepage";
  
  // Get locale from cookies or default to "en-US"
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "en-US";
  console.log("locale", locale);

  const content = await builder
    // Get the page content from Builder with the specified options
    .get(builderModelName, {
      options: {
        locale: locale,
        enrich: false
      },
      userAttributes: {
        // Use the page path specified in the URL to fetch the content
        urlPath: "/"
      },
    })
    // Convert the result to a promise
    .toPromise();

  return (
    <>
      {/* Render the Builder page */}
      <RenderBuilderContent content={content} model={builderModelName} options={{ locale: locale, enrich: false }} />
    </>
  );
}


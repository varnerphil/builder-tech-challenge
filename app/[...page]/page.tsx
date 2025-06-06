import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "../../components/builder";
import { cookies } from "next/headers";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

interface PageProps {
  params: {
    page: string[];
  };
}

// export const revalidate = 500;

export default async function Page(props: PageProps) {
  const builderModelName = "page";

  // Get locale from cookies or default to "en-US"
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "en-US";

  // console.log("props", props);

  const pageContent = await builder
    // Get the page content from Builder with the specified options
    .get(builderModelName, {
      options: {
        locale: locale,
        enrich: false
      },
      userAttributes: {
        // Use the page path specified in the URL to fetch the content
        urlPath: "/" + (props?.params?.page?.join("/") || "")
      },
    })
    // Convert the result to a promise
    .toPromise();

  return (
    <>
      {/* Render the Builder page */}
      <RenderBuilderContent content={pageContent} model={builderModelName} options={{ locale: locale, enrich: false }} />
    </>
  );
}

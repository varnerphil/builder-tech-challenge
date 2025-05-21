import { builder } from "@builder.io/sdk";
import { Header } from "@/components/Layout/Header";
import "./globals.css";
import Footer from "@/components/Layout/Footer";
import { RenderBuilderContent } from "@/components/builder";
import QueryProvider from "@/components/QueryProvider";
import { HydrationOverlay } from "@builder.io/react-hydration-overlay";

builder.init(process.env.NEXT_PUBLIC_BUILDER_API_KEY!);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Only fetch the banner content now
  const bannerContent = await builder.get("banner").toPromise();
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <main>
            {bannerContent && <RenderBuilderContent model="banner" content={bannerContent} />}
            <Header />
            <div className="container"><HydrationOverlay>{children}</HydrationOverlay></div>
          </main>
        </QueryProvider>
      </body>
    </html>
  );
}

import { type Collection } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';

import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from '~/constants/chain';

const fetchCollectionByUrl = async (req: NextRequest, url: string): Promise<Collection | undefined> => {
  try {
    const res = await fetch(`${req.nextUrl.origin}/api/collection/${url}`);
    return await res.json() as Collection;
  } catch (e) {
    console.error({ e })
  }
};

export async function middleware(request: NextRequest) {
  // if the pathname is /collection/[vanity-url] or /collection/[vanity-url]/drop
  const collectionVanityUrlPattern = /^\/collection\/[^\/]+(?:\/drop)?$/;
  const isCollectionVanityUrl = collectionVanityUrlPattern.test(request.nextUrl.pathname);
  if (isCollectionVanityUrl) {
    const segments = request.nextUrl.pathname.split('/');
    // get the vanity url from the pathname
    const vanityUrl = segments[2] as string;
    // fetch the collection by the vanity url
    const collection = await fetchCollectionByUrl(request, vanityUrl);
    // if a collection is retrieved, construct url
    if (collection) {
      const chain = SUPPORTED_CHAINS.find(c => c.chainId === collection.chainId) || DEFAULT_CHAIN;
      // rewrite the URL with the dynamic route while retaining the vanity URL
      const newUrl = request.nextUrl.clone();
      // construct the URL with the fetched data
      newUrl.pathname = `/collection/${chain.slug}/${collection.address}`;
      // append drop if this is the drop page
      if (request.nextUrl.pathname.endsWith('/drop')) {
        newUrl.pathname += '/drop';
      }
      return NextResponse.rewrite(newUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/collection/:path*',
    '/profile/:path*',
  ],
}
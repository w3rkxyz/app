import { NextRequest, NextResponse } from "next/server";

const TESTNET_GRAPHQL = "https://api.testnet.lens.xyz/graphql";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const author = request.nextUrl.searchParams.get("author");

  if (type !== "job" && type !== "service") {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const endpoint = TESTNET_GRAPHQL;
  const query = `
    query Posts($request: PostsRequest!) {
      posts(request: $request) {
        items {
          __typename
          ... on Post {
            id
            author {
              address
              owner
              username {
                localName
              }
              metadata {
                ... on AccountMetadata {
                  name
                  picture
                }
              }
            }
            metadata {
              __typename
              ... on TextOnlyMetadata {
                content
                tags
                attributes {
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    request: {
      pageSize: 50,
      filter: {
        ...(author ? { authors: [author] } : {}),
        metadata: {
          tags: {
            all: ["w3rk", type],
          },
        },
      },
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    const json = await response.json();
    const items = json?.data?.posts?.items;
    return NextResponse.json({ items: Array.isArray(items) ? items : [] }, { status: 200 });
  } catch (error) {
    console.error("lens-listings api route failed:", error);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

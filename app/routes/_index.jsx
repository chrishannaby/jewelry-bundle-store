import {useLoaderData, Link} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';

export function meta() {
  return [
    {title: 'Hydrogen'},
    {description: 'A custom storefront powered by Hydrogen'},
  ];
}

export async function loader({context}) {
  return await context.storefront.query(PRODUCTS_QUERY);
}

export default function Index() {
  const {collection} = useLoaderData();
  return (
    <section className="w-full gap-4">
      <h2 className="whitespace-pre-wrap max-w-prose font-bold text-lead">
        Featured Products
      </h2>
      <div className="grid-flow-row grid gap-2 gap-y-6 md:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-3">
        {collection?.products?.edges?.map((node) => {
          const product = node.node;
          return (
            <Link to={`/products/${product.handle}`} key={product.id}>
              <div className="grid gap-4">
                {product?.featuredImage && (
                  <Image
                    alt={`Image of ${product.title}`}
                    data={product.featuredImage}
                    key={product.id}
                    sizes="(max-width: 32em) 100vw, 33vw"
                  />
                )}
                <h2 className="whitespace-pre-wrap max-w-prose font-medium text-copy">
                  {product.title}
                </h2>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const PRODUCTS_QUERY = `#graphql
query ProductCollection {
  collection(handle: "products") {
    id
    title
    handle
    products(first: 3) {
      edges {
        node {
          id
          handle
          title
          featuredImage {
            url
          }
        }
      }
    }
  }
}
`;

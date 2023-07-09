import {useLoaderData} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {Image} from '@shopify/hydrogen';

export async function loader({params, context}) {
  const {handle} = params;
  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
    },
  });

  const isParentProduct = product?.tags?.includes('parent-product');

  if (!product?.id || !isParentProduct) {
    throw new Response(null, {status: 404});
  }

  const bundleConfiguration = JSON.parse(
    product.bundleConfiguration?.value ?? '{}',
  );

  return json({
    handle,
    product,
    bundleConfiguration,
  });
}

export default function ProductHandle() {
  const {product, bundleConfiguration} = useLoaderData();

  return (
    <section className="w-full gap-4 md:gap-8 grid px-6 md:px-8 lg:px-12">
      <div className="grid items-start gap-6 lg:gap-20 md:grid-cols-2 lg:grid-cols-3">
        <div className="grid md:grid-flow-row  md:p-0 md:overflow-x-hidden md:grid-cols-2 md:w-full lg:col-span-2">
          <div className="md:col-span-2 snap-center card-image aspect-square md:w-full w-[80vw] shadow rounded">
            {product?.featuredImage && (
              <Image
                alt={`Image of ${product.title}`}
                data={product.featuredImage}
                key={product.id}
                sizes="(max-width: 32em) 100vw, 33vw"
              />
            )}
          </div>
        </div>
        <div className="md:sticky md:mx-auto max-w-xl md:max-w-[24rem] grid gap-8 p-0 md:p-6 md:px-0 top-[6rem] lg:top-[8rem] xl:top-[10rem]">
          <div className="grid gap-2">
            <h1 className="text-4xl font-bold leading-10 whitespace-normal">
              {product.title}
            </h1>
            <span className="max-w-prose whitespace-pre-wrap inherit text-copy opacity-50 font-medium">
              {product.vendor}
            </span>
          </div>
          <PrintJson data={bundleConfiguration} />
        </div>
      </div>
    </section>
  );
}

function PrintJson({data}) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

const PRODUCT_QUERY = `#graphql
  query product($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      tags
      featuredImage {
        url
        width
        height
      }
      bundleConfiguration: metafield(namespace: "custom", key: "bundle_configuration") {
        value
      }
    }
  }
`;

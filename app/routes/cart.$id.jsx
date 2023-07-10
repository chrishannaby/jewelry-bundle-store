import {Link, useLoaderData} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {PrintJson} from '~/components/PrintJson';

export async function loader({params, context}) {
  const {id} = params;
  const {cart} = await context.storefront.query(CART_QUERY, {
    variables: {
      id,
    },
  });

  if (!cart) {
    throw new Response(null, {status: 404});
  }
  return json({
    cart,
  });
}

export default function Cart() {
  const {cart} = useLoaderData();
  return (
    <div>
      <Link
        to={cart.checkoutUrl}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Checkout
      </Link>
      <PrintJson title="Cart" data={cart} />
    </div>
  );
}

const CART_QUERY = `#graphql
query Cart($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      createdAt
      updatedAt
      lines(first: 100) {
        edges {
          node {
            ... on ComponentizableCartLine {
              id
              merchandise {
                ... on ProductVariant {
                  id
                  title
                }
              }
              lineComponents {
                merchandise {
                  ... on ProductVariant {
                    title
                  }
                }
              }
            }
          }
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

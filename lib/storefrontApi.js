const publicStorefrontApiToken = 'e37afae69613635b27c5de40a96dcafc';
const storefrontApiUrl =
  'https://jewelry-bundle-test.myshopify.com/api/unstable/graphql.json';

export function queryStorefrontApi(query, variables = {}) {
  return fetch(storefrontApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': publicStorefrontApiToken,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then((res) => res.json())
    .then(({data}) => data)
    .catch(console.error);
}

const SELECTED_VARIANT_QUERY = `#graphql
  query SelectedVariant($id: ID!, $selectedOptions: [SelectedOptionInput!]!) {
    product(id: $id) {
      selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
        id
      }
    }
  }
`;

export async function fetchSelectedVariants(options) {
  const queries = [];
  for (const lineItemId in options) {
    const variables = options[lineItemId];
    queries.push(
      queryStorefrontApi(SELECTED_VARIANT_QUERY, variables).then((data) => {
        return {
          lineItemId,
          productId: variables.id,
          variantId: data?.product?.selectedVariant?.id,
        };
      }),
    );
  }
  return await Promise.all(queries);
}

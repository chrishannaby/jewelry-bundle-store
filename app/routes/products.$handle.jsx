import {useLoaderData} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {Image} from '@shopify/hydrogen';
import {useState, useEffect} from 'react';
import {queryStorefrontApi, fetchSelectedVariants} from 'lib/storefrontApi';
import {PillButtonGroup} from '../components/PillButtonGroup';
import {PrintJson} from '../components/PrintJson';
import {EngravingOption} from '~/components/EngravingOption';

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
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const options = {};

    for (const id in bundleConfiguration) {
      // Engravings will be handled separately
      if (id === 'ef') continue;
      const lineItem = bundleConfiguration[id];
      const current = options[lineItem.lineItemId];

      const newOption = {
        name: lineItem.optionName,
        value: null,
      };

      const updated = {
        id: lineItem.shopifyId,
        selectedOptions: current?.selectedOptions
          ? [...current.selectedOptions, newOption]
          : [newOption],
      };

      options[lineItem.lineItemId] = updated;
    }

    return options;
  });

  useEffect(() => {
    async function fetchData() {
      const data = await fetchSelectedVariants(selectedOptions);
      setSelectedVariants(data);
    }
    fetchData();
  }, [selectedOptions]);

  const isValidConfiguration = selectedVariants.every(
    (option) => option.variantId,
  );

  function setSelectedOption(lineItemId, optionName, selectedOption) {
    setSelectedOptions((prevSelectedOptions) => {
      const newSelectedOptions = {...prevSelectedOptions};
      const option = newSelectedOptions[lineItemId].selectedOptions.find(
        (o) => o.name === optionName,
      );
      option.value = selectedOption;
      return newSelectedOptions;
    });
  }

  async function createCart() {
    if (!isValidConfiguration) return;
    // create a random bundle id
    const bundleId = Math.random().toString(36).substring(12);
    // create a line item for each selected variant
    const lines = selectedVariants.map((selectedVariant) => {
      return {
        merchandiseId: selectedVariant.variantId,
        quantity: 1,
        attributes: [
          {
            key: 'bundleId',
            value: bundleId,
          },
          {
            key: 'lineItemId',
            value: selectedVariant.lineItemId,
          },
        ],
      };
    });
    // create the cart
    const {cartCreate} = await queryStorefrontApi(CREATE_CART_MUTATION, {
      lines,
    });
    // redirect to the cart page
    const urlEncodedId = encodeURIComponent(cartCreate.cart.id);
    window.location.href = `/cart/${urlEncodedId}`;
  }

  return (
    <section className="max-w-7xl mx-auto w-full gap-4 md:gap-8 grid grid-cols-1 md:grid-cols-[400px_minmax(0,_1fr)] px-6 md:px-8 lg:px-12 overflow-hidden">
      <div className="aspect-square md:w-full">
        {product?.featuredImage && (
          <Image
            alt={`Image of ${product.title}`}
            data={product.featuredImage}
            key={product.id}
            sizes="(max-width: 32em) 100vw, 33vw"
          />
        )}
      </div>
      <div>
        <h1 className="text-4xl font-bold leading-10 whitespace-normal">
          {product.title}
        </h1>
        <PrintJson title="Bundle Data" data={bundleConfiguration} />
        <PrintJson title="selectedOptions" data={selectedOptions} />
        <PrintJson title="selectedVariants" data={selectedVariants} />

        <ul className="space-y-4">
          {Object.keys(bundleConfiguration)?.map((id) => {
            const lineItem = bundleConfiguration[id];
            const title = lineItem.heading.title;
            const lineItemId = lineItem.lineItemId;
            const optionName = lineItem.optionName;
            const options = lineItem.options.map((o) => o.title);
            return (
              <li className="space-y-2" key={id}>
                <h2 className="text-xl font-bold leading-10 whitespace-normal">
                  {title}
                </h2>
                {title === 'Engravings' ? (
                  'Engravings'
                ) : (
                  <PillButtonGroup
                    options={options}
                    active={
                      selectedOptions[lineItemId]?.selectedOptions.find(
                        (o) => o.name === optionName,
                      )?.value
                    }
                    setActive={(selectedOption) =>
                      setSelectedOption(lineItemId, optionName, selectedOption)
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>

        <button
          onClick={createCart}
          disabled={!isValidConfiguration}
          className={`w-full text-lg font-bold mt-6 px-4 py-2 bg-blue-500 text-white rounded-md ${
            isValidConfiguration
              ? 'hover:bg-blue-600'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Add to Cart
        </button>
      </div>
    </section>
  );
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

const CREATE_CART_MUTATION = `#graphql
mutation CartCreate($lines: [CartLineInput!]!) {
  cartCreate(input: {lines: $lines}) {
    cart {
      id
    }
  }
}
`;

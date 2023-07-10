import {useEffect, useState} from 'react';
import {PillButtonGroup} from './PillButtonGroup';
import {fetchSelectedVariants} from '../lib/storefrontApi';

export function EngravingOption({lineItem, setEngravingVariant}) {
  const options = lineItem.options.map((o) => o.title);
  const lineItemId = lineItem.lineItemId;

  const [engraving1, setEngraving1] = useState('');
  const [baseEngraving, setBaseEngraving] = useState('');
  const [selectedFont, setSelectedFont] = useState(() => {
    return options[0];
  });

  useEffect(() => {
    if (engraving1.length > 0 || baseEngraving.length > 0) {
      async function fetchData() {
        const variants = await fetchSelectedVariants({
          [lineItemId]: {
            id: lineItem.shopifyId,
            selectedOptions: [
              {
                name: 'Font',
                value: selectedFont,
              },
              {
                name: 'Base Engraving',
                value:
                  baseEngraving.length > 0
                    ? 'Base Engraving'
                    : 'No Base Engraving',
              },
            ],
          },
        });
        setEngravingVariant({
          ...variants[0],
          engraving1,
          baseEngraving,
        });
      }
      fetchData();
    } else {
      setEngravingVariant(null);
    }
  }, [engraving1, baseEngraving, selectedFont]);

  return (
    <>
      <PillButtonGroup
        options={options}
        active={selectedFont}
        setActive={setSelectedFont}
      />
      <div className="py-4 space-y-2">
        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Engraving 1
          </label>
          <input
            value={engraving1}
            onChange={(e) => setEngraving1(e.target.value)}
            type="text"
            className="mt-1 py-2 px-4 block w-full border border-gray-900 rounded-md  focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Base Engraving
          </label>
          <input
            value={baseEngraving}
            onChange={(e) => setBaseEngraving(e.target.value)}
            type="text"
            className="mt-1 py-2 px-4 block w-full border border-gray-900 rounded-md  focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
      </div>
    </>
  );
}

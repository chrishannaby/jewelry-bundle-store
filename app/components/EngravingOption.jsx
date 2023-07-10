import {useState} from 'react';

export function EngravingOption() {
  const [engraving1, setEngraving1] = useState('');
  const [baseEngraving, setBaseEngraving] = useState('');
  const [engravingOptions, setEngravingOptions] = useState(() => {
    const config = bundleConfiguration?.ef;
    if (!config) return [];
    return {
      id: config.shopifyId,
      selectedOptions: [{name: 'Base Engraving', value: null}],
    };
  });

  function updateBaseEngraving(e) {
    const value = e.target.value;
    setBaseEngraving(value);
    const engravingOption =
      value.length > 0 ? 'Base Engraving' : 'No Base Engraving';
    setEngravingOption(engravingOption);
  }

  return (
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
          onChange={updateBaseEngraving}
          type="text"
          className="mt-1 py-2 px-4 block w-full border border-gray-900 rounded-md  focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>
    </div>
  );
}

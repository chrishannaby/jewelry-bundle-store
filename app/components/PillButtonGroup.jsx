function PillButton({label, isActive, onClick}) {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm font-medium ${
        isActive
          ? 'bg-gray-900 border border-gray-900 text-white'
          : 'text-gray-900 border border-gray-900'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function PillButtonGroup({options, active, setActive}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <PillButton
          key={option}
          label={option}
          isActive={option === active}
          onClick={() => setActive(option)}
        />
      ))}
    </div>
  );
}

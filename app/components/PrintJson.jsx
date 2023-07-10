export function PrintJson({title, data}) {
  return (
    <details className="my-4">
      <summary>{title}</summary>
      <pre className="mt-2 p-2 overflow-x-scroll text-sm bg-white">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

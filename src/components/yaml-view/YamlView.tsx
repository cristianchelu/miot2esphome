interface YamlViewProps {
  yaml: string;
}

export default function YamlView({ yaml }: YamlViewProps) {
  return (
    <pre>
      <code>{yaml}</code>
    </pre>
  );
}

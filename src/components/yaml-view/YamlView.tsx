import { useEffect, useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import dark from "react-syntax-highlighter/dist/esm/styles/hljs/stackoverflow-dark";
import light from "react-syntax-highlighter/dist/esm/styles/hljs/stackoverflow-light";

SyntaxHighlighter.registerLanguage("yaml", yaml);

interface YamlViewProps {
  yaml: string;
}

export default function YamlView({ yaml }: YamlViewProps) {
  const [isDarkMode, setIsDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    function handleColorSchemeChange(event: MediaQueryListEvent) {
      setIsDarkMode(event.matches);
    }

    mql.addEventListener("change", handleColorSchemeChange);

    return () => {
      mql.removeEventListener("change", handleColorSchemeChange);
    };
  }, []);

  return (
    <SyntaxHighlighter language="yaml" style={isDarkMode ? dark : light}>
      {yaml}
    </SyntaxHighlighter>
  );
}

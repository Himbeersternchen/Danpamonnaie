import { ReactNode, useState } from "react";
import { Card } from "../../resuable-ui/display/Card";
import { Heading } from "../../resuable-ui/display/Heading";
import { Container } from "../../resuable-ui/layout/Container";
import { Page } from "../../resuable-ui/layout/Page";
import { Stack } from "../../resuable-ui/layout/Stack";
import { tutorialSteps } from "./tutorialSteps";

export function Tutorial() {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());
  const renderWithCode = (text: string): ReactNode => {
    const parts = text.split(/(".*?")/);
    return parts.map((part, i) =>
      part.startsWith('"') && part.endsWith('"') ? (
        <code
          key={i}
          className="bg-gray-100 px-1 rounded font-mono text-gray-800"
        >
          {part.slice(1, -1)}
        </code>
      ) : (
        part
      )
    );
  };

  const toggle = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () =>
    setOpenIndices(new Set(tutorialSteps.map((_, i) => i)));

  const collapseAll = () => setOpenIndices(new Set());

  return (
    <Page>
      <Container>
        <Stack spacing={4}>
          <div className="flex items-center justify-between">
            <Heading level={2} size="xl" weight="semibold" color="gray-900">
              Setup steps
            </Heading>
            <button
              onClick={
                openIndices.size === tutorialSteps.length
                  ? collapseAll
                  : expandAll
              }
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              {openIndices.size === tutorialSteps.length
                ? "Collapse all"
                : "Expand all"}
            </button>
          </div>
          <Stack spacing={3}>
            {tutorialSteps.map((step, index) => {
              const isOpen = openIndices.has(index);
              return (
                <Card key={index} shadow="sm" rounded="lg" padding="none">
                  <button
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left gap-3"
                  >
                    <span className="text-base font-medium text-gray-900">
                      {step.title}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="20px"
                      viewBox="0 -960 960 960"
                      width="20px"
                      fill="currentColor"
                      className={`shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-3 text-sm text-gray-600 border-t border-gray-100 space-y-1">
                      {step.description.map((line, i) => (
                        <p key={i}>{renderWithCode(line)}</p>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </Stack>
        </Stack>
      </Container>
    </Page>
  );
}

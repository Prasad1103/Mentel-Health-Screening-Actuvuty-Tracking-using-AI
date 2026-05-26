import React from "react";

type ResultItem = {
  label?: string;
  value?: string | number;
  confidence?: number;
};

type Props = {
  results?: ResultItem[];
};

export default function ResultsPanel({
  results = [],
}: Props) {
  if (!Array.isArray(results)) {
    results = [];
  }

  return (
    <div className="bg-card border shadow-sm rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">
        Results Overview
      </h3>

      {results.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No results available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border p-4 bg-background/40"
            >
              <div className="flex justify-between">
                <span className="font-medium">
                  {item.label || "Result"}
                </span>

                <span className="text-primary font-semibold">
                  {item.value || "-"}
                </span>
              </div>

              {item.confidence !==
                undefined && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Confidence:{" "}
                  {Number(
                    item.confidence
                  ).toFixed(1)}
                  %
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
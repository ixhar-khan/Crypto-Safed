function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-navy">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function renderFormattedText(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const blocks = [];
  let currentList = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: "ul", items: [...currentList] });
      currentList = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("- ")) {
      currentList.push(line.slice(2));
    } else {
      flushList();
      blocks.push({ type: "p", text: line });
    }
  }
  flushList();

  return blocks.map((block, i) =>
    block.type === "ul" ? (
      <ul key={i} className="list-disc list-outside space-y-2 pl-5">
        {block.items.map((item, j) => (
          <li key={j} className="text-navy/80">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    ) : (
      <p key={i} className="text-navy/80">
        {renderInline(block.text)}
      </p>
    ),
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M10 2l7 3v5c0 4.5-3 7.5-7 8-4-0.5-7-3.5-7-8V5l7-3z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ComplianceCard({ summary }) {
  return (
    <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm shadow-navy/5">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <ShieldIcon />
        </span>
        <h2 className="text-base font-semibold text-navy">
          Pakistan compliance notes
        </h2>
      </div>
      {summary ? (
        <div className="text-sm leading-relaxed space-y-3">
          {renderFormattedText(summary)}
        </div>
      ) : (
        <p className="text-sm text-navy/50">
          Run an analysis to see SBP, SECP, and FBR guidance relevant to this
          project.
        </p>
      )}
    </section>
  );
}

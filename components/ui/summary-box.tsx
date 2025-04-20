interface SummaryBoxProps {
  title: string
  content: string
  type: "ai" | "sentiment" | "content" | "network" | "story"
}

export function AiSummaryBox({ title, content, type }: SummaryBoxProps) {
  return (
    <div className={`summary-box ${type} transition-all duration-300`}>
      <h3 className="summary-title">{title}</h3>
      <div className="summary-content">
        <p>{content}</p>
      </div>
    </div>
  )
}

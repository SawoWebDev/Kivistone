export default function SectionHead({ title, description }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

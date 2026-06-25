import { FlaskConical } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="demo-banner">
      <FlaskConical size={11} />
      <span>DEMO ENVIRONMENT — FAKE PATIENT DATA. NOT FOR CLINICAL USE.</span>
    </div>
  );
}

import { useState } from 'react';
import {
  X, ZoomIn, ZoomOut, RotateCw, Maximize, Printer, Download, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useEhr } from '../store/EhrStore';
import type { Attachment } from '../types';

// A deliberately painful scanned-document viewer: opens small (uses only part of
// the screen), low-resolution / blurry / skewed, and starts zoomed out so you
// can't read it until you fight the zoom controls.
export default function DocViewer({ att, onClose }: { att: Attachment; onClose: () => void }) {
  const { toast } = useEhr();
  const [zoom, setZoom] = useState(0.5);   // starts too small to read
  const [rot, setRot] = useState(0);
  const [page, setPage] = useState(1);

  const z = (d: number) => setZoom((v) => Math.min(3, Math.max(0.25, +(v + d).toFixed(2))));

  return (
    <div className="modal-overlay" style={{ zIndex: 1300, paddingTop: 48 }} onMouseDown={onClose}>
      <div className="modal" style={{ minWidth: 600, maxWidth: 600 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-title">
          <span style={{ fontSize: 11 }}>📎 {att.name} — Image Viewer</span>
          <X size={15} className="x" onClick={onClose} />
        </div>

        <div className="doc-toolbar">
          <button className="btn-xs" onClick={() => z(-0.25)} title="Zoom out"><ZoomOut size={11} /></button>
          <span className="xsmall" style={{ width: 38, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
          <button className="btn-xs" onClick={() => z(0.25)} title="Zoom in"><ZoomIn size={11} /></button>
          <button className="btn-xs" onClick={() => setZoom(1)} title="Fit / 100%"><Maximize size={11} /></button>
          <button className="btn-xs" onClick={() => setRot((r) => (r + 90) % 360)} title="Rotate"><RotateCw size={11} /></button>
          <span className="sep" />
          <button className="btn-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={11} /></button>
          <span className="xsmall" style={{ width: 64, textAlign: 'center' }}>Pg {page} / {att.pages}</span>
          <button className="btn-xs" disabled={page >= att.pages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={11} /></button>
          <span className="spacer" />
          <button className="btn-xs" onClick={() => toast('Printing scanned image…', 'info')}><Printer size={11} /></button>
          <button className="btn-xs" onClick={() => toast('Downloading original (12.4 MB TIFF)…', 'info')}><Download size={11} /></button>
        </div>

        <div className="doc-viewport">
          <div className="doc-paper" style={{ transform: `rotate(${rot}deg) scale(${zoom})` }}>
            <div className="doc-skew">
              <PageContent att={att} page={page} />
            </div>
            <div className="doc-smudge" style={{ width: 90, height: 50, right: 30, top: 120 }} />
            <div className="doc-smudge" style={{ width: 40, height: 120, left: -6, bottom: 90 }} />
          </div>
        </div>

        <div className="modal-foot" style={{ justifyContent: 'space-between' }}>
          <span className="xsmall muted">Scanned at 150 dpi · grayscale · {att.pages} page(s) · received via fax gateway</span>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Line({ children, w }: { children?: React.ReactNode; w?: number }) {
  return <div style={{ width: w ? `${w}%` : undefined }}>{children}</div>;
}

function PageContent({ att, page }: { att: Attachment; page: number }) {
  const n = att.name.toLowerCase();

  if (att.kind === 'ekg') {
    const pts: string[] = [];
    for (let i = 0; i < 520; i++) {
      const base = 60;
      const x = i;
      // crude repeating PQRST-ish waveform
      const t = i % 65;
      let y = base;
      if (t === 10) y = base - 6; else if (t === 28) y = base + 4;
      else if (t === 30) y = base - 42; else if (t === 32) y = base + 16;
      else if (t === 45) y = base - 14;
      pts.push(`${x},${y}`);
    }
    return (
      <div className="doc-fax">
        <div className="bold">ECG — RHYTHM STRIP (Lead II)</div>
        <div className="xsmall">St. Anne's Hospital · 2026-05-30 · poor reproduction</div>
        <svg width="520" height="130" style={{ marginTop: 8, background: 'repeating-linear-gradient(0deg,#f4d6d6 0 13px,#f4f2ec 13px 26px), repeating-linear-gradient(90deg,#f4d6d6 0 13px,#f4f2ec 13px 26px)' }}>
          <polyline points={pts.join(' ')} fill="none" stroke="#101010" strokeWidth={1.2} />
        </svg>
        <div className="xsmall" style={{ marginTop: 6 }}>Vent rate 78 bpm · PR 168 ms · QRS 102 ms · QT/QTc 392/441 ms</div>
        <div className="xsmall">Interpretation: atrial fibrillation with controlled ventricular response. ?LVH.</div>
        <div className="handwriting" style={{ fontSize: 16, marginTop: 18, transform: 'rotate(2deg)' }}>compare to prior — rate better today</div>
      </div>
    );
  }

  if (att.kind === 'card') {
    const front = page === 1;
    return (
      <div className="doc-fax">
        <div className="bold">INSURANCE CARD — {front ? 'FRONT' : 'BACK'} (scanned)</div>
        <div style={{ marginTop: 14, border: '2px solid #222', borderRadius: 8, padding: 14, width: 360, transform: 'rotate(-0.8deg)' }}>
          {front ? (
            <>
              <div className="bold" style={{ fontSize: 15 }}>HUMANA · Medicare Advantage</div>
              <div style={{ marginTop: 10 }}>Member: WALSH, ELEANOR</div>
              <div>ID: H42-118-220-7</div>
              <div>Group: GRP-4471</div>
              <div>RxBIN 610649 · RxPCN 03200000 · RxGRP HUMRX</div>
              <div style={{ marginTop: 8 }}>Copay: PCP $25 / Spec $45 / ER $90</div>
            </>
          ) : (
            <>
              <div>Claims: PO Box 14601, Lexington KY</div>
              <div>Provider services: 1-800-555-0142</div>
              <div>EDI Payer ID: 61101</div>
              <div className="handwriting" style={{ fontSize: 15, marginTop: 16 }}>verify — new plan as of 6/1</div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (att.kind === 'form') {
    return (
      <div className="doc-fax">
        <div className="center bold">U.S. DEPARTMENT OF LABOR — WH-380-E</div>
        <div className="center xsmall">Certification of Health Care Provider (Employee's Serious Health Condition)</div>
        <hr />
        <div style={{ marginTop: 8 }}>Employee Name: <span className="handwriting" style={{ fontSize: 15 }}>Terrence Brooks</span></div>
        <div>Patient (if other): _______________________</div>
        <div style={{ marginTop: 8 }}>SECTION II — HEALTH CARE PROVIDER</div>
        <div style={{ marginTop: 6 }}>1. Medical facts — diagnosis: <span className="handwriting" style={{ fontSize: 14 }}>HTN, anxiety</span></div>
        <div style={{ marginTop: 6 }}>2. Approximate date condition commenced: <span className="handwriting">3/2024</span></div>
        <div style={{ marginTop: 6 }}>3. Probable duration of condition: <span className="handwriting">chronic</span></div>
        <div style={{ marginTop: 10 }}>Incapacity (check all that apply):</div>
        <div className="row" style={{ gap: 16, marginTop: 4 }}>
          <span>☑ Episodic</span><span>☐ Continuous</span><span>☐ Single</span>
        </div>
        <div style={{ marginTop: 18 }}>Provider signature: <span style={{ borderBottom: '1px solid #333', display: 'inline-block', width: 180 }}>&nbsp;</span></div>
        <div style={{ marginTop: 6 }}>Date: ______________   {page > 1 && <span className="xsmall">(page {page} of 4 — continuation)</span>}</div>
        <div className="handwriting" style={{ fontSize: 13, marginTop: 22, transform: 'rotate(1deg)' }}>please complete #5–#7 on next page</div>
      </div>
    );
  }

  if (n.includes('bp_log')) {
    const rows = [['6/15', '152/90', '148/88'], ['6/16', '156/92', '150/86'], ['6/17', '149/90', '151/89'], ['6/18', '154/94', '147/85'], ['6/19', '150/88', '149/90'], ['6/20', '158/96', '152/91']];
    return (
      <div>
        <div className="handwriting bold" style={{ fontSize: 20 }}>Home BP log — Maria</div>
        <div className="handwriting" style={{ fontSize: 14, marginBottom: 8 }}>(took with the cuff from CVS)</div>
        <table style={{ width: 320 }}>
          <thead><tr><th style={{ textAlign: 'left' }} className="handwriting">date</th><th className="handwriting">morning</th><th className="handwriting">night</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="handwriting" style={{ fontSize: 17 }}>
                <td>{r[0]}</td><td style={{ padding: '2px 14px' }}>{r[1]}</td><td>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="handwriting" style={{ fontSize: 15, marginTop: 16, transform: 'rotate(-1deg)' }}>a little dizzy on 6/20 ?</div>
      </div>
    );
  }

  if (n.includes('renal_us')) {
    return (
      <div className="doc-fax">
        <div className="bold">RADIOLOGY REPORT — RENAL ULTRASOUND</div>
        <div className="xsmall">Accession 2025-RUS-8841 · 2025-11-02</div>
        <hr />
        <div style={{ marginTop: 8 }}>CLINICAL: CKD, monitor.</div>
        <div style={{ marginTop: 8 }}>FINDINGS: Right kidney 9.8 cm, left 9.6 cm. Mild cortical thinning bilaterally. No hydronephrosis, stones, or focal mass. Bladder unremarkable.</div>
        <div style={{ marginTop: 8 }} className="bold">IMPRESSION:</div>
        <div>1. Cortical thinning consistent with medical renal disease (CKD).</div>
        <div>2. No hydronephrosis or obstruction.</div>
        <div style={{ marginTop: 18 }}>Electronically signed: R. Patel, MD {page > 1 && <span className="xsmall">— addendum on pg 2</span>}</div>
      </div>
    );
  }

  // default: faxed cardiology consult letter (multi-page)
  return (
    <div className="doc-fax">
      <div className="center bold">MERCY CARDIOLOGY ASSOCIATES</div>
      <div className="center xsmall">1450 Parkside Dr, Suite 300 · Tel (555) 221-9000 · Fax (555) 221-9043</div>
      <hr />
      {page === 1 ? (
        <>
          <Line>2026-06-14</Line>
          <Line>Re: DELGADO, HECTOR · DOB 08/25/1944 · ext MRN 88142</Line>
          <div style={{ marginTop: 10 }}>Dear Dr. Okafor,</div>
          <div style={{ marginTop: 8 }}>Thank you for referring Mr. Delgado for evaluation of heart failure. He is an 81-year-old gentleman with HFrEF, atrial fibrillation on apixaban, CKD3, and T2DM, seen today for follow-up of increasing dyspnea and lower-extremity edema.</div>
          <div style={{ marginTop: 8 }}>Echocardiogram demonstrates LVEF 30–35%, moderate MR, and grade II diastolic dysfunction. NT-proBNP elevated at 1840. He remains on guideline-directed therapy (carvedilol, sacubitril/valsartan, loop diuretic).</div>
          <div className="handwriting" style={{ fontSize: 14, marginTop: 10, transform: 'rotate(1deg)' }}>see plan, pg 2 →</div>
        </>
      ) : page === 2 ? (
        <>
          <div className="bold">IMPRESSION</div>
          <div>1. HFrEF (LVEF 30–35%), NYHA class II–III, mildly decompensated.</div>
          <div>2. Atrial fibrillation, rate-controlled, anticoagulated.</div>
          <div>3. CKD stage 3 — limits diuretic/ACE titration.</div>
          <div className="bold" style={{ marginTop: 10 }}>PLAN</div>
          <div>- Increase furosemide; daily weights; 2 g Na diet.</div>
          <div>- Continue GDMT; recheck BMP in 1–2 weeks (K/Cr).</div>
          <div>- Consider CRT evaluation if QRS widens.</div>
          <div style={{ marginTop: 24 }}>Sincerely,</div>
          <div className="handwriting" style={{ fontSize: 22 }}>M. Hahn, MD</div>
          <div className="xsmall">Mercy Cardiology — electronically signed</div>
        </>
      ) : (
        <>
          <div className="xsmall">[Page {page} of {att.pages}] — appended documents (medication list / prior ECG).</div>
          <div style={{ marginTop: 10 }} className="handwriting">faxed copy — partially cut off</div>
          <div style={{ marginTop: 8, opacity: 0.6 }}>……………………………………………</div>
          <div style={{ opacity: 0.5 }}>…… illegible ……</div>
        </>
      )}
    </div>
  );
}

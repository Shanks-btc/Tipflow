// Only the root layout (src/app/layout.tsx) can render <html>/<body> in
// Next.js App Router — this nested layout can't redeclare them to set a
// transparent background directly. A plain <style> tag still applies
// globally regardless of where it sits in the DOM, and — unlike a
// useEffect-based override — takes effect during the initial paint,
// before any JS runs, so OBS's Browser Source never briefly shows the
// app's dark background before the page finishes hydrating.
//
// Belt-and-suspenders: background AND background-color are both set
// explicitly (background-color is technically implied by `background:
// transparent`, but setting both leaves no ambiguity), and .overlay-root
// (also defined in globals.css) gives the page's own root element the
// same override in case anything paints between html/body and the
// content.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        html, body {
          background: transparent !important;
          background-color: transparent !important;
          margin: 0;
          padding: 0;
        }
        .overlay-root {
          background: transparent !important;
          background-color: transparent !important;
        }
      `}</style>
      <div className="overlay-root" style={{ minHeight: '100vh', background: 'transparent' }}>
        {children}
      </div>
    </>
  )
}

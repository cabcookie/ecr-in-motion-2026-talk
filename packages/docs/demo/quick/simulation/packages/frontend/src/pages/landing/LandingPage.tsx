import { useEffect } from "react";
import { Link } from "react-router-dom";

const apps = [
  {
    title: "Microsoft Outlook",
    description: "Buyer's emails – inbox and sent messages",
    path: "/outlook",
    icon: "📧",
    color: "#0078d4",
  },
  {
    title: "Microsoft Teams",
    description: "Chat channels and conversations in the supply chain team",
    path: "/teams",
    icon: "💬",
    color: "#6264a7",
  },
  {
    title: "SAP S/4HANA",
    description: "Supply chain KPIs, supplier performance, and escalations",
    path: "/sap",
    icon: "📊",
    color: "#0f4a84",
  },
  {
    title: "Manhattan WMS",
    description: "Inventory data, coverage days, and stock movements",
    path: "/wms",
    icon: "🏭",
    color: "#2e7d32",
  },
  {
    title: "Simulation Dashboard",
    description: "Simulation control – trigger scenarios and observe events",
    path: "/simulation",
    icon: "⚙️",
    color: "#d93025",
  },
];

export function LandingPage() {
  useEffect(() => {
    document.title = "ALDI Demo";
  }, []);
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoArea}>
          <span style={styles.logo}>ALDI SÜD</span>
          <span style={styles.subtitle}>Supply Chain Simulation</span>
        </div>
        <p style={styles.description}>
          Select an application to explore the simulated buyer workspace.
        </p>
      </header>
      <main style={styles.grid}>
        {apps.map((app) => (
          <Link key={app.path} to={app.path} style={styles.card}>
            <div
              style={{ ...styles.cardIcon, backgroundColor: app.color + "14" }}
            >
              <span style={styles.iconEmoji}>{app.icon}</span>
            </div>
            <h2 style={styles.cardTitle}>{app.title}</h2>
            <p style={styles.cardDescription}>{app.description}</p>
            <div style={{ ...styles.cardAccent, backgroundColor: app.color }} />
          </Link>
        ))}
      </main>
      <footer style={styles.footer}>
        <span>ALDI SÜD Supply Chain Demo · Amazon Quick Integration</span>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: "#f5f7fa",
  },
  header: {
    textAlign: "center",
    padding: "48px 24px 32px",
  },
  logoArea: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  logo: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#00205c",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "18px",
    fontWeight: 400,
    color: "#5f6368",
  },
  description: {
    fontSize: "15px",
    color: "#5f6368",
    maxWidth: "480px",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    padding: "0 48px 48px",
    maxWidth: "1100px",
    margin: "0 auto",
    width: "100%",
  },
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    padding: "28px 24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    textDecoration: "none",
    color: "inherit",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    overflow: "hidden",
    cursor: "pointer",
  },
  cardIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  iconEmoji: {
    fontSize: "24px",
  },
  cardTitle: {
    fontSize: "17px",
    fontWeight: 600,
    color: "#1a1a1a",
    margin: "0 0 8px",
  },
  cardDescription: {
    fontSize: "14px",
    color: "#5f6368",
    margin: 0,
    lineHeight: 1.5,
    flex: 1,
  },
  cardAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "3px",
  },
  footer: {
    padding: "16px 24px",
    textAlign: "center",
    fontSize: "12px",
    color: "#9aa0a6",
    marginTop: "auto",
  },
};

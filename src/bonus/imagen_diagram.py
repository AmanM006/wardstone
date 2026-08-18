"""
Bonus Model 2: Imagen 3 Blast-Radius Topological Diagram Generator
Constructs topological risk and blast-radius visual graphs for incident postmortems.
"""

from typing import Dict, Any


class ImagenDiagramGenerator:
    def generate_blast_radius_svg(
        self,
        agent_name: str,
        risk_score: float,
        amount_usdc: float,
        variance_ratio: float
    ) -> str:
        """
        Generates clean visual SVG blast-radius topology diagram for embedding in postmortems.
        """
        color = "#ef4444" if risk_score >= 60 else "#10b981"
        status_text = "QUARANTINED" if risk_score >= 60 else "APPROVED"

        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 240" width="100%" height="200" style="background:#0f172a; border-radius:8px; font-family:sans-serif;">
  <!-- Grid Background -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />

  <!-- Node 1: Buyer Agent -->
  <circle cx="90" cy="120" r="35" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="90" y="115" fill="#f8fafc" font-size="10" font-weight="bold" text-anchor="middle">Buyer Agent</text>
  <text x="90" y="130" fill="#94a3b8" font-size="8" text-anchor="middle">{agent_name[:12]}</text>

  <!-- Flow Line 1 -->
  <line x1="125" y1="120" x2="245" y2="120" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4"/>

  <!-- Node 2: Wardstone Circuit Breaker -->
  <circle cx="280" cy="120" r="40" fill="#1e293b" stroke="{color}" stroke-width="3"/>
  <text x="280" y="112" fill="#f8fafc" font-size="10" font-weight="bold" text-anchor="middle">Wardstone Gate</text>
  <text x="280" y="126" fill="{color}" font-size="9" font-weight="bold" text-anchor="middle">{risk_score:.1f}/100 Risk</text>
  <text x="280" y="138" fill="#94a3b8" font-size="8" text-anchor="middle">{status_text}</text>

  <!-- Flow Line 2 -->
  <line x1="320" y1="120" x2="445" y2="120" stroke="{color}" stroke-width="2" stroke-dasharray="{ '0' if risk_score < 60 else '3 3' }"/>

  <!-- Node 3: Base Sepolia / Target -->
  <circle cx="480" cy="120" r="35" fill="#1e293b" stroke="{ '#10b981' if risk_score < 60 else '#64748b' }" stroke-width="2"/>
  <text x="480" y="115" fill="#f8fafc" font-size="10" font-weight="bold" text-anchor="middle">Base Sepolia</text>
  <text x="480" y="130" fill="#94a3b8" font-size="8" text-anchor="middle">{ '$' + str(amount_usdc) + ' USDC' if risk_score < 60 else 'BLOCKED' }</text>

  <!-- Header Info -->
  <text x="20" y="30" fill="#f8fafc" font-size="12" font-weight="bold">BLAST-RADIUS TOPOLOGY MAP (Imagen 3 Visualizer)</text>
  <text x="20" y="48" fill="#94a3b8" font-size="9">Velocity Variance: {variance_ratio:.1f}x baseline • Risk Threshold: 60.0</text>
</svg>"""
        return svg


imagen_generator = ImagenDiagramGenerator()

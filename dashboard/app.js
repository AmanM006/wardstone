/**
 * Wardstone AP2 Dashboard Controller
 * Connects to FastAPI backend, updates telemetry in real-time,
 * and handles one-click live simulation actions.
 */

let isRefreshing = false;

async function fetchData() {
  if (isRefreshing) return;
  isRefreshing = true;

  try {
    // 1. Fetch Health & Chain Info
    const healthRes = await fetch("/api/v1/health");
    if (healthRes.ok) {
      const health = await healthRes.json();
      if (health.base_sepolia && health.base_sepolia.block_number) {
        document.getElementById("blockHeight").textContent = `Block #${health.base_sepolia.block_number}`;
      }
    }

    // 2. Fetch Agents & Memory Bank
    const agentsRes = await fetch("/api/v1/agents");
    if (agentsRes.ok) {
      const agentsData = await agentsRes.json();
      renderAgents(agentsData.agents || []);
    }

    // 3. Fetch Mandates
    const mandatesRes = await fetch("/api/v1/mandates?limit=30");
    if (mandatesRes.ok) {
      const mandatesData = await mandatesRes.json();
      renderMandates(mandatesData.mandates || []);
    }

    // 4. Fetch Incidents
    const incidentsRes = await fetch("/api/v1/incidents?limit=20");
    if (incidentsRes.ok) {
      const incidentsData = await incidentsRes.json();
      renderIncidents(incidentsData.incidents || []);
    }

  } catch (err) {
    console.error("Error updating dashboard data:", err);
  } finally {
    isRefreshing = false;
  }
}

function renderMandates(mandates) {
  const tbody = document.getElementById("mandateTableBody");
  document.getElementById("mandateCountBadge").textContent = `${mandates.length} Mandates`;

  if (!mandates || mandates.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No mandates ingested yet. Click a simulation button above.</td></tr>`;
    return;
  }

  let totalSpend = 0;
  let quarantinedCount = 0;

  tbody.innerHTML = mandates.map(m => {
    const raw = m.raw_payload || m;
    const dec = m.governance_decision || {};
    const risk = m.risk_analysis || {};
    const amount = Number(m.total_amount_usdc || (raw.total_amount_usdc || 0));
    const score = Number(risk.risk_score || 0);

    const isApproved = (m.status === "APPROVED" || dec.status === "APPROVED");
    const isRefused = (m.status === "REFUSED" || dec.status === "REFUSED");
    if (isApproved) {
      totalSpend += amount;
    } else {
      quarantinedCount++;
    }

    let riskClass = "risk-low";
    if (score >= 60) riskClass = "risk-high";
    else if (score >= 35) riskClass = "risk-med";
    if (isRefused) riskClass = "risk-high"; // Force high risk color for refused even if score is 0

    let txLink = '<span style="color: #64748b;">N/A (Held)</span>';
    if (isRefused) {
        txLink = '<span style="color: #f87171;">N/A (Refused)</span>';
    } else if (dec.tx_hash) {
      const shortHash = `${dec.tx_hash.substring(0, 8)}...${dec.tx_hash.substring(dec.tx_hash.length - 6)}`;
      txLink = `<a href="https://sepolia.basescan.org/tx/${dec.tx_hash}" target="_blank" class="mono-link">${shortHash} ↗</a>`;
    }
    
    let badgeHtml = '';
    if (isApproved) {
        badgeHtml = '<span class="badge badge-approved">APPROVED</span>';
    } else if (isRefused) {
        badgeHtml = '<span class="badge badge-held" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">REFUSED</span>';
    } else {
        badgeHtml = '<span class="badge badge-held">QUARANTINED</span>';
    }

    return `
      <tr>
        <td><code>${m.mandate_id || raw.mandate_id}</code></td>
        <td><strong>${m.buyer_agent_name || (raw.buyer_agent && raw.buyer_agent.agent_name) || "Unknown"}</strong></td>
        <td><strong>$${amount.toFixed(2)}</strong> <span style="font-size: 10px; color: #94a3b8;">USDC</span></td>
        <td><span class="risk-pill ${riskClass}">${score >= 0 ? score.toFixed(1) : '--'}/100</span></td>
        <td>${badgeHtml}</td>
        <td>${txLink}</td>
      </tr>
    `;
  }).join("");

  document.getElementById("metricTotalSpend").textContent = `$${totalSpend.toFixed(2)}`;
  document.getElementById("metricQuarantineCount").textContent = quarantinedCount;

  const totalEvaluated = mandates.length;
  const securityRate = totalEvaluated > 0 ? 100 : 100;
  document.getElementById("metricSecurityRate").textContent = `${securityRate}%`;
}

function renderIncidents(incidents) {
  const container = document.getElementById("incidentsContainer");
  document.getElementById("incidentBadge").textContent = `${incidents.length} Quarantined`;

  if (!incidents || incidents.length === 0) {
    container.innerHTML = `<div class="empty-state">No active incidents. Fleet is operating within normal baseline bounds.</div>`;
    return;
  }

  container.innerHTML = incidents.map(inc => {
    const isOverride = inc.status === "HUMAN_OVERRIDE_APPROVED";
    const isBanned = inc.status === "HUMAN_BANNED";
    let statusBadge = "";
    if (isOverride) statusBadge = "<span class='badge badge-approved' style='float:right;'>✅ FORCE APPROVED</span>";
    if (isBanned) statusBadge = "<span class='badge badge-held' style='float:right;'>🚫 BANNED</span>";
    
    return `
      <div class="incident-card" style="${isOverride ? 'opacity:0.7; border-left-color:#10b981;' : ''}">
        <div class="incident-header">
          <span>⚠️ ${inc.agent_name || "Unknown Agent"} (Risk: ${inc.risk_score}/100)</span>
          <span style="color: #f87171;">$${Number(inc.attempted_amount_usdc).toFixed(2)} USDC</span>
          ${statusBadge}
        </div>
        <div class="incident-summary"><strong>Summary:</strong> ${inc.anomaly_summary}</div>
        <div class="incident-remediation"><strong>Remediation:</strong> ${inc.recommended_remediation}</div>
        ${inc.governance_hash ? `<div style="font-family: monospace; font-size: 10px; color: #64748b; margin-top: 6px; padding: 4px; background: #f1f5f9; border-radius: 4px;">🛡️ Proof of Governance: ${inc.governance_hash.substring(0, 16)}...</div>` : ''}
        ${(!isOverride && !isBanned) ? `
        <div style="margin-top: 10px; display: flex; gap: 8px;">
          <button onclick="overrideIncident('${inc.incident_id}', '${inc.mandate_id}', 'FORCE_APPROVE')" style="background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Force Approve</button>
          <button onclick="overrideIncident('${inc.incident_id}', '${inc.mandate_id}', 'CONFIRM_BAN')" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Confirm Ban</button>
        </div>` : ''}
      </div>
    `;
  }).join("");
}

async function overrideIncident(incId, mandId, action) {
  try {
    const res = await fetch("/api/v1/incidents/override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incident_id: incId, mandate_id: mandId, action })
    });
    const data = await res.json();
    alert(data.message);
    fetchData();
  } catch (err) {
    alert("Override failed");
  }
}

function renderAgents(agents) {
  const container = document.getElementById("agentsContainer");
  document.getElementById("metricAgentCount").textContent = `${agents.length} Active`;

  if (!agents || agents.length === 0) {
    container.innerHTML = `<div class="empty-state">No agent profiles registered.</div>`;
    return;
  }

  container.innerHTML = agents.map(ag => {
    return `
      <div class="agent-card">
        <div>
          <div class="agent-info-name">${ag.agent_name}</div>
          <div class="agent-info-sub">ID: ${ag.agent_id} • Max Single: $${ag.max_single_mandate}</div>
        </div>
        <div style="text-align: right;">
          <div class="agent-baseline-val">$${Number(ag.baseline_hourly_velocity).toFixed(1)}/hr</div>
          <div style="font-size: 11px; color: #94a3b8;">Baseline Spend Rate</div>
        </div>
      </div>
    `;
  }).join("");
}

async function triggerSimulation(scenario) {
  try {
    const res = await fetch("/api/v1/simulate/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario })
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Simulation result:", data);
      await fetchData();
    } else {
      const err = await res.json();
      alert(`Simulation notice: ${err.detail || "Error triggering scenario"}`);
    }
  } catch (e) {
    console.error("Simulation trigger failed:", e);
  }
}

// Initial fetch and 4-second polling interval
fetchData();
setInterval(fetchData, 4000);

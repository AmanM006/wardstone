# Known Issues

This document tracks known issues, technical debt, and historical bugs found during the development and testing of Wardstone AP2.

## 1. Chain Mismatch
- **Description:** Early development involved a mismatch where the settlement layer was targeted at Base Sepolia, while some documentation or config referenced Ethereum Sepolia. 
- **Status:** Resolved. The system exclusively targets Base Sepolia (Chain ID 84532) for x402 settlement.

## 2. Threshold Bug
- **Description:** Gatekeeper's threshold logic previously allowed some high-risk scores to slip through due to a `>=` vs `>` comparison bug.
- **Status:** Resolved. The circuit breaker firmly trips on `score >= threshold_hold`.

## 3. Firestore ADC Fallback
- **Description:** Local development environments without `GOOGLE_APPLICATION_CREDENTIALS` configured caused the Firestore client to throw a warning and silently fall back to an in-memory dictionary.
- **Status:** Resolved. Users must run `gcloud auth application-default login` to generate the correct credentials for local testing against live GCP resources. The resilient fallback remains active as a safety net.

## 4. Mandate-Counter Regression
- **Description:** A regression occurred where the new `REFUSED` outcomes were not tracked correctly in the persistent fleet telemetry, breaking the ledger closure invariant (`total_mandates_processed == total_settled + total_held + total_refused`).
- **Status:** Resolved. Telemetry now properly tracks `lifetime_settled_count` and `lifetime_refused_count` alongside the existing quarantine counters.

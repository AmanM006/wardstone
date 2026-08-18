"""
OpenTelemetry Tracing Configuration for Wardstone AP2
Instruments Multi-Agent Nexus span hops for end-to-end distributed tracing.
"""

from typing import Dict, Any, Optional
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter
from opentelemetry.sdk.resources import Resource

# Initialize Tracer Provider
resource = Resource.create(attributes={
    "service.name": "wardstone-ap2-fleet",
    "service.version": "1.0.1",
    "deployment.environment": "production"
})

provider = TracerProvider(resource=resource)
# Console exporter for logging + Cloud Trace integration
provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("wardstone.orchestrator", "1.0.1")


def trace_agent_span(agent_name: str, mandate_id: str, attributes: Optional[Dict[str, Any]] = None):
    """
    Creates an OpenTelemetry span for an agent execution step.
    """
    attrs = {
        "agent.name": agent_name,
        "ap2.mandate_id": mandate_id
    }
    if attributes:
        attrs.update(attributes)
    return tracer.start_as_current_span(f"agent.{agent_name.lower()}", attributes=attrs)

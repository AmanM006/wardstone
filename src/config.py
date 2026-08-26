"""
Wardstone AP2 Configuration Module
Loads environment variables and sets defaults for GCP, Base Sepolia, and Circuit Breaker policies.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
import os
from typing import Optional


class Settings(BaseSettings):
    # Google Cloud Configuration
    google_cloud_project: str = Field(default="wardstone-ap2-dev", alias="GOOGLE_CLOUD_PROJECT")
    google_application_credentials: Optional[str] = Field(default=None, alias="GOOGLE_APPLICATION_CREDENTIALS")
    gemini_api_key: Optional[str] = Field(default=None, alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-2.5-flash", alias="GEMINI_MODEL")

    # Pub/Sub Topics
    pubsub_topic_mandates: str = Field(default="mandate-events", alias="PUBSUB_TOPIC_MANDATES")
    pubsub_subscription_mandates: str = Field(default="mandate-events-sub", alias="PUBSUB_SUBSCRIPTION_MANDATES")

    # Firestore Database
    firestore_database: str = Field(default="(default)", alias="FIRESTORE_DATABASE")

    # Base Sepolia / x402 Blockchain Settings
    base_sepolia_rpc_url: str = Field(default="https://sepolia.base.org", alias="BASE_SEPOLIA_RPC_URL")
    settlement_private_key: Optional[str] = Field(default=None, alias="SETTLEMENT_PRIVATE_KEY")
    usdc_token_address: str = Field(
        default="0x036CbD53842c5426634e7929541eC2318f3dCF7e", # Base Sepolia Test USDC
        alias="USDC_TOKEN_ADDRESS"
    )

    # Wardstone Circuit Breaker Policy
    risk_threshold_hold: float = Field(default=60.0, alias="RISK_THRESHOLD_HOLD") # Score >= 60 triggers HOLD
    max_velocity_per_hour: float = Field(default=500.0, alias="MAX_VELOCITY_PER_HOUR") # USDC max velocity
    circuit_breaker_mode: str = Field(default="enforce", alias="CIRCUIT_BREAKER_MODE") # enforce | monitor

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }


settings = Settings()

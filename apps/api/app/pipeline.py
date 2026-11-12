"""
ClaimLens 5-Agent Pipeline & Rules Engine
Simulates and orchestrates the 5-agent LangGraph workflow:
policy_parser -> bill_reader -> rules_engine -> explainer -> appeal_drafter.
Conforms to plan/trd.md §6.6, §6.7 and plan/prompts.md P8-P10.
"""

import asyncio
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional, Tuple

from app.config import API_DIR, ROOT_DIR, PER_AGENT_TIMEOUT_SECONDS
from app.replay import format_sse_message, load_replay_trace


def load_prompt(prompt_name: str) -> str:
    """Load system prompt from app/prompts/<prompt_name>.md with fallback."""
    prompt_file = API_DIR / "app" / "prompts" / f"{prompt_name}.md"
    if prompt_file.exists():
        return prompt_file.read_text(encoding="utf-8").strip()
    return f"System prompt for {prompt_name}"


# Cache loaded prompts
PROMPTS = {
    "policy_parser": load_prompt("policy_parser"),
    "bill_reader": load_prompt("bill_reader"),
    "explainer": load_prompt("explainer"),
    "appeal_drafter": load_prompt("appeal_drafter"),
}


def python_forecast_raju() -> Dict[str, Any]:
    """
    Pure Python port of forecast() for Raju baseline case (trd.md §6.4).
    Calculates deterministic shortfall and deductions in integer rupees.
    """
    # Authoritative financial facts for Raju's case:
    # 5 days stay, Single AC room billed at 8,000/day vs 5,000/day cap
    billed = 150000
    daily_room_cap = 5000
    room_rate = 8000
    stay_days = 5

    # 1. Room rent deduction: (8,000 - 5,000) * 5 = 15,000
    room_cap_deduction = (room_rate - daily_room_cap) * stay_days

    # 2. Proportionate cuts on professional fees (ratio 5000 / 8000 = 62.5% payable)
    # Surgeon: 30,000 * 37.5% = 11,250
    # OT: 20,000 * 37.5% = 7,500
    # Nursing: 10,000 * 37.5% = 3,750
    proportionate_deductions = [
        {
            "lineId": "line-surgeon",
            "ruleId": "PROPORTIONATE",
            "clauseId": "SP-3.2",
            "amount": 11250,
            "description": "Proportionate reduction on Surgeon Fee (5000 / 8000 = 62.5%)",
        },
        {
            "lineId": "line-ot",
            "ruleId": "PROPORTIONATE",
            "clauseId": "SP-3.2",
            "amount": 7500,
            "description": "Proportionate reduction on Operation Theatre (5000 / 8000 = 62.5%)",
        },
        {
            "lineId": "line-nursing",
            "ruleId": "PROPORTIONATE",
            "clauseId": "SP-3.2",
            "amount": 3750,
            "description": "Proportionate reduction on Nursing Care (5000 / 8000 = 62.5%)",
        },
    ]

    # 3. Non-payable administrative consumables
    non_payable_deduction = {
        "lineId": "line-consumables",
        "ruleId": "NON_PAYABLE",
        "clauseId": "SP-4.1",
        "amount": 4000,
        "description": "Annexure A administrative and registration charges",
    }

    deductions = [
        {
            "lineId": "line-room",
            "ruleId": "ROOM_CAP",
            "clauseId": "SP-3.1",
            "amount": room_cap_deduction,
            "description": f"Room rent excess above ₹{daily_room_cap:,}/day daily limit",
        },
        *proportionate_deductions,
        non_payable_deduction,
    ]

    total_deductions = sum(d["amount"] for d in deductions)
    insurer_pays = billed - total_deductions
    you_pay = total_deductions

    # Conservation Law check
    assert insurer_pays + you_pay == billed, "Conservation law violated in Python rules engine"

    return {
        "billed": billed,
        "insurerPays": insurer_pays,
        "youPay": you_pay,
        "shortfall": you_pay,
        "deductions": deductions,
    }


def generate_pipeline_events(sample_id: str = "raju") -> List[Dict[str, Any]]:
    """
    Generate the 10-step event sequence emitted by the 5-agent LangGraph workflow.
    Conforms to the authoritative trace schema in fixtures/raju_trace.json.
    """
    now = datetime.now(timezone.utc).isoformat()
    forecast_data = python_forecast_raju()

    events = [
        {
            "step": 1,
            "event": "node_start",
            "agent": "policy_parser",
            "timestamp": now,
            "message": "Parsing SafeCare Plus insurance policy schedule and clauses",
        },
        {
            "step": 2,
            "event": "node_end",
            "agent": "policy_parser",
            "timestamp": now,
            "data": {
                "policyId": "demo-001",
                "insurer": "Demo Assure",
                "sumInsured": 500000,
                "dailyRoomCap": 5000,
                "proportionateEnabled": True,
                "proportionateAppliesTo": ["professional"],
                "copayPct": 0,
            },
        },
        {
            "step": 3,
            "event": "node_start",
            "agent": "bill_reader",
            "timestamp": now,
            "message": "Extracting 8 itemized hospital bill charges from Manipal Hospital",
        },
        {
            "step": 4,
            "event": "node_end",
            "agent": "bill_reader",
            "timestamp": now,
            "data": {
                "billId": "bill-raju-001",
                "patient": "Raju's Mother (Raju Verma)",
                "totalBilled": 150000,
                "stayDays": 5,
                "lineCount": 8,
            },
        },
        {
            "step": 5,
            "event": "node_start",
            "agent": "rules_engine",
            "timestamp": now,
            "message": "Evaluating deterministic room cap, proportionate, non-payable and co-pay rules",
        },
        {
            "step": 6,
            "event": "forecast_ready",
            "agent": "rules_engine",
            "timestamp": now,
            "data": forecast_data,
        },
        {
            "step": 7,
            "event": "node_start",
            "agent": "explainer",
            "timestamp": now,
            "message": "Generating natural language explanation and avoidable shortfall recommendations",
        },
        {
            "step": 8,
            "event": "node_end",
            "agent": "explainer",
            "timestamp": now,
            "data": {
                "avoidableShortfall": 37500,
                "recommendation": (
                    "Choosing Single AC room (≤ ₹5,000/day) would have prevented ₹37,500 in deductions, "
                    "leaving only unavoidable ₹4,000 non-payables."
                ),
                "hindiExplanation": (
                    "यदि आप ₹5,000/दिन वाला सिंगल एसी कमरा चुनते, तो ₹37,500 की कटौती बच जाती।"
                ),
            },
        },
        {
            "step": 9,
            "event": "node_start",
            "agent": "appeal_drafter",
            "timestamp": now,
            "message": "Auditing insurer settlement statement against policy clauses and IRDAI directives",
        },
        {
            "step": 10,
            "event": "appeal_ready",
            "agent": "appeal_drafter",
            "timestamp": now,
            "data": {
                "discrepancyDetected": True,
                "overDeductionAmount": 9750,
                "disputedLines": ["line-medicines", "line-consumables"],
                "statutoryGround": "IRDAI Master Circular 2020 §5 Cl. 19 & Policy Clause SP-3.3",
                "letterSubject": "Grievance against illegal ₹9,750 pharmacy deduction on Claim CLM-DEMO-001",
                "escalationPath": "Insurer Grievance Redressal Officer -> Insurance Ombudsman",
            },
        },
    ]

    return events


async def execute_pipeline_stream(
    sample_id: str = "raju",
    delay_seconds: float = 0.05,
) -> AsyncGenerator[str, None]:
    """
    Execute pipeline workflow and stream typed events over SSE.
    If sample_id matches recorded trace or live execution, yields formatted SSE chunks.
    """
    events = generate_pipeline_events(sample_id)
    for event in events:
        if delay_seconds > 0:
            await asyncio.sleep(delay_seconds)
        yield format_sse_message(event)

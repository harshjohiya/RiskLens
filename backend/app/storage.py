"""Simple SQLite storage for history and audit logs."""
import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
import logging

from .config import DB_PATH

logger = logging.getLogger(__name__)


def init_database():
    """Initialize SQLite database."""
    db_path = DB_PATH
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scoring_history (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        input_data TEXT NOT NULL,
        prediction_data TEXT NOT NULL,
        model_used TEXT NOT NULL,
        risk_band TEXT NOT NULL,
        decision TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()
    logger.info(f"Database initialized at {db_path}")


def store_prediction(
    applicant_input: Dict[str, Any],
    prediction: Dict[str, Any],
    model_used: str,
) -> str:
    """
    Store a prediction in history.
    
    Returns the record ID.
    """
    record_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT INTO scoring_history 
    (id, timestamp, input_data, prediction_data, model_used, risk_band, decision)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        record_id,
        timestamp,
        json.dumps(applicant_input),
        json.dumps(prediction),
        model_used,
        prediction['risk_band'],
        prediction['decision'],
    ))
    
    conn.commit()
    conn.close()
    
    logger.info(f"Stored prediction {record_id}")
    return record_id


def get_history(
    page: int = 1,
    page_size: int = 20,
    risk_band: Optional[str] = None,
    decision: Optional[str] = None,
) -> tuple[List[Dict], int]:
    """
    Retrieve paginated history with optional filters.
    
    Returns:
        (records, total_count)
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Build query
    where_clauses = []
    params = []
    
    if risk_band:
        where_clauses.append("risk_band = ?")
        params.append(risk_band)
    
    if decision:
        where_clauses.append("decision = ?")
        params.append(decision)
    
    where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""
    
    # Count total
    count_query = f"SELECT COUNT(*) as count FROM scoring_history {where_sql}"
    cursor.execute(count_query, params)
    total = cursor.fetchone()['count']
    
    # Get paginated results
    offset = (page - 1) * page_size
    query = f"""
    SELECT * FROM scoring_history 
    {where_sql}
    ORDER BY timestamp DESC
    LIMIT ? OFFSET ?
    """
    params.extend([page_size, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    records = []
    for row in rows:
        records.append({
            'id': row['id'],
            'timestamp': row['timestamp'],
            'applicant_data': json.loads(row['input_data']),
            'prediction': json.loads(row['prediction_data']),
            'model_used': row['model_used'],
        })
    
    conn.close()
    return records, total


def get_portfolio_stats() -> Dict[str, Any]:
    """Get portfolio statistics from history."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Total applications
    cursor.execute("SELECT COUNT(*) as count FROM scoring_history")
    total = cursor.fetchone()[0]
    
    if total == 0:
        conn.close()
        return {
            'total_applications': 0,
            'approval_rate': 0.0,
            'average_pd': 0.0,
            'total_expected_loss': 0.0,
            'risk_band_distribution': [
                {'risk_band': 'A', 'count': 0, 'percentage': 0.0},
                {'risk_band': 'B', 'count': 0, 'percentage': 0.0},
                {'risk_band': 'C', 'count': 0, 'percentage': 0.0},
                {'risk_band': 'D', 'count': 0, 'percentage': 0.0},
            ],
            'expected_loss_by_band': [
                {'risk_band': 'A', 'total_loss': 0.0},
                {'risk_band': 'B', 'total_loss': 0.0},
                {'risk_band': 'C', 'total_loss': 0.0},
                {'risk_band': 'D', 'total_loss': 0.0},
            ],
        }
    
    # Approval rate
    cursor.execute("""
    SELECT COUNT(*) as count 
    FROM scoring_history 
    WHERE decision = 'Approve'
    """)
    approvals = cursor.fetchone()[0]
    approval_rate = approvals / total if total > 0 else 0
    
    # Average PD and total EL
    cursor.execute("""
    SELECT 
        AVG(CAST(json_extract(prediction_data, '$.pd') AS FLOAT)) as avg_pd,
        SUM(CAST(json_extract(prediction_data, '$.expected_loss') AS FLOAT)) as total_el
    FROM scoring_history
    """)
    row = cursor.fetchone()
    avg_pd = row[0] or 0
    total_el = row[1] or 0
    
    # Risk band distribution with percentages
    cursor.execute("""
    SELECT risk_band, COUNT(*) as count
    FROM scoring_history
    GROUP BY risk_band
    """)
    dist_rows = cursor.fetchall()
    
    # Create distribution array
    risk_band_distribution = []
    for band in ['A', 'B', 'C', 'D']:
        count = 0
        for row_band, row_count in dist_rows:
            if row_band == band:
                count = row_count
                break
        percentage = (count / total * 100) if total > 0 else 0
        risk_band_distribution.append({
            'risk_band': band,
            'count': count,
            'percentage': round(percentage, 2)
        })
    
    # Expected loss by band
    cursor.execute("""
    SELECT 
        risk_band,
        SUM(CAST(json_extract(prediction_data, '$.expected_loss') AS FLOAT)) as total_loss
    FROM scoring_history
    GROUP BY risk_band
    """)
    el_rows = cursor.fetchall()
    
    expected_loss_by_band = []
    for band in ['A', 'B', 'C', 'D']:
        total_loss = 0.0
        for row_band, row_loss in el_rows:
            if row_band == band:
                total_loss = row_loss or 0.0
                break
        expected_loss_by_band.append({
            'risk_band': band,
            'total_loss': round(total_loss, 2)
        })
    
    conn.close()
    
    return {
        'total_applications': total,
        'approval_rate': round(approval_rate, 3),
        'average_pd': round(avg_pd, 3),
        'total_expected_loss': round(total_el, 2),
        'risk_band_distribution': risk_band_distribution,
        'expected_loss_by_band': expected_loss_by_band,
    }


def clear_history():
    """Clear all history (for testing)."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scoring_history")
    conn.commit()
    conn.close()
    logger.info("History cleared")

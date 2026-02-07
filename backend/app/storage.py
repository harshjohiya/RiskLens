"""Simple SQLite storage for history and audit logs with user isolation."""
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
    """Initialize SQLite database with user isolation."""
    db_path = DB_PATH
    db_path.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)
    """)
    
    # Create history table with user_id
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scoring_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        input_data TEXT NOT NULL,
        prediction_data TEXT NOT NULL,
        model_used TEXT NOT NULL,
        risk_band TEXT NOT NULL,
        decision TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    
    # Create index on user_id for faster queries
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_user_id ON scoring_history(user_id)
    """)
    
    # Create batch jobs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS batch_jobs (
        job_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        model_type TEXT NOT NULL,
        status TEXT NOT NULL,
        total_records INTEGER,
        successful_records INTEGER,
        failed_records INTEGER,
        result_file TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_batch_user_id ON batch_jobs(user_id)
    """)
    
    conn.commit()
    conn.close()
    logger.info(f"Database initialized at {db_path}")


def store_prediction(
    applicant_input: Dict[str, Any],
    prediction: Dict[str, Any],
    model_used: str,
    user_id: str,
) -> str:
    """
    Store a prediction in history.
    
    Args:
        applicant_input: Input data
        prediction: Prediction results
        model_used: Model type used
        user_id: ID of the user who created this prediction
    
    Returns:
        The record ID.
    """
    record_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT INTO scoring_history 
    (id, user_id, timestamp, input_data, prediction_data, model_used, risk_band, decision)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record_id,
        user_id,
        timestamp,
        json.dumps(applicant_input),
        json.dumps(prediction),
        model_used,
        prediction['risk_band'],
        prediction['decision'],
    ))
    
    conn.commit()
    conn.close()
    
    logger.info(f"Stored prediction {record_id} for user {user_id}")
    return record_id


def get_history(
    user_id: str,
    page: int = 1,
    page_size: int = 20,
    risk_band: Optional[str] = None,
    decision: Optional[str] = None,
) -> tuple[List[Dict], int]:
    """
    Retrieve paginated history with optional filters.
    
    ONLY returns records belonging to the specified user_id.
    
    Args:
        user_id: Filter to this user's records only
        page: Page number (1-indexed)
        page_size: Records per page
        risk_band: Optional risk band filter
        decision: Optional decision filter
    
    Returns:
        (records, total_count)
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Build query - ALWAYS filter by user_id
    where_clauses = ["user_id = ?"]
    params = [user_id]
    
    if risk_band:
        where_clauses.append("risk_band = ?")
        params.append(risk_band)
    
    if decision:
        where_clauses.append("decision = ?")
        params.append(decision)
    
    where_sql = "WHERE " + " AND ".join(where_clauses)
    
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


def get_portfolio_stats(user_id: str) -> Dict[str, Any]:
    """
    Get portfolio statistics from history for a specific user.
    
    ONLY includes records belonging to the specified user_id.
    
    Args:
        user_id: Filter to this user's records only
        
    Returns:
        Portfolio statistics dictionary
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Total applications for this user
    cursor.execute("SELECT COUNT(*) as count FROM scoring_history WHERE user_id = ?", (user_id,))
    total = cursor.fetchone()[0]
    
    if total == 0:
        conn.close()
        return {
            'total_applications': 0,
            'approval_rate': 0.0,
            'average_pd': 0.0,
            'total_expected_loss': 0.0,
            'risk_band_distribution': [
                {'band': 'A', 'count': 0, 'percentage': 0.0},
                {'band': 'B', 'count': 0, 'percentage': 0.0},
                {'band': 'C', 'count': 0, 'percentage': 0.0},
                {'band': 'D', 'count': 0, 'percentage': 0.0},
            ],
            'expected_loss_by_band': [
                {'band': 'A', 'expected_loss': 0.0},
                {'band': 'B', 'expected_loss': 0.0},
                {'band': 'C', 'expected_loss': 0.0},
                {'band': 'D', 'expected_loss': 0.0},
            ],
        }
    
    # Approval rate
    cursor.execute("""
    SELECT COUNT(*) as count 
    FROM scoring_history 
    WHERE user_id = ? AND decision = 'Approve'
    """, (user_id,))
    approvals = cursor.fetchone()[0]
    approval_rate = approvals / total if total > 0 else 0
    
    # Average PD and total EL
    cursor.execute("""
    SELECT 
        AVG(CAST(json_extract(prediction_data, '$.pd') AS FLOAT)) as avg_pd,
        SUM(CAST(json_extract(prediction_data, '$.expected_loss') AS FLOAT)) as total_el
    FROM scoring_history
    WHERE user_id = ?
    """, (user_id,))
    row = cursor.fetchone()
    avg_pd = row[0] or 0
    total_el = row[1] or 0
    
    # Risk band distribution with percentages
    cursor.execute("""
    SELECT risk_band, COUNT(*) as count
    FROM scoring_history
    WHERE user_id = ?
    GROUP BY risk_band
    """, (user_id,))
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
            'band': band,
            'count': count,
            'percentage': round(percentage, 2)
        })
    
    # Expected loss by band
    cursor.execute("""
    SELECT 
        risk_band,
        SUM(CAST(json_extract(prediction_data, '$.expected_loss') AS FLOAT)) as total_loss
    FROM scoring_history
    WHERE user_id = ?
    GROUP BY risk_band
    """, (user_id,))
    el_rows = cursor.fetchall()
    
    expected_loss_by_band = []
    for band in ['A', 'B', 'C', 'D']:
        total_loss = 0.0
        for row_band, row_loss in el_rows:
            if row_band == band:
                total_loss = row_loss or 0.0
                break
        expected_loss_by_band.append({
            'band': band,
            'expected_loss': round(total_loss, 2)
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


def store_batch_job(
    user_id: str,
    job_id: str,
    filename: str,
    model_type: str,
    total_records: int,
    successful_records: int,
    failed_records: int,
    result_file: str,
) -> None:
    """Store batch job information."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT INTO batch_jobs 
    (job_id, user_id, filename, model_type, status, total_records, 
     successful_records, failed_records, result_file, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        job_id,
        user_id,
        filename,
        model_type,
        'completed',
        total_records,
        successful_records,
        failed_records,
        result_file,
        datetime.utcnow().isoformat(),
    ))
    
    conn.commit()
    conn.close()
    logger.info(f"Stored batch job {job_id} for user {user_id}")


def get_batch_job(job_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get batch job by ID.
    
    Returns None if job doesn't exist or doesn't belong to user.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT * FROM batch_jobs 
    WHERE job_id = ? AND user_id = ?
    """, (job_id, user_id))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    return dict(row)


def get_prediction_by_id(application_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single prediction by ID.
    
    Returns None if record doesn't exist or doesn't belong to user.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT * FROM scoring_history 
    WHERE id = ? AND user_id = ?
    """, (application_id, user_id))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    return {
        'id': row['id'],
        'timestamp': row['timestamp'],
        'applicant_data': json.loads(row['input_data']),
        'prediction': json.loads(row['prediction_data']),
        'model_used': row['model_used'],
    }


def clear_history():
    """Clear all history (for testing)."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scoring_history")
    cursor.execute("DELETE FROM batch_jobs")
    conn.commit()
    conn.close()
    logger.info("History cleared")


# ==================== USER MANAGEMENT ====================


def create_user(email: str, password_hash: str, name: str) -> str:
    """
    Create a new user account.
    
    Args:
        email: User's email address (must be unique)
        password_hash: Hashed password
        name: User's display name
    
    Returns:
        User ID
    
    Raises:
        sqlite3.IntegrityError: If email already exists
    """
    user_id = str(uuid.uuid4())
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT INTO users (id, email, password_hash, name)
    VALUES (?, ?, ?, ?)
    """, (user_id, email.lower(), password_hash, name))
    
    conn.commit()
    conn.close()
    
    logger.info(f"Created user: {email}")
    return user_id


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """
    Get user by email address.
    
    Args:
        email: User's email
    
    Returns:
        User dict with id, email, password_hash, name, created_at or None
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT id, email, password_hash, name, created_at 
    FROM users 
    WHERE email = ?
    """, (email.lower(),))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    return {
        'id': row['id'],
        'email': row['email'],
        'password_hash': row['password_hash'],
        'name': row['name'],
        'created_at': row['created_at'],
    }


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get user by ID.
    
    Args:
        user_id: User's unique ID
    
    Returns:
        User dict with id, email, name, created_at (without password_hash) or None
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT id, email, name, created_at 
    FROM users 
    WHERE id = ?
    """, (user_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    return {
        'id': row['id'],
        'email': row['email'],
        'name': row['name'],
        'created_at': row['created_at'],
    }


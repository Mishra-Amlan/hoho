from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.models import Audit, AuditItem, Property, User
from app.schemas.schemas import (
    AuditResponse, AuditCreate, AuditUpdate,
    AuditItemResponse, AuditItemCreate, AuditItemUpdate
)
from app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[AuditResponse])
async def get_audits(
    auditor_id: Optional[int] = Query(None),
    reviewer_id: Optional[int] = Query(None),
    property_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Audit).options(
        joinedload(Audit.property),
        joinedload(Audit.auditor),
        joinedload(Audit.reviewer),
        joinedload(Audit.audit_items)
    )
    
    if auditor_id:
        query = query.filter(Audit.auditor_id == auditor_id)
    if reviewer_id:
        query = query.filter(Audit.reviewer_id == reviewer_id)
    if property_id:
        query = query.filter(Audit.property_id == property_id)
    if status:
        query = query.filter(Audit.status == status)
    
    audits = query.all()
    return audits

@router.get("/{audit_id}", response_model=AuditResponse)
async def get_audit(audit_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    audit = db.query(Audit).options(
        joinedload(Audit.property),
        joinedload(Audit.auditor),
        joinedload(Audit.reviewer),
        joinedload(Audit.audit_items)
    ).filter(Audit.id == audit_id).first()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit

@router.post("/", response_model=AuditResponse)
async def create_audit(audit: AuditCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_audit = Audit(**audit.dict())
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    return db_audit

@router.patch("/{audit_id}", response_model=AuditResponse)
async def update_audit(audit_id: int, audit_update: AuditUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    # Check permissions
    if current_user.role not in ["admin", "auditor", "reviewer"] and audit.auditor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = audit_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(audit, field, value)
    
    db.commit()
    db.refresh(audit)
    return audit

@router.get("/{audit_id}/items", response_model=List[AuditItemResponse])
async def get_audit_items(audit_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    items = db.query(AuditItem).filter(AuditItem.audit_id == audit_id).all()
    return items

@router.post("/{audit_id}/items", response_model=AuditItemResponse)
async def create_audit_item(audit_id: int, item: AuditItemCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Verify audit exists
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    item_data = item.dict()
    item_data["audit_id"] = audit_id
    db_item = AuditItem(**item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.patch("/items/{item_id}", response_model=AuditItemResponse)
async def update_audit_item(item_id: int, item_update: AuditItemUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    item = db.query(AuditItem).filter(AuditItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Audit item not found")
    
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

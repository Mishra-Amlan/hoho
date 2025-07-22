from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Property
from app.schemas.schemas import PropertyResponse, PropertyCreate
from app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[PropertyResponse])
async def get_properties(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    properties = db.query(Property).all()
    return properties

@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property

@router.post("/", response_model=PropertyResponse)
async def create_property(property: PropertyCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role not in ["admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_property = Property(**property.dict())
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

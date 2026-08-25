
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import AverageAgeStats, CountStats, TopCitiesStats
from app.services import user_service

router = APIRouter(prefix="/stats", tags=["Public Statistics"])


@router.get("/count", response_model=CountStats, summary="Total active users")
def total_users(db: Session = Depends(get_db)):
    return CountStats(total_users=user_service.count_active_users(db))


@router.get("/average-age", response_model=AverageAgeStats, summary="Average age of active users")
def average_age(db: Session = Depends(get_db)):
    return AverageAgeStats(average_age=user_service.average_age_active_users(db))


@router.get("/top-cities", response_model=TopCitiesStats, summary="Top 3 cities among active users")
def top_cities(db: Session = Depends(get_db)):
    return TopCitiesStats(cities=user_service.top_cities(db, limit=3))

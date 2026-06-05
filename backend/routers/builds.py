from fastapi import APIRouter
from typing import List
from schemas.builds import PokemonBuildCreate, PokemonBuildResponse, BuildSummary
from services.builds import BuildService

router = APIRouter()

@router.post("/", response_model=PokemonBuildResponse)
def create_build(build: PokemonBuildCreate):
    return BuildService.create_build(build.dict())

@router.get("/", response_model=dict)
def get_builds():
    data = BuildService.get_all_summaries()
    return {"status": "success", "data": data}

@router.get("/{build_id}", response_model=PokemonBuildResponse)
def get_build(build_id: str):
    return BuildService.get_build_by_id(build_id)

@router.put("/{build_id}", response_model=PokemonBuildResponse)
def update_build(build_id: str, build: PokemonBuildCreate):
    return BuildService.update_build(build_id, build.dict())

@router.delete("/{build_id}")
def delete_build(build_id: str):
    return BuildService.delete_build(build_id)

@router.post("/{build_id}/copy", response_model=PokemonBuildResponse)
def copy_build(build_id: str):
    return BuildService.copy_build(build_id)
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from pydantic import BaseModel, Field


class AnalysisBase(BaseModel):
    """Esquema base para todos los análisis"""
    repository_id: int
    status: str = "pending"


class AnalysisCreate(AnalysisBase):
    """Esquema para crear un análisis"""
    code_path: Optional[str] = None  # Si es None, analiza todo el repositorio


class AnalysisFileResult(BaseModel):
    """Esquema para los resultados de análisis de un archivo individual"""
    file_path: str
    issues_count: Optional[int] = 0
    error: Optional[str] = None
    result: Optional[Dict[str, Any]] = None


class AnalysisResult(BaseModel):
    """Esquema para los resultados de un análisis completo"""
    repository_id: int
    user_id: int
    status: str
    files_analyzed: Optional[int] = 0
    files_with_issues: Optional[int] = 0
    total_issues: Optional[int] = 0
    file_results: Optional[List[AnalysisFileResult]] = []
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AnalysisResponse(BaseModel):
    """Esquema para la respuesta de una petición de análisis"""
    id: str
    repository_id: int
    status: str
    files_analyzed: Optional[int] = None
    files_with_issues: Optional[int] = None
    total_issues: Optional[int] = None
    message: Optional[str] = None
    created_at: datetime


class AnalysisTaskStatus(BaseModel):
    """Esquema para el estado de una tarea de análisis"""
    task_id: str
    status: str
    repository_id: int
    message: Optional[str] = None


class AnalysisMetrics(BaseModel):
    """Esquema para métricas de código extraídas del análisis"""
    cyclomatic_complexity: Optional[Dict[str, Any]] = None
    maintainability_index: Optional[float] = None
    loc: Optional[int] = None
    lloc: Optional[int] = None
    comments_ratio: Optional[float] = None


class CodeSmell(BaseModel):
    """Esquema para un problema o smell detectado en el código"""
    type: str
    line: int
    message: str
    severity: str = "minor"  # minor, major, critical


class ASTAnalysisItem(BaseModel):
    """Esquema para un item de análisis AST (función, clase, etc)"""
    name: str
    line_start: int
    line_end: int
    complexity: Optional[int] = None
    type: str  # function, class, method, etc.
    parent: Optional[str] = None


class FileDetailedAnalysis(BaseModel):
    """Esquema para un análisis detallado de un archivo"""
    file_path: str
    metrics: AnalysisMetrics
    code_smells: List[CodeSmell]
    ast_items: List[ASTAnalysisItem]
    file_content: Optional[str] = None


class AnalysisStatistics(BaseModel):
    """Esquema para estadísticas agregadas de un repositorio"""
    repository_id: int
    total_analyses: int
    last_analysis_date: Optional[datetime] = None
    average_issues_per_file: Optional[float] = None
    most_common_issues: Optional[List[Dict[str, Any]]] = None
    trend: Optional[str] = None  # improving, worsening, stable
    health_score: Optional[int] = None  # 0-100


class AnalysisCompare(BaseModel):
    """Esquema para comparar dos análisis"""
    base_analysis_id: str
    compare_analysis_id: str
    files_changed: int
    issues_added: int
    issues_fixed: int
    overall_change: str  # improved, worsened, no-change
    file_changes: List[Dict[str, Any]]


class AnalysisSummary(BaseModel):
    """Esquema para un resumen de análisis (versión ligera para listados)"""
    id: str
    repository_id: int
    status: str
    files_analyzed: Optional[int] = None
    total_issues: Optional[int] = None
    created_at: datetime

    class Config:
        orm_mode = True


class AnalysisFilter(BaseModel):
    """Esquema para filtrar análisis en consultas"""
    repository_id: Optional[int] = None
    status: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_issues: Optional[int] = None
    max_issues: Optional[int] = None
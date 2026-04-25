class ContractGuardError(Exception):
    """Base application error."""


class ContractNotFoundError(ContractGuardError):
    """Raised when the target contract does not exist."""


class AnalysisServiceError(ContractGuardError):
    """Base class for analysis-related failures."""


class AnalysisConfigurationError(AnalysisServiceError):
    """Raised when required AI analysis configuration is missing."""


class AnalysisPipelineError(AnalysisServiceError):
    """Raised when the AI pipeline cannot produce a valid analysis."""


class AnalysisPersistenceError(AnalysisServiceError):
    """Raised when an analysis result cannot be persisted."""

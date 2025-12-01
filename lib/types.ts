// Tipos e interfaces para o Sistema EcoSalina

export interface Vessel {
  id: string
  name: string
  type: "tanker" | "cargo" | "container"
  imo: string
  length: number // metros
  beam: number // metros
  draft: number // metros
  lastCleaning: Date
  currentRoute: Route
  status: "operating" | "maintenance" | "docked"
}

export interface Route {
  origin: string
  destination: string
  departureDate: Date
  estimatedArrival: Date
  currentPosition: {
    lat: number
    lon: number
  }
}

export interface SensorData {
  vesselId: string
  timestamp: Date
  // Sensores de arrasto/pressão
  dragCoefficient: number // 0-1 (quanto maior, mais arrasto)
  hullPressure: number // Pascal
  // Dados operacionais
  speed: number // nós
  fuelConsumption: number // L/h
  waterTemperature: number // Celsius
  salinity: number // PSU (Practical Salinity Unit)
  // Dados calculados
  foulingLevel: number // 0-5 (escala de incrustação)
  dragIncrease: number // % aumento no arrasto
}

export interface BiofoulingPrediction {
  vesselId: string
  currentLevel: number // 0-5
  predictedLevels: {
    date: Date
    level: number
    confidence: number
  }[]
  optimalCleaningDate: Date
  estimatedSavings: {
    fuel: number // litros
    cost: number // BRL
    ghgReduction: number // toneladas CO2
  }
  riskLevel: "low" | "medium" | "high" | "critical"
}

export interface Alert {
  id: string
  vesselId: string
  type: "warning" | "critical" | "info"
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  priority: number
}

export interface CleaningRecord {
  id: string
  vesselId: string
  date: Date
  foulingLevelBefore: number
  duration: number // horas
  cost: number // BRL
  method: "dry-dock" | "underwater" | "robotic"
  location: string
}

export interface PerformanceMetrics {
  vesselId: string
  period: "daily" | "weekly" | "monthly"
  fuelSaved: number // litros
  costSaved: number // BRL
  ghgReduced: number // toneladas CO2
  cleaningsOptimized: number
  predictionAccuracy: number // %
}

export interface UnderwaterImage {
  id: string
  vesselId: string
  timestamp: Date
  imageUrl: string
  location: "bow" | "stern" | "port" | "starboard" | "keel"
  aiAnalysis: {
    foulingLevel: number // 0-5
    organismTypes: {
      barnacles: number // % cobertura
      algae: number // % cobertura
      mussels: number // % cobertura
      other: number // % cobertura
    }
    confidence: number // 0-1
    processingTime: number // ms
  }
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  context?: {
    vesselId?: string
    chartData?: any
    relatedAlerts?: string[]
  }
}

export interface RouteOptimization {
  vesselId: string
  currentRoute: Route
  optimizedRoute: Route
  biofoulingImpact: {
    current: {
      predictedLevel: number
      waterTemp: number
      salinity: number
      riskScore: number
    }
    optimized: {
      predictedLevel: number
      waterTemp: number
      salinity: number
      riskScore: number
    }
  }
  savings: {
    fuelReduction: number // litros
    costReduction: number // BRL
    timeImpact: number // horas (pode ser negativo)
  }
}

export interface ScenarioSimulation {
  id: string
  vesselId: string
  name: string
  parameters: {
    cleaningStrategy: "immediate" | "scheduled" | "optimal" | "delayed"
    cleaningDate?: Date
    routeChanges?: boolean
    speedAdjustment?: number // % change
  }
  results: {
    totalCost: number
    fuelConsumption: number
    ghgEmissions: number
    downtime: number // horas
    complianceRisk: number // 0-100
  }
}

export interface AutomatedReport {
  id: string
  type: "monthly" | "quarterly" | "annual" | "incident"
  generatedDate: Date
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalVessels: number
    totalCleanings: number
    fuelSaved: number
    costSaved: number
    ghgReduced: number
  }
  aiInsights: string[]
  recommendations: string[]
  pdfUrl?: string
}

export interface OperationalData {
  vesselId: string
  timestamp: Date
  // Dados operacionais principais
  speed: number // nós
  rpm: number // rotações por minuto
  torque: number // N⋅m
  gpsPosition: {
    lat: number
    lon: number
    heading: number // graus
  }
  fuelConsumption: number // L/h
  // Condições do mar
  seaConditions: {
    waveHeight: number // metros
    windSpeed: number // nós
    windDirection: number // graus
    currentSpeed: number // nós
    currentDirection: number // graus
  }
  // Condições ambientais
  environmentalConditions: {
    waterTemperature: number // Celsius
    salinity: number // PSU
    chlorophyll: number // mg/m³
    oxygenLevel: number // mg/L
  }
  // Dados operacionais
  operationalProfile: {
    loadStatus: "laden" | "ballast" | "empty"
    cargoType?: string
    draftForward: number // metros
    draftAft: number // metros
  }
}

export interface DigitalTwin {
  vesselId: string
  // Casco ideal (baseline)
  idealHull: {
    dragCoefficient: number
    expectedSpeed: number // nós para dado RPM
    expectedFuelConsumption: number // L/h
    powerCurve: PowerCurvePoint[]
  }
  // Casco real (atual)
  actualHull: {
    dragCoefficient: number
    actualSpeed: number
    actualFuelConsumption: number
    measuredPower: number // kW
  }
  // Índice de Bioincrustação (0-100%)
  biofoulingIndex: number
  // Degradação de performance
  performanceDegradation: {
    speedLoss: number // % perda de velocidade
    fuelIncrease: number // % aumento de combustível
    powerIncrease: number // % aumento de potência necessária
    efficiencyLoss: number // % perda de eficiência geral
  }
  lastCalibration: Date
}

export interface PowerCurvePoint {
  rpm: number
  expectedPower: number // kW
  expectedSpeed: number // nós
  expectedFuelRate: number // L/h
}

export interface ExtendedBiofoulingPrediction extends BiofoulingPrediction {
  // Previsões multi-período
  predictions: {
    days7: PredictionDetail
    days15: PredictionDetail
    days30: PredictionDetail
  }
  // Índice de bioincrustação (0-100%)
  biofoulingIndex: number
  biofoulingIndexTrend: "increasing" | "stable" | "decreasing"
  // Impacto energético detalhado
  energyImpact: {
    currentFuelIncrease: number // L/dia
    currentCostIncrease: number // BRL/dia
    currentEmissionsIncrease: number // kg CO₂/dia
    projectedFuelIncrease7d: number
    projectedFuelIncrease15d: number
    projectedFuelIncrease30d: number
  }
  // Conformidade NORMAM 401
  normam401Compliance: {
    status: "compliant" | "warning" | "non-compliant"
    daysUntilViolation: number | null
    maxAllowedFouling: number
    currentFouling: number
    inspectionDue: Date
  }
}

export interface PredictionDetail {
  date: Date
  biofoulingIndex: number
  foulingLevel: number // 0-5 escala
  confidence: number // %
  fuelImpact: number // L/dia adicional
  costImpact: number // BRL/dia adicional
  recommendedAction: string
}

export interface VirtualSensor {
  id: string
  vesselId: string
  type: "drag" | "fouling" | "efficiency" | "performance"
  name: string
  description: string
  // Cálculo baseado em dados reais
  calculatedFrom: string[] // IDs de sensores físicos usados
  value: number
  unit: string
  confidence: number // 0-1
  lastUpdate: Date
  algorithm: string
}

export interface NORMAM401Report {
  vesselId: string
  reportDate: Date
  inspectionType: "routine" | "pre-voyage" | "post-voyage" | "incident"
  inspector: string
  // Resultados da inspeção
  results: {
    biofoulingLevel: number // 0-5
    biofoulingIndex: number // 0-100%
    complianceStatus: "pass" | "conditional" | "fail"
    violationDetails?: string[]
    photosUrls: string[]
  }
  // Requerimentos de ação
  actionRequired: boolean
  actionDeadline?: Date
  recommendedActions: string[]
  // Penalidades (se aplicável)
  penalties?: {
    fineAmount: number // BRL
    reason: string
    dueDate: Date
  }
}

export interface MaintenancePrediction {
  vesselId: string
  nextMaintenanceDate: Date
  maintenanceType: "cleaning" | "inspection" | "repair" | "overhaul"
  predictedCost: number
  confidence: number
  criticalComponents: {
    component: string
    health: number // 0-100%
    timeToFailure: number // dias
    replacementCost: number
  }[]
  downtime: number // horas estimadas
  recommendedActions: string[]
}

export interface OperationalCost {
  vesselId: string
  period: {
    start: Date
    end: Date
  }
  breakdown: {
    fuel: number
    maintenance: number
    cleaning: number
    crew: number
    port: number
    insurance: number
    other: number
  }
  total: number
  comparisonVsPrevious: number // % change
  industryBenchmark: number // custo médio do setor
}

export interface FleetBenchmark {
  metric: string
  unit: string
  fleetAverage: number
  industryAverage: number
  topPerformer: {
    vesselId: string
    value: number
  }
  bottomPerformer: {
    vesselId: string
    value: number
  }
  ranking: {
    vesselId: string
    value: number
    rank: number
  }[]
}

export interface DigitalInspection {
  id: string
  vesselId: string
  inspectionDate: Date
  inspector: string
  type: "routine" | "pre-voyage" | "post-cleaning" | "incident"
  checklist: InspectionChecklistItem[]
  overallScore: number // 0-100%
  status: "approved" | "conditional" | "rejected"
  photos: {
    id: string
    url: string
    location: string
    timestamp: Date
    aiAnalysis?: {
      detectedIssues: string[]
      severity: "low" | "medium" | "high" | "critical"
    }
  }[]
  notes: string
  requiresFollowUp: boolean
  followUpDeadline?: Date
}

export interface InspectionChecklistItem {
  id: string
  category: "hull" | "propeller" | "rudder" | "intake" | "discharge"
  item: string
  status: "pass" | "fail" | "na"
  notes?: string
  photoRequired: boolean
  photoUrl?: string
}

export interface ExecutiveDashboard {
  period: {
    start: Date
    end: Date
  }
  kpis: {
    totalFleetValue: number
    operationalEfficiency: number // %
    fuelEfficiency: number // L/nm
    ghgIntensity: number // g CO2/ton-nm
    maintenanceCosts: number
    complianceRate: number // %
  }
  trends: {
    metric: string
    values: { date: Date; value: number }[]
    changePercent: number
  }[]
  topIssues: {
    issue: string
    severity: "low" | "medium" | "high" | "critical"
    vesselCount: number
    estimatedImpact: number
  }[]
  strategicRecommendations: string[]
}

export interface MaintenanceWorkflow {
  id: string
  vesselId: string
  type: "cleaning" | "repair" | "inspection" | "upgrade"
  requestedBy: string
  requestDate: Date
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "approved" | "scheduled" | "in-progress" | "completed" | "rejected"
  estimatedCost: number
  estimatedDuration: number // horas
  approvals: {
    role: string
    name: string
    decision: "approved" | "rejected" | "pending"
    date?: Date
    comments?: string
  }[]
  scheduledDate?: Date
  actualCost?: number
  actualDuration?: number
  completionNotes?: string
}

export interface ROIAnalysis {
  vesselId: string
  investmentType: "cleaning" | "coating" | "propeller-polish" | "hull-modification"
  investmentCost: number
  analysisDate: Date
  projectedSavings: {
    year1: number
    year2: number
    year3: number
    year5: number
  }
  breakEvenPoint: number // meses
  roi5Year: number // %
  npv: number // Net Present Value
  irr: number // Internal Rate of Return %
  assumptions: {
    fuelPrice: number
    utilizationRate: number // %
    discountRate: number // %
  }
}

export interface TrainingModule {
  id: string
  title: string
  category: "inspection" | "data-analysis" | "compliance" | "system-usage"
  duration: number // minutos
  level: "beginner" | "intermediate" | "advanced"
  description: string
  objectives: string[]
  completionRate: number // % de usuários que completaram
  averageScore: number // % média em avaliações
  contentUrl: string
  lastUpdated: Date
}

export interface UserProgress {
  userId: string
  completedModules: string[]
  certifications: {
    name: string
    issueDate: Date
    expiryDate?: Date
  }[]
  performanceMetrics: {
    inspectionsCompleted: number
    averageAccuracy: number // %
    timeInSystem: number // horas
  }
}

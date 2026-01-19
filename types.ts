export interface AnalysisScore {
  dimension: string;
  score: number; // 0-100
  reasoning: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface HotspotLinkage {
  currentHotspots: string[];
  linkageLogic: string;
  crossMarketAdvice: string;
}

export interface TrendPoint {
  time: string;
  price: number;
  macd?: number;
  signal?: number;
  hist?: number;
  k?: number;
  d?: number;
  j?: number;
}

export interface FuturesAnalysis {
  id: string;
  commodity: string;
  currentPrice: string;
  overallScore: number;
  advice: '强力买入' | '买入' | '观望' | '卖出' | '强力卖出';
  conclusionLogic: string; // 增强：解释评分与结论的核心逻辑
  scores: AnalysisScore[];
  fundamentalAnalysis: string;
  supplyDemandAnalysis: string;
  inventoryAnalysis: string;
  basisAnalysis: string;
  sentimentAnalysis: string;
  positionAnalysis: string;
  futurePrediction: string;
  hotspotLinkage: HotspotLinkage;
  technicalAnalysis: {
    waveAnalysis: string;
    macdAnalysis: string;
    trendData: TrendPoint[]; 
  };
  sources: GroundingSource[];
  timestamp: string;
}

export enum LoadingStatus {
  IDLE = 'idle',
  SEARCHING = 'searching',
  ANALYZING = 'analyzing',
  COMPLETED = 'completed',
  ERROR = 'error'
}
import { GoogleGenAI, Type } from "@google/genai";
import { FuturesAnalysis } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const testConnection = async (): Promise<{ success: boolean; message: string; latency?: number }> => {
  const start = Date.now();
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "ping",
    });
    if (response.text) {
      return { 
        success: true, 
        message: "连接成功", 
        latency: Date.now() - start 
      };
    }
    return { success: false, message: "收到空响应" };
  } catch (error: any) {
    return { success: false, message: error.message || "未知错误" };
  }
};

/**
 * Main analysis function with enhanced logical reasoning prompt.
 */
export const analyzeFutures = async (commodity: string): Promise<FuturesAnalysis> => {
  const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const ai = getAI();
  
  const prompt = `
    当前北京时间是: ${currentTime}。
    
    作为一名【资深期货首席分析师】，请针对期货品种 "${commodity}" 进行深度全方位研判。
    
    【核心逻辑要求】
    1. **增强内部逻辑一致性**：你的评分（overallScore）和建议（advice）必须有严密的推理支持。
    2. **解释评分逻辑**：在 "conclusionLogic" 中明确说明为什么给这个分数，以及分数是如何从宏观、产业、资金和技术四个维度加权得出的。
    3. **策略归纳**：为什么最终建议是这个（如“强力买入”或“观望”），核心驱动因素是什么。
    
    请严格以 JSON 格式返回：
    {
      "commodity": "品种名称",
      "currentPrice": "最新实时价格",
      "overallScore": 0-100,
      "advice": "强力买入/买入/观望/卖出/强力卖出",
      "conclusionLogic": "此处详细说明：综合评估了哪些核心变量？看多/看空的核心矛盾点在哪里？评分背后的逻辑权重是如何分配的？",
      "scores": [
        {"dimension": "宏观政策", "score": 0-100, "reasoning": "具体宏观变量及其影响"},
        {"dimension": "跨市联动", "score": 0-100, "reasoning": "外盘/相关品种的联动效应"},
        {"dimension": "产业供需", "score": 0-100, "reasoning": "产能、开工率、下游需求现状"},
        {"dimension": "资金情绪", "score": 0-100, "reasoning": "沉淀资金、持仓兴趣变化"},
        {"dimension": "技术形态", "score": 0-100, "reasoning": "关键位、趋势线、指标状态"}
      ],
      "hotspotLinkage": {
        "currentHotspots": ["热点A", "热点B"],
        "linkageLogic": "逻辑说明",
        "crossMarketAdvice": "操作建议"
      },
      "fundamentalAnalysis": "深度基本面分析",
      "basisAnalysis": "基差与升贴水逻辑",
      "supplyDemandAnalysis": "供需平衡分析",
      "inventoryAnalysis": "库存周期分析",
      "sentimentAnalysis": "市场博弈情绪",
      "positionAnalysis": "主力头寸分析",
      "futurePrediction": "跨周期预测及风险提示",
      "technicalAnalysis": {
        "waveAnalysis": "浪形结构说明",
        "macdAnalysis": "指标状态说明",
        "trendData": []
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    
    const sources: any[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const processedSources = sources
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    return {
      ...result,
      id: crypto.randomUUID(),
      timestamp: currentTime,
      sources: processedSources
    };
  } catch (error: any) {
    if (error.message?.includes('500') || error.message?.includes('Rpc failed')) {
      return analyzeFuturesFallback(commodity, currentTime);
    }
    throw new Error(error.message || "分析服务异常，请稍后再试。");
  }
};

async function analyzeFuturesFallback(commodity: string, currentTime: string): Promise<FuturesAnalysis> {
  const ai = getAI();
  const prompt = `深度分析期货品种 "${commodity}"。严格返回 JSON。需包含 conclusionLogic 解释评分逻辑。`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    },
  });

  const result = JSON.parse(response.text || "{}");
  return {
    ...result,
    id: crypto.randomUUID(),
    timestamp: currentTime,
    sources: []
  };
}

/**
 * 实时获取最新报价及简要动能状态
 */
export const updateRealtimeData = async (commodity: string): Promise<{ currentPrice: string, timestamp: string }> => {
  const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const ai = getAI();
  const prompt = `获取期货品种 "${commodity}" 的最新成交价格。只需返回当前价格字符串。当前时间: ${currentTime}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentPrice: { type: Type.STRING, description: "最新的市场报价" }
        },
        required: ["currentPrice"]
      }
    },
  });

  const result = JSON.parse(response.text || "{}");
  return {
    currentPrice: result.currentPrice,
    timestamp: currentTime
  };
};
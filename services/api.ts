import { GOOGLE_SCRIPT_URL } from '../constants';
import { SurveyResponse, DashboardData } from '../types';

export const fetchDashboardData = async (): Promise<DashboardData | null> => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const rawData = await response.json();
    
    // Parse and fix data
    // Expected rawData structure from GAS: { data: [ {Date, Name, Role, Score, Percentage, ...}, ... ] }
    // Or just an array depending on GAS implementation. Assuming array of objects.
    
    const entries: SurveyResponse[] = Array.isArray(rawData) ? rawData : rawData.data;

    if (!entries) return null;

    // Process data for dashboard
    let totalScore = 0;
    const roleStats: Record<string, { count: number; totalScore: number }> = {};
    
    // Reverse to get latest first for the list
    const processedEntries = entries.map((e: any) => {
        // Fix percentage if decimal (0.75 -> 75)
        let pct = parseFloat(e.Percentage);
        if (pct <= 1) pct = pct * 100;
        
        return {
            ...e,
            score: parseFloat(e.Score),
            percentage: pct
        } as SurveyResponse;
    });

    processedEntries.forEach(entry => {
        totalScore += entry.percentage;
        
        if (!roleStats[entry.role]) {
            roleStats[entry.role] = { count: 0, totalScore: 0 };
        }
        roleStats[entry.role].count += 1;
        roleStats[entry.role].totalScore += entry.percentage;
    });

    const participants = processedEntries.length;
    const averageScore = participants > 0 ? totalScore / participants : 0;

    const roleDistribution = Object.keys(roleStats).map(role => ({
        name: role,
        value: roleStats[role].count
    }));

    const roleScores = Object.keys(roleStats).map(role => ({
        name: role,
        score: Math.round(roleStats[role].totalScore / roleStats[role].count)
    }));

    // Sort roleScores by score desc
    roleScores.sort((a, b) => b.score - a.score);

    return {
        participants,
        averageScore,
        roleDistribution,
        roleScores,
        recentEntries: processedEntries.slice(-10).reverse() // Last 10, newest first
    };

  } catch (error) {
    console.error("Failed to fetch dashboard data", error);
    return null;
  }
};

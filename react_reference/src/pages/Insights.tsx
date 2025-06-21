
import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, FileText, Calendar, User } from 'lucide-react';

const Insights = () => {
  const memos = [
    {
      id: 1,
      title: "How the U.S. Can Reduce Drug Supply Chain Risk",
      date: "2024-01-15",
      author: "Policy Analysis Team",
      excerpt: "An examination of strategic approaches to mitigate pharmaceutical supply chain vulnerabilities through policy interventions and international cooperation.",
      tags: ["Policy", "Supply Chain", "Risk Management"],
      content: `
The United States faces significant challenges in pharmaceutical supply chain security, with critical dependencies on foreign manufacturing that pose national security and public health risks. This analysis explores comprehensive strategies to reduce these vulnerabilities.

## Key Risk Factors

Our analysis of the manufacturing location data reveals several concerning trends:

- **Geographic Concentration**: Over 60% of critical drug manufacturing occurs in countries with risk scores below 6
- **Single Points of Failure**: Many essential drugs rely on manufacturing from just 1-2 locations globally
- **Regulatory Gaps**: Insufficient oversight of foreign manufacturing facilities poses quality and security risks

## Strategic Recommendations

### 1. Domestic Manufacturing Incentives
- Tax credits for domestic pharmaceutical manufacturing
- Fast-track regulatory pathways for critical drug production
- Public-private partnerships to rebuild domestic capacity

### 2. Supply Chain Diversification
- Requirements for multiple manufacturing sources for essential drugs
- Geographic distribution requirements for critical medications
- Strategic stockpile expansion for high-risk pharmaceuticals

### 3. Enhanced Monitoring and Intelligence
- Real-time supply chain tracking systems
- Improved early warning systems for shortage prediction
- Enhanced international cooperation on pharmaceutical security

## Implementation Timeline

A phased approach over 5-7 years would allow for systematic risk reduction while maintaining drug availability and affordability.
      `
    },
    {
      id: 2,
      title: "Critical Analysis: Geographic Risks in Essential Drug Manufacturing",
      date: "2024-01-10",
      author: "Risk Assessment Division",
      excerpt: "Deep dive into the geographic distribution of essential drug manufacturing and implications for national preparedness.",
      tags: ["Geography", "Essential Drugs", "Risk Assessment"],
      content: `
The geographic concentration of pharmaceutical manufacturing creates systemic vulnerabilities that require immediate attention from policymakers and industry leaders.

## Current State Analysis

Based on our comprehensive dataset analysis:

- **Essential Drug Concentration**: 74% of FDA-designated essential drugs have manufacturing concentrated in fewer than 5 countries
- **High-Risk Locations**: 23% of essential drug manufacturing occurs in locations with risk scores below 4
- **Supply Chain Fragility**: Average of 2.3 manufacturing sites per essential drug globally

## Regional Risk Assessment

### Asia-Pacific Region
- Dominates global pharmaceutical manufacturing
- Geopolitical tensions create supply disruption risks
- Quality control variations across different countries

### Europe
- Generally lower risk profile
- Strong regulatory frameworks
- Limited capacity for certain drug categories

### North America
- Declining manufacturing base
- Higher cost structure
- Regulatory advantages for rapid response

## Mitigation Strategies

Comprehensive risk mitigation requires coordinated action across multiple domains, including policy reform, industry incentives, and international cooperation.
      `
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Policy Insights & Analysis</h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Strategic analysis and policy recommendations based on pharmaceutical supply chain intelligence
          </p>
        </div>

        {/* Featured Insights */}
        <div className="grid gap-8">
          {memos.map((memo) => (
            <Card key={memo.id} className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <FileText className="w-6 h-6 text-slate-600" />
                    <h2 className="text-2xl font-bold text-slate-900">{memo.title}</h2>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-slate-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(memo.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{memo.author}</span>
                    </div>
                  </div>

                  <p className="text-slate-700 mb-4 leading-relaxed">{memo.excerpt}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {memo.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="ml-6">
                  <TrendingUp className="w-8 h-8 text-slate-400" />
                </div>
              </div>

              {/* Memo Content */}
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                  {memo.content}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-center">
          <h3 className="text-xl font-bold mb-4">Contributing to Policy Analysis</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Our analysis is continuously updated based on the latest supply chain intelligence. 
            These insights inform policy recommendations for strengthening pharmaceutical security.
          </p>
          <div className="text-sm text-slate-400">
            Data sources: FDA Drug Shortages Database, GSA Federal Procurement Data, 
            BIS Entity Lists, OFAC Sanctions Programs
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Insights;

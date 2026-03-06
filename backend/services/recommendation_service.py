# -*- coding: utf-8 -*-
"""
Recommendation Service - Behavioral Insights & Recommendations

This module generates actionable recommendations based on 
segmentation, affinity, and sentiment analysis.

Example usage:
    from services.recommendation_service import RecommendationService
    
    service = RecommendationService()
    recommendations = service.generate_recommendations(
        segments, affinity_rules, sentiment_data, bundles
    )
"""

from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)


class RecommendationService:
    """Generate behavioral recommendations"""
    
    def __init__(self):
        """Initialize recommendation service"""
        pass
    
    def generate_recommendations(
        self,
        segments: List[Dict[str, Any]],
        affinity_rules: List[Dict[str, Any]],
        sentiment_data: Dict[str, Any],
        bundles: List[Dict[str, Any]],
        personas: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate comprehensive recommendations
        
        Args:
            segments: Customer segment summaries
            affinity_rules: Product affinity rules
            sentiment_data: Sentiment analysis results
            bundles: Suggested product bundles
            personas: Optional persona data
            
        Returns:
            List of recommendation dictionaries
        """
        logger.info("Generating behavioral recommendations")
        
        recommendations = []
        
        # Generate merchandising recommendations
        recommendations.extend(
            self._generate_merchandising_recommendations(
                affinity_rules, bundles
            )
        )
        
        # Generate marketing recommendations
        recommendations.extend(
            self._generate_marketing_recommendations(segments, personas)
        )
        
        # Generate sentiment-based recommendations
        recommendations.extend(
            self._generate_sentiment_recommendations(sentiment_data)
        )
        
        # Generate product recommendations
        recommendations.extend(
            self._generate_product_recommendations(affinity_rules)
        )
        
        # Sort by priority
        priority_order = {'High': 0, 'Medium': 1, 'Low': 2}
        recommendations.sort(
            key=lambda x: priority_order.get(x['priority'], 2)
        )
        
        # Add ranking
        for i, rec in enumerate(recommendations, 1):
            rec['rank'] = i
        
        logger.info(f"Generated {len(recommendations)} recommendations")
        return recommendations
    
    def _generate_merchandising_recommendations(
        self,
        affinity_rules: List[Dict[str, Any]],
        bundles: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate merchandising recommendations"""
        recommendations = []
        
        # Bundle recommendations
        if bundles and len(bundles) > 0:
            top_bundle = bundles[0]
            recommendations.append({
                'id': 'MERCH-001',
                'category': 'Merchandising',
                'title': f"Create Product Bundle: {top_bundle['bundle_name']}",
                'description': (
                    f"These products have a strong affinity (lift: "
                    f"{top_bundle['affinity_score']:.2f}x). "
                    f"Bundling them could increase average order value by "
                    f"{top_bundle['estimated_lift']}."
                ),
                'expected_impact': f"10-{top_bundle['estimated_lift']} increase in AOV",
                'priority': 'High',
                'timeline': 'Immediate',
                'data_support': {
                    'affinity_score': top_bundle['affinity_score'],
                    'confidence': top_bundle.get('confidence', 0),
                    'estimated_lift': top_bundle['estimated_lift']
                },
                'implementation_steps': [
                    f"Create bundle listing for {top_bundle['bundle_name']}",
                    "Set bundle price (5-10% discount vs individual)",
                    "Feature on homepage and product pages",
                    "Monitor conversion rate and AOV impact"
                ]
            })
        
        # Cross-sell recommendations
        if affinity_rules and len(affinity_rules) > 0:
            top_rule = affinity_rules[0]
            antecedent = top_rule.get('antecedents', 'Product A')
            consequent = top_rule.get('consequents', 'Product B')
            
            if isinstance(antecedent, frozenset):
                antecedent = ', '.join(antecedent)
            if isinstance(consequent, frozenset):
                consequent = ', '.join(consequent)
            
            recommendations.append({
                'id': 'MERCH-002',
                'category': 'Merchandising',
                'title': f"Add Cross-sell: {antecedent} → {consequent}",
                'description': (
                    f"Customers who buy {antecedent} often "
                    f"purchase {consequent} (confidence: "
                    f"{top_rule.get('confidence', 0)*100:.1f}%)."
                ),
                'expected_impact': '5-15% increase in cross-sell conversion',
                'priority': 'Medium',
                'timeline': '30 days',
                'data_support': {
                    'confidence': top_rule.get('confidence', 0),
                    'lift': top_rule.get('lift', 0),
                    'support': top_rule.get('support', 0)
                },
                'implementation_steps': [
                    "Add 'Frequently Bought Together' widget",
                    "Configure cross-sell on product pages",
                    "A/B test placement and messaging"
                ]
            })
        
        return recommendations
    
    def _generate_marketing_recommendations(
        self,
        segments: List[Dict[str, Any]],
        personas: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """Generate marketing recommendations"""
        recommendations = []
        
        # Find Champions segment
        champions = next(
            (s for s in segments if s['segment_name'] == 'Champions'), 
            None
        )
        
        if champions:
            recommendations.append({
                'id': 'MKT-001',
                'category': 'Marketing',
                'title': 'Launch VIP Loyalty Program for Champions',
                'description': (
                    f"Your Champions segment ({champions['customer_count']} "
                    f"customers, ${champions['total_revenue']:,.2f} revenue) "
                    "represents your most valuable customers. Implement a VIP "
                    "program to retain and reward them."
                ),
                'expected_impact': '15-25% increase in retention',
                'priority': 'High',
                'timeline': '30 days',
                'data_support': {
                    'segment_name': 'Champions',
                    'customer_count': champions['customer_count'],
                    'total_revenue': champions['total_revenue']
                },
                'implementation_steps': [
                    'Define VIP tiers and benefits',
                    'Create exclusive offers for Champions',
                    'Send personalized invitations',
                    'Track engagement and redemption rates'
                ]
            })
        
        # Find At Risk segment
        at_risk = next(
            (s for s in segments if s['segment_name'] == 'At Risk'), 
            None
        )
        
        if at_risk:
            recommendations.append({
                'id': 'MKT-002',
                'category': 'Marketing',
                'title': 'Win-Back Campaign for At-Risk Customers',
                'description': (
                    f"{at_risk['customer_count']} customers are at risk of "
                    f"churning. Launch a targeted win-back campaign with "
                    "special offers."
                ),
                'expected_impact': '20-40% reactivation rate',
                'priority': 'High',
                'timeline': 'Immediate',
                'data_support': {
                    'segment_name': 'At Risk',
                    'customer_count': at_risk['customer_count'],
                    'total_revenue': at_risk.get('total_revenue', 0)
                },
                'implementation_steps': [
                    'Segment at-risk customers',
                    'Create compelling win-back offer',
                    'Design email sequence (3-5 emails)',
                    'Monitor reactivation and adjust messaging'
                ]
            })
        
        # Find Value Seekers segment
        value_seekers = next(
            (s for s in segments if s['segment_name'] == 'Value Seekers'), 
            None
        )
        
        if value_seekers:
            recommendations.append({
                'id': 'MKT-003',
                'category': 'Marketing',
                'title': 'Promotional Campaign for Value Seekers',
                'description': (
                    f"{value_seekers['customer_count']} value-conscious customers "
                    "respond well to discounts and promotions. "
                    "Create targeted promotional campaigns."
                ),
                'expected_impact': '10-20% increase in conversion',
                'priority': 'Medium',
                'timeline': '30 days',
                'data_support': {
                    'segment_name': 'Value Seekers',
                    'customer_count': value_seekers['customer_count']
                },
                'implementation_steps': [
                    'Create discount codes',
                    'Send promotional emails',
                    'Highlight sale items',
                    'Use urgency tactics (limited time)'
                ]
            })
        
        return recommendations
    
    def _generate_sentiment_recommendations(
        self,
        sentiment_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate sentiment-based recommendations"""
        recommendations = []
        
        # Check for low sentiment categories
        if 'by_category' in sentiment_data and sentiment_data['by_category']:
            low_sentiment = [
                c for c in sentiment_data['by_category']
                if c.get('sentiment_score', 100) < 70
            ]
            
            if low_sentiment:
                worst = low_sentiment[0]
                recommendations.append({
                    'id': 'SEN-001',
                    'category': 'Product',
                    'title': f"Address Issues in {worst.get('category', 'Category')}",
                    'description': (
                        f"{worst.get('category', 'Category')} has low sentiment "
                        f"({worst.get('sentiment_score', 0):.1f}/100). "
                        "Investigate product quality or customer concerns."
                    ),
                    'expected_impact': 'Improved customer satisfaction',
                    'priority': 'High',
                    'timeline': 'Immediate',
                    'data_support': {
                        'category': worst.get('category'),
                        'sentiment_score': worst.get('sentiment_score'),
                        'avg_rating': worst.get('avg_rating')
                    },
                    'implementation_steps': [
                        f"Review {worst.get('category')} product quality",
                        "Analyze customer feedback and reviews",
                        "Identify common complaints",
                        "Implement improvements or replacements"
                    ]
                })
        
        # Check overall sentiment
        overall_score = sentiment_data.get('overall_score', 0)
        if overall_score < 60:
            recommendations.append({
                'id': 'SEN-002',
                'category': 'Customer Experience',
                'title': 'Improve Overall Customer Satisfaction',
                'description': (
                    f"Overall sentiment score is {overall_score:.1f}/100, "
                    "which is below target. Implement customer experience improvements."
                ),
                'expected_impact': '10-20 point sentiment improvement',
                'priority': 'High',
                'timeline': '60 days',
                'data_support': {
                    'overall_score': overall_score,
                    'negative_percentage': sentiment_data.get('percentages', {}).get('negative', 0)
                },
                'implementation_steps': [
                    'Survey customers for feedback',
                    'Identify pain points in customer journey',
                    'Train customer service team',
                    'Implement feedback loop'
                ]
            })
        
        return recommendations
    
    def _generate_product_recommendations(
        self,
        affinity_rules: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate product-related recommendations"""
        recommendations = []
        
        if not affinity_rules:
            return recommendations
        
        # Find products with high lift but low support (opportunity)
        opportunity_rules = [
            r for r in affinity_rules
            if r.get('lift', 0) > 2.0 and r.get('support', 0) < 0.1
        ]
        
        if opportunity_rules:
            top_opp = opportunity_rules[0]
            antecedent = top_opp.get('antecedents', 'Product A')
            consequent = top_opp.get('consequents', 'Product B')
            
            if isinstance(antecedent, frozenset):
                antecedent = ', '.join(antecedent)
            if isinstance(consequent, frozenset):
                consequent = ', '.join(consequent)
            
            recommendations.append({
                'id': 'PROD-001',
                'category': 'Product',
                'title': f"Expand Product Line: {antecedent}",
                'description': (
                    f"Strong affinity ({top_opp.get('lift', 0):.1f}x lift) between "
                    f"{antecedent} and {consequent} suggests market opportunity. "
                    "Consider expanding product variants or related items."
                ),
                'expected_impact': '5-15% revenue growth',
                'priority': 'Medium',
                'timeline': '90 days',
                'data_support': {
                    'lift': top_opp.get('lift', 0),
                    'products': [antecedent, consequent]
                },
                'implementation_steps': [
                    'Research product expansion opportunities',
                    'Survey customers for desired features',
                    'Test new product variants',
                    'Monitor sales performance'
                ]
            })
        
        return recommendations
    
    def get_recommendation_summary(
        self,
        recommendations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Get summary of recommendations
        
        Args:
            recommendations: List of recommendations
            
        Returns:
            Summary dictionary
        """
        summary = {
            'total': len(recommendations),
            'high_priority': len([r for r in recommendations if r['priority'] == 'High']),
            'medium_priority': len([r for r in recommendations if r['priority'] == 'Medium']),
            'low_priority': len([r for r in recommendations if r['priority'] == 'Low']),
            'by_category': {},
            'by_timeline': {}
        }
        
        # Group by category
        for rec in recommendations:
            category = rec['category']
            if category not in summary['by_category']:
                summary['by_category'][category] = 0
            summary['by_category'][category] += 1
        
        # Group by timeline
        for rec in recommendations:
            timeline = rec['timeline']
            if timeline not in summary['by_timeline']:
                summary['by_timeline'][timeline] = 0
            summary['by_timeline'][timeline] += 1
        
        return summary


# Convenience function
def generate_behavioral_recommendations(
    segments: List[Dict[str, Any]],
    affinity_rules: List[Dict[str, Any]],
    sentiment_data: Dict[str, Any],
    bundles: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Quick recommendation generation function
    
    Args:
        segments: Customer segment summaries
        affinity_rules: Product affinity rules
        sentiment_data: Sentiment analysis results
        bundles: Suggested product bundles
        
    Returns:
        List of recommendation dictionaries
    """
    service = RecommendationService()
    return service.generate_recommendations(
        segments, affinity_rules, sentiment_data, bundles
    )
